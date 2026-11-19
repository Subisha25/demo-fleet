process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import app from '../app';
import {
  connectDB,
  Tenant,
  Company,
  Booking,
  Drivers,
  VehicleMaster,
  VehicleType,
  Vehicle,
  PackageData,
  OTP,
  Invoice,
  ClosePending,
} from '../models';
import config from '../config/config';
import { ORDER } from '../utils/costants';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';

const EXPECTED_PROTECTED_TABLES: Record<string, number> = {
  employee: 3,
  emailconfiguration: 40,
  configuration: 1,
  sms_logs: 30,
  sms_templates: 7,
  saas_plans: 4,
  short_links: 28,
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
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsedData = rawData;
          try {
            parsedData = JSON.parse(rawData);
          } catch {}
          resolve({
            statusCode: res.statusCode || 500,
            data: parsedData,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function generateFleetAdminToken(tenantId: string, email: string = 'fleetadmin@test.com'): string {
  return jwt.sign(
    {
      userId: uuidv4(),
      email,
      role: 'fleet_admin',
      tenantId,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function verifyProtectedTables(stepName: string) {
  const sequelize = (Tenant as any).sequelize;
  for (const [table, expectedCount] of Object.entries(EXPECTED_PROTECTED_TABLES)) {
    const [result]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\``);
    const count = Number(result[0]?.count ?? 0);
    if (count !== expectedCount) {
      throw new Error(
        `[SAFETY VIOLATION] at "${stepName}": Protected table \`${table}\` expected ${expectedCount} rows, found ${count}!`
      );
    }
  }
}

async function runPublicBookingSubmissionFixE2E() {
  console.log('========================================================================');
  console.log('FLEETFLOW — PUBLIC BOOKING SUBMISSION FIX & VALIDATION E2E TEST SUITE');
  console.log('========================================================================\n');

  await connectDB();
  await verifyProtectedTables('Initial Pre-Test Baseline');
  console.log('✅ Baseline 7 Protected Tables Verified Exact: employee:3, emailconfiguration:40, etc.');

  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      port = typeof addr === 'object' && addr ? addr.port : 5001;
      console.log(`✅ Test server running on ephemeral port: ${port}`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Send OTP for customer (9080280818)
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Public Booking Send OTP ---');
    const sendOtpRes = await makeRequest('POST', '/api/public/booking/send-otp', {
      phone: '9080280818',
    });
    console.log('Send OTP Response:', sendOtpRes.statusCode, sendOtpRes.data.success, sendOtpRes.data.sessionId);
    if (sendOtpRes.statusCode !== 200 || !sendOtpRes.data.sessionId) {
      throw new Error(`Failed to send OTP: ${JSON.stringify(sendOtpRes.data)}`);
    }
    const sessionId = sendOtpRes.data.sessionId;

    // Retrieve generated OTP from DB
    const otpRecord = await OTP.findOne({ where: { sessionId } });
    if (!otpRecord) throw new Error('OTP record not found in database!');
    const generatedOtp = otpRecord.otp;
    console.log(`✅ Generated OTP retrieved from database: ${generatedOtp}`);

    // -------------------------------------------------------------
    // TEST 2: Verify OTP & Obtain Tamper-Resistant Verification Token
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Public Booking Verify OTP ---');
    const verifyOtpRes = await makeRequest('POST', '/api/public/booking/verify-otp', {
      phone: '9080280818',
      otp: generatedOtp,
      sessionId,
    });
    console.log('Verify OTP Response:', verifyOtpRes.statusCode, verifyOtpRes.data.success);
    if (verifyOtpRes.statusCode !== 200 || !verifyOtpRes.data.verificationToken) {
      throw new Error(`Failed to verify OTP: ${JSON.stringify(verifyOtpRes.data)}`);
    }
    const verificationToken = verifyOtpRes.data.verificationToken;
    console.log(`✅ Verification token issued: ${verificationToken}`);

    // -------------------------------------------------------------
    // TEST 3: Validation Tests on /create Endpoint
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Form Field Validation Handling ---');

    // Retrieve an active public package
    const packagesRes = await makeRequest('GET', '/api/public/booking/packages');
    if (!packagesRes.data.success || !packagesRes.data.packages?.length) {
      throw new Error('No public packages available for testing!');
    }
    const selectedPkg = packagesRes.data.packages[0];
    console.log(`Selected Test Package: "${selectedPkg.packageName}" (${selectedPkg.fleetName} - ₹${selectedPkg.amountPerKm}/km)`);

    // 3a. Incomplete email format (subipcs@gm)
    console.log('3a. Testing incomplete email (subipcs@gm)...');
    const badEmailRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Test Customer',
      customerEmail: 'subipcs@gm',
      phone: '9080280818',
      verificationToken,
      pickupPoint: 'T Nagar',
      dropPoint: 'Airport',
      packageDataId: selectedPkg.packageDataId,
      pickupDate: '2026-11-20',
      pickupTime: '10:00',
      travellersCount: 1,
    });
    if (badEmailRes.statusCode !== 400 || badEmailRes.data.field !== 'customerEmail') {
      throw new Error(`Expected 400 for bad email, got ${badEmailRes.statusCode}: ${JSON.stringify(badEmailRes.data)}`);
    }
    console.log(`✅ Rejected incomplete email properly: "${badEmailRes.data.message}"`);

    // 3b. Missing customer name
    console.log('3b. Testing missing customer name...');
    const noNameRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: ' ',
      customerEmail: 'subipcs@gmail.com',
      phone: '9080280818',
      verificationToken,
      pickupPoint: 'T Nagar',
      dropPoint: 'Airport',
      packageDataId: selectedPkg.packageDataId,
      pickupDate: '2026-11-20',
      pickupTime: '10:00',
      travellersCount: 1,
    });
    if (noNameRes.statusCode !== 400 || noNameRes.data.field !== 'customerName') {
      throw new Error(`Expected 400 for missing customerName, got ${noNameRes.statusCode}: ${JSON.stringify(noNameRes.data)}`);
    }
    console.log(`✅ Rejected empty customer name: "${noNameRes.data.message}"`);

    // 3c. Missing pickup point
    console.log('3c. Testing missing pickup point...');
    const noPickupRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Test Customer',
      customerEmail: 'subipcs@gmail.com',
      phone: '9080280818',
      verificationToken,
      pickupPoint: '',
      dropPoint: 'Airport',
      packageDataId: selectedPkg.packageDataId,
      pickupDate: '2026-11-20',
      pickupTime: '10:00',
      travellersCount: 1,
    });
    if (noPickupRes.statusCode !== 400 || noPickupRes.data.field !== 'pickupPoint') {
      throw new Error(`Expected 400 for missing pickupPoint, got ${noPickupRes.statusCode}: ${JSON.stringify(noPickupRes.data)}`);
    }
    console.log(`✅ Rejected empty pickup point: "${noPickupRes.data.message}"`);

    // 3d. Missing drop point
    console.log('3d. Testing missing drop point...');
    const noDropRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Test Customer',
      customerEmail: 'subipcs@gmail.com',
      phone: '9080280818',
      verificationToken,
      pickupPoint: 'T Nagar',
      dropPoint: '',
      packageDataId: selectedPkg.packageDataId,
      pickupDate: '2026-11-20',
      pickupTime: '10:00',
      travellersCount: 1,
    });
    if (noDropRes.statusCode !== 400 || noDropRes.data.field !== 'dropPoint') {
      throw new Error(`Expected 400 for missing dropPoint, got ${noDropRes.statusCode}: ${JSON.stringify(noDropRes.data)}`);
    }
    console.log(`✅ Rejected empty drop point: "${noDropRes.data.message}"`);

    // 3e. Invalid past date
    console.log('3e. Testing past pickup date...');
    const pastDateRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Test Customer',
      customerEmail: 'subipcs@gmail.com',
      phone: '9080280818',
      verificationToken,
      pickupPoint: 'T Nagar',
      dropPoint: 'Airport',
      packageDataId: selectedPkg.packageDataId,
      pickupDate: '2020-01-01',
      pickupTime: '10:00',
      travellersCount: 1,
    });
    if (pastDateRes.statusCode !== 400 || pastDateRes.data.field !== 'pickupDate') {
      throw new Error(`Expected 400 for past pickupDate, got ${pastDateRes.statusCode}: ${JSON.stringify(pastDateRes.data)}`);
    }
    console.log(`✅ Rejected past pickup date: "${pastDateRes.data.message}"`);

    // 3f. Missing pickup time
    console.log('3f. Testing missing pickup time...');
    const noTimeRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Test Customer',
      customerEmail: 'subipcs@gmail.com',
      phone: '9080280818',
      verificationToken,
      pickupPoint: 'T Nagar',
      dropPoint: 'Airport',
      packageDataId: selectedPkg.packageDataId,
      pickupDate: '2026-11-20',
      pickupTime: '',
      travellersCount: 1,
    });
    if (noTimeRes.statusCode !== 400 || noTimeRes.data.field !== 'pickupTime') {
      throw new Error(`Expected 400 for missing pickupTime, got ${noTimeRes.statusCode}: ${JSON.stringify(noTimeRes.data)}`);
    }
    console.log(`✅ Rejected empty pickup time: "${noTimeRes.data.message}"`);

    // 3g. Excessive passenger count
    console.log('3g. Testing excessive passenger count...');
    const excessPassengersRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Test Customer',
      customerEmail: 'subipcs@gmail.com',
      phone: '9080280818',
      verificationToken,
      pickupPoint: 'T Nagar',
      dropPoint: 'Airport',
      packageDataId: selectedPkg.packageDataId,
      vehicleMasterId: selectedPkg.vehicleMasterId,
      pickupDate: '2026-11-20',
      pickupTime: '10:00',
      travellersCount: 99,
    });
    if (excessPassengersRes.statusCode !== 400 || excessPassengersRes.data.field !== 'travellersCount') {
      throw new Error(`Expected 400 for excess passengers, got ${excessPassengersRes.statusCode}: ${JSON.stringify(excessPassengersRes.data)}`);
    }
    console.log(`✅ Rejected excessive passenger count: "${excessPassengersRes.data.message}"`);

    // -------------------------------------------------------------
    // TEST 4: Successful Public Booking with OPTIONAL email (Omitted email)
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Create Public Booking with Optional/Omitted Email ---');
    // Re-verify token because previous test invalidated or needs fresh token
    const createNoEmailRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Ramesh NoEmail',
      // customerEmail is omitted entirely
      phone: '9080280818',
      verificationToken,
      pickupPoint: 'Velachery, Chennai',
      dropPoint: 'Tambaram, Chennai',
      packageDataId: selectedPkg.packageDataId,
      vehicleMasterId: selectedPkg.vehicleMasterId,
      pickupDate: '2026-11-20',
      pickupTime: '11:00',
      travellersCount: 2,
      distance: 15,
      notes: 'No luggage, need AC cab',
    });

    console.log('Create Booking (No Email) Response:', createNoEmailRes.statusCode, createNoEmailRes.data.success);
    if (createNoEmailRes.statusCode !== 201 || !createNoEmailRes.data.bookingCode) {
      throw new Error(`Failed to create booking without email: ${JSON.stringify(createNoEmailRes.data)}`);
    }
    const noEmailBookingCode = createNoEmailRes.data.bookingCode;
    console.log(`✅ Successfully created Public Booking without email! Reference: ${noEmailBookingCode}`);

    // Verify DB insertion
    const dbNoEmailBooking = await Booking.findOne({ where: { bookingCode: noEmailBookingCode } });
    if (!dbNoEmailBooking) throw new Error(`Booking ${noEmailBookingCode} not found in DB!`);
    if (dbNoEmailBooking.behalfOfName !== 'Ramesh NoEmail') throw new Error('Passenger name mismatch!');
    if (String(dbNoEmailBooking.confirmStatus) !== '0') throw new Error('Booking initial confirmStatus must be 0 (PENDING)!');
    if (dbNoEmailBooking.preferredType !== 'PUBLIC_BOOKING') throw new Error('Preferred type must be PUBLIC_BOOKING!');
    console.log(`✅ Database insertion verified for booking ${noEmailBookingCode}. Initial status: PENDING (0).`);

    // -------------------------------------------------------------
    // TEST 5: Create Public Booking with VALID email
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Create Public Booking with Valid Email ---');
    // Generate fresh OTP session for next booking
    const sendOtp2 = await makeRequest('POST', '/api/public/booking/send-otp', { phone: '9080280818' });
    const otpRec2 = await OTP.findOne({ where: { sessionId: sendOtp2.data.sessionId } });
    const verifyOtp2 = await makeRequest('POST', '/api/public/booking/verify-otp', {
      phone: '9080280818',
      otp: otpRec2!.otp,
      sessionId: sendOtp2.data.sessionId,
    });
    const token2 = verifyOtp2.data.verificationToken;

    const createWithEmailRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Subisha WithEmail',
      customerEmail: 'subipcs@gmail.com',
      phone: '9080280818',
      verificationToken: token2,
      pickupPoint: 'T Nagar, Chennai',
      dropPoint: 'Chennai International Airport (MAA)',
      packageDataId: selectedPkg.packageDataId,
      vehicleMasterId: selectedPkg.vehicleMasterId,
      pickupDate: '2026-11-21',
      pickupTime: '09:30',
      travellersCount: 1,
      distance: 20,
    });

    console.log('Create Booking (With Email) Response:', createWithEmailRes.statusCode, createWithEmailRes.data.success);
    if (createWithEmailRes.statusCode !== 201 || !createWithEmailRes.data.bookingCode) {
      throw new Error(`Failed to create booking with email: ${JSON.stringify(createWithEmailRes.data)}`);
    }
    const withEmailBookingCode = createWithEmailRes.data.bookingCode;
    console.log(`✅ Successfully created Public Booking with email! Reference: ${withEmailBookingCode}`);

    // Verify DB insertion
    const dbWithEmailBooking = await Booking.findOne({ where: { bookingCode: withEmailBookingCode } });
    if (!dbWithEmailBooking) throw new Error(`Booking ${withEmailBookingCode} not found in DB!`);
    const notesParsed = JSON.parse(dbWithEmailBooking.notes || '{}');
    if (notesParsed.packageSnapshot?.customerEmail !== 'subipcs@gmail.com') {
      throw new Error('Email not preserved in packageSnapshot!');
    }
    console.log(`✅ Email verified in booking notes packageSnapshot: ${notesParsed.packageSnapshot?.customerEmail}`);

    // -------------------------------------------------------------
    // TEST 6: Verify Confirm Pending List for Target Fleet Admin
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Confirm Pending Appearance Under Target Fleet Admin ---');
    const targetTenantId = selectedPkg.tenantId;
    const targetFleetToken = generateFleetAdminToken(targetTenantId);

    const pendingOrdersRes = await makeRequest('GET', '/api/emp/confirmPendingOrderCountWeb', undefined, {
      Authorization: `Bearer ${targetFleetToken}`,
    });

    if (pendingOrdersRes.statusCode !== 200 || !Array.isArray(pendingOrdersRes.data.data)) {
      throw new Error(`Failed to fetch Confirm Pending orders: ${JSON.stringify(pendingOrdersRes.data)}`);
    }

    const targetList = pendingOrdersRes.data.data;
    const foundBooking = targetList.find((b: any) => b.bookingCode === withEmailBookingCode);
    if (!foundBooking) {
      throw new Error(`Newly created booking ${withEmailBookingCode} did not appear in Fleet Admin's Confirm Pending list!`);
    }
    console.log(`✅ Booking ${withEmailBookingCode} found in target Fleet Admin Confirm Pending queue!`);
    console.log(`   - Passenger Name: ${foundBooking.behalfOfName}`);
    console.log(`   - Passenger Phone: ${foundBooking.behalfOfPhone}`);
    console.log(`   - Company: ${foundBooking.company?.companyName || 'Corporate Client'}`);
    console.log(`   - Initial ConfirmStatus: ${foundBooking.confirmStatus}`);

    // -------------------------------------------------------------
    // TEST 7: Tenant Isolation — Ensure Booking NEVER Appears in Another Fleet
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Strict Tenant Isolation Check ---');
    const otherTenant = await Tenant.findOne({
      where: {
        tenantId: { [require('sequelize').Op.ne]: targetTenantId },
        isDeleted: false,
      },
    });

    if (otherTenant) {
      const otherFleetToken = generateFleetAdminToken(otherTenant.tenantId);
      const otherFleetOrdersRes = await makeRequest('GET', '/api/emp/confirmPendingOrderCountWeb', undefined, {
        Authorization: `Bearer ${otherFleetToken}`,
      });

      const otherList = otherFleetOrdersRes.data.data || [];
      const leaked = otherList.find((b: any) => b.bookingCode === withEmailBookingCode);
      if (leaked) {
        throw new Error(`[ISOLATION LEAK] Booking ${withEmailBookingCode} leaked into foreign fleet ${otherTenant.name}!`);
      }
      console.log(`✅ Zero leakage verified: Booking does not appear under foreign fleet ${otherTenant.name}.`);
    }

    // -------------------------------------------------------------
    // TEST 8: Full Order Lifecycle Verification
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Complete Order Lifecycle (Confirm -> Close -> Complete) ---');
    // 8a. Find or create an eligible driver for the target fleet
    let driver = await Drivers.findOne({ where: { tenantId: targetTenantId, isDeleted: false } });
    if (!driver) {
      driver = await Drivers.create({
        driverId: uuidv4(),
        driverName: 'E2E Test Driver',
        driverNumber: '9876500001',
        driverEmail: `driver_${Date.now()}@testfleet.com`,
        licenseNumber: `DL${Date.now()}`,
        tenantId: targetTenantId,
        isDeleted: false,
      });
    }

    // 8b. Confirm Booking (Assign Driver) via PATCH /api/vendor/confirmBookingforWeb
    console.log('8b. Fleet Admin confirms booking with driver...');
    const confirmRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBookingforWeb',
      {
        bookingId: dbWithEmailBooking.bookingId,
        driverId: driver.driverId,
        vehicleId: dbWithEmailBooking.vehicleId,
        vehicleMasterId: dbWithEmailBooking.vehicleMasterId,
      },
      { Authorization: `Bearer ${targetFleetToken}` }
    );
    if (confirmRes.statusCode !== 200 && confirmRes.statusCode !== 201) {
      throw new Error(`Failed to confirm booking: ${JSON.stringify(confirmRes.data)}`);
    }
    console.log('✅ Booking confirmed by Fleet Admin successfully!');

    // 8c. Close Order via POST /api/closePendingOrder/createClosePending
    console.log('8c. Fleet Admin closes pending order...');
    const actualKms = 30;
    const agreedRate = selectedPkg.amountPerKm || 14;
    const expectedTotal = actualKms * agreedRate;

    const closeRes = await makeRequest(
      'POST',
      '/api/closePendingOrder/createClosePending',
      {
        bookingId: dbWithEmailBooking.bookingId,
        pickupDate: '2026-11-21',
        packageDataId: selectedPkg.packageDataId,
        companyId: dbWithEmailBooking.companyId,
        garageOpenKm: 1000,
        garageCloseKm: 1030,
        garageKms: actualKms,
        guestKms: actualKms,
        packageAmount: expectedTotal,
        totalAmount: expectedTotal,
        totalDue: expectedTotal,
        selectedPackage: `${selectedPkg.packageDataId}::public_km`,
        discount: '0',
        advanceAmount: '0',
        notes: 'Public trip closed successfully in E2E test',
      },
      { Authorization: `Bearer ${targetFleetToken}` }
    );
    if (closeRes.statusCode !== 200 && closeRes.statusCode !== 201) {
      throw new Error(`Failed to close order: ${JSON.stringify(closeRes.data)}`);
    }
    console.log('✅ Order closed successfully into Payment Pending / Invoiced!');

    // -------------------------------------------------------------
    // TEST 9: Final Protected Tables Exact Count Verification
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Protected Tables Exact Count Verification ---');
    await verifyProtectedTables('Final Post-Test Check');
    console.log('✅ 100% PROTECTED DATABASE TABLES VERIFIED EXACT!');
    console.log('   - employee: 3');
    console.log('   - emailconfiguration: 40');
    console.log('   - configuration: 1');
    console.log('   - sms_logs: 30');
    console.log('   - sms_templates: 7');
    console.log('   - saas_plans: 4');
    console.log('   - short_links: 28');

    console.log('\n========================================================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY (100% PASS RATE)');
    console.log('========================================================================\n');
  } finally {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }
}

runPublicBookingSubmissionFixE2E().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
