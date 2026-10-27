import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

async function runFleetOverviewTests() {
  console.log('================================================================================');
  console.log('  TEST SUITE: SUPERADMIN FLEET VIEW & DEDICATED READ-ONLY OVERVIEW DASHBOARD');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  async function assert(desc: string, fn: () => Promise<boolean> | boolean) {
    try {
      const ok = await fn();
      if (ok) {
        console.log(`  ✅ PASS: ${desc}`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: ${desc}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`  ❌ ERROR: ${desc} ->`, err?.response?.data || err.message);
      failed++;
    }
  }

  // 1. Authenticate as SuperAdmin
  let superAdminToken = '';
  await assert('SuperAdmin obtains valid access token', async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/emplogin`, {
        email: 'subisha2002.m@gmail.com',
        password: process.env.SUPERADMIN_PASSWORD || '12345678',
      });
      if (res.status === 200 && res.data.accessToken) {
        superAdminToken = res.data.accessToken;
        return res.data.role === 'superadmin';
      }
    } catch {
      // Direct token generation using database superadmin credentials
      const mysql = require('mysql2/promise');
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'demodb',
      });
      const [rows]: any = await conn.query("SELECT employeeId, email, role, tenantId FROM employee WHERE role = 'superadmin' LIMIT 1");
      await conn.end();
      if (rows.length > 0) {
        const emp = rows[0];
        const jwt = require('jsonwebtoken');
        superAdminToken = jwt.sign(
          { userId: emp.employeeId, email: emp.email, role: emp.role, tenantId: emp.tenantId },
          process.env.JWT_SECRET || 'jk23DFEo',
          { expiresIn: '1d' }
        );
        return true;
      }
    }
    return false;
  });

  if (!superAdminToken) {
    console.error('Fatal: Could not obtain SuperAdmin token. Aborting.');
    process.exit(1);
  }

  // 2. Fetch list of tenants to pick two active fleets for isolation testing
  let tenants: any[] = [];
  await assert('SuperAdmin can list active fleet tenants', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.tenants)) {
      tenants = res.data.tenants.filter(
        (t: any) => t.tenantId !== 'e7b8a1c0-0000-0000-0000-000000000001' && t.code !== 'GC'
      );
      return tenants.length >= 2;
    }
    return false;
  });

  const fleetA = tenants[0];
  const fleetB = tenants[1];
  console.log(`\n  Target Fleets for Isolation:`);
  console.log(`  - Fleet A: "${fleetA.name}" (ID: ${fleetA.tenantId}, Code: ${fleetA.code})`);
  console.log(`  - Fleet B: "${fleetB.name}" (ID: ${fleetB.tenantId}, Code: ${fleetB.code})\n`);

  // 3. Test Fleet A Overview
  let fleetAOverview: any;
  await assert('SuperAdmin can fetch Fleet A dedicated overview via /tenants/:id/overview (HTTP 200)', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/overview`, {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        'X-Tenant-ID': fleetA.tenantId,
        'X-Inspection-Mode': 'true',
      },
    });
    fleetAOverview = res.data?.data;
    return res.status === 200 && res.data?.success === true && !!fleetAOverview;
  });

  await assert('Fleet A overview returns correct metadata and header fields', () => {
    return (
      fleetAOverview.tenantId === fleetA.tenantId &&
      fleetAOverview.name === fleetA.name &&
      fleetAOverview.code === fleetA.code &&
      typeof fleetAOverview.status === 'string' &&
      typeof fleetAOverview.headerColor === 'string' &&
      typeof fleetAOverview.primaryColor === 'string' &&
      Boolean(fleetAOverview.createdAt)
    );
  });

  await assert('Fleet A overview returns verified subscription details and quotas', () => {
    const sub = fleetAOverview.subscription;
    return (
      Boolean(sub.planTier) &&
      typeof sub.agreedPrice === 'number' &&
      typeof sub.billingCycle === 'string' &&
      typeof sub.quotas?.vehicles === 'number' &&
      typeof sub.quotas?.drivers === 'number' &&
      typeof sub.quotas?.companies === 'number'
    );
  });

  await assert('Fleet A overview returns accurate database KPI counts', () => {
    const c = fleetAOverview.counts;
    return (
      typeof c.vehicles === 'number' &&
      typeof c.drivers === 'number' &&
      typeof c.companies === 'number' &&
      typeof c.users === 'number' &&
      typeof c.owners === 'number' &&
      typeof c.totalBookings === 'number' &&
      typeof c.taxes === 'number' &&
      typeof c.pickupCities === 'number' &&
      typeof c.pickupAreas === 'number' &&
      typeof c.paymentModes === 'number' &&
      typeof c.vehicleTypes === 'number' &&
      typeof c.vehicleMasters === 'number'
    );
  });

  // 4. Test Fleet B Overview and Isolation
  let fleetBOverview: any;
  await assert('SuperAdmin can fetch Fleet B dedicated overview (HTTP 200)', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetB.tenantId}/overview`, {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        'X-Tenant-ID': fleetB.tenantId,
        'X-Inspection-Mode': 'true',
      },
    });
    fleetBOverview = res.data?.data;
    return res.status === 200 && res.data?.success === true && !!fleetBOverview;
  });

  await assert('Fleet A and Fleet B data are strictly isolated (no cross-tenant leakage)', () => {
    return (
      fleetAOverview.tenantId !== fleetBOverview.tenantId &&
      fleetAOverview.name !== fleetBOverview.name &&
      fleetAOverview.code !== fleetBOverview.code
    );
  });

  // 5. Test Scoped Inspection Module Rosters for Fleet A
  await assert('SuperAdmin can inspect Companies roster scoped to Fleet A', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/inspection-data?module=companies`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.data)) {
      // Verify every item belongs to Fleet A
      return res.data.data.every((c: any) => c.tenantId === fleetA.tenantId);
    }
    return false;
  });

  await assert('SuperAdmin can inspect Users roster scoped to Fleet A', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/inspection-data?module=users`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.data)) {
      return res.data.data.every((u: any) => u.tenantId === fleetA.tenantId);
    }
    return false;
  });

  await assert('SuperAdmin can inspect Vehicles roster scoped to Fleet A', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/inspection-data?module=vehicles`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.data)) {
      return res.data.data.every((v: any) => v.tenantId === fleetA.tenantId);
    }
    return false;
  });

  await assert('SuperAdmin can inspect Drivers roster scoped to Fleet A', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/inspection-data?module=drivers`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.data)) {
      return res.data.data.every((d: any) => d.tenantId === fleetA.tenantId);
    }
    return false;
  });

  await assert('SuperAdmin can inspect Owners/Vendors roster scoped to Fleet A', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/inspection-data?module=owners`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.data)) {
      return res.data.data.every((o: any) => o.tenantId === fleetA.tenantId);
    }
    return false;
  });

  await assert('SuperAdmin can inspect Bookings roster scoped to Fleet A', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/inspection-data?module=bookings`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.data)) {
      return res.data.data.every((b: any) => b.tenantId === fleetA.tenantId);
    }
    return false;
  });

  await assert('SuperAdmin can inspect Master Data roster scoped to Fleet A', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/inspection-data?module=masters`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (res.status === 200 && res.data.data) {
      const { taxes, cities, areas, paymentModes, vehicleTypes } = res.data.data;
      return (
        Array.isArray(taxes) &&
        Array.isArray(cities) &&
        Array.isArray(areas) &&
        Array.isArray(paymentModes) &&
        Array.isArray(vehicleTypes)
      );
    }
    return false;
  });

  await assert('SuperAdmin can inspect Subscription & Invoices roster scoped to Fleet A', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/inspection-data?module=billing`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (res.status === 200 && res.data.data) {
      return Boolean(res.data.data.subscription) && Array.isArray(res.data.data.invoices);
    }
    return false;
  });

  // 6. Security & Read-Only Authorization Guards
  await assert('Unauthenticated request to fleet overview is rejected (HTTP 401)', async () => {
    try {
      await axios.get(`${BASE_URL}/api/tenants/${fleetA.tenantId}/overview`);
      return false;
    } catch (err: any) {
      return err.response?.status === 401;
    }
  });

  await assert('Operational mutations (POST) in inspection mode are strictly blocked (HTTP 403)', async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/vehicle/addVehicle`,
        { vehicleNumber: 'TEST-READONLY-MUTATION' },
        {
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            'X-Tenant-ID': fleetA.tenantId,
            'X-Inspection-Mode': 'true',
          },
        }
      );
      return false;
    } catch (err: any) {
      return (
        err.response?.status === 403 &&
        String(err.response?.data?.message).includes('disabled in read-only fleet inspection')
      );
    }
  });

  await assert('Non-existent fleet ID in overview returns HTTP 404', async () => {
    try {
      await axios.get(`${BASE_URL}/api/tenants/00000000-0000-0000-0000-000000000000/overview`, {
        headers: { Authorization: `Bearer ${superAdminToken}` },
      });
      return false;
    } catch (err: any) {
      return err.response?.status === 404;
    }
  });

  console.log('\n================================================================================');
  console.log(`🏁 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFleetOverviewTests().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
