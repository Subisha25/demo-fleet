import jwt from 'jsonwebtoken';
import { demoGuard, isPublicExemptRoute } from '../middleware/demoGuard';
import { tenantMiddleware } from '../middleware/tenantMiddleware';
import config from '../config/config';

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
    originalUrl: path,
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
  console.log('CABZ – PUBLIC FLEET REGISTRATION & DEMO SCOPING VERIFICATION E2E');
  console.log('====================================================================\n');

  const secret = config.security.jwtSecret || process.env.JWT_SECRET || 'jk23DFEo';

  // Demo user token (created when visitor opens Demo View)
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

  // Normal Fleet Admin token
  const normalFleetPayload = {
    userId: 'fleet-admin-001',
    username: 'Apex Operator',
    email: 'admin@apex.com',
    role: 'fleet_admin',
    isDemo: false,
    tenantId: 'tenant-apex',
    tenantName: 'Apex Mobility',
  };
  const normalFleetToken = jwt.sign(normalFleetPayload, secret, { expiresIn: '12h' });

  // -------------------------------------------------------------
  // SUITE 1: isPublicExemptRoute Detection Accuracy
  // -------------------------------------------------------------
  console.log('--- SUITE 1: isPublicExemptRoute Endpoint Scoping ---');
  {
    const suite = 'Endpoint Scoping';
    assert(
      isPublicExemptRoute(createMockReq('POST', '/api/public/register-fleet')) === true,
      'POST /api/public/register-fleet is recognized as public exempt route',
      suite
    );
    assert(
      isPublicExemptRoute(createMockReq('POST', '/api/tenants/register-fleet')) === true,
      'POST /api/tenants/register-fleet is recognized as public exempt route',
      suite
    );
    assert(
      isPublicExemptRoute(createMockReq('POST', '/api/public/register')) === true,
      'POST /api/public/register is recognized as public exempt route',
      suite
    );
    assert(
      isPublicExemptRoute(createMockReq('POST', '/api/activation/complete')) === true,
      'POST /api/activation/complete is recognized as public exempt route',
      suite
    );
    assert(
      isPublicExemptRoute(createMockReq('POST', '/api/public/booking/create')) === true,
      'POST /api/public/booking/create is recognized as public exempt route',
      suite
    );
    assert(
      isPublicExemptRoute(createMockReq('POST', '/api/auth/login')) === true,
      'POST /api/auth/login is recognized as public exempt route',
      suite
    );
    assert(
      isPublicExemptRoute(createMockReq('POST', '/api/auth/fleet-login/apex')) === true,
      'POST /api/auth/fleet-login/:slug is recognized as public exempt route',
      suite
    );
    assert(
      isPublicExemptRoute(createMockReq('POST', '/api/vehicle')) === false,
      'POST /api/vehicle is NOT a public exempt route (protected tenant operational)',
      suite
    );
    assert(
      isPublicExemptRoute(createMockReq('PUT', '/api/driver/1')) === false,
      'PUT /api/driver/1 is NOT a public exempt route (protected tenant operational)',
      suite
    );
    assert(
      isPublicExemptRoute(createMockReq('DELETE', '/api/order/55')) === false,
      'DELETE /api/order/55 is NOT a public exempt route (protected tenant operational)',
      suite
    );
  }

  // -------------------------------------------------------------
  // SUITE 2: demoGuard Does NOT Block Public Fleet Registration Even With Demo Tokens/Headers
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: Public Registration Unblocked in demoGuard ---');
  {
    const suite = 'Public Registration Unblocked';

    // Test 1: POST /api/public/register-fleet with x-demo-mode, x-demo-view, and demo Bearer token
    {
      const req = createMockReq(
        'POST',
        '/api/public/register-fleet',
        {
          authorization: `Bearer ${demoToken}`,
          'x-demo-mode': 'true',
          'x-demo-view': 'true',
          'x-tenant-id': 'demo-tenant',
        },
        {},
        { fleetName: 'New Fleet', contactEmail: 'test@newfleet.com' }
      );
      const res = mockResponse();
      const tracker = { nextCalled: false };
      demoGuard(req, res, () => {
        tracker.nextCalled = true;
      });

      assert(
        tracker.nextCalled && res.statusCode === 200,
        'POST /api/public/register-fleet with demo headers/token passes through demoGuard (next() called)',
        suite
      );
      assert(
        res.data?.code !== 'DEMO_MODE_READ_ONLY',
        'POST /api/public/register-fleet is NOT blocked with DEMO_MODE_READ_ONLY',
        suite
      );
    }

    // Test 2: POST /api/tenants/register-fleet without headers
    {
      const req = createMockReq('POST', '/api/tenants/register-fleet', {}, {}, { fleetName: 'Clean Fleet' });
      const res = mockResponse();
      const tracker = { nextCalled: false };
      demoGuard(req, res, () => {
        tracker.nextCalled = true;
      });

      assert(
        tracker.nextCalled,
        'POST /api/tenants/register-fleet clean call passes demoGuard normally',
        suite
      );
    }

    // Test 3: POST /api/public/booking/create with demo token
    {
      const req = createMockReq(
        'POST',
        '/api/public/booking/create',
        { authorization: `Bearer ${demoToken}` },
        {},
        { customerName: 'John Doe' }
      );
      const res = mockResponse();
      const tracker = { nextCalled: false };
      demoGuard(req, res, () => {
        tracker.nextCalled = true;
      });

      assert(
        tracker.nextCalled && res.statusCode === 200,
        'POST /api/public/booking/create with demo token passes through demoGuard',
        suite
      );
    }

    // Test 4: POST /api/auth/fleet-login/citycabs with demo headers
    {
      const req = createMockReq(
        'POST',
        '/api/auth/fleet-login/citycabs',
        { 'x-demo-mode': 'true' },
        {},
        { email: 'admin@citycabs.com', password: 'password123' }
      );
      const res = mockResponse();
      const tracker = { nextCalled: false };
      demoGuard(req, res, () => {
        tracker.nextCalled = true;
      });

      assert(
        tracker.nextCalled && res.statusCode === 200,
        'POST /api/auth/fleet-login/:slug with demo headers passes through demoGuard',
        suite
      );
    }
  }

  // -------------------------------------------------------------
  // SUITE 3: Tenant Middleware Cleanses Stale Demo Headers on Public Endpoints
  // -------------------------------------------------------------
  console.log('\n--- SUITE 3: Tenant Middleware Isolation on Public Routes ---');
  {
    const suite = 'Tenant Middleware Public Route Isolation';

    const req = createMockReq(
      'POST',
      '/api/public/register-fleet',
      {
        authorization: `Bearer ${demoToken}`,
        'x-demo-mode': 'true',
        'x-demo-view': 'true',
        'x-tenant-id': 'demo-tenant',
      },
      {},
      { fleetName: 'Clean Horizon Travels' }
    );
    const res = mockResponse();
    const tracker = { nextCalled: false };
    tenantMiddleware(req, res, () => {
      tracker.nextCalled = true;
    });

    assert(tracker.nextCalled, 'tenantMiddleware completes on public route', suite);
    assert(
      req.headers['x-demo-mode'] === undefined,
      'tenantMiddleware strips x-demo-mode header on public route',
      suite
    );
    assert(
      req.headers['x-demo-view'] === undefined,
      'tenantMiddleware strips x-demo-view header on public route',
      suite
    );
    assert(
      req.headers['x-tenant-id'] === undefined,
      'tenantMiddleware strips demo-tenant x-tenant-id header on public route',
      suite
    );
    assert(
      (req as any).tenantId === undefined || (req as any).tenantId !== 'demo-tenant',
      'tenantMiddleware does NOT bind request to demo-tenant',
      suite
    );
  }

  // -------------------------------------------------------------
  // SUITE 4: Demo View Operational Write/Mutate Protection REMAINS 100% Strictly Enforced
  // -------------------------------------------------------------
  console.log('\n--- SUITE 4: Operational Data Mutation Strictly Blocked in Demo View ---');
  {
    const suite = 'Demo View Strict Operational Read-Only Enforcement';

    // Test 1: POST /api/vehicle with demo token -> 403 DEMO_MODE_READ_ONLY
    {
      const req = createMockReq(
        'POST',
        '/api/vehicle',
        { authorization: `Bearer ${demoToken}` },
        {},
        { vehicleNumber: 'TN01AB1234' }
      );
      const res = mockResponse();
      const tracker = { nextCalled: false };
      demoGuard(req, res, () => {
        tracker.nextCalled = true;
      });

      assert(
        !tracker.nextCalled && res.statusCode === 403,
        'POST /api/vehicle with demo token is blocked with HTTP 403',
        suite
      );
      assert(
        res.data?.code === 'DEMO_MODE_READ_ONLY' && res.data?.isDemoReadOnly === true,
        'Response code is DEMO_MODE_READ_ONLY with isDemoReadOnly: true',
        suite
      );
    }

    // Test 2: PUT /api/driver/10 with x-demo-mode header -> 403 DEMO_MODE_READ_ONLY
    {
      const req = createMockReq(
        'PUT',
        '/api/driver/10',
        { 'x-demo-mode': 'true' },
        {},
        { name: 'Driver Updated' }
      );
      const res = mockResponse();
      const tracker = { nextCalled: false };
      demoGuard(req, res, () => {
        tracker.nextCalled = true;
      });

      assert(
        !tracker.nextCalled && res.statusCode === 403,
        'PUT /api/driver/10 with x-demo-mode is blocked with HTTP 403',
        suite
      );
      assert(
        res.data?.code === 'DEMO_MODE_READ_ONLY',
        'PUT /api/driver/10 returns DEMO_MODE_READ_ONLY',
        suite
      );
    }

    // Test 3: DELETE /api/order/99 with demo query ?demo=true -> 403 DEMO_MODE_READ_ONLY
    {
      const req = createMockReq(
        'DELETE',
        '/api/order/99',
        {},
        { demo: 'true' },
        {}
      );
      const res = mockResponse();
      const tracker = { nextCalled: false };
      demoGuard(req, res, () => {
        tracker.nextCalled = true;
      });

      assert(
        !tracker.nextCalled && res.statusCode === 403,
        'DELETE /api/order/99 with ?demo=true is blocked with HTTP 403',
        suite
      );
    }

    // Test 4: PATCH /api/company/2 with demo user attached -> 403 DEMO_MODE_READ_ONLY
    {
      const req = createMockReq(
        'PATCH',
        '/api/company/2',
        {},
        {},
        { companyName: 'Hacked Corp' },
        { isDemo: true, role: 'demo' }
      );
      const res = mockResponse();
      const tracker = { nextCalled: false };
      demoGuard(req, res, () => {
        tracker.nextCalled = true;
      });

      assert(
        !tracker.nextCalled && res.statusCode === 403,
        'PATCH /api/company/2 with demo user context is blocked with HTTP 403',
        suite
      );
    }

    // Test 5: GET /api/vehicle with demo token -> ALLOWED (Read-only browsing permitted)
    {
      const req = createMockReq(
        'GET',
        '/api/vehicle',
        { authorization: `Bearer ${demoToken}` }
      );
      const res = mockResponse();
      const tracker = { nextCalled: false };
      demoGuard(req, res, () => {
        tracker.nextCalled = true;
      });

      assert(
        tracker.nextCalled && res.statusCode === 200,
        'GET /api/vehicle with demo token is allowed (safe read-only exploration)',
        suite
      );
    }
  }

  // -------------------------------------------------------------
  // SUITE 5: Legitimate Fleet Admin Operations Are NOT Affected
  // -------------------------------------------------------------
  console.log('\n--- SUITE 5: Authenticated Fleet Admin Operational Writes Work Normally ---');
  {
    const suite = 'Legitimate Fleet Admin Operations';

    const req = createMockReq(
      'POST',
      '/api/vehicle',
      {
        authorization: `Bearer ${normalFleetToken}`,
        'x-tenant-id': 'tenant-apex',
      },
      {},
      { vehicleNumber: 'TN09CD5678' }
    );
    const res = mockResponse();
    const tracker = { nextCalled: false };
    demoGuard(req, res, () => {
      tracker.nextCalled = true;
    });

    assert(
      tracker.nextCalled && res.statusCode === 200,
      'POST /api/vehicle with legitimate Fleet Admin token passes demoGuard cleanly',
      suite
    );
  }

  // Summary
  console.log('\n====================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
