import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import config from '../config/config';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';
const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';

// Create a valid SuperAdmin token for testing
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

async function runE2E() {
  console.log('\n============================================================');
  console.log('🚀 RUNNING END-TO-END SAAS & SECURITY INTEGRATION SUITE');
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

  // 1. Security check: Protected configuration endpoint without token
  console.log('🔹 [E2E Security 1] Protected Configuration Access');
  const unauthConfig = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/config/getConfiguration',
    method: 'GET',
  });
  assert(
    unauthConfig.statusCode === 401,
    'Anonymous GET /api/config/getConfiguration is rejected with 401',
    `Status: ${unauthConfig.statusCode}`
  );

  // 2. Security check: Protected bulk user upload without token
  console.log('\n🔹 [E2E Security 2] Protected User Bulk Upload Access');
  const unauthUpload = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/user/upload-users',
    method: 'POST',
  });
  assert(
    unauthUpload.statusCode === 401,
    'Anonymous POST /api/user/upload-users is rejected with 401',
    `Status: ${unauthUpload.statusCode}`
  );

  // 3. SaaS Flow: SuperAdmin lists tenants
  console.log('\n🔹 [E2E SaaS 1] Platform SuperAdmin Tenant Directory');
  const tenantListRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/tenants',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
    },
  });
  assert(
    tenantListRes.statusCode === 200,
    'SuperAdmin GET /api/tenants returns HTTP 200',
    `Status: ${tenantListRes.statusCode}`
  );
  assert(
    Array.isArray(tenantListRes.data?.tenants),
    'Tenant response contains array of tenants'
  );

  // 4. SaaS Flow: Current tenant profile resolution
  console.log('\n🔹 [E2E SaaS 2] Current Tenant Profile & Branding');
  const currentProfileRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/tenants/current/profile',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
    },
  });
  assert(
    currentProfileRes.statusCode === 200,
    'GET /api/tenants/current/profile returns HTTP 200',
    `Status: ${currentProfileRes.statusCode}`
  );
  assert(
    currentProfileRes.data?.tenant?.tenantId === ROOT_TENANT_ID,
    'Profile resolves to ROOT_TENANT_ID (Grace Cabs)'
  );
  assert(
    currentProfileRes.data?.tenant?.planTier !== undefined,
    'Profile includes planTier'
  );

  // 5. SaaS Flow: Provision a new fleet operator
  console.log('\n🔹 [E2E SaaS 3] Provisioning New Fleet Tenant');
  const testTenantCode = `TST${Date.now().toString().slice(-4)}`;
  const provisionRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
    },
    {
      name: `Test Fleet ${testTenantCode}`,
      code: testTenantCode,
      subdomain: `test${testTenantCode.toLowerCase()}`,
      planTier: 'BASIC',
      contactEmail: `ops@${testTenantCode.toLowerCase()}.com`,
      brandingTokens: {
        primaryColor: '#059669',
        secondaryColor: '#047857',
        portalTitle: 'Test Fleet Platform',
      },
    }
  );
  assert(
    provisionRes.statusCode === 201,
    `POST /api/tenants provisions new tenant ${testTenantCode} with HTTP 201`,
    `Status: ${provisionRes.statusCode}, msg: ${JSON.stringify(provisionRes.data)}`
  );
  const createdTenantId = provisionRes.data?.tenant?.tenantId;
  assert(
    !!createdTenantId,
    'Provision response includes new tenantId UUID'
  );

  // 6. SaaS Flow: Update subscription & quotas
  if (createdTenantId) {
    console.log('\n🔹 [E2E SaaS 4] Quota & Plan Management');
    const updateQuotaRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/tenants/${createdTenantId}/subscription`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
      },
      {
        planTier: 'PRO',
        vehicleQuota: 85,
        driverQuota: 85,
        companyQuota: 25,
      }
    );
    assert(
      updateQuotaRes.statusCode === 200,
      'PUT /api/tenants/:tenantId/subscription updates quotas to 85 with HTTP 200',
      `Status: ${updateQuotaRes.statusCode}`
    );
    assert(
      updateQuotaRes.data?.subscription?.vehicleQuota === 85,
      'Subscription vehicleQuota reflects updated limit (85)'
    );
  }

  // 7. Dynamic Company Policy Engine API
  console.log('\n🔹 [E2E SaaS 5] Dynamic Corporate Policy API');
  const validCompanyId = '4b27fc68-7908-40a3-a983-47823ad88bad';
  const savePolicyRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/tenants/policies/${validCompanyId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
    },
    {
      identity: {
        allowedEmailDomains: ['@enterprise.org'],
        employeeIdLabel: 'Staff ID',
        employeeIdRegex: '^EMP\\d{4}$',
        requireCostCenter: true,
      },
      bookingRules: {
        requireManagerApproval: true,
        allowNightTravel: false,
      },
      invoicing: {
        billingMode: 'MONTHLY',
      },
    }
  );
  assert(
    savePolicyRes.statusCode === 200,
    'POST /api/tenants/policies/:companyId saves custom rules with HTTP 200',
    `Status: ${savePolicyRes.statusCode}`
  );

  const getPolicyRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/tenants/policies/${validCompanyId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
    },
  });
  assert(
    getPolicyRes.statusCode === 200,
    'GET /api/tenants/policies/:companyId retrieves custom rules with HTTP 200',
    `Status: ${getPolicyRes.statusCode}`
  );
  assert(
    getPolicyRes.data?.policy?.identity?.employeeIdRegex === '^EMP\\d{4}$',
    'Retrieved policy preserves employeeIdRegex (^EMP\\d{4}$)'
  );

  console.log('\n============================================================');
  console.log(`📊 E2E RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2E().catch((err) => {
  console.error('E2E execution failure:', err);
  process.exit(1);
});
