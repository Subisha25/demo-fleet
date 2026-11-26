import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { sequelize } from '../models';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { SubscriptionInvoice } from '../models/subscriptionInvoice';
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
import { Employee } from '../models/employee';
import { User } from '../models/user';
import { Vendor } from '../models/vendor';
import { submitFleetRegistration } from '../services/registrationService';
import {
  evaluateTenantSubscriptionLock,
  requireSubscriptionAccess,
} from '../middleware/subscriptionGuard';
import { v4 as uuidv4 } from 'uuid';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { createSubscriptionCheckout, verifySubscriptionPayment } from '../services/subscriptionBillingService';

// Mock helper for Express req, res
function createMockReqRes(body: any, headers: Record<string, string> = {}, params: any = {}, tenantContext: any = null) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  const mergedBody = body ? {
    demoCallDate: tomorrowStr,
    demoCallTime: '11:00 AM',
    ...body,
  } : body;

  const req: any = {
    body: mergedBody,
    headers,
    params,
    query: {},
    path: '/api/vehicle/test-action',
    user: tenantContext?.user,
    role: tenantContext?.role,
    tenantId: tenantContext?.tenantId,
  };

  let statusCode = 200;
  let responseData: any = null;

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseData = data;
      return res;
    },
    getStatusCode() {
      return statusCode;
    },
    getResponseData() {
      return responseData;
    },
  };

  return { req, res };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🚀 CABZ VALIDATION, EYE TOGGLE & SUBSCRIPTION LOCK TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.\n');

    const uniqueId = Date.now().toString().slice(-6);
    const testEmail1 = `fleet_owner_${uniqueId}@testcabz.com`;
    const testPhone1 = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testGstin1 = `33AAACA${Math.floor(1000 + Math.random() * 9000)}A1Z1`;
    const testPan1 = `AAACA${Math.floor(1000 + Math.random() * 9000)}A`;
    const testBusinessCode1 = `C${uniqueId.slice(-4)}`;

    // =========================================================================
    // SECTION 1: REGISTRATION INPUT VALIDATION & DUPLICATE CHECKS
    // =========================================================================
    console.log('--- SECTION 1: REGISTRATION VALIDATION & DUPLICATE CHECKS ---');

    // 1.1 Invalid GSTIN format rejection
    {
      const { req, res } = createMockReqRes({
        fleetName: 'Invalid GST Fleet',
        businessCode: 'IG1',
        ownerName: 'Test Owner',
        contactEmail: 'invalidgst@testcabz.com',
        contactPhone: '9876543210',
        city: 'Chennai',
        state: 'Tamil Nadu',
        gstin: 'INVALIDGST123', // Invalid format (not 15 Indian format)
        panNumber: 'AAACA1111A',
        termsConsent: true,
      });

      await submitFleetRegistration(req, res);
      assert(
        res.getStatusCode() === 400 && res.getResponseData()?.message === 'Please enter a valid 15-character GST number.',
        '1.1 Rejects malformed GST number with exact message'
      );
    }

    // 1.2 Invalid PAN format rejection
    {
      const { req, res } = createMockReqRes({
        fleetName: 'Invalid PAN Fleet',
        businessCode: 'IP1',
        ownerName: 'Test Owner',
        contactEmail: 'invalidpan@testcabz.com',
        contactPhone: '9876543210',
        city: 'Chennai',
        state: 'Tamil Nadu',
        gstin: '',
        panNumber: 'NOTAPAN', // Invalid format
        termsConsent: true,
      });

      await submitFleetRegistration(req, res);
      assert(
        res.getStatusCode() === 400 && res.getResponseData()?.message === 'Please enter a valid 10-character PAN number.',
        '1.2 Rejects malformed PAN number with exact message'
      );
    }

    // 1.3 Invalid Phone (9 digits) rejection
    {
      const { req, res } = createMockReqRes({
        fleetName: 'Invalid Phone Fleet',
        businessCode: 'IPH1',
        ownerName: 'Test Owner',
        contactEmail: 'invalidphone@testcabz.com',
        contactPhone: '987654321', // 9 digits
        city: 'Chennai',
        state: 'Tamil Nadu',
        termsConsent: true,
      });

      await submitFleetRegistration(req, res);
      assert(
        res.getStatusCode() === 400 && res.getResponseData()?.message === 'Phone number must be exactly 10 digits.',
        '1.3 Rejects non-10-digit mobile number with exact message'
      );
    }

    // 1.4 Valid Fleet Registration Submission
    {
      const { req, res } = createMockReqRes({
        fleetName: `Valid Fleet ${uniqueId}`,
        businessCode: testBusinessCode1,
        ownerName: 'Valid Owner',
        contactEmail: testEmail1,
        contactPhone: testPhone1,
        gstin: testGstin1,
        panNumber: testPan1,
        city: 'Chennai',
        state: 'Tamil Nadu',
        pinCode: '600032',
        termsConsent: true,
      });

      await submitFleetRegistration(req, res);
      assert(
        res.getStatusCode() === 201 && res.getResponseData()?.success === true,
        '1.4 Accepts valid fleet registration successfully'
      );
    }

    // 1.5 Duplicate Email check
    {
      const { req, res } = createMockReqRes({
        fleetName: `Fleet Dup Email ${uniqueId}`,
        businessCode: `E${uniqueId.slice(-3)}`,
        ownerName: 'Dup Owner',
        contactEmail: testEmail1, // Duplicate!
        contactPhone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
        city: 'Chennai',
        state: 'Tamil Nadu',
        termsConsent: true,
      });

      await submitFleetRegistration(req, res);
      assert(
        res.getStatusCode() === 409 && res.getResponseData()?.message === 'This email address is already registered.',
        '1.5 Rejects duplicate email address with exact message'
      );
    }

    // 1.6 Duplicate Phone check
    {
      const { req, res } = createMockReqRes({
        fleetName: `Fleet Dup Phone ${uniqueId}`,
        businessCode: `P${uniqueId.slice(-3)}`,
        ownerName: 'Dup Owner',
        contactEmail: `diff_${uniqueId}@testcabz.com`,
        contactPhone: testPhone1, // Duplicate!
        city: 'Chennai',
        state: 'Tamil Nadu',
        termsConsent: true,
      });

      await submitFleetRegistration(req, res);
      assert(
        res.getStatusCode() === 409 && res.getResponseData()?.message === 'This phone number is already registered.',
        '1.6 Rejects duplicate phone number with exact message'
      );
    }

    // 1.7 Duplicate GSTIN check
    {
      const { req, res } = createMockReqRes({
        fleetName: `Fleet Dup GST ${uniqueId}`,
        businessCode: `G${uniqueId.slice(-3)}`,
        ownerName: 'Dup Owner',
        contactEmail: `diff_gst_${uniqueId}@testcabz.com`,
        contactPhone: `92${Math.floor(10000000 + Math.random() * 90000000)}`,
        gstin: testGstin1, // Duplicate!
        city: 'Chennai',
        state: 'Tamil Nadu',
        termsConsent: true,
      });

      await submitFleetRegistration(req, res);
      assert(
        res.getStatusCode() === 409 && res.getResponseData()?.message === 'This GST number is already registered.',
        '1.7 Rejects duplicate GST number with exact message'
      );
    }

    // 1.8 Duplicate PAN check
    {
      const { req, res } = createMockReqRes({
        fleetName: `Fleet Dup PAN ${uniqueId}`,
        businessCode: `A${uniqueId.slice(-3)}`,
        ownerName: 'Dup Owner',
        contactEmail: `diff_pan_${uniqueId}@testcabz.com`,
        contactPhone: `93${Math.floor(10000000 + Math.random() * 90000000)}`,
        panNumber: testPan1, // Duplicate!
        city: 'Chennai',
        state: 'Tamil Nadu',
        termsConsent: true,
      });

      await submitFleetRegistration(req, res);
      assert(
        res.getStatusCode() === 409 && res.getResponseData()?.message === 'This PAN number is already registered.',
        '1.8 Rejects duplicate PAN number with exact message'
      );
    }

    // =========================================================================
    // SECTION 2: SUBSCRIPTION LOCK STATUS EVALUATION (CASES A, B, C, D)
    // =========================================================================
    console.log('\n--- SECTION 2: SUBSCRIPTION LOCK STATUS EVALUATION ---');

    const testTenantId = uuidv4();
    await Tenant.create({
      tenantId: testTenantId,
      name: `Test Mobility Fleet ${uniqueId}`,
      code: `T${uniqueId.slice(-4)}`,
      status: 'ACTIVE',
      planTier: 'PRO',
      contactEmail: `tenant_${uniqueId}@testcabz.com`,
      contactPhone: '9876543210',
    });

    // 2.1 Case B — Expired Free Trial with No Paid Invoice
    {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      await TenantSubscription.create({
        subscriptionId: uuidv4(),
        tenantId: testTenantId,
        planTier: 'PRO',
        status: 'TRIALING',
        agreedPrice: 349,
        trialEndsAt: pastDate,
        currentPeriodEnd: pastDate,
      });

      const lockEval = await evaluateTenantSubscriptionLock(testTenantId, false);
      assert(
        lockEval.isLocked === true &&
        (lockEval.lockReason === 'EXPIRED' || lockEval.lockReason === 'PAYMENT_PENDING' || lockEval.lockReason === 'TRIAL_EXPIRED') &&
        (lockEval.subscriptionStatus === 'TRIAL_EXPIRED' || lockEval.subscriptionStatus === 'PENDING_PAYMENT') &&
        lockEval.payableAmount === 411.82,
        '2.1 Case B (Trial Expired): Evaluates to locked with payable amount 411.82 (349 + 18% GST)'
      );

      // Verify operational API middleware blocks Case B with 403
      let nextCalled = false;
      const { req, res } = createMockReqRes({}, {}, {}, { tenantId: testTenantId, role: 'fleet_admin' });
      await requireSubscriptionAccess(req, res, () => { nextCalled = true; });

      assert(
        !nextCalled && res.getStatusCode() === 403 && res.getResponseData()?.code === 'SUBSCRIPTION_PAYMENT_REQUIRED',
        '2.1b requireSubscriptionAccess blocks operational request with 403 SUBSCRIPTION_PAYMENT_REQUIRED'
      );
    }

    // 2.2 Case A — Active & Paid Subscription
    {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      // Create a paid invoice and set subscription to ACTIVE
      await SubscriptionInvoice.create({
        subscriptionInvoiceId: uuidv4(),
        tenantId: testTenantId,
        invoiceNumber: `SUB-TEST-${uniqueId}`,
        planTier: 'PRO',
        billingCycle: 'MONTHLY',
        baseAmount: 349,
        taxAmount: 62.82,
        totalAmount: 411.82,
        paymentStatus: 'PAID',
        paidAt: now,
        billingPeriodStart: now,
        billingPeriodEnd: futureDate,
        transactionReference: `TXN_TEST_${Date.now()}`,
      });

      const sub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
      await sub?.update({
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: futureDate,
      });

      const lockEval = await evaluateTenantSubscriptionLock(testTenantId, false);
      assert(
        lockEval.isLocked === false &&
        lockEval.lockReason === 'NONE' &&
        (lockEval.subscriptionStatus === 'ACTIVE' || lockEval.subscriptionStatus === 'ACTIVE_PAID'),
        '2.2 Case A (Active & Paid): Evaluates to unlocked with full access'
      );

      // Verify operational API middleware allows access
      let nextCalled: boolean = false;
      const { req, res } = createMockReqRes({}, {}, {}, { tenantId: testTenantId, role: 'fleet_admin' });
      await requireSubscriptionAccess(req, res, () => { nextCalled = true; });

      assert(
        nextCalled,
        '2.2b requireSubscriptionAccess allows request through for Active & Paid fleet'
      );
    }

    // 2.3 Case C — Subscription Expired
    {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2); // 2 days ago

      const sub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
      await sub?.update({
        currentPeriodEnd: pastDate,
      });

      const lockEval = await evaluateTenantSubscriptionLock(testTenantId, false);
      assert(
        lockEval.isLocked === true &&
        lockEval.lockReason === 'EXPIRED' &&
        lockEval.subscriptionStatus === 'EXPIRED',
        '2.3 Case C (Subscription Expired): Evaluates to locked with EXPIRED reason'
      );

      let nextCalled = false;
      const { req, res } = createMockReqRes({}, {}, {}, { tenantId: testTenantId, role: 'fleet_admin' });
      await requireSubscriptionAccess(req, res, () => { nextCalled = true; });

      assert(
        !nextCalled && res.getStatusCode() === 403 && res.getResponseData()?.lockReason === 'EXPIRED',
        '2.3b requireSubscriptionAccess blocks expired fleet with 403'
      );
    }

    // 2.4 Case D — Suspended Subscription
    {
      const sub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
      await sub?.update({
        status: 'SUSPENDED',
      });

      const lockEval = await evaluateTenantSubscriptionLock(testTenantId, false);
      assert(
        lockEval.isLocked === true &&
        lockEval.lockReason === 'SUSPENDED' &&
        lockEval.subscriptionStatus === 'SUSPENDED',
        '2.4 Case D (Suspended): Evaluates to locked with SUSPENDED reason'
      );

      let nextCalled = false;
      const { req, res } = createMockReqRes({}, {}, {}, { tenantId: testTenantId, role: 'fleet_admin' });
      await requireSubscriptionAccess(req, res, () => { nextCalled = true; });

      assert(
        !nextCalled && res.getStatusCode() === 403 && res.getResponseData()?.lockReason === 'SUSPENDED',
        '2.4b requireSubscriptionAccess blocks suspended fleet with 403'
      );
    }

    // =========================================================================
    // SECTION 3: SUPERADMIN UNRESTRICTED ACCESS
    // =========================================================================
    console.log('\n--- SECTION 3: SUPERADMIN ACCESS IMMUNITY ---');

    {
      // Even if evaluated against a suspended tenant or root tenant, SuperAdmin is NEVER locked
      const superAdminLockEval = await evaluateTenantSubscriptionLock(ROOT_TENANT_ID, true);
      assert(
        superAdminLockEval.isLocked === false && superAdminLockEval.lockReason === 'NONE',
        '3.1 SuperAdmin evaluation is never locked'
      );

      let nextCalled: boolean = false;
      const { req, res } = createMockReqRes({}, {}, {}, {
        tenantId: testTenantId, // Calling an endpoint under a suspended tenant
        role: 'superadmin',
        user: { role: 'superadmin' },
      });
      await requireSubscriptionAccess(req, res, () => { nextCalled = true; });

      assert(
        nextCalled,
        '3.2 requireSubscriptionAccess immediately permits SuperAdmin regardless of tenant subscription state'
      );
    }

    // =========================================================================
    // SECTION 4: PAYMENT VERIFICATION UNLOCKS FLEET
    // =========================================================================
    console.log('\n--- SECTION 4: CHECKOUT AND PAYMENT VERIFICATION ---');

    {
      // Put tenant back to TRIALING
      const sub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
      await sub?.update({ status: 'TRIALING' });

      // Run checkout
      const { req: checkoutReq, res: checkoutRes } = createMockReqRes(
        { planTier: 'PRO', billingCycle: 'MONTHLY' },
        {},
        {},
        { tenantId: testTenantId, role: 'fleet_admin' }
      );
      await createSubscriptionCheckout(checkoutReq, checkoutRes);

      const invoice = checkoutRes.getResponseData()?.data?.invoice;
      const invoiceId = invoice?.subscriptionInvoiceId;
      assert(
        checkoutRes.getStatusCode() === 201 && Boolean(invoiceId),
        '4.1 Subscription checkout creates valid invoice successfully'
      );

      // Run payment verification
      const { req: verifyReq, res: verifyRes } = createMockReqRes(
        {
          subscriptionInvoiceId: invoiceId,
          isSimulated: true,
          transactionReference: `TXN_VERIFY_${Date.now()}`,
        },
        {},
        {},
        { tenantId: testTenantId, role: 'fleet_admin' }
      );
      await verifySubscriptionPayment(verifyReq, verifyRes);

      assert(
        verifyRes.getStatusCode() === 200 && verifyRes.getResponseData()?.success === true,
        '4.2 Server-side payment verification succeeds and updates invoice to PAID'
      );

      // Verify lock is now cleared
      const lockEvalAfterPayment = await evaluateTenantSubscriptionLock(testTenantId, false);
      assert(
        lockEvalAfterPayment.isLocked === false,
        '4.3 Fleet subscription is now unlocked and ACTIVE after payment'
      );
    }

  } catch (error: any) {
    console.error('Test suite error:', error);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`📊 FINAL RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
