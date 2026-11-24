process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import jwt from 'jsonwebtoken';
import app from '../app';
import config from '../config/config';
import {
  sequelize,
  connectDB,
  Company,
  Drivers,
  VehicleMaster,
  User,
  Tenant,
  Vendor,
} from '../models';
import {
  validateMobileRecipient,
  validateEmailRecipient,
  validateGstin,
  validatePan,
  validatePinCode,
  validateVehicleRegistration,
  validatePositiveNumber,
  validateInteger,
  validateDateRange,
  handleDatabaseError,
} from '../utils/validationUtils';
import { ROOT_TENANT_ID } from '../context/tenantContext';

async function makeRequest(
  port: number,
  method: string,
  reqPath: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any; headers: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : undefined;
    const reqHeaders: Record<string, string> = {
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path: reqPath,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          resolve({ status: res.statusCode || 500, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function generateSuperAdminToken(): string {
  return jwt.sign(
    {
      userId: 'saas-superadmin-001',
      roles: 'superadmin',
      tenantId: ROOT_TENANT_ID,
    },
    config.security.jwtSecret,
    { expiresIn: '1h' }
  );
}

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 CABZ — COMPREHENSIVE FORM VALIDATION & DUPLICATE HANDLING E2E TEST');
  console.log('======================================================================\n');

  await connectDB();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });
  const port = (server.address() as any).port;
  console.log(`🚀 Test server started on ephemeral port: ${port}\n`);

  const saToken = generateSuperAdminToken();
  const authHeaders = {
    Authorization: `Bearer ${saToken}`,
  };

  let passed = 0;
  let failed = 0;

  function assert(condition: any, msg: string) {
    if (Boolean(condition)) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  try {
    // =========================================================================
    // SECTION 1: UNIT VALIDATION UTILITY CHECKS
    // =========================================================================
    console.log('--- SECTION 1: Unit Validation Framework Verification ---');

    // 1. Phone number format checks
    const p1 = validateMobileRecipient('987654321'); // 9 digits
    assert(!p1.valid && p1.error?.includes('must be exactly 10 digits'), 'Reject 9-digit phone number with exact message');

    const p2 = validateMobileRecipient('98765432109'); // 11 digits
    assert(!p2.valid && p2.error?.includes('must be exactly 10 digits'), 'Reject 11-digit phone number with exact message');

    const p3 = validateMobileRecipient('5876543210'); // Starts with 5 (Non-TRAI)
    assert(!p3.valid && p3.error?.includes('starting with 6, 7, 8, or 9'), 'Reject invalid Indian mobile prefix starting with 5');

    const p4 = validateMobileRecipient('9999999999'); // Dummy repeated digits
    assert(!p4.valid && p4.error?.includes('test or placeholder'), 'Reject dummy placeholder 9999999999');

    const p5 = validateMobileRecipient('+91 98765 43210'); // Valid with +91 and spaces
    assert(p5.valid && p5.normalizedPhone === '9876543210', 'Normalize +91 98765 43210 to clean 10 digits');

    // 2. Email format checks
    const e1 = validateEmailRecipient('invalid-email');
    assert(!e1.valid && e1.error?.includes('valid email address format'), 'Reject invalid email format');

    const e2 = validateEmailRecipient('user@example.com');
    assert(!e2.valid && e2.error?.includes('not accepted'), 'Reject synthetic/dummy domain @example.com');

    const e3 = validateEmailRecipient('fleet.admin@cabzmobility.in');
    assert(e3.valid && e3.normalizedEmail === 'fleet.admin@cabzmobility.in', 'Accept genuine corporate email format');

    // 3. GSTIN checks
    const g1 = validateGstin('INVALIDGST');
    assert(!g1.valid && g1.error?.includes('must be exactly 15 characters'), 'Reject short GSTIN');

    const g2 = validateGstin('22AAAAA0000A1Z5');
    assert(g2.valid && g2.normalized === '22AAAAA0000A1Z5', 'Accept valid 15-char Indian GSTIN');

    // 4. Vehicle Registration checks
    const v1 = validateVehicleRegistration('DL123');
    assert(!v1.valid && v1.error?.includes('Invalid Indian vehicle registration format'), 'Reject malformed vehicle registration');

    const v2 = validateVehicleRegistration('MH-01-AB-1234');
    assert(v2.valid && v2.normalized === 'MH01AB1234', 'Accept and normalize valid Indian vehicle registration MH01AB1234');

    // 5. Numeric & date checks
    const n1 = validatePositiveNumber('-50', 'Rate');
    assert(!n1.valid && n1.error?.includes('must be greater than zero'), 'Reject negative numeric rate');

    const n2 = validateInteger('3.5', 'Passenger count');
    assert(!n2.valid && n2.error?.includes('whole number'), 'Reject non-integer passenger count');

    const d1 = validateDateRange('2026-11-20', '2026-11-10', 'Start date', 'End date');
    assert(!d1.valid && d1.error?.includes('cannot be before'), 'Reject inverted date range');

    // =========================================================================
    // SECTION 2: COMPANY FORM DUPLICATE & EDIT EXCLUSION
    // =========================================================================
    console.log('\n--- SECTION 2: Company Form Validation & Edit Exclusion ---');

    const testTenantId = 'e7b8a1c0-0000-0000-0000-000000000001';
    const testCode = 'TST' + Math.floor(100 + Math.random() * 900);
    const testPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
    const testEmail = `company.${Date.now()}@testcabz.com`;

    // 1. Create Company with valid data
    const createRes = await makeRequest(port, 'POST', '/api/emp/createCompany', {
      companyName: `Test Company ${testCode}`,
      companyCode: testCode,
      companyPhno: testPhone,
      email: testEmail,
      gstNo: '33AAMCG2518C1Z0',
      companyAddress: '123 Tech Park',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pinCode: '600001',
    }, authHeaders);

    assert(createRes.status === 201 && createRes.data?.company, 'Successfully created initial test company');
    const companyId = createRes.data?.company?.companyId;

    // 2. Reject duplicate company code in same tenant
    const dupCodeRes = await makeRequest(port, 'POST', '/api/emp/createCompany', {
      companyName: `Different Company Name`,
      companyCode: testCode,
      companyPhno: '9700000001',
      gstNo: '33AAMCG2518C1Z0',
    }, authHeaders);

    assert(
      dupCodeRes.status === 409 && (dupCodeRes.data?.message?.includes('already in use') || dupCodeRes.data?.message?.includes('already registered')),
      `Reject duplicate company code with HTTP 409 and message: "${dupCodeRes.data?.message}"`
    );

    // 3. Reject duplicate phone number in same tenant
    const dupPhoneRes = await makeRequest(port, 'POST', '/api/emp/createCompany', {
      companyName: `Another Company Name`,
      companyCode: 'DIFF' + Math.floor(100 + Math.random() * 900),
      companyPhno: testPhone,
      gstNo: '33AAMCG2518C2Z1',
    }, authHeaders);

    assert(
      dupPhoneRes.status === 409 && (dupPhoneRes.data?.message?.includes('already registered') || dupPhoneRes.data?.message?.includes('already in use')),
      `Reject duplicate phone with HTTP 409 and message: "${dupPhoneRes.data?.message}"`
    );

    // 4. CRITICAL EDIT FORM TEST: Edit company without changing code or phone
    const editSameRes = await makeRequest(port, 'PUT', `/api/company/companyUpdate/${companyId}`, {
      companyName: `Test Company ${testCode} Updated`,
      companyCode: testCode, // UNCHANGED
      companyPhno: testPhone, // UNCHANGED
      companyAddress: 'Updated Address 456',
    }, authHeaders);

    assert(
      editSameRes.status === 200 && editSameRes.data?.success,
      'EDIT FORM SUCCESS: Updating company while keeping unchanged companyCode and phone succeeds without false duplicate errors'
    );

    // =========================================================================
    // SECTION 3: DRIVER MANAGEMENT DUPLICATE & EDIT EXCLUSION
    // =========================================================================
    console.log('\n--- SECTION 3: Driver Form Validation & Edit Exclusion ---');

    const driverPhone = '99' + Math.floor(10000000 + Math.random() * 90000000);
    const driverEmail = `driver.${Date.now()}@testcabz.com`;

    // 1. Create Driver with valid data
    const createDriverRes = await makeRequest(port, 'POST', '/api/vendor/createDriver', {
      driverName: 'Ramesh Kumar',
      phno: driverPhone,
      driverEmail: driverEmail,
      licenseNo: 'DL1420110012345',
      address: 'Driver Colony',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '600002',
    }, authHeaders);

    assert(createDriverRes.status === 201 && createDriverRes.data?.driver, 'Successfully created test driver');
    const driverId = createDriverRes.data?.driver?.driverId;

    // 2. Reject duplicate driver phone number
    const dupDriverPhoneRes = await makeRequest(port, 'POST', '/api/vendor/createDriver', {
      driverName: 'Suresh Kumar',
      phno: driverPhone,
      driverEmail: `suresh.${Date.now()}@testcabz.com`,
    }, authHeaders);

    assert(
      dupDriverPhoneRes.status === 409 && (dupDriverPhoneRes.data?.message?.includes('already exists') || dupDriverPhoneRes.data?.message?.includes('already registered')),
      `Reject duplicate driver phone with HTTP 409 and message: "${dupDriverPhoneRes.data?.message}"`
    );

    // 3. EDIT FORM TEST: Update driver while keeping unchanged mobile number
    const editDriverSameRes = await makeRequest(port, 'PUT', `/api/driver/update/${driverId}`, {
      driverName: 'Ramesh Kumar Updated',
      phno: driverPhone, // UNCHANGED
      driverEmail: driverEmail, // UNCHANGED
      address: 'Updated Driver Colony 789',
    }, authHeaders);

    assert(
      editDriverSameRes.status === 200 && editDriverSameRes.data?.success,
      'EDIT FORM SUCCESS: Updating driver while keeping unchanged mobile and email succeeds without false duplicate errors'
    );

    // =========================================================================
    // SECTION 4: VEHICLE MASTER DUPLICATE & EDIT EXCLUSION
    // =========================================================================
    console.log('\n--- SECTION 4: Vehicle Master Form Validation & Edit Exclusion ---');

    const [testVendor] = await Vendor.findOrCreate({
      where: { vendorName: 'Test Vendor Self', tenantId: ROOT_TENANT_ID },
      defaults: {
        vendorName: 'Test Vendor Self',
        tenantId: ROOT_TENANT_ID,
        phno: '9840199999',
        email: 'vendor.test@cabz.com',
        password: 'hashed_password'
      }
    });

    const vehicleReg = 'TN09AB' + Math.floor(1000 + Math.random() * 9000);

    // 1. Create Vehicle Master
    const createVehRes = await makeRequest(port, 'POST', '/api/vehicleMaster/unified-create', {
      vehicleType: 'Sedan',
      seatCapacity: 4,
      AdvanceBookingHours: 2,
      vehicleModelName: 'Maruti Dzire',
      manufacturing: '2024',
      vehicleNumber: vehicleReg,
      vendorId: testVendor.vendorId,
    }, authHeaders);

    assert(createVehRes.status === 201 && (createVehRes.data?.vehicleMaster || createVehRes.data?.success), 'Successfully created vehicle master');
    const vehicleMasterId = createVehRes.data?.vehicleMaster?.vehicleMasterId || createVehRes.data?.data?.vehicleMaster?.vehicleMasterId;

    // 2. Reject duplicate vehicle registration number
    const dupVehRes = await makeRequest(port, 'POST', '/api/vehicleMaster/unified-create', {
      vehicleType: 'Sedan',
      seatCapacity: 4,
      AdvanceBookingHours: 2,
      vehicleModelName: 'Maruti Dzire',
      manufacturing: '2024',
      vehicleNumber: vehicleReg,
      vendorId: testVendor.vendorId,
    }, authHeaders);

    assert(
      dupVehRes.status === 409 && dupVehRes.data?.message?.includes('already registered'),
      `Reject duplicate vehicle registration with HTTP 409 and message: "${dupVehRes.data?.message}"`
    );

    // 3. EDIT FORM TEST: Update vehicle master while keeping unchanged vehicleNumber
    const editVehSameRes = await makeRequest(port, 'PUT', `/api/vehicleMaster/${vehicleMasterId}/update`, {
      vehicleNumber: vehicleReg, // UNCHANGED
      vehicleModel: 'Toyota Innova Crysta ZX',
      vehicleType: 'Innova',
    }, authHeaders);

    assert(
      editVehSameRes.status === 200 && editVehSameRes.data?.success,
      'EDIT FORM SUCCESS: Updating vehicle while keeping unchanged vehicle number succeeds without false duplicate errors'
    );

    // =========================================================================
    // SECTION 5: USER MANAGEMENT DUPLICATE & EDIT EXCLUSION
    // =========================================================================
    console.log('\n--- SECTION 5: User Management Validation & Edit Exclusion ---');

    const userPhone = '96' + Math.floor(10000000 + Math.random() * 90000000);
    const userEmail = `emp.${Date.now()}@testcabz.com`;

    // 1. Register User
    const createUserRes = await makeRequest(port, 'POST', '/api/auth/createUser', {
      username: 'Pooja Sharma',
      email: userEmail,
      mobile: userPhone,
      companyId: companyId,
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pinCode: '600001',
    }, authHeaders);

    assert(createUserRes.status === 201 && createUserRes.data?.User, 'Successfully registered test user');
    const userId = createUserRes.data?.User?.userId;

    // 2. Reject duplicate user phone number
    const dupUserPhoneRes = await makeRequest(port, 'POST', '/api/auth/createUser', {
      username: 'Another User',
      email: `other.${Date.now()}@testcabz.com`,
      mobile: userPhone,
      companyId: companyId,
    }, authHeaders);

    assert(
      dupUserPhoneRes.status === 409 && dupUserPhoneRes.data?.message?.includes('already registered'),
      `Reject duplicate user mobile with HTTP 409 and message: "${dupUserPhoneRes.data?.message}"`
    );

    // 3. EDIT FORM TEST: Update user while keeping unchanged phone and email
    const editUserSameRes = await makeRequest(port, 'PUT', `/api/user/updateUser/${userId}`, {
      username: 'Pooja Sharma Senior',
      email: userEmail, // UNCHANGED
      mobile: userPhone, // UNCHANGED
      city: 'Chennai',
    }, authHeaders);

    assert(
      editUserSameRes.status === 200 && editUserSameRes.data?.success,
      'EDIT FORM SUCCESS: Updating user while keeping unchanged mobile and email succeeds without false duplicate errors'
    );

    // Clean up temporary test records safely
    if (userId) await User.destroy({ where: { userId } });
    if (vehicleMasterId) await VehicleMaster.destroy({ where: { vehicleMasterId } });
    if (driverId) await Drivers.destroy({ where: { driverId } });
    if (companyId) await Company.destroy({ where: { companyId } });

  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log('\n======================================================================');
  console.log(`📊 TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
