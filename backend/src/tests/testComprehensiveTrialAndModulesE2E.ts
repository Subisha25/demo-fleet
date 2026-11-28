import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import http from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import app from '../app';
import {
  connectDB,
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
  TenantActivationToken,
  SubscriptionInvoice,
  TrialExtensionRequest,
  Company,
  User,
  Employee,
  Booking,
  Drivers,
  Vehicle,
  VehicleMaster,
  VehicleType,
  Vendor,
  Invoice,
  ClosePending,
  Payment,
  PaymentMode,
  PackageData,
  Tax,
  NotificationLog,
} from '../models';
import config from '../config/config';
import { ROOT_TENANT_ID, runWithTenantContext } from '../context/tenantContext';
import { ORDER } from '../utils/costants';
import {
  submitFleetRegistration,
  approveRegistrationRequest,
  completeAccountActivation,
} from '../services/registrationService';
import {
  requestTrialExtension,
  approveTrialExtensionRequest,
  manualExtendTrial,
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
  checkUserQuota,
  TRIAL_BASELINE_LIMITS,
} from '../services/quotaService';
import { evaluateTenantSubscriptionLock } from '../middleware/subscriptionGuard';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'jk23DFEo';
let server: http.Server;
let port: number;

function makeRequest(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ statusCode: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const payload = body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;
    const reqHeaders: Record<string, string> = {
      ...headers,
    };
    if (payload && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed: any = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode || 0,
            data: parsed,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

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

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ ${message}`);
  }
}

async function runComprehensiveTrialAndModulesSuite() {
  console.log('\n========================================================================');
  console.log('🚀 CABZ: COMPREHENSIVE FREE TRIAL AUDIT & ALL-MODULES OPERATIONAL SUITE');
  console.log('========================================================================\n');

  await connectDB();

  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address() as any;
      port = address.port;
      console.log(`📡 Live API test server running on ephemeral port ${port}`);
      resolve();
    });
  });

  const testSuffix = Date.now().toString().slice(-6);
  const getUniquePhone = () => `98${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`;
  const testEmail = `fleet.trial.${testSuffix}@cabzfleetops.in`;
  const testPhone = getUniquePhone();
  const testFleetName = `Trial Express ${testSuffix}`;
  const testBusinessCode = `TX${testSuffix.slice(-3)}`;
  let testRequestId = '';
  let testTenantId = '';
  let fleetAdminToken = '';
  let fleetAdminUserId = '';
  let testPassword = 'Password@123';

  // Created IDs for cleanup
  const cleanup: {
    tenantId?: string;
    requestId?: string;
    userIds: string[];
    employeeIds: string[];
    companyIds: string[];
    vehicleIds: string[];
    driverIds: string[];
    bookingIds: string[];
    invoiceIds: string[];
    closePendingIds: string[];
    paymentModeIds: string[];
    taxIds: string[];
  } = {
    userIds: [],
    employeeIds: [],
    companyIds: [],
    vehicleIds: [],
    driverIds: [],
    bookingIds: [],
    invoiceIds: [],
    closePendingIds: [],
    paymentModeIds: [],
    taxIds: [],
  };

  try {
    // =========================================================================
    // 1. REGISTRATION & APPROVAL AUDIT (NO DEFAULT PRO PLAN)
    // =========================================================================
    console.log('\n--- 1. Registration Submission: 7-Day Free Trial (₹0 Upfront) ---');
    const today = new Date();
    const demoDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const { req: regReq, res: regRes } = mockReqRes({
      fleetName: testFleetName,
      legalName: `${testFleetName} Pvt Ltd`,
      ownerName: 'Vikramaditya Sharma',
      contactEmail: testEmail,
      contactPhone: testPhone,
      businessCode: testBusinessCode,
      requestedPlanTier: 'FREE_TRIAL',
      billingCycle: 'MONTHLY',
      demoCallDate: demoDateStr,
      demoCallTime: '11:00 AM',
      city: 'Hyderabad',
      state: 'Telangana',
    });

    await submitFleetRegistration(regReq, regRes);
    assert(regRes.statusCode === 201 && regRes.data?.success, 'Fleet registration successfully created');
    testRequestId = regRes.data.data.requestId;
    cleanup.requestId = testRequestId;

    // Verify registration record in database
    const regRecord = await TenantRegistrationRequest.findByPk(testRequestId);
    assert(!!regRecord, 'Registration request found in database');
    assert(
      regRecord?.requestedPlanTier === 'FREE_TRIAL',
      `requestedPlanTier is strictly 'FREE_TRIAL' (not PRO, BASIC, or ENTERPRISE). Actual: ${regRecord?.requestedPlanTier}`
    );

    console.log('\n--- 2. SuperAdmin Approval & 7-Day Free Trial Provisioning ---');
    const { req: appReq, res: appRes } = mockReqRes({}, { requestId: testRequestId });
    await approveRegistrationRequest(appReq, appRes);
    assert(appRes.statusCode === 200 && appRes.data?.success, 'SuperAdmin approved registration request');

    testTenantId = appRes.data.data.tenantId;
    cleanup.tenantId = testTenantId;

    // Verify Tenant in database
    const tenantRecord = await Tenant.findByPk(testTenantId);
    assert(!!tenantRecord, 'Tenant record found in database');
    assert(
      tenantRecord?.planTier === null || tenantRecord?.planTier === 'FREE_TRIAL',
      `Tenant planTier is NULL or FREE_TRIAL (no paid plan selected). Actual: ${tenantRecord?.planTier}`
    );

    // Verify TenantSubscription in database
    const subRecord = await TenantSubscription.findOne({ where: { tenantId: testTenantId } });
    assert(!!subRecord, 'TenantSubscription record found');
    assert(subRecord?.status === 'TRIALING', `Subscription status is strictly 'TRIALING'. Actual: ${subRecord?.status}`);
    assert(
      subRecord?.planTier === null || subRecord?.planTier === 'FREE_TRIAL',
      `Subscription planTier is NULL or FREE_TRIAL (no paid plan assigned). Actual: ${subRecord?.planTier}`
    );
    assert(Number(subRecord?.agreedPrice || 0) === 0, `Subscription agreedPrice is 0. Actual: ${subRecord?.agreedPrice}`);
    assert(subRecord?.trialDurationDays === 7, `Trial duration is configured for 7 days. Actual: ${subRecord?.trialDurationDays}`);

    // Core Rule 1: Delayed Trial Start - SuperAdmin approval must NOT start the trial!
    assert(subRecord?.trialStartDate === null, `SuperAdmin approval does NOT start trial: trialStartDate is strictly NULL. Actual: ${subRecord?.trialStartDate}`);
    assert(subRecord?.trialEndsAt === null, `SuperAdmin approval does NOT set trial expiry: trialEndsAt is strictly NULL. Actual: ${subRecord?.trialEndsAt}`);
    assert(subRecord?.currentPeriodStart === null, `currentPeriodStart is strictly NULL before activation. Actual: ${subRecord?.currentPeriodStart}`);
    assert(subRecord?.currentPeriodEnd === null, `currentPeriodEnd is strictly NULL before activation. Actual: ${subRecord?.currentPeriodEnd}`);

    // Verify Subscription Lock Evaluation before activation
    const preActivationLock = await evaluateTenantSubscriptionLock(testTenantId);
    assert(preActivationLock.isLocked === false, 'Pre-activation account is not locked');
    assert(preActivationLock.subscriptionStatus === 'PENDING_ACTIVATION', `Lock evaluation status is 'PENDING_ACTIVATION'. Actual: ${preActivationLock.subscriptionStatus}`);
    assert(preActivationLock.trialDetails?.trialStatus === 'PENDING_ACTIVATION', `trialStatus is 'PENDING_ACTIVATION'. Actual: ${preActivationLock.trialDetails?.trialStatus}`);

    // Verify NO paid subscription invoice was created during approval
    const paidInvoices = await SubscriptionInvoice.findAll({ where: { tenantId: testTenantId } });
    assert(paidInvoices.length === 0, `No paid subscription invoice created during registration/approval (Count: ${paidInvoices.length})`);

    // Verify technical baseline quotas (TRIAL_BASELINE_LIMITS)
    assert(
      subRecord?.vehicleQuota === TRIAL_BASELINE_LIMITS.vehicles,
      `Internal technical vehicle safeguard is ${TRIAL_BASELINE_LIMITS.vehicles}. Actual: ${subRecord?.vehicleQuota}`
    );
    assert(
      subRecord?.driverQuota === TRIAL_BASELINE_LIMITS.drivers,
      `Internal technical driver safeguard is ${TRIAL_BASELINE_LIMITS.drivers}. Actual: ${subRecord?.driverQuota}`
    );
    assert(
      subRecord?.monthlyTripQuota === TRIAL_BASELINE_LIMITS.trips,
      `Internal technical trip safeguard is ${TRIAL_BASELINE_LIMITS.trips}. Actual: ${subRecord?.monthlyTripQuota}`
    );

    // -------------------------------------------------------------------------
    // Activate Account & Delayed Trial Start Verification
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Delayed Trial Start & Account Activation Verification ---');
    const tokenRecord = await TenantActivationToken.findOne({
      where: { tenantId: testTenantId },
      order: [['createdAt', 'DESC']],
    });
    assert(!!tokenRecord, 'Tenant activation token generated in database');
    assert(tokenRecord?.usedAt === null, 'Activation token is initially unused (usedAt: null)');

    const rawActivationToken = appRes.data?.data?.activationUrl ? appRes.data.data.activationUrl.split('token=')[1] : '';
    assert(Boolean(rawActivationToken), 'Raw activation token extracted from activationUrl');

    // 3.1 Verify Invalid Password attempt is rejected and does NOT start trial
    console.log('  Testing invalid password setup attempt...');
    const { req: badActReq, res: badActRes } = mockReqRes({
      token: rawActivationToken,
      password: '123', // too short
      confirmPassword: '123',
    });
    await completeAccountActivation(badActReq, badActRes);
    assert(badActRes.statusCode === 400, `Short password rejected with HTTP 400 (Actual: ${badActRes.statusCode})`);
    await subRecord!.reload();
    assert(subRecord!.trialStartDate === null, 'Trial did NOT start after failed password attempt');

    // 3.2 Successful Password Setup & Atomic Trial Activation
    console.log('  Testing valid password setup and atomic trial start...');
    const activationPreTimestamp = Date.now();
    const { req: actReq, res: actRes } = mockReqRes({
      token: rawActivationToken,
      password: testPassword,
      confirmPassword: testPassword,
    });
    await completeAccountActivation(actReq, actRes);
    assert(actRes.statusCode === 200 && actRes.data?.success, 'Account password set successfully');
    const activationPostTimestamp = Date.now();

    // Verify trial start and expiry dates in database
    await subRecord!.reload();
    assert(!!subRecord!.trialStartDate, 'trialStartDate is now populated');
    assert(!!subRecord!.trialEndsAt, 'trialEndsAt is now populated');

    const actStartMs = new Date(subRecord!.trialStartDate!).getTime();
    const actEndMs = new Date(subRecord!.trialEndsAt!).getTime();
    assert(
      actStartMs >= activationPreTimestamp - 2000 && actStartMs <= activationPostTimestamp + 2000,
      `trialStartDate matches exact activation timestamp (ActStart: ${actStartMs}, Pre: ${activationPreTimestamp}, Post: ${activationPostTimestamp})`
    );

    const effectiveDiffDays = Math.round((actEndMs - actStartMs) / (24 * 3600 * 1000));
    assert(effectiveDiffDays === 7, `Effective trial duration is exactly 7 days from activation (Actual: ${effectiveDiffDays} days)`);

    // Verify token is now marked used
    await tokenRecord!.reload();
    assert(tokenRecord!.usedAt !== null, 'Activation token marked used (usedAt is set)');

    // 3.3 Verify Token Reuse / Re-activation is rejected and cannot reset trial dates
    console.log('  Testing token reuse / repeat activation attempt...');
    const { req: reuseReq, res: reuseRes } = mockReqRes({
      token: rawActivationToken,
      password: 'NewPassword@123',
      confirmPassword: 'NewPassword@123',
    });
    await completeAccountActivation(reuseReq, reuseRes);
    assert(reuseRes.statusCode === 400, `Token reuse strictly rejected with HTTP 400 (Actual: ${reuseRes.statusCode})`);
    await subRecord!.reload();
    assert(
      new Date(subRecord!.trialStartDate!).getTime() === actStartMs,
      'Re-activation attempt did NOT reset or modify trialStartDate'
    );
    assert(
      new Date(subRecord!.trialEndsAt!).getTime() === actEndMs,
      'Re-activation attempt did NOT reset or modify trialEndsAt'
    );

    // Find the Fleet Admin employee record created during activation
    const adminEmp = await Employee.findOne({
      where: { tenantId: testTenantId },
    });
    assert(!!adminEmp, 'Fleet Admin employee found in database');
    fleetAdminUserId = adminEmp!.employeeId;
    cleanup.employeeIds.push(fleetAdminUserId);

    // Generate JWT token for Fleet Admin
    fleetAdminToken = jwt.sign(
      {
        userId: adminEmp!.employeeId,
        username: adminEmp!.username,
        role: 'fleet_admin',
        roles: 'fleet_admin',
        tenantId: testTenantId,
        email: adminEmp!.email,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    assert(!!fleetAdminToken, 'Fleet Admin JWT token generated');

    // Common auth headers for HTTP requests
    const authHeaders = {
      Authorization: `Bearer ${fleetAdminToken}`,
      'X-Tenant-ID': testTenantId,
    };

    // =========================================================================
    // 2. ACTIVE FREE TRIAL FULL OPERATIONAL ACCESS (ALL MODULES)
    // =========================================================================
    console.log('\n========================================================================');
    console.log('>>> MODULE-BY-MODULE ACTIVE FREE TRIAL OPERATIONAL VERIFICATION <<<');
    console.log('========================================================================');

    // -------------------------------------------------------------------------
    // MODULE A: Vehicle Operations (Add, Edit, Delete)
    // -------------------------------------------------------------------------
    console.log('\n--- Module A: Vehicle Operations (Add, Edit, Delete) ---');

    // Ensure a VehicleType exists
    let sedanType = await VehicleType.findOne({ where: { vehicleType: 'Sedan Standard' } });
    if (!sedanType) {
      sedanType = await VehicleType.create({
        vehicleTypeId: uuidv4(),
        vehicleType: 'Sedan Standard',
        category: 'SEDAN',
        seatCapacity: 4,
        isDeleted: false,
      });
    }

    // 1. Add Vehicle via API
    const createVehRes = await makeRequest(
      'POST',
      '/api/vendor/createVehicle',
      {
        vehicleName: 'Toyota Etios DL-01-AB-1234',
        vehicleNumber: 'DL-01-AB-1234',
        registrationNumber: 'DL-01-AB-1234',
        vehicleTypeId: sedanType.vehicleTypeId,
        manufacturing: 2023,
        fuelType: 'PETROL',
        availableStatus: 'AVAILABLE',
      },
      authHeaders
    );
    assert(createVehRes.statusCode === 201 || createVehRes.statusCode === 200, `POST /api/vendor/createVehicle returned HTTP ${createVehRes.statusCode}`);
    const createdVeh = createVehRes.data?.data || createVehRes.data?.vehicle || createVehRes.data;
    const testVehId = createdVeh?.vehicleId;
    assert(!!testVehId, 'Vehicle created with valid vehicleId');
    cleanup.vehicleIds.push(testVehId);

    // 2. Edit Vehicle via API
    const updateVehRes = await makeRequest(
      'PUT',
      `/api/vehicle/${testVehId}/updateVehicle`,
      {
        vehicleName: 'Toyota Etios DL-01-AB-1234 Updated',
        manufacturing: 2024,
      },
      authHeaders
    );
    assert(updateVehRes.statusCode === 200, `PUT /api/vehicle/${testVehId}/updateVehicle returned HTTP 200`);
    assert(!updateVehRes.data?.subscriptionRequired, 'No Subscription Required restriction on Vehicle Edit');

    // 3. Delete Vehicle via API
    const deleteVehRes = await makeRequest(
      'DELETE',
      `/api/vehicle/${testVehId}/deleteVehicle`,
      {},
      authHeaders
    );
    assert(deleteVehRes.statusCode === 200, `DELETE /api/vehicle/${testVehId}/deleteVehicle returned HTTP 200`);
    assert(!deleteVehRes.data?.subscriptionRequired, 'No Subscription Required restriction on Vehicle Delete');

    // Re-create vehicle for booking tests
    const activeVeh = await Vehicle.create({
      vehicleId: uuidv4(),
      vehicleName: 'Active Fleet Sedan',
      vehicleNumber: `TS-09-UB-${testSuffix}X`,
      vehicleTypeId: sedanType.vehicleTypeId,
      manufacturing: '2024',
      tenantId: testTenantId,
      availableStatus: 'AVAILABLE',
      isDeleted: false,
    });
    cleanup.vehicleIds.push(activeVeh.vehicleId);

    // -------------------------------------------------------------------------
    // MODULE B: Driver Operations (Add, Edit, Delete)
    // -------------------------------------------------------------------------
    console.log('\n--- Module B: Driver Operations (Add, Edit, Delete) ---');

    // 1. Add Driver via API
    const createDrvRes = await makeRequest(
      'POST',
      '/api/vendor/createDriver',
      {
        driverName: 'Ramesh Kumar',
        phno: getUniquePhone(),
        driverEmail: `ramesh.${testSuffix}@cabzfleetops.in`,
        licenseNo: `DL-${testSuffix}01`,
        password: 'Password@123',
        activeStatus: 'ACTIVE',
      },
      authHeaders
    );
    console.log('createDrvRes statusCode:', createDrvRes.statusCode, 'data:', createDrvRes.data);
    assert(createDrvRes.statusCode === 201 || createDrvRes.statusCode === 200, `POST /api/vendor/createDriver returned HTTP ${createDrvRes.statusCode}: ${JSON.stringify(createDrvRes.data)}`);
    const createdDrv = createDrvRes.data?.data || createDrvRes.data?.driver || createDrvRes.data;
    const testDrvId = createdDrv?.driverId;
    assert(!!testDrvId, 'Driver created with valid driverId');
    cleanup.driverIds.push(testDrvId);

    // 2. Edit Driver via API
    const updateDrvRes = await makeRequest(
      'PUT',
      `/api/driver/update/${testDrvId}`,
      {
        driverName: 'Ramesh Kumar Updated',
        phno: getUniquePhone(),
      },
      authHeaders
    );
    assert(updateDrvRes.statusCode === 200, `PUT /api/driver/update/${testDrvId} returned HTTP 200`);
    assert(!updateDrvRes.data?.subscriptionRequired, 'No Subscription Required restriction on Driver Edit');

    // 3. Delete Driver via API
    const deleteDrvRes = await makeRequest(
      'DELETE',
      `/api/driver/delete/${testDrvId}`,
      {},
      authHeaders
    );
    assert(deleteDrvRes.statusCode === 200, `DELETE /api/driver/delete/${testDrvId} returned HTTP 200`);
    assert(!deleteDrvRes.data?.subscriptionRequired, 'No Subscription Required restriction on Driver Delete');

    // Re-create driver for booking tests
    const activeDrvPhone = getUniquePhone();
    const activeDriver = await Drivers.create({
      driverId: uuidv4(),
      driverName: 'Suresh Pilot',
      driverContactNumber: activeDrvPhone,
      phno: activeDrvPhone,
      licenseNo: `DL-${testSuffix}02`,
      driverEmail: `suresh.${testSuffix}@cabzfleetops.in`,
      tenantId: testTenantId,
      activeStatus: 'ACTIVE',
      isDeleted: false,
    });
    cleanup.driverIds.push(activeDriver.driverId);

    // -------------------------------------------------------------------------
    // MODULE C: Company Operations (Add, Edit, Delete)
    // -------------------------------------------------------------------------
    console.log('\n--- Module C: Company Operations (Add, Edit, Delete) ---');

    // 1. Add Company via API
    const createCompRes = await makeRequest(
      'POST',
      '/api/emp/createCompany',
      {
        companyName: `Acme Corp ${testSuffix}`,
        companyEmail: `acme.${testSuffix}@cabzfleetops.in`,
        companyPhno: getUniquePhone(),
        companyAddress: 'HITEC City, Hyderabad',
        companyCode: `ACM${testSuffix.slice(-3)}`,
      },
      authHeaders
    );
    assert(createCompRes.statusCode === 201 || createCompRes.statusCode === 200, `POST /api/emp/createCompany returned HTTP ${createCompRes.statusCode}`);
    const createdComp = createCompRes.data?.data || createCompRes.data?.company || createCompRes.data;
    const testCompId = createdComp?.companyId;
    assert(!!testCompId, 'Company created with valid companyId');
    cleanup.companyIds.push(testCompId);

    // 2. Edit Company via API
    const updateCompRes = await makeRequest(
      'PUT',
      `/api/company/companyUpdate/${testCompId}`,
      {
        companyName: `Acme Corp ${testSuffix} Enterprise`,
        companyAddress: 'Gachibowli, Hyderabad',
      },
      authHeaders
    );
    assert(updateCompRes.statusCode === 200, `PUT /api/company/companyUpdate/${testCompId} returned HTTP 200`);
    assert(!updateCompRes.data?.subscriptionRequired, 'No Subscription Required restriction on Company Edit');

    // 3. Delete Company via API
    const deleteCompRes = await makeRequest(
      'DELETE',
      `/api/company/companyDelete/${testCompId}`,
      {},
      authHeaders
    );
    assert(deleteCompRes.statusCode === 200, `DELETE /api/company/companyDelete/${testCompId} returned HTTP 200`);
    assert(!deleteCompRes.data?.subscriptionRequired, 'No Subscription Required restriction on Company Delete');

    // Re-create company for bookings
    const activeCompany = await Company.create({
      companyId: uuidv4(),
      companyName: `Apex Corporate Services ${testSuffix}`,
      companyEmail: `apex.${testSuffix}@cabzfleetops.in`,
      companyCode: `APX${testSuffix.slice(-3)}`,
      tenantId: testTenantId,
      isDeleted: false,
    });
    cleanup.companyIds.push(activeCompany.companyId);

    // -------------------------------------------------------------------------
    // MODULE D: User / Owner Operations (Add, Edit, Delete)
    // -------------------------------------------------------------------------
    console.log('\n--- Module D: User Operations (Add, Edit, Delete) ---');

    // 1. Add User via API
    const createUserRes = await makeRequest(
      'POST',
      '/api/auth/createUser',
      {
        username: 'Rajesh Sharma',
        email: `rajesh.${testSuffix}@cabzfleetops.in`,
        mobile: getUniquePhone(),
        password: 'Password@123',
        companyId: activeCompany.companyId,
        role: 'user',
        roles: 'user',
      },
      authHeaders
    );
    assert(createUserRes.statusCode === 201 || createUserRes.statusCode === 200, `POST /api/auth/createUser returned HTTP ${createUserRes.statusCode}`);
    const createdUser = createUserRes.data?.User || createUserRes.data?.user || createUserRes.data?.data;
    const testUserId = createdUser?.userId;
    assert(!!testUserId, 'User created with valid userId');
    cleanup.userIds.push(testUserId);

    // 2. Edit User via API
    const updateUserRes = await makeRequest(
      'PUT',
      `/api/user/updateUser/${testUserId}`,
      {
        username: 'Rajesh Sharma Senior',
        mobile: getUniquePhone(),
      },
      authHeaders
    );
    assert(updateUserRes.statusCode === 200, `PUT /api/user/updateUser/${testUserId} returned HTTP 200`);
    assert(!updateUserRes.data?.subscriptionRequired, 'No Subscription Required restriction on User Edit');

    // 3. Delete User via API
    const deleteUserRes = await makeRequest(
      'DELETE',
      `/api/user/deleteUser/${testUserId}`,
      {},
      authHeaders
    );
    assert(deleteUserRes.statusCode === 200, `DELETE /api/user/deleteUser/${testUserId} returned HTTP 200`);
    assert(!deleteUserRes.data?.subscriptionRequired, 'No Subscription Required restriction on User Delete');

    // Create an active passenger user for bookings
    const activePassenger = await User.create({
      userId: uuidv4(),
      username: 'Passenger One',
      email: `passenger.${testSuffix}@cabzfleetops.in`,
      mobile: getUniquePhone(),
      password: await bcrypt.hash('Password@123', 10),
      companyId: activeCompany.companyId,
      tenantId: testTenantId,
      role: 'user',
      roles: 'user',
      isDeleted: false,
    });
    cleanup.userIds.push(activePassenger.userId);

    // -------------------------------------------------------------------------
    // MODULE E: Configurations (Taxes & Payment Modes)
    // -------------------------------------------------------------------------
    console.log('\n--- Module E: Configurations (Taxes & Payment Modes) ---');

    // 1. Add Tax
    const addTaxRes = await makeRequest(
      'POST',
      '/api/emp/addTax',
      {
        taxName: `GST 5% ${testSuffix}`,
        taxPercent: 5,
        isActive: true,
      },
      authHeaders
    );
    assert(addTaxRes.statusCode === 201 || addTaxRes.statusCode === 200, `POST /api/emp/addTax returned HTTP ${addTaxRes.statusCode}`);
    const createdTaxId = addTaxRes.data?.tax?.taxId || addTaxRes.data?.data?.taxId || addTaxRes.data?.taxId;
    if (createdTaxId) cleanup.taxIds.push(createdTaxId);

    // 2. Add Payment Mode
    const addPayModeRes = await makeRequest(
      'POST',
      '/api/paymentmode/createPaymentMode',
      {
        modelname: `Corporate Credit ${testSuffix}`,
        isOnline: true,
        isActive: true,
      },
      authHeaders
    );
    assert(addPayModeRes.statusCode === 201 || addPayModeRes.statusCode === 200, `POST /api/paymentmode/createPaymentMode returned HTTP ${addPayModeRes.statusCode}`);
    const createdModeId = addPayModeRes.data?.paymentMode?.paymentmodeId || addPayModeRes.data?.data?.paymentmodeId || addPayModeRes.data?.paymentmodeId;
    if (createdModeId) cleanup.paymentModeIds.push(createdModeId);

    // -------------------------------------------------------------------------
    // MODULE F: Booking Lifecycle (Standard, Airport, Outstation)
    // -------------------------------------------------------------------------
    console.log('\n--- Module F: Booking Lifecycle (Standard, Airport, Outstation) ---');

    // PackageData
    const packageData = await PackageData.create({
      packageDataId: uuidv4(),
      packageType: 'LOCAL',
      packages: JSON.stringify([{
        packageName: 'Standard 4hr/40km',
        hours: 4,
        kms: 40,
        amount: 1500,
        extraKmRate: 15,
        extraHourRate: 150,
      }]),
      companyId: activeCompany.companyId,
      tenantId: testTenantId,
      isDeleted: false,
    });

    // F.1: Create Standard Booking
    const stdBookingRes = await makeRequest(
      'POST',
      '/api/emp/createBookingForWeb',
      {
        bookingDate: '2026-11-28 09:00:00',
        bookingTime: '09:00:00',
        pickupPoint: 'Jubilee Hills Check Post',
        pickupCity: 'Hyderabad',
        dropPoint: 'Madhapur Cyber Towers',
        travellersCount: 1,
        femaleCount: 0,
        maleCount: 1,
        remarks: 'Standard Corporate City Transfer',
        userId: activePassenger.userId,
        companyId: activeCompany.companyId,
        vehicleTypeId: sedanType.vehicleTypeId,
        pickupArea: 'Jubilee Hills',
      },
      authHeaders
    );
    assert(stdBookingRes.statusCode === 201, `Standard Booking created (HTTP ${stdBookingRes.statusCode})`);
    const stdBooking = stdBookingRes.data?.data || stdBookingRes.data?.booking;
    const stdBookingId = stdBooking?.bookingId;
    assert(!!stdBookingId, 'Standard booking has valid bookingId');
    cleanup.bookingIds.push(stdBookingId);

    // F.2: Create Airport Booking
    const airportBookingRes = await makeRequest(
      'POST',
      '/api/emp/createBookingForWeb',
      {
        bookingDate: '2026-11-28 14:00:00',
        bookingTime: '14:00:00',
        pickupPoint: 'RGIA Airport Terminal 1',
        pickupCity: 'Hyderabad',
        dropPoint: 'Banjara Hills Road No 1',
        travellersCount: 2,
        femaleCount: 1,
        maleCount: 1,
        remarks: 'Airport Transfer Flight 6E-204',
        userId: activePassenger.userId,
        companyId: activeCompany.companyId,
        vehicleTypeId: sedanType.vehicleTypeId,
        pickupArea: 'Shamshabad',
      },
      authHeaders
    );
    assert(airportBookingRes.statusCode === 201, `Airport Booking created (HTTP ${airportBookingRes.statusCode})`);
    const airportBooking = airportBookingRes.data?.data || airportBookingRes.data?.booking;
    cleanup.bookingIds.push(airportBooking?.bookingId);

    // F.3: Create Outstation Booking
    const outstationBookingRes = await makeRequest(
      'POST',
      '/api/emp/createBookingForWeb',
      {
        bookingDate: '2026-11-29 06:00:00',
        bookingTime: '06:00:00',
        pickupPoint: 'Hyderabad Central',
        pickupCity: 'Hyderabad',
        dropPoint: 'Vijayawada Bus Station',
        travellersCount: 3,
        femaleCount: 1,
        maleCount: 2,
        remarks: 'Outstation Hyderabad to Vijayawada',
        userId: activePassenger.userId,
        companyId: activeCompany.companyId,
        vehicleTypeId: sedanType.vehicleTypeId,
        pickupArea: 'Punjagutta',
      },
      authHeaders
    );
    assert(outstationBookingRes.statusCode === 201, `Outstation Booking created (HTTP ${outstationBookingRes.statusCode})`);
    const outstationBooking = outstationBookingRes.data?.data || outstationBookingRes.data?.booking;
    cleanup.bookingIds.push(outstationBooking?.bookingId);

    // F.4: Driver & Vehicle Assignment (Confirm Booking)
    console.log('\n--- F.4: Driver & Vehicle Assignment ---');
    const assignRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBooking',
      {
        bookingId: stdBookingId,
        driverId: activeDriver.driverId,
        vehicleId: activeVeh.vehicleId,
      },
      authHeaders
    );
    assert(assignRes.statusCode === 200, `PATCH /api/vendor/confirmBooking returned HTTP 200: ${assignRes.data?.message}`);

    const bookingAfterAssign = await Booking.findByPk(stdBookingId);
    assert(
      String(bookingAfterAssign?.confirmStatus) === String(ORDER.STATUS.CONFIRMED),
      `Booking status is CONFIRMED (${ORDER.STATUS.CONFIRMED})`
    );

    // F.5: Close Pending Order
    console.log('\n--- F.5: Close Pending Order Execution ---');
    const closePendingPayload = {
      tripSheetNumber: `TRIP-${testSuffix}`,
      pickupDate: '2026-11-28 09:00:00',
      bookingId: stdBookingId,
      packageDataId: packageData.packageDataId,
      selectedPackageData: {
        packageDataId: packageData.packageDataId,
        optionId: `${packageData.packageDataId}::pkg`,
        hours: 4,
        kms: 40,
        amount: 1500,
        extraKmRate: 15,
        extraHourRate: 150,
      },
      companyId: activeCompany.companyId,
      garageKms: 45,
      garageOpenKm: 1000,
      garageCloseKm: 1045,
      garageOpenDateTime: '2026-11-28T08:30:00.000Z',
      garageCloseDateTime: '2026-11-28T13:30:00.000Z',
      guestKms: 40,
      guestOpenKm: 1005,
      guestCloseKm: 1045,
      guestOpenDateTime: '2026-11-28T09:00:00.000Z',
      guestCloseDateTime: '2026-11-28T13:00:00.000Z',
      usageHours: 4,
      packageAmount: 1500,
      additionalKms: 0,
      additionalHours: 0,
      discountAmount: 0,
      advanceAmount: 0,
      extraCharges: 0,
      totalAmount: 1500,
      total: 1575,
      totalDue: 1575,
      cgstApplicable: true,
      igstApplicable: false,
      sgstApplicable: true,
      totalTaxAmount: 75,
    };

    const closeRes = await makeRequest(
      'POST',
      '/api/closePendingOrder/createClosePending',
      closePendingPayload,
      authHeaders
    );
    assert(closeRes.statusCode === 201 || closeRes.statusCode === 200, `POST /api/closePendingOrder/createClosePending returned HTTP ${closeRes.statusCode}`);
    const createdClose = closeRes.data?.data || closeRes.data;
    if (createdClose?.closePendingId) cleanup.closePendingIds.push(createdClose.closePendingId);

    // Verify booking is now CLOSED
    const bookingAfterClose = await Booking.findByPk(stdBookingId);
    assert(
      String(bookingAfterClose?.confirmStatus) === String(ORDER.STATUS.CLOSED),
      `Booking confirmStatus is now CLOSED (${ORDER.STATUS.CLOSED})`
    );

    // Verify invoice was created
    const createdInvoice = await Invoice.findOne({ where: { bookingId: stdBookingId } });
    assert(!!createdInvoice, 'Trip Invoice created automatically upon Close Pending');
    if (createdInvoice) cleanup.invoiceIds.push(createdInvoice.invoiceId);

    // F.6: Payment Pending Status Verification
    console.log('\n--- F.6: Payment Pending & Completed Order Status ---');
    const paymentPendingCountRes = await makeRequest(
      'GET',
      '/api/emp/paymentPendingOrderCount',
      undefined,
      authHeaders
    );
    assert(paymentPendingCountRes.statusCode === 200, `GET /api/emp/paymentPendingOrderCount returned HTTP 200`);

    // Settle payment on invoice to complete order lifecycle
    const payRes = await makeRequest(
      'POST',
      '/api/closePendingOrder/savePaymentForInvoice',
      {
        invoiceId: createdInvoice!.invoiceId,
        paymentMode: `Corporate Credit ${testSuffix}`,
        transactionId: `PAY-${testSuffix}`,
        amount: 1575,
        remarks: 'Payment collected in full',
      },
      authHeaders
    );
    assert(payRes.statusCode === 200 || payRes.statusCode === 201, `savePaymentForInvoice returned HTTP ${payRes.statusCode}`);

    // Verify Completed Order Status
    const completedListRes = await makeRequest(
      'GET',
      '/api/order/status/completed',
      undefined,
      authHeaders
    );
    assert(completedListRes.statusCode === 200, `GET /api/order/status/completed returned HTTP 200`);

    // -------------------------------------------------------------------------
    // MODULE G: Invoicing & PDF Generation
    // -------------------------------------------------------------------------
    console.log('\n--- Module G: Invoicing & PDF Generation ---');

    // G.1: App Invoice Creation
    const appInvRes = await makeRequest(
      'POST',
      '/api/closePendingOrder/createAppInvoice',
      {
        bookingId: stdBookingId,
        invoiceNumber: `INV-APP-${testSuffix}`,
        totalAmount: 1575,
        companyId: activeCompany.companyId,
      },
      authHeaders
    );
    assert(appInvRes.statusCode === 200 || appInvRes.statusCode === 201, `createAppInvoice returned HTTP ${appInvRes.statusCode}`);

    // G.2: Monthly Consolidated Invoicing Listing
    const monthlyInvRes = await makeRequest(
      'GET',
      '/api/closePendingOrder/monthlyInvoice/getAll',
      undefined,
      authHeaders
    );
    assert(monthlyInvRes.statusCode === 200, `GET /api/closePendingOrder/monthlyInvoice/getAll returned HTTP 200`);

    // G.3: PDF Generation / Static Access Check
    const pdfToken = jwt.sign({ fileName: 'sample_test_invoice.pdf' }, JWT_SECRET);
    const pdfRes = await makeRequest(
      'GET',
      `/api/downloadPdf/download/invoice/sample_test_invoice.pdf?token=${pdfToken}`,
      undefined,
      authHeaders
    );
    // Even if file doesn't exist on disk, 404 or 200 proves route is mounted and accessible without subscription lock
    assert(pdfRes.statusCode !== 403, `PDF download route did not return 403 Forbidden. Status: ${pdfRes.statusCode}`);

    // -------------------------------------------------------------------------
    // MODULE H: Reports & Exports
    // -------------------------------------------------------------------------
    console.log('\n--- Module H: Reports & Exports ---');

    const ordersReportRes = await makeRequest(
      'GET',
      '/api/order/getAllOrders',
      undefined,
      authHeaders
    );
    assert(ordersReportRes.statusCode === 200, `GET /api/order/getAllOrders returned HTTP 200`);

    const invReportRes = await makeRequest(
      'GET',
      '/api/order/getallinvoicereport?from=2026-11-01&to=2026-11-30&companyId=ALL&bookingType=all',
      undefined,
      authHeaders
    );
    assert(invReportRes.statusCode === 200, `GET /api/order/getallinvoicereport returned HTTP ${invReportRes.statusCode}`);

    // -------------------------------------------------------------------------
    // MODULE I: Notifications Verification (Email & SMS)
    // -------------------------------------------------------------------------
    console.log('\n--- Module I: Notification Delivery Logs ---');
    const logs = await NotificationLog.findAll({
      where: {
        [Op.or]: [
          { referenceId: [testTenantId, testRequestId, stdBookingId].filter(Boolean) },
          { tenantId: testTenantId },
          { recipient: testEmail },
        ],
      },
    });
    console.log(`  Notification log records found for test entities: ${logs.length}`);
    assert(logs.length >= 1, 'Notifications (welcome/registration/booking) were properly logged');

    // Recipient Separation Check: Ensure applicant received registration/activation notifications
    const applicantEmailLogs = logs.filter((l) => l.channel === 'EMAIL' && l.recipient.toLowerCase() === testEmail.toLowerCase());
    assert(applicantEmailLogs.length >= 1, `Applicant received emails directly at ${testEmail} (Count: ${applicantEmailLogs.length})`);

    // Ensure no booking SMS was erroneously routed to SuperAdmin
    const bookingSmsLogs = logs.filter((l) => l.channel === 'SMS' && l.templateCode?.includes('BOOKING'));
    for (const bLog of bookingSmsLogs) {
      assert(!bLog.recipient.includes('admin@cabz.com'), `Booking SMS was not routed to SuperAdmin email. Recipient: ${bLog.recipient}`);
    }

    // =========================================================================
    // 3. TRIAL EXPIRY & MUTATING OPERATIONS LOCK VERIFICATION
    // =========================================================================
    console.log('\n========================================================================');
    console.log('>>> 3. Free Trial Expiry & Mutating Operations Lock Verification <<<');
    console.log('========================================================================');

    // Remember previous effective expiry
    await subRecord!.reload();
    const originalTrialExpiry = new Date(subRecord!.trialEndsAt!);
    console.log(`Original Trial Expiry: ${originalTrialExpiry.toISOString()}`);

    // Simulate trial expiry: set trialEndsAt to 1 hour in the past
    const pastDate = new Date(Date.now() - 3600 * 1000);
    await subRecord!.update({
      trialEndsAt: pastDate,
      currentPeriodEnd: pastDate,
    });

    const lockEvalExpired = await evaluateTenantSubscriptionLock(testTenantId);
    assert(lockEvalExpired.isLocked === true, 'evaluateTenantSubscriptionLock strictly returned isLocked: true upon expiry');
    assert(lockEvalExpired.lockReason === 'EXPIRED', `lockReason is strictly 'EXPIRED'. Actual: ${lockEvalExpired.lockReason}`);
    assert(lockEvalExpired.subscriptionStatus === 'TRIAL_EXPIRED', `subscriptionStatus is 'TRIAL_EXPIRED'. Actual: ${lockEvalExpired.subscriptionStatus}`);
    assert(
      lockEvalExpired.planTier === 'FREE_TRIAL' || lockEvalExpired.planTier === null,
      `planTier remains FREE_TRIAL or NULL (not PRO). Actual: ${lockEvalExpired.planTier}`
    );

    // Core Rule 2: Expired trial must NOT show PRO or ₹411.82 before customer chooses a plan!
    assert(
      lockEvalExpired.payableAmount === 0,
      `Expired trial payableAmount is strictly 0 before selection (no ₹411.82 default). Actual: ${lockEvalExpired.payableAmount}`
    );
    assert(
      lockEvalExpired.baseAmount === 0,
      `Expired trial baseAmount is strictly 0 before selection (no ₹349.00 default). Actual: ${lockEvalExpired.baseAmount}`
    );
    assert(
      lockEvalExpired.taxAmount === 0,
      `Expired trial taxAmount is strictly 0 before selection (no ₹62.82 default). Actual: ${lockEvalExpired.taxAmount}`
    );
    assert(
      Array.isArray(lockEvalExpired.availablePlans) && lockEvalExpired.availablePlans.length === 3,
      `Expired trial returns 3 available plan options (BASIC, PRO, ENTERPRISE). Count: ${lockEvalExpired.availablePlans?.length}`
    );

    // Verify mutating HTTP operations return 403 SUBSCRIPTION_PAYMENT_REQUIRED
    const expiredVehCreateRes = await makeRequest(
      'POST',
      '/api/vendor/createVehicle',
      {
        vehicleName: 'Locked Vehicle',
        vehicleNumber: `DL-01-XX-${testSuffix}`,
        vehicleTypeId: sedanType.vehicleTypeId,
      },
      authHeaders
    );
    assert(
      expiredVehCreateRes.statusCode === 403,
      `Mutating POST /api/vendor/createVehicle strictly blocked on expired trial (HTTP ${expiredVehCreateRes.statusCode})`
    );
    assert(
      expiredVehCreateRes.data?.subscriptionRequired === true || expiredVehCreateRes.data?.code === 'SUBSCRIPTION_PAYMENT_REQUIRED' || expiredVehCreateRes.data?.code === 'SUBSCRIPTION_EXPIRED',
      `Locked response code is SUBSCRIPTION_PAYMENT_REQUIRED/SUBSCRIPTION_EXPIRED: ${JSON.stringify(expiredVehCreateRes.data)}`
    );

    // =========================================================================
    // 4. TRIAL EXTENSION DATE CALCULATION AUDIT (04-12 + 2 = 06-12)
    // =========================================================================
    console.log('\n========================================================================');
    console.log('>>> 4. Trial Extension Date Calculation Audit (Formula: previous + days) <<<');
    console.log('========================================================================');

    // Restore trialEndsAt to the legitimate originalTrialExpiry (e.g., 04-12-2026) to test exact formula
    await subRecord!.update({
      trialEndsAt: originalTrialExpiry,
      currentPeriodEnd: originalTrialExpiry,
      trialDurationDays: 7,
    });

    // 4.1 Fleet Admin requests +2 days
    const { req: extReq, res: extRes } = mockReqRes(
      { requestedDays: 2, reason: 'Requesting 2 additional days to test client billing integration' },
      {},
      {},
      { userId: fleetAdminUserId, role: 'fleetadmin' },
      testTenantId
    );
    await requestTrialExtension(extReq, extRes);
    assert(extRes.statusCode === 201 && extRes.data?.success, 'Fleet Admin extension request submitted');
    const extRequestId = extRes.data.data.requestId;

    // 4.2 SuperAdmin approves +2 days
    const { req: appExtReq, res: appExtRes } = mockReqRes(
      { approvedDays: 2, adminNotes: 'Approved for billing test' },
      { requestId: extRequestId },
      {},
      { userId: 'superadmin-user', username: 'SuperAdmin', role: 'superadmin' }
    );
    await approveTrialExtensionRequest(appExtReq, appExtRes);
    assert(appExtRes.statusCode === 200 && appExtRes.data?.success, 'SuperAdmin approved +2 days extension');

    // 4.3 Verify New Effective Expiry = Previous Expiry + 2 Days (STRICT FORMULA)
    await subRecord!.reload();
    const newEffectiveExpiry = new Date(subRecord!.trialEndsAt!);
    const expectedExpiry = new Date(originalTrialExpiry.getTime() + 2 * 24 * 3600 * 1000);

    console.log(`  Previous Expiry: ${originalTrialExpiry.toISOString()}`);
    console.log(`  New Expiry:      ${newEffectiveExpiry.toISOString()}`);
    console.log(`  Expected Expiry: ${expectedExpiry.toISOString()}`);

    const diffFromPrevious = Math.round((newEffectiveExpiry.getTime() - originalTrialExpiry.getTime()) / (24 * 3600 * 1000));
    assert(
      diffFromPrevious === 2,
      `Strict Date Math: New Expiry is exactly previousExpiry + 2 days (actual difference: ${diffFromPrevious} days)`
    );
    assert(
      newEffectiveExpiry.getTime() === expectedExpiry.getTime(),
      `Timestamp exact match: ${newEffectiveExpiry.getTime()} === ${expectedExpiry.getTime()}`
    );
    assert(subRecord!.trialDurationDays === 9, `Total trial duration is now 9 days (7 + 2). Actual: ${subRecord!.trialDurationDays}`);

    // Format in Asia/Kolkata
    const istPrev = originalTrialExpiry.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });
    const istNew = newEffectiveExpiry.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });
    console.log(`  IST Date Check: ${istPrev} + 2 Days -> ${istNew}`);

    // 4.4 Verify duplicate approval is strictly rejected
    const { req: dupAppReq, res: dupAppRes } = mockReqRes(
      { approvedDays: 2 },
      { requestId: extRequestId },
      {},
      { userId: 'superadmin-user', username: 'SuperAdmin', role: 'superadmin' }
    );
    await approveTrialExtensionRequest(dupAppReq, dupAppRes);
    assert(dupAppRes.statusCode === 400, `Duplicate approval strictly rejected with HTTP 400: ${dupAppRes.data?.message}`);

    // 4.5 Immediate Access Restoration Verification (No Re-login Required)
    const lockEvalExtended = await evaluateTenantSubscriptionLock(testTenantId);
    assert(lockEvalExtended.isLocked === false, 'Access immediately restored: isLocked: false');
    assert(lockEvalExtended.subscriptionStatus === 'TRIAL_ACTIVE', `subscriptionStatus is 'TRIAL_ACTIVE'. Actual: ${lockEvalExtended.subscriptionStatus}`);

    // Verify mutating operation succeeds immediately
    const extendedVehRes = await makeRequest(
      'POST',
      '/api/vendor/createVehicle',
      {
        vehicleName: 'Post-Extension Vehicle',
        vehicleNumber: `DL-01-EX-${testSuffix}`,
        vehicleTypeId: sedanType.vehicleTypeId,
      },
      authHeaders
    );
    assert(extendedVehRes.statusCode === 201 || extendedVehRes.statusCode === 200, `Mutating operation immediately allowed after extension (HTTP ${extendedVehRes.statusCode})`);
    if (extendedVehRes.data?.data?.vehicleId) cleanup.vehicleIds.push(extendedVehRes.data.data.vehicleId);

    // =========================================================================
    // 5. PAID SUBSCRIPTION SELECTION & PAYMENT TRANSITION
    // =========================================================================
    console.log('\n========================================================================');
    console.log('>>> 5. Customer Paid Plan Selection & Payment Activation <<<');
    console.log('========================================================================');

    // Customer selects PRO plan, MONTHLY billing
    let checkoutInvoiceId = '';
    await runWithTenantContext({ tenantId: testTenantId, tenantCode: testBusinessCode, isPlatformSuperAdmin: false }, async () => {
      const { req: chkReq, res: chkRes } = mockReqRes(
        { planTier: 'PRO', billingCycle: 'MONTHLY', paymentMethod: 'GATEWAY' },
        {},
        {},
        { role: 'fleetadmin', tenantId: testTenantId },
        testTenantId
      );
      await createSubscriptionCheckout(chkReq, chkRes);
      assert(chkRes.statusCode === 201 && chkRes.data?.success, 'Subscription checkout created successfully');
      checkoutInvoiceId = chkRes.data.data.invoice.subscriptionInvoiceId;
      console.log(`  Checkout Invoice ID: ${checkoutInvoiceId}`);
      console.log(`  Base Amount: ₹${chkRes.data.data.invoice.baseAmount}, Tax: ₹${chkRes.data.data.invoice.taxAmount}, Total: ₹${chkRes.data.data.invoice.totalAmount}`);

      // Verify payment server-side
      const { req: payReq, res: payRes } = mockReqRes(
        {
          subscriptionInvoiceId: checkoutInvoiceId,
          isSimulated: true,
          transactionReference: `TXN_PAID_${testSuffix}`,
        },
        {},
        {},
        { role: 'fleetadmin', tenantId: testTenantId },
        testTenantId
      );
      await verifySubscriptionPayment(payReq, payRes);
      assert(payRes.statusCode === 200 && payRes.data?.success, `Subscription payment verified: ${payRes.data.message}`);
    });

    // Verify database state after payment
    await subRecord!.reload();
    assert(subRecord!.status === 'ACTIVE', `Subscription status is strictly 'ACTIVE'. Actual: ${subRecord!.status}`);
    assert(subRecord!.planTier === 'PRO', `Subscription planTier is now the customer-chosen 'PRO'. Actual: ${subRecord!.planTier}`);
    assert(Number(subRecord!.agreedPrice) === 349, `Subscription agreedPrice is ₹349. Actual: ${subRecord!.agreedPrice}`);

    const subInvoice = await SubscriptionInvoice.findByPk(checkoutInvoiceId);
    assert(subInvoice?.paymentStatus === 'PAID', `Invoice paymentStatus is PAID. Actual: ${subInvoice?.paymentStatus}`);
    assert(!!subInvoice?.metadata?.pdfUrl || !!subInvoice?.invoiceNumber, `Invoice PDF/Receipt generated. Actual: ${subInvoice?.invoiceNumber}`);

    // Verify operational access permanently active under paid subscription
    const lockEvalPaid = await evaluateTenantSubscriptionLock(testTenantId);
    assert(lockEvalPaid.isLocked === false, 'Tenant is unlocked under ACTIVE paid subscription');
    assert(lockEvalPaid.subscriptionStatus === 'ACTIVE_PAID', `Lock status is ACTIVE_PAID. Actual: ${lockEvalPaid.subscriptionStatus}`);
    assert(lockEvalPaid.planTier === 'PRO', `Lock evaluation planTier is customer-selected PRO. Actual: ${lockEvalPaid.planTier}`);

    console.log('\n========================================================================');
    console.log('✅ ALL TESTS IN COMPREHENSIVE SUITE PASSED SUCCESSFULLY');
    console.log('========================================================================\n');
  } catch (err: any) {
    console.error('\n❌ TEST RUN FAILED WITH ERROR:', err);
    process.exit(1);
  } finally {
    // Cleanup test data
    console.log('\n--- Cleaning up test records ---');
    try {
      if (cleanup.tenantId) {
        await TrialExtensionRequest.destroy({ where: { tenantId: cleanup.tenantId } });
        await SubscriptionInvoice.destroy({ where: { tenantId: cleanup.tenantId } });
        await TenantSubscription.destroy({ where: { tenantId: cleanup.tenantId } });
        await TenantActivationToken.destroy({ where: { tenantId: cleanup.tenantId } });
        for (const cid of cleanup.closePendingIds) {
          await ClosePending.destroy({ where: { closependingId: cid } });
        }
        for (const bid of cleanup.bookingIds) {
          await Invoice.destroy({ where: { bookingId: bid } });
          await Booking.destroy({ where: { bookingId: bid } });
        }
        for (const vid of cleanup.vehicleIds) {
          await Vehicle.destroy({ where: { vehicleId: vid } });
        }
        for (const did of cleanup.driverIds) {
          await Drivers.destroy({ where: { driverId: did } });
        }
        await PackageData.destroy({ where: { tenantId: cleanup.tenantId } });
        for (const cid of cleanup.companyIds) {
          await Company.destroy({ where: { companyId: cid } });
        }
        await Tenant.destroy({ where: { tenantId: cleanup.tenantId } });
      }
      if (cleanup.requestId) {
        await TenantRegistrationRequest.destroy({ where: { requestId: cleanup.requestId } });
      }
      console.log('✓ Cleanup complete.');
    } catch (cleanErr) {
      console.warn('Cleanup warning:', cleanErr);
    }

    if (server) {
      server.close();
    }
    process.exit(0);
  }
}

runComprehensiveTrialAndModulesSuite();
