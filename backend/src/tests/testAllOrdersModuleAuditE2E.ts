process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import app from '../app';
import {
  connectDB,
  Tenant,
  Company,
  User,
  Booking,
  Drivers,
  Vehicle,
  VehicleMaster,
  VehicleType,
  Invoice,
  Payment,
  Employee,
} from '../models';
import config from '../config/config';

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
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(condition: any, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ ${message}`);
  }
}

async function verifyProtectedTables(label: string) {
  const sequelize = (Tenant as any).sequelize;
  for (const [table, expected] of Object.entries(EXPECTED_PROTECTED_TABLES)) {
    const [rows]: any = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
    const count = Number(rows[0].cnt);
    assert(
      count === expected,
      `[${label}] Table '${table}' count preserved: ${count} === ${expected}`
    );
  }
}

async function run() {
  console.log('================================================================');
  console.log('🚀 FLEETFLOW — ALL 6 ORDERS MODULE AUDIT & REPAIR E2E TEST');
  console.log('================================================================');

  await connectDB();
  console.log('Database connected successfully.');

  await verifyProtectedTables('START OF TEST');

  // Start HTTP test server
  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const addr = server.address() as any;
      port = addr.port;
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });

  try {
    // 1. Resolve Tenants
    const tenants = await Tenant.findAll({ limit: 2 });
    assert(tenants.length >= 1, 'At least 1 tenant exists');
    const tenantAlpha = tenants[0];
    const tenantBeta = tenants.length > 1 ? tenants[1] : null;

    const tenantAlphaToken = jwt.sign(
      {
        userId: 'admin-alpha',
        email: 'alpha-admin@fleetflow.com',
        role: 'superadmin',
        tenantId: tenantAlpha.tenantId,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const tenantBetaToken = tenantBeta
      ? jwt.sign(
          {
            userId: 'admin-beta',
            email: 'beta-admin@fleetflow.com',
            role: 'superadmin',
            tenantId: tenantBeta.tenantId,
          },
          JWT_SECRET,
          { expiresIn: '2h' }
        )
      : null;

    // -----------------------------------------------------------------
    // MODULE 1: CONFIRM PENDING (List & View)
    // -----------------------------------------------------------------
    console.log('\n--- 1. MODULE: CONFIRM PENDING ---');
    const confirmListRes = await makeRequest('GET', '/api/order/status/pending', undefined, {
      Authorization: `Bearer ${tenantAlphaToken}`,
      'X-Tenant-ID': tenantAlpha.tenantId,
    });
    assert(confirmListRes.statusCode === 200, 'GET /order/status/pending returns 200');
    assert(Array.isArray(confirmListRes.data?.data), 'Confirm pending returns array of orders');

    // Find Public Booking
    const publicBooking = await Booking.findOne({
      where: { tenantId: tenantAlpha.tenantId, bookingCreatedBy: 'PUBLIC_BOOKING' },
    });
    if (publicBooking) {
      console.log(`Found Public Booking for testing: ${publicBooking.bookingCode}`);
      // Test View by bookingId
      const viewRes = await makeRequest(
        'POST',
        '/api/order/getOrdersById',
        { bookingId: publicBooking.bookingId },
        {
          Authorization: `Bearer ${tenantAlphaToken}`,
          'X-Tenant-ID': tenantAlpha.tenantId,
        }
      );
      assert(viewRes.statusCode === 200, 'POST /order/getOrdersById returns 200 for public bookingId');
      assert(viewRes.data?.data?.bookingCode === publicBooking.bookingCode, 'Booking code matches');
      assert(viewRes.data?.data?.user !== null, 'Public booking user object synthesized');
      assert(viewRes.data?.data?.user?.username, 'Public booking customer name present');
      assert(viewRes.data?.data?.ratePerKm !== undefined, 'Agreed rate per km present on order');

      // Test View by bookingCode
      const viewCodeRes = await makeRequest(
        'POST',
        '/api/order/getOrdersById',
        { bookingId: publicBooking.bookingCode },
        {
          Authorization: `Bearer ${tenantAlphaToken}`,
          'X-Tenant-ID': tenantAlpha.tenantId,
        }
      );
      assert(viewCodeRes.statusCode === 200, 'POST /order/getOrdersById resolves bookingCode correctly');
    }

    // Find Corporate/Normal Booking
    const corpBooking = await Booking.findOne({
      where: {
        tenantId: tenantAlpha.tenantId,
        bookingCreatedBy: { [Op.ne]: 'PUBLIC_BOOKING' },
      },
    });
    if (corpBooking) {
      console.log(`Found Corporate Booking for testing: ${corpBooking.bookingCode}`);
      const corpViewRes = await makeRequest(
        'POST',
        '/api/order/getOrdersById',
        { bookingId: corpBooking.bookingId },
        {
          Authorization: `Bearer ${tenantAlphaToken}`,
          'X-Tenant-ID': tenantAlpha.tenantId,
        }
      );
      assert(corpViewRes.statusCode === 200, 'POST /order/getOrdersById returns 200 for corporate booking');
      assert(corpViewRes.data?.data?.bookingCode === corpBooking.bookingCode, 'Corporate booking code matches');
      assert(corpViewRes.data?.data?.pickupCity !== undefined, 'Pickup City field preserved');
    }

    // -----------------------------------------------------------------
    // MODULE 2: CLOSE PENDING (List & View)
    // -----------------------------------------------------------------
    console.log('\n--- 2. MODULE: CLOSE PENDING ---');
    const closeListRes = await makeRequest('GET', '/api/order/status/confirmed', undefined, {
      Authorization: `Bearer ${tenantAlphaToken}`,
      'X-Tenant-ID': tenantAlpha.tenantId,
    });
    assert(closeListRes.statusCode === 200, 'GET /order/status/confirmed returns 200');

    // Test details endpoint: /order/details/:bookingCode
    const testTarget = publicBooking || corpBooking;
    if (testTarget) {
      const detailsRes = await makeRequest(
        'GET',
        `/api/order/details/${testTarget.bookingCode}`,
        undefined,
        {
          Authorization: `Bearer ${tenantAlphaToken}`,
          'X-Tenant-ID': tenantAlpha.tenantId,
        }
      );
      assert(detailsRes.statusCode === 200, `GET /order/details/${testTarget.bookingCode} returns 200`);
      assert(detailsRes.data?.booking?.bookingCode === testTarget.bookingCode, 'Booking code matches in details');
      assert(detailsRes.data?.booking?.tenant !== undefined, 'Tenant details included with name');
      assert(detailsRes.data?.booking?.user !== null, 'User details present (synthesized or actual)');
    }

    // -----------------------------------------------------------------
    // MODULE 3: PAYMENT PENDING (List & View)
    // -----------------------------------------------------------------
    console.log('\n--- 3. MODULE: PAYMENT PENDING ---');
    const paymentPendingListRes = await makeRequest(
      'GET',
      '/api/emp/paymentPendingOrderCount',
      undefined,
      {
        Authorization: `Bearer ${tenantAlphaToken}`,
        'X-Tenant-ID': tenantAlpha.tenantId,
      }
    );
    assert(paymentPendingListRes.statusCode === 200, 'GET /emp/paymentPendingOrderCount returns 200');
    assert(Array.isArray(paymentPendingListRes.data?.data), 'Payment pending invoice list is array');

    // -----------------------------------------------------------------
    // MODULE 4: COMPLETED ORDERS (List & View)
    // -----------------------------------------------------------------
    console.log('\n--- 4. MODULE: COMPLETED ORDERS ---');
    const completedListRes = await makeRequest(
      'GET',
      '/api/emp/getcompletedlist',
      undefined,
      {
        Authorization: `Bearer ${tenantAlphaToken}`,
        'X-Tenant-ID': tenantAlpha.tenantId,
      }
    );
    assert(completedListRes.statusCode === 200, 'GET /emp/getcompletedlist returns 200');

    // -----------------------------------------------------------------
    // MODULE 5: PAYMENT LIST (List & View)
    // -----------------------------------------------------------------
    console.log('\n--- 5. MODULE: PAYMENT LIST ---');
    const existingPayment = await Payment.findOne({
      include: [
        {
          model: Invoice,
          as: 'invoices',
          where: { tenantId: tenantAlpha.tenantId },
          required: true,
        },
      ],
    });

    if (existingPayment) {
      const paymentDetailRes = await makeRequest(
        'POST',
        '/api/order/getOrderPaymentListById',
        { paymentId: existingPayment.paymentId },
        {
          Authorization: `Bearer ${tenantAlphaToken}`,
          'X-Tenant-ID': tenantAlpha.tenantId,
        }
      );
      assert(paymentDetailRes.statusCode === 200, 'POST /order/getOrderPaymentListById returns 200');
      assert(paymentDetailRes.data?.data?.paymentId === existingPayment.paymentId, 'Payment ID matches');
      assert(Array.isArray(paymentDetailRes.data?.data?.invoices), 'Invoices included with payment');
    } else {
      console.log('No historical payment found for tenant Alpha, skipped payment detail assertion.');
    }

    // -----------------------------------------------------------------
    // MODULE 6: CANCELLED ORDERS (List & View)
    // -----------------------------------------------------------------
    console.log('\n--- 6. MODULE: CANCELLED ORDERS ---');
    const cancelledListRes = await makeRequest(
      'GET',
      '/api/order/status/cancelled',
      undefined,
      {
        Authorization: `Bearer ${tenantAlphaToken}`,
        'X-Tenant-ID': tenantAlpha.tenantId,
      }
    );
    assert(cancelledListRes.statusCode === 200, 'GET /order/status/cancelled returns 200');
    assert(Array.isArray(cancelledListRes.data?.data), 'Cancelled list returns array');

    // -----------------------------------------------------------------
    // CROSS-TENANT ISOLATION SECURITY VERIFICATION
    // -----------------------------------------------------------------
    console.log('\n--- 7. CROSS-TENANT ISOLATION SECURITY ---');
    if (tenantBetaToken && tenantBeta && publicBooking) {
      const crossTenantRes = await makeRequest(
        'POST',
        '/api/order/getOrdersById',
        { bookingId: publicBooking.bookingId },
        {
          Authorization: `Bearer ${tenantBetaToken}`,
          'X-Tenant-ID': tenantBeta.tenantId,
        }
      );
      assert(
        crossTenantRes.statusCode === 403 || crossTenantRes.statusCode === 404,
        `Tenant Beta blocked from accessing Tenant Alpha booking: HTTP ${crossTenantRes.statusCode}`
      );

      const crossTenantDetailsRes = await makeRequest(
        'GET',
        `/api/order/details/${publicBooking.bookingCode}`,
        undefined,
        {
          Authorization: `Bearer ${tenantBetaToken}`,
          'X-Tenant-ID': tenantBeta.tenantId,
        }
      );
      assert(
        crossTenantDetailsRes.statusCode === 403 || crossTenantDetailsRes.statusCode === 404,
        `Tenant Beta blocked from /order/details of Tenant Alpha booking: HTTP ${crossTenantDetailsRes.statusCode}`
      );
    }

    await verifyProtectedTables('END OF TEST');

    console.log('\n================================================================');
    console.log('🎉 ALL ORDERS MODULE AUDIT & REPAIR E2E TESTS PASSED 100%!');
    console.log('================================================================\n');
  } finally {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }
}

run().catch((err) => {
  console.error('E2E TEST RUN FAILED:', err);
  process.exit(1);
});
