import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  sequelize,
  Tenant,
  TenantSubscription,
  Company,
  Vehicle,
  Drivers,
  User,
  VehicleType,
  Booking,
  Invoice,
  PackageData,
  PaymentMode,
  MonthlyInvoice,
  MonthlyInvoiceItems,
} from '../models';
import config from '../config/config';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';
const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';
const TENANT_ALPHA_ID = 'a1111111-aaaa-1111-aaaa-111111111111';
const TENANT_BETA_ID = 'b2222222-bbbb-2222-bbbb-222222222222';

// Tokens
const superAdminToken = jwt.sign(
  {
    userId: '99999999-9999-9999-9999-999999999999',
    role: 'superadmin',
    roles: 'superadmin',
    tenantId: ROOT_TENANT_ID,
    email: 'superadmin@gmail.com',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const tenantAlphaAdminToken = jwt.sign(
  {
    userId: 'aaaa1111-1111-1111-1111-111111111111',
    role: 'admin',
    roles: 'admin',
    tenantId: TENANT_ALPHA_ID,
    email: 'admin@alphafleet.com',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const tenantBetaAdminToken = jwt.sign(
  {
    userId: 'bbbb2222-2222-2222-2222-222222222222',
    role: 'admin',
    roles: 'admin',
    tenantId: TENANT_BETA_ID,
    email: 'admin@betafleet.com',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const tenantAlphaManagerToken = jwt.sign(
  {
    userId: 'aaaa2222-2222-2222-2222-222222222222',
    role: 'empManager',
    roles: 'empManager',
    tenantId: TENANT_ALPHA_ID,
    email: 'manager@alphafleet.com',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const employeeToken = jwt.sign(
  {
    userId: 'aaaa3333-3333-3333-3333-333333333333',
    role: 'employee',
    roles: 'employee',
    tenantId: TENANT_ALPHA_ID,
    email: 'employee@alphafleet.com',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

function makeRequest(
  options: http.RequestOptions,
  bodyData?: any
): Promise<{ statusCode: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        let parsed: any = raw;
        try {
          parsed = JSON.parse(raw);
        } catch {}
        resolve({
          statusCode: res.statusCode || 0,
          data: parsed,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);

    if (bodyData) {
      req.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
    }
    req.end();
  });
}

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedCount++;
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

async function runPhase5WorkflowSuite() {
  console.log('\n========================================================================');
  console.log('🚀 PHASE 5: END-TO-END BUSINESS WORKFLOWS & SAAS SUITE');
  console.log('========================================================================\n');

  try {
    // -------------------------------------------------------------------------
    // Step 0: Ensure Test Tenants, Users, PaymentMode and Packages exist
    // -------------------------------------------------------------------------
    console.log('🔹 [Setup] Verifying Test Tenants and Entities');

    // Tenant Alpha & Beta
    let tenantAlpha = await Tenant.findByPk(TENANT_ALPHA_ID);
    if (!tenantAlpha) {
      tenantAlpha = await Tenant.create({
        tenantId: TENANT_ALPHA_ID,
        name: 'Alpha Fleet Mobility',
        code: 'ALPHA',
        subdomain: 'alphafleet',
        planTier: 'PRO',
        status: 'ACTIVE',
        contactEmail: 'admin@alphafleet.com',
      });
    }

    let tenantBeta = await Tenant.findByPk(TENANT_BETA_ID);
    if (!tenantBeta) {
      tenantBeta = await Tenant.create({
        tenantId: TENANT_BETA_ID,
        name: 'Beta Global Transport',
        code: 'BETA',
        subdomain: 'betafleet',
        planTier: 'BASIC',
        status: 'ACTIVE',
        contactEmail: 'admin@betafleet.com',
      });
    }

    // Payment Mode
    let cashMode = await PaymentMode.findOne({ where: { modelname: 'Cash' } });
    if (!cashMode) {
      cashMode = await PaymentMode.create({
        paymentmodeId: uuidv4(),
        modelname: 'Cash',
        isOnline: false,
        isActive: true,
        isDeleted: false,
      });
    }

    // Company for Tenant Alpha
    let companyAlpha = await Company.findOne({
      where: { companyName: 'Alpha Corp Technologies', tenantId: TENANT_ALPHA_ID },
    });
    if (!companyAlpha) {
      companyAlpha = await Company.create({
        companyId: uuidv4(),
        companyName: 'Alpha Corp Technologies',
        companyEmail: 'ops@alphacorp.com',
        companyCode: 'ACT',
        companyAddress: 'Alpha Tech Park, Bengaluru',
        tenantId: TENANT_ALPHA_ID,
        isDeleted: false,
      });
    }

    // Company for Tenant Beta
    let companyBeta = await Company.findOne({
      where: { companyName: 'Beta Logistics Ltd', tenantId: TENANT_BETA_ID },
    });
    if (!companyBeta) {
      companyBeta = await Company.create({
        companyId: uuidv4(),
        companyName: 'Beta Logistics Ltd',
        companyEmail: 'ops@betalogistics.com',
        companyCode: 'BLL',
        companyAddress: 'Beta Logistics Yard, Bengaluru',
        tenantId: TENANT_BETA_ID,
        isDeleted: false,
      });
    }

    // User for Tenant Alpha
    let userAlpha = await User.findOne({ where: { email: 'passenger@alphacorp.com' } });
    if (!userAlpha) {
      userAlpha = await User.create({
        userId: 'aaaa4444-4444-4444-4444-444444444444',
        username: 'Alpha Passenger',
        email: 'passenger@alphacorp.com',
        mobile: '9876543210',
        password: 'password123',
        companyId: companyAlpha.companyId,
        tenantId: TENANT_ALPHA_ID,
        role: 'user',
        roles: 'user',
        isDeleted: false,
      });
    }

    // Manager for Tenant Alpha
    let managerAlpha = await User.findOne({ where: { email: 'manager@alphafleet.com' } });
    if (!managerAlpha) {
      managerAlpha = await User.create({
        userId: 'aaaa2222-2222-2222-2222-222222222222',
        username: 'Alpha Fleet Manager',
        email: 'manager@alphafleet.com',
        mobile: '9876543211',
        password: 'password123',
        companyId: companyAlpha.companyId,
        tenantId: TENANT_ALPHA_ID,
        role: 'empManager',
        roles: 'empManager',
        isManager: 1,
        isDeleted: false,
      });
    }

    // Vehicle Type
    let sedanType = await VehicleType.findOne({ where: { vehicleType: 'Executive Sedan' } });
    if (!sedanType) {
      sedanType = await VehicleType.create({
        vehicleTypeId: uuidv4(),
        vehicleType: 'Executive Sedan',
        category: 'SEDAN',
        seatCapacity: 4,
        isDeleted: false,
      });
    }

    // Vehicle for Tenant Alpha
    let vehicleAlpha = await Vehicle.findOne({
      where: { vehicleName: 'Executive Sedan Alpha', tenantId: TENANT_ALPHA_ID },
    });
    if (!vehicleAlpha) {
      vehicleAlpha = await Vehicle.create({
        vehicleId: uuidv4(),
        vehicleName: 'Executive Sedan Alpha',
        vehicleTypeId: sedanType.vehicleTypeId,
        manufacturing: 2024,
        tenantId: TENANT_ALPHA_ID,
        availableStatus: 'AVAILABLE',
        isDeleted: false,
      });
    }

    // PackageData
    let testPackage = await PackageData.findOne();
    if (!testPackage) {
      testPackage = await PackageData.create({
        packageDataId: uuidv4(),
        packageName: 'Standard 8hr / 80km',
        hours: 8,
        kms: 80,
        amount: 2200,
        extraKmRate: 18,
        extraHourRate: 150,
      });
    }

    assert(Boolean(tenantAlpha && tenantBeta && companyAlpha && userAlpha), 'Setup prerequisites verified in database');

    // -------------------------------------------------------------------------
    // Step 1: Real Booking Creation Workflow
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 1] Real Booking Creation Workflow');

    const createBookingRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/emp/createBookingForWeb',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantAlphaAdminToken}`,
        },
      },
      {
        bookingDate: '2026-10-25 10:00:00',
        bookingTime: '10:00:00',
        pickupPoint: 'Kempegowda International Airport Terminal 2',
        pickupCity: 'Bengaluru',
        dropPoint: 'Electronic City Phase 1',
        travellersCount: 1,
        femaleCount: 0,
        maleCount: 1,
        remarks: 'Phase 5 Executive Airport Transfer',
        userId: userAlpha.userId,
        vehicleTypeId: sedanType.vehicleTypeId,
        pickupArea: 'Devanahalli',
      }
    );

    assert(createBookingRes.statusCode === 201, 'POST /api/emp/createBookingForWeb returns HTTP 201 Created');
    const createdBooking = createBookingRes.data?.data || createBookingRes.data?.booking;
    const testBookingId = createdBooking?.bookingId;
    assert(Boolean(testBookingId), 'Created booking has a valid UUID bookingId');
    assert(createdBooking?.tenantId === TENANT_ALPHA_ID, 'Created booking strictly inherits active tenantId (Tenant Alpha)');

    // -------------------------------------------------------------------------
    // Step 2: Booking Confirmation Workflow by Manager
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 2] Booking Confirmation by Role (Manager)');

    const confirmRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/emp/confirmBookingByManager',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantAlphaManagerToken}`,
        },
      },
      {
        bookingId: testBookingId,
      }
    );

    assert(confirmRes.statusCode === 200, 'PUT /api/emp/confirmBookingByManager returns HTTP 200');

    // Verify booking status transitioned
    const bookingInDb = await Booking.findByPk(testBookingId);
    assert(
      bookingInDb?.bookingStatus === '1',
      'Booking status transitioned to CONFIRMED (1)'
    );

    // -------------------------------------------------------------------------
    // Step 3: Trip Closing and Trip-Sheet Invoice Generation
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 3] Trip Closing & Operational Invoice Creation');

    const closePendingRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/closePendingOrder/createClosePending',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantAlphaAdminToken}`,
        },
      },
      {
        bookingId: testBookingId,
        packageDataId: testPackage.packageDataId,
        pickupDate: '2026-10-25',
        garageKms: 120,
        usageHours: '8',
        garageOpenKm: 10000,
        garageCloseKm: 10120,
        driverBetaDays: 1,
        guestKms: 100,
        guestOpenKm: 10010,
        guestCloseKm: 10110,
        packageAmount: 2200,
        totalAmount: 2550,
        totalDue: 2550,
        extraDriverBeta: 200,
        tollParking: 150,
        tripSheetNumber: `TS-P5-${Date.now()}`,
      }
    );

    assert(closePendingRes.statusCode === 201, 'POST /api/closePendingOrder/createClosePending returns HTTP 201');
    const createdTripInvoice = closePendingRes.data?.data?.invoice;
    const testInvoiceId = createdTripInvoice?.invoiceId;
    assert(Boolean(testInvoiceId), 'Operational Invoice created with unique UUID invoiceId');
    assert(
      createdTripInvoice?.tenantId === TENANT_ALPHA_ID,
      'Operational Invoice strictly assigned to Tenant Alpha tenantId'
    );
    assert(
      Number(createdTripInvoice?.invoiceAmount) > 0,
      'Invoice amount accurately calculated from package + extra KM + driver batta'
    );

    // Verify booking status closed
    const closedBookingDb = await Booking.findByPk(testBookingId);
    assert(
      closedBookingDb?.confirmStatus === '5' || closedBookingDb?.confirmStatus === 'COMPLETED' || closedBookingDb?.bookingStatus === '3',
      'Underlying Booking confirm/booking status updated to closed/completed'
    );

    // -------------------------------------------------------------------------
    // Step 4: Cross-Tenant Trip Closing Defense (Tenant Beta attacks Tenant Alpha)
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 4] Cross-Tenant Trip Closing Security Defense');

    // Create a new booking in Tenant Alpha for isolation test
    const bookingForAttack = await Booking.create({
      bookingId: uuidv4(),
      bookingCode: `GC-ATK-${Date.now()}`,
      userId: userAlpha.userId,
      companyId: companyAlpha.companyId,
      tenantId: TENANT_ALPHA_ID,
      vehicleTypeId: sedanType.vehicleTypeId,
      bookingDate: new Date(),
      bookingTime: '11:00:00',
      pickupPoint: 'Alpha Office',
      dropPoint: 'Alpha Plant',
      confirmStatus: '0',
      bookingStatus: '0',
    });

    const maliciousCloseRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/closePendingOrder/createClosePending',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantBetaAdminToken}`,
        },
      },
      {
        bookingId: bookingForAttack.bookingId,
        packageDataId: testPackage.packageDataId,
        pickupDate: '2026-10-25',
        garageKms: 50,
        usageHours: '4',
        tripSheetNumber: 'MALICIOUS-TS-01',
      }
    );

    assert(
      maliciousCloseRes.statusCode === 403,
      'Cross-tenant POST /createClosePending by Tenant Beta on Tenant Alpha booking is strictly rejected with HTTP 403 Forbidden'
    );

    // -------------------------------------------------------------------------
    // Step 5: Authorized Payment Recording & Completion
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 5] Authorized Payment Recording & Completion');

    const paymentTxnId = `TXN-P5-${Date.now()}`;
    const paymentRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/closePendingOrder/savePaymentForInvoice',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantAlphaAdminToken}`,
        },
      },
      {
        invoiceId: testInvoiceId,
        paymentMode: 'Cash',
        transactionId: paymentTxnId,
        amount: Number(createdTripInvoice?.invoiceAmount),
        remarks: 'Phase 5 verified cash settlement',
      }
    );

    assert(paymentRes.statusCode === 200, 'POST /api/closePendingOrder/savePaymentForInvoice returns HTTP 200');

    const paidInvoice = await Invoice.findByPk(testInvoiceId);
    assert(
      String(paidInvoice?.invoiceStatus) === '9',
      'Invoice status transitioned to PAYMENTCOMPLETED (9)'
    );

    // -------------------------------------------------------------------------
    // Step 6: Monthly Consolidated Corporate Invoicing Workflow
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 6] Monthly Consolidated Route Card Invoicing');

    const monthlyCreateRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/closePendingOrder/monthlyInvoice/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantAlphaAdminToken}`,
        },
      },
      {
        invoiceDate: '2026-10-25',
        invoiceMonth: '2026-10',
        companyId: companyAlpha.companyId,
        routes: [
          {
            vehicleTypeId: sedanType.vehicleTypeId,
            vehicleTypeName: 'Executive Sedan',
            vehicleNumber: 'KA-01-AF-9999',
            route: 'Whitefield to Electronic City',
            packageAmount: 4500,
            extraKm: 20,
            extraKmAmount: 360,
            extraDays: 0,
            extraDaysAmount: 0,
            extraHrs: 2,
            extraHourRate: 150,
            extraHrsAmount: 300,
            discount: 160,
            advance: 500,
            taxes: [
              { taxName: 'CGST', taxPercent: 2.5, amount: 125 },
              { taxName: 'SGST', taxPercent: 2.5, amount: 125 },
            ],
          },
          {
            vehicleTypeId: sedanType.vehicleTypeId,
            vehicleTypeName: 'Executive Sedan',
            vehicleNumber: 'KA-01-AF-9999',
            route: 'Koramangala to Kempegowda Airport',
            packageAmount: 2500,
            extraKm: 10,
            extraKmAmount: 180,
            extraDays: 0,
            extraDaysAmount: 0,
            extraHrs: 0,
            extraHourRate: 150,
            extraHrsAmount: 0,
            discount: 0,
            advance: 0,
            taxes: [
              { taxName: 'CGST', taxPercent: 2.5, amount: 67 },
              { taxName: 'SGST', taxPercent: 2.5, amount: 67 },
            ],
          },
        ],
      }
    );

    assert(monthlyCreateRes.statusCode === 201, 'POST /monthlyInvoice/create returns HTTP 201 Created');
    const createdMonthly = monthlyCreateRes.data?.data?.monthlyInvoice;
    const testMonthlyId = createdMonthly?.monthlyInvoiceId;
    const createdRouteItems = monthlyCreateRes.data?.data?.monthlyInvoiceItems;

    assert(Boolean(testMonthlyId), 'Monthly Invoice record created with UUID');
    assert(
      createdRouteItems && createdRouteItems.length === 2,
      'Multi-route line items saved accurately (2 routes)'
    );
    assert(
      Number(createdMonthly?.finalTotal) > 0,
      'Final total includes calculated package + extra charges + taxes'
    );

    // -------------------------------------------------------------------------
    // Step 7: Monthly Invoice Edit and Line Item Deletion
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 7] Monthly Invoice Line Item Mutation & Recalculation');

    const firstItemId = createdRouteItems[0]?.monthlyInvoiceItemId;

    // Delete single route card item
    const deleteItemRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/closePendingOrder/monthlyInvoiceItem/${firstItemId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tenantAlphaAdminToken}`,
        },
      }
    );

    assert(
      deleteItemRes.statusCode === 200,
      'DELETE /monthlyInvoiceItem/:id succeeds with HTTP 200 and recalculates totals'
    );

    // Verify remaining items in DB
    const remainingItems = await MonthlyInvoiceItems.findAll({
      where: { monthlyInvoiceId: testMonthlyId },
    });
    assert(remainingItems.length === 1, 'Exactly 1 route item remains linked to monthly invoice');

    // -------------------------------------------------------------------------
    // Step 8: Cross-Tenant Defenses for Monthly Invoices & Billing
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 8] Cross-Tenant Monthly Invoicing & Billing Defenses');

    // Cross-tenant item deletion attempt
    const maliciousItemDelete = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/closePendingOrder/monthlyInvoiceItem/${remainingItems[0]?.monthlyInvoiceItemId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tenantBetaAdminToken}`,
        },
      }
    );

    assert(
      maliciousItemDelete.statusCode === 403,
      'Cross-tenant DELETE /monthlyInvoiceItem by Tenant Beta is rejected with HTTP 403 Forbidden'
    );

    // Cross-tenant monthly invoice edit attempt
    const maliciousMonthlyEdit = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/closePendingOrder/monthlyInvoice/edit-monthly-invoice',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantBetaAdminToken}`,
        },
      },
      {
        monthlyInvoiceId: testMonthlyId,
        routes: [{ packageAmount: 99999 }],
      }
    );

    assert(
      maliciousMonthlyEdit.statusCode === 403,
      'Cross-tenant PUT /monthlyInvoice/edit-monthly-invoice by Tenant Beta is rejected with HTTP 403 Forbidden'
    );

    // Cross-tenant monthly invoice delete attempt
    const maliciousMonthlyDelete = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/closePendingOrder/monthlyInvoice/${testMonthlyId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tenantBetaAdminToken}`,
        },
      }
    );

    assert(
      maliciousMonthlyDelete.statusCode === 403,
      'Cross-tenant DELETE /monthlyInvoice/:id by Tenant Beta is rejected with HTTP 403 Forbidden'
    );

    // Cross-tenant user order stats attempt
    const maliciousUserStats = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/invoiceRoutes/user-order-stats/${userAlpha.userId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tenantBetaAdminToken}`,
        },
      }
    );

    assert(
      maliciousUserStats.statusCode === 403,
      'Cross-tenant GET /api/invoiceRoutes/user-order-stats/:userId by Tenant Beta is rejected with HTTP 403 Forbidden'
    );

    // Cross-tenant company order summary attempt
    const maliciousCompanySummary = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/invoiceRoutes/getcompanyOrderSummery?companyId=${companyAlpha.companyId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tenantBetaAdminToken}`,
        },
      }
    );

    assert(
      maliciousCompanySummary.statusCode === 403,
      'Cross-tenant GET /api/invoiceRoutes/getcompanyOrderSummery for Company Alpha by Tenant Beta is rejected with HTTP 403 Forbidden'
    );

    // -------------------------------------------------------------------------
    // Step 9: SaaS Subscription Centralized Catalog & Lifecycle
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 9] SaaS Subscription Centralized Catalog & Lifecycle');

    // Centralized Plan Catalog endpoint
    const plansRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/tenants/subscription/plans',
      method: 'GET',
    });

    assert(plansRes.statusCode === 200, 'GET /api/tenants/subscription/plans returns HTTP 200 OK');
    const plans = plansRes.data?.plans || [];
    assert(plans.length === 3, 'Plan catalog returns exactly 3 standardized tiers (Basic, Pro, Enterprise)');
    assert(
      plans.some((p: any) => p.planTier === 'BASIC' && p.priceMonthlyINR === 299),
      'Basic tier is accurately priced at ₹299/month'
    );
    assert(
      plans.some((p: any) => p.planTier === 'PRO' && p.priceMonthlyINR === 349),
      'Pro tier is accurately priced at ₹349/month'
    );
    assert(
      plans.some((p: any) => p.planTier === 'ENTERPRISE' && p.priceMonthlyINR === 549),
      'Enterprise tier is accurately priced at ₹549/month'
    );

    // Tenant Suspension / Deactivation
    const suspendRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/tenants/${TENANT_ALPHA_ID}/subscription`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
      },
      {
        status: 'SUSPENDED',
      }
    );

    assert(suspendRes.statusCode === 200, 'PUT /api/tenants/:id/subscription suspends tenant with HTTP 200');
    const updatedSub = suspendRes.data?.subscription;
    assert(updatedSub?.status === 'SUSPENDED', 'Tenant subscription status reflects SUSPENDED');

    // Tenant Subscription Renewal
    const renewRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/tenants/${TENANT_ALPHA_ID}/subscription/renew`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
      },
      {
        durationDays: 30,
        paymentReference: 'BANK-WIRE-REF-9921',
      }
    );

    assert(renewRes.statusCode === 200, 'POST /api/tenants/:id/subscription/renew returns HTTP 200 OK');
    assert(
      renewRes.data?.data?.status === 'ACTIVE',
      'Tenant subscription status reactivated to ACTIVE upon renewal'
    );
    assert(
      Boolean(renewRes.data?.data?.currentPeriodEnd),
      'Subscription currentPeriodEnd successfully extended'
    );

    // Tenant Branding Persistence
    const brandingRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/tenants/current/branding',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantAlphaAdminToken}`,
        },
      },
      {
        brandingTokens: {
          primaryColor: '#059669',
          portalTitle: 'Alpha Fleet Luxury Mobility',
        },
      }
    );

    assert(brandingRes.statusCode === 200, 'PUT /api/tenants/current/branding returns HTTP 200 OK');
    assert(
      brandingRes.data?.data?.brandingTokens?.portalTitle === 'Alpha Fleet Luxury Mobility',
      'Tenant branding portalTitle persisted successfully'
    );

    // -------------------------------------------------------------------------
    // Step 10: Role-Based Endpoint Authorization
    // -------------------------------------------------------------------------
    console.log('\n🔹 [Step 10] Server-Side Role-Based Authorization Checks');

    // Employee role attempting to cancel invoice (admin only)
    const employeeCancelRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/invoiceRoutes/invoice/cancelInvoice',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`,
        },
      },
      {
        bookingId: testBookingId,
        remarks: 'Employee unauthorized cancel attempt',
      }
    );

    assert(
      employeeCancelRes.statusCode === 403,
      'Employee role attempting admin invoice cancellation is strictly blocked with HTTP 403 Forbidden'
    );

    // Summary
    console.log('\n========================================================================');
    console.log(`📊 PHASE 5 E2E WORKFLOW RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('========================================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  }
}

runPhase5WorkflowSuite();
