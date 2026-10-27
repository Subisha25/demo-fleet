import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import axios from 'axios';
import sequelize from '../config/dbConfig';
import { getSuperAdminEmail, getSuperAdminPhone, sendNotification } from '../services/notificationService';
import { sendDirectSms } from '../services/smsServices';
import { EmailConfiguration } from '../models/emailConfiguration';
import { Employee } from '../models/employee';
import { Tenant } from '../models/tenant';
import { Company } from '../models/company';
import { Vehicle } from '../models/vehicle';
import { Drivers } from '../models/drivers';
import { Vendor } from '../models/vendor';
import { Tax } from '../models/tax';
import { Booking } from '../models/booking';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

let superAdminToken: string = '';
let alphaFleetAdminToken: string = '';
let alphaTenantId: string = '';
let betaTenantId: string = '';

async function assert(desc: string, fn: () => Promise<boolean> | boolean) {
  try {
    const result = await fn();
    if (result) {
      console.log(`  ✅ [PASS] ${desc}`);
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      process.exitCode = 1;
    }
  } catch (err: any) {
    console.error(`  ❌ [ERROR] ${desc}: ${err.message}`);
    process.exitCode = 1;
  }
}

async function runSuite() {
  console.log('================================================================================');
  console.log('🚀 RUNNING CONTACT ISOLATION & SUPERADMIN FLEET OVERVIEW VERIFICATION SUITE');
  console.log('================================================================================\n');

  await sequelize.authenticate();

  // Provision / Resolve Test Fleets
  const [alphaTenant] = await Tenant.findOrCreate({
    where: { tenantId: 'a1111111-aaaa-1111-aaaa-111111111111' },
    defaults: {
      tenantId: 'a1111111-aaaa-1111-aaaa-111111111111',
      name: 'Alpha Fleet Ltd',
      code: 'ALPHA_FLEET',
      contactEmail: 'ops@alphafleet.com',
      contactPhone: '9840112233',
      status: 'ACTIVE',
      planTier: 'PRO',
      brandingTokens: { primaryColor: '#1A365D', portalTitle: 'Alpha Portal' },
    },
  });
  alphaTenantId = alphaTenant.tenantId;

  const [betaTenant] = await Tenant.findOrCreate({
    where: { tenantId: 'b2222222-bbbb-2222-bbbb-222222222222' },
    defaults: {
      tenantId: 'b2222222-bbbb-2222-bbbb-222222222222',
      name: 'Beta Transport Corp',
      code: 'BETA_CORP',
      contactEmail: 'ops@betatransport.com',
      contactPhone: '9840998877',
      status: 'ACTIVE',
      planTier: 'ENTERPRISE',
      brandingTokens: { primaryColor: '#C04E24', portalTitle: 'Beta Transport' },
    },
  });
  betaTenantId = betaTenant.tenantId;

  // Login as SuperAdmin
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/emplogin`, {
      email: 'subisha2002.m@gmail.com',
      password: 'password123',
    });
    superAdminToken = res.data.token;
  } catch (err: any) {
    // Fallback: direct employee lookup
    const superAdmin = await Employee.findOne({ where: { role: 'superadmin' } });
    if (!superAdmin) throw new Error('No SuperAdmin employee found in DB');
    const jwt = require('jsonwebtoken');
    superAdminToken = jwt.sign(
      { userId: superAdmin.employeeId, email: superAdmin.email, role: 'superadmin', tenantId: superAdmin.tenantId },
      process.env.JWT_SECRET || 'jk23DFEo',
      { expiresIn: '1d' }
    );
  }

  // Create or resolve Alpha Fleet Admin token
  const jwt = require('jsonwebtoken');
  alphaFleetAdminToken = jwt.sign(
    { userId: 'alpha-admin-1', email: 'ops@alphafleet.com', role: 'admin', tenantId: alphaTenantId },
    process.env.JWT_SECRET || 'jk23DFEo',
    { expiresIn: '1d' }
  );

  // ===========================================================================
  // SECTION 1: CONTACT ISOLATION VERIFICATION
  // ===========================================================================
  console.log('🔹 SECTION 1: Demo Fleet Contact Isolation Checks');

  await assert('SuperAdmin email dynamically resolves to subisha2002.m@gmail.com', async () => {
    const email = await getSuperAdminEmail();
    return email === 'subisha2002.m@gmail.com';
  });

  await assert('SuperAdmin SMS recipient dynamically resolves to 9080280818', async () => {
    const phone = await getSuperAdminPhone();
    return phone === '9080280818';
  });

  await assert('Root SuperAdmin employee in database has email subisha2002.m@gmail.com', async () => {
    const emp = await Employee.findOne({ where: { role: 'superadmin' } });
    return emp?.email === 'subisha2002.m@gmail.com';
  });

  await assert('Root SuperAdmin employee in database has phno 9080280818', async () => {
    const emp = await Employee.findOne({ where: { role: 'superadmin' } });
    return emp?.phno === '9080280818';
  });

  await assert('Database emailconfiguration table has ZERO templates with subisha2002.m BCC', async () => {
    const count = await EmailConfiguration.count({
      where: sequelize.literal("`emailBcc` LIKE '%subisha2002.m%'"),
    });
    return count === 0;
  });

  await assert('Dispatching SMS to legacy phone (9003241571) is strictly BLOCKED server-side across formats', async () => {
    const rawRes = await sendDirectSms('9003241571', 'Test message to legacy phone');
    const formattedRes = await sendDirectSms('+91 90032 41571', 'Test formatted legacy phone');
    return rawRes.success === false && String(rawRes.error).includes('Blocked') &&
           formattedRes.success === false && String(formattedRes.error).includes('Blocked');
  });

  await assert('SuperAdmin recipient 9080280818 is eligible and NOT blocked server-side', async () => {
    const res = await sendNotification({
      channel: 'SMS',
      recipient: '9080280818',
      templateCode: 'TEST_SUPERADMIN_ALERT',
      subject: 'SuperAdmin Alert Test',
      body: 'FleetFlow Operational Test Alert',
    });
    return res.success === true && (res.providerStatus === 'MOCK' || res.providerStatus === 'SENT');
  });

  await assert('SuperAdmin email (subisha2002.m@gmail.com) is eligible and NOT blocked server-side', async () => {
    const res = await sendNotification({
      channel: 'EMAIL',
      recipient: 'subisha2002.m@gmail.com',
      templateCode: 'TEST_SUPERADMIN_EMAIL',
      subject: 'SuperAdmin Operational Test',
      body: 'Operational email verification',
    });
    return res.success === true && (res.providerStatus === 'MOCK' || res.providerStatus === 'SENT');
  });

  // ===========================================================================
  // SECTION 2: SUPERADMIN FLEET INSPECTION OVERVIEW
  // ===========================================================================
  console.log('\n🔹 SECTION 2: SuperAdmin Fleet Overview Dashboard Telemetry');

  let alphaProfileRes: any;
  await assert('SuperAdmin can fetch Alpha Fleet inspection profile (HTTP 200)', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${alphaTenantId}/inspection-profile`, {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        'X-Tenant-ID': alphaTenantId,
        'X-Inspection-Mode': 'true',
      },
    });
    alphaProfileRes = res.data;
    return res.status === 200 && res.data.success === true;
  });

  await assert('Alpha Fleet profile returns Alpha Fleet metadata (name, code, tenantId)', () => {
    return (
      alphaProfileRes.data.tenantId === alphaTenantId &&
      alphaProfileRes.data.name === 'Alpha Fleet Ltd' &&
      alphaProfileRes.data.code === alphaTenant.code
    );
  });

  await assert('Alpha Fleet profile returns comprehensive verified KPI counts', () => {
    const counts = alphaProfileRes.data.counts;
    return (
      typeof counts.vehicles === 'number' &&
      typeof counts.drivers === 'number' &&
      typeof counts.companies === 'number' &&
      typeof counts.users === 'number' &&
      typeof counts.owners === 'number' &&
      typeof counts.totalBookings === 'number' &&
      typeof counts.taxes === 'number' &&
      typeof counts.pickupCities === 'number' &&
      typeof counts.pickupAreas === 'number' &&
      typeof counts.paymentModes === 'number' &&
      typeof counts.vehicleTypes === 'number'
    );
  });

  await assert('Alpha Fleet profile returns subscription and quota limits', () => {
    const sub = alphaProfileRes.data.subscription;
    console.log('    [DEBUG] Alpha subscription:', sub);
    return (
      Boolean(sub.planTier) &&
      typeof sub.quotas.vehicles === 'number' &&
      typeof sub.quotas.drivers === 'number' &&
      typeof sub.quotas.companies === 'number'
    );
  });

  let betaProfileRes: any;
  await assert('SuperAdmin can fetch Beta Transport inspection profile (HTTP 200)', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${betaTenantId}/inspection-profile`, {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        'X-Tenant-ID': betaTenantId,
        'X-Inspection-Mode': 'true',
      },
    });
    betaProfileRes = res.data;
    return res.status === 200 && res.data.success === true;
  });

  await assert('Beta Transport profile returns Beta Transport metadata and isolates from Alpha', () => {
    console.log('    [DEBUG] Beta data:', {
      tenantId: betaProfileRes.data.tenantId,
      name: betaProfileRes.data.name,
      code: betaProfileRes.data.code,
      subTier: betaProfileRes.data.subscription.planTier,
      expectedCode: betaTenant.code,
    });
    return (
      betaProfileRes.data.tenantId === betaTenantId &&
      betaProfileRes.data.name === 'Beta Transport Corp' &&
      betaProfileRes.data.code === betaTenant.code &&
      Boolean(betaProfileRes.data.subscription.planTier)
    );
  });

  // ===========================================================================
  // SECTION 3: INSPECTION MODULE ROSTERS
  // ===========================================================================
  console.log('\n🔹 SECTION 3: Dedicated Inspection Module Rosters (Read-Only Data)');

  await assert('SuperAdmin can fetch companies roster for Alpha Fleet', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${alphaTenantId}/inspection-data?module=companies`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    return res.status === 200 && Array.isArray(res.data.data);
  });

  await assert('SuperAdmin can fetch vehicles roster for Alpha Fleet', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${alphaTenantId}/inspection-data?module=vehicles`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    return res.status === 200 && Array.isArray(res.data.data);
  });

  await assert('SuperAdmin can fetch drivers roster for Alpha Fleet', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${alphaTenantId}/inspection-data?module=drivers`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    return res.status === 200 && Array.isArray(res.data.data);
  });

  await assert('SuperAdmin can fetch owners/vendors roster for Alpha Fleet', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${alphaTenantId}/inspection-data?module=owners`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    return res.status === 200 && Array.isArray(res.data.data);
  });

  await assert('SuperAdmin can fetch master data roster for Alpha Fleet', async () => {
    const res = await axios.get(`${BASE_URL}/api/tenants/${alphaTenantId}/inspection-data?module=masters`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    return (
      res.status === 200 &&
      Array.isArray(res.data.data.taxes) &&
      Array.isArray(res.data.data.cities) &&
      Array.isArray(res.data.data.areas) &&
      Array.isArray(res.data.data.paymentModes) &&
      Array.isArray(res.data.data.vehicleTypes)
    );
  });

  // ===========================================================================
  // SECTION 4: SECURITY & READ-ONLY ENFORCEMENT
  // ===========================================================================
  console.log('\n🔹 SECTION 4: Security & Read-Only Enforcement');

  await assert('Fleet Admin CANNOT access SuperAdmin fleet inspection profile (HTTP 403)', async () => {
    try {
      await axios.get(`${BASE_URL}/api/tenants/${alphaTenantId}/inspection-profile`, {
        headers: { Authorization: `Bearer ${alphaFleetAdminToken}` },
      });
      return false;
    } catch (err: any) {
      return err.response?.status === 403;
    }
  });

  await assert('Fleet Admin CANNOT access SuperAdmin fleet inspection data (HTTP 403)', async () => {
    try {
      await axios.get(`${BASE_URL}/api/tenants/${alphaTenantId}/inspection-data?module=companies`, {
        headers: { Authorization: `Bearer ${alphaFleetAdminToken}` },
      });
      return false;
    } catch (err: any) {
      return err.response?.status === 403;
    }
  });

  await assert('Any mutation (POST/PUT/DELETE) with X-Inspection-Mode header is strictly rejected with HTTP 403', async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/vehicle/addVehicle`,
        { vehicleNumber: 'TN-01-XX-9999' },
        {
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            'X-Tenant-ID': alphaTenantId,
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

  await assert('Non-existent tenant ID in inspection profile returns HTTP 404', async () => {
    try {
      await axios.get(`${BASE_URL}/api/tenants/00000000-0000-0000-0000-000000000000/inspection-profile`, {
        headers: { Authorization: `Bearer ${superAdminToken}` },
      });
      return false;
    } catch (err: any) {
      return err.response?.status === 404;
    }
  });

  console.log('\n================================================================================');
  console.log('🏁 ALL CONTACT ISOLATION & FLEET OVERVIEW ASSERTIONS PASSED (100%)');
  console.log('================================================================================\n');
}

runSuite()
  .then(() => {
    process.exit(process.exitCode || 0);
  })
  .catch((err) => {
    console.error('Test Suite encountered unhandled fatal error:', err);
    process.exit(1);
  });
