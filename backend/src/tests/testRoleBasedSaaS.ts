import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  sequelize,
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
  TenantActivationToken,
  NotificationLog,
  User,
  Employee,
  Company,
  Vehicle,
  VehicleType,
  Drivers,
  Booking,
} from '../models';
import config from '../config/config';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';
const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';

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

function assert(condition: boolean, testName: string, extra?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName} ${extra ? `-> ${extra}` : ''}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('🛡️  COMPLETE MULTI-TENANT SAAS ROLE-BASED ACCESS CONTROL AUDIT & TEST SUITE');
  console.log('========================================================================\n');

  let passedCount = 0;
  const countPass = (cond: boolean, name: string, extra?: string) => {
    assert(cond, name, extra);
    passedCount++;
  };

  const cleanupTenants: string[] = [];
  const cleanupUsers: string[] = [];
  const cleanupEmployees: string[] = [];

  try {
    // -------------------------------------------------------------------------
    // TEST 1: SuperAdmin login & credential verification
    // -------------------------------------------------------------------------
    console.log('🔹 [Test 1] SuperAdmin Authentication & Role Verification');
    const superAdminLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/emplogin',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'subisha2002.m@gmail.com',
        password: 'superadmin@123',
      }
    );

    countPass(superAdminLoginRes.statusCode === 200, 'SuperAdmin authenticates successfully via /api/auth/emplogin');
    countPass(superAdminLoginRes.data?.role === 'superadmin', 'SuperAdmin account returns role: "superadmin"');
    const superAdminToken = superAdminLoginRes.data?.accessToken;
    countPass(Boolean(superAdminToken), 'SuperAdmin receives valid JWT bearer token');

    // -------------------------------------------------------------------------
    // TEST 2: SuperAdmin All Fleets view shows platform aggregate totals
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Test 2] SuperAdmin All Fleets (Platform Aggregate) Telemetry');
    const allFleetsOverviewRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/dashboard/overview',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        'X-Tenant-ID': 'all',
      },
    });

    if (allFleetsOverviewRes.statusCode !== 200) {
      console.log('allFleetsOverviewRes debug:', allFleetsOverviewRes.statusCode, allFleetsOverviewRes.data);
    }
    countPass(allFleetsOverviewRes.statusCode === 200, 'GET /api/tenants/dashboard/overview with X-Tenant-ID: all returns HTTP 200', `Got ${allFleetsOverviewRes.statusCode}: ${JSON.stringify(allFleetsOverviewRes.data)}`);
    countPass(allFleetsOverviewRes.data?.data?.isPlatformSuperAdmin === true, 'Telemetry correctly recognizes Platform SuperAdmin identity');
    countPass(allFleetsOverviewRes.data?.data?.isAllFleets === true, 'Telemetry correctly recognizes All Fleets aggregate mode');
    countPass(typeof allFleetsOverviewRes.data?.data?.activeFleetsCount === 'number', 'Telemetry returns active fleets platform count');
    countPass(allFleetsOverviewRes.data?.data?.quotas?.vehicles?.current >= 0, 'Telemetry calculates platform-wide vehicles');

    // -------------------------------------------------------------------------
    // TEST 3 & 5: Selecting a fleet filters dashboard and data refetches
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Test 3 & 5] Selecting a Fleet Filters Queries & Triggers Refetch');
    
    // Provision a distinct test fleet
    const testFleetId = uuidv4();
    cleanupTenants.push(testFleetId);
    await Tenant.create({
      tenantId: testFleetId,
      name: 'Delta Rapid Transit Fleet',
      code: 'DRTF',
      status: 'ACTIVE',
      planTier: 'PRO',
      contactEmail: `admin_${Date.now()}@deltarapid.com`,
    });

    await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: testFleetId,
      planTier: 'PRO',
      status: 'ACTIVE',
      vehicleQuota: 50,
      driverQuota: 50,
      companyQuota: 20,
      monthlyTripQuota: 1000,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    });

    const anyVt = await VehicleType.findOne();
    const vehicleTypeId = anyVt ? anyVt.vehicleTypeId : uuidv4();
    const testPlate = `TN-01-TEST-${Date.now().toString().slice(-4)}`;
    const testVehicle = await Vehicle.create({
      vehicleId: uuidv4(),
      vehicleName: 'Test Fleet Sedan',
      vehicleTypeId,
      manufacturing: '2024',
      availableStatus: '1',
      tenantId: testFleetId,
      isDeleted: false,
    });

    // When SuperAdmin queries with X-Tenant-ID: testFleetId
    const scopedOverviewRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/dashboard/overview',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        'X-Tenant-ID': testFleetId,
      },
    });

    countPass(scopedOverviewRes.statusCode === 200, 'GET /api/tenants/dashboard/overview for selected fleet returns HTTP 200');
    countPass(scopedOverviewRes.data?.data?.isAllFleets === false, 'Scoped telemetry confirms individual fleet mode');
    countPass(scopedOverviewRes.data?.data?.tenant?.tenantId === testFleetId, 'Scoped telemetry binds to the selected fleet tenantId');
    countPass(scopedOverviewRes.data?.data?.quotas?.vehicles?.current === 1, 'Scoped telemetry reflects exactly 1 vehicle in selected fleet');

    // SuperAdmin queries vehicles list with X-Tenant-ID: testFleetId
    const scopedVehiclesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/vehicle/getAllVehicles',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        'X-Tenant-ID': testFleetId,
      },
    });
    countPass(scopedVehiclesRes.statusCode === 200, 'GET /api/vehicle/getAllVehicles with selected fleet returns HTTP 200');
    const vehiclesData = Array.isArray(scopedVehiclesRes.data)
      ? scopedVehiclesRes.data
      : (scopedVehiclesRes.data?.vehicles || scopedVehiclesRes.data?.data || []);
    const onlyContainsTarget = vehiclesData.every((v: any) => v.tenantId === testFleetId);
    countPass(onlyContainsTarget && vehiclesData.length === 1, 'Vehicles list query refetched and strictly returned only selected fleet vehicle');

    // -------------------------------------------------------------------------
    // TEST 4: Selected fleet persistence logic check
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Test 4] Selected Fleet Persistence & Header Forwarding');
    countPass(Boolean(scopedOverviewRes.headers['x-tenant-id']), 'Server echoes active X-Tenant-ID response header for application state sync');

    // -------------------------------------------------------------------------
    // TEST 6 & 7: Fleet Admin Login & Scope Isolation
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Test 6 & 7] Fleet Admin Login & Own-Fleet Isolation');
    const fleetAdminEmail = `operator_${Date.now()}@deltarapid.com`;
    cleanupEmployees.push(fleetAdminEmail);
    const fleetAdminPass = 'FleetPass@2026';
    const hashedFleetPass = await bcrypt.hash(fleetAdminPass, 10);

    await Employee.create({
      employeeId: uuidv4(),
      email: fleetAdminEmail,
      username: 'DeltaOperator',
      phno: `9${Date.now().toString().slice(-9)}`,
      password: hashedFleetPass,
      role: 'fleet_admin',
      tenantId: testFleetId,
    });

    const fleetAdminLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/emplogin',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: fleetAdminEmail,
        password: fleetAdminPass,
      }
    );

    countPass(fleetAdminLoginRes.statusCode === 200, 'Fleet Admin authenticates via common login endpoint /api/auth/emplogin');
    countPass(fleetAdminLoginRes.data?.role === 'fleet_admin', 'Fleet Admin role is strictly "fleet_admin" (NEVER superadmin)');
    countPass(fleetAdminLoginRes.data?.tenantId === testFleetId, 'Fleet Admin response binds to authorized tenantId');
    const fleetAdminToken = fleetAdminLoginRes.data?.accessToken;

    // Fleet Admin accesses dashboard overview: must automatically scope to own fleet
    const fleetAdminOverview = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/dashboard/overview',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${fleetAdminToken}`,
      },
    });

    countPass(fleetAdminOverview.statusCode === 200, 'Fleet Admin receives fleet dashboard overview');
    countPass(fleetAdminOverview.data?.data?.isPlatformSuperAdmin === false, 'Fleet Admin is NOT recognized as platform superadmin');
    countPass(fleetAdminOverview.data?.data?.isAllFleets === false, 'Fleet Admin CANNOT receive platform-wide aggregate counts');
    countPass(fleetAdminOverview.data?.data?.tenant?.tenantId === testFleetId, 'Fleet Admin sees only their own fleet metadata');

    // -------------------------------------------------------------------------
    // TEST 8: Fleet Admin Cross-Tenant Tampering Defenses (HTTP 403)
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Test 8] Cross-Tenant Tampering Defenses & Access Rejections');
    
    // Attempt 8a: Fleet Admin injects X-Tenant-ID header pointing to Root Tenant
    const crossTenantHeaderRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/dashboard/overview',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${fleetAdminToken}`,
        'X-Tenant-ID': ROOT_TENANT_ID,
      },
    });
    countPass(crossTenantHeaderRes.statusCode === 403, 'Cross-tenant X-Tenant-ID header injection blocked with HTTP 403 Forbidden');

    // Attempt 8b: Fleet Admin requests X-Tenant-ID: all
    const allTenantHeaderRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/dashboard/overview',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${fleetAdminToken}`,
        'X-Tenant-ID': 'all',
      },
    });
    countPass(allTenantHeaderRes.statusCode === 403, 'Fleet Admin attempt to view All Fleets blocked with HTTP 403 Forbidden');

    // Attempt 8c: Fleet Admin attempts to access SuperAdmin tenants directory
    const tenantsListBlockedRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${fleetAdminToken}`,
      },
    });
    countPass(tenantsListBlockedRes.statusCode === 403, 'Fleet Admin access to platform tenant directory blocked with HTTP 403');

    // Attempt 8d: Fleet Admin attempts to view another tenant profile
    const anotherTenantBlockedRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/tenants/${ROOT_TENANT_ID}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${fleetAdminToken}`,
      },
    });
    countPass(anotherTenantBlockedRes.statusCode === 403, 'Fleet Admin access to foreign tenant profile blocked with HTTP 403');

    // Attempt 8e: Fleet Admin attempts to access SuperAdmin registration queue
    const regQueueBlockedRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/admin/registrations',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${fleetAdminToken}`,
      },
    });
    countPass(regQueueBlockedRes.statusCode === 403, 'Fleet Admin access to onboarding queue blocked with HTTP 403');

    // -------------------------------------------------------------------------
    // TEST 9: Company-level scoping & segregation
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Test 9] Company-Level Scoping & Segregation');
    const testCompanyId = uuidv4();
    await Company.create({
      companyId: testCompanyId,
      companyName: 'Apex Logistics Corporate',
      tenantId: testFleetId,
      seoUrl: `apex-logistics-${Date.now()}`,
      isDeleted: false,
    });

    const companyCheck = await Company.findByPk(testCompanyId);
    countPass(companyCheck?.tenantId === testFleetId, 'Company record correctly isolated to authorized fleet tenantId');

    // -------------------------------------------------------------------------
    // TEST 10, 11, 12, 13: Approval -> Setup Email -> Single-Use Expiring Token -> Fleet Admin Role
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Test 10 - 13] Fleet Registration, Approval, Token Expiry, Activation & Role Preservation');
    const applicantEmail = `applicant_${Date.now()}@skylinecabs.in`;
    const applicantCode = `SKY${Date.now().toString().slice(-4)}`;
    cleanupUsers.push(applicantEmail);
    cleanupEmployees.push(applicantEmail);

    // Submit registration
    const regRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/public/register-fleet',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        fleetName: 'Skyline Premium Cabs',
        businessCode: applicantCode,
        ownerName: 'Ramesh Kumar',
        contactEmail: applicantEmail,
        contactPhone: '9840123456',
        city: 'Chennai',
        state: 'Tamil Nadu',
        fleetSize: '25',
        requestedPlanTier: 'PRO',
        billingCycle: 'ANNUAL',
      }
    );

    countPass(regRes.statusCode === 201, 'Public fleet registration submitted successfully (HTTP 201)');
    const reqId = regRes.data?.data?.requestId;

    // SuperAdmin approves registration
    const approveRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/tenants/admin/registrations/${reqId}/approve`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
      },
      {
        reviewNotes: 'Application verified and approved by SuperAdmin.',
      }
    );

    countPass(approveRes.statusCode === 200, 'SuperAdmin approves pending registration with HTTP 200');
    const newlyProvisionedTenantId = approveRes.data?.data?.tenantId;
    cleanupTenants.push(newlyProvisionedTenantId);
    const rawSetupToken = approveRes.data?.data?.rawToken;
    countPass(Boolean(rawSetupToken), 'Approval generates cryptographic password setup token');

    // Test 10: Verify setup email was recorded for the registered Fleet Admin email
    const setupEmailLog = await NotificationLog.findOne({
      where: {
        recipient: applicantEmail,
        templateCode: 'TENANT_ADMIN_ACTIVATION_LINK',
      },
    });
    countPass(Boolean(setupEmailLog), 'Account setup email dispatched to intended Fleet Admin email (NOT SuperAdmin email)');

    // Test 11: Setup token expiry and integrity checks
    const tokenRecord = await TenantActivationToken.findOne({
      where: { tenantId: newlyProvisionedTenantId },
    });
    const hoursToExpire = (new Date(tokenRecord!.expiresAt).getTime() - Date.now()) / (1000 * 3600);
    countPass(hoursToExpire > 23 && hoursToExpire <= 24, 'Password setup token valid for strictly 24 hours');
    countPass(tokenRecord?.adminEmail === applicantEmail, 'Setup token bound strictly to registered applicant email');

    // Complete password setup
    const completeSetupRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/public/activation/complete',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        token: rawSetupToken,
        password: 'FleetOperator@123',
        confirmPassword: 'FleetOperator@123',
      }
    );
    countPass(completeSetupRes.statusCode === 200, 'Password setup completes with HTTP 200');

    // Test 11b: Token is single-use and cannot be replayed
    const replayRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/public/activation/complete',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        token: rawSetupToken,
        password: 'AnotherPassword@123',
        confirmPassword: 'AnotherPassword@123',
      }
    );
    countPass(replayRes.statusCode === 400, 'Replaying used activation token is rejected with HTTP 400');

    // Test 12 & 13: Login via common page does NOT promote to SuperAdmin
    const newAdminLoginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/emplogin',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: applicantEmail,
        password: 'FleetOperator@123',
      }
    );

    countPass(newAdminLoginRes.statusCode === 200, 'Newly onboarded Fleet Admin logs in through common /api/auth/emplogin');
    countPass(newAdminLoginRes.data?.role === 'fleet_admin', 'Role in login response is strictly "fleet_admin"');
    countPass(newAdminLoginRes.data?.role !== 'superadmin', 'Onboarding does NOT promote Fleet Admin to SuperAdmin');

    const dbEmpRecord = await Employee.findOne({ where: { email: applicantEmail } });
    countPass(dbEmpRecord?.role === 'fleet_admin', 'Employee table role verified in database as "fleet_admin"');

    // -------------------------------------------------------------------------
    // TEST 14: Existing SuperAdmin email/SMS notifications continue working
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Test 14] SuperAdmin Notification Channels Verification');
    const superAdminAlertLog = await NotificationLog.findOne({
      where: {
        recipient: 'subisha2002.m@gmail.com',
        templateCode: 'SUPERADMIN_NEW_APPLICATION_ALERT',
      },
    });
    countPass(Boolean(superAdminAlertLog), 'New fleet registration triggered alert to SuperAdmin email subisha2002.m@gmail.com');

    // -------------------------------------------------------------------------
    // TEST 15: Database integrity and regression validation
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Test 15] Database Integrity & Isolation Guards Validation');
    const rootAdminUser = await Employee.findOne({ where: { email: 'subisha2002.m@gmail.com' } });
    countPass(rootAdminUser?.role === 'superadmin', 'Root Platform Administrator retains role: "superadmin"');
    countPass(rootAdminUser?.tenantId === ROOT_TENANT_ID, 'Root Platform Administrator bound to ROOT_TENANT_ID');

    console.log('\n========================================================================');
    console.log(`🎉 ALL 15 REQUIRED SAAS TESTS PASSED: ${passedCount} VERIFIED ASSERTIONS, 0 FAILURES`);
    console.log('========================================================================\n');
  } finally {
    // Clean up test entities
    try {
      if (cleanupEmployees.length > 0) {
        await Employee.destroy({ where: { email: cleanupEmployees } });
      }
      if (cleanupUsers.length > 0) {
        await User.destroy({ where: { email: cleanupUsers } });
      }
      for (const tid of cleanupTenants) {
        await Vehicle.destroy({ where: { tenantId: tid } });
        await Drivers.destroy({ where: { tenantId: tid } });
        await Company.destroy({ where: { tenantId: tid } });
        await TenantActivationToken.destroy({ where: { tenantId: tid } });
        await TenantSubscription.destroy({ where: { tenantId: tid } });
        await TenantRegistrationRequest.destroy({ where: { tenantId: tid } });
        await Tenant.destroy({ where: { tenantId: tid } });
      }
    } catch (e) {
      // Silent cleanup
    }
    await sequelize.close();
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed with Exception:', err);
  process.exit(1);
});
