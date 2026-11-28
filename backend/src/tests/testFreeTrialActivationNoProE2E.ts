import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import {
  connectDB,
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
  TenantActivationToken,
  SubscriptionInvoice,
} from '../models';
import {
  submitFleetRegistration,
  approveRegistrationRequest,
  verifyActivationToken,
  completeAccountActivation,
} from '../services/registrationService';
import { getCurrentTenantProfile } from '../services/tenantService';
import { evaluateTenantSubscriptionLock } from '../middleware/subscriptionGuard';

function createMockReqRes(params: any = {}, body: any = {}, query: any = {}, headers: any = {}) {
  let resStatus = 200;
  let resData: any = null;

  const req: any = {
    params,
    body,
    query,
    headers,
    get: (h: string) => headers[h.toLowerCase()] || headers[h],
  };

  const res: any = {
    status: (code: number) => {
      resStatus = code;
      return res;
    },
    json: (data: any) => {
      resData = data;
      return res;
    },
  };

  return {
    req,
    res,
    getStatus: () => resStatus,
    getData: () => resData,
  };
}

async function runTests() {
  await connectDB();

  console.log('================================================================');
  console.log('CABZ E2E TEST: FREE TRIAL ACTIVATION & NO PRO PLAN VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  const uniqueSuffix = Math.floor(100000 + Math.random() * 900000);
  const testFleetName = `Trial Pure Fleet ${uniqueSuffix}`;
  const testCode = `TP${uniqueSuffix.toString().slice(-4)}`;
  const testEmail = `operator_${uniqueSuffix}@trialcabz.com`;
  const testPhone = `98${uniqueSuffix}12`;

  let testRequestId = '';
  let testTenantId = '';
  let testRawToken = '';

  const today = new Date();
  const demoDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // 1. SCENARIO A: Public Fleet Registration
  await test('Scenario A1: Fleet Registration defaults strictly to FREE_TRIAL and 0 price', async () => {
    const { req, res, getStatus, getData } = createMockReqRes(
      {},
      {
        fleetName: testFleetName,
        businessCode: testCode,
        ownerName: 'Pure Trial Operator',
        contactEmail: testEmail,
        contactPhone: testPhone,
        city: 'Bengaluru',
        state: 'Karnataka',
        fleetSize: '16-75',
        demoCallDate: demoDate,
        demoCallTime: '11:00 AM',
        termsConsent: true,
      }
    );

    await submitFleetRegistration(req, res);
    assert.strictEqual(getStatus(), 201, `Expected status 201, got ${getStatus()}`);
    const data = getData();
    assert.strictEqual(data.success, true);
    testRequestId = data.data.requestId;

    const regInDb = await TenantRegistrationRequest.findByPk(testRequestId);
    assert(regInDb !== null, 'Registration must exist in DB');
    assert.strictEqual(regInDb.requestedPlanTier, 'FREE_TRIAL', 'requestedPlanTier must be FREE_TRIAL');
    assert.notStrictEqual(regInDb.requestedPlanTier, 'PRO', 'requestedPlanTier must NEVER be PRO');
  });

  // 2. SCENARIO B: SuperAdmin Approval
  await test('Scenario B1: SuperAdmin Approval provisions Tenant & Subscription with planTier = NULL (Free Trial)', async () => {
    const { req, res, getStatus, getData } = createMockReqRes(
      { requestId: testRequestId },
      { reviewNotes: 'Approved for pure 7-day free trial' }
    );

    await approveRegistrationRequest(req, res);
    assert.strictEqual(getStatus(), 200, `Expected status 200, got ${getStatus()}`);
    const data = getData();
    assert.strictEqual(data.success, true);
    testTenantId = data.tenantId;

    const activationUrl: string = data.data.activationUrl;
    assert(activationUrl.includes('token='), 'Activation URL must contain token');
    testRawToken = activationUrl.split('token=')[1];

    const tenant = await Tenant.findByPk(testTenantId);
    assert(tenant !== null, 'Tenant must exist in DB');
    assert.strictEqual(tenant.planTier, null, 'Tenant planTier must be NULL (no paid plan)');
    assert.notStrictEqual(tenant.planTier, 'PRO', 'Tenant planTier must NOT be PRO');

    const sub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
    assert(sub !== null, 'Subscription must exist in DB');
    assert.strictEqual(sub.planTier, null, 'Subscription planTier must be NULL');
    assert.strictEqual(sub.status, 'TRIALING', 'Subscription status must be TRIALING');
    assert.strictEqual(Number(sub.agreedPrice), 0, 'Agreed price must be 0 for Free Trial');
    assert.strictEqual(sub.trialStartDate, null, 'trialStartDate must be NULL before account activation');
  });

  // 3. SCENARIO C: Activation Token Verification API
  await test('Scenario C1: verifyActivationToken returns Selected Plan: FREE TRIAL and NO PRO/pricing', async () => {
    const { req, res, getStatus, getData } = createMockReqRes(
      {},
      {},
      { token: testRawToken }
    );

    await verifyActivationToken(req, res);
    assert.strictEqual(getStatus(), 200, `Expected status 200, got ${getStatus()}`);
    const data = getData();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.email, testEmail);
    assert.strictEqual(data.data.plan, 'FREE TRIAL', 'plan must be FREE TRIAL');
    assert.notStrictEqual(data.data.plan, 'PRO', 'plan must NEVER be PRO');
    assert.strictEqual(data.data.isFreeTrial, true, 'isFreeTrial must be true');
    assert.strictEqual(data.data.trialDuration, '7 Days', 'trialDuration must be 7 Days');
    assert.strictEqual(data.data.startCondition, 'Starts upon account activation', 'startCondition must be accurate');
    assert.strictEqual(data.data.upfrontPayment, '₹0 / Free', 'upfrontPayment must be ₹0 / Free');
    assert.strictEqual(data.data.accessLevel, 'Full Operational Access', 'accessLevel must be Full Operational Access');
  });

  // 4. SCENARIO D: Account Activation
  await test('Scenario D1: completeAccountActivation sets password and activates 7-day trial with planTier = NULL', async () => {
    const { req, res, getStatus, getData } = createMockReqRes(
      {},
      {
        token: testRawToken,
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }
    );

    await completeAccountActivation(req, res);
    assert.strictEqual(getStatus(), 200, `Expected status 200, got ${getStatus()}`);
    const data = getData();
    assert.strictEqual(data.success, true);

    const sub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
    assert(sub !== null, 'Subscription must exist');
    assert.strictEqual(sub.status, 'TRIALING');
    assert.strictEqual(sub.planTier, null, 'Subscription planTier must remain NULL after activation');
    assert(sub.trialStartDate !== null, 'trialStartDate must be populated now');
    assert(sub.trialEndsAt !== null, 'trialEndsAt must be populated now');

    const startMs = new Date(sub.trialStartDate!).getTime();
    const endMs = new Date(sub.trialEndsAt!).getTime();
    const daysDiff = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
    assert.strictEqual(daysDiff, 7, 'Free Trial duration must be 7 calendar days');
  });

  // 5. SCENARIO E: Authenticated Fleet Profile View
  await test('Scenario E1: getCurrentTenantProfile returns status: TRIALING, planTier: null, agreedPrice: 0', async () => {
    const { req, res, getStatus, getData } = createMockReqRes(
      { tenantId: testTenantId },
      {},
      {},
      { 'x-tenant-id': testTenantId }
    );
    req.tenantId = testTenantId;
    req.role = 'fleet_admin';

    await getCurrentTenantProfile(req, res);
    assert.strictEqual(getStatus(), 200);
    const data = getData();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.tenant.planTier, null, 'Tenant planTier must be NULL');
    assert.strictEqual(data.tenant.subscription.planTier, null, 'Subscription planTier must be NULL');
    assert.strictEqual(data.tenant.subscription.status, 'TRIALING', 'Status must be TRIALING');
  });

  // 6. SCENARIO F: Active Trial Evaluation (Full Access)
  await test('Scenario F1: Active Free Trial has isLocked = false and full operational access', async () => {
    const evaluation = await evaluateTenantSubscriptionLock(testTenantId);
    assert.strictEqual(evaluation.isLocked, false, 'Active free trial must NOT be locked');
    assert.strictEqual(evaluation.subscriptionStatus, 'TRIAL_ACTIVE', 'Status must be TRIAL_ACTIVE');
    assert.strictEqual(evaluation.payableAmount, 0, 'Payable amount must be 0 for active trial');
  });

  // 7. SCENARIO G: Expired Trial Evaluation (No PRO / ₹411.82 default)
  await test('Scenario G1: Expired Trial locks operational access without preselecting PRO or ₹411.82', async () => {
    const sub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
    assert(sub !== null);

    // Simulate expiry 1 hour ago
    const pastStart = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(Date.now() - 1 * 60 * 60 * 1000);
    await sub.update({
      trialStartDate: pastStart,
      trialEndsAt: pastEnd,
    });

    const evaluation = await evaluateTenantSubscriptionLock(testTenantId);
    assert.strictEqual(evaluation.isLocked, true, 'Expired free trial must be locked');
    assert.strictEqual(evaluation.lockReason, 'EXPIRED');
    assert.strictEqual(evaluation.payableAmount, 0, 'Payable amount must be 0 until customer selects a plan');
    assert.notStrictEqual(evaluation.payableAmount, 411.82, 'Payable amount must NEVER default to 411.82');
    assert.strictEqual(evaluation.planTier, 'FREE_TRIAL', 'planTier in lock payload must be FREE_TRIAL');
  });

  // 8. SCENARIO H: Genuine Paid Customer Preservation
  await test('Scenario H1: Genuine paid subscriptions and root tenant strictly preserve paid plan', async () => {
    const paidInvoices = await SubscriptionInvoice.findAll({ where: { paymentStatus: 'PAID' } });
    assert(paidInvoices.length >= 1, 'At least 1 paid invoice exists');

    for (const inv of paidInvoices) {
      const tenant = await Tenant.findByPk(inv.tenantId);
      const sub = await TenantSubscription.findOne({ where: { tenantId: inv.tenantId } });
      if (tenant && sub) {
        assert(['BASIC', 'PRO', 'ENTERPRISE'].includes(tenant.planTier as string), `Paid tenant must retain paid plan. Actual: ${tenant.planTier}`);
        assert(['BASIC', 'PRO', 'ENTERPRISE'].includes(sub.planTier as string), `Paid sub must retain paid plan. Actual: ${sub.planTier}`);
        assert.strictEqual(sub.status, 'ACTIVE', 'Paid subscription must remain ACTIVE');
      }
    }
  });

  console.log(`\n================================================================`);
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log(`================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .then(() => {
    console.log('✓ All tests completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
