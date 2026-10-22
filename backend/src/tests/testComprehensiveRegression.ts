import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  sequelize,
  Tenant,
  TenantSubscription,
  Company,
  Vehicle,
  Drivers,
  User,
  VehicleType,
  Booking,
  Invoice,
} from '../models';
import config from '../config/config';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';
const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';
const TENANT_ALPHA_ID = 'a1111111-aaaa-1111-aaaa-111111111111';
const TENANT_BETA_ID = 'b2222222-bbbb-2222-bbbb-222222222222';

// Tokens
const superAdminToken = jwt.sign(
  {
    userId: '99999999-9999-9999-9999-999999999999',
    role: 'superadmin',
    roles: 'superadmin',
    tenantId: ROOT_TENANT_ID,
    email: 'platform.superadmin@gracecabs.com',
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const tenantAlphaToken = jwt.sign(
  {
    userId: 'aaaa1111-1111-1111-1111-111111111111',
    role: 'admin',
    roles: 'admin',
    tenantId: TENANT_ALPHA_ID,
    email: 'admin@alphafleet.com',
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const tenantBetaToken = jwt.sign(
  {
    userId: 'bbbb2222-2222-2222-2222-222222222222',
    role: 'admin',
    roles: 'admin',
    tenantId: TENANT_BETA_ID,
    email: 'admin@betafleet.com',
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const rootTenantToken = jwt.sign(
  {
    userId: '11111111-1111-1111-1111-111111111111',
    role: 'admin',
    roles: 'admin',
    tenantId: ROOT_TENANT_ID,
    email: 'admin@gracecabs.com',
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

function makeRequest(
  options: http.RequestOptions,
  bodyData?: any
): Promise<{ statusCode: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        let parsed: any = raw;
        try {
          parsed = JSON.parse(raw);
        } catch {}
        resolve({
          statusCode: res.statusCode || 0,
          data: parsed,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);

    if (bodyData) {
      req.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function runComprehensiveSuite() {
  console.log('\n========================================================================');
  console.log('🧪 COMPREHENSIVE MULTI-TENANT SAAS REGRESSION & ISOLATION SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Provisioning & Database Setup
    // -------------------------------------------------------------------------
    console.log('🔹 [Step 1] Ensuring Test Tenants Exist in Database');

    // Ensure Tenant Alpha (BASIC Tier)
    let tenantAlpha = await Tenant.findByPk(TENANT_ALPHA_ID);
    if (!tenantAlpha) {
      tenantAlpha = await Tenant.create({
        tenantId: TENANT_ALPHA_ID,
        name: 'Alpha Fleet Ltd',
        code: 'TETA',
        subdomain: 'alphafleet',
        planTier: 'BASIC',
        contactEmail: 'ops@alphafleet.com',
        status: 'ACTIVE',
      });
      await TenantSubscription.create({
        tenantId: TENANT_ALPHA_ID,
        planTier: 'BASIC',
        status: 'ACTIVE',
        vehicleQuota: 15,
        driverQuota: 15,
        companyQuota: 3,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    // Ensure Tenant Beta (PRO Tier)
    let tenantBeta = await Tenant.findByPk(TENANT_BETA_ID);
    if (!tenantBeta) {
      tenantBeta = await Tenant.create({
        tenantId: TENANT_BETA_ID,
        name: 'Beta Transport Corp',
        code: 'TETB',
        subdomain: 'betatransport',
        planTier: 'PRO',
        contactEmail: 'ops@betatransport.com',
        status: 'ACTIVE',
      });
      await TenantSubscription.create({
        tenantId: TENANT_BETA_ID,
        planTier: 'PRO',
        status: 'ACTIVE',
        vehicleQuota: 75,
        driverQuota: 75,
        companyQuota: 20,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    assert(!!tenantAlpha && !!tenantBeta, 'Both Test Tenants are present and active');

    // Find or create a shared vehicle type for testing
    let testVehicleType = await VehicleType.findOne();
    if (!testVehicleType) {
      testVehicleType = await VehicleType.create({
        vehicleType: 'Sedan Test',
        seatCapacity: 4,
        bookingType: 'regular',
      });
    }
    const vehicleTypeId = testVehicleType.vehicleTypeId;

    // -------------------------------------------------------------------------
    // STEP 2: Company Isolation Tests
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 2] Corporate Company Isolation Across Tenants');

    const suffix = Date.now().toString().slice(-4);
    // Create Company for Tenant Alpha
    const compAName = `AlphaCorp_${suffix}`;
    const compA = await Company.create({
      companyName: compAName,
      companyPhno: `910000${suffix}`,
      domainName: `alpha${suffix}.com`,
      managerEmail: `manager@alpha${suffix}.com`,
      tenantId: TENANT_ALPHA_ID,
      isDeleted: false,
    });
    const compAId = compA.companyId;

    // Create Company for Tenant Beta
    const compBName = `BetaCorp_${suffix}`;
    const compB = await Company.create({
      companyName: compBName,
      companyPhno: `920000${suffix}`,
      domainName: `beta${suffix}.com`,
      managerEmail: `manager@beta${suffix}.com`,
      tenantId: TENANT_BETA_ID,
      isDeleted: false,
    });
    const compBId = compB.companyId;

    // 1. Tenant Alpha listing companies
    const alphaCompaniesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/company/getAllCompany',
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantAlphaToken}` },
    });
    assert(alphaCompaniesRes.statusCode === 200, 'Tenant Alpha GET /api/company/getAllCompany returns 200');
    const alphaList = alphaCompaniesRes.data?.data || [];
    const alphaHasCompA = alphaList.some((c: any) => c.companyId === compAId);
    const alphaHasCompB = alphaList.some((c: any) => c.companyId === compBId);
    assert(alphaHasCompA, 'Tenant Alpha list contains Company Alpha');
    assert(!alphaHasCompB, 'Tenant Alpha list STRICTLY EXCLUDES Company Beta');

    // 2. Tenant Beta listing companies
    const betaCompaniesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/company/getAllCompany',
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(betaCompaniesRes.statusCode === 200, 'Tenant Beta GET /api/company/getAllCompany returns 200');
    const betaList = betaCompaniesRes.data?.data || [];
    const betaHasCompB = betaList.some((c: any) => c.companyId === compBId);
    const betaHasCompA = betaList.some((c: any) => c.companyId === compAId);
    assert(betaHasCompB, 'Tenant Beta list contains Company Beta');
    assert(!betaHasCompA, 'Tenant Beta list STRICTLY EXCLUDES Company Alpha');

    // 3. Cross-Tenant Direct Resource Access (Tenant Beta attempting to access Company Alpha)
    const betaGetCompA = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/company/getCompanyById/${compAId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaGetCompA.statusCode === 403,
      'Tenant Beta GET /api/company/getCompanyById/:compAId is blocked with 403',
      `Status: ${betaGetCompA.statusCode}`
    );

    // 4. Cross-Tenant Taxes Endpoint
    const betaGetCompATaxes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/company/company/${compAId}/taxes`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaGetCompATaxes.statusCode === 403,
      'Tenant Beta GET /api/company/company/:compAId/taxes is blocked with 403',
      `Status: ${betaGetCompATaxes.statusCode}`
    );

    // 5. Cross-Tenant Company Deletion
    const betaDeleteCompA = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/company/companyDelete/${compAId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaDeleteCompA.statusCode === 403,
      'Tenant Beta DELETE /api/company/companyDelete/:compAId is blocked with 403',
      `Status: ${betaDeleteCompA.statusCode}`
    );

    // -------------------------------------------------------------------------
    // STEP 3: Vehicle Isolation Tests
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 3] Vehicle Fleet Isolation Across Tenants');

    const vehAName = `Alpha_Sedan_${suffix}`;
    const vehA = await Vehicle.create({
      vehicleName: vehAName,
      vehicleTypeId,
      availableStatus: 'AVAILABLE',
      manufacturing: '2024',
      tenantId: TENANT_ALPHA_ID,
      isDeleted: false,
    });
    const vehAId = vehA.vehicleId;

    const vehBName = `Beta_Sedan_${suffix}`;
    const vehB = await Vehicle.create({
      vehicleName: vehBName,
      vehicleTypeId,
      availableStatus: 'AVAILABLE',
      manufacturing: '2024',
      tenantId: TENANT_BETA_ID,
      isDeleted: false,
    });
    const vehBId = vehB.vehicleId;

    // 1. Tenant Alpha listing vehicles
    const alphaVehRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/vehicle/getAllVehicles',
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantAlphaToken}` },
    });
    assert(alphaVehRes.statusCode === 200, 'Tenant Alpha GET /api/vehicle/getAllVehicles returns 200');
    const alphaVehList = alphaVehRes.data?.vehicles || [];
    const alphaHasVehA = alphaVehList.some((v: any) => v.vehicleId === vehAId);
    const alphaHasVehB = alphaVehList.some((v: any) => v.vehicleId === vehBId);
    assert(alphaHasVehA, 'Tenant Alpha list contains Vehicle Alpha');
    assert(!alphaHasVehB, 'Tenant Alpha list STRICTLY EXCLUDES Vehicle Beta');

    // 2. Cross-Tenant Vehicle Access
    const betaGetVehA = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/vehicle/${vehAId}/getVehicleById`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaGetVehA.statusCode === 403,
      'Tenant Beta GET /api/vehicle/:vehAId/getVehicleById is blocked with 403',
      `Status: ${betaGetVehA.statusCode}`
    );

    // 3. Cross-Tenant Vehicle Status Update
    const betaUpdateVehAStatus = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/vehicle/${vehAId}/updateVehicleStatus`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantBetaToken}`,
        },
      },
      { availableStatus: 40 }
    );
    assert(
      betaUpdateVehAStatus.statusCode === 403,
      'Tenant Beta PUT /api/vehicle/:vehAId/updateVehicleStatus is blocked with 403',
      `Status: ${betaUpdateVehAStatus.statusCode}`
    );

    // 4. Cross-Tenant Vehicle Deletion
    const betaDeleteVehA = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/vehicle/${vehAId}/deleteVehicle`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaDeleteVehA.statusCode === 403,
      'Tenant Beta DELETE /api/vehicle/:vehAId/deleteVehicle is blocked with 403',
      `Status: ${betaDeleteVehA.statusCode}`
    );

    // -------------------------------------------------------------------------
    // STEP 4: Driver Isolation Tests
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 4] Driver Isolation Across Tenants');

    const driverA = await Drivers.create({
      driverName: `Driver_Alpha_${suffix}`,
      driverEmail: `driver_alpha_${suffix}@test.com`,
      phno: `930000${suffix}`,
      password: 'hash',
      tenantId: TENANT_ALPHA_ID,
      isDeleted: false,
    });
    const driverAId = driverA.driverId;

    const driverB = await Drivers.create({
      driverName: `Driver_Beta_${suffix}`,
      driverEmail: `driver_beta_${suffix}@test.com`,
      phno: `940000${suffix}`,
      password: 'hash',
      tenantId: TENANT_BETA_ID,
      isDeleted: false,
    });
    const driverBId = driverB.driverId;

    // 1. Tenant Alpha listing drivers
    const alphaDriversRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/driver/getAllDrivers',
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantAlphaToken}` },
    });
    assert(alphaDriversRes.statusCode === 200, 'Tenant Alpha GET /api/driver/getAllDrivers returns 200');
    const alphaDriverList = alphaDriversRes.data?.drivers || alphaDriversRes.data?.data || [];
    const alphaHasDriverA = alphaDriverList.some((d: any) => d.driverId === driverAId);
    const alphaHasDriverB = alphaDriverList.some((d: any) => d.driverId === driverBId);
    assert(alphaHasDriverA, 'Tenant Alpha list contains Driver Alpha');
    assert(!alphaHasDriverB, 'Tenant Alpha list STRICTLY EXCLUDES Driver Beta');

    // 2. Cross-Tenant Driver Access
    const betaGetDriverA = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/driver/getDriverById/${driverAId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaGetDriverA.statusCode === 403,
      'Tenant Beta GET /api/driver/getDriverById/:driverAId is blocked with 403',
      `Status: ${betaGetDriverA.statusCode}`
    );

    // 3. Cross-Tenant Driver Deletion
    const betaDeleteDriverA = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/driver/delete/${driverAId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaDeleteDriverA.statusCode === 403,
      'Tenant Beta DELETE /api/driver/delete/:driverAId is blocked with 403',
      `Status: ${betaDeleteDriverA.statusCode}`
    );

    // -------------------------------------------------------------------------
    // STEP 5: User & Employee Isolation Tests
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 5] User & Corporate Passenger Isolation Across Tenants');

    const userA = await User.create({
      username: `User_Alpha_${suffix}`,
      email: `user_alpha_${suffix}@alpha.com`,
      password: 'password',
      mobile: `950000${suffix}`,
      companyId: compAId,
      tenantId: TENANT_ALPHA_ID,
      isDeleted: false,
    });
    const userAId = userA.userId;

    const userB = await User.create({
      username: `User_Beta_${suffix}`,
      email: `user_beta_${suffix}@beta.com`,
      password: 'password',
      mobile: `960000${suffix}`,
      companyId: compBId,
      tenantId: TENANT_BETA_ID,
      isDeleted: false,
    });
    const userBId = userB.userId;

    // 1. Tenant Alpha listing users
    const alphaUsersRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/user/getAllUsers',
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantAlphaToken}` },
    });
    assert(alphaUsersRes.statusCode === 200, 'Tenant Alpha GET /api/user/getAllUsers returns 200');
    const alphaUserList = alphaUsersRes.data?.data || [];
    const alphaHasUserA = alphaUserList.some((u: any) => u.userId === userAId);
    const alphaHasUserB = alphaUserList.some((u: any) => u.userId === userBId);
    assert(alphaHasUserA, 'Tenant Alpha user list contains User Alpha');
    assert(!alphaHasUserB, 'Tenant Alpha user list STRICTLY EXCLUDES User Beta');

    // 2. Cross-Tenant User Lookup
    const betaGetUserA = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/user/${userAId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaGetUserA.statusCode === 403,
      'Tenant Beta GET /api/user/:userAId is blocked with 403',
      `Status: ${betaGetUserA.statusCode}`
    );

    // 3. Cross-Tenant User By Company
    const betaGetUsersByCompA = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/user/getUsersByCompany/${compAId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaGetUsersByCompA.statusCode === 403,
      'Tenant Beta GET /api/user/getUsersByCompany/:compAId is blocked with 403',
      `Status: ${betaGetUsersByCompA.statusCode}`
    );

    // -------------------------------------------------------------------------
    // STEP 6: Quota Enforcement Tests (Basic Tier Quota Limit)
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 6] Subscription Limit & Quota Enforcement');

    // Create a dedicated tenant for Quota Test
    const quotaTenantId = 'c3333333-cccc-3333-cccc-333333333333';
    await Tenant.destroy({ where: { tenantId: quotaTenantId } });
    await TenantSubscription.destroy({ where: { tenantId: quotaTenantId } });
    await Vehicle.destroy({ where: { tenantId: quotaTenantId } });

    await Tenant.create({
      tenantId: quotaTenantId,
      name: 'Quota Test Fleet',
      code: 'TQTA',
      subdomain: 'quotatest',
      planTier: 'BASIC',
      status: 'ACTIVE',
    });
    await TenantSubscription.create({
      tenantId: quotaTenantId,
      planTier: 'BASIC',
      status: 'ACTIVE',
      vehicleQuota: 3, // Set hard quota of 3 for testing
      driverQuota: 3,
      companyQuota: 2,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const quotaToken = jwt.sign(
      {
        userId: 'cccc3333-3333-3333-3333-333333333333',
        role: 'admin',
        roles: 'admin',
        tenantId: quotaTenantId,
        email: 'admin@quotatest.com',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 1. Create vehicles up to quota (3 vehicles)
    for (let i = 1; i <= 3; i++) {
      await Vehicle.create({
        vehicleName: `Quota_Veh_${i}`,
        vehicleTypeId,
        availableStatus: 'AVAILABLE',
        manufacturing: '2024',
        tenantId: quotaTenantId,
        isDeleted: false,
      });
    }

    // 2. Attempt to create 4th vehicle via API (One item over quota)
    const overQuotaRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/vendor/createVehicle',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${quotaToken}`,
        },
      },
      {
        vehicleName: 'Quota_Veh_OverLimit',
        vehicleTypeId,
        manufacturing: '2024',
        availableStatus: 'AVAILABLE',
      }
    );
    assert(
      overQuotaRes.statusCode === 403,
      'Vehicle creation over quota is strictly rejected with HTTP 403',
      `Status: ${overQuotaRes.statusCode}, msg: ${overQuotaRes.data?.message}`
    );
    assert(
      overQuotaRes.data?.quotaExceeded === true || /quota/i.test(overQuotaRes.data?.message || ''),
      'Quota rejection payload contains quota explanation'
    );

    // 3. Upgrade Plan to PRO (Vehicle quota -> 75)
    await TenantSubscription.update(
      { planTier: 'PRO', vehicleQuota: 75 },
      { where: { tenantId: quotaTenantId } }
    );

    // 4. Retry creation after upgrade
    const afterUpgradeRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/vendor/createVehicle',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${quotaToken}`,
        },
      },
      {
        vehicleName: 'Quota_Veh_AfterUpgrade',
        vehicleTypeId,
        manufacturing: '2024',
        availableStatus: 'AVAILABLE',
      }
    );
    assert(
      afterUpgradeRes.statusCode === 201,
      'Vehicle creation succeeds with HTTP 201 immediately following plan upgrade',
      `Status: ${afterUpgradeRes.statusCode}`
    );

    // -------------------------------------------------------------------------
    // STEP 7: Legacy Root Compatibility
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 7] Legacy Grace Cabs Records Compatibility');

    // Query with Root Tenant token
    const rootCompaniesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/company/getAllCompany',
      method: 'GET',
      headers: { Authorization: `Bearer ${rootTenantToken}` },
    });
    assert(rootCompaniesRes.statusCode === 200, 'Root Tenant GET /api/company/getAllCompany returns 200');

    // Verify Root Tenant cannot see Tenant Alpha or Beta records
    const rootCompList = rootCompaniesRes.data?.data || [];
    const rootHasCompA = rootCompList.some((c: any) => c.companyId === compAId);
    const rootHasCompB = rootCompList.some((c: any) => c.companyId === compBId);
    assert(!rootHasCompA && !rootHasCompB, 'Root Tenant queries DO NOT leak Tenant Alpha or Beta isolated records');

    // -------------------------------------------------------------------------
    // STEP 8: Order & Booking Cross-Tenant Workflow Security
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 8] Order & Booking Cross-Tenant Workflow Security');

    const testUserA = await User.create({
      username: `Alpha_Passenger_${suffix}`,
      email: `passenger_${suffix}@alpha.com`,
      mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      role: 'user',
      companyId: compAId,
      tenantId: TENANT_ALPHA_ID,
    });

    const alphaBooking = await Booking.create({
      tenantId: TENANT_ALPHA_ID,
      userId: testUserA.userId,
      bookingDate: new Date(),
      bookingTime: '10:00:00',
      pickupPoint: 'Alpha Station',
      dropPoint: 'Alpha Airport',
      confirmStatus: 1, // CONFIRMED
      bookingStatus: 1,
    });

    // 1. Cross-tenant order edit blocked
    const editCrossRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/order/editBooking/${alphaBooking.bookingId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantBetaToken}`,
        },
      },
      { pickupPoint: 'Hacked Station' }
    );
    assert(
      editCrossRes.statusCode === 403,
      'Cross-tenant PUT /api/order/editBooking/:id is blocked with HTTP 403 Forbidden',
      `Status: ${editCrossRes.statusCode}`
    );

    // 2. Cross-tenant order cancellation blocked
    const cancelCrossRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/order/cancelBooking',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantBetaToken}`,
        },
      },
      { bookingId: alphaBooking.bookingId, remarks: 'Unauthorized cancel' }
    );
    assert(
      cancelCrossRes.statusCode === 403,
      'Cross-tenant PUT /api/order/cancelBooking is blocked with HTTP 403 Forbidden',
      `Status: ${cancelCrossRes.statusCode}`
    );

    // 3. Cross-tenant order decline blocked
    const declineCrossRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/order/declineBooking',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantBetaToken}`,
        },
      },
      { bookingId: alphaBooking.bookingId, remarks: 'Unauthorized decline' }
    );
    assert(
      declineCrossRes.statusCode === 403,
      'Cross-tenant PUT /api/order/declineBooking is blocked with HTTP 403 Forbidden',
      `Status: ${declineCrossRes.statusCode}`
    );

    // 4. Order status listing isolation (/api/order/status/confirmed)
    const betaConfirmedRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/order/status/confirmed',
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      betaConfirmedRes.statusCode === 200,
      'GET /api/order/status/confirmed returns 200'
    );
    const betaOrders = betaConfirmedRes.data?.data || [];
    const hasAlphaBooking = betaOrders.some((b: any) => b.bookingId === alphaBooking.bookingId);
    assert(
      !hasAlphaBooking,
      'GET /api/order/status/confirmed strictly scopes to active tenant and does NOT leak Tenant Alpha orders'
    );

    // 5. Cross-tenant user order list blocked
    const userOrdersRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/order/user/${testUserA.userId}/all`,
      method: 'GET',
      headers: { Authorization: `Bearer ${tenantBetaToken}` },
    });
    assert(
      userOrdersRes.statusCode === 403,
      'Cross-tenant GET /api/order/user/:userId/all blocked with HTTP 403 Forbidden',
      `Status: ${userOrdersRes.statusCode}`
    );

    // -------------------------------------------------------------------------
    // STEP 9: Invoice File Path Traversal & Download Protection
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 9] Invoice File Security & Path Traversal Protection');

    const traversalRes1 = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/app/appInvoiceRoutes/download/invoice/..%2F..%2F..%2Fpackage.json',
      method: 'GET',
    });
    assert(
      traversalRes1.statusCode === 400,
      'Path traversal attempt on /download/invoice/:fileName rejected with HTTP 400',
      `Status: ${traversalRes1.statusCode}`
    );

    const traversalRes2 = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/app/appInvoiceRoutes/download/oncall-invoice/..%2F..%2F..%2Fpackage.json',
      method: 'GET',
    });
    assert(
      traversalRes2.statusCode === 400,
      'Path traversal attempt on /download/oncall-invoice/:fileName rejected with HTTP 400',
      `Status: ${traversalRes2.statusCode}`
    );

    // Clean up test order, passenger, and quota tenant
    await Booking.destroy({ where: { bookingId: alphaBooking.bookingId } });
    await User.destroy({ where: { userId: testUserA.userId } });
    await Vehicle.destroy({ where: { tenantId: quotaTenantId } });
    await TenantSubscription.destroy({ where: { tenantId: quotaTenantId } });
    await Tenant.destroy({ where: { tenantId: quotaTenantId } });

    console.log('\n========================================================================');
    console.log(`📊 REGRESSION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error: any) {
    console.error('Fatal error in regression suite:', error);
    process.exit(1);
  }
}

runComprehensiveSuite();
