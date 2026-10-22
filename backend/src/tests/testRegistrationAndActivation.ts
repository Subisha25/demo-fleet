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
  User,
  Employee,
} from '../models';
import config from '../config/config';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';
const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';

const superAdminToken = jwt.sign(
  {
    userId: '99999999-9999-9999-9999-999999999999',
    role: 'superadmin',
    roles: 'superadmin',
    tenantId: ROOT_TENANT_ID,
    email: 'superadmin@gracecabs.com',
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

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string, extra?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc} ${extra ? `(${extra})` : ''}`);
    failed++;
  }
}

async function runRegistrationAndLifecycleSuite() {
  console.log('\n========================================================================');
  console.log('🚀 SAAS JOURNEY SUITE: REGISTRATION -> REVIEW -> ACTIVATION -> BILLING -> LIFECYCLE');
  console.log('========================================================================\n');

  try {
    await sequelize.authenticate();
    const uniqueSuffix = Date.now().toString().slice(-5);
    const testCode = `FLEET${uniqueSuffix}`;
    const testEmail = `operator${uniqueSuffix}@testfleet.com`;

    // -------------------------------------------------------------------------
    // Step 1: Public Fleet Registration Validation
    // -------------------------------------------------------------------------
    console.log('🔹 [Step 1] Public Fleet Registration API Validation');

    // Missing fields validation
    const missingRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/public/register-fleet',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fleetName: 'Incomplete Fleet',
      }
    );
    assert(missingRes.statusCode === 400, 'POST /api/public/register-fleet rejects missing required fields with HTTP 400');

    // Valid registration submission
    const regRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/public/register-fleet',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fleetName: `Speedy Wheels ${uniqueSuffix}`,
        businessCode: testCode,
        ownerName: 'Vikas Sharma',
        contactEmail: testEmail,
        contactPhone: '+919876543210',
        city: 'Bengaluru',
        state: 'Karnataka',
        requestedPlanTier: 'PRO',
        billingCycle: 'ANNUAL',
        fleetSize: '16-75',
        termsConsent: true,
      }
    );

    assert(regRes.statusCode === 201, 'POST /api/public/register-fleet succeeds with HTTP 201 Created');
    const requestId = regRes.data?.data?.requestId;
    assert(Boolean(requestId), 'Registration application returns valid requestId');
    assert(regRes.data?.data?.status === 'PENDING', 'Initial registration application status is strictly PENDING');

    // Duplicate business code submission prevention
    const dupRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/public/register-fleet',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fleetName: 'Duplicate Code Fleet',
        businessCode: testCode,
        ownerName: 'Another Person',
        contactEmail: `another${uniqueSuffix}@example.com`,
        contactPhone: '+919876543211',
        city: 'Mumbai',
        state: 'Maharashtra',
        termsConsent: true,
      }
    );
    assert(dupRes.statusCode === 409, 'Duplicate business code is strictly rejected with HTTP 409 Conflict');

    // Verify NotificationLog audit entries for registration
    const notifRow = await NotificationLog.findOne({
      where: {
        referenceId: requestId,
        templateCode: 'REGISTRATION_RECEIVED',
      },
    });
    assert(Boolean(notifRow), 'Applicant registration acknowledgment email recorded in notification_logs');

    // -------------------------------------------------------------------------
    // Step 2: SuperAdmin Application Review Queue
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 2] SuperAdmin Registration Queue & Approval Workflow');

    const listRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/admin/registrations?status=PENDING',
      method: 'GET',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(listRes.statusCode === 200, 'GET /api/tenants/admin/registrations returns HTTP 200 OK');
    const items = listRes.data?.data;
    assert(Array.isArray(items) && items.some((i: any) => i.requestId === requestId), 'Submitted application is present in SuperAdmin queue');

    // SuperAdmin Details Inspection
    const detailRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/tenants/admin/registrations/${requestId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(detailRes.statusCode === 200, 'GET /api/tenants/admin/registrations/:id returns HTTP 200 with complete application details');

    // SuperAdmin Approval
    const approveRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/tenants/admin/registrations/${requestId}/approve`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
      },
      {
        reviewNotes: 'Verified vehicle licenses and identity documents.',
      }
    );
    assert(approveRes.statusCode === 200, 'POST /api/tenants/admin/registrations/:id/approve succeeds with HTTP 200');
    const newTenantId = approveRes.data?.data?.tenantId;
    const rawActivationToken = approveRes.data?.data?.rawToken;
    assert(Boolean(newTenantId), 'New Tenant provisioned with unique tenantId');
    assert(Boolean(rawActivationToken), '24-hour cryptographic activation token generated');

    // Verify updated status in database
    const updatedReg = await TenantRegistrationRequest.findByPk(requestId);
    assert(updatedReg?.status === 'APPROVED', 'Application status in database updated to APPROVED');

    // Verify NotificationLog audit entry for activation link
    const activationNotif = await NotificationLog.findOne({
      where: {
        referenceId: newTenantId,
        templateCode: 'TENANT_ADMIN_ACTIVATION_LINK',
      },
    });
    assert(Boolean(activationNotif), 'Activation email dispatch recorded in notification_logs');

    // -------------------------------------------------------------------------
    // Step 3: Secure Tokenized Activation & Password Setup
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 3] Tokenized Onboarding & Password Setup');

    // Invalid Token Check
    const invalidTokenRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/public/activation/verify/act_invalidtoken1234567890',
      method: 'GET',
    });
    assert(invalidTokenRes.statusCode === 400, 'Invalid token verification returns HTTP 400');

    // Valid Token Verification
    const validTokenRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/public/activation/verify/${rawActivationToken}`,
      method: 'GET',
    });
    assert(validTokenRes.statusCode === 200, 'Valid token verification succeeds with HTTP 200');
    assert(validTokenRes.data?.valid === true, 'Response confirms token validity');
    assert(validTokenRes.data?.data?.email === testEmail, 'Response securely confirms applicant email');

    // Password Setup & Activation Completion
    const setupPassRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/public/activation/complete',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        token: rawActivationToken,
        password: 'SecureOperatorPassword123!',
        confirmPassword: 'SecureOperatorPassword123!',
      }
    );
    assert(setupPassRes.statusCode === 200, 'POST /api/public/activation/complete succeeds with HTTP 200', `Status: ${setupPassRes.statusCode}, Data: ${JSON.stringify(setupPassRes.data)}`);

    // Token Reuse Prevention
    const reuseTokenRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/public/activation/verify/${rawActivationToken}`,
      method: 'GET',
    });
    assert(reuseTokenRes.statusCode === 400, 'Used token cannot be reused (HTTP 400)');

    // Verify Admin User Login with newly configured password
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: testEmail,
        password: 'SecureOperatorPassword123!',
      }
    );
    assert(loginRes.statusCode === 200, 'Newly activated tenant admin logs in securely via /api/auth/login');
    const tenantAdminJwt = loginRes.data?.token || loginRes.data?.accessToken;
    assert(Boolean(tenantAdminJwt), 'Login returns valid authenticated JWT token');

    // -------------------------------------------------------------------------
    // Step 4: Subscription Invoicing & Annual Pricing Calculation
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 4] Subscription Invoicing & Payment Verification');

    // Create Subscription Checkout (Annual billing with 15% discount)
    const checkoutRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/tenants/subscription/checkout',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantAdminJwt}`,
        },
      },
      {
        planTier: 'PRO',
        billingCycle: 'ANNUAL',
      }
    );
    assert(checkoutRes.statusCode === 201, 'POST /api/tenants/subscription/checkout succeeds with HTTP 201');
    const invoiceData = checkoutRes.data?.data?.invoice;
    const orderSummary = checkoutRes.data?.data?.orderSummary;
    // Canonical PRO annual: ₹3,560 base
    assert(Number(invoiceData?.baseAmount) === 3560, '15% annual discount correctly applied to base amount (₹3,560.00)');
    // 18% GST = ₹640.80
    assert(Number(invoiceData?.taxAmount) === 640.8, '18% GST accurately computed (₹640.80)');
    // Total = ₹4,200.80
    assert(Number(invoiceData?.totalAmount) === 4200.8, 'Total amount includes base + 18% GST (₹4,200.80)');

    // Verify Payment
    const payRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/tenants/subscription/verify-payment',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantAdminJwt}`,
        },
      },
      {
        subscriptionInvoiceId: invoiceData?.subscriptionInvoiceId,
        transactionReference: `TXN_HDFC_${Date.now()}`,
      }
    );
    assert(payRes.statusCode === 200, 'POST /api/tenants/subscription/verify-payment succeeds with HTTP 200');
    assert(payRes.data?.data?.invoice?.paymentStatus === 'PAID', 'SubscriptionInvoice paymentStatus updated to PAID');

    // Verify Invoice List for Tenant
    const invListRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/subscription/invoices',
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantAdminJwt}` },
    });
    assert(invListRes.statusCode === 200, 'GET /api/tenants/subscription/invoices returns invoices list with HTTP 200');
    assert(invListRes.data?.data?.length >= 1, 'Tenant has at least 1 persisted subscription invoice');

    // -------------------------------------------------------------------------
    // Step 5: Subscription Lifecycle Engine & Scheduled Evaluation
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 5] Subscription Lifecycle Schedulers & Restriction Defenses');

    const lifecycleRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/tenants/admin/subscription-lifecycle/run',
        method: 'POST',
        headers: { Authorization: `Bearer ${superAdminToken}` },
      }
    );
    assert(lifecycleRes.statusCode === 200, 'POST /api/tenants/admin/subscription-lifecycle/run returns HTTP 200');
    assert(typeof lifecycleRes.data?.report?.scanned === 'number', 'Lifecycle report successfully returns scanned subscription count');

    // -------------------------------------------------------------------------
    // Step 6: Clean Up Test Fixtures
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 6] Cleaning up temporary test fixtures');
    await NotificationLog.destroy({ where: { recipient: testEmail } });
    await SubscriptionInvoice.destroy({ where: { tenantId: newTenantId } });
    await TenantActivationToken.destroy({ where: { tenantId: newTenantId } });
    await User.destroy({ where: { email: testEmail } });
    await Employee.destroy({ where: { email: testEmail } });
    await TenantSubscription.destroy({ where: { tenantId: newTenantId } });
    await Tenant.destroy({ where: { tenantId: newTenantId } });
    await TenantRegistrationRequest.destroy({ where: { requestId } });
    console.log('  🧹 Test fixtures cleaned up successfully.');

    console.log('\n========================================================================');
    console.log(`📊 SAAS JOURNEY RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error during test suite:', err);
    process.exit(1);
  }
}

runRegistrationAndLifecycleSuite();
