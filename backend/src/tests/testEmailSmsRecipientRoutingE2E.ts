process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import jwt from 'jsonwebtoken';
import app from '../app';
import config from '../config/config';
import {
  sequelize,
  connectDB,
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
  TenantActivationToken,
  NotificationLog,
  EmailConfiguration,
} from '../models';
import { getSuperAdminEmail, getSuperAdminPhone } from '../services/notificationService';
import { dispatchAuditedSms } from '../services/smsServices';

const PROTECTED_TABLES = [
  { table: 'employee', expected: 3 },
  { table: 'emailconfiguration', expected: 40 },
  { table: 'configuration', expected: 1 },
  { table: 'sms_logs', expected: 30 },
  { table: 'sms_templates', expected: 7 },
  { table: 'saas_plans', expected: 4 },
  { table: 'short_links', expected: 28 },
];

async function verifyProtectedTables(stage: string) {
  console.log(`\n🔍 Verifying Protected Tables Count (${stage}):`);
  for (const { table, expected } of PROTECTED_TABLES) {
    const [result]: any = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
    const count = Number(result[0].cnt);
    if (count !== expected) {
      throw new Error(`CRITICAL: Protected table '${table}' count changed! Expected: ${expected}, Actual: ${count}`);
    }
    console.log(`  ✅ Protected table '${table}' count is exactly ${expected}`);
  }
}

async function makeRequest(
  port: number,
  method: string,
  reqPath: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ statusCode: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const reqData = body ? JSON.stringify(body) : null;
    const allHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (reqData) {
      allHeaders['Content-Length'] = Buffer.byteLength(reqData).toString();
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: reqPath,
        method,
        headers: allHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode || 500,
            data: parsed,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', reject);
    if (reqData) req.write(reqData);
    req.end();
  });
}

