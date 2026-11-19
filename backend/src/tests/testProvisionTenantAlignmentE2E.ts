process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import app from '../app';
import {
  sequelize,
  connectDB,
  Tenant,
  TenantSubscription,
  TenantActivationToken,
  TenantRegistrationRequest,
} from '../models';

// Protected tables
const PROTECTED_TABLES = [
  { table: 'employee', expected: 3 },
  { table: 'emailconfiguration', expected: 40 },
  { table: 'configuration', expected: 1 },
  { table: 'sms_logs', expected: 30 },
  { table: 'sms_templates', expected: 7 },
  { table: 'saas_plans', expected: 4 },
  { table: 'short_links', expected: 28 },
];

async function verifyProtectedTables(stage: string) {
  console.log(`\n🔍 Verifying Protected Tables Count (${stage}):`);
  for (const { table, expected } of PROTECTED_TABLES) {
    const [result]: any = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
    const count = Number(result[0].cnt);
    if (count !== expected) {
      throw new Error(`CRITICAL: Protected table '${table}' count changed! Expected: ${expected}, Actual: ${count}`);
    }
    console.log(`  ✅ Protected table '${table}' count is exactly ${expected}`);
  }
}

async function makeRequest(
  port: number,
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ statusCode: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const reqData = body ? JSON.stringify(body) : null;
    const allHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (reqData) {
      allHeaders['Content-Length'] = Buffer.byteLength(reqData).toString();
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path,
        method,
        headers: allHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode || 500,
            data: parsed,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', reject);
    if (reqData) req.write(reqData);
    req.end();
  });
}

