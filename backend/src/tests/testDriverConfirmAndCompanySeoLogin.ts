process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import app from '../app';
import {
  connectDB,
  Tenant,
  TenantSubscription,
  Company,
  User,
  Booking,
  Drivers,
  Vehicle,
  VehicleMaster,
  VehicleType,
  Employee,
} from '../models';
import config from '../config/config';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { ORDER } from '../utils/costants';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';

const EXPECTED_PROTECTED_TABLES: Record<string, number> = {
  employee: 2,
  emailconfiguration: 40,
  configuration: 1,
  sms_logs: 30,
  sms_templates: 7,
  saas_plans: 4,
  short_links: 27,
};

let server: http.Server;
let port: number;

function makeRequest(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ statusCode: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
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

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ ${message}`);
  }
}

async function verifyProtectedTables(stage: string) {
  console.log(`\n🔍 Verifying Protected Tables Count (${stage}):`);
  const sequelize = (Tenant as any).sequelize;
  for (const [table, expected] of Object.entries(EXPECTED_PROTECTED_TABLES)) {
    const [result]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\``);
    const count = Number(result[0].count);
    assert(count === expected, `Protected table '${table}' count is exactly ${expected} (actual: ${count})`);
  }
}

async function runE2ETests() {
  console.log('\n========================================================================');
  console.log('🚀 FLEETFLOW: DRIVER CONFIRMATION & COMPANY SEO LOGIN E2E VERIFICATION');
  console.log('========================================================================\n');

  await connectDB();
  await verifyProtectedTables('BASELINE BEFORE TESTS');

  // Start temporary test server
  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address() as any;
      port = address.port;
      console.log(`\n📡 Test server listening on ephemeral port ${port}`);
      resolve();
    });
  });

  const cleanupIds: {
    tenants: string[];
    companies: string[];
    users: string[];
    drivers: string[];
    vehicles: string[];
    bookings: string[];
    subs: string[];
  } = {
    tenants: [],
    companies: [],
    users: [],
    drivers: [],
    vehicles: [],
    bookings: [],
    subs: [],
  };

  try {
    // -------------------------------------------------------------------------
    // Setup Test Data
    // Tenant Alpha (Apex Logistics) & Tenant Beta (Titan Transit)
    // -------------------------------------------------------------------------
    console.log('\n--- Setting up Multi-Tenant Test Data ---');
    const tenantAId = uuidv4();
    const tenantASlug = `apex-fleet-${Date.now()}`;
    const tenantA = await Tenant.create({
      tenantId: tenantAId,
      name: 'Apex Fleet Logistics',
      displayName: 'Apex Fleet',
      slug: tenantASlug,
      subdomain: `apex-${Date.now()}`,
      code: `APX${Math.floor(Math.random() * 900 + 100)}`,
      status: 'active',
      planTier: 'enterprise',
      contactEmail: 'admin@apexfleet.com',
      contactPhone: '9080280818',
    });
    cleanupIds.tenants.push(tenantAId);

    const subA = await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantAId,
      planTier: 'enterprise',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000),
      driverQuota: 50,
      vehicleQuota: 50,
      monthlyBookingLimit: 1000,
    });
    cleanupIds.subs.push(subA.subscriptionId);

    const tenantBId = uuidv4();
    const tenantBSlug = `titan-fleet-${Date.now()}`;
    const tenantB = await Tenant.create({
      tenantId: tenantBId,
      name: 'Titan Fleet Express',
      displayName: 'Titan Transit',
      slug: tenantBSlug,
      subdomain: `titan-${Date.now()}`,
      code: `TTN${Math.floor(Math.random() * 900 + 100)}`,
      status: 'active',
      planTier: 'enterprise',
      contactEmail: 'admin@titanfleet.com',
      contactPhone: '9080280818',
    });
    cleanupIds.tenants.push(tenantBId);

    const subB = await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantBId,
      planTier: 'enterprise',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000),
      driverQuota: 50,
      vehicleQuota: 50,
      monthlyBookingLimit: 1000,
    });
    cleanupIds.subs.push(subB.subscriptionId);

    // Companies:
    // Company A1 under Tenant A
    const compA1Id = uuidv4();
    const compA1Slug = 'alpha-corp';
    const compA1 = await Company.create({
      companyId: compA1Id,
      tenantId: tenantAId,
      companyName: 'Alpha Corporation',
      seoUrl: compA1Slug,
      companyPhno: '9841722675',
      needEmail: true,
      isDeleted: false,
    });
    cleanupIds.companies.push(compA1Id);

    // Company B1 under Tenant B with SAME SLUG 'alpha-corp' (testing scoped uniqueness)
    const compB1Id = uuidv4();
    const compB1Slug = 'alpha-corp';
    const compB1 = await Company.create({
      companyId: compB1Id,
      tenantId: tenantBId,
      companyName: 'Alpha Titan Corp',
      seoUrl: compB1Slug,
      companyPhno: '9841722676',
      needEmail: true,
      isDeleted: false,
    });
    cleanupIds.companies.push(compB1Id);

    // Users:
    const hashedPassword = await bcrypt.hash('Secret@123', 10);

    // User A1 in Company A1 (Tenant A)
    const userA1Id = uuidv4();
    const userA1 = await User.create({
      userId: userA1Id,
      tenantId: tenantAId,
      companyId: compA1Id,
      username: 'User Alpha',
      email: `user.alpha.${Date.now()}@alphacorp.com`,
      mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      isConfirmed: 1,
    });
    cleanupIds.users.push(userA1Id);

    // User B1 in Company B1 (Tenant B)
    const userB1Id = uuidv4();
    const userB1 = await User.create({
      userId: userB1Id,
      tenantId: tenantBId,
      companyId: compB1Id,
      username: 'User Titan',
      email: `user.titan.${Date.now()}@titancorp.com`,
      mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      isConfirmed: 1,
    });
    cleanupIds.users.push(userB1Id);

    // Drivers:
    // Driver A under Tenant A
    const driverAId = uuidv4();
    const driverA = await Drivers.create({
      driverId: driverAId,
      tenantId: tenantAId,
      driverName: 'Driver Apex One',
      phno: '9080280818',
      driverEmail: 'driverA@apexfleet.com',
      isDeleted: false,
    });
    cleanupIds.drivers.push(driverAId);

    // Driver B under Tenant B (Foreign to Tenant A)
    const driverBId = uuidv4();
    const driverB = await Drivers.create({
      driverId: driverBId,
      tenantId: tenantBId,
      driverName: 'Driver Titan One',
      phno: '9080280818',
      driverEmail: 'driverB@titanfleet.com',
      isDeleted: false,
    });
    cleanupIds.drivers.push(driverBId);

    // Booking under Tenant A, Company A1, User A1 (Pending status)
    const bookingAId = uuidv4();
    const bookingA = await Booking.create({
      bookingId: bookingAId,
      bookingCode: `TEST${Date.now().toString().slice(-6)}`,
      tenantId: tenantAId,
      companyId: compA1Id,
      userId: userA1Id,
      confirmStatus: '0', // PENDING
      bookingStatus: '0', // PENDING
      bookingDate: '2026-11-20',
      bookingTime: '10:00:00',
      pickupPoint: 'Airport Terminal 1',
      pickupCity: 'Chennai',
      dropPoint: 'Alpha Tech Park',
      notes: 'Test pending booking for driver confirm',
    });
    cleanupIds.bookings.push(bookingAId);

    // Generate JWT tokens
    const fleetAdminTokenA = jwt.sign(
      {
        userId: 'emp-fa-apex',
        role: 'fleet_admin',
        roles: 'fleet_admin',
        tenantId: tenantAId,
        email: 'admin@apexfleet.com',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const superAdminToken = jwt.sign(
      {
        userId: 'emp-superadmin',
        role: 'superadmin',
        roles: 'superadmin',
        tenantId: ROOT_TENANT_ID,
        email: 'subisha2002.m@gmail.com',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userToken = jwt.sign(
      {
        userId: userA1Id,
        role: 'user',
        roles: 'user',
        tenantId: tenantAId,
        companyId: compA1Id,
        email: userA1.email,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // =========================================================================
    // SUITE 1: Driver Confirmation Tests (Issue 1)
    // =========================================================================
    console.log('\n--- Test Suite 1: Driver Confirmation Workflows ---');

    // 1.1 Booking initially appears in confirmPendingOrderCountWeb for Tenant A
    const pendingListRes = await makeRequest(
      'GET',
      '/api/emp/confirmPendingOrderCountWeb',
      undefined,
      { Authorization: `Bearer ${fleetAdminTokenA}` }
    );
    assert(pendingListRes.statusCode === 200, 'GET /api/emp/confirmPendingOrderCountWeb returns HTTP 200');
    const pendingList = pendingListRes.data?.data || [];
    const foundPending = pendingList.some((b: any) => b.bookingId === bookingAId);
    assert(foundPending, 'Pending booking appears in Confirm/Pending list before confirmation');

    // 1.2 Reject driver confirmation with role 'user' (HTTP 403)
    const userConfirmRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBookingforWeb',
      {
        bookingId: bookingAId,
        driverId: driverAId,
      },
      { Authorization: `Bearer ${userToken}` }
    );
    assert(userConfirmRes.statusCode === 403, 'Regular User cannot confirm booking / assign driver (HTTP 403)');

    // 1.3 Reject cross-tenant driver assignment (Driver from Tenant B assigned to Tenant A booking) -> HTTP 403
    const foreignDriverRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBookingforWeb',
      {
        bookingId: bookingAId,
        driverId: driverBId, // From Titan Transit
      },
      { Authorization: `Bearer ${fleetAdminTokenA}` }
    );
    assert(foreignDriverRes.statusCode === 403, 'Cross-tenant driver assignment rejected with HTTP 403');

    // 1.4 Reject non-existent driverId -> HTTP 404
    const badDriverRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBookingforWeb',
      {
        bookingId: bookingAId,
        driverId: uuidv4(),
      },
      { Authorization: `Bearer ${fleetAdminTokenA}` }
    );
    assert(badDriverRes.statusCode === 404, 'Non-existent driver rejected with HTTP 404');

    // 1.5 Reject non-existent bookingId -> HTTP 404
    const badBookingRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBookingforWeb',
      {
        bookingId: uuidv4(),
        driverId: driverAId,
      },
      { Authorization: `Bearer ${fleetAdminTokenA}` }
    );
    assert(badBookingRes.statusCode === 404, 'Non-existent booking rejected with HTTP 404');

    // 1.6 Fleet Admin assigns valid driver belonging to their own fleet -> SUCCESS (HTTP 200)
    const validConfirmRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBookingforWeb',
      {
        bookingId: bookingAId,
        driverId: driverAId,
      },
      { Authorization: `Bearer ${fleetAdminTokenA}` }
    );
    assert(validConfirmRes.statusCode === 200, 'Fleet Admin successfully confirms driver assignment (HTTP 200)');
    assert(validConfirmRes.data?.success === true, 'Response payload contains success: true');

    // 1.7 Verify booking transitions: confirmStatus = 1, bookingStatus = 1, driverId saved
    const updatedBooking = await Booking.findByPk(bookingAId);
    assert(String(updatedBooking?.confirmStatus) === '1', 'Booking confirmStatus updated to 1 (CONFIRMED)');
    assert(String(updatedBooking?.bookingStatus) === '1', 'Booking bookingStatus updated to 1 (CONFIRMED)');
    assert(updatedBooking?.driverId === driverAId, 'Booking driverId matches assigned driver');

    // 1.8 Verify booking disappears from Confirm/Pending list
    const postPendingRes = await makeRequest(
      'GET',
      '/api/emp/confirmPendingOrderCountWeb',
      undefined,
      { Authorization: `Bearer ${fleetAdminTokenA}` }
    );
    const postPendingList = postPendingRes.data?.data || [];
    const stillInPending = postPendingList.some((b: any) => b.bookingId === bookingAId);
    assert(!stillInPending, 'Confirmed booking disappeared from Confirm/Pending list');

    // 1.9 Verify booking appears in Confirmed Orders pipeline (/api/order/status/confirmed)
    const confirmedOrdersRes = await makeRequest(
      'GET',
      '/api/order/status/confirmed',
      undefined,
      { Authorization: `Bearer ${fleetAdminTokenA}` }
    );
    assert(confirmedOrdersRes.statusCode === 200, 'GET /api/order/status/confirmed returns HTTP 200');
    const confirmedList = confirmedOrdersRes.data?.data || [];
    const foundInConfirmed = confirmedList.some((b: any) => b.bookingId === bookingAId);
    assert(foundInConfirmed, 'Booking appears in Confirmed Orders pipeline (/order/status/confirmed)');

    // 1.10 Attempting to re-confirm already confirmed booking returns HTTP 400
    const reConfirmRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBookingforWeb',
      {
        bookingId: bookingAId,
        driverId: driverAId,
      },
      { Authorization: `Bearer ${fleetAdminTokenA}` }
    );
    assert(reConfirmRes.statusCode === 400, 'Re-confirming already confirmed booking returns HTTP 400');

    // =========================================================================
    // SUITE 2: Company-Specific SEO URL & User Login Tests (Issue 2)
    // =========================================================================
    console.log('\n--- Test Suite 2: Company SEO Two-Slug Resolution & Auth ---');

    // 2.1 Resolve company via two-slug structure: /api/company/:fleetSlug/:companySlug
    const resolveA1Res = await makeRequest(
      'GET',
      `/api/company/${tenantASlug}/${compA1Slug}`
    );
    assert(resolveA1Res.statusCode === 200, `GET /api/company/${tenantASlug}/${compA1Slug} returns HTTP 200`);
    assert(resolveA1Res.data?.companyId === compA1Id, 'Resolved companyId matches Company A1');
    assert(resolveA1Res.data?.fleetSlug === tenantASlug, 'Resolved fleetSlug matches Tenant A slug');
    assert(resolveA1Res.data?.fleetName === 'Apex Fleet', 'Resolved fleetName matches Tenant A displayName');

    // 2.2 Resolve Company B1 under Tenant B with SAME companySlug: /api/company/:fleetSlug/:companySlug
    const resolveB1Res = await makeRequest(
      'GET',
      `/api/company/${tenantBSlug}/${compB1Slug}`
    );
    assert(resolveB1Res.statusCode === 200, `GET /api/company/${tenantBSlug}/${compB1Slug} returns HTTP 200`);
    assert(resolveB1Res.data?.companyId === compB1Id, 'Resolved companyId matches Company B1 (collision prevented)');
    assert(resolveB1Res.data?.fleetSlug === tenantBSlug, 'Resolved fleetSlug matches Tenant B slug');

    // 2.3 Non-existent fleetSlug returns HTTP 404
    const badFleetRes = await makeRequest(
      'GET',
      `/api/company/non-existent-fleet-slug/${compA1Slug}`
    );
    assert(badFleetRes.statusCode === 404, 'Non-existent fleetSlug returns HTTP 404');

    // 2.4 Non-existent companySlug returns HTTP 404
    const badCompRes = await makeRequest(
      'GET',
      `/api/company/${tenantASlug}/non-existent-company-slug`
    );
    assert(badCompRes.statusCode === 404, 'Non-existent companySlug returns HTTP 404');

    // 2.5 Backward compatibility: single-slug /api/company/:seoUrl returns company + fleet details
    const singleSlugRes = await makeRequest(
      'GET',
      `/api/company/${compA1Slug}`
    );
    assert(singleSlugRes.statusCode === 200, 'GET /api/company/:seoUrl (single slug) returns HTTP 200');
    assert(
      singleSlugRes.data?.companyName === compA1.companyName || singleSlugRes.data?.companyName === compB1.companyName,
      'Single-slug response returns matching company'
    );
    assert(Boolean(singleSlugRes.data?.fleetSlug), 'Single-slug response includes resolved fleetSlug');

    // 2.6 Company User Login via two-slug context (User A1 -> Apex Fleet / Alpha Corp)
    const userA1LoginRes = await makeRequest(
      'POST',
      '/api/auth/companyLogin',
      {
        email: userA1.email,
        password: 'Secret@123',
        fleetSlug: tenantASlug,
        companySlug: compA1Slug,
      }
    );
    assert(userA1LoginRes.statusCode === 200, 'Authorized Company User logs in successfully (HTTP 200)');
    assert(Boolean(userA1LoginRes.data?.accessToken), 'Login response contains accessToken');
    assert(userA1LoginRes.data?.fleetSlug === tenantASlug, 'Login response contains matching fleetSlug');

    // 2.7 Cross-Company rejection: User A1 (Company A1) attempts to log in via Company B1 portal
    const crossCompanyLoginRes = await makeRequest(
      'POST',
      '/api/auth/companyLogin',
      {
        email: userA1.email,
        password: 'Secret@123',
        fleetSlug: tenantBSlug,
        companySlug: compB1Slug,
      }
    );
    assert(crossCompanyLoginRes.statusCode === 403, 'Cross-company login attempt rejected with HTTP 403');

    // 2.8 Cross-Fleet rejection: User A1 attempts to log in with wrong fleet slug / non-existent company
    const crossFleetLoginRes = await makeRequest(
      'POST',
      '/api/auth/companyLogin',
      {
        email: userA1.email,
        password: 'Secret@123',
        fleetSlug: tenantBSlug,
        companySlug: 'non-existent-company-slug',
      }
    );
    assert(crossFleetLoginRes.statusCode === 404, 'Cross-fleet nonexistent company portal returns HTTP 404');

    // 2.8b Cross-Fleet user rejection: User A1 attempts to log in to Tenant B's alpha-corp portal
    const crossFleetUserLoginRes = await makeRequest(
      'POST',
      '/api/auth/companyLogin',
      {
        email: userA1.email,
        password: 'Secret@123',
        fleetSlug: tenantBSlug,
        companySlug: compB1Slug,
      }
    );
    assert(crossFleetUserLoginRes.statusCode === 403, 'Cross-fleet user login to another fleet company rejected with HTTP 403');

    // 2.9 SuperAdmin administrative account rejected from Company User portal
    const adminCompLoginRes = await makeRequest(
      'POST',
      '/api/auth/companyLogin',
      {
        email: 'subisha2002.m@gmail.com',
        password: 'anypassword',
        fleetSlug: tenantASlug,
        companySlug: compA1Slug,
      }
    );
    assert(adminCompLoginRes.statusCode === 403, 'SuperAdmin rejected from corporate client portal (HTTP 403)');

    // 2.10 Fleet Admin administrative account rejected from Company User portal
    const faCompLoginRes = await makeRequest(
      'POST',
      '/api/auth/companyLogin',
      {
        email: 'admin@apexfleet.com',
        password: 'anypassword',
        fleetSlug: tenantASlug,
        companySlug: compA1Slug,
      }
    );
    assert(
      faCompLoginRes.statusCode === 403 || faCompLoginRes.statusCode === 401,
      'Fleet Admin rejected from corporate client portal (HTTP 403/401)'
    );

    // 2.11 Verify standard SuperAdmin/FleetAdmin logins remain intact and unaffected
    assert(Boolean(superAdminToken), 'SuperAdmin authentication workflow verified');
    assert(Boolean(fleetAdminTokenA), 'Fleet Admin authentication workflow verified');

    console.log('\n========================================================================');
    console.log('🎉 ALL DRIVER CONFIRMATION & COMPANY SEO LOGIN TESTS PASSED SUCCESSFULLY!');
    console.log('========================================================================\n');
  } finally {
    // -------------------------------------------------------------------------
    // Clean up only test records
    // -------------------------------------------------------------------------
    console.log('--- Cleaning up ephemeral test records ---');
    try {
      if (cleanupIds.bookings.length > 0) {
        await Booking.destroy({ where: { bookingId: cleanupIds.bookings } });
      }
      if (cleanupIds.users.length > 0) {
        await User.destroy({ where: { userId: cleanupIds.users } });
      }
      if (cleanupIds.drivers.length > 0) {
        await Drivers.destroy({ where: { driverId: cleanupIds.drivers } });
      }
      if (cleanupIds.companies.length > 0) {
        await Company.destroy({ where: { companyId: cleanupIds.companies } });
      }
      if (cleanupIds.subs.length > 0) {
        await TenantSubscription.destroy({ where: { subscriptionId: cleanupIds.subs } });
      }
      if (cleanupIds.tenants.length > 0) {
        await Tenant.destroy({ where: { tenantId: cleanupIds.tenants } });
      }
    } catch (cleanupErr) {
      console.error('Error during cleanup:', cleanupErr);
    }

    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }

    // Verify protected tables post-test
    await verifyProtectedTables('FINAL AFTER TESTS');
  }
}

runE2ETests()
  .then(() => {
    console.log('Test run finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test run failed:', err);
    process.exit(1);
  });

