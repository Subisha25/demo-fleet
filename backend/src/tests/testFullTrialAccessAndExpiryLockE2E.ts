import { connectDB } from '../models';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
import { TenantActivationToken } from '../models/tenantActivationToken';
import { SubscriptionInvoice } from '../models/subscriptionInvoice';
import { NotificationLog } from '../models/notificationLog';
import { TrialExtensionRequest } from '../models/trialExtensionRequest';
import { Vehicle } from '../models/vehicle';
import { Drivers } from '../models/drivers';
import { Company } from '../models/company';
import { Booking } from '../models/booking';
import {
  submitFleetRegistration,
  approveRegistrationRequest,
} from '../services/registrationService';
import {
  manualExtendTrial,
  approveTrialExtensionRequest,
  requestTrialExtension,
} from '../services/trialExtensionService';
import {
  createSubscriptionCheckout,
  verifySubscriptionPayment,
} from '../services/subscriptionBillingService';
import {
  isTenantInActiveFreeTrial,
  isSubscriptionExpired,
  checkVehicleQuota,
  checkDriverQuota,
  checkCompanyQuota,
  checkBookingQuota,
  getOrCreateSubscription,
} from '../services/quotaService';
import {
  requireVehicleQuota,
  requireDriverQuota,
  requireCompanyQuota,
  requireBookingQuota,
  requirePaidForModification,
} from '../middleware/entitlementMiddleware';
import { runWithTenantContext } from '../context/tenantContext';
import { v4 as uuidv4 } from 'uuid';

function mockReqRes(body: any = {}, params: any = {}, query: any = {}, user: any = null, tenantId?: string) {
  const req: any = {
    body,
    params,
    query,
    headers: {},
    user: user || { userId: 'e7b8a1c0-superadmin', role: 'superadmin', username: 'SuperAdmin' },
    tenantId: tenantId || null,
  };
  const res: any = {
    statusCode: 200,
    data: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.data = payload;
      return this;
    },
  };
  return { req, res };
}

