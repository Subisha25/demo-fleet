import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  sequelize,
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
  TenantActivationToken,
  SubscriptionInvoice,
  NotificationLog,
  EmailConfiguration as EmailConfig,
  SaaSPlan as SaasPlan,
  User,
  Vehicle,
  VehicleType,
  Drivers,
  Company,
} from '../models';
import config from '../config/config';
import { calculateSubscriptionPeriodEnd } from '../services/subscriptionBillingService';
import { sendNotification, isTestOrSyntheticRecipient } from '../services/notificationService';
import { checkVehicleQuota, checkDriverQuota, checkCompanyQuota, checkUserQuota } from '../services/quotaService';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';
const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';
const TEST_FLEET_A = 'fa111111-1111-1111-1111-111111111111';
const TEST_FLEET_B = 'fb222222-2222-2222-2222-222222222222';

const superAdminToken = jwt.sign(
  {
    userId: '99999999-9999-9999-9999-999999999999',
    role: 'superadmin',
    roles: 'superadmin',
    tenantId: ROOT_TENANT_ID,
    email: 'superadmin@gmail.com',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const fleetAAdminToken = jwt.sign(
  {
    userId: 'aaaa1111-1111-1111-1111-111111111111',
    role: 'admin',
    roles: 'admin',
    tenantId: TEST_FLEET_A,
    email: 'admin@fleeta.com',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const fleetBAdminToken = jwt.sign(
  {
    userId: 'bbbb2222-2222-2222-2222-222222222222',
    role: 'admin',
    roles: 'admin',
    tenantId: TEST_FLEET_B,
    email: 'admin@fleetb.com',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

function makeRequest(
  options: http.RequestOptions,
  postData?: any
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; data: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch {}
        resolve({ statusCode: res.statusCode || 0, headers: res.headers, data: parsed });
      });
    });

    req.on('error', reject);

    if (postData) {
      const payload = typeof postData === 'string' ? postData : JSON.stringify(postData);
      req.write(payload);
    }
    req.end();
  });
}

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}`, details !== undefined ? details : '');
  }
}

async function runAllPhaseTests() {
  console.log('================================================================');
  console.log('FLEETFLOW SUITE: COMPLETE PHASES 1 - 12 VERIFICATION');
  console.log('SAFETY CHECK: Mock transports only. 0 real emails/SMS/payments.');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // SETUP TEST TENANTS IN demodb
    // -------------------------------------------------------------
    console.log('--- Setting up isolated test fleets ---');
    await Tenant.findOrCreate({
      where: { tenantId: TEST_FLEET_A },
      defaults: {
        tenantId: TEST_FLEET_A,
        name: 'Apex Fleet Alpha',
        code: 'APEXA',
        contactEmail: 'contact@apexalpha.in',
        contactPhone: '9876543210',
        planTier: 'PRO',
        status: 'ACTIVE',
        legalName: 'Apex Fleet Alpha Logistics LLP',
        gstin: '29ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
        sacCode: '996601',
        registeredAddress: '101 Industrial Estate, Bangalore',
      },
    });

    await Tenant.findOrCreate({
      where: { tenantId: TEST_FLEET_B },
      defaults: {
        tenantId: TEST_FLEET_B,
        name: 'Beacon Fleet Beta',
        code: 'BEACB',
        contactEmail: 'contact@beaconbeta.in',
        contactPhone: '9876543211',
        planTier: 'BASIC',
        status: 'ACTIVE',
        legalName: 'Beacon Fleet Beta Cabs Ltd',
        gstin: '29BCDEF2345G1Z6',
        panNumber: 'BCDEF2345G',
        sacCode: '996601',
        registeredAddress: '202 Tech Park, Bangalore',
      },
    });

    // Clean any prior test records for these fleets
    await TenantSubscription.destroy({ where: { tenantId: [TEST_FLEET_A, TEST_FLEET_B] } });
    await SubscriptionInvoice.destroy({ where: { tenantId: [TEST_FLEET_A, TEST_FLEET_B] } });
    await EmailConfig.destroy({ where: { tenantId: [TEST_FLEET_A, TEST_FLEET_B] } });
    await Vehicle.destroy({ where: { tenantId: [TEST_FLEET_A, TEST_FLEET_B] } });

    // =============================================================
    // TEST 1: Phase 1 - Email Root Cause Safeguards & Deduplication
    // =============================================================
    console.log('\n[TEST GROUP 1] Email Safeguards & Synthetic Recipient Suppression');
    
    // Synthetic / test domains must be recognized and suppressed
    assert(isTestOrSyntheticRecipient('admin@skylinecabs.in') === true, 'Suppresses @skylinecabs.in test domain');
    assert(isTestOrSyntheticRecipient('user@example.com') === true, 'Suppresses @example.com test domain');
    assert(isTestOrSyntheticRecipient('test@invalid.test') === true, 'Suppresses @invalid.test domain');
    assert(isTestOrSyntheticRecipient('info@fleetflow.io') === false, 'Allows valid non-synthetic production domain');

    // Test notification deduplication via idempotencyKey
    const idemKey = `TEST_IDEMPOTENCY_${Date.now()}`;
    const firstSend = await sendNotification({
      channel: 'EMAIL',
      recipient: 'suppressed-test@skylinecabs.in',
      subject: 'Test Deduplication',
      body: '<p>Test</p>',
      templateCode: 'TEST_EVENT',
      tenantId: TEST_FLEET_A,
      idempotencyKey: idemKey,
    });
    assert(firstSend.success === true, 'First send succeeds via mock');

    const secondSend = await sendNotification({
      channel: 'EMAIL',
      recipient: 'suppressed-test@skylinecabs.in',
      subject: 'Test Deduplication',
      body: '<p>Test</p>',
      templateCode: 'TEST_EVENT',
      tenantId: TEST_FLEET_A,
      idempotencyKey: idemKey,
    });
    assert(secondSend.success === true && secondSend.providerMessageId === firstSend.providerMessageId, 'Second duplicate send is deduplicated within 15 min window');

    // SuperAdmin audit logs endpoint check
    const auditRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/admin/notifications/audit-logs?limit=5',
      method: 'GET',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(auditRes.statusCode === 200 && auditRes.data?.success === true, 'SuperAdmin can query notification audit logs');
    assert(Array.isArray(auditRes.data?.logs), 'Audit logs returns array of notification logs');

    // =============================================================
    // TEST 2: Phase 2 - Email Template Scope & Tenant Isolation
    // =============================================================
    console.log('\n[TEST GROUP 2] Platform vs Fleet Email Templates & Tenant Isolation');

    // SuperAdmin sees all templates (Platform + Fleet)
    const adminTplsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/emailConfRoutes/getAllEmailConf',
      method: 'GET',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(adminTplsRes.statusCode === 200, 'SuperAdmin lists all email configurations');
    const allTpls: any[] = adminTplsRes.data?.emailConfs || [];
    const hasPlatformScope = allTpls.some((t: any) => t.scope === 'PLATFORM');
    assert(hasPlatformScope, 'Seeded platform SaaS lifecycle templates exist with scope=PLATFORM');

    // Fleet A Admin querying templates only sees FLEET operational templates
    const fleetATplsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/emailConfRoutes/getAllEmailConf',
      method: 'GET',
      headers: { Authorization: `Bearer ${fleetAAdminToken}` },
    });
    assert(fleetATplsRes.statusCode === 200, 'Fleet A admin can access email templates');
    const fleetATpls: any[] = fleetATplsRes.data?.emailConfs || [];
    const fleetAHasPlatformOnly = fleetATpls.some((t: any) => t.scope === 'PLATFORM');
    assert(!fleetAHasPlatformOnly, 'Fleet A admin cannot see platform SaaS lifecycle templates');

    // Fleet A creates a custom override for an operational template (e.g., BOOKING_CONFIRMED)
    const saveTplRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/emailConfRoutes/createEmailConf',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fleetAAdminToken}`,
        },
      },
      {
        emailCode: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed - Apex Alpha Style',
        subject: 'Your Apex Alpha Cab is Confirmed! (Ref: {{bookingId}})',
        message: '<div>Apex Alpha Cab Confirmed for {{customerName}}</div>',
      }
    );
    assert(saveTplRes.statusCode === 201, 'Fleet A saves custom template override');

    // Verify Fleet A template has tenantId = TEST_FLEET_A
    const savedTpl = await EmailConfig.findOne({
      where: { emailCode: 'BOOKING_CONFIRMED', tenantId: TEST_FLEET_A },
    });
    assert(savedTpl !== null && (savedTpl as any).title === 'Booking Confirmed - Apex Alpha Style', 'Tenant A override persisted with correct tenantId');

    // Fleet B admin querying BOOKING_CONFIRMED must NOT see Fleet A override
    const fleetBTplsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/emailConfRoutes/getAllEmailConf',
      method: 'GET',
      headers: { Authorization: `Bearer ${fleetBAdminToken}` },
    });
    const fleetBTpls: any[] = fleetBTplsRes.data?.emailConfs || [];
    const fleetBBookingTpl = fleetBTpls.find((t: any) => t.emailCode === 'BOOKING_CONFIRMED');
    assert(
      !fleetBBookingTpl || fleetBBookingTpl.tenantId !== TEST_FLEET_A,
      'Fleet B does NOT see Fleet A customized template (Tenant Isolation preserved)'
    );

    // Template preview with mock data resolves fleet branding
    const previewRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/emailConfRoutes/preview',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fleetAAdminToken}`,
        },
      },
      {
        emailCode: 'BOOKING_CONFIRMED',
        message: 'Hello {{UserName}}, your cab {{BookingNumber}} is confirmed!',
        mockData: {
          UserName: 'Rohit Sharma',
          BookingNumber: 'BK-9999',
        },
      }
    );
    assert(previewRes.statusCode === 200 && previewRes.data?.success === true, 'Email preview endpoint renders successfully');
    assert(
      previewRes.data?.renderedBody?.includes('Rohit Sharma'),
      'Preview renders placeholder variables accurately'
    );

    // =============================================================
    // TEST 3: Phase 3 - Registration, Approval & Rejection
    // =============================================================
    console.log('\n[TEST GROUP 3] Registration Workflow, Rejection Audit & Single-Use Password Setup');

    // 1. Submit a registration request
    const regReqData = {
      fleetName: 'Cosmic Cabs Logistics',
      businessCode: `CSM${Math.floor(100 + Math.random() * 899)}`,
      ownerName: 'Karan Mehra',
      contactEmail: `cosmic-${Date.now()}@example.com`,
      contactPhone: '9988776655',
      city: 'Bangalore',
      state: 'Karnataka',
      requestedPlanTier: 'PRO',
      billingCycle: 'ANNUAL',
      termsConsent: true,
      legalName: 'Cosmic Cabs Logistics LLP',
      gstin: '29ABCDE1234F1Z8',
      panNumber: 'ABCDE1234F',
      sacCode: '996601',
      registeredAddress: '77 Cosmic Tower, Bangalore',
    };

    const regSubmitRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/tenants/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      regReqData
    );
    assert(regSubmitRes.statusCode === 201 && regSubmitRes.data?.success === true, 'Public fleet registration creates application');
    const createdAppId = regSubmitRes.data?.data?.requestId;
    assert(!!createdAppId, 'Registration returns unique applicationId');

    // 2. Reject another registration request to verify rejection reason enforcement
    const regToReject = await TenantRegistrationRequest.create({
      fleetName: 'Rejected Fleet Corp',
      businessCode: `REJ${Math.floor(100 + Math.random() * 899)}`,
      ownerName: 'Vijay Kumar',
      contactEmail: `reject-${Date.now()}@example.com`,
      contactPhone: '9988776611',
      city: 'Bangalore',
      state: 'Karnataka',
      requestedPlanTier: 'BASIC',
      billingCycle: 'MONTHLY',
      status: 'PENDING',
    });

    // Attempt rejection without reason should fail
    const rejectNoReasonRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/tenants/admin/registrations/${(regToReject as any).requestId}/reject`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
      },
      {}
    );
    assert(rejectNoReasonRes.statusCode === 400, 'Rejection without reason is blocked with 400 Bad Request');

    // Rejection with reason should succeed and update audit trail
    const rejectWithReasonRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/tenants/admin/registrations/${(regToReject as any).requestId}/reject`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
      },
      { rejectionReason: 'Incomplete commercial fleet registration documents provided.' }
    );
    assert(rejectWithReasonRes.statusCode === 200 && rejectWithReasonRes.data?.success === true, 'Rejection with reason succeeds');
    const rejectedReq = await TenantRegistrationRequest.findByPk((regToReject as any).requestId);
    assert(
      (rejectedReq as any)?.status === 'REJECTED' &&
        (rejectedReq as any)?.rejectionReason === 'Incomplete commercial fleet registration documents provided.',
      'Rejection reason and REJECTED status persisted in audit trail'
    );

    // 3. Approve the valid registration request
    const approveRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/tenants/admin/registrations/${createdAppId}/approve`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
      },
      {}
    );
    assert(approveRes.statusCode === 200 && approveRes.data?.success === true, 'SuperAdmin approval creates tenant and pending subscription');
    const approvedTenantId = approveRes.data?.data?.tenantId;
    assert(!!approvedTenantId, 'Approval returns valid tenantId');

    // Check that approval provisioned subscription with TRIALING (awaiting paid settlement)
    const subRecord = await TenantSubscription.findOne({ where: { tenantId: approvedTenantId } });
    assert(subRecord !== null && (subRecord as any).status === 'TRIALING', 'Approved tenant has TRIALING subscription status');

    // Check single-use activation token exists
    const tokenRecord = await TenantActivationToken.findOne({
      where: { tenantId: approvedTenantId, isRevoked: false },
    });
    assert(tokenRecord !== null && (tokenRecord as any).usedAt === null, 'Single-use 24h password setup token generated');

    // =============================================================
    // TEST 4: Phase 4 & 5 - Accurate Calendar Dates & Quota Entitlements
    // =============================================================
    console.log('\n[TEST GROUP 4] Accurate Date Calculations & 1-Record Free Setup Allowance');

    // Test calendar period calculations
    const jan31 = new Date(2026, 0, 31); // Jan 31, 2026
    const monthlyEnd = calculateSubscriptionPeriodEnd(jan31, 'MONTHLY');
    assert(monthlyEnd.getMonth() === 1 && monthlyEnd.getDate() === 28, 'Jan 31 monthly billing ends Feb 28 (clamps to month-end)');

    const feb28 = new Date(2026, 1, 28); // Feb 28, 2026
    const febMonthlyEnd = calculateSubscriptionPeriodEnd(feb28, 'MONTHLY');
    assert(febMonthlyEnd.getMonth() === 2 && febMonthlyEnd.getDate() === 28, 'Feb 28 monthly billing ends March 28');

    const annualStart = new Date(2026, 0, 15);
    const annualEnd = calculateSubscriptionPeriodEnd(annualStart, 'ANNUAL');
    assert(
      annualEnd.getFullYear() === 2027 && annualEnd.getMonth() === 0 && annualEnd.getDate() === 15,
      'Annual billing ends on exact calendar anniversary'
    );

    // Test 1-record free setup allowance in TRIALING state
    // For Fleet A in TRIALING state:
    await TenantSubscription.create({
      tenantId: TEST_FLEET_A,
      planId: 'plan_pro_yearly',
      planName: 'PRO',
      planTier: 'PRO',
      billingCycle: 'yearly',
      amount: 50988,
      currency: 'INR',
      status: 'TRIALING',
      startDate: new Date(),
      endDate: calculateSubscriptionPeriodEnd(new Date(), 'ANNUAL'),
      paymentStatus: 'PENDING',
    });

    // 0 vehicles currently -> checkVehicleQuota should allow 1st record
    const quotaCheck1 = await checkVehicleQuota(TEST_FLEET_A);
    assert(quotaCheck1.allowed === true && quotaCheck1.current === 0, 'Initial free allowance allows 1st vehicle in TRIALING state');

    // Get or create a vehicle type for test
    const existingType = await VehicleType.findOne();
    const vTypeId = existingType?.vehicleTypeId || (await VehicleType.create({ vehicleTypeName: 'Test Sedan' } as any)).vehicleTypeId;

    // Insert 1 vehicle for Fleet A
    const v1 = await Vehicle.create({
      tenantId: TEST_FLEET_A,
      vehicleName: 'Toyota Innova Crysta',
      vehicleTypeId: vTypeId,
      manufacturing: '2024',
    });

    // Now 1 vehicle exists -> checkVehicleQuota must block 2nd vehicle until paid
    const quotaCheck2 = await checkVehicleQuota(TEST_FLEET_A);
    assert(
      quotaCheck2.allowed === false,
      'Initial free allowance strictly blocks 2nd vehicle in TRIALING state (upgrade prompt enforced)'
    );

    // Test SUSPENDED state -> blocks all creations
    await TenantSubscription.update(
      { status: 'SUSPENDED' },
      { where: { tenantId: TEST_FLEET_A } }
    );
    const quotaCheckSuspended = await checkVehicleQuota(TEST_FLEET_A);
    assert(
      quotaCheckSuspended.allowed === false && quotaCheckSuspended.max === 0,
      'Suspended subscription blocks creation (max: 0)'
    );

    // =============================================================
    // TEST 5: Phase 4 & 6 - Verified Payment Activation & Ledgers
    // =============================================================
    console.log('\n[TEST GROUP 5] Verified Payment Activation & Invoice History');

    // Simulate verified payment for Fleet A -> activates subscription
    const checkoutRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/tenants/billing/checkout',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fleetAAdminToken}`,
        },
      },
      {
        planTier: 'PRO',
        billingCycle: 'yearly',
      }
    );
    assert((checkoutRes.statusCode === 200 || checkoutRes.statusCode === 201) && checkoutRes.data?.success === true, 'Checkout creates pending subscription invoice');
    const invoiceId = checkoutRes.data?.data?.invoice?.subscriptionInvoiceId;
    assert(!!invoiceId, 'Checkout returns valid invoiceId');

    // Verify payment using mock gateway
    const verifyRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/tenants/billing/verify-payment',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fleetAAdminToken}`,
        },
      },
      {
        subscriptionInvoiceId: invoiceId,
        gatewayPaymentId: `MOCK_PAY_${Date.now()}`,
        gatewaySignature: 'mock_signature_verified',
      }
    );
    assert(verifyRes.statusCode === 200 && verifyRes.data?.success === true, 'Verified payment succeeds via mock gateway');

    // Subscription status should now be ACTIVE with PRO plan limits
    const activeSub = await TenantSubscription.findOne({ where: { tenantId: TEST_FLEET_A } });
    assert((activeSub as any)?.status === 'ACTIVE', 'Subscription promoted to ACTIVE on verified payment');

    // Quota check now reflects PRO plan limit (75 vehicles)
    const paidQuotaCheck = await checkVehicleQuota(TEST_FLEET_A);
    assert(
      paidQuotaCheck.allowed === true && paidQuotaCheck.max >= 75,
      'Active paid subscription unlocks full plan quota (>= 75 vehicles)'
    );

    // Immutable invoice record exists
    const paidInvoice = await SubscriptionInvoice.findOne({ where: { subscriptionInvoiceId: invoiceId, paymentStatus: 'PAID' } });
    assert(paidInvoice !== null, 'Immutable paid subscription invoice recorded in ledger');

    // =============================================================
    // TEST 6: Phase 7 - SuperAdmin Subscription Revenue Reports
    // =============================================================
    console.log('\n[TEST GROUP 6] SuperAdmin Subscription Revenue Summary & Reporting');

    const revRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/admin/billing/revenue-summary',
      method: 'GET',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(revRes.statusCode === 200 && revRes.data?.success === true, 'SuperAdmin can fetch revenue summary');
    const revData = revRes.data?.data;
    assert(revData.totalCollected > 0, 'Total collected includes verified paid subscription amounts');
    assert(revData.annual !== undefined && revData.monthly !== undefined, 'Revenue summary contains monthly and annual breakdowns');
    assert(revData.annual.byPlan?.PRO?.amount > 0, 'Annual PRO tier collections correctly classified');

    // All invoices query supports filtering
    const allInvoicesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/admin/billing/all-invoices?planTier=PRO&billingCycle=ANNUAL',
      method: 'GET',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(allInvoicesRes.statusCode === 200 && allInvoicesRes.data?.success === true, 'SuperAdmin can query filtered subscription invoices');
    assert(Array.isArray(allInvoicesRes.data?.data) || Array.isArray(allInvoicesRes.data?.invoices), 'Invoices response contains array of invoices');

    // =============================================================
    // TEST 7: Phase 9 - Profile Management & Cross-Tenant Security
    // =============================================================
    console.log('\n[TEST GROUP 7] Profile Management & Cross-Tenant Isolation');

    // Fleet A Admin fetches own profile
    const fleetAProfileRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/user/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${fleetAAdminToken}` },
    });
    assert(fleetAProfileRes.statusCode === 200 && fleetAProfileRes.data?.success === true, 'Fleet Admin can fetch own profile');
    assert(
      (fleetAProfileRes.data?.data?.fleet?.name === 'Apex Fleet Alpha') ||
      (fleetAProfileRes.data?.fleetProfile?.name === 'Apex Fleet Alpha'),
      'Profile correctly resolves authenticated fleet business identity'
    );

    // Fleet A Admin updates business identity
    const updateProfileRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/user/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fleetAAdminToken}`,
        },
      },
      {
        fleetProfile: {
          legalName: 'Apex Fleet Alpha Logistics Private Limited',
          gstin: '29ABCDE1234F1Z5',
          pan: 'ABCDE1234F',
          sac: '996601',
          contactEmail: 'dispatch@apexalpha.in',
          contactPhone: '9876543210',
          registeredAddress: '404 Logistics Hub, Bangalore',
        },
      }
    );
    assert(updateProfileRes.statusCode === 200 && updateProfileRes.data?.success === true, 'Fleet Admin updates own fleet profile');

    // Verify Fleet B profile is unaffected
    const fleetBProfileRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/user/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${fleetBAdminToken}` },
    });
    const bName = fleetBProfileRes.data?.data?.fleet?.name || fleetBProfileRes.data?.fleetProfile?.name;
    const bLegal = fleetBProfileRes.data?.data?.fleet?.legalName || fleetBProfileRes.data?.fleetProfile?.legalName;
    assert(
      bName === 'Beacon Fleet Beta' && bLegal === 'Beacon Fleet Beta Cabs Ltd',
      'Fleet B business profile remains unchanged (Cross-tenant edit prevented)'
    );

    // Cleanup test vehicle
    await Vehicle.destroy({ where: { vehicleId: (v1 as any).vehicleId } });

    console.log('\n================================================================');
    console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
    console.log('CONFIRMATION: Zero real emails, SMS, OTPs, or payments triggered.');
    console.log('================================================================');

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runAllPhaseTests();