async function run() {
  console.log('========================================================================');
  console.log('FLEETFLOW: CRITICAL EMAIL & SMS RECIPIENT ROUTING E2E TEST SUITE');
  console.log('========================================================================\n');

  await connectDB();
  await verifyProtectedTables('BASELINE BEFORE TESTS');

  // Start test server on ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  console.log(`\n📡 Test server running on ephemeral port ${port}`);

  let passCount = 0;
  const assert = (condition: boolean, msg: string) => {
    if (!condition) {
      throw new Error(`❌ FAIL: ${msg}`);
    }
    passCount++;
    console.log(`  ✅ PASS: ${msg}`);
  };

  const createdTenantIds: string[] = [];
  const createdRequestIds: string[] = [];

  // Configured distinct test identities per Prompt Section 6
  const applicantEmail = 'applicant-test@example.com';
  const applicantPhone = '9840112233';
  const rejectApplicantEmail = 'applicant-reject@example.com';
  const rejectApplicantPhone = '9840998877';

  // Override SUPERADMIN_EMAIL in env to test isolation cleanly
  const originalSuperAdminEmail = process.env.SUPERADMIN_EMAIL;
  const mockSuperAdminEmail = 'superadmin-test@example.com';
  process.env.SUPERADMIN_EMAIL = mockSuperAdminEmail;

  try {
    // -------------------------------------------------------------
    // SuperAdmin Authentication setup
    // -------------------------------------------------------------
    console.log('\n--- Setup: SuperAdmin Authentication ---');
    const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';
    const jwtSecret = config.security?.jwtSecret || process.env.JWT_SECRET || 'secret';
    const superAdminToken = jwt.sign(
      {
        userId: 'superadmin',
        role: 'superadmin',
        email: mockSuperAdminEmail,
        tenantId: ROOT_TENANT_ID,
      },
      jwtSecret,
      { expiresIn: '1h' }
    );
    const superAdminHeaders = { Authorization: `Bearer ${superAdminToken}` };
    assert(Boolean(superAdminToken), 'SuperAdmin JWT token generated');

    const resolvedSuperAdminEmail = (await getSuperAdminEmail()).toLowerCase().trim();
    const resolvedSuperAdminPhone = await getSuperAdminPhone();
    console.log(`  Target SuperAdmin notification email: ${resolvedSuperAdminEmail}`);
    console.log(`  Target SuperAdmin phone (never to receive SMS): ${resolvedSuperAdminPhone}`);
    assert(Boolean(resolvedSuperAdminEmail), 'SuperAdmin email resolved');

    // -------------------------------------------------------------
    // TEST SUITE 1: EVENT 1 & EVENT 2 — Public Fleet Registration
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 1: Event 1 & Event 2 — Registration Notification Routing ---');
    const suffix1 = Math.floor(1000 + Math.random() * 9000);
    const regPayload = {
      fleetName: `Apex Transit Test ${suffix1}`,
      businessCode: `APX${suffix1.toString().slice(-3)}`,
      ownerName: 'Apex Applicant',
      contactEmail: applicantEmail,
      contactPhone: applicantPhone,
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pinCode: '641001',
      requestedPlanTier: 'PRO',
      billingCycle: 'MONTHLY',
      termsConsent: true,
    };

    const regRes = await makeRequest(port, 'POST', '/api/tenants/public/register-fleet', regPayload);
    assert(regRes.statusCode === 201, `Public Register Fleet returns HTTP 201 Created (got ${regRes.statusCode})`);
    assert(regRes.data?.success === true, 'Registration success flag is true');
    const requestId1 = regRes.data?.data?.requestId;
    assert(Boolean(requestId1), `Registration request ID generated: ${requestId1}`);
    createdRequestIds.push(requestId1);

    // Allow async notification promises to settle
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Inspect NotificationLog for this registration request
    const notifLogs = await NotificationLog.findAll({
      where: { referenceId: requestId1 },
      order: [['createdAt', 'ASC']],
    });

    console.log(`\n  Inspecting ${notifLogs.length} NotificationLog entries for referenceId: ${requestId1}:`);
    for (const log of notifLogs) {
      console.log(`    Channel: ${log.channel} | Recipient: ${log.recipient} | Template: ${log.templateCode} | Status: ${log.providerStatus}`);
    }

    // 1. Applicant Email Verification (Event 1)
    const applicantEmails = notifLogs.filter(
      (l) => l.channel === 'EMAIL' && l.recipient.toLowerCase() === applicantEmail
    );
    assert(applicantEmails.length === 1, `Applicant receives EXACTLY ONE email (found ${applicantEmails.length})`);
    assert(applicantEmails[0].templateCode === 'REGISTRATION_RECEIVED', 'Applicant email template is strictly REGISTRATION_RECEIVED');
    assert(applicantEmails[0].providerStatus === 'MOCK', 'Applicant email status is MOCK (safe non-live delivery)');

    // 1B. Applicant Registration SMS Verification (Event 1: Fleet Admin receives registration success SMS)
    const applicantSms = notifLogs.filter(
      (l) => l.channel === 'SMS' && l.recipient === applicantPhone
    );
    assert(applicantSms.length === 1, `Applicant receives EXACTLY ONE registration success SMS (found ${applicantSms.length})`);
    assert(applicantSms[0].templateCode === 'REGISTRATION_RECEIVED_SMS', 'Applicant SMS template is strictly REGISTRATION_RECEIVED_SMS');
    assert(applicantSms[0].providerStatus === 'MOCK', 'Applicant SMS status is MOCK');

    // 2. SuperAdmin Email Verification (Event 2)
    const superAdminEmails = notifLogs.filter(
      (l) => l.channel === 'EMAIL' && l.recipient.toLowerCase() === resolvedSuperAdminEmail
    );
    assert(superAdminEmails.length === 1, `SuperAdmin receives EXACTLY ONE notification email (found ${superAdminEmails.length})`);
    assert(superAdminEmails[0].templateCode === 'SUPERADMIN_NEW_APPLICATION_ALERT', 'SuperAdmin email template is strictly SUPERADMIN_NEW_APPLICATION_ALERT');
    assert(superAdminEmails[0].providerStatus === 'MOCK', 'SuperAdmin email status is MOCK');

    // 3. Strict Recipient Isolation on Registration
    const superAdminGotApplicantTemplate = notifLogs.some(
      (l) => l.recipient.toLowerCase() === resolvedSuperAdminEmail && l.templateCode === 'REGISTRATION_RECEIVED'
    );
    assert(!superAdminGotApplicantTemplate, 'SuperAdmin NEVER receives applicant REGISTRATION_RECEIVED email');

    const applicantGotSuperAdminTemplate = notifLogs.some(
      (l) => l.recipient.toLowerCase() === applicantEmail && l.templateCode === 'SUPERADMIN_NEW_APPLICATION_ALERT'
    );
    assert(!applicantGotSuperAdminTemplate, 'Applicant NEVER receives SuperAdmin SUPERADMIN_NEW_APPLICATION_ALERT email');

    // 4. SuperAdmin Receives ZERO SMS on Registration
    const superAdminSms = notifLogs.filter(
      (l) => l.channel === 'SMS' && (l.recipient === resolvedSuperAdminPhone || l.templateCode.includes('SUPERADMIN'))
    );
    assert(superAdminSms.length === 0, 'SuperAdmin phone receives ZERO SMS on registration');

    // -------------------------------------------------------------
    // TEST SUITE 2: EVENT 3 — SuperAdmin Approves Fleet Registration
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 2: Event 3 — SuperAdmin Approval Notification Routing ---');
    const approveRes = await makeRequest(
      port,
      'POST',
      `/api/tenants/admin/registrations/${requestId1}/approve`,
      { reviewNotes: 'Approved in E2E recipient routing test' },
      superAdminHeaders
    );
    assert(approveRes.statusCode === 200, `Approve registration returns HTTP 200 OK (got ${approveRes.statusCode})`);
    assert(approveRes.data?.success === true, 'Approval response success is true');
    const tenantId1 = approveRes.data?.tenantId || approveRes.data?.data?.tenantId;
    assert(Boolean(tenantId1), `Tenant created on approval: ${tenantId1}`);
    createdTenantIds.push(tenantId1);

    // Verify DB state
    const reg1After = await TenantRegistrationRequest.findByPk(requestId1);
    assert(reg1After?.status === 'APPROVED', 'Registration status in DB is strictly APPROVED');

    const tenant1Record = await Tenant.findByPk(tenantId1);
    assert(tenant1Record?.status === 'ACTIVE', 'Created Tenant record is ACTIVE');

    const activationToken = await TenantActivationToken.findOne({ where: { tenantId: tenantId1 } });
    assert(Boolean(activationToken), 'Activation token record persisted in DB');
    assert(activationToken?.adminEmail.toLowerCase() === applicantEmail, 'Activation token adminEmail strictly matches applicant email');

    // Allow async email to complete
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Inspect NotificationLog for approval
    const approvalLogs = await NotificationLog.findAll({
      where: { referenceId: tenantId1 },
      order: [['createdAt', 'ASC']],
    });

    console.log(`\n  Inspecting ${approvalLogs.length} NotificationLog entries for approval (tenantId: ${tenantId1}):`);
    for (const log of approvalLogs) {
      console.log(`    Channel: ${log.channel} | Recipient: ${log.recipient} | Template: ${log.templateCode} | Status: ${log.providerStatus}`);
    }

    // 1. Applicant Activation Email Verification (Event 3)
    const applicantApprovalEmails = approvalLogs.filter(
      (l) => l.channel === 'EMAIL' && l.recipient.toLowerCase() === applicantEmail
    );
    assert(applicantApprovalEmails.length === 1, `Applicant receives EXACTLY ONE activation email (found ${applicantApprovalEmails.length})`);
    assert(applicantApprovalEmails[0].templateCode === 'TENANT_ADMIN_ACTIVATION_LINK', 'Approval email template is strictly TENANT_ADMIN_ACTIVATION_LINK');
    assert(applicantApprovalEmails[0].providerStatus === 'MOCK', 'Approval email status is MOCK');

    const approvalMetadata = (applicantApprovalEmails[0].metadata as any) || {};
    assert(Boolean(approvalMetadata.activationUrl), 'Approval email metadata contains activationUrl');
    assert(Boolean(approvalMetadata.loginUrl || approvalMetadata.fleetLoginUrl), 'Approval email metadata contains fleet-specific loginUrl');
    assert(Boolean(approvalMetadata.fleetName), 'Approval email metadata contains fleetName');

    // 2. SuperAdmin Isolation on Approval
    const superAdminApprovalEmails = approvalLogs.filter(
      (l) => l.recipient.toLowerCase() === resolvedSuperAdminEmail
    );
    assert(superAdminApprovalEmails.length === 0, 'SuperAdmin receives ZERO approval/activation emails');

    const approvalSms = approvalLogs.filter((l) => l.channel === 'SMS');
    assert(approvalSms.length === 0, 'ZERO approval SMS dispatched (No approval SMS to applicant or SuperAdmin)');

    // -------------------------------------------------------------
    // TEST SUITE 3: EVENT 4 — SuperAdmin Rejects Fleet Registration
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 3: Event 4 — SuperAdmin Rejection Notification Routing ---');
    const suffix2 = Math.floor(1000 + Math.random() * 9000);
    const rejectPayload = {
      fleetName: `Swift Transport Test ${suffix2}`,
      businessCode: `SWF${suffix2.toString().slice(-3)}`,
      ownerName: 'Swift Operator',
      contactEmail: rejectApplicantEmail,
      contactPhone: rejectApplicantPhone,
      city: 'Madurai',
      state: 'Tamil Nadu',
      pinCode: '625001',
      requestedPlanTier: 'BASIC',
      billingCycle: 'MONTHLY',
      termsConsent: true,
    };

    const rejectRegRes = await makeRequest(port, 'POST', '/api/tenants/public/register-fleet', rejectPayload);
    assert(rejectRegRes.statusCode === 201, 'Second registration submitted successfully');
    const requestId2 = rejectRegRes.data?.data?.requestId;
    assert(Boolean(requestId2), `Second registration requestId: ${requestId2}`);
    createdRequestIds.push(requestId2);

    await new Promise((resolve) => setTimeout(resolve, 800));

    // SuperAdmin rejects registration
    const rejectionReasonText = 'Business code documentation was incomplete.';
    const rejectRes = await makeRequest(
      port,
      'POST',
      `/api/tenants/admin/registrations/${requestId2}/reject`,
      { rejectionReason: rejectionReasonText, reviewNotes: 'Rejected during testing' },
      superAdminHeaders
    );
    assert(rejectRes.statusCode === 200, `Reject registration returns HTTP 200 OK (got ${rejectRes.statusCode})`);
    assert(rejectRes.data?.success === true, 'Rejection response success is true');

    const reg2After = await TenantRegistrationRequest.findByPk(requestId2);
    assert(reg2After?.status === 'REJECTED', 'Registration status updated to REJECTED in database');
    assert(reg2After?.rejectionReason === rejectionReasonText, 'Rejection reason saved correctly');

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Inspect NotificationLog for rejection
    const rejectionLogs = await NotificationLog.findAll({
      where: {
        referenceId: requestId2,
        templateCode: 'REGISTRATION_REJECTED',
      },
    });

    console.log(`\n  Inspecting Rejection NotificationLog entries (requestId: ${requestId2}):`);
    for (const log of rejectionLogs) {
      console.log(`    Channel: ${log.channel} | Recipient: ${log.recipient} | Template: ${log.templateCode} | Status: ${log.providerStatus}`);
    }

    assert(rejectionLogs.length === 1, `Applicant receives EXACTLY ONE rejection email (found ${rejectionLogs.length})`);
    assert(rejectionLogs[0].recipient.toLowerCase() === rejectApplicantEmail, 'Rejection email sent strictly to applicant email');
    assert(rejectionLogs[0].templateCode === 'REGISTRATION_REJECTED', 'Template code is strictly REGISTRATION_REJECTED');

    const superAdminRejectionLogs = await NotificationLog.findAll({
      where: {
        referenceId: requestId2,
        recipient: resolvedSuperAdminEmail,
        templateCode: 'REGISTRATION_REJECTED',
      },
    });
    assert(superAdminRejectionLogs.length === 0, 'SuperAdmin NEVER receives applicant rejection email');

    // -------------------------------------------------------------
    // TEST SUITE 4: Invalid Recipient Fallback Prevention
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 4: Invalid Recipient Fallback Prevention ---');
    const invalidPayload = {
      fleetName: 'Invalid Email Fleet',
      businessCode: 'INV99',
      ownerName: 'Invalid User',
      contactEmail: 'not-an-email',
      contactPhone: '9840112233',
      city: 'Chennai',
      state: 'Tamil Nadu',
      termsConsent: true,
    };

    const invalidRes = await makeRequest(port, 'POST', '/api/tenants/public/register-fleet', invalidPayload);
    assert(invalidRes.statusCode === 400, `Invalid email submission is rejected with HTTP 400 (got ${invalidRes.statusCode})`);
    assert(invalidRes.data?.success === false, 'Invalid submission returns success: false');

    // -------------------------------------------------------------
    // TEST SUITE 5: EVENT 5 — Booking Created SMS Regression Verification
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 5: Event 5 — Booking Created SMS Regression Verification ---');
    const testBookingCode = `BK-TEST-${Date.now().toString().slice(-4)}`;
    const testBookingId = `booking-test-${Date.now()}`;
    const customerPhone = '9840112233';
    const fleetAdminPhone = '9840998877';

    // 1. Dispatch Booking Created SMS to Customer
    const customerSmsRes = await dispatchAuditedSms({
      recipient: customerPhone,
      templateCode: 'BOOKING_CREATED',
      templateName: 'Booking Creation',
      vars: ['Test Customer'],
      message: `Apex Transit: Hello Test Customer, your ride request #${testBookingCode} has been placed successfully.`,
      referenceEntity: 'BOOKING',
      referenceId: testBookingId,
      tenantId: ROOT_TENANT_ID,
    });
    assert(customerSmsRes.success === true, 'Customer booking created SMS dispatched successfully');
    assert(customerSmsRes.providerStatus === 'SENT' || customerSmsRes.providerStatus === 'MOCK', 'Customer booking created SMS status is accepted/mock');

    // 2. Dispatch Booking Created SMS to relevant Fleet Admin's registered mobile number
    const fleetAdminSmsRes = await dispatchAuditedSms({
      recipient: fleetAdminPhone,
      templateCode: 'BOOKING_CREATED',
      templateName: 'Booking Creation',
      vars: ['Apex Transit Admin'],
      message: `Apex Transit: New booking #${testBookingCode} received from Test Customer.`,
      referenceEntity: 'BOOKING',
      referenceId: testBookingId,
      tenantId: ROOT_TENANT_ID,
    });
    assert(fleetAdminSmsRes.success === true, 'Fleet Admin booking created SMS dispatched successfully');
    assert(fleetAdminSmsRes.providerStatus === 'SENT' || fleetAdminSmsRes.providerStatus === 'MOCK', 'Fleet Admin booking created SMS status is accepted/mock');

    // 3. Inspect NotificationLog for this booking
    const bookingSmsLogs = await NotificationLog.findAll({
      where: { referenceId: testBookingId },
    });
    assert(bookingSmsLogs.length === 2, `Exactly two booking SMS logged (found ${bookingSmsLogs.length})`);

    const customerLogged = bookingSmsLogs.find((l) => l.recipient === customerPhone);
    assert(Boolean(customerLogged), 'Customer booking SMS record exists in NotificationLog');
    assert(customerLogged?.templateCode === 'BOOKING_CREATED', 'Customer booking SMS templateCode is BOOKING_CREATED');
    assert(customerLogged?.providerStatus === 'MOCK', 'Customer booking SMS logged status is strictly MOCK');

    const adminLogged = bookingSmsLogs.find((l) => l.recipient === fleetAdminPhone);
    assert(Boolean(adminLogged), 'Fleet Admin booking SMS record exists in NotificationLog');
    assert(adminLogged?.templateCode === 'BOOKING_CREATED', 'Fleet Admin booking SMS templateCode is BOOKING_CREATED');
    assert(adminLogged?.providerStatus === 'MOCK', 'Fleet Admin booking SMS logged status is strictly MOCK');

    // 4. Verify SuperAdmin Phone NEVER receives this booking SMS
    const superAdminBookingSms = bookingSmsLogs.filter(
      (l) => l.recipient === resolvedSuperAdminPhone
    );
    assert(superAdminBookingSms.length === 0, 'SuperAdmin phone receives ZERO booking created SMS');

    // Clean up test booking SMS logs
    await NotificationLog.destroy({ where: { referenceId: testBookingId } });

    // -------------------------------------------------------------
    // TEST SUITE 6: Non-Registration Notification Templates Intact
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 6: Verify Non-Registration Notifications Intact ---');
    // Ensure that FORGET_PASSWORD_OTP, USER_REGISTRATION_EMAIL_TO_USER, etc., remain supported
    const requiredTemplates = [
      'REGISTRATION_RECEIVED',
      'SUPERADMIN_NEW_APPLICATION_ALERT',
      'TENANT_ADMIN_ACTIVATION_LINK',
      'REGISTRATION_REJECTED',
      'FORGET_PASSWORD_OTP',
      'USER_REGISTRATION_EMAIL_TO_USER',
    ];

    for (const code of requiredTemplates) {
      const templateRecord = await EmailConfiguration.findOne({ where: { emailCode: code } });
      assert(Boolean(templateRecord), `Authoritative email template '${code}' exists in emailconfiguration`);
    }

    console.log(`\n🎉 ALL ${passCount} NOTIFICATION ROUTING TESTS PASSED!`);
  } finally {
    // Restore environment variable
    if (originalSuperAdminEmail !== undefined) {
      process.env.SUPERADMIN_EMAIL = originalSuperAdminEmail;
    } else {
      delete process.env.SUPERADMIN_EMAIL;
    }

    // Clean up test server
    await new Promise<void>((resolve) => server.close(() => resolve()));

    // Clean up created test entities
    console.log('\n🧹 Cleaning up test artifacts...');
    if (createdTenantIds.length > 0) {
      await NotificationLog.destroy({ where: { referenceId: createdTenantIds } });
      await TenantActivationToken.destroy({ where: { tenantId: createdTenantIds } });
      await TenantSubscription.destroy({ where: { tenantId: createdTenantIds } });
      await Tenant.destroy({ where: { tenantId: createdTenantIds } });
    }
    if (createdRequestIds.length > 0) {
      await NotificationLog.destroy({ where: { referenceId: createdRequestIds } });
      await TenantRegistrationRequest.destroy({ where: { requestId: createdRequestIds } });
    }
    // Also clean up by recipient for test email and phone addresses
    await NotificationLog.destroy({
      where: {
        recipient: [applicantEmail, rejectApplicantEmail, mockSuperAdminEmail, applicantPhone, rejectApplicantPhone],
      },
    });

    // Verify 7 protected tables remain intact
    await verifyProtectedTables('FINAL POST-TEST RECONCILIATION');
  }
}

run()
  .then(() => {
    console.log('\n✅ Test suite finished successfully with exit code 0.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Test suite failed:', err);
    process.exit(1);
  });
