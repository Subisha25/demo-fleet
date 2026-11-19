process.env.NODE_ENV = 'test';
process.env.EMAIL_MOCK_MODE = 'true';
process.env.SMS_MOCK_MODE = 'true';

import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from '../app';
import {
  sequelize,
  connectDB,
  Booking,
  Invoice,
  ClosePending,
  Payment,
  Company,
  Tenant,
  User,
  Employee,
  EmailConfiguration,
  Configuration,
  SaaSPlan,
  ShortLink,
  SmsTemplate
} from '../models';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function testAssert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

let server: http.Server;
let port: number;

function makeRequest(
  method: string,
  requestPath: string,
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
        path: requestPath,
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

async function runTests() {
  console.log('================================================================');
  console.log('FLEETFLOW E2E: FINANCIAL CONSISTENCY & CORPORATE POLICIES REMOVAL');
  console.log('================================================================\n');

  await connectDB();

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      port = (server.address() as any).port;
      console.log(`Ephemeral test server running on port ${port}`);
      resolve();
    });
  });

  const JWT_SECRET = config.security?.jwtSecret || process.env.JWT_SECRET || 'secret';

  // Create mock Fleet Admin and Platform Admin tokens
  const fleetAdminToken = jwt.sign(
    { userId: 'test-admin', role: 'admin', tenantId: '40fe36dc-1dbb-4e9e-9ad0-3e2a8a3a9162' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const superAdminToken = jwt.sign(
    { userId: 'superadmin', role: 'superadmin', isPlatformSuperAdmin: true, tenantId: 'e7b8a1c0-0000-0000-0000-000000000001' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // --------------------------------------------------------------------------
  // SUITE 1: RECONCILED FINANCIAL VALUES FOR BOOKING 202611170001
  // --------------------------------------------------------------------------
  console.log('\n🔹 [Suite 1] Database & Reconciliation Audit for Booking 202611170001');

  const [bookingRows]: any = await sequelize.query(
    "SELECT * FROM booking WHERE bookingCode = '202611170001'"
  );
  testAssert(bookingRows.length > 0, 'Booking 202611170001 exists in database');
  const booking = bookingRows[0];

  const [invRows]: any = await sequelize.query(
    `SELECT * FROM invoice WHERE bookingId = '${booking.bookingId}'`
  );
  testAssert(invRows.length > 0, 'Invoice for 202611170001 exists');
  const invoice = invRows[0];

  const [cpRows]: any = await sequelize.query(
    `SELECT * FROM closependings WHERE closependingId = '${invoice.closePendingId}'`
  );
  testAssert(cpRows.length > 0, 'ClosePending for 202611170001 exists');
  const cp = cpRows[0];

  // Mathematical verification
  const pkgAmt = Number(cp.packageAmount);
  const totalAmt = Number(cp.totalAmount);
  const total = Number(cp.total);
  const advance = Number(cp.advanceAmount);
  const discount = Number(cp.discountAmount);
  const tax = Number(cp.totalTaxAmount);
  const totalDue = Number(cp.totalDue);
  const invAmt = Number(invoice.invoiceAmount);

  console.log(`     Booking 202611170001 Details:`);
  console.log(`     - Garage KMs: ${cp.garageKms} KM`);
  console.log(`     - Package Amount: ₹${pkgAmt}`);
  console.log(`     - Total Amount (net): ₹${totalAmt}`);
  console.log(`     - Total Tax: ₹${tax}`);
  console.log(`     - Discount: ₹${discount}`);
  console.log(`     - Total (after tax): ₹${total}`);
  console.log(`     - Advance: ₹${advance}`);
  console.log(`     - Total Due: ₹${totalDue}`);
  console.log(`     - Invoice Amount: ₹${invAmt}`);

  testAssert(pkgAmt === 20000, 'Package Amount is ₹20,000.00 (not ₹0.00)');
  testAssert(totalAmt === 20000, 'Net base Total Amount is ₹20,000.00');
  testAssert(total === 20500, 'Gross Final Total is ₹20,500.00 (20000 + 500 tax)');
  testAssert(advance === 10, 'Advance is ₹10.00');
  testAssert(discount === 10, 'Discount is ₹10.00');
  testAssert(tax === 500, 'Tax is ₹500.00');
  testAssert(totalDue === 20490, 'Total Due is ₹20,490.00 (20500 - 10 advance)');
  testAssert(invAmt === 20490, 'Invoice Amount equals Total Due (₹20,490.00)');
  testAssert(total - advance === totalDue, 'Formula Holds: Total - Advance == Total Due');

  // --------------------------------------------------------------------------
  // SUITE 2: API RESPONSES (PAYMENT PENDING & GET ORDER BY ID)
  // --------------------------------------------------------------------------
  console.log('\n🔹 [Suite 2] API Level Financial Consistency');

  // 1. /emp/paymentPendingOrderCount
  const pendingRes = await makeRequest(
    'GET',
    '/api/emp/paymentPendingOrderCount',
    undefined,
    {
      Authorization: `Bearer ${fleetAdminToken}`,
      'x-tenant-id': '40fe36dc-1dbb-4e9e-9ad0-3e2a8a3a9162',
    }
  );

  testAssert(pendingRes.statusCode === 200, 'GET /emp/paymentPendingOrderCount returns 200');
  const pendingOrders = pendingRes.data?.data || [];
  const foundOrder = pendingOrders.find((o: any) => o.booking?.bookingCode === '202611170001');
  testAssert(!!foundOrder, 'Booking 202611170001 present in payment pending orders');

  if (foundOrder) {
    const cpData = foundOrder.closePending;
    testAssert(Number(cpData?.packageAmount) === 20000, 'API returns closePending.packageAmount = ₹20,000');
    testAssert(Number(cpData?.totalDue) === 20490, 'API returns closePending.totalDue = ₹20,490');
    testAssert(Number(foundOrder.invoiceAmount) === 20490, 'API returns invoiceAmount = ₹20,490');
  }

  // 2. /order/getOrdersById
  const viewRes = await makeRequest(
    'POST',
    '/api/order/getOrdersById',
    { bookingId: booking.bookingId },
    {
      Authorization: `Bearer ${fleetAdminToken}`,
      'x-tenant-id': '40fe36dc-1dbb-4e9e-9ad0-3e2a8a3a9162',
    }
  );

  testAssert(viewRes.statusCode === 200, 'POST /order/getOrdersById returns 200');
  const viewData = viewRes.data?.data;
  testAssert(viewData?.bookingCode === '202611170001', 'getOrdersById returns correct booking');
  console.log('viewData.invoice:', viewData?.invoice);
  const firstInv = Array.isArray(viewData?.invoice) ? viewData?.invoice[0] : viewData?.invoice;
  testAssert(firstInv?.closePending != null, 'getOrdersById includes invoice and closePending');
  testAssert(Number(firstInv?.closePending?.packageAmount) === 20000, 'getOrdersById closePending.packageAmount is ₹20,000');
  testAssert(Number(firstInv?.closePending?.totalDue) === 20490, 'getOrdersById closePending.totalDue is ₹20,490');
  testAssert(Number(firstInv?.invoiceAmount) === 20490, 'getOrdersById invoice.invoiceAmount is ₹20,490');

  // --------------------------------------------------------------------------
  // SUITE 3: ALL BOOKING TYPES RECONCILIATION
  // --------------------------------------------------------------------------
  console.log('\n🔹 [Suite 3] Reconciliation Across Multiple Booking Types');

  // Booking 2: Public Booking 202611130012 (300 KM * 300 = 90,000)
  const [b2Rows]: any = await sequelize.query(
    "SELECT b.bookingCode, cp.packageAmount, cp.total, cp.totalDue, cp.advanceAmount, i.invoiceAmount FROM booking b JOIN closependings cp ON cp.closependingId = '48d0b88d-ccbf-42a4-804b-22ea092f11c7' JOIN invoice i ON i.closePendingId = cp.closependingId WHERE b.bookingCode = '202611130012'"
  );
  if (b2Rows.length > 0) {
    const b2 = b2Rows[0];
    testAssert(Number(b2.packageAmount) === 90000, 'Public Booking 202611130012 packageAmount is ₹90,000.00');
    testAssert(Number(b2.total) === 92250, 'Public Booking 202611130012 total is ₹92,250.00');
    testAssert(Number(b2.totalDue) === 92230, 'Public Booking 202611130012 totalDue is ₹92,230.00 (92250 - 20 advance)');
    testAssert(Number(b2.invoiceAmount) === 92230, 'Public Booking 202611130012 invoiceAmount is ₹92,230.00');
  }

  // Booking 3: Public Booking 202611170003
  const [b3Rows]: any = await sequelize.query(
    "SELECT b.bookingCode, cp.packageAmount, cp.total, cp.totalDue, i.invoiceAmount FROM booking b JOIN closependings cp ON cp.closependingId = '7a4525e2-7a97-4549-abba-8574cbc251d3' JOIN invoice i ON i.closePendingId = cp.closependingId WHERE b.bookingCode = '202611170003'"
  );
  if (b3Rows.length > 0) {
    const b3 = b3Rows[0];
    testAssert(Number(b3.packageAmount) === 420, 'Public Booking 202611170003 packageAmount is ₹420.00');
    testAssert(Number(b3.totalDue) === 420, 'Public Booking 202611170003 totalDue is ₹420.00');
    testAssert(Number(b3.invoiceAmount) === 420, 'Public Booking 202611170003 invoiceAmount is ₹420.00');
  }

  // Booking 4: Corporate / Standard Booking 202611120001
  const [b4Rows]: any = await sequelize.query(
    "SELECT b.bookingCode, cp.packageAmount, cp.totalAmount, cp.total, cp.totalDue, cp.advanceAmount, i.invoiceAmount FROM booking b JOIN closependings cp ON cp.closependingId = '50543498-4907-4674-a11e-75ccd646cfb0' JOIN invoice i ON i.closePendingId = cp.closependingId WHERE b.bookingCode = '202611120001'"
  );
  if (b4Rows.length > 0) {
    const b4 = b4Rows[0];
    testAssert(Number(b4.packageAmount) === 120, 'Corporate Booking 202611120001 packageAmount is ₹120.00');
    testAssert(Number(b4.totalAmount) === 44200, 'Corporate Booking 202611120001 totalAmount is ₹44,200.00');
    testAssert(Number(b4.total) === 45314, 'Corporate Booking 202611120001 total is ₹45,314.00');
    testAssert(Number(b4.totalDue) === 45312, 'Corporate Booking 202611120001 totalDue is ₹45,312.00 (45314 - 2 advance)');
    testAssert(Number(b4.invoiceAmount) === 45312, 'Corporate Booking 202611120001 invoiceAmount is ₹45,312.00');
  }

  // --------------------------------------------------------------------------
  // SUITE 4: INVOICE PDF GENERATION VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n🔹 [Suite 4] PDF Invoice Generation & Amount Verification');

  const pdfRes = await makeRequest(
    'POST',
    '/api/downloadPdf/generate-invoice-pdf',
    { bookingId: booking.bookingId },
    {
      Authorization: `Bearer ${fleetAdminToken}`,
      'x-tenant-id': '40fe36dc-1dbb-4e9e-9ad0-3e2a8a3a9162',
    }
  );

  console.log('pdfRes statusCode:', pdfRes.statusCode);
  console.log('pdfRes data:', pdfRes.data);

  testAssert(pdfRes.statusCode === 200, 'POST /downloadPdf/generate-invoice-pdf returns 200');
  testAssert(pdfRes.data?.success === true, 'PDF generation response success is true');
  const pdfFileName = pdfRes.data?.data?.fileName;
  testAssert(typeof pdfFileName === 'string', 'PDF fileName returned');

  if (pdfFileName) {
    const absolutePath = path.join(process.cwd(), 'uploads', 'invoices', pdfFileName);
    const fileExists = fs.existsSync(absolutePath);
    testAssert(fileExists, `Generated PDF file exists on disk: ${pdfFileName}`);
    if (fileExists) {
      const stats = fs.statSync(absolutePath);
      testAssert(stats.size > 1000, `Generated PDF file size is valid (${stats.size} bytes)`);
    }
  }

  // --------------------------------------------------------------------------
  // SUITE 5: CORPORATE POLICIES REMOVAL VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n🔹 [Suite 5] Corporate Policies Complete Removal Verification');

  // 1. Obsolete backend routes return 404
  const policyGetRes = await makeRequest(
    'GET',
    '/api/tenants/policy/any-company-id',
    undefined,
    { Authorization: `Bearer ${fleetAdminToken}` }
  );
  testAssert(policyGetRes.statusCode === 404, 'GET /api/tenants/policy/:companyId returns 404 (route removed)');

  const policyPutRes = await makeRequest(
    'PUT',
    '/api/tenants/policy/any-company-id',
    { allowedEmailDomains: ['test.com'] },
    { Authorization: `Bearer ${fleetAdminToken}` }
  );
  testAssert(policyPutRes.statusCode === 404, 'PUT /api/tenants/policy/:companyId returns 404 (route removed)');

  const policyPostRes = await makeRequest(
    'POST',
    '/api/tenants/policies/any-company-id',
    { requireCostCenter: true },
    { Authorization: `Bearer ${fleetAdminToken}` }
  );
  testAssert(policyPostRes.statusCode === 404, 'POST /api/tenants/policies/:companyId returns 404 (route removed)');

  // 2. Verify database table company_policies no longer exists
  const [policyTables]: any = await sequelize.query(
    "SHOW TABLES LIKE 'company_policies'"
  );
  testAssert(policyTables.length === 0, 'Database table company_policies is cleanly removed');

  // 3. Verify frontend file CompanyPolicies.tsx does not exist
  const frontendPolicyFile = path.join(process.cwd(), '..', 'frontend', 'src', 'SuperAdmin', 'pages', 'Tenants', 'CompanyPolicies.tsx');
  testAssert(!fs.existsSync(frontendPolicyFile), 'frontend CompanyPolicies.tsx file is deleted');

  // 4. Verify Company user login and normal auth still functions
  const [compUser]: any = await sequelize.query(
    "SELECT u.mobile, u.username, c.companyName, c.seoUrl FROM user u JOIN company c ON u.companyId = c.companyId LIMIT 1"
  );
  testAssert(compUser.length > 0, 'Company user exists in database for login preservation');
  if (compUser.length > 0) {
    console.log(`     Preserved company user: ${compUser[0].username} (Company: ${compUser[0].companyName}, SEO: ${compUser[0].seoUrl})`);
  }

  // --------------------------------------------------------------------------
  // SUITE 6: 100% EXACT PROTECTED TABLES VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n🔹 [Suite 6] Protected Tables Verification');

  const empCount = await Employee.count();
  const emailConfCount = await EmailConfiguration.count();
  const configCount = await Configuration.count();
  const saasPlansCount = await SaaSPlan.count();
  const shortLinksCount = await ShortLink.count();
  const smsTemplatesCount = await SmsTemplate.count();
  const [smsLogs]: any = await sequelize.query('SELECT count(*) as c FROM sms_logs');
  const smsLogsCount = smsLogs[0].c;

  testAssert(empCount === 3, `employee table count is exact: ${empCount} (expected: 3)`);
  testAssert(emailConfCount === 40, `emailconfiguration table count is exact: ${emailConfCount} (expected: 40)`);
  testAssert(configCount === 1, `configuration table count is exact: ${configCount} (expected: 1)`);
  testAssert(smsLogsCount === 30, `sms_logs table count is exact: ${smsLogsCount} (expected: 30)`);
  testAssert(smsTemplatesCount === 7, `sms_templates table count is exact: ${smsTemplatesCount} (expected: 7)`);
  testAssert(saasPlansCount === 4, `saas_plans table count is exact: ${saasPlansCount} (expected: 4)`);
  testAssert(shortLinksCount === 28, `short_links table count is exact: ${shortLinksCount} (expected: 28)`);

  console.log('\n================================================================');
  console.log(`TOTAL PASSED: ${passed}, TOTAL FAILED: ${failed}`);
  console.log('================================================================\n');

  server.close();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  if (server) server.close();
  process.exit(1);
});