async function runTest() {
  console.log('========================================================================');
  console.log('CABZ – FULL 7-DAY FREE TRIAL ACCESS & EXPIRY LOCK VERIFICATION SUITE');
  console.log('========================================================================\n');

  await connectDB();

  const testSuffix = Date.now().toString().slice(-6);
  const testEmail = `fleet.trial.${testSuffix}@example.com`;
  const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`;
  const testFleetName = `Trial Fleet ${testSuffix}`;
  const testBusinessCode = `TR${testSuffix.slice(-3)}`;
  let testRequestId = '';
  let testTenantId = '';

  try {
    // -------------------------------------------------------------------------
    // STAGE 1: Fleet Registration with 7-Day Free Trial Info & Demo Call
    // -------------------------------------------------------------------------
    console.log('>>> STAGE 1: Fleet Registration Submission <<<');
    const now = new Date();
    const demoDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const { req: regReq, res: regRes } = mockReqRes({
      fleetName: testFleetName,
      legalName: `${testFleetName} Private Limited`,
      ownerName: 'Sunil Verma',
      contactEmail: testEmail,
      contactPhone: testPhone,
      businessCode: testBusinessCode,
      requestedPlanTier: 'PRO',
      billingCycle: 'MONTHLY',
      demoCallDate: demoDateStr,
      demoCallTime: '11:00 AM',
      city: 'Hyderabad',
      state: 'Telangana',
    });

    await submitFleetRegistration(regReq, regRes);
    if (regRes.statusCode !== 201 || !regRes.data?.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    }
    testRequestId = regRes.data.data.requestId;
    console.log(`✓ Registration created successfully. Request ID: ${testRequestId}`);

    // Verify registration request in DB
    const regRecord = await TenantRegistrationRequest.findByPk(testRequestId);
    if (!regRecord) throw new Error('Registration record not found in DB');
    if (regRecord.requestedPlanTier !== 'PRO') {
      throw new Error(`Expected requestedPlanTier PRO, got ${regRecord.requestedPlanTier}`);
    }
    console.log(`✓ DB verified: requestedPlanTier=${regRecord.requestedPlanTier}, demoCallDate=${regRecord.demoCallDate}`);

    // -------------------------------------------------------------------------
    // STAGE 2: SuperAdmin Approval & 7-Day Free Trial Activation
    // -------------------------------------------------------------------------
    console.log('\n>>> STAGE 2: SuperAdmin Approval & 7-Day Free Trial Activation <<<');
    const { req: appReq, res: appRes } = mockReqRes({}, { requestId: testRequestId });
    await approveRegistrationRequest(appReq, appRes);
    if (appRes.statusCode !== 200 || !appRes.data?.success) {
      throw new Error(`Approval failed: ${JSON.stringify(appRes.data)}`);
    }
    testTenantId = appRes.data.data.tenantId;
    console.log(`✓ Fleet approved. Tenant ID: ${testTenantId}`);

    // Verify TenantSubscription has TRIALING status and 7-day duration
    const sub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
    if (!sub) throw new Error('TenantSubscription record not found after approval');
    if (sub.status !== 'TRIALING') throw new Error(`Expected sub.status TRIALING, got ${sub.status}`);
    if (sub.trialDurationDays !== 7) throw new Error(`Expected trialDurationDays 7, got ${sub.trialDurationDays}`);
    if (!sub.trialStartDate) throw new Error('trialStartDate is missing');
    if (!sub.trialEndsAt) throw new Error('trialEndsAt is missing');

    const durationMs = new Date(sub.trialEndsAt).getTime() - new Date(sub.trialStartDate).getTime();
    const durationDays = Math.round(durationMs / (24 * 60 * 60 * 1000));
    if (durationDays !== 7) throw new Error(`Calculated trial days expected 7, got ${durationDays}`);

    console.log(`✓ DB verified: status=${sub.status}, planTier=${sub.planTier}, trialDurationDays=${sub.trialDurationDays}`);
    console.log(`  Trial Start: ${sub.trialStartDate}`);
    console.log(`  Trial Ends:  ${sub.trialEndsAt}`);
    console.log(`  Vehicle Quota: ${sub.vehicleQuota}, Driver Quota: ${sub.driverQuota}, Trip Quota: ${sub.monthlyTripQuota}`);

    // -------------------------------------------------------------------------
    // STAGE 3: Active Free Trial Entitlement & Full Operational Access
    // -------------------------------------------------------------------------
    console.log('\n>>> STAGE 3: Active Free Trial Full Operational Access <<<');
    // Test 3.1: isTenantInActiveFreeTrial helper
    const isTrialActive = isTenantInActiveFreeTrial(sub);
    if (!isTrialActive) throw new Error('isTenantInActiveFreeTrial(sub) returned false for active trial!');
    console.log('✓ isTenantInActiveFreeTrial(sub) returned true');

    const isExpired = isSubscriptionExpired(sub);
    if (isExpired) throw new Error('isSubscriptionExpired(sub) returned true for active trial!');
    console.log('✓ isSubscriptionExpired(sub) returned false');

    // Test 3.2: Modification middleware allows edits/deletes during trial (NO RESTRICTED_FREE_ACCESS)
    await runWithTenantContext({ tenantId: testTenantId, tenantCode: testBusinessCode, isPlatformSuperAdmin: false }, async () => {
      const { req: modReq, res: modRes } = mockReqRes({}, {}, {}, { role: 'fleetadmin', tenantId: testTenantId }, testTenantId);
      let modNextCalled = false;
      await requirePaidForModification(modReq, modRes, () => {
        modNextCalled = true;
      });

      if (!modNextCalled || modRes.statusCode === 403) {
        throw new Error(`requirePaidForModification incorrectly blocked active free trial: ${JSON.stringify(modRes.data)}`);
      }
      console.log('✓ requirePaidForModification allowed operation during active 7-day free trial (no 403 restriction)');

      // Test 3.3: Quota checks allow multiple records (NOT capped to 1 record)
      const vQuota = await checkVehicleQuota(testTenantId);
      if (!vQuota.allowed || vQuota.max !== 75) {
        throw new Error(`checkVehicleQuota failed during active trial: ${JSON.stringify(vQuota)}`);
      }
      console.log(`✓ checkVehicleQuota allowed. Max: ${vQuota.max} vehicles (PRO plan quota, NOT 1-record allowance)`);

      const dQuota = await checkDriverQuota(testTenantId);
      if (!dQuota.allowed || dQuota.max !== 75) {
        throw new Error(`checkDriverQuota failed during active trial: ${JSON.stringify(dQuota)}`);
      }
      console.log(`✓ checkDriverQuota allowed. Max: ${dQuota.max} drivers (PRO plan quota)`);

      const cQuota = await checkCompanyQuota(testTenantId);
      if (!cQuota.allowed || cQuota.max !== 20) {
        throw new Error(`checkCompanyQuota failed during active trial: ${JSON.stringify(cQuota)}`);
      }
      console.log(`✓ checkCompanyQuota allowed. Max: ${cQuota.max} companies (PRO plan quota)`);

      const bQuota = await checkBookingQuota(testTenantId);
      if (!bQuota.allowed || bQuota.max !== 250) {
        throw new Error(`checkBookingQuota failed during active trial: ${JSON.stringify(bQuota)}`);
      }
      console.log(`✓ checkBookingQuota allowed. Max: ${bQuota.max} bookings (PRO plan quota)`);

      // Test 3.4: Middleware passes for quota endpoints
      const { req: vReq, res: vRes } = mockReqRes({}, {}, {}, { role: 'fleetadmin', tenantId: testTenantId }, testTenantId);
      let vNextCalled = false;
      await requireVehicleQuota(vReq, vRes, () => { vNextCalled = true; });
      if (!vNextCalled) throw new Error('requireVehicleQuota middleware blocked active trial creation!');
      console.log('✓ requireVehicleQuota middleware passed');

      const { req: bReq, res: bRes } = mockReqRes({}, {}, {}, { role: 'fleetadmin', tenantId: testTenantId }, testTenantId);
      let bNextCalled = false;
      await requireBookingQuota(bReq, bRes, () => { bNextCalled = true; });
      if (!bNextCalled) throw new Error('requireBookingQuota middleware blocked active trial booking!');
      console.log('✓ requireBookingQuota middleware passed');
    });

    // -------------------------------------------------------------------------
    // STAGE 4: Trial Expiry Locking Verification
    // -------------------------------------------------------------------------
    console.log('\n>>> STAGE 4: Trial Expiry Locking (When trialEndsAt < now) <<<');
    // Simulate expired trial by updating trialEndsAt to 1 hour in the past
    const pastTime = new Date(Date.now() - 3600 * 1000);
    await sub.update({
      trialEndsAt: pastTime,
      currentPeriodEnd: pastTime,
    });
    const reloadedSub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
    if (!reloadedSub) throw new Error('Reloading sub failed');

    const isTrialActiveExpired = isTenantInActiveFreeTrial(reloadedSub);
    if (isTrialActiveExpired) throw new Error('isTenantInActiveFreeTrial returned true for expired trial!');
    console.log('✓ isTenantInActiveFreeTrial(reloadedSub) correctly returned false after expiry');

    const isExpiredAfter = isSubscriptionExpired(reloadedSub);
    if (!isExpiredAfter) throw new Error('isSubscriptionExpired(reloadedSub) returned false for expired trial!');
    console.log('✓ isSubscriptionExpired(reloadedSub) correctly returned true after expiry');

    // Test that requirePaidForModification blocks modification with 403 SUBSCRIPTION_EXPIRED
    await runWithTenantContext({ tenantId: testTenantId, tenantCode: testBusinessCode, isPlatformSuperAdmin: false }, async () => {
      const { req: modExpReq, res: modExpRes } = mockReqRes({}, {}, {}, { role: 'fleetadmin', tenantId: testTenantId }, testTenantId);
      let modExpNextCalled = false;
      await requirePaidForModification(modExpReq, modExpRes, () => { modExpNextCalled = true; });

      if (modExpNextCalled || modExpRes.statusCode !== 403 || modExpRes.data?.code !== 'SUBSCRIPTION_EXPIRED') {
        throw new Error(`requirePaidForModification failed to lock expired trial: status=${modExpRes.statusCode}, body=${JSON.stringify(modExpRes.data)}`);
      }
      console.log('✓ requirePaidForModification strictly locked modification on expired trial with HTTP 403 SUBSCRIPTION_EXPIRED');

      // Test that requireVehicleQuota blocks creation with 403 SUBSCRIPTION_EXPIRED
      const { req: vExpReq, res: vExpRes } = mockReqRes({}, {}, {}, { role: 'fleetadmin', tenantId: testTenantId }, testTenantId);
      let vExpNextCalled = false;
      await requireVehicleQuota(vExpReq, vExpRes, () => { vExpNextCalled = true; });

      if (vExpNextCalled || vExpRes.statusCode !== 403 || vExpRes.data?.code !== 'SUBSCRIPTION_EXPIRED') {
        throw new Error(`requireVehicleQuota failed to lock expired trial: status=${vExpRes.statusCode}, body=${JSON.stringify(vExpRes.data)}`);
      }
      console.log('✓ requireVehicleQuota strictly locked creation on expired trial with HTTP 403 SUBSCRIPTION_EXPIRED');
    });

    // -------------------------------------------------------------------------
    // STAGE 5: SuperAdmin Trial Extension Workflow
    // -------------------------------------------------------------------------
    console.log('\n>>> STAGE 5: SuperAdmin Trial Extension Workflow (+2 Days) <<<');
    // SuperAdmin extends trial by +2 days
    const { req: extReq, res: extRes } = mockReqRes(
      { additionalDays: 2, days: 2, reason: 'Extension approved for client demo', adminNotes: 'Extension approved for client demo' },
      { tenantId: testTenantId }
    );
    await manualExtendTrial(extReq, extRes);
    if (extRes.statusCode !== 200 || !extRes.data?.success) {
      throw new Error(`manualExtendTrial failed: ${JSON.stringify(extRes.data)}`);
    }
    console.log(`✓ SuperAdmin manualExtendTrial granted +2 days: ${extRes.data?.message}`);

    // Verify sub in DB has updated trialDurationDays = 9, trialEndsAt in future
    const extendedSub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
    if (!extendedSub) throw new Error('Extended sub not found');
    if (extendedSub.trialDurationDays !== 9) {
      throw new Error(`Expected trialDurationDays 9, got ${extendedSub.trialDurationDays}`);
    }
    const newEndMs = new Date(extendedSub.trialEndsAt).getTime();
    if (newEndMs <= Date.now()) {
      throw new Error(`trialEndsAt is not in the future after extension! ${extendedSub.trialEndsAt}`);
    }
    console.log(`✓ DB verified: trialDurationDays=${extendedSub.trialDurationDays}, new trialEndsAt=${extendedSub.trialEndsAt}`);

    // Verify access is IMMEDIATELY restored without re-login
    const isTrialRestored = isTenantInActiveFreeTrial(extendedSub);
    if (!isTrialRestored) throw new Error('isTenantInActiveFreeTrial returned false after trial extension!');
    console.log('✓ isTenantInActiveFreeTrial(extendedSub) immediately restored to TRUE');

    await runWithTenantContext({ tenantId: testTenantId, tenantCode: testBusinessCode, isPlatformSuperAdmin: false }, async () => {
      const { req: modRestReq, res: modRestRes } = mockReqRes({}, {}, {}, { role: 'fleetadmin', tenantId: testTenantId }, testTenantId);
      let modRestNextCalled = false;
      await requirePaidForModification(modRestReq, modRestRes, () => { modRestNextCalled = true; });

      if (!modRestNextCalled || modRestRes.statusCode === 403) {
        throw new Error(`Modification still blocked after extension! ${JSON.stringify(modRestRes.data)}`);
      }
      console.log('✓ requirePaidForModification immediately allowed access after extension (no re-login required)');

      const { req: vRestReq, res: vRestRes } = mockReqRes({}, {}, {}, { role: 'fleetadmin', tenantId: testTenantId }, testTenantId);
      let vRestNextCalled = false;
      await requireVehicleQuota(vRestReq, vRestRes, () => { vRestNextCalled = true; });
      if (!vRestNextCalled) throw new Error('requireVehicleQuota still blocked after extension!');
      console.log('✓ requireVehicleQuota immediately allowed access after extension');
    });

    // -------------------------------------------------------------------------
    // STAGE 6: Subscription Payment & Permanent Unlock
    // -------------------------------------------------------------------------
    console.log('\n>>> STAGE 6: Paid Subscription Activation via Verified Payment <<<');
    let checkoutInvoiceId = '';
    await runWithTenantContext({ tenantId: testTenantId, tenantCode: testBusinessCode, isPlatformSuperAdmin: false }, async () => {
      // 1. Create Checkout
      const { req: chkReq, res: chkRes } = mockReqRes(
        { planTier: 'PRO', billingCycle: 'MONTHLY', paymentMethod: 'GATEWAY' },
        {},
        {},
        { role: 'fleetadmin', tenantId: testTenantId },
        testTenantId
      );
      await createSubscriptionCheckout(chkReq, chkRes);
      if (chkRes.statusCode !== 201 || !chkRes.data?.success) {
        throw new Error(`createSubscriptionCheckout failed: ${JSON.stringify(chkRes.data)}`);
      }
      checkoutInvoiceId = chkRes.data.data.invoice.subscriptionInvoiceId;
      console.log(`✓ Subscription checkout created. Invoice ID: ${checkoutInvoiceId}`);

      // 2. Verify Payment
      const { req: payReq, res: payRes } = mockReqRes(
        {
          subscriptionInvoiceId: checkoutInvoiceId,
          isSimulated: true,
          transactionReference: `SIM_TXN_${Date.now()}`,
        },
        {},
        {},
        { role: 'fleetadmin', tenantId: testTenantId },
        testTenantId
      );
      await verifySubscriptionPayment(payReq, payRes);
      if (payRes.statusCode !== 200 || !payRes.data?.success) {
        throw new Error(`verifySubscriptionPayment failed: ${JSON.stringify(payRes.data)}`);
      }
      console.log(`✓ Payment verified successfully: ${payRes.data.message}`);
    });

    // Verify sub is now ACTIVE
    const paidSub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
    if (!paidSub) throw new Error('Paid sub not found');
    if (paidSub.status !== 'ACTIVE') {
      throw new Error(`Expected paidSub.status ACTIVE, got ${paidSub.status}`);
    }
    console.log(`✓ DB verified: status=${paidSub.status}, planTier=${paidSub.planTier}, currentPeriodEnd=${paidSub.currentPeriodEnd}`);

    // Verify operations remain fully allowed under ACTIVE paid plan
    await runWithTenantContext({ tenantId: testTenantId, tenantCode: testBusinessCode, isPlatformSuperAdmin: false }, async () => {
      const { req: activeModReq, res: activeModRes } = mockReqRes({}, {}, {}, { role: 'fleetadmin', tenantId: testTenantId }, testTenantId);
      let activeNext = false;
      await requirePaidForModification(activeModReq, activeModRes, () => { activeNext = true; });
      if (!activeNext) throw new Error('Modification blocked under ACTIVE subscription!');
      console.log('✓ requirePaidForModification fully allowed under ACTIVE subscription');

      const { req: activeVReq, res: activeVRes } = mockReqRes({}, {}, {}, { role: 'fleetadmin', tenantId: testTenantId }, testTenantId);
      let activeVNext = false;
      await requireVehicleQuota(activeVReq, activeVRes, () => { activeVNext = true; });
      if (!activeVNext) throw new Error('Vehicle quota blocked under ACTIVE subscription!');
      console.log('✓ requireVehicleQuota fully allowed under ACTIVE subscription');
    });

    console.log('\n========================================================================');
    console.log('ALL 6 STAGES OF THE FREE TRIAL ACCESS & EXPIRY SUITE PASSED SUCCESSFULLY');
    console.log('========================================================================\n');
  } catch (error: any) {
    console.error('\n❌ E2E TEST FAILED:', error);
    process.exit(1);
  } finally {
    // Cleanup test tenant and associated records
    if (testTenantId) {
      try {
        await SubscriptionInvoice.destroy({ where: { tenantId: testTenantId } });
        await TenantSubscription.destroy({ where: { tenantId: testTenantId } });
        await TenantActivationToken.destroy({ where: { tenantId: testTenantId } });
        await Tenant.destroy({ where: { tenantId: testTenantId } });
        if (testRequestId) {
          await TenantRegistrationRequest.destroy({ where: { requestId: testRequestId } });
        }
        console.log(`[Cleaned up test tenant ${testTenantId}]`);
      } catch (cleanupErr) {
        console.warn('Cleanup warning:', cleanupErr);
      }
    }
    process.exit(0);
  }
}

runTest();
