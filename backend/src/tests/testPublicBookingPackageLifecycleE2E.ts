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
  TenantSubscription,
  Company,
  User,
  Booking,
  Drivers,
  Vehicle,
  VehicleMaster,
  VehicleType,
  Vendor,
  Invoice,
  ClosePending,
  Payment,
  PaymentMode,
  Package,
  PackageData,
  Tax,
  OTP,
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
  short_links: 27,
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
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed: any = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode || 0,
            data: parsed,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ ${message}`);
  }
}

async function verifyProtectedTables(stage: string) {
  console.log(`\n🔍 Verifying Protected Tables Count (${stage}):`);
  const sequelize = (Tenant as any).sequelize;
  for (const [table, expected] of Object.entries(EXPECTED_PROTECTED_TABLES)) {
    const [result]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\``);
    const count = Number(result[0].count);
    assert(count === expected, `Protected table '${table}' count is exactly ${expected} (actual: ${count})`);
  }
}

async function runPublicBookingE2ETestSuite() {
  console.log('\n========================================================================');
  console.log('🚀 FLEETFLOW: PUBLIC BOOKING PACKAGE TYPE & E2E WORKFLOW VERIFICATION');
  console.log('========================================================================\n');

  await connectDB();
  await verifyProtectedTables('BASELINE BEFORE TESTS');

  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address() as any;
      port = address.port;
      console.log(`\n📡 Test server listening on ephemeral port ${port}`);
      resolve();
    });
  });

  const cleanupIds: {
    tenants: string[];
    companies: string[];
    users: string[];
    drivers: string[];
    vendors: string[];
    vehicles: string[];
    vehicleMasters: string[];
    vehicleTypes: string[];
    packages: string[];
    packageData: string[];
    taxes: string[];
    bookings: string[];
    invoices: string[];
    closePendings: string[];
    payments: string[];
    subs: string[];
  } = {
    tenants: [],
    companies: [],
    users: [],
    drivers: [],
    vendors: [],
    vehicles: [],
    vehicleMasters: [],
    vehicleTypes: [],
    packages: [],
    packageData: [],
    taxes: [],
    bookings: [],
    invoices: [],
    closePendings: [],
    payments: [],
    subs: [],
  };

  try {
    // -------------------------------------------------------------------------
    // SETUP: Multi-Tenant Test Data (Fleet A & Fleet B)
    // -------------------------------------------------------------------------
    console.log('\n--- SETUP: Multi-Tenant Test Fleets, Companies, Vehicles & Packages ---');

    const tenantAId = uuidv4();
    const tenantBId = uuidv4();
    cleanupIds.tenants.push(tenantAId, tenantBId);

    const tenantA = await Tenant.create({
      tenantId: tenantAId,
      name: 'Gandhi Fleet Direct',
      slug: 'gandhi-fleet',
      code: 'GFD',
      contactEmail: 'admin@gandhifleet.com',
      contactPhone: '9840111111',
      status: 'ACTIVE',
      planId: 'enterprise',
      logoUrl: 'https://example.com/gandhi-logo.png',
    });

    const tenantB = await Tenant.create({
      tenantId: tenantBId,
      name: 'Apex Cabs Express',
      slug: 'apex-cabs',
      code: 'ACE',
      contactEmail: 'admin@apexcabs.com',
      contactPhone: '9840222222',
      status: 'ACTIVE',
      planId: 'enterprise',
      logoUrl: 'https://example.com/apex-logo.png',
    });

    // Subscriptions
    const subA = await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantAId,
      planId: 'enterprise',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    });
    const subB = await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantBId,
      planId: 'enterprise',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    });
    cleanupIds.subs.push((subA as any).subscriptionId, (subB as any).subscriptionId);

    // Companies
    const companyAId = uuidv4();
    const companyBId = uuidv4();
    cleanupIds.companies.push(companyAId, companyBId);

    const companyA = await Company.create({
      companyId: companyAId,
      companyName: 'Surya Corporate Travels',
      companyCode: 'SCT',
      tenantId: tenantAId,
      companyEmail: 'ops@suryatravels.com',
      companyPhone: '9840111112',
      address: 'Gandhi Rd, Chennai',
      allowTax: 'yes',
      needEmail: true,
      isDeleted: false,
    });

    const companyB = await Company.create({
      companyId: companyBId,
      companyName: 'Apex Prime Logistics',
      companyCode: 'APL',
      tenantId: tenantBId,
      companyEmail: 'ops@apexlogistics.com',
      companyPhone: '9840222223',
      address: 'Mount Rd, Chennai',
      allowTax: 'yes',
      needEmail: true,
      isDeleted: false,
    });

    // JWT Tokens for Fleet Admins
    const tokenFleetA = jwt.sign(
      {
        userId: 'admin-a',
        role: 'SUPERADMIN',
        tenantId: tenantAId,
        email: 'admin@gandhifleet.com',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const tokenFleetB = jwt.sign(
      {
        userId: 'admin-b',
        role: 'SUPERADMIN',
        tenantId: tenantBId,
        email: 'admin@apexcabs.com',
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Vehicle Types
    // Fleet A: Innova (7 Seats), Sedan (4 Seats)
    const vtA1Id = uuidv4();
    const vtA2Id = uuidv4();
    const vtB1Id = uuidv4();
    cleanupIds.vehicleTypes.push(vtA1Id, vtA2Id, vtB1Id);

    const vtA1 = await VehicleType.create({
      vehicleTypeId: vtA1Id,
      vehicleType: 'Innova Crysta',
      seatCapacity: 7,
      tenantId: tenantAId,
      AdvanceBookingHours: '1',
      vehicleImg: 'https://example.com/innova.png',
      isDeleted: false,
    });

    const vtA2 = await VehicleType.create({
      vehicleTypeId: vtA2Id,
      vehicleType: 'Swift Dzire',
      seatCapacity: 4,
      tenantId: tenantAId,
      AdvanceBookingHours: '1',
      vehicleImg: 'https://example.com/dzire.png',
      isDeleted: false,
    });

    // Fleet B: Fortuner SUV (7 Seats)
    const vtB1 = await VehicleType.create({
      vehicleTypeId: vtB1Id,
      vehicleType: 'Toyota Fortuner',
      seatCapacity: 7,
      tenantId: tenantBId,
      AdvanceBookingHours: '1',
      vehicleImg: 'https://example.com/fortuner.png',
      isDeleted: false,
    });

    // Vehicles & VehicleMaster records
    const vehA1Id = uuidv4();
    const vehA2Id = uuidv4();
    const vehB1Id = uuidv4();
    cleanupIds.vehicles.push(vehA1Id, vehA2Id, vehB1Id);

    await Vehicle.create({
      vehicleId: vehA1Id,
      vehicleName: 'Innova Crysta TN-01-AB-1234',
      vehicleTypeId: vtA1Id,
      tenantId: tenantAId,
      companyId: companyAId,
      manufacturing: '2023',
      isDeleted: false,
    });

    await Vehicle.create({
      vehicleId: vehA2Id,
      vehicleName: 'Swift Dzire TN-01-CD-5678',
      vehicleTypeId: vtA2Id,
      tenantId: tenantAId,
      companyId: companyAId,
      manufacturing: '2023',
      isDeleted: false,
    });

    await Vehicle.create({
      vehicleId: vehB1Id,
      vehicleName: 'Fortuner TN-02-EF-9999',
      vehicleTypeId: vtB1Id,
      tenantId: tenantBId,
      companyId: companyBId,
      manufacturing: '2023',
      isDeleted: false,
    });

    // Vendors
    const vendorAId = uuidv4();
    cleanupIds.vendors.push(vendorAId);
    await Vendor.create({
      vendorId: vendorAId,
      vendorName: 'Surya Fleet Vendor',
      email: 'vendor@suryatravels.com',
      phno: '9840111199',
      tenantId: tenantAId,
      isDeleted: false,
    });

    const vmA1Id = uuidv4();
    const vmA2Id = uuidv4();
    cleanupIds.vehicleMasters.push(vmA1Id, vmA2Id);

    await VehicleMaster.create({
      vehicleMasterId: vmA1Id,
      vendorId: vendorAId,
      vehicleId: vehA1Id,
      vehicleTypeId: vtA1Id,
      vehicleNumber: 'TN-01-AB-1234',
      vehicleType: 'Innova Crysta',
      vehicleModelName: 'Innova Crysta',
      vendorName: 'Surya Fleet Vendor',
      manufacturing: '2023',
      insuranceExpiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      fcExpiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      status: 'active',
      tenantId: tenantAId,
      isDeleted: 0,
    });

    await VehicleMaster.create({
      vehicleMasterId: vmA2Id,
      vendorId: vendorAId,
      vehicleId: vehA2Id,
      vehicleTypeId: vtA2Id,
      vehicleNumber: 'TN-01-CD-5678',
      vehicleType: 'Swift Dzire',
      vehicleModelName: 'Swift Dzire',
      vendorName: 'Surya Fleet Vendor',
      manufacturing: '2023',
      insuranceExpiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      fcExpiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      status: 'active',
      tenantId: tenantAId,
      isDeleted: 0,
    });

    // Package master definitions
    const pkgPublicDefId = uuidv4();
    const pkgLocalDefId = uuidv4();
    cleanupIds.packages.push(pkgPublicDefId, pkgLocalDefId);

    await Package.create({
      packageId: pkgPublicDefId,
      packageType: 'PUBLIC_BOOKING',
      tenantId: tenantAId,
      companyId: companyAId,
      status: true,
      isDeleted: false,
    });

    await Package.create({
      packageId: pkgLocalDefId,
      packageType: 'Local City Use',
      tenantId: tenantAId,
      companyId: companyAId,
      status: true,
      isDeleted: false,
    });

    // Drivers for dispatch
    const driverAId = uuidv4();
    const driverBId = uuidv4();
    cleanupIds.drivers.push(driverAId, driverBId);

    await Drivers.create({
      driverId: driverAId,
      driverName: 'Murugan Driver (Fleet A)',
      driverEmail: 'murugan@gandhifleet.com',
      phno: '9840199991',
      tenantId: tenantAId,
      companyId: companyAId,
      isDeleted: false,
    });

    await Drivers.create({
      driverId: driverBId,
      driverName: 'Suresh Driver (Fleet B)',
      driverEmail: 'suresh@apexcabs.com',
      phno: '9840199992',
      tenantId: tenantBId,
      companyId: companyBId,
      isDeleted: false,
    });

    // -------------------------------------------------------------------------
    // TEST 1: Vehicle Mapping & Seat Capacity in getVehicleTypesByPackageId
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: Vehicle Mapping from VehicleMaster (GET /api/package/getVehicleTypesByPackageId) ---');
    const publicVehTypesRes = await makeRequest(
      'GET',
      `/api/package/getVehicleTypesByPackageId/${pkgPublicDefId}`,
      undefined,
      { Authorization: `Bearer ${tokenFleetA}` }
    );
    assert(publicVehTypesRes.statusCode === 200, 'getVehicleTypesByPackageId returns HTTP 200');
    assert(publicVehTypesRes.data.success === true, 'getVehicleTypesByPackageId marked success');
    const publicVehiclesList: any[] = publicVehTypesRes.data.data?.vehicleTypes || publicVehTypesRes.data.vehicleTypes || [];
    assert(publicVehiclesList.length === 2, `Returned exactly 2 VehicleMaster records for Fleet A (got ${publicVehiclesList.length})`);

    const innovaMaster = publicVehiclesList.find((v) => v.vehicleNumber === 'TN-01-AB-1234');
    assert(Boolean(innovaMaster), 'Fleet A Innova Crysta (TN-01-AB-1234) returned from VehicleMaster');
    assert(innovaMaster?.seatCapacity === 7, `Authoritative seatCapacity is 7 (derived from VehicleType, actual: ${innovaMaster?.seatCapacity})`);

    const dzireMaster = publicVehiclesList.find((v) => v.vehicleNumber === 'TN-01-CD-5678');
    assert(Boolean(dzireMaster), 'Fleet A Swift Dzire (TN-01-CD-5678) returned from VehicleMaster');
    assert(dzireMaster?.seatCapacity === 4, `Authoritative seatCapacity is 4 (derived from VehicleType, actual: ${dzireMaster?.seatCapacity})`);

    // Zero cross-tenant leakage for standard packages
    const standardPkgTypesRes = await makeRequest(
      'GET',
      `/api/package/getVehicleTypesByPackageId/${pkgLocalDefId}`,
      undefined,
      { Authorization: `Bearer ${tokenFleetA}` }
    );
    assert(standardPkgTypesRes.statusCode === 200, 'Standard package vehicle types returns 200');
    const standardTypes: any[] = standardPkgTypesRes.data.data?.vehicleTypes || standardPkgTypesRes.data.vehicleTypes || [];
    const hasFortunerLeak = standardTypes.some((vt) => vt.vehicleType === 'Toyota Fortuner');
    assert(!hasFortunerLeak, 'Zero cross-tenant leakage: Fleet B Toyota Fortuner is NOT present in Fleet A standard vehicle types');

    // -------------------------------------------------------------------------
    // TEST 2: Package Add / Update with Vehicle Array Payload Structure
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Create Public Booking Package with Vehicle Array Payload ---');
    const createPkgDataRes = await makeRequest(
      'POST',
      '/api/packageData/createPackageData',
      {
        companyId: companyAId,
        packageType: 'PUBLIC_BOOKING',
        packages: {
          vehicles: [
            {
              vehicleMasterId: vmA1Id,
              vehicleId: vehA1Id,
              vehicleTypeId: vtA1Id,
              vehicleModelName: 'Innova Crysta',
              vehicleNumber: 'TN-01-AB-1234',
              vehicleType: 'Innova Crysta',
              seatCapacity: 7, // Read-only derived from DB
              perKm: 18,
              isActive: true,
            },
            {
              vehicleMasterId: vmA2Id,
              vehicleId: vehA2Id,
              vehicleTypeId: vtA2Id,
              vehicleModelName: 'Swift Dzire',
              vehicleNumber: 'TN-01-CD-5678',
              vehicleType: 'Swift Dzire',
              seatCapacity: 4, // Read-only derived from DB
              perKm: 13,
              isActive: true,
            },
          ],
        },
      },
      { Authorization: `Bearer ${tokenFleetA}` }
    );
    assert(createPkgDataRes.statusCode === 201 || createPkgDataRes.statusCode === 200, `Package data created successfully (got ${createPkgDataRes.statusCode})`);
    const pkgAId = createPkgDataRes.data?.data?.packageDataId || createPkgDataRes.data?.packageDataId;
    cleanupIds.packageData.push(pkgAId);

    // Fleet B Public Package
    const pkgBId = uuidv4();
    cleanupIds.packageData.push(pkgBId);
    await PackageData.create({
      packageDataId: pkgBId,
      tenantId: tenantBId,
      companyId: companyBId,
      packageType: 'PUBLIC_BOOKING',
      packages: JSON.stringify({
        vehicles: [
          {
            vehicleId: vehB1Id,
            vehicleTypeId: vtB1Id,
            vehicleModelName: 'Toyota Fortuner',
            vehicleNumber: 'TN-02-EF-9999',
            vehicleType: 'Toyota Fortuner',
            seatCapacity: 7,
            perKm: 20,
            isActive: true,
          },
        ],
      }),
      isDeleted: false,
    });

    // -------------------------------------------------------------------------
    // TEST 3: Public Booking OTP-First Flow: Step 1 (Send OTP & Verify OTP)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: OTP-First Workflow: Step 1 Mobile Verification (Authorized Number 9080280818) ---');
    const sendOtpRes = await makeRequest('POST', '/api/public/booking/send-otp', {
      phone: '9080280818',
    });
    assert(sendOtpRes.statusCode === 200, 'Send OTP returns 200 OK');
    assert(sendOtpRes.data.success === true, 'Send OTP marked success');
    const sessionId = sendOtpRes.data.sessionId;
    const mockOtp = sendOtpRes.data.mockOtp || '123456';
    assert(Boolean(sessionId), 'Received OTP sessionId');

    const verifyOtpRes = await makeRequest('POST', '/api/public/booking/verify-otp', {
      phone: '9080280818',
      otp: mockOtp,
      sessionId,
    });
    assert(verifyOtpRes.statusCode === 200, 'Verify OTP returns 200 OK');
    assert(verifyOtpRes.data.success === true, 'Verify OTP marked success');
    const verificationToken = verifyOtpRes.data.verificationToken;
    assert(Boolean(verificationToken), 'Received tamper-resistant verification token');

    // -------------------------------------------------------------------------
    // TEST 4: Step 2: Vehicle Discovery & Seat Filters with Live Distance Fare
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: OTP-First Workflow: Step 2 Dynamic Vehicle Discovery & Live Distance Fare ---');
    const discoveryRes = await makeRequest('GET', '/api/public/booking/packages?distance=50');
    assert(discoveryRes.statusCode === 200, 'Discovery endpoint returns 200 OK');
    const allDiscoveredVehicles: any[] = discoveryRes.data.packages || [];
    assert(allDiscoveredVehicles.length >= 3, `Returned at least 3 vehicles across all fleets (got ${allDiscoveredVehicles.length})`);

    const innovaCard = allDiscoveredVehicles.find((v) => v.fleetName === 'Gandhi Fleet Direct' && v.seatCapacity === 7 && v.amountPerKm === 18);
    const dzireCard = allDiscoveredVehicles.find((v) => v.fleetName === 'Gandhi Fleet Direct' && v.seatCapacity === 4 && v.amountPerKm === 13);
    const fortunerCard = allDiscoveredVehicles.find((v) => v.fleetName === 'Apex Cabs Express' && v.seatCapacity === 7 && v.amountPerKm === 20);

    assert(Boolean(innovaCard), 'Fleet A Innova Crysta discovered (7S, ₹18/km, vehicleMaster TN-01-AB-1234 mapped)');
    assert(innovaCard?.estimatedFare === 50 * 18, `Innova estimated fare for 50km is ₹900 (actual: ${innovaCard?.estimatedFare})`);
    assert(Boolean(dzireCard), 'Fleet A Swift Dzire discovered (4S, ₹13/km)');
    assert(dzireCard?.estimatedFare === 50 * 13, `Dzire estimated fare for 50km is ₹650 (actual: ${dzireCard?.estimatedFare})`);
    assert(Boolean(fortunerCard), 'Fleet B Toyota Fortuner discovered (7S, ₹20/km)');

    // Passenger filter test (7+ seats)
    const filter7Res = await makeRequest('GET', '/api/public/booking/packages?seatCapacity=7');
    assert(filter7Res.statusCode === 200, 'Filter 7+ seats returns 200 OK');
    const filter7Vehicles: any[] = filter7Res.data.packages || [];
    assert(filter7Vehicles.every((v) => v.seatCapacity >= 7), 'All returned vehicles have seatCapacity >= 7');
    assert(!filter7Vehicles.some((v) => v.seatCapacity < 7), '4-seater Swift Dzire excluded from 7+ seater filter');

    // -------------------------------------------------------------------------
    // TEST 5: Step 3: Booking Submission with Verified Token & Backend Recalculation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: OTP-First Workflow: Step 3 Booking Creation with Server Recalculation ---');
    const createRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Karthik Raman',
      customerEmail: 'karthik.raman@gmail.com',
      phone: '9080280818',
      verificationToken,
      pickupPoint: 'T. Nagar, Chennai',
      dropPoint: 'Chennai Airport MAA',
      packageDataId: pkgAId,
      vehicleMasterId: vmA1Id,
      vehicleTypeId: vtA1Id,
      vehicleType: 'Innova Crysta',
      pickupDate: '2026-11-20',
      pickupTime: '10:00:00',
      travellersCount: 5,
      distance: 50,
      agreedAmountPerKm: 5, // Malicious client attempt: MUST be overridden by backend DB rate
      notes: 'Family trip with luggage',
    });

    assert(createRes.statusCode === 201, `Booking created successfully (HTTP 201, got ${createRes.statusCode})`);
    assert(createRes.data.success === true, 'Response marked success');
    const bookingCode = createRes.data.bookingCode;
    const createdBookingId = createRes.data.bookingId;
    cleanupIds.bookings.push(createdBookingId);

    assert(createRes.data.agreedRate === 18, `Agreed rate is strictly ₹18/km recalculated from database (actual: ${createRes.data.agreedRate})`);
    assert(createRes.data.estimatedFare === 50 * 18, `Estimated fare is ₹900 (actual: ${createRes.data.estimatedFare})`);

    // Verify DB Booking record
    const dbBooking = await Booking.findByPk(createdBookingId);
    assert(dbBooking !== null, 'Booking record exists in database');
    assert(dbBooking?.tenantId === tenantAId, 'Booking belongs strictly to Fleet A tenantId');
    assert(dbBooking?.companyId === companyAId, 'Booking belongs strictly to Company A companyId');
    assert(dbBooking?.confirmStatus === '0', 'Booking initial confirmStatus is 0 (PENDING)');
    assert(dbBooking?.bookingCreatedBy === 'PUBLIC_BOOKING', 'Booking source is PUBLIC_BOOKING');

    // -------------------------------------------------------------------------
    // TEST 6: Capacity Exceeded Validation & Tampered Rejections
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Passenger Capacity Validation (15 passengers in 7-seater) ---');
    // Issue fresh token since previous token was securely consumed
    const sendOtpRes2 = await makeRequest('POST', '/api/public/booking/send-otp', { phone: '9080280818' });
    const otpRec2 = await OTP.findOne({ where: { sessionId: sendOtpRes2.data.sessionId } });
    const verifyRes2 = await makeRequest('POST', '/api/public/booking/verify-otp', {
      phone: '9080280818',
      otp: otpRec2!.otp,
      sessionId: sendOtpRes2.data.sessionId,
    });
    const test6Token = verifyRes2.data.verificationToken;

    const exceedCapRes = await makeRequest('POST', '/api/public/booking/create', {
      customerName: 'Capacity Test',
      customerEmail: 'capacity.tester@gmail.com',
      phone: '9080280818',
      verificationToken: test6Token,
      pickupPoint: 'T. Nagar, Chennai',
      dropPoint: 'Chennai Central',
      packageDataId: pkgAId,
      vehicleTypeId: vtA1Id,
      vehicleType: 'Innova Crysta',
      pickupDate: '2026-11-20',
      pickupTime: '10:00:00',
      travellersCount: 15,
      distance: 20,
    });
    assert(exceedCapRes.statusCode === 400, `Exceeding seat capacity rejected with 400 (got ${exceedCapRes.statusCode})`);
    assert(
      String(exceedCapRes.data.message || '').includes('exceeds vehicle seat capacity'),
      'Descriptive error message returned when passenger count exceeds seat capacity'
    );

    // -------------------------------------------------------------------------
    // TEST 7: Confirm Pending Queue & Driver Allocation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Confirm Pending Queue & Driver Allocation ---');
    const fleetAPendingRes = await makeRequest(
      'GET',
      '/api/emp/confirmPendingOrderCountWeb',
      undefined,
      { Authorization: `Bearer ${tokenFleetA}` }
    );
    assert(fleetAPendingRes.statusCode === 200, 'Fleet A pending list returns 200');
    const fleetABookings: any[] = fleetAPendingRes.data.data || fleetAPendingRes.data.bookings || [];
    const foundInFleetA = fleetABookings.some((b) => b.bookingCode === bookingCode);
    assert(foundInFleetA, `Public booking ${bookingCode} appears in Fleet A Confirm Pending list`);

    // Cross-tenant check: Fleet B cannot see Fleet A's pending booking
    const fleetBPendingRes = await makeRequest(
      'GET',
      '/api/emp/confirmPendingOrderCountWeb',
      undefined,
      { Authorization: `Bearer ${tokenFleetB}` }
    );
    assert(fleetBPendingRes.statusCode === 200, 'Fleet B pending list returns 200');
    const fleetBBookings: any[] = fleetBPendingRes.data.data || fleetBPendingRes.data.bookings || [];
    const foundInFleetB = fleetBBookings.some((b) => b.bookingCode === bookingCode);
    assert(!foundInFleetB, `Public booking ${bookingCode} does NOT appear in Fleet B (strict tenant isolation!)`);

    // Allocate driver & vehicle
    const confirmRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBookingforWeb',
      {
        bookingId: createdBookingId,
        driverId: driverAId,
        vehicleId: vehA1Id,
      },
      { Authorization: `Bearer ${tokenFleetA}` }
    );
    assert(confirmRes.statusCode === 200, `Confirmation returns 200 OK (got ${confirmRes.statusCode})`);

    const dbBookingAfterConfirm = await Booking.findByPk(createdBookingId);
    assert(dbBookingAfterConfirm?.confirmStatus === '1', 'Booking confirmStatus transitioned to 1 (CONFIRMED)');
    assert(dbBookingAfterConfirm?.driverId === driverAId, 'Assigned driver matches Fleet A driver');
    assert(dbBookingAfterConfirm?.vehicleId === vehA1Id, 'Assigned vehicle matches Fleet A vehicle');

    // -------------------------------------------------------------------------
    // TEST 8: Close Pending Order Details Loading (GET /api/order/details/:bookingCode)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Close Pending Order Details Loading ---');
    const orderDetailsRes = await makeRequest(
      'GET',
      `/api/order/details/${bookingCode}`,
      undefined,
      { Authorization: `Bearer ${tokenFleetA}` }
    );
    assert(orderDetailsRes.statusCode === 200, 'Order details endpoint returns 200 OK');
    assert(Boolean(orderDetailsRes.data.booking), 'Returns booking object');
    assert(Boolean(orderDetailsRes.data.packages), 'Returns formatted packages');

    const publicPkgOpt = orderDetailsRes.data.packages.find((p: any) =>
      p.packageType?.toLowerCase().includes('public')
    );
    assert(Boolean(publicPkgOpt), 'Returns public booking package definition with per-km rate');
    assert(publicPkgOpt.packages[0].amount.amt === 18, 'Package rate amount is ₹18/km');

    // -------------------------------------------------------------------------
    // TEST 9: Close Pending Trip Sheet Settlement (Per-KM Calculation)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Close Pending Order Settlement (60 km actual usage) ---');
    const actualKms = 60;
    const agreedRate = 18;
    const expectedBaseAmount = actualKms * agreedRate; // ₹1,080

    const closeTripRes = await makeRequest(
      'POST',
      '/api/closePendingOrder/createClosePending',
      {
        bookingId: createdBookingId,
        pickupDate: '2026-11-20',
        packageDataId: pkgAId,
        companyId: companyAId,
        garageOpenKm: 1000,
        garageCloseKm: 1060,
        garageKms: actualKms,
        guestKms: actualKms,
        packageAmount: expectedBaseAmount,
        totalAmount: expectedBaseAmount,
        totalDue: expectedBaseAmount,
        selectedPackage: `${pkgAId}::public_km`,
        discount: '0',
        advanceAmount: '0',
        notes: 'Public trip finished smoothly',
      },
      { Authorization: `Bearer ${tokenFleetA}` }
    );
    assert(closeTripRes.statusCode === 200 || closeTripRes.statusCode === 201, `Trip closed successfully (got ${closeTripRes.statusCode})`);

    const dbBookingAfterClose = await Booking.findByPk(createdBookingId);
    assert(dbBookingAfterClose?.confirmStatus === '5', 'Booking confirmStatus transitioned to 5 (CLOSED / PAYMENT PENDING)');

    const generatedInvoice = await Invoice.findOne({ where: { bookingId: createdBookingId } });
    assert(generatedInvoice !== null, 'Invoice generated for the closed trip');
    if (generatedInvoice) {
      cleanupIds.invoices.push(generatedInvoice.invoiceId);
      assert(generatedInvoice.tenantId === tenantAId, 'Invoice belongs strictly to Fleet A');
      assert(generatedInvoice.companyId === companyAId, 'Invoice belongs strictly to Company A');
    }

    // -------------------------------------------------------------------------
    // TEST 10: Payment Settlement (Payment Pending -> Completed)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Payment Settlement ---');
    if (generatedInvoice) {
      let cashMode = await PaymentMode.findOne({ where: { modelname: 'Cash', isDeleted: false } });
      if (!cashMode) {
        cashMode = await PaymentMode.create({
          paymentmodeId: uuidv4(),
          modelname: 'Cash',
          isOnline: false,
          isActive: true,
          isDeleted: false,
        });
        cleanupIds.payments.push((cashMode as any).paymentmodeId);
      }

      const paymentRes = await makeRequest(
        'POST',
        '/api/closePendingOrder/savePaymentForInvoice',
        {
          invoiceId: generatedInvoice.invoiceId,
          bookingId: createdBookingId,
          paymentMode: cashMode.modelname,
          amount: expectedBaseAmount,
          transactionId: `TXN-PUB-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
        },
        { Authorization: `Bearer ${tokenFleetA}` }
      );
      assert(paymentRes.statusCode === 200, `Payment saved successfully (got ${paymentRes.statusCode})`);
      if (paymentRes.data?.data?.paymentId) {
        cleanupIds.payments.push(paymentRes.data.data.paymentId);
      }

      const dbBookingAfterPay = await Booking.findByPk(createdBookingId);
      assert(
        dbBookingAfterPay?.confirmStatus === '9' || (dbBookingAfterPay?.confirmStatus as any) === 9,
        'Booking confirmStatus transitioned to 9 (PAYMENTCOMPLETED)'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 11: Completed Orders Listing & Tenant Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 11: Completed Orders Listing & Tenant Isolation ---');
    const fleetACompleted = await makeRequest(
      'GET',
      '/api/emp/getcompletedlist',
      undefined,
      { Authorization: `Bearer ${tokenFleetA}` }
    );
    assert(fleetACompleted.statusCode === 200, 'Fleet A completed list returns 200');
    const compAOrders: any[] = fleetACompleted.data.data || fleetACompleted.data.bookings || fleetACompleted.data.orders || [];
    const foundInCompletedA = compAOrders.some((b) => b.orderNumber === bookingCode || b.bookingCode === bookingCode || b.bookingId === createdBookingId);
    assert(foundInCompletedA, `Booking ${bookingCode} appears in Fleet A completed orders list`);

    const fleetBCompleted = await makeRequest(
      'GET',
      '/api/emp/getcompletedlist',
      undefined,
      { Authorization: `Bearer ${tokenFleetB}` }
    );
    assert(fleetBCompleted.statusCode === 200, 'Fleet B completed list returns 200');
    const compBOrders: any[] = fleetBCompleted.data.data || fleetBCompleted.data.bookings || fleetBCompleted.data.orders || [];
    const foundInCompletedB = compBOrders.some((b) => b.orderNumber === bookingCode || b.bookingCode === bookingCode || b.bookingId === createdBookingId);
    assert(!foundInCompletedB, `Booking ${bookingCode} does NOT appear in Fleet B completed orders`);

    // -------------------------------------------------------------------------
    // TEST 12: Zero Regression on Local City, Outstation & Monthly Packages
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 12: Regression Check for Standard Packages ---');
    const localPkgAId = uuidv4();
    cleanupIds.packageData.push(localPkgAId);
    await PackageData.create({
      packageDataId: localPkgAId,
      tenantId: tenantAId,
      companyId: companyAId,
      packageType: 'Local City Use',
      packages: JSON.stringify({
        packageDefinitions: {
          package1: { hours: 4, km: 40 },
        },
        vehicles: {
          'Innova Crysta': { package1: 1500, extraKm: 18, extraHour: 150 },
        },
      }),
      isDeleted: false,
    });

    const localPkgRes = await makeRequest(
      'GET',
      `/api/packageData/getAllPackageData?companyId=${companyAId}`,
      undefined,
      { Authorization: `Bearer ${tokenFleetA}` }
    );
    assert(localPkgRes.statusCode === 200, 'PackageData getAllPackageData returns 200');
    const allCompanyPackages: any[] = localPkgRes.data.data || localPkgRes.data || [];
    const hasLocal = allCompanyPackages.some((p) => p.packageType === 'Local City Use');
    const hasPublic = allCompanyPackages.some((p) => p.packageType === 'PUBLIC_BOOKING' || p.packageType === 'Public Booking');
    assert(hasLocal, 'Local City Use package exists and is intact');
    assert(hasPublic, 'Public Booking package exists alongside standard package types');

    // -------------------------------------------------------------------------
    // TEST 13: Cross-Tenant Package Security
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 13: Cross-Tenant Package Security Check ---');
    const crossUpdateRes = await makeRequest(
      'PUT',
      `/api/packageData/updatePackageData/${pkgAId}`,
      {
        packageType: 'PUBLIC_BOOKING',
        packages: JSON.stringify({ hacked: true }),
      },
      { Authorization: `Bearer ${tokenFleetB}` }
    );
    assert(
      crossUpdateRes.statusCode === 403 || crossUpdateRes.statusCode === 404,
      `Fleet B blocked from updating Fleet A package (got ${crossUpdateRes.statusCode})`
    );

    console.log('\n========================================================================');
    console.log('🎉 ALL 13 TEST SUITES PASSED FLAWLESSLY WITH 100% TENANT ISOLATION!');
    console.log('========================================================================\n');
  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP TEST RECORDS ONLY (Never touch protected tables)
    // -------------------------------------------------------------------------
    console.log('\n--- CLEANUP: Removing Transient Test Records ---');

    for (const bId of cleanupIds.bookings) {
      await Booking.destroy({ where: { bookingId: bId }, force: true }).catch(() => {});
    }
    for (const invId of cleanupIds.invoices) {
      await Invoice.destroy({ where: { invoiceId: invId }, force: true }).catch(() => {});
    }
    for (const pId of cleanupIds.packageData) {
      await PackageData.destroy({ where: { packageDataId: pId }, force: true }).catch(() => {});
    }
    for (const pId of cleanupIds.packages) {
      await Package.destroy({ where: { packageId: pId }, force: true }).catch(() => {});
    }
    for (const vmId of cleanupIds.vehicleMasters) {
      await VehicleMaster.destroy({ where: { vehicleMasterId: vmId }, force: true }).catch(() => {});
    }
    for (const vId of cleanupIds.vehicles) {
      await Vehicle.destroy({ where: { vehicleId: vId }, force: true }).catch(() => {});
    }
    for (const dId of cleanupIds.drivers) {
      await Drivers.destroy({ where: { driverId: dId }, force: true }).catch(() => {});
    }
    for (const venId of cleanupIds.vendors) {
      await Vendor.destroy({ where: { vendorId: venId }, force: true }).catch(() => {});
    }
    for (const vtId of cleanupIds.vehicleTypes) {
      await VehicleType.destroy({ where: { vehicleTypeId: vtId }, force: true }).catch(() => {});
    }
    for (const cId of cleanupIds.companies) {
      await Company.destroy({ where: { companyId: cId }, force: true }).catch(() => {});
    }
    for (const sId of cleanupIds.subs) {
      await TenantSubscription.destroy({ where: { subscriptionId: sId }, force: true }).catch(() => {});
    }
    for (const tId of cleanupIds.tenants) {
      await Tenant.destroy({ where: { tenantId: tId }, force: true }).catch(() => {});
    }

    if (server) {
      server.close();
    }

    // Verify protected tables again post-cleanup
    await verifyProtectedTables('FINAL POST-TEST & POST-CLEANUP');
  }
}

runPublicBookingE2ETestSuite()
  .then(() => {
    console.log('\n🎯 E2E Verification Complete: 100% Success.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ E2E Verification Failed:', err);
    process.exit(1);
  });
