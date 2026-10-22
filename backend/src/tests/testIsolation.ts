import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import config from '../config/config';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';
const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';
const TENANT_B_ID = 'b2222222-2222-2222-2222-222222222222';

// 1. Token for Tenant A (Grace Cabs standard user)
const tenantAUserToken = jwt.sign(
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

// 2. Token for Tenant B (Apex Cabs standard user)
const tenantBUserToken = jwt.sign(
  {
    userId: '22222222-2222-2222-2222-222222222222',
    role: 'admin',
    roles: 'admin',
    tenantId: TENANT_B_ID,
    email: 'admin@apexcabs.com',
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// 3. Legacy Grace Cabs token (issued before SaaS migration without tenantId claim)
const legacyGraceCabsToken = jwt.sign(
  {
    userId: '33333333-3333-3333-3333-333333333333',
    role: 'admin',
    roles: 'admin',
    email: 'legacy.dispatcher@gracecabs.com',
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// 4. Platform SuperAdmin token
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

async function runIsolationSuite() {
  console.log('\n============================================================');
  console.log('🔒 INDEPENDENT TENANT ISOLATION & SECURITY VERIFICATION SUITE');
  console.log('============================================================\n');

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

  // TEST 1: Anonymous requests cannot access protected tenant data
  console.log('🔹 [Test 1] Anonymous Access to Protected Data');
  const anonOrders = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/order/getAllOrders',
    method: 'GET',
  });
  assert(
    anonOrders.statusCode === 401,
    'Anonymous GET /api/order/getAllOrders is rejected with HTTP 401',
    `Status: ${anonOrders.statusCode}`
  );

  const anonConfig = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/config/getConfiguration',
    method: 'GET',
  });
  assert(
    anonConfig.statusCode === 401,
    'Anonymous GET /api/config/getConfiguration is rejected with HTTP 401',
    `Status: ${anonConfig.statusCode}`
  );

  // TEST 2: Anonymous caller cannot select a tenant via arbitrary X-Tenant-ID
  console.log('\n🔹 [Test 2] Header Spoofing by Anonymous Callers');
  const anonSpoof = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/order/getAllOrders',
    method: 'GET',
    headers: {
      'X-Tenant-ID': TENANT_B_ID,
    },
  });
  assert(
    anonSpoof.statusCode === 401,
    'Anonymous caller sending arbitrary X-Tenant-ID header is still rejected with HTTP 401',
    `Status: ${anonSpoof.statusCode}`
  );

  // TEST 3: Authenticated user cannot switch to another tenant
  console.log('\n🔹 [Test 3] Authenticated Cross-Tenant Switching Prevention');
  const userSwitchAttempt = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/order/getAllOrders',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tenantBUserToken}`,
      'X-Tenant-ID': ROOT_TENANT_ID, // Tenant B trying to impersonate Grace Cabs
    },
  });
  assert(
    userSwitchAttempt.statusCode === 403,
    'Authenticated Tenant B user providing X-Tenant-ID for Root Tenant is rejected with HTTP 403 Forbidden',
    `Status: ${userSwitchAttempt.statusCode}, message: ${JSON.stringify(userSwitchAttempt.data)}`
  );

  // TEST 4: Legacy Grace Cabs authenticated user continues to work safely
  console.log('\n🔹 [Test 4] Legacy Grace Cabs User Compatibility');
  const legacyGraceCabsReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/order/getAllOrders',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${legacyGraceCabsToken}`,
    },
  });
  assert(
    legacyGraceCabsReq.statusCode === 200,
    'Legacy Grace Cabs user (token without tenantId claim) resolves to ROOT_TENANT_ID and receives HTTP 200',
    `Status: ${legacyGraceCabsReq.statusCode}`
  );
  assert(
    legacyGraceCabsReq.headers['x-tenant-id'] === ROOT_TENANT_ID,
    'Response header confirms resolution to ROOT_TENANT_ID'
  );

  // TEST 5: Legacy Grace Cabs user cannot spoof a different tenant
  console.log('\n🔹 [Test 5] Legacy User Cross-Tenant Spoofing Prevention');
  const legacySpoofReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/order/getAllOrders',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${legacyGraceCabsToken}`,
      'X-Tenant-ID': TENANT_B_ID, // Trying to switch to Apex Cabs
    },
  });
  assert(
    legacySpoofReq.statusCode === 403,
    'Legacy Grace Cabs user providing X-Tenant-ID for Tenant B is rejected with HTTP 403 Forbidden',
    `Status: ${legacySpoofReq.statusCode}`
  );

  // TEST 6: Platform SuperAdmin can perform authorized cross-tenant administration
  console.log('\n🔹 [Test 6] Platform SuperAdmin Cross-Tenant Administration');
  const superAdminReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/order/getAllOrders',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
      'X-Tenant-ID': ROOT_TENANT_ID,
    },
  });
  assert(
    superAdminReq.statusCode === 200,
    'Platform SuperAdmin successfully queries orders with target X-Tenant-ID (HTTP 200)',
    `Status: ${superAdminReq.statusCode}`
  );

  // TEST 7: Cross-tenant booking details access blocked by assertTenantOwnership
  console.log('\n🔹 [Test 7] Cross-Tenant Detail / ID Manipulation Defense');
  // First, get a real booking code from Grace Cabs
  let sampleBookingCode: string | undefined;
  if (Array.isArray(legacyGraceCabsReq.data?.data) && legacyGraceCabsReq.data.data.length > 0) {
    sampleBookingCode = legacyGraceCabsReq.data.data[0].bookingCode;
  }

  if (sampleBookingCode) {
    // Tenant B attempts to fetch Tenant A's booking
    const crossTenantBooking = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/order/details/${sampleBookingCode}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tenantBUserToken}`,
      },
    });
    assert(
      crossTenantBooking.statusCode === 403,
      `Tenant B attempting to view Grace Cabs booking ${sampleBookingCode} is blocked with HTTP 403 Forbidden`,
      `Status: ${crossTenantBooking.statusCode}, msg: ${JSON.stringify(crossTenantBooking.data)}`
    );

    // Tenant A authorized user can view their own booking
    const tenantABooking = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/order/details/${sampleBookingCode}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tenantAUserToken}`,
      },
    });
    assert(
      tenantABooking.statusCode === 200,
      `Grace Cabs user viewing their own booking ${sampleBookingCode} succeeds with HTTP 200`,
      `Status: ${tenantABooking.statusCode}`
    );
  } else {
    console.log('  ⚠️ Notice: No existing bookings found to test detail URL manipulation');
  }

  // TEST 8: Static file path traversal defense
  console.log('\n🔹 [Test 8] Static File Path Traversal Defense');
  const pathTraversalReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/downloadPdf/download/invoice/..%2F..%2Fpackage.json?token=test',
    method: 'GET',
  });
  assert(
    pathTraversalReq.statusCode === 400 || pathTraversalReq.statusCode === 401,
    'Path traversal attempt in invoice download is blocked with HTTP 400/401',
    `Status: ${pathTraversalReq.statusCode}`
  );

  console.log('\n============================================================');
  console.log(`📊 ISOLATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runIsolationSuite().catch((err) => {
  console.error('Isolation suite execution failure:', err);
  process.exit(1);
});
