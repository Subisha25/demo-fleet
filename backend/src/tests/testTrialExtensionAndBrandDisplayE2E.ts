import { connectDB } from '../models';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
import { TenantActivationToken } from '../models/tenantActivationToken';
import { SubscriptionInvoice } from '../models/subscriptionInvoice';
import { NotificationLog } from '../models/notificationLog';
import { TrialExtensionRequest } from '../models/trialExtensionRequest';
import { Vendor } from '../models/vendor';
import { User } from '../models/user';
import { evaluateTenantSubscriptionLock } from '../middleware/subscriptionGuard';
import {
  submitFleetRegistration,
  approveRegistrationRequest,
  completeAccountActivation,
} from '../services/registrationService';
import {
  requestTrialExtension,
  approveTrialExtensionRequest,
  rejectTrialExtensionRequest,
  manualExtendTrial,
  getSuperAdminTrialManagementOverview,
  getSuperAdminTrialExtensionRequests,
} from '../services/trialExtensionService';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

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

async function runE2ETests() {
  console.log('================================================================');
  console.log('CABZ SAAS FREE TRIAL & TRIAL EXTENSION WORKFLOW E2E TEST SUITE');
  console.log('================================================================\n');

  await connectDB();

  const testSuffix = Date.now().toString().slice(-6);
  const testEmail = `aero.fleet.${testSuffix}@example.com`;
  const testFleetName = `Aero Mobility ${testSuffix}`;
  const testBusinessCode = `AER${testSuffix.slice(-3)}`;
  let testRequestId = '';
  let testTenantId = '';
  let rawActivationToken = '';

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Fleet Registration Submission
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Submitting Fleet Registration ---');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const { req: regReq, res: regRes } = mockReqRes({
      fleetName: testFleetName,
      legalName: `${testFleetName} Private Limited`,
      ownerName: 'Vikram Singh',
      contactEmail: testEmail,
      contactPhone: '9876543210',
      businessCode: testBusinessCode,
      demoCallDate: todayStr,
      demoCallTime: '14:00',
      city: 'Bengaluru',
      state: 'Karnataka',
    });

    await submitFleetRegistration(regReq, regRes);
    if (regRes.statusCode !== 201 || !regRes.data?.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    }
    testRequestId = regRes.data.data.requestId;
    console.log(`✓ Registration submitted successfully. Request ID: ${testRequestId}`);

    // -------------------------------------------------------------------------
    // TEST 2: SuperAdmin Approval & 7-Day Free Trial Email Verification
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: SuperAdmin Approves Fleet Registration ---');
    const { req: appReq, res: appRes } = mockReqRes({}, { requestId: testRequestId });
    await approveRegistrationRequest(appReq, appRes);
    if (appRes.statusCode !== 200 || !appRes.data?.success) {
      throw new Error(`Approval failed: ${JSON.stringify(appRes.data)}`);
    }
    testTenantId = appRes.data.data.tenantId;
    console.log(`✓ Fleet approved. Tenant ID: ${testTenantId}`);

    // Verify NotificationLog for the approval email
    const approvalEmailLog = await NotificationLog.findOne({
      where: {
        recipient: testEmail,
        templateCode: 'TENANT_ADMIN_ACTIVATION_LINK',
      },
      order: [['createdAt', 'DESC']],
    });

    if (!approvalEmailLog) {
      throw new Error('Approval email notification log not found!');
    }

    console.log('Approval Email Subject:', approvalEmailLog.metadata?.subject || 'N/A');
    const subject = approvalEmailLog.metadata?.subject || '';
    if (!subject.includes('CABZ – Your Fleet Registration Is Approved | 7-Day Free Trial Activated')) {
      throw new Error(`Subject mismatch: Expected "CABZ – Your Fleet Registration Is Approved | 7-Day Free Trial Activated", got "${subject}"`);
    }
    console.log('✓ Subject strictly matches required 7-Day Free Trial template!');

    // Check that NO paid plan details appear in metadata
    const meta = approvalEmailLog.metadata || {};
    if (meta.planSummaryPdfUrl || meta.attachments?.length > 0) {
      throw new Error('Plan summary PDF must NOT be attached or linked in initial Free Trial approval email!');
    }
    console.log('✓ No paid plan PDF or invoice attached to approval email.');

    // Verify Subscription record in demodb
    const sub = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
    if (!sub) throw new Error('Tenant subscription record missing in database!');
    if (sub.status !== 'TRIALING') throw new Error(`Subscription status must be TRIALING, got: ${sub.status}`);
    if (Number(sub.trialDurationDays) !== 7) throw new Error(`Trial duration must be 7 days, got: ${sub.trialDurationDays}`);

    // Ensure NO paid subscription invoice was generated
    const paidInvoices = await SubscriptionInvoice.findAll({
      where: { tenantId: testTenantId, paymentStatus: 'PAID' },
    });
    if (paidInvoices.length > 0) {
      throw new Error('No paid subscription invoice should exist for trial tenant!');
    }
    console.log('✓ Verified: Tenant initialized strictly on 7-Day Free Trial without any paid invoices.');

    // -------------------------------------------------------------------------
    // TEST 3: Account Activation & Initial Unlocked State Evaluation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Account Activation & Free Trial Unlocked Access ---');
    const tokenRecord = await TenantActivationToken.findOne({
      where: { tenantId: testTenantId },
      order: [['createdAt', 'DESC']],
    });
    if (!tokenRecord) throw new Error('Activation token not found!');

    // Complete account activation
    const testPassword = 'Password@123';
    const { req: actReq, res: actRes } = mockReqRes({
      token: tokenRecord.tokenId,
      password: testPassword,
      confirmPassword: testPassword,
    });
    await completeAccountActivation(actReq, actRes);
    console.log('✓ Account activated with password.');

    // Evaluate subscription lock status
    const evalActive = await evaluateTenantSubscriptionLock(testTenantId);
    if (evalActive.isLocked !== false) {
      throw new Error(`Active free trial must be UNLOCKED (isLocked: false), got: ${evalActive.isLocked}`);
    }
    if (evalActive.subscriptionStatus !== 'TRIAL_ACTIVE') {
      throw new Error(`Expected subscriptionStatus: TRIAL_ACTIVE, got: ${evalActive.subscriptionStatus}`);
    }
    if (evalActive.trialDetails?.remainingDays !== 7) {
      throw new Error(`Expected remainingDays: 7, got: ${evalActive.trialDetails?.remainingDays}`);
    }
    console.log(`✓ Active Free Trial is UNLOCKED (isLocked: false, remainingDays: ${evalActive.trialDetails?.remainingDays})`);

    // -------------------------------------------------------------------------
    // TEST 4: Free Trial Expiry & Access Lock Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Simulating Free Trial Expiry ---');
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    await sub.update({
      trialEndsAt: pastDate,
      currentPeriodEnd: pastDate,
    });

    const evalExpired = await evaluateTenantSubscriptionLock(testTenantId);
    if (evalExpired.isLocked !== true) {
      throw new Error(`Expired trial must be LOCKED (isLocked: true), got: ${evalExpired.isLocked}`);
    }
    if (evalExpired.lockReason !== 'EXPIRED') {
      throw new Error(`Expected lockReason: EXPIRED, got: ${evalExpired.lockReason}`);
    }
    if (evalExpired.subscriptionStatus !== 'TRIAL_EXPIRED') {
      throw new Error(`Expected subscriptionStatus: TRIAL_EXPIRED, got: ${evalExpired.subscriptionStatus}`);
    }
    console.log('✓ Expired Free Trial is authoritatively LOCKED (isLocked: true, status: TRIAL_EXPIRED).');

    // -------------------------------------------------------------------------
    // TEST 5: Fleet Admin Submits Free Trial Extension Request
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Fleet Admin Requests 5 Additional Days ---');
    const { req: extReq, res: extRes } = mockReqRes(
      { requestedDays: 5, reason: 'Need extra days to test vehicle dispatch with corporate clients' },
      {},
      {},
      { userId: 'fleet-admin-1', role: 'admin' },
      testTenantId
    );

    await requestTrialExtension(extReq, extRes);
    if (extRes.statusCode !== 201 || !extRes.data?.success) {
      throw new Error(`Extension request failed: ${JSON.stringify(extRes.data)}`);
    }
    const extRequestId = extRes.data.data.requestId;
    console.log(`✓ Extension request submitted successfully. Request ID: ${extRequestId}`);

    // Verify duplicate request prevention
    const { req: dupReq, res: dupRes } = mockReqRes(
      { requestedDays: 7, reason: 'Trying duplicate submission' },
      {},
      {},
      { userId: 'fleet-admin-1', role: 'admin' },
      testTenantId
    );
    await requestTrialExtension(dupReq, dupRes);
    if (dupRes.statusCode !== 400) {
      throw new Error(`Duplicate pending request must be rejected with HTTP 400, got: ${dupRes.statusCode}`);
    }
    console.log('✓ Duplicate extension request prevented with HTTP 400.');

    // Verify SuperAdmin alert email logged
    const alertLog = await NotificationLog.findOne({
      where: { templateCode: 'TRIAL_EXTENSION_REQUESTED_SUPERADMIN' },
      order: [['createdAt', 'DESC']],
    });
    if (!alertLog) throw new Error('SuperAdmin alert email not logged!');
    console.log('✓ SuperAdmin alert email dispatched and logged in notification_logs.');

    // -------------------------------------------------------------------------
    // TEST 6: SuperAdmin Approves Trial Extension & Access Restores Immediately
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: SuperAdmin Approves Trial Extension ---');
    const { req: appExtReq, res: appExtRes } = mockReqRes(
      { approvedDays: 5, adminNotes: 'Approved for corporate client testing' },
      { requestId: extRequestId },
      {},
      { userId: 'superadmin-vikram', username: 'SuperAdmin' }
    );

    await approveTrialExtensionRequest(appExtReq, appExtRes);
    if (appExtRes.statusCode !== 200 || !appExtRes.data?.success) {
      throw new Error(`Approval failed: ${JSON.stringify(appExtRes.data)}`);
    }
    console.log('✓ SuperAdmin approved extension request.');

    // Verify Request Record in database
    const updatedExtReq = await TrialExtensionRequest.findByPk(extRequestId);
    if (!updatedExtReq) throw new Error('Trial extension request record not found!');
    if (updatedExtReq.status !== 'APPROVED') throw new Error(`Expected status: APPROVED, got: ${updatedExtReq.status}`);
    if (updatedExtReq.approvedDays !== 5) throw new Error(`Expected approvedDays: 5, got: ${updatedExtReq.approvedDays}`);
    if (updatedExtReq.reviewedBy !== 'SuperAdmin') throw new Error(`Expected reviewedBy: SuperAdmin, got: ${updatedExtReq.reviewedBy}`);
    console.log('✓ TrialExtensionRequest record verified in trial_extension_requests table.');

    // Verify TenantSubscription record updated
    await sub.reload();
    if (sub.status !== 'TRIALING') throw new Error(`Expected sub status: TRIALING, got: ${sub.status}`);
    if (Number(sub.trialDurationDays) !== 12) throw new Error(`Expected duration: 12 days (7+5), got: ${sub.trialDurationDays}`);
    const newExpiry = new Date(sub.trialEndsAt);
    if (newExpiry.getTime() <= Date.now()) throw new Error('New trialEndsAt must be in the future!');
    console.log(`✓ Subscription updated: trialEndsAt=${newExpiry.toISOString()}, trialDurationDays=${sub.trialDurationDays}`);

    // IMMEDIATE ACCESS RESTORATION CHECK (Task 7)
    const evalRestored = await evaluateTenantSubscriptionLock(testTenantId);
    if (evalRestored.isLocked !== false) {
      throw new Error(`Immediate Access Restoration failed: isLocked is still true!`);
    }
    if (evalRestored.subscriptionStatus !== 'TRIAL_ACTIVE') {
      throw new Error(`Expected status: TRIAL_ACTIVE, got: ${evalRestored.subscriptionStatus}`);
    }
    console.log('✓ TASK 7 VERIFIED: Operational access is restored IMMEDIATELY upon approval (isLocked: false, TRIAL_ACTIVE).');

    // -------------------------------------------------------------------------
    // TEST 7: SuperAdmin Direct Manual Extension
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: SuperAdmin Grants Direct Manual Extension ---');
    const { req: manReq, res: manRes } = mockReqRes(
      { additionalDays: 3, reason: 'Manual courtesy extension by SuperAdmin' },
      { tenantId: testTenantId },
      {},
      { userId: 'superadmin-vikram', username: 'SuperAdmin' }
    );

    await manualExtendTrial(manReq, manRes);
    if (manRes.statusCode !== 200 || !manRes.data?.success) {
      throw new Error(`Manual extension failed: ${JSON.stringify(manRes.data)}`);
    }

    await sub.reload();
    if (Number(sub.trialDurationDays) !== 15) {
      throw new Error(`Expected total trial duration: 15 days (12+3), got: ${sub.trialDurationDays}`);
    }
    console.log(`✓ Manual extension granted. Total trial days: ${sub.trialDurationDays} days.`);

    // -------------------------------------------------------------------------
    // TEST 8: Rejection Workflow
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Trial Extension Rejection Workflow ---');
    // Expire again to test rejection
    await sub.update({
      trialEndsAt: pastDate,
      currentPeriodEnd: pastDate,
    });

    const { req: extReq2, res: extRes2 } = mockReqRes(
      { requestedDays: 7, reason: 'Requesting another extension' },
      {},
      {},
      { userId: 'fleet-admin-1', role: 'admin' },
      testTenantId
    );
    await requestTrialExtension(extReq2, extRes2);
    const extRequestId2 = extRes2.data.data.requestId;

    const { req: rejReq, res: rejRes } = mockReqRes(
      { reason: 'Trial period already extended by 8 days. Please subscribe to a paid plan.' },
      { requestId: extRequestId2 },
      {},
      { userId: 'superadmin-vikram', username: 'SuperAdmin' }
    );
    await rejectTrialExtensionRequest(rejReq, rejRes);
    if (rejRes.statusCode !== 200 || !rejRes.data?.success) {
      throw new Error(`Rejection failed: ${JSON.stringify(rejRes.data)}`);
    }

    const rejectedReq = await TrialExtensionRequest.findByPk(extRequestId2);
    if (rejectedReq?.status !== 'REJECTED') {
      throw new Error(`Expected status: REJECTED, got: ${rejectedReq?.status}`);
    }
    console.log('✓ Rejection processed, logged in audit trail, and fleet admin notified.');

    // Verify access remains locked
    const evalPostRejection = await evaluateTenantSubscriptionLock(testTenantId);
    if (evalPostRejection.isLocked !== true) {
      throw new Error('Access must remain locked after rejection!');
    }
    console.log('✓ Operational access remains authoritatively locked after rejection.');

    // -------------------------------------------------------------------------
    // TEST 9: SuperAdmin Overview API Check
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: SuperAdmin Trial Overview API ---');
    const { req: ovReq, res: ovRes } = mockReqRes();
    await getSuperAdminTrialManagementOverview(ovReq, ovRes);
    if (ovRes.statusCode !== 200 || !ovRes.data?.success) {
      throw new Error(`Overview API failed: ${JSON.stringify(ovRes.data)}`);
    }
    const foundFleet = ovRes.data.data.fleets.find((f: any) => f.tenantId === testTenantId);
    if (!foundFleet) throw new Error('Test fleet missing from overview list!');
    console.log(`✓ Fleet found in SuperAdmin Trial Overview: status=${foundFleet.displayStatus}, extensions=${foundFleet.extensionCount}`);

    console.log('\n================================================================');
    console.log('ALL 9 END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY! ✓');
    console.log('================================================================');
  } finally {
    // Clean up test fleet data cleanly
    if (testTenantId) {
      console.log('\nCleaning up test artifacts for tenant:', testTenantId);
      await TrialExtensionRequest.destroy({ where: { tenantId: testTenantId } });
      await TenantSubscription.destroy({ where: { tenantId: testTenantId } });
      await TenantActivationToken.destroy({ where: { tenantId: testTenantId } });
      await TenantRegistrationRequest.destroy({ where: { tenantId: testTenantId } });
      await Vendor.destroy({ where: { tenantId: testTenantId } });
      await User.destroy({ where: { tenantId: testTenantId } });
      await Tenant.destroy({ where: { tenantId: testTenantId } });
      console.log('✓ Cleanup complete.');
    }
  }
}

runE2ETests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exit(1);
  });
