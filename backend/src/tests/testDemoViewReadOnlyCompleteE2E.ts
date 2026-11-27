import jwt from 'jsonwebtoken';
import { demoGuard } from '../middleware/demoGuard';
import config from '../config/config';
import { runWithTenantContext, ROOT_TENANT_ID, ROOT_TENANT_CODE } from '../context/tenantContext';

interface TestResult {
  suite: string;
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, test: string, suite: string, details?: string) {
  if (condition) {
    results.push({ suite, test, status: 'PASS', details });
    console.log(`  [PASS] ${test}`);
  } else {
    results.push({ suite, test, status: 'FAIL', details });
    console.error(`  [FAIL] ${test} - ${details || 'Assertion failed'}`);
  }
}

function mockResponse() {
  const res: any = {};
  res.statusCode = 200;
  res.data = null;
  res.headers = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload: any) => {
    res.data = payload;
    return res;
  };
  res.setHeader = (key: string, val: string) => {
    res.headers[key] = val;
    return res;
  };
  return res;
}

function createMockReq(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  query: Record<string, any> = {},
  body: any = {},
  user: any = null
) {
  return {
    method: method.toUpperCase(),
    path,
    url: path,
    headers: { ...headers },
    query: { ...query },
    body: { ...body },
    user,
    role: user?.role,
    tenantId: user?.tenantId,
  } as any;
}

