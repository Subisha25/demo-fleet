process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
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
  PackageData,
  Tax,
} from '../models';
import config from '../config/config';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { ORDER } from '../utils/costants';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';

const EXPECTED_PROTECTED_TABLES: Record<string, number> = {
  employee: 2,
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

async function runOrderLifecycleE2ETests() {
  console.log('\n========================================================================');
  console.log('🚀 FLEETFLOW: ORDER LIFECYCLE & CLOSE PENDING E2E VERIFICATION SUITE');
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
    // 1. SETUP TENANTS & USERS
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Setting up Test Fleet Tenants, Subscriptions, and Entities ---');

    const tenantAlphaId = uuidv4();
    const tenantASlug = `alpha-fleet-${Date.now()}`;
    cleanupIds.tenants.push(tenantAlphaId);
    await Tenant.create({
      tenantId: tenantAlphaId,
      name: 'Alpha Fleet Logistics',
      displayName: 'Alpha Fleet',
      slug: tenantASlug,
      subdomain: `alpha-${Date.now()}`,
      code: `APX${Math.floor(Math.random() * 900 + 100)}`,
      status: 'active',
      planTier: 'enterprise',
      contactEmail: 'admin@alphafleet-e2e.com',
      contactPhone: '9080280818',
    });

    const subAlpha = await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantAlphaId,
      planTier: 'enterprise',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000),
      driverQuota: 50,
      vehicleQuota: 50,
      monthlyBookingLimit: 1000,
    });
    cleanupIds.subs.push(subAlpha.subscriptionId);

    const alphaAdminToken = jwt.sign(
      {
        adminId: uuidv4(),
        role: 'SuperAdmin',
        tenantId: tenantAlphaId,
        email: 'admin@alphafleet-e2e.com',
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Foreign Tenant Beta
    const tenantBetaId = uuidv4();
    const tenantBSlug = `beta-fleet-${Date.now()}`;
    cleanupIds.tenants.push(tenantBetaId);
    await Tenant.create({
      tenantId: tenantBetaId,
      name: 'Beta Fleet Transfers',
      displayName: 'Beta Transit',
      slug: tenantBSlug,
      subdomain: `beta-${Date.now()}`,
      code: `TTN${Math.floor(Math.random() * 900 + 100)}`,
      status: 'active',
      planTier: 'enterprise',
      contactEmail: 'admin@betafleet-e2e.com',
      contactPhone: '9080280818',
    });

    const subBeta = await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: tenantBetaId,
      planTier: 'enterprise',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000),
      driverQuota: 50,
      vehicleQuota: 50,
      monthlyBookingLimit: 1000,
    });
    cleanupIds.subs.push(subBeta.subscriptionId);

    const betaAdminToken = jwt.sign(
      {
        adminId: uuidv4(),
        role: 'SuperAdmin',
        tenantId: tenantBetaId,
        email: 'admin@betafleet-e2e.com',
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Company for Tenant Alpha
    const companyAlpha = await Company.create({
      companyId: uuidv4(),
      companyName: 'Apex Innovations Corp',
      companyCode: 'APEX',
      companyAddress: '100 Alpha Towers, Chennai',
      companyMobile: '9080280818',
      companyEmail: 'contact@apexinno-e2e.com',
      tenantId: tenantAlphaId,
      needEmail: true,
      allowTax: 'yes',
      status: 1,
    });
    cleanupIds.companies.push(companyAlpha.companyId);

    // User for Company Alpha
    const userPasswordHash = await bcrypt.hash('SecurePassword@123', 10);
    const userAlpha = await User.create({
      userId: uuidv4(),
      username: 'apex_traveler',
      email: 'traveler@apexinno-e2e.com',
      password: userPasswordHash,
      mobile: '9080280818',
      companyId: companyAlpha.companyId,
      tenantId: tenantAlphaId,
      status: 1,
    });
    cleanupIds.users.push(userAlpha.userId);

    // Driver for Tenant Alpha
    const driverAlpha = await Drivers.create({
      driverId: uuidv4(),
      driverName: 'Rajesh Kumar',
      driverEmail: 'rajesh.driver@alphafleet-e2e.com',
      phno: '9080280818',
      tenantId: tenantAlphaId,
    });
    cleanupIds.drivers.push(driverAlpha.driverId);

    // VehicleType for Tenant Alpha
    const vehicleTypeAlpha = await VehicleType.create({
      vehicleTypeId: uuidv4(),
      vehicleType: 'Executive Sedan',
      AdvanceBookingHours: '2',
      tenantId: tenantAlphaId,
    });
    cleanupIds.vehicleTypes.push(vehicleTypeAlpha.vehicleTypeId);

    // Vehicle for Tenant Alpha
    const vehicleAlpha = await Vehicle.create({
      vehicleId: uuidv4(),
      vehicleName: 'Toyota Camry Hybrid',
      vehicleTypeId: vehicleTypeAlpha.vehicleTypeId,
      manufacturing: '2024',
      availableStatus: 'AVAILABLE',
      isDeleted: false,
      tenantId: tenantAlphaId,
    });
    cleanupIds.vehicles.push(vehicleAlpha.vehicleId);

    // Vendor for Tenant Alpha
    const vendorAlpha = await Vendor.create({
      vendorId: uuidv4(),
      vendorName: 'Apex Fleet Vendor',
      phno: '9080280818',
      tenantId: tenantAlphaId,
      companyId: companyAlpha.companyId,
    });
    cleanupIds.vendors.push(vendorAlpha.vendorId);

    // VehicleMaster for Tenant Alpha
    const vehicleMasterAlpha = await VehicleMaster.create({
      vehicleMasterId: uuidv4(),
      vehicleNumber: 'TN-09-BK-9999',
      vehicleModelName: 'Toyota Camry',
      vehicleTypeId: vehicleTypeAlpha.vehicleTypeId,
      vehicleType: 'Executive Sedan',
      vehicleId: vehicleAlpha.vehicleId,
      vendorId: vendorAlpha.vendorId,
      vendorName: vendorAlpha.vendorName,
      tenantId: tenantAlphaId,
    });
    cleanupIds.vehicleMasters.push(vehicleMasterAlpha.vehicleMasterId);

    // PackageData for Company Alpha
    const pkgData = await PackageData.create({
      packageDataId: uuidv4(),
      companyId: companyAlpha.companyId,
      packageType: 'Local City',
      packages: JSON.stringify({
        vehicles: {
          'executivesedan': {
            package1: 1500,
            package2: 2500,
            extraKm: 15,
            extraHour: 150,
          },
        },
        packageDefinitions: {
          package1: { hours: 4, km: 40 },
          package2: { hours: 8, km: 80 },
        },
      }),
      isDeleted: false,
      tenantId: tenantAlphaId,
    });
    cleanupIds.packageData.push(pkgData.packageDataId);

    // Tax for Tenant Alpha
    const taxGst = await Tax.create({
      taxId: uuidv4(),
      taxName: 'GST',
      taxPercent: 5,
      isActive: true,
      tenantId: tenantAlphaId,
    });
    cleanupIds.taxes.push(taxGst.taxId);

    console.log('  ✅ Fleet tenant, subscription, company, user, driver, vehicle & master created successfully');

    // -------------------------------------------------------------------------
    // PHASE A: BOOKING CREATION (CONFIRM PENDING: confirmStatus = 0)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Phase A: Create Booking for Web (Confirm Pending) ---');

    const createBookingRes = await makeRequest(
      'POST',
      '/api/emp/createBookingForWeb',
      {
        userId: userAlpha.userId,
        pickupPoint: 'T Nagar, Chennai',
        dropPoint: 'Chennai International Airport',
        bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        bookingTime: '10:00:00',
        vehicleTypeId: vehicleTypeAlpha.vehicleTypeId,
        travellersCount: 1,
        purpose: 'Business Conference',
        pickupCity: 'Chennai',
      },
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(createBookingRes.statusCode === 201 || createBookingRes.statusCode === 200, 'POST /api/emp/createBookingForWeb succeeds with HTTP 200/201');
    const createdBooking = createBookingRes.data?.booking || createBookingRes.data?.data;
    assert(!!createdBooking?.bookingId, 'Booking was created with valid bookingId');
    assert(!!createdBooking?.bookingCode, `Booking code generated: ${createdBooking?.bookingCode}`);
    assert(Number(createdBooking?.confirmStatus) === 0, 'Booking initial confirmStatus is 0 (Confirm Pending)');
    cleanupIds.bookings.push(createdBooking.bookingId);

    // -------------------------------------------------------------------------
    // PHASE B: CONFIRM PENDING ORDERS LISTING
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Phase B: Confirm Pending Orders Listing ---');

    const confirmPendingListRes = await makeRequest(
      'GET',
      '/api/emp/confirmPendingOrderCountWeb',
      undefined,
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(confirmPendingListRes.statusCode === 200, 'GET /api/emp/confirmPendingOrderCountWeb returns HTTP 200');
    const pendingOrders = confirmPendingListRes.data?.data || [];
    const matchedPending = pendingOrders.find((b: any) => b.bookingId === createdBooking.bookingId);
    assert(!!matchedPending, 'Created booking is listed in confirmPendingOrders');

    // -------------------------------------------------------------------------
    // PHASE C: DRIVER & VEHICLE ALLOCATION (CONFIRMING BOOKING)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Phase C: Driver & Vehicle Allocation Confirmation ---');

    const confirmBookingRes = await makeRequest(
      'PATCH',
      '/api/vendor/confirmBookingforWeb',
      {
        bookingId: createdBooking.bookingId,
        driverId: driverAlpha.driverId,
        vehicleId: vehicleAlpha.vehicleId,
        vehicleMasterId: vehicleMasterAlpha.vehicleMasterId,
      },
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(confirmBookingRes.statusCode === 200, 'PATCH /api/vendor/confirmBookingforWeb returns HTTP 200');
    assert(confirmBookingRes.data?.success === true, 'Booking confirmation response indicates success: true');

    const reloadedBookingAfterConfirm = await Booking.findByPk(createdBooking.bookingId);
    assert(Number(reloadedBookingAfterConfirm?.confirmStatus) === 1, 'Booking confirmStatus transitioned to 1 (CONFIRMED / Close Pending)');
    assert(reloadedBookingAfterConfirm?.driverId === driverAlpha.driverId, 'Driver successfully assigned');
    assert(reloadedBookingAfterConfirm?.vehicleId === vehicleAlpha.vehicleId, 'Vehicle successfully assigned');

    // -------------------------------------------------------------------------
    // PHASE D: CONFIRMED ORDERS / CLOSE PENDING LISTING
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Phase D: Confirmed Orders / Close Pending Listing ---');

    const confirmedListRes = await makeRequest(
      'GET',
      '/api/order/status/confirmed',
      undefined,
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(confirmedListRes.statusCode === 200, 'GET /api/order/status/confirmed returns HTTP 200');
    const confirmedOrders = confirmedListRes.data?.data || [];
    const matchedConfirmed = confirmedOrders.find((b: any) => b.bookingId === createdBooking.bookingId);
    assert(!!matchedConfirmed, 'Confirmed booking appears in /order/status/confirmed (Close Pending list)');

    // -------------------------------------------------------------------------
    // PHASE E: CLOSE PENDING ORDER DETAILS FETCH (/api/order/details/:bookingCode)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Phase E: Order Details Fetch & Authentication / Multi-Tenant Isolation ---');

    // 1. Authenticated fetch with bookingCode
    const detailsByCodeRes = await makeRequest(
      'GET',
      `/api/order/details/${createdBooking.bookingCode}`,
      undefined,
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(detailsByCodeRes.statusCode === 200, 'GET /api/order/details/:bookingCode with auth token returns HTTP 200');
    assert(detailsByCodeRes.data?.booking?.bookingCode === createdBooking.bookingCode, 'Returned booking code matches');
    assert(detailsByCodeRes.data?.booking?.user?.username === 'apex_traveler', 'Returned user information matches');
    assert(detailsByCodeRes.data?.booking?.user?.company?.companyName === 'Apex Innovations Corp', 'Returned company information matches');
    assert(detailsByCodeRes.data?.vehicle?.vehicleName === 'Toyota Camry Hybrid', 'Returned vehicle details present');
    assert(detailsByCodeRes.data?.vehicleType?.vehicleType === 'Executive Sedan', 'Returned vehicle type details present');
    assert(Array.isArray(detailsByCodeRes.data?.packages) && detailsByCodeRes.data.packages.length > 0, 'Returned package options present');

    // 2. Fetch using UUID bookingId (route resiliency)
    const detailsByIdRes = await makeRequest(
      'GET',
      `/api/order/details/${createdBooking.bookingId}`,
      undefined,
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );
    assert(detailsByIdRes.statusCode === 200, 'GET /api/order/details/:bookingId (UUID) returns HTTP 200');

    // 3. Unauthenticated request must return 401 (demonstrating why raw axios failed)
    const unauthDetailsRes = await makeRequest(
      'GET',
      `/api/order/details/${createdBooking.bookingCode}`
    );
    assert(unauthDetailsRes.statusCode === 401, 'Unauthenticated GET /api/order/details/:bookingCode is properly rejected with HTTP 401');

    // 4. Cross-tenant request must return 403 Forbidden
    const crossTenantDetailsRes = await makeRequest(
      'GET',
      `/api/order/details/${createdBooking.bookingCode}`,
      undefined,
      {
        Authorization: `Bearer ${betaAdminToken}`,
        'X-Tenant-ID': tenantBetaId,
      }
    );
    assert(crossTenantDetailsRes.statusCode === 403, 'Cross-tenant GET /api/order/details/:bookingCode is rejected with HTTP 403 Forbidden');

    // -------------------------------------------------------------------------
    // PHASE F: CLOSE PENDING ORDER EXECUTION (/api/closePendingOrder/createClosePending)
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Phase F: Close Pending Order Execution ---');

    const closePayload = {
      tripSheetNumber: 'TRIP-E2E-1001',
      pickupDate: createdBooking.bookingDate,
      bookingId: createdBooking.bookingId,
      packageDataId: pkgData.packageDataId,
      selectedPackageData: {
        packageDataId: pkgData.packageDataId,
        optionId: `${pkgData.packageDataId}::package1`,
        hours: 4,
        kms: 40,
        amount: 1500,
        extraKmRate: 15,
        extraHourRate: 150,
      },
      companyId: companyAlpha.companyId,
      garageKms: 45,
      garageOpenKm: 1000,
      garageCloseKm: 1045,
      garageOpenDateTime: '2026-11-12T09:30:00.000Z',
      garageCloseDateTime: '2026-11-12T13:30:00.000Z',
      guestKms: 40,
      guestOpenKm: 1005,
      guestCloseKm: 1045,
      guestOpenDateTime: '2026-11-12T10:00:00.000Z',
      guestCloseDateTime: '2026-11-12T13:30:00.000Z',
      usageHours: 4,
      packageAmount: 1500,
      additionalKms: 0,
      additionalHours: 0,
      discountAmount: 0,
      advanceAmount: 0,
      extraCharges: 0,
      totalAmount: 1500,
      total: 1575, // 1500 + 5% GST
      totalDue: 1575,
      cgstApplicable: false,
      igstApplicable: false,
      sgstApplicable: true,
      totalTaxAmount: 75,
    };

    const closeRes = await makeRequest(
      'POST',
      '/api/closePendingOrder/createClosePending',
      closePayload,
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(closeRes.statusCode === 201 || closeRes.statusCode === 200, 'POST /api/closePendingOrder/createClosePending returns HTTP 201/200');

    // Verify database state after closing order
    const reloadedBookingAfterClose = await Booking.findByPk(createdBooking.bookingId);
    assert(
      Number(reloadedBookingAfterClose?.confirmStatus) === ORDER.STATUS.CLOSED,
      `Booking confirmStatus is now ${ORDER.STATUS.CLOSED} (CLOSED)`
    );

    const createdInvoice = await Invoice.findOne({
      where: { bookingId: createdBooking.bookingId },
    });
    assert(!!createdInvoice, 'Invoice record was successfully created');
    assert(
      Number(createdInvoice?.invoiceStatus) === ORDER.STATUS.PENDING,
      `Invoice initial status is ${ORDER.STATUS.PENDING} (PENDING)`
    );
    cleanupIds.invoices.push(createdInvoice!.invoiceId);
    if (createdInvoice?.closePendingId) {
      cleanupIds.closePendings.push(createdInvoice.closePendingId);
    }

    // -------------------------------------------------------------------------
    // PHASE G: PAYMENT PENDING LISTING
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Phase G: Payment Pending Listing ---');

    const paymentPendingRes = await makeRequest(
      'GET',
      '/api/emp/paymentPendingOrderCount',
      undefined,
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(paymentPendingRes.statusCode === 200, 'GET /api/emp/paymentPendingOrderCount returns HTTP 200');
    const paymentPendingData = paymentPendingRes.data?.data || [];
    const matchedPendingInvoice = paymentPendingData.find(
      (inv: any) => inv.booking?.bookingId === createdBooking.bookingId || inv.invoiceId === createdInvoice?.invoiceId
    );
    assert(!!matchedPendingInvoice, 'Closed order invoice is present in /emp/paymentPendingOrderCount list');

    // -------------------------------------------------------------------------
    // PHASE H: SAVE PAYMENT FOR INVOICE
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Phase H: Save Payment for Invoice ---');

    const paymentRes = await makeRequest(
      'POST',
      '/api/closePendingOrder/savePaymentForInvoice',
      {
        invoiceId: createdInvoice!.invoiceId,
        paymentMode: 'COD',
        transactionId: `TXN-E2E-${Date.now()}`,
        amount: 1575,
        remarks: 'Cash collected by driver',
      },
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(paymentRes.statusCode === 200, 'POST /api/closePendingOrder/savePaymentForInvoice returns HTTP 200');
    const paymentId = paymentRes.data?.data?.paymentId;
    assert(!!paymentId, 'Payment record was created with valid paymentId');
    cleanupIds.payments.push(paymentId);

    const reloadedInvoiceAfterPay = await Invoice.findByPk(createdInvoice!.invoiceId);
    assert(
      Number(reloadedInvoiceAfterPay?.invoiceStatus) === ORDER.STATUS.PAYMENTCOMPLETED,
      `Invoice status updated to ${ORDER.STATUS.PAYMENTCOMPLETED} (PAYMENTCOMPLETED)`
    );

    const reloadedBookingAfterPay = await Booking.findByPk(createdBooking.bookingId);
    assert(
      Number(reloadedBookingAfterPay?.confirmStatus) === ORDER.STATUS.PAYMENTCOMPLETED,
      `Booking confirmStatus updated to ${ORDER.STATUS.PAYMENTCOMPLETED} (PAYMENTCOMPLETED)`
    );

    // -------------------------------------------------------------------------
    // PHASE I: COMPLETED ORDERS LISTING & ISOLATION
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Phase I: Completed Orders Listing & Cross-Tenant Scoping ---');

    const completedListAlphaRes = await makeRequest(
      'GET',
      '/api/emp/getcompletedlist',
      undefined,
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(completedListAlphaRes.statusCode === 200, 'GET /api/emp/getcompletedlist returns HTTP 200 for Tenant Alpha');
    const completedOrdersAlpha = completedListAlphaRes.data?.data || [];
    const matchedCompleted = completedOrdersAlpha.find((o: any) => o.bookingId === createdBooking.bookingId);
    assert(!!matchedCompleted, 'Paid booking is present in completed list for Tenant Alpha');

    // Cross-tenant verification: Tenant Beta must NOT see Tenant Alpha's completed order
    const completedListBetaRes = await makeRequest(
      'GET',
      '/api/emp/getcompletedlist',
      undefined,
      {
        Authorization: `Bearer ${betaAdminToken}`,
        'X-Tenant-ID': tenantBetaId,
      }
    );
    assert(completedListBetaRes.statusCode === 200, 'GET /api/emp/getcompletedlist returns HTTP 200 for Tenant Beta');
    const completedOrdersBeta = completedListBetaRes.data?.data || [];
    const leakedToBeta = completedOrdersBeta.find((o: any) => o.bookingId === createdBooking.bookingId);
    assert(!leakedToBeta, 'Tenant Beta cannot see Tenant Alpha completed order (Strict Multi-Tenant Isolation)');

    // Verify /order/getOrderPaymentListById
    const paymentDetailRes = await makeRequest(
      'POST',
      '/api/order/getOrderPaymentListById',
      { paymentId },
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );
    assert(paymentDetailRes.statusCode === 200, 'POST /api/order/getOrderPaymentListById returns HTTP 200');

    // -------------------------------------------------------------------------
    // PHASE J: CANCELLED BOOKING WORKFLOW
    // -------------------------------------------------------------------------
    console.log('\n--- 11. Phase J: Cancelled Booking Workflow ---');

    const createBooking2Res = await makeRequest(
      'POST',
      '/api/emp/createBookingForWeb',
      {
        userId: userAlpha.userId,
        pickupPoint: 'Anna Nagar, Chennai',
        dropPoint: 'Chennai Central',
        bookingDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        bookingTime: '15:00:00',
        vehicleTypeId: vehicleTypeAlpha.vehicleTypeId,
        travellersCount: 1,
        purpose: 'Cancellation Test',
        pickupCity: 'Chennai',
      },
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    const booking2 = createBooking2Res.data?.booking || createBooking2Res.data?.data;
    cleanupIds.bookings.push(booking2.bookingId);

    const cancelRes = await makeRequest(
      'PUT',
      '/api/order/cancelBooking',
      {
        bookingId: booking2.bookingId,
        cancelReason: 'Customer travel cancelled',
      },
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(cancelRes.statusCode === 200, 'PUT /api/order/cancelBooking returns HTTP 200');

    const cancelledListRes = await makeRequest(
      'GET',
      '/api/order/status/cancelled',
      undefined,
      {
        Authorization: `Bearer ${alphaAdminToken}`,
        'X-Tenant-ID': tenantAlphaId,
      }
    );

    assert(cancelledListRes.statusCode === 200, 'GET /api/order/status/cancelled returns HTTP 200');
    const cancelledOrders = cancelledListRes.data?.data || [];
    const matchedCancelled = cancelledOrders.find((b: any) => b.bookingId === booking2.bookingId);
    assert(!!matchedCancelled, 'Cancelled booking is listed in /order/status/cancelled');
    assert(Number(matchedCancelled.confirmStatus) === ORDER.STATUS.CANCELLED, 'Cancelled booking confirmStatus is 6 (CANCELLED)');

    console.log('\n✨ ALL ORDER LIFECYCLE PHASES PASSED 100% ✨');

  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP EPHEMERAL TEST DATA
    // -------------------------------------------------------------------------
    console.log('\n--- Cleaning up ephemeral test records ---');

    for (const bId of cleanupIds.bookings) {
      await Invoice.destroy({ where: { bookingId: bId } }).catch(() => {});
      await ClosePending.destroy({ where: { bookingId: bId } }).catch(() => {});
      await Booking.destroy({ where: { bookingId: bId } }).catch(() => {});
    }

    for (const pId of cleanupIds.payments) {
      await Payment.destroy({ where: { paymentId: pId } }).catch(() => {});
    }

    for (const vmId of cleanupIds.vehicleMasters) {
      await VehicleMaster.destroy({ where: { vehicleMasterId: vmId } }).catch(() => {});
    }

    for (const vendId of cleanupIds.vendors) {
      await Vendor.destroy({ where: { vendorId: vendId } }).catch(() => {});
    }

    for (const vId of cleanupIds.vehicles) {
      await Vehicle.destroy({ where: { vehicleId: vId } }).catch(() => {});
    }

    for (const vtId of cleanupIds.vehicleTypes) {
      await VehicleType.destroy({ where: { vehicleTypeId: vtId } }).catch(() => {});
    }

    for (const dId of cleanupIds.drivers) {
      await Drivers.destroy({ where: { driverId: dId } }).catch(() => {});
    }

    for (const pkgId of cleanupIds.packageData) {
      await PackageData.destroy({ where: { packageDataId: pkgId } }).catch(() => {});
    }

    for (const tId of cleanupIds.taxes) {
      await Tax.destroy({ where: { taxId: tId } }).catch(() => {});
    }

    for (const uId of cleanupIds.users) {
      await User.destroy({ where: { userId: uId } }).catch(() => {});
    }

    for (const cId of cleanupIds.companies) {
      await Company.destroy({ where: { companyId: cId } }).catch(() => {});
    }

    for (const sId of cleanupIds.subs) {
      await TenantSubscription.destroy({ where: { subscriptionId: sId } }).catch(() => {});
    }

    for (const tId of cleanupIds.tenants) {
      await Tenant.destroy({ where: { tenantId: tId } }).catch(() => {});
    }

    console.log('  ✅ Ephemeral test records removed cleanly');

    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      console.log('  ✅ Test server stopped');
    }

    // Final Protected Tables Check
    await verifyProtectedTables('FINAL POST-TEST VERIFICATION');
  }
}

runOrderLifecycleE2ETests()
  .then(() => {
    console.log('\n========================================================================');
    console.log('🏆 E2E TEST RUN COMPLETED SUCCESSFULLY!');
    console.log('========================================================================\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ E2E TEST RUN FAILED:', err);
    process.exit(1);
  });

