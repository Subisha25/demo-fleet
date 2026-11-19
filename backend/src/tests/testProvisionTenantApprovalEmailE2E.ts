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
  TenantActivationToken,
  NotificationLog,
  EmailConfiguration,
} from '../models';
import { getSuperAdminEmail, getSuperAdminPhone } from '../services/notificationService';

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
  console.log('FLEETFLOW: PROVISION TENANT APPROVAL EMAIL E2E VERIFICATION SUITE');
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

  // Configured distinct test identities per Prompt Section 5
  const fleetAdminEmail = 'provisioned-admin@example.com';
  const fleetAdminPhone = '9840112233';
  const duplicateAdminEmail = 'duplicate-test@example.com';
  const duplicateAdminPhone = '9840998877';

  // Override SUPERADMIN_EMAIL in env to test isolation cleanly
  const originalSuperAdminEmail = process.env.SUPERADMIN_EMAIL;
  const mockSuperAdminEmail = 'superadmin-test@example.com';
  process.env.SUPERADMIN_EMAIL = mockSuperAdminEmail;

  try {
    // -------------------------------------------------------------
    // Setup: SuperAdmin Authentication
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
    // TEST SUITE 1: Provision Tenant Workflow (Step 1 + Step 2)
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 1: Provision Tenant Step 1 & Step 2 Submission ---');
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const provisionPayload = {
      // Step 1: Fleet & Identity Details + Business Legal Identity + Location
      fleetName: `Horizon Mobility ${suffix}`,
      displayName: `Horizon Mobility ${suffix}`,
      legalName: `Horizon Mobility Private Limited`,
      businessCode: `HRZ${suffix.toString().slice(-3)}`,
      ownerName: 'Horizon Administrator',
      contactEmail: fleetAdminEmail,
      contactPhone: fleetAdminPhone,
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pinCode: '641001',
      registeredAddress: '100 Avinashi Road, Peelamedu, Coimbatore',
      gstin: '33AAACH1111A1Z5',
      panNumber: 'AAACH1111A',
      sacCode: '996609',
      website: 'https://horizonmobility.example.com',
      // Step 2: SaaS Plan & Commercial Tier
      requestedPlanTier: 'PRO',
      planTier: 'PRO',
      billingCycle: 'ANNUAL',
      fleetSize: '16-75',
      termsConsent: true,
    };

    const provisionRes = await makeRequest(port, 'POST', '/api/tenants', provisionPayload, superAdminHeaders);
    assert(provisionRes.statusCode === 201, `Provision Tenant returns HTTP 201 Created (got ${provisionRes.statusCode})`);
    assert(provisionRes.data?.success === true, 'Provision Tenant response success flag is true');

    const provisionedTenantId = provisionRes.data?.tenant?.tenantId || provisionRes.data?.data?.tenant?.tenantId;
    assert(Boolean(provisionedTenantId), `Provisioned tenant ID generated: ${provisionedTenantId}`);
    createdTenantIds.push(provisionedTenantId);

    // Verify Tenant record in DB
    const dbTenant = await Tenant.findByPk(provisionedTenantId);
    assert(Boolean(dbTenant), 'Provisioned Tenant record persisted in database');
    assert(dbTenant?.status === 'ACTIVE', 'Provisioned Tenant status is ACTIVE');
    assert(dbTenant?.planTier === 'PRO', 'Provisioned Tenant planTier is PRO');
    assert(Boolean(dbTenant?.slug), `Tenant canonical slug generated: ${dbTenant?.slug}`);

    // Verify Subscription record in DB
    const dbSub = await TenantSubscription.findOne({ where: { tenantId: provisionedTenantId } });
    assert(Boolean(dbSub), 'TenantSubscription record created in database');
    assert(dbSub?.status === 'ACTIVE', 'TenantSubscription status is ACTIVE');
    assert(dbSub?.planTier === 'PRO', 'TenantSubscription planTier is PRO');

    // Verify Activation Token in DB
    const dbToken = await TenantActivationToken.findOne({ where: { tenantId: provisionedTenantId } });
    assert(Boolean(dbToken), 'TenantActivationToken record created in database');
    assert(dbToken?.adminEmail === fleetAdminEmail, 'Activation token adminEmail strictly matches Fleet Admin email');
    assert(dbToken?.isRevoked === false, 'Activation token is active and unrevoked');

    // Allow async notification to complete
    await new Promise((resolve) => setTimeout(resolve, 800));

    // -------------------------------------------------------------
    // TEST SUITE 2: Inspect Notification Logs for Provision Tenant
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 2: Provision Tenant Email Recipient & Content Verification ---');
    const notifLogs = await NotificationLog.findAll({
      where: { referenceId: provisionedTenantId },
      order: [['createdAt', 'ASC']],
    });

    console.log(`\n  Found ${notifLogs.length} NotificationLog entries for tenantId: ${provisionedTenantId}:`);
    for (const log of notifLogs) {
      console.log(`    Channel: ${log.channel} | Recipient: ${log.recipient} | Template: ${log.templateCode} | Status: ${log.providerStatus}`);
    }

    // 1. Exactly one approval email to Fleet Admin
    const fleetAdminEmails = notifLogs.filter(
      (l) => l.channel === 'EMAIL' && l.recipient.toLowerCase() === fleetAdminEmail
    );
    assert(fleetAdminEmails.length === 1, `Fleet Admin receives EXACTLY ONE approval email (found ${fleetAdminEmails.length})`);
    assert(fleetAdminEmails[0].templateCode === 'TENANT_ADMIN_ACTIVATION_LINK', 'Template code is strictly TENANT_ADMIN_ACTIVATION_LINK');
    assert(fleetAdminEmails[0].providerStatus === 'MOCK', 'Approval email status is MOCK');

    // 2. Email Metadata Verification
    const meta = (fleetAdminEmails[0].metadata as any) || {};
    assert(Boolean(meta.activationUrl), 'Email metadata contains secure password setup URL (activationUrl)');
    assert(meta.activationUrl.includes('/activate-account?token='), 'activationUrl points to /activate-account with token');
    assert(Boolean(meta.loginUrl || meta.fleetLoginUrl), 'Email metadata contains fleet-specific login URL');
    assert(meta.fleetLoginUrl.includes(`/login/${dbTenant?.slug}`), `fleetLoginUrl is dynamically generated from slug: ${meta.fleetLoginUrl}`);
    assert(meta.fleetName === dbTenant?.name, 'Email metadata contains correct fleetName');
    assert(Boolean(meta.planSummaryPdfUrl || meta.attachments), 'Email metadata includes plan summary PDF reference/attachments');

    // 3. SuperAdmin Zero-Copy & Zero-SMS Verification
    const superAdminApprovalEmails = notifLogs.filter(
      (l) => l.recipient.toLowerCase() === resolvedSuperAdminEmail
    );
    assert(superAdminApprovalEmails.length === 0, 'SuperAdmin receives ZERO approval emails');

    const superAdminSms = notifLogs.filter(
      (l) => l.channel === 'SMS'
    );
    assert(superAdminSms.length === 0, 'ZERO approval SMS dispatched (No approval SMS to SuperAdmin or Fleet Admin)');

    // -------------------------------------------------------------
    // TEST SUITE 3: Idempotency & Duplicate Prevention
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 3: Duplicate Approval / Provision Prevention ---');
    // Dispatching notification again with the same idempotency key
    const duplicateDispatchResult = await makeRequest(
      port,
      'POST',
      '/api/tenants',
      {
        ...provisionPayload,
        // Reuse same name - should be caught as conflict or handled idempotently
      },
      superAdminHeaders
    );
    // Should reject duplicate tenant name with HTTP 409
    assert(duplicateDispatchResult.statusCode === 409, `Duplicate tenant name is rejected with HTTP 409 (got ${duplicateDispatchResult.statusCode})`);

    // Verify NotificationLog count for this tenant did not increase
    const logsAfterDup = await NotificationLog.count({ where: { referenceId: provisionedTenantId } });
    assert(logsAfterDup === 1, `NotificationLog count remains exactly 1 (no duplicate emails dispatched)`);

    // -------------------------------------------------------------
    // TEST SUITE 4: Verify Non-Registration Templates Intact
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 4: Verify System Templates Intact ---');
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

    console.log(`\n🎉 ALL ${passCount} PROVISION TENANT APPROVAL EMAIL TESTS PASSED!`);
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
    // Also clean up by recipient for test email addresses
    await NotificationLog.destroy({
      where: {
        recipient: [fleetAdminEmail, duplicateAdminEmail, mockSuperAdminEmail],
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