async function runTests() {
  console.log('====================================================================');
  console.log('CABZ – COMPLETE DEMO VIEW READ-ONLY ENFORCEMENT & API GUARD E2E');
  console.log('====================================================================\n');

  const secret = config.security.jwtSecret || process.env.JWT_SECRET || 'jk23DFEo';

  // Generate a valid Demo token
  const demoPayload = {
    userId: 'demo-user-001',
    username: 'Demo Fleet Admin',
    email: 'demo@cabz.com',
    role: 'demo',
    isDemo: true,
    tenantId: 'demo-tenant',
    tenantName: 'CABZ Smart Fleet Demo',
  };
  const demoToken = jwt.sign(demoPayload, secret, { expiresIn: '12h' });

  // Generate a normal Fleet Admin token
  const normalFleetPayload = {
    userId: 'fleet-admin-001',
    username: 'Apex Fleet Operator',
    email: 'admin@apexfleet.com',
    role: 'fleet_admin',
    isDemo: false,
    tenantId: 'tenant-apex-1234',
    tenantName: 'Apex Mobility Fleet',
  };
  const normalFleetToken = jwt.sign(normalFleetPayload, secret, { expiresIn: '12h' });

  // -------------------------------------------------------------
  // SUITE 1: DEMO VIEW READ-ONLY (GET) REQUESTS ARE FULLY PERMITTED
  // -------------------------------------------------------------
  console.log('--- SUITE 1: Legitimate Demo View Read-Only (GET) Navigation & Data Queries ---');

  const getPaths = [
    '/api/tenants/dashboard/overview',
    '/api/tenants/dashboard/stats',
    '/api/vehicle',
    '/api/driver',
    '/api/company',
    '/api/order',
    '/api/city',
    '/api/area',
    '/api/subscriptions/current/subscription-lock-status',
    '/api/tenants/public/demo-session',
  ];

  for (const path of getPaths) {
    let nextCalled = false;
    const req = createMockReq('GET', path, {
      authorization: `Bearer ${demoToken}`,
      'x-demo-mode': 'true',
      'x-tenant-id': 'demo-tenant',
    });
    const res = mockResponse();

    demoGuard(req, res, () => {
      nextCalled = true;
    });

    assert(nextCalled, `GET ${path} is permitted (calls next())`, 'Read-Only Navigation');
    assert(res.statusCode === 200, `GET ${path} returned status 200 (not blocked)`, 'Read-Only Navigation');
  }

  // -------------------------------------------------------------
  // SUITE 2: DEMO VIEW MUTATIONS (POST/PUT/PATCH/DELETE) ARE STRICTLY BLOCKED
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: Demo View Mutation Attempts Blocked with 403 DEMO_MODE_READ_ONLY ---');

  const mutateOperations = [
    { method: 'POST', path: '/api/vehicle', label: 'Create Vehicle' },
    { method: 'PUT', path: '/api/vehicle/veh-123', label: 'Update Vehicle' },
    { method: 'DELETE', path: '/api/vehicle/veh-123', label: 'Delete Vehicle' },
    { method: 'POST', path: '/api/driver', label: 'Add Driver' },
    { method: 'PUT', path: '/api/driver/drv-123', label: 'Update Driver' },
    { method: 'DELETE', path: '/api/driver/drv-123', label: 'Delete Driver' },
    { method: 'POST', path: '/api/company', label: 'Create Company' },
    { method: 'PUT', path: '/api/company/cmp-123', label: 'Edit Company' },
    { method: 'DELETE', path: '/api/company/cmp-123', label: 'Delete Company' },
    { method: 'POST', path: '/api/order', label: 'Submit Booking Order' },
    { method: 'PUT', path: '/api/order/ord-123', label: 'Update Booking Order' },
    { method: 'DELETE', path: '/api/order/ord-123', label: 'Cancel Booking' },
    { method: 'POST', path: '/api/order/assign-driver', label: 'Assign Driver to Trip' },
    { method: 'POST', path: '/api/order/close-trip', label: 'Close Trip' },
    { method: 'POST', path: '/api/invoice/generate', label: 'Generate Invoice' },
    { method: 'POST', path: '/api/payment/process', label: 'Process Payment' },
    { method: 'POST', path: '/api/uploadfile', label: 'Upload File' },
    { method: 'PATCH', path: '/api/tenants/status', label: 'Change Fleet Status' },
  ];

  for (const op of mutateOperations) {
    let nextCalled = false;
    const req = createMockReq(op.method, op.path, {
      authorization: `Bearer ${demoToken}`,
      'x-demo-mode': 'true',
      'x-tenant-id': 'demo-tenant',
    });
    const res = mockResponse();

    demoGuard(req, res, () => {
      nextCalled = true;
    });

    assert(!nextCalled, `${op.method} ${op.path} (${op.label}) blocked from execution`, 'Backend Mutation Guard');
    assert(res.statusCode === 403, `${op.method} returns HTTP 403 Forbidden`, 'Backend Mutation Guard');
    assert(res.data?.code === 'DEMO_MODE_READ_ONLY', `Response code is DEMO_MODE_READ_ONLY`, 'Backend Mutation Guard');
    assert(res.data?.isDemoReadOnly === true, `Response flag isDemoReadOnly is true`, 'Backend Mutation Guard');
    assert(
      res.data?.message === 'Demo Preview is read-only. This action is unavailable.',
      `Exact required error message returned`,
      'Backend Mutation Guard',
      `Got message: "${res.data?.message}"`
    );
  }

  // -------------------------------------------------------------
  // SUITE 3: ALTERNATE DEMO DETECTION MECHANISMS
  // -------------------------------------------------------------
  console.log('\n--- SUITE 3: Alternate Demo Tags & Header Vectors Block Mutations ---');

  // 1. Tagged via X-Demo-Mode header alone without token
  let nextH1 = false;
  const reqH1 = createMockReq('POST', '/api/vehicle', { 'x-demo-mode': 'true' });
  const resH1 = mockResponse();
  demoGuard(reqH1, resH1, () => { nextH1 = true; });
  assert(!nextH1 && resH1.statusCode === 403, 'X-Demo-Mode: true header blocks POST', 'Header Detection');

  // 2. Tagged via X-Demo-View header
  let nextH2 = false;
  const reqH2 = createMockReq('DELETE', '/api/driver/1', { 'x-demo-view': 'true' });
  const resH2 = mockResponse();
  demoGuard(reqH2, resH2, () => { nextH2 = true; });
  assert(!nextH2 && resH2.statusCode === 403, 'X-Demo-View: true header blocks DELETE', 'Header Detection');

  // 3. Tagged via X-Tenant-ID: demo-tenant
  let nextH3 = false;
  const reqH3 = createMockReq('PUT', '/api/company/1', { 'x-tenant-id': 'demo-tenant' });
  const resH3 = mockResponse();
  demoGuard(reqH3, resH3, () => { nextH3 = true; });
  assert(!nextH3 && resH3.statusCode === 403, 'X-Tenant-ID: demo-tenant blocks PUT', 'Header Detection');

  // 4. Tagged via query param ?demo=true
  let nextQ = false;
  const reqQ = createMockReq('POST', '/api/order', {}, { demo: 'true' });
  const resQ = mockResponse();
  demoGuard(reqQ, resQ, () => { nextQ = true; });
  assert(!nextQ && resQ.statusCode === 403, 'Query parameter ?demo=true blocks POST', 'Query Detection');

  // 5. Public demo session initialization endpoint remains accessible
  let nextInit = false;
  const reqInit = createMockReq('GET', '/api/tenants/public/demo-session');
  const resInit = mockResponse();
  demoGuard(reqInit, resInit, () => { nextInit = true; });
  assert(nextInit, 'Public demo session endpoint is accessible (not blocked)', 'Session Init');

  // -------------------------------------------------------------
  // SUITE 4: NORMAL AUTHENTICATED FLEET ADMIN IS NEVER RESTRICTED
  // -------------------------------------------------------------
  console.log('\n--- SUITE 4: Normal Authenticated Fleet Admin Sessions Retain Full Access ---');

  const normalMutations = [
    { method: 'POST', path: '/api/vehicle' },
    { method: 'PUT', path: '/api/vehicle/veh-123' },
    { method: 'DELETE', path: '/api/vehicle/veh-123' },
    { method: 'POST', path: '/api/driver' },
    { method: 'POST', path: '/api/order' },
    { method: 'PUT', path: '/api/order/ord-123' },
    { method: 'POST', path: '/api/invoice/generate' },
  ];

  for (const op of normalMutations) {
    let nextCalled = false;
    const req = createMockReq(op.method, op.path, {
      authorization: `Bearer ${normalFleetToken}`,
      'x-tenant-id': 'tenant-apex-1234',
    });
    const res = mockResponse();

    demoGuard(req, res, () => {
      nextCalled = true;
    });

    assert(nextCalled, `Normal Fleet Admin ${op.method} ${op.path} is PERMITTED (calls next())`, 'Normal Fleet Admin Preservation');
    assert(res.statusCode === 200, `Normal Fleet Admin did not receive 403`, 'Normal Fleet Admin Preservation');
  }

  // Summary
  console.log('\n====================================================================');
  console.log('CABZ TEST SUMMARY');
  console.log('====================================================================');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Assertions: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().then(() => {
  console.log('All tests completed successfully.');
  process.exit(0);
}).catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
