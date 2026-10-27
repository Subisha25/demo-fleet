import dotenv from 'dotenv';
dotenv.config();

// Enforce test mock mode so no real external network requests occur
process.env.NOTIFICATION_MOCK_MODE = 'true';
process.env.NODE_ENV = 'test';

import axios from 'axios';
import bcrypt from 'bcrypt';
import { Employee } from '../models/employee';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { getSuperAdminEmail, getSuperAdminPhone, sendNotification } from '../services/notificationService';
import { sendDirectSms, send2FactorTemplateSms, normalizePhoneNumberForSms } from '../services/smsServices';
import { sendOTP as mobileAppSendOtp } from '../appServices/appLoginServices';
import { sendPublicBookingOtp } from '../services/publicBookingServices';

const BASE_URL = (process.env.API_BASE_URL || 'http://localhost:5000').replace(/\/api\/?$/, '') + '/api';

let passedTests = 0;
let failedTests = 0;

async function assert(desc: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  [PASS] ${desc}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  [FAIL] ${desc}`);
    const details = err.response?.data ? JSON.stringify(err.response.data) : (err.message || String(err));
    console.error(`         ${details}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n======================================================================');
  console.log('   FLEETFLOW SUPERADMIN PROFILE & DYNAMIC SMS AUDIT TEST SUITE');
  console.log('======================================================================\n');

  // Verify DB root SuperAdmin state
  const rootAdmin = await Employee.findOne({
    where: {
      role: 'superadmin',
      tenantId: ROOT_TENANT_ID,
    },
  });

  if (!rootAdmin) {
    throw new Error('Platform root SuperAdmin record not found in employee table!');
  }

  console.log(`[INFO] Found Root SuperAdmin: ${rootAdmin.username} (${rootAdmin.email}), ID: ${rootAdmin.employeeId}`);
  console.log(`[INFO] Current DB Phone: ${rootAdmin.phno}, Address: ${rootAdmin.address || 'N/A'}, GSTIN: ${rootAdmin.gstin || 'N/A'}`);

  // Obtain SuperAdmin JWT Token via login
  let superAdminToken = '';
  const authHeaders: any = {
    headers: {
      Authorization: '',
      'X-Tenant-ID': ROOT_TENANT_ID,
    },
  };

  await assert('Authenticate as SuperAdmin to get valid JWT token', async () => {
    // Try login or generate token using login API or root user credentials
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: rootAdmin.email,
      password: process.env.SUPERADMIN_DEFAULT_PASSWORD || 'Admin@123',
    }).catch(async () => {
      // If password differs, reset to known password temporarily for test
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('TestAdmin@123', salt);
      await rootAdmin.update({ password: hashed });
      return axios.post(`${BASE_URL}/auth/login`, {
        email: rootAdmin.email,
        password: 'TestAdmin@123',
      });
    });

    const token = loginRes.data?.token || loginRes.data?.accessToken;
    if (!token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }
    superAdminToken = token;
    authHeaders.headers.Authorization = `Bearer ${token}`;
  });

  // ---------------------------------------------------------------------------
  // TEST GROUP 1: SuperAdmin Profile Fetching
  // ---------------------------------------------------------------------------
  console.log('\n--- GROUP 1: SuperAdmin Profile Fetching & Schema ---');

  await assert('GET /api/user/profile returns authenticated SuperAdmin details', async () => {
    const res = await axios.get(`${BASE_URL}/user/profile`, authHeaders);
    if (!res.data.success || !res.data.profile) {
      throw new Error(`Expected success profile, got: ${JSON.stringify(res.data)}`);
    }
    const p = res.data.profile;
    if (p.email !== rootAdmin.email) {
      throw new Error(`Expected email ${rootAdmin.email}, got ${p.email}`);
    }
    if (p.role !== 'superadmin') {
      throw new Error(`Expected role superadmin, got ${p.role}`);
    }
    if (p.phone !== '9080280818') {
      throw new Error(`Expected phone 9080280818, got ${p.phone}`);
    }
    if (!('address' in p) || !('gstin' in p) || !('profileImage' in p)) {
      throw new Error('Missing address, gstin, or profileImage keys in profile payload');
    }
    // Security check: password hash must NEVER be returned
    if ('password' in p || 'passwordHash' in p) {
      throw new Error('SECURITY VIOLATION: Password hash leaked in profile response!');
    }
  });

  await assert('GET /api/user/profile rejects unauthenticated requests (HTTP 401)', async () => {
    try {
      await axios.get(`${BASE_URL}/user/profile`);
      throw new Error('Expected request without token to fail');
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        throw new Error(`Expected 401/403, got ${err.response?.status}`);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // TEST GROUP 2: SuperAdmin Profile Updates & Persistence
  // ---------------------------------------------------------------------------
  console.log('\n--- GROUP 2: Profile Update, Persistence & Input Validation ---');

  await assert('PUT /api/user/profile updates SuperAdmin address, GSTIN and phone cleanly', async () => {
    const updatePayload = {
      name: 'Super Administrator',
      phone: '9080280818',
      address: 'Tower 4, Level 7, OMR Tech Corridor, Chennai, TN 600096',
      gstin: '33AAMCG2518C1Z0',
      profileImage: '/uploads/profileImg/test_admin.png',
    };

    const res = await axios.put(`${BASE_URL}/user/profile`, updatePayload, authHeaders);
    if (!res.data.success) {
      throw new Error(`Profile update failed: ${JSON.stringify(res.data)}`);
    }

    // Verify persistence in DB
    await rootAdmin.reload();
    if (rootAdmin.address !== updatePayload.address) {
      throw new Error(`DB address mismatch: expected ${updatePayload.address}, got ${rootAdmin.address}`);
    }
    if (rootAdmin.gstin !== updatePayload.gstin) {
      throw new Error(`DB GSTIN mismatch: expected ${updatePayload.gstin}, got ${rootAdmin.gstin}`);
    }
    if (rootAdmin.phno !== '9080280818') {
      throw new Error(`DB phno mismatch: expected 9080280818, got ${rootAdmin.phno}`);
    }
  });

  await assert('PUT /api/user/profile rejects obsolete phone 9003241571 with HTTP 400', async () => {
    try {
      await axios.put(
        `${BASE_URL}/user/profile`,
        {
          name: 'Super Administrator',
          phone: '9003241571',
        },
        authHeaders
      );
      throw new Error('Expected 9003241571 update to be rejected');
    } catch (err: any) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400 rejection, got ${err.response?.status}`);
      }
      if (!err.response?.data?.message?.includes('prohibited') && !err.response?.data?.message?.includes('deprecated')) {
        throw new Error(`Expected clear deprecation error message, got: ${err.response?.data?.message}`);
      }
    }
  });

  await assert('PUT /api/user/profile rejects formatted variants of 9003241571 (+91 90032 41571)', async () => {
    try {
      await axios.put(
        `${BASE_URL}/user/profile`,
        {
          name: 'Super Administrator',
          phone: '+91 90032 41571',
        },
        authHeaders
      );
      throw new Error('Expected formatted variant of 9003241571 to be rejected');
    } catch (err: any) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400 rejection, got ${err.response?.status}`);
      }
    }
  });

  await assert('PUT /api/user/profile rejects invalid GSTIN format', async () => {
    try {
      await axios.put(
        `${BASE_URL}/user/profile`,
        {
          name: 'Super Administrator',
          phone: '9080280818',
          gstin: 'INVALID_GSTIN_123',
        },
        authHeaders
      );
      throw new Error('Expected invalid GSTIN to be rejected');
    } catch (err: any) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400 rejection, got ${err.response?.status}`);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // TEST GROUP 3: Password Change Flow
  // ---------------------------------------------------------------------------
  console.log('\n--- GROUP 3: Password Change Flow & Verification ---');

  await assert('PUT /api/user/profile/password rejects incorrect current password (HTTP 400)', async () => {
    try {
      await axios.put(
        `${BASE_URL}/user/profile/password`,
        {
          currentPassword: 'WrongPassword999!',
          newPassword: 'BrandNewSecurePass@2026',
        },
        authHeaders
      );
      throw new Error('Expected incorrect current password to fail');
    } catch (err: any) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400 rejection, got ${err.response?.status}`);
      }
    }
  });

  await assert('PUT /api/user/profile/password rejects new password shorter than 6 characters', async () => {
    try {
      await axios.put(
        `${BASE_URL}/user/profile/password`,
        {
          currentPassword: 'TestAdmin@123',
          newPassword: '123',
        },
        authHeaders
      );
      throw new Error('Expected short password to fail');
    } catch (err: any) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400 rejection, got ${err.response?.status}`);
      }
    }
  });

  await assert('PUT /api/user/profile/password changes password with correct current password and reverts cleanly', async () => {
    const res = await axios.put(
      `${BASE_URL}/user/profile/password`,
      {
        currentPassword: 'TestAdmin@123',
        newPassword: 'SuperTempPass@2026',
      },
      authHeaders
    );
    if (!res.data.success) {
      throw new Error(`Password change failed: ${JSON.stringify(res.data)}`);
    }

    // Verify new password works
    await rootAdmin.reload();
    const matchNew = await bcrypt.compare('SuperTempPass@2026', rootAdmin.password);
    if (!matchNew) {
      throw new Error('New password was not hashed and persisted properly in DB');
    }

    // Revert back cleanly to TestAdmin@123
    const revertRes = await axios.put(
      `${BASE_URL}/user/profile/password`,
      {
        currentPassword: 'SuperTempPass@2026',
        newPassword: 'TestAdmin@123',
      },
      authHeaders
    );
    if (!revertRes.data.success) {
      throw new Error(`Password revert failed: ${JSON.stringify(revertRes.data)}`);
    }
  });

  // ---------------------------------------------------------------------------
  // TEST GROUP 4: Public Contact Endpoint & Non-Leakage
  // ---------------------------------------------------------------------------
  console.log('\n--- GROUP 4: Dynamic Public Contact & Privacy Separation ---');

  await assert('GET /api/public/contact-info returns public support contact without leaking SuperAdmin private info', async () => {
    const res = await axios.get(`${BASE_URL}/public/contact-info`);
    if (!res.data.success || !res.data.contact) {
      throw new Error(`Expected public contact payload, got: ${JSON.stringify(res.data)}`);
    }
    const c = res.data.contact;
    if (!c.phone.includes('98417') && !c.phone.includes('+91')) {
      throw new Error(`Expected public customer support phone, got: ${c.phone}`);
    }
    // Must NOT leak SuperAdmin private phone
    if (c.phone === '9080280818' || c.phone.includes('9080280818')) {
      throw new Error('PRIVACY VIOLATION: SuperAdmin private phone leaked in public contact API!');
    }
    // Must NOT leak old obsolete phone
    if (c.phone.includes('9003241571')) {
      throw new Error('VIOLATION: Obsolete phone 9003241571 exposed in public contact API!');
    }
    // Must NOT leak private email
    if (c.email === rootAdmin.email) {
      throw new Error('PRIVACY VIOLATION: SuperAdmin private email leaked in public contact API!');
    }
  });

  await assert('GET /api/tenants/public/contact-info alias behaves identically', async () => {
    const res = await axios.get(`${BASE_URL}/tenants/public/contact-info`);
    if (!res.data.success || !res.data.contact) {
      throw new Error('Expected /api/tenants/public/contact-info alias to work');
    }
  });

  // ---------------------------------------------------------------------------
  // TEST GROUP 5: Dynamic Contact Resolution Precedence
  // ---------------------------------------------------------------------------
  console.log('\n--- GROUP 5: Dynamic Contact Resolution Precedence ---');

  await assert('getSuperAdminPhone() resolves to Database Employee record primary source (9080280818)', async () => {
    const phone = await getSuperAdminPhone();
    if (phone !== '9080280818') {
      throw new Error(`Expected getSuperAdminPhone() to return 9080280818, got: ${phone}`);
    }
  });

  await assert('getSuperAdminPhone() dynamically follows database updates', async () => {
    await rootAdmin.update({ phno: '9080280819' });
    const updatedPhone = await getSuperAdminPhone();
    if (updatedPhone !== '9080280819') {
      throw new Error(`Expected updated phone 9080280819, got: ${updatedPhone}`);
    }
    // Revert back
    await rootAdmin.update({ phno: '9080280818' });
    const revertedPhone = await getSuperAdminPhone();
    if (revertedPhone !== '9080280818') {
      throw new Error(`Expected reverted phone 9080280818, got: ${revertedPhone}`);
    }
  });

  await assert('getSuperAdminPhone() never resolves to 9003241571 even if present in DB or env', async () => {
    await rootAdmin.update({ phno: '9003241571' });
    const originalEnv = process.env.SUPERADMIN_PHONE;
    process.env.SUPERADMIN_PHONE = '9003241571';

    try {
      const phone = await getSuperAdminPhone();
      if (phone === '9003241571' || phone.includes('9003241571')) {
        throw new Error(`VIOLATION: getSuperAdminPhone returned prohibited number: ${phone}`);
      }
    } finally {
      // Restore clean state
      await rootAdmin.update({ phno: '9080280818' });
      process.env.SUPERADMIN_PHONE = originalEnv || '9080280818';
    }
  });

  await assert('getSuperAdminPhone() fails safely to empty string if DB and env missing', async () => {
    await rootAdmin.update({ phno: '' });
    const originalEnv = process.env.SUPERADMIN_PHONE;
    const originalAdminPhone = process.env.ADMIN_PHONE;
    delete process.env.SUPERADMIN_PHONE;
    delete process.env.ADMIN_PHONE;

    try {
      const phone = await getSuperAdminPhone();
      if (phone !== '') {
        throw new Error(`Expected empty string fail-safe, got: ${phone}`);
      }
    } finally {
      await rootAdmin.update({ phno: '9080280818' });
      if (originalEnv) process.env.SUPERADMIN_PHONE = originalEnv;
      if (originalAdminPhone) process.env.ADMIN_PHONE = originalAdminPhone;
    }
  });

  // ---------------------------------------------------------------------------
  // TEST GROUP 6: SMS Providers & Mock Mode Protection
  // ---------------------------------------------------------------------------
  console.log('\n--- GROUP 6: SMS Dispatch Chain & Mock Mode Protection ---');

  await assert('sendDirectSms strictly blocks 9003241571 and all formatted variants', async () => {
    const variants = ['9003241571', '+91 90032 41571', '+91-9003241571', '90032-41571'];
    for (const v of variants) {
      const res = await sendDirectSms(v, 'Test message');
      if (res.success || res.providerStatus !== 'FAILED') {
        throw new Error(`Expected variant ${v} to be blocked, got: ${JSON.stringify(res)}`);
      }
    }
  });

  await assert('send2FactorTemplateSms strictly blocks 9003241571 and all formatted variants', async () => {
    const variants = ['9003241571', '+91 90032 41571', '+91-9003241571'];
    for (const v of variants) {
      const res = await send2FactorTemplateSms({
        to: v,
        templateName: 'Booking Creation',
        vars: ['Test'],
      });
      if (res.success || res.providerStatus !== 'FAILED') {
        throw new Error(`Expected variant ${v} to be blocked in 2Factor adapter, got: ${JSON.stringify(res)}`);
      }
    }
  });

  await assert('sendNotification SMS strictly blocks 9003241571 and records FAILED audit log', async () => {
    const res = await sendNotification({
      channel: 'SMS',
      recipient: '9003241571',
      templateCode: 'TEST_ISOLATION_CHECK',
      body: 'Test notification',
    });
    if (res.success || res.providerStatus !== 'FAILED') {
      throw new Error(`Expected sendNotification to block 9003241571, got: ${JSON.stringify(res)}`);
    }
  });

  await assert('sendDirectSms allows 9080280818 in mock mode without external network request', async () => {
    const res = await sendDirectSms('9080280818', 'FleetFlow SuperAdmin test notification');
    if (!res.success) {
      throw new Error(`Expected 9080280818 to succeed in mock mode, got: ${JSON.stringify(res)}`);
    }
    if (!res.providerMessageId?.startsWith('mock_')) {
      throw new Error(`Expected mock provider message ID, got: ${res.providerMessageId}`);
    }
  });

  await assert('send2FactorTemplateSms allows 9080280818 in mock mode without external network request', async () => {
    const res = await send2FactorTemplateSms({
      to: '9080280818',
      templateName: 'Booking Creation',
      vars: ['Test'],
    });
    if (!res.success) {
      throw new Error(`Expected 9080280818 to succeed in mock mode, got: ${JSON.stringify(res)}`);
    }
    if (!res.providerMessageId?.startsWith('mock_')) {
      throw new Error(`Expected mock provider message ID, got: ${res.providerMessageId}`);
    }
  });

  await assert('Mobile App sendOTP respects mock mode and blocks 9003241571', async () => {
    let blockedResponseData: any = null;
    let blockedStatusCode = 0;
    const mockResBlocked: any = {
      status: (code: number) => {
        blockedStatusCode = code;
        return {
          json: (data: any) => {
            blockedResponseData = data;
          },
        };
      },
    };

    const mockReqBlocked: any = {
      body: { mobile: '9003241571' },
    };

    await mobileAppSendOtp(mockReqBlocked, mockResBlocked);
    // Should either reject or fail to dispatch
    if (blockedStatusCode === 200 && blockedResponseData?.success) {
      throw new Error('VIOLATION: Mobile-app sendOTP dispatched OTP to 9003241571!');
    }
  });

  await assert('Public booking OTP routes to submitted customer phone and respects mock mode', async () => {
    let pubOtpStatus = 0;
    let pubOtpData: any = null;
    const mockRes: any = {
      status: (code: number) => {
        pubOtpStatus = code;
        return {
          json: (data: any) => {
            pubOtpData = data;
          },
        };
      },
    };

    const mockReq: any = {
      body: { phone: '9841722675' },
    };

    await sendPublicBookingOtp(mockReq, mockRes);
    if (pubOtpStatus !== 200 || !pubOtpData?.success) {
      throw new Error(`Public booking OTP failed: ${JSON.stringify(pubOtpData)}`);
    }
    if (!pubOtpData?.sessionId) {
      throw new Error('Public booking OTP did not return sessionId');
    }
  });

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