async function run() {
  console.log('========================================================================');
  console.log('FLEETFLOW: PROVISION TENANT ALIGNMENT & REGISTER FLEET VERIFICATION E2E');
  console.log('========================================================================\n');

  await connectDB();
  await verifyProtectedTables('BASELINE BEFORE TESTS');

  // Start test server on ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  console.log(`\n📡 Test server running on ephemeral port ${port}`);

  let passCount = 0;
  const assert = (condition: boolean, msg: string) => {
    if (!condition) {
      throw new Error(`❌ FAIL: ${msg}`);
    }
    passCount++;
    console.log(`  ✅ PASS: ${msg}`);
  };

  const createdTenantIds: string[] = [];
  const createdRequestIds: string[] = [];

  try {
    // -------------------------------------------------------------
    // 1. Authenticate as SuperAdmin
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 1: SuperAdmin Authentication ---');
    const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';
    const jwtSecret = config.security?.jwtSecret || process.env.JWT_SECRET || 'secret';
    const superAdminToken = jwt.sign(
      {
        userId: 'superadmin',
        role: 'superadmin',
        isPlatformSuperAdmin: true,
        tenantId: ROOT_TENANT_ID,
        email: 'platform.superadmin@fleetflow.com',
      },
      jwtSecret,
      { expiresIn: '1h' }
    );
    assert(Boolean(superAdminToken), 'SuperAdmin JWT token generated with superadmin role');

    const saAuthHeader = { Authorization: `Bearer ${superAdminToken}` };

    // -------------------------------------------------------------
    // 2. Register Fleet (Public Self-Service Application)
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 2: Public Register Fleet Flow Verification ---');
    const timestamp = Date.now();
    const publicRegPayload = {
      fleetName: `Self Reg Fleet ${timestamp}`,
      legalName: `Self Reg Mobility Private Limited`,
      displayName: `Self Reg Fleet`,
      businessCode: `SR${timestamp.toString().slice(-4)}`,
      ownerName: 'Venkatesh Rao',
      contactEmail: `owner_${timestamp}@selfregfleet.com`,
      contactPhone: '9840112233',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pinCode: '600032',
      registeredAddress: '42 GST Road, Guindy, Chennai',
      gstin: '33AABCS1429B1ZB',
      panNumber: 'AABCS1429B',
      sacCode: '996609',
      requestedPlanTier: 'PRO',
      billingCycle: 'ANNUAL',
      fleetSize: '16-75',
      termsConsent: true,
    };

    const regRes = await makeRequest(port, 'POST', '/api/tenants/public/register-fleet', publicRegPayload);
    assert(regRes.statusCode === 201 || regRes.statusCode === 200, 'Public Register Fleet returns HTTP 201/200');
    assert(regRes.data?.success === true, 'Public Register Fleet success flag is true');
    const regRequestId = regRes.data?.data?.requestId || regRes.data?.requestId;
    assert(Boolean(regRequestId), `Registration request ID returned: ${regRequestId}`);
    createdRequestIds.push(regRequestId);

    // Verify registration record in database
    const regRecord = await TenantRegistrationRequest.findByPk(regRequestId);
    assert(Boolean(regRecord), 'Registration request saved in database');
    assert(regRecord?.status === 'PENDING', 'Registration status is PENDING');
    assert(regRecord?.requestedPlanTier === 'PRO', 'Requested plan tier is PRO');
    assert(regRecord?.billingCycle === 'ANNUAL', 'Billing cycle is ANNUAL');

    // SuperAdmin reviews queue and approves
    const approveRes = await makeRequest(port, 'POST', `/api/tenants/admin/registrations/${regRequestId}/approve`, {
      reviewNotes: 'Approved via automated test suite',
    }, saAuthHeader);
    assert(approveRes.statusCode === 200, 'SuperAdmin approve registration returns HTTP 200');
    assert(approveRes.data?.success === true, 'Registration approval success is true');
    const approvedTenantId = approveRes.data?.data?.tenant?.tenantId || approveRes.data?.tenant?.tenantId;
    if (approvedTenantId) createdTenantIds.push(approvedTenantId);

    // -------------------------------------------------------------
    // 3. Provision Tenant (SuperAdmin Direct Creation with Aligned Fields)
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 3: Provision Tenant Form Direct Creation ---');
    const provTimestamp = Date.now() + 10;
    const alignedProvisionPayload = {
      name: `Direct Provision Fleet ${provTimestamp}`,
      fleetName: `Direct Provision Fleet ${provTimestamp}`,
      displayName: `Direct Provision Fleet`,
      legalName: `Direct Provision Mobility LLP`,
      code: `DP${provTimestamp.toString().slice(-4)}`,
      businessCode: `DP${provTimestamp.toString().slice(-4)}`,
      subdomain: `dp${provTimestamp.toString().slice(-4)}`,
      ownerName: 'Karthik Subramanian',
      planTier: 'ENTERPRISE',
      requestedPlanTier: 'ENTERPRISE',
      billingCycle: 'ANNUAL',
      contactEmail: `admin_${provTimestamp}@directprovision.com`,
      contactPhone: '9840223344',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pinCode: '641018',
      registeredAddress: '88 Avinashi Road, Peelamedu, Coimbatore',
      gstin: '33AABCD1234E1Z5',
      panNumber: 'AABCD1234E',
      sacCode: '996609',
      billingFooterText: 'Direct provisioned via SuperAdmin',
      brandingTokens: {
        primaryColor: '#5B3DF5',
        portalTitle: 'Direct Provision Fleet Portal',
      },
    };

    const provRes = await makeRequest(port, 'POST', '/api/tenants', alignedProvisionPayload, saAuthHeader);
    assert(provRes.statusCode === 201, 'Direct Provision Tenant returns HTTP 201 Created');
    assert(provRes.data?.success === true, 'Direct Provision Tenant success flag is true');
    const provTenant = provRes.data?.data?.tenant || provRes.data?.tenant;
    assert(Boolean(provTenant?.tenantId), `Provisioned tenant ID: ${provTenant?.tenantId}`);
    createdTenantIds.push(provTenant.tenantId);

    // Verify Tenant database record
    const tenantRecord = await Tenant.findByPk(provTenant.tenantId);
    assert(Boolean(tenantRecord), 'Tenant record exists in database');
    assert(tenantRecord?.status === 'ACTIVE', 'Provisioned tenant is immediately ACTIVE');
    assert(tenantRecord?.planTier === 'ENTERPRISE', 'Tenant plan tier is ENTERPRISE');
    assert(tenantRecord?.city === 'Coimbatore', 'City correctly saved');
    assert(tenantRecord?.state === 'Tamil Nadu', 'State correctly saved');
    assert(tenantRecord?.pinCode === '641018', 'PIN code correctly saved');
    assert(tenantRecord?.gstin === '33AABCD1234E1Z5', 'GSTIN correctly saved');
    assert(tenantRecord?.panNumber === 'AABCD1234E', 'PAN correctly saved');
    assert(Boolean(tenantRecord?.slug), `Tenant canonical slug generated: ${tenantRecord?.slug}`);

    // Verify TenantSubscription record
    const subRecord = await TenantSubscription.findOne({ where: { tenantId: provTenant.tenantId } });
    assert(Boolean(subRecord), 'TenantSubscription record created');
    assert(subRecord?.status === 'ACTIVE', 'Subscription status is ACTIVE');
    assert(subRecord?.planTier === 'ENTERPRISE', 'Subscription plan tier is ENTERPRISE');
    assert(subRecord?.vehicleQuota === -1, 'ENTERPRISE quota assigned (-1 Unlimited vehicles)');
    assert(subRecord?.driverQuota === -1, 'ENTERPRISE quota assigned (-1 Unlimited drivers)');
    assert(subRecord?.companyQuota === -1, 'ENTERPRISE quota assigned (-1 Unlimited companies)');

    // Verify TenantActivationToken created
    const tokenRecord = await TenantActivationToken.findOne({ where: { tenantId: provTenant.tenantId } });
    assert(Boolean(tokenRecord), 'Activation token record created for administrator setup');
    assert(tokenRecord?.adminEmail === `admin_${provTimestamp}@directprovision.com`, 'Token adminEmail matches contactEmail');
    assert(tokenRecord?.adminName === 'Karthik Subramanian', 'Token adminName uses ownerName');

    // -------------------------------------------------------------
    // 4. Test Legacy Provision Payload Compatibility
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 4: Legacy Provision Payload Compatibility ---');
    const legacyTimestamp = Date.now() + 20;
    const legacyPayload = {
      name: `Legacy Provision Fleet ${legacyTimestamp}`,
      code: `LG${legacyTimestamp.toString().slice(-4)}`,
      contactEmail: `legacy_${legacyTimestamp}@legacyfleet.com`,
      contactPhone: '9840334455',
      planTier: 'BASIC',
      legalName: 'Legacy Fleet Pvt Ltd',
      displayName: 'Legacy Fleet',
      registeredAddress: '12 Beach Road, Chennai',
      gstin: '33AABCL9999K1Z2',
      panNumber: 'AABCL9999K',
      sacCode: '996609',
    };

    const legacyRes = await makeRequest(port, 'POST', '/api/tenants', legacyPayload, saAuthHeader);
    assert(legacyRes.statusCode === 201, 'Legacy Provision Tenant payload returns HTTP 201');
    const legacyTenantId = legacyRes.data?.data?.tenant?.tenantId || legacyRes.data?.tenant?.tenantId;
    if (legacyTenantId) createdTenantIds.push(legacyTenantId);

    // -------------------------------------------------------------
    // 5. Test Non-SuperAdmin Blocked from Provisioning
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 5: Security & Authorization Preservation ---');
    const anonRes = await makeRequest(port, 'POST', '/api/tenants', alignedProvisionPayload);
    assert(anonRes.statusCode === 401 || anonRes.statusCode === 403, 'Anonymous user blocked from POST /api/tenants (HTTP 401/403)');

    console.log(`\n========================================================================`);
    console.log(`🎉 ALL ${passCount} PROVISION TENANT ALIGNMENT TESTS PASSED 100%!`);
    console.log(`========================================================================`);

  } finally {
    // Clean up created test entities
    console.log('\n--- Cleaning up test records ---');
    for (const reqId of createdRequestIds) {
      await TenantRegistrationRequest.destroy({ where: { requestId: reqId } }).catch(() => {});
    }
    for (const tid of createdTenantIds) {
      await TenantActivationToken.destroy({ where: { tenantId: tid } }).catch(() => {});
      await TenantSubscription.destroy({ where: { tenantId: tid } }).catch(() => {});
      await Tenant.destroy({ where: { tenantId: tid } }).catch(() => {});
    }

    server.close();
    await verifyProtectedTables('FINAL AFTER TESTS');
  }
}

run().catch((err) => {
  console.error('\n❌ Test execution failed with error:', err);
  process.exit(1);
});
