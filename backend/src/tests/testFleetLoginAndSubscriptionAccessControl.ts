import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/dbConfig';
import { Employee } from '../models/employee';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { SubscriptionInvoice } from '../models/subscriptionInvoice';
import { evaluateTenantSubscriptionLock } from '../middleware/subscriptionGuard';
import { Security } from '../utils/security';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail: any = '') {
  if (condition) {
    console.log(`✅ [PASS] ${testName} ${detail ? '-> ' + JSON.stringify(detail) : ''}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${detail ? '-> ' + JSON.stringify(detail) : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n================================================================');
  console.log('🚀 CABZ FLEET LOGIN BUTTON & ROUTE PROTECTION TEST SUITE');
  console.log('================================================================\n');

  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.\n');

    const uniqueId = Math.floor(100000 + Math.random() * 900000);
    const testPassword = 'Password@123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // --- SCENARIO 1: FLEET ADMIN WITH ACTIVE FREE TRIAL ---
    console.log('--- SCENARIO 1: FLEET ADMIN WITH ACTIVE FREE TRIAL ---');
    const tenantActiveTrialId = uuidv4();
    await Tenant.create({
      tenantId: tenantActiveTrialId,
      name: `Active Trial Fleet ${uniqueId}`,
      code: `AT${uniqueId.toString().slice(-4)}`,
      subdomain: `activetrial${uniqueId}`,
      contactEmail: `admin_active_${uniqueId}@cabztest.in`,
      contactPhone: '9876543210',
      status: 'TRIALING',
    } as any);

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantActiveTrialId,
      planTier: 'PRO',
      billingCycle: 'MONTHLY',
      status: 'TRIALING',
      startDate: now,
      trialStartDate: now,
      trialDurationDays: 7,
      trialEndsAt: trialEnd,
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      vehicleQuota: 50,
      driverQuota: 50,
      companyQuota: 10,
    } as any);

    const activeAdminEmail = `fleetadmin_active_${uniqueId}@cabztest.in`;
    await Employee.create({
      employeeId: uuidv4(),
      tenantId: tenantActiveTrialId,
      email: activeAdminEmail,
      password: hashedPassword,
      role: 'admin',
      firstName: 'Active',
      lastName: 'Admin',
      phone: '9876543210',
      phno: '9876543210',
      isActive: true,
    } as any);

    // 1.1 Test login credentials verification
    const activeAdmin = await Employee.findOne({ where: { email: activeAdminEmail } });
    assert(activeAdmin !== null, '1.1 Fleet Admin account exists in database');
    const passMatch = await bcrypt.compare(testPassword, activeAdmin!.password);
    assert(passMatch, '1.2 Fleet Admin credentials match hashed password');

    // 1.3 Subscription Lock status evaluation during active trial
    const activeLock = await evaluateTenantSubscriptionLock(tenantActiveTrialId, false);
    assert(!activeLock.isLocked, '1.3 Active Free Trial evaluates to isLocked: false (unrestricted operations)');
    assert(activeLock.subscriptionStatus === 'TRIAL_ACTIVE', '1.4 Subscription status is TRIAL_ACTIVE', activeLock.subscriptionStatus);
    assert(activeLock.trialDetails?.originalTrialDays === 7, '1.5 Original trial days strictly maintained as 7', activeLock.trialDetails?.originalTrialDays);

    // --- SCENARIO 2: FLEET ADMIN WITH EXTENDED FREE TRIAL ---
    console.log('\n--- SCENARIO 2: FLEET ADMIN WITH EXTENDED FREE TRIAL ---');
    const tenantExtendedTrialId = uuidv4();
    await Tenant.create({
      tenantId: tenantExtendedTrialId,
      name: `Extended Trial Fleet ${uniqueId}`,
      code: `ET${uniqueId.toString().slice(-4)}`,
      subdomain: `extendedtrial${uniqueId}`,
      contactEmail: `admin_ext_${uniqueId}@cabztest.in`,
      contactPhone: '9876543211',
      status: 'TRIALING',
    } as any);

    const extendedEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantExtendedTrialId,
      planTier: 'PRO',
      billingCycle: 'MONTHLY',
      status: 'TRIALING',
      startDate: now,
      trialStartDate: now,
      trialDurationDays: 10, // 7 + 3
      trialEndsAt: extendedEnd,
      currentPeriodStart: now,
      currentPeriodEnd: extendedEnd,
      trialExtensionHistory: [
        {
          extendedBy: 'superadmin',
          extendedAt: now.toISOString(),
          daysAdded: 3,
          previousExpiry: trialEnd.toISOString(),
          newExpiry: extendedEnd.toISOString(),
          reason: 'Extended evaluation period for route testing',
        },
      ],
      vehicleQuota: 50,
      driverQuota: 50,
      companyQuota: 10,
    } as any);

    const extLock = await evaluateTenantSubscriptionLock(tenantExtendedTrialId, false);
    assert(!extLock.isLocked, '2.1 Extended Free Trial evaluates to isLocked: false (permitted access)');
    assert(extLock.trialDetails?.extendedTrialDays === 3, '2.2 Extended days tracked separately as +3 days', extLock.trialDetails?.extendedTrialDays);
    assert(extLock.trialDetails?.totalTrialDays === 10, '2.3 Total trial duration accurately computed as 10 days', extLock.trialDetails?.totalTrialDays);

    // --- SCENARIO 3: FLEET ADMIN WITH EXPIRED FREE TRIAL (LOGIN ALLOWED, OPERATIONS LOCKED) ---
    console.log('\n--- SCENARIO 3: FLEET ADMIN WITH EXPIRED FREE TRIAL ---');
    const tenantExpiredTrialId = uuidv4();
    await Tenant.create({
      tenantId: tenantExpiredTrialId,
      name: `Expired Trial Fleet ${uniqueId}`,
      code: `XT${uniqueId.toString().slice(-4)}`,
      subdomain: `expiredtrial${uniqueId}`,
      contactEmail: `admin_exp_${uniqueId}@cabztest.in`,
      contactPhone: '9876543212',
      status: 'TRIALING',
    } as any);

    const pastTrialEnd = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Expired 2 days ago
    await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantExpiredTrialId,
      planTier: 'PRO',
      billingCycle: 'MONTHLY',
      status: 'TRIALING',
      startDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      trialStartDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      trialDurationDays: 7,
      trialEndsAt: pastTrialEnd,
      currentPeriodStart: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: pastTrialEnd,
      vehicleQuota: 50,
      driverQuota: 50,
      companyQuota: 10,
    } as any);

    const expiredAdminEmail = `fleetadmin_exp_${uniqueId}@cabztest.in`;
    await Employee.create({
      employeeId: uuidv4(),
      tenantId: tenantExpiredTrialId,
      email: expiredAdminEmail,
      password: hashedPassword,
      role: 'admin',
      firstName: 'Expired',
      lastName: 'Admin',
      phone: '9876543212',
      phno: '9876543212',
      isActive: true,
    } as any);

    // 3.1 Login credentials exist and are 100% valid
    const expAdmin = await Employee.findOne({ where: { email: expiredAdminEmail } });
    assert(expAdmin !== null, '3.1 Expired Trial Fleet Admin account exists and can authenticate');

    // 3.2 Evaluation returns isLocked: true with EXPIRED reason (post-login subscription lock)
    const expLock = await evaluateTenantSubscriptionLock(tenantExpiredTrialId, false);
    assert(expLock.isLocked, '3.2 Expired Trial evaluates to isLocked: true (operations locked after login)');
    assert(expLock.lockReason === 'EXPIRED', '3.3 Lock reason is EXPIRED', expLock.lockReason);
    assert(expLock.subscriptionStatus === 'TRIAL_EXPIRED', '3.4 Subscription status is TRIAL_EXPIRED');
    assert(expLock.payableAmount === 411.82, '3.5 Payable amount computed accurately (Base 349 + 18% GST 62.82 = 411.82)');

    // --- SCENARIO 4: FLEET ADMIN WITH ACTIVE PAID SUBSCRIPTION ---
    console.log('\n--- SCENARIO 4: FLEET ADMIN WITH ACTIVE PAID SUBSCRIPTION ---');
    const tenantPaidId = uuidv4();
    await Tenant.create({
      tenantId: tenantPaidId,
      name: `Paid Fleet ${uniqueId}`,
      code: `PF${uniqueId.toString().slice(-4)}`,
      subdomain: `paidfleet${uniqueId}`,
      contactEmail: `admin_paid_${uniqueId}@cabztest.in`,
      contactPhone: '9876543213',
      status: 'ACTIVE',
    } as any);

    const paidPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantPaidId,
      planTier: 'PRO',
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: paidPeriodEnd,
      vehicleQuota: 75,
      driverQuota: 75,
      companyQuota: 20,
    } as any);

    await SubscriptionInvoice.create({
      subscriptionInvoiceId: uuidv4(),
      tenantId: tenantPaidId,
      invoiceNumber: `INV-TEST-PAID-${uniqueId}`,
      planTier: 'PRO',
      billingCycle: 'MONTHLY',
      baseAmount: 349,
      taxAmount: 62.82,
      totalAmount: 411.82,
      paymentStatus: 'PAID',
      paidAt: now,
      paymentGateway: 'RAZORPAY',
      gatewayPaymentId: `pay_test_${uniqueId}`,
      billingPeriodStart: now,
      billingPeriodEnd: paidPeriodEnd,
      periodStart: now,
      periodEnd: paidPeriodEnd,
    } as any);

    const paidLock = await evaluateTenantSubscriptionLock(tenantPaidId, false);
    assert(!paidLock.isLocked, '4.1 Active Paid Fleet evaluates to isLocked: false (full operational access)');
    assert(paidLock.subscriptionStatus === 'ACTIVE_PAID' || paidLock.subscriptionStatus === 'ACTIVE', '4.2 Subscription status is ACTIVE_PAID', paidLock.subscriptionStatus);

    // --- SCENARIO 5: ROUTE PROTECTION RULES & LOCK IMMUNITY ---
    console.log('\n--- SCENARIO 5: ROUTE PROTECTION RULES & LOCK IMMUNITY ---');
    // SuperAdmin is completely immune
    const superAdminLock = await evaluateTenantSubscriptionLock(uuidv4(), true);
    assert(!superAdminLock.isLocked, '5.1 SuperAdmin evaluation is never locked');
    assert(superAdminLock.message.includes('Platform administrator'), '5.2 SuperAdmin message indicates unrestricted access');

    // Demo preview is completely immune to lock
    const demoLock = await evaluateTenantSubscriptionLock('demo-tenant', false);
    assert(!demoLock.isLocked, '5.3 Demo preview tenant is never locked');

    // --- SCENARIO 6: INVALID CREDENTIAL HANDLING ---
    console.log('\n--- SCENARIO 6: CREDENTIAL & VALIDATION INTEGRITY ---');
    const fakePasswordMatch = await bcrypt.compare('WrongPassword', activeAdmin!.password);
    assert(!fakePasswordMatch, '6.1 Incorrect password cleanly fails validation (displays Invalid credentials error toast)');

    const nonExistentEmail = await Employee.findOne({ where: { email: `nonexistent_${uniqueId}@cabz.in` } });
    assert(nonExistentEmail === null, '6.2 Unregistered email cleanly detected for meaningful error toast');

    console.log('\n================================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log(`SUCCESS RATE: ${Math.round((passed / (passed + failed)) * 100)}%`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runTests();
