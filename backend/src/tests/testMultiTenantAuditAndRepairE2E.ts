process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import app from '../app';
import { connectDB, Tenant, TenantSubscription, Company, User, Booking, NotificationLog } from '../models';
import config from '../config/config';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { Sequelize, QueryTypes } from 'sequelize';

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

async function runAuditAndRepairVerification() {
  console.log('\n========================================================================');
  console.log('🚀 FLEETFLOW: MULTI-TENANT FLEET ADMIN AUDIT & REPAIR E2E VERIFICATION');
  console.log('========================================================================\n');

  await connectDB();

  // 1. Verify Protected Tables Data Integrity
  console.log('--- Step 1: Protected Tables Baseline Integrity Check ---');
  const sequelize = Tenant.sequelize as Sequelize;
  for (const [table, expectedCount] of Object.entries(EXPECTED_PROTECTED_TABLES)) {
    const [result]: any = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`${table}\``, {
      type: QueryTypes.SELECT,
    });
    const count = Number(result?.cnt ?? 0);
    assert(count === expectedCount, `Protected table '${table}' has exact count ${expectedCount} (actual: ${count})`);
  }

  // 2. Start HTTP server on ephemeral port
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address() as any;
      port = address.port;
      console.log(`\n  Test HTTP server running on ephemeral port: ${port}`);
      resolve();
    });
  });

  const testTenantId = uuidv4();
  const testTenantCode = 'TTA';
  const testTenantSlug = `test-alpha-fleet-${Date.now()}`;
  let createdTenant: any = null;
  let createdSub: any = null;
  let createdCompany: any = null;
  let createdUser: any = null;
  let createdBooking: any = null;

  try {
    // 3. Create active test fleet with PRO plan and custom branding
    console.log('\n--- Step 2: Fleet Provisioning & Subscription ---');
    createdTenant = await Tenant.create({
      tenantId: testTenantId,
      name: 'Titan Transit Alpha',
      displayName: 'Titan Transit Alpha Logistics',
      code: testTenantCode,
      subdomain: `titantransit-${Date.now()}`,
      slug: testTenantSlug,
      status: 'ACTIVE',
      planTier: 'PRO',
      contactEmail: `admin@${testTenantSlug}.com`,
      logoUrl: 'https://cdn.fleetflow.io/logos/titan-transit.png',
      brandingTokens: {
        primaryColor: '#008080',
        portalTitle: 'Titan Transit Operations Hub',
        logoUrl: 'https://cdn.fleetflow.io/logos/titan-transit.png',
      },
    });

    createdSub = await TenantSubscription.create({
      tenantId: testTenantId,
      planTier: 'PRO',
      status: 'ACTIVE',
      vehicleQuota: 75,
      driverQuota: 75,
      companyQuota: 20,
      monthlyTripQuota: 250,
      allowOverage: false,
      billingCycle: 'MONTHLY',
      agreedPrice: 349,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    });
    assert(!!createdTenant && !!createdSub, 'Test Fleet and PRO Subscription provisioned');

    // Create Fleet Admin JWT Token
    const fleetAdminToken = jwt.sign(
      {
        userId: uuidv4(),
        role: 'fleet_admin',
        roles: 'fleet_admin',
        tenantId: testTenantId,
        email: `admin@${testTenantSlug}.com`,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Create SuperAdmin JWT Token
    const superAdminToken = jwt.sign(
      {
        userId: '99999999-9999-9999-9999-999999999999',
        role: 'superadmin',
        roles: 'superadmin',
        tenantId: ROOT_TENANT_ID,
        email: 'subisha2002.m@gmail.com',
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 4. Phase 1: Fleet Branding Verification
    console.log('\n--- Step 3: Phase 1 — Fleet Branding & Profile Verification ---');
    const profileRes = await makeRequest('GET', '/api/tenants/current/profile', undefined, {
      Authorization: `Bearer ${fleetAdminToken}`,
    });
    assert(profileRes.statusCode === 200, 'GET /api/tenants/current/profile returns HTTP 200');
    assert(profileRes.data?.tenant?.tenantId === testTenantId, 'Tenant profile matches authenticated Fleet Admin tenantId');
    assert(profileRes.data?.tenant?.name === 'Titan Transit Alpha', 'Tenant profile returns correct fleet name');
    assert(profileRes.data?.tenant?.displayName === 'Titan Transit Alpha Logistics', 'Tenant profile returns correct displayName');
    assert(profileRes.data?.tenant?.logoUrl === 'https://cdn.fleetflow.io/logos/titan-transit.png', 'Tenant profile returns custom logoUrl');
    assert(profileRes.data?.tenant?.brandingTokens?.primaryColor === '#008080', 'Tenant profile returns brandingTokens');

    // 5. Phase 2: Subscription Plan Display & Quotas Verification
    console.log('\n--- Step 4: Phase 2 — Subscription Plan & Quotas Alignment ---');
    const statsRes = await makeRequest('GET', '/api/tenants/dashboard/stats', undefined, {
      Authorization: `Bearer ${fleetAdminToken}`,
    });
    assert(statsRes.statusCode === 200, 'GET /api/tenants/dashboard/stats returns HTTP 200');
    const statsData = statsRes.data?.data || statsRes.data;
    assert(statsData?.subscription?.planTier === 'PRO', `Subscription planTier matches DB PRO (actual: ${statsData?.subscription?.planTier})`);
    assert(statsData?.subscription?.billingCycle === 'MONTHLY', `Subscription billingCycle is MONTHLY (actual: ${statsData?.subscription?.billingCycle})`);
    assert(statsData?.quotas?.vehicles?.limit === 75, `Vehicle quota limit matches PRO plan (75)`);
    assert(statsData?.quotas?.drivers?.limit === 75, `Driver quota limit matches PRO plan (75)`);
    assert(statsData?.quotas?.companies?.limit === 20, `Company quota limit matches PRO plan (20)`);
    assert(statsData?.quotas?.trips?.limit === 250, `Trips quota limit matches PRO plan (250)`);

    // 6. Phase 3 & 4: Company Creation & Isolation without obsolete checkboxes
    console.log('\n--- Step 5: Phase 3 & 4 — Company Creation without obsolete checkboxes ---');
    const compCode = `COMP_${Date.now().toString().slice(-4)}`;
    const compName = `Corporate Client Alpha ${compCode}`;
    const createCompRes = await makeRequest(
      'POST',
      '/api/emp/createCompany',
      {
        companyName: compName,
        companyCode: compCode,
        domainName: 'corpalpha.com',
        // Notice: NO needEmail, NO managerApproval, NO managerEmail provided!
      },
      { Authorization: `Bearer ${fleetAdminToken}` }
    );
    assert(createCompRes.statusCode === 201, `POST /api/emp/createCompany succeeded without managerEmail/needEmail (HTTP ${createCompRes.statusCode})`);
    createdCompany = createCompRes.data?.company;
    assert(createdCompany?.companyName === compName, 'Created company name matches');
    assert(createdCompany?.tenantId === testTenantId, 'Company belongs strictly to testTenantId');
    assert(createdCompany?.needEmail === true, 'Company needEmail is true by default');
    assert(createdCompany?.managerApproval === false, 'Company managerApproval is false');

    // Verify company list isolation
    const compListRes = await makeRequest('GET', '/api/company/getAllCompany?status=0', undefined, {
      Authorization: `Bearer ${fleetAdminToken}`,
    });
    assert(compListRes.statusCode === 200, 'GET /api/company/getAllCompany returns HTTP 200');
    const companies = compListRes.data?.data || [];
    assert(companies.some((c: any) => c.companyId === createdCompany.companyId), 'Created company is listed in Fleet Admin Company List');
    assert(companies.every((c: any) => c.tenantId === testTenantId), 'All companies in Fleet Admin list belong exclusively to testTenantId');

    // 7. Phase 5: User Creation without obsolete fields
    console.log('\n--- Step 6: Phase 5 — User Creation without obsolete fields ---');
    const userEmail = `emp_${Date.now()}@corpalpha.com`;
    const createUserRes = await makeRequest(
      'POST',
      '/api/auth/createUser',
      {
        username: 'John Doe Client',
        email: userEmail,
        mobile: '9876543210',
        gender: 'male',
        companyId: createdCompany.companyId,
        userAddress: '123 Tech Park',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        pinCode: '600001',
        // Notice: NO isManager, NO danfossuserId, NO managerId, NO managerEmail, NO costCenter!
      },
      { Authorization: `Bearer ${fleetAdminToken}` }
    );
    assert(createUserRes.statusCode === 200 || createUserRes.statusCode === 201, `POST /api/auth/createUser succeeded (HTTP ${createUserRes.statusCode})`);
    createdUser = await User.findOne({ where: { email: userEmail } });
    assert(!!createdUser, 'User record created in database');
    assert(createdUser.companyId === createdCompany.companyId, 'User belongs to created company');
    assert(createdUser.tenantId === testTenantId, 'User belongs to testTenantId');

    // 8. Phase 6, 7 & 8: Booking Creation -> Orders Workflow Verification
    console.log('\n--- Step 7: Phase 8 — Booking Creation -> Orders Confirm/Pending Pipeline ---');
    const pickupDateStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const createBookingRes = await makeRequest(
      'POST',
      '/api/emp/createBookingForWeb',
      {
        bookingDate: pickupDateStr,
        bookingTime: '10:00:00',
        pickupPoint: 'Tidel Park, Chennai',
        pickupCity: 'Chennai',
        dropPoint: 'Chennai Airport Terminal 2',
        travellersCount: 1,
        femaleCount: 0,
        maleCount: 1,
        remarks: 'Client Airport Transfer',
        purpose: 'Official Business',
        userId: createdUser.userId,
        companyId: createdCompany.companyId,
        bookingCreatedBy: createdUser.userId,
        confirmStatus: '0',
        bookingStatus: 0,
      },
      { Authorization: `Bearer ${fleetAdminToken}` }
    );
    assert(createBookingRes.statusCode === 200 || createBookingRes.statusCode === 201, `POST /api/emp/createBookingForWeb succeeded (HTTP ${createBookingRes.statusCode})`);
    const bookingData = createBookingRes.data?.booking || createBookingRes.data?.data;
    assert(!!bookingData?.bookingId, 'Booking created with valid bookingId');

    createdBooking = await Booking.findByPk(bookingData.bookingId);
    assert(createdBooking.companyId === createdCompany.companyId, 'Booking has correct companyId stored in DB');
    assert(createdBooking.tenantId === testTenantId, 'Booking has correct tenantId stored in DB');
    assert(String(createdBooking.confirmStatus) === '0', 'Booking confirmStatus is 0 (Pending)');

    // Verify booking appears in confirmPendingOrderCountWeb
    const confirmPendingRes = await makeRequest('GET', '/api/emp/confirmPendingOrderCountWeb', undefined, {
      Authorization: `Bearer ${fleetAdminToken}`,
    });
    assert(confirmPendingRes.statusCode === 200, 'GET /api/emp/confirmPendingOrderCountWeb returns HTTP 200');
    assert(confirmPendingRes.data?.count >= 1, `confirmPendingOrderCountWeb count >= 1 (actual: ${confirmPendingRes.data?.count})`);
    const pendingOrders = confirmPendingRes.data?.data || [];
    assert(pendingOrders.some((b: any) => b.bookingId === createdBooking.bookingId), 'Newly created booking is immediately present in confirmPendingOrders pipeline!');

    // Verify booking appears in getAllPendingBooking
    const allPendingRes = await makeRequest('GET', '/api/emp/getAllPendingBooking', undefined, {
      Authorization: `Bearer ${fleetAdminToken}`,
    });
    assert(allPendingRes.statusCode === 200, 'GET /api/emp/getAllPendingBooking returns HTTP 200');
    const allPendingList = allPendingRes.data?.data || [];
    assert(allPendingList.some((b: any) => b.bookingId === createdBooking.bookingId), 'Newly created booking is immediately present in getAllPendingBooking!');

    // Verify Cross-Tenant Isolation: Another tenant CANNOT see this booking
    const foreignTenantId = uuidv4();
    const foreignToken = jwt.sign(
      {
        userId: uuidv4(),
        role: 'fleet_admin',
        roles: 'fleet_admin',
        tenantId: foreignTenantId,
        email: 'admin@foreigntransit.com',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const foreignPendingRes = await makeRequest('GET', '/api/emp/confirmPendingOrderCountWeb', undefined, {
      Authorization: `Bearer ${foreignToken}`,
    });
    const foreignOrders = foreignPendingRes.data?.data || [];
    assert(!foreignOrders.some((b: any) => b.bookingId === createdBooking.bookingId), 'Security Check: Foreign tenant cannot see Titan Transit bookings');

    console.log('\n--- Step 8: Multi-Tenant Verification Successful! ---');
  } finally {
    // 9. Clean up test records created in this verification run
    console.log('\n--- Step 9: Clean Up Ephemeral Test Records ---');
    if (createdBooking) {
      await Booking.destroy({ where: { bookingId: createdBooking.bookingId }, force: true });
    }
    if (createdUser) {
      await User.destroy({ where: { userId: createdUser.userId }, force: true });
    }
    if (createdCompany) {
      await Company.destroy({ where: { companyId: createdCompany.companyId }, force: true });
    }
    if (createdSub) {
      await TenantSubscription.destroy({ where: { tenantId: testTenantId }, force: true });
    }
    if (createdTenant) {
      await Tenant.destroy({ where: { tenantId: testTenantId }, force: true });
    }
    try {
      await NotificationLog.destroy({ where: { tenantId: testTenantId }, force: true });
    } catch {
      // Ignored
    }
    console.log('  Cleaned up ephemeral test records.');

    // 10. Re-verify Protected Tables
    console.log('\n--- Step 10: Final Protected Tables Integrity Check ---');
    for (const [table, expectedCount] of Object.entries(EXPECTED_PROTECTED_TABLES)) {
      const [result]: any = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`${table}\``, {
        type: QueryTypes.SELECT,
      });
      const count = Number(result?.cnt ?? 0);
      assert(count === expectedCount, `Protected table '${table}' intact with exact count ${expectedCount} (actual: ${count})`);
    }

    if (server) {
      server.close();
    }
  }

  console.log('\n========================================================================');
  console.log('🎉 ALL MULTI-TENANT AUDIT & REPAIR VERIFICATION TESTS PASSED (100%)');
  console.log('========================================================================\n');
}

runAuditAndRepairVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  if (server) server.close();
  process.exit(1);
});
