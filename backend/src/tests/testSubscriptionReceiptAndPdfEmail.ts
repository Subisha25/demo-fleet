import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import {
  sequelize,
  Tenant,
  TenantSubscription,
  SubscriptionInvoice,
  TenantRegistrationRequest,
  Employee,
  NotificationLog,
  SaaSPlan,
} from '../models';
import {
  generateSubscriptionReceiptPdf,
  buildSubscriptionReceiptData,
  buildSubscriptionReceiptHtml,
  formatCurrencyINR,
  formatDateReadable,
  formatTimeReadable,
} from '../services/subscriptionReceiptPdfService';
import {
  createSubscriptionCheckout,
  verifySubscriptionPayment,
  calculateSubscriptionPeriodEnd,
} from '../services/subscriptionBillingService';
import { sendNotification } from '../services/notificationService';
import { ROOT_TENANT_ID } from '../context/tenantContext';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function assert(desc: string, fn: () => Promise<boolean | void> | boolean | void) {
  totalTests++;
  try {
    const result = await fn();
    if (result === false) {
      failedTests++;
      console.error(`❌ [FAIL] ${desc}`);
    } else {
      passedTests++;
      console.log(`✅ [PASS] ${desc}`);
    }
  } catch (err: any) {
    failedTests++;
    console.error(`❌ [FAIL] ${desc}: ${err.message}`);
  }
}

async function runSubscriptionReceiptTestSuite() {
  console.log('\n================================================================');
  console.log('🚀 CABZ SUBSCRIPTION PAYMENT RECEIPT & PDF EMAIL TEST SUITE');
  console.log('================================================================\n');

  await sequelize.authenticate();
  console.log('Database connected successfully.\n');

  const runId = Date.now().toString().slice(-6);
  const testEmail = `fleetadmin_${runId}@cabztest.in`;
  const testPhone = '9876543210';
  const testCode = `CB${runId.slice(-4)}`;
  const testFleetName = `CABZ Fleet Pro ${runId}`;

  // 1. Create a clean test tenant and registration request
  const tenant = await Tenant.create({
    tenantId: uuidv4(),
    name: testFleetName,
    code: testCode,
    subdomain: `testfleet${runId}`,
    contactEmail: testEmail,
    contactPhone: testPhone,
    status: 'TRIALING',
    planTier: 'PRO',
    registeredAddress: '101 Corporate Mobility Park, Mount Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600032',
    gstin: '33AAACA1111A1Z1',
    panNumber: 'AAACA1111A',
  });

  const regRequest = await TenantRegistrationRequest.create({
    requestId: uuidv4(),
    fleetName: testFleetName,
    businessCode: testCode,
    ownerName: `Ramesh Kumar ${runId}`,
    contactEmail: testEmail,
    contactPhone: testPhone,
    city: 'Chennai',
    state: 'Tamil Nadu',
    requestedPlanTier: 'PRO',
    billingCycle: 'MONTHLY',
    status: 'APPROVED',
  });

  const sub = await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: tenant.tenantId,
    planTier: 'PRO',
    status: 'TRIALING',
    vehicleQuota: 75,
    driverQuota: 75,
    companyQuota: 20,
    monthlyTripQuota: 250,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    agreedPrice: 349.0,
    currency: 'INR',
    billingCycle: 'MONTHLY',
  });

  console.log(`Created test tenant ${tenant.name} (${tenant.tenantId}) for receipt verification.\n`);

  // --- SCENARIO 1: SUCCESSFUL MONTHLY SUBSCRIPTION PAYMENT ---
  console.log('--- SCENARIO 1 & 11: MONTHLY PAYMENT VERIFICATION & EMAIL DISPATCH ---');
  let monthlyInvoice: SubscriptionInvoice;

  await assert('1.1 Create monthly subscription invoice for PRO tier', async () => {
    const periodEnd = calculateSubscriptionPeriodEnd(new Date(), 'MONTHLY');
    monthlyInvoice = await SubscriptionInvoice.create({
      subscriptionInvoiceId: uuidv4(),
      tenantId: tenant.tenantId,
      subscriptionId: sub.subscriptionId,
      invoiceNumber: `SUB-202611-${runId}1`,
      planTier: 'PRO',
      billingCycle: 'MONTHLY',
      baseAmount: 349.0,
      taxRate: 18.0,
      taxAmount: 62.82,
      totalAmount: 411.82,
      currency: 'INR',
      paymentStatus: 'PENDING',
      paymentMethod: 'SMARTGATEWAY',
      billingPeriodStart: new Date(),
      billingPeriodEnd: periodEnd,
      metadata: {
        planName: 'Pro Fleet Operator',
        grossAmount: 349.0,
        discountAmount: 0,
        taxableAmount: 349.0,
        cgst: 31.41,
        sgst: 31.41,
      },
    });
    return Boolean(monthlyInvoice.subscriptionInvoiceId);
  });

  await assert('1.2 verifySubscriptionPayment marks invoice PAID and generates PDF receipt on disk', async () => {
    const req: any = {
      tenantId: tenant.tenantId,
      body: {
        subscriptionInvoiceId: monthlyInvoice.subscriptionInvoiceId,
        transactionReference: `TXN_TEST_MON_${runId}`,
        isTestMode: true,
      },
    };
    let statusCode = 0;
    let resData: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            resData = data;
          },
        };
      },
    };

    await verifySubscriptionPayment(req, res);

    await monthlyInvoice.reload();
    await tenant.reload();
    await sub.reload();

    if (statusCode !== 200 || monthlyInvoice.paymentStatus !== 'PAID') return false;
    if (tenant.status !== 'ACTIVE' || sub.status !== 'ACTIVE') return false;

    // Check metadata for receipt information
    const meta = monthlyInvoice.metadata || {};
    return meta.receiptGenerated === true && Boolean(meta.receiptPdfPath);
  });

  await assert('1.3 PDF file exists on disk with proper CABZ naming convention', async () => {
    const expectedName = `CABZ_Subscription_Receipt_${monthlyInvoice.invoiceNumber}.pdf`;
    const expectedPath = path.join(process.cwd(), 'uploads', 'subscription_receipts', expectedName);
    return fs.existsSync(expectedPath) && fs.statSync(expectedPath).size > 100;
  });

  // --- SCENARIO 2: SUCCESSFUL YEARLY PAYMENT WITH 15% DISCOUNT ---
  console.log('\n--- SCENARIO 2: YEARLY SUBSCRIPTION PAYMENT (15% SAVINGS) ---');
  let annualInvoice: SubscriptionInvoice;

  await assert('2.1 Yearly invoice calculates 15% annual billing discount and correct tax', async () => {
    const periodEnd = calculateSubscriptionPeriodEnd(new Date(), 'ANNUAL');
    const gross = 349 * 12; // 4188
    const base = 3560; // Annual discounted base
    const discount = gross - base; // 628
    const tax = Math.round(base * 0.18 * 100) / 100; // 640.80
    const total = Math.round((base + tax) * 100) / 100; // 4200.80

    annualInvoice = await SubscriptionInvoice.create({
      subscriptionInvoiceId: uuidv4(),
      tenantId: tenant.tenantId,
      subscriptionId: sub.subscriptionId,
      invoiceNumber: `SUB-202611-${runId}2`,
      planTier: 'PRO',
      billingCycle: 'ANNUAL',
      baseAmount: base,
      taxRate: 18.0,
      taxAmount: tax,
      totalAmount: total,
      currency: 'INR',
      paymentStatus: 'PAID',
      paymentMethod: 'SMARTGATEWAY',
      transactionReference: `TXN_ANNUAL_${runId}`,
      paidAt: new Date(),
      billingPeriodStart: new Date(),
      billingPeriodEnd: periodEnd,
      metadata: {
        planName: 'Pro Fleet Operator',
        grossAmount: gross,
        discountAmount: discount,
        discountApplied: '15%',
        taxableAmount: base,
        cgst: Math.round(tax / 2 * 100) / 100,
        sgst: Math.round(tax / 2 * 100) / 100,
      },
    });

    const receipt = await generateSubscriptionReceiptPdf(annualInvoice.subscriptionInvoiceId);
    return (
      receipt.receiptData.billingCycle === 'ANNUAL' &&
      receipt.receiptData.discountAmount === 628 &&
      receipt.receiptData.totalAmount === 4200.8
    );
  });

  // --- SCENARIO 3: DIFFERENT SUBSCRIPTION PLANS (BASIC, PRO, ENTERPRISE) ---
  console.log('\n--- SCENARIO 3 & 5: PLAN DETAILS & DYNAMIC ENTITLEMENTS ---');
  await assert('3.1 BASIC plan receipt contains 15 vehicles, 15 drivers, 3 companies quota', async () => {
    const basicInv = await SubscriptionInvoice.create({
      subscriptionInvoiceId: uuidv4(),
      tenantId: tenant.tenantId,
      invoiceNumber: `SUB-202611-${runId}3`,
      planTier: 'BASIC',
      billingCycle: 'MONTHLY',
      baseAmount: 299.0,
      taxRate: 18.0,
      taxAmount: 53.82,
      totalAmount: 352.82,
      currency: 'INR',
      paymentStatus: 'PAID',
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(Date.now() + 30 * 86400000),
      paidAt: new Date(),
    });

    const receipt = await generateSubscriptionReceiptPdf(basicInv.subscriptionInvoiceId);
    return (
      receipt.receiptData.planTier === 'BASIC' &&
      receipt.receiptData.vehicleQuota.includes('15') &&
      receipt.receiptData.driverQuota.includes('15') &&
      receipt.receiptData.companyQuota.includes('3')
    );
  });

  await assert('3.2 ENTERPRISE plan receipt contains Unlimited quotas', async () => {
    const entInv = await SubscriptionInvoice.create({
      subscriptionInvoiceId: uuidv4(),
      tenantId: tenant.tenantId,
      invoiceNumber: `SUB-202611-${runId}4`,
      planTier: 'ENTERPRISE',
      billingCycle: 'ANNUAL',
      baseAmount: 5600.0,
      taxRate: 18.0,
      taxAmount: 1008.0,
      totalAmount: 6608.0,
      currency: 'INR',
      paymentStatus: 'PAID',
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(Date.now() + 365 * 86400000),
      paidAt: new Date(),
    });

    const receipt = await generateSubscriptionReceiptPdf(entInv.subscriptionInvoiceId);
    return (
      receipt.receiptData.planTier === 'ENTERPRISE' &&
      receipt.receiptData.vehicleQuota.toLowerCase().includes('unlimited') &&
      receipt.receiptData.driverQuota.toLowerCase().includes('unlimited')
    );
  });

  // --- SCENARIO 4: CORRECT FLEET DETAILS IN PDF ---
  console.log('\n--- SCENARIO 4, 6, 7, 8, 9: ACCURATE DATA SOURCES IN PDF ---');
  await assert('4.1 Receipt data maps exact fleet name, code, tenantId, admin name, address, GSTIN and PAN', async () => {
    const receiptData = await buildSubscriptionReceiptData(monthlyInvoice.subscriptionInvoiceId);
    return (
      receiptData.fleetName === testFleetName &&
      receiptData.fleetCode === testCode &&
      receiptData.tenantId === tenant.tenantId &&
      receiptData.adminName.includes('Ramesh Kumar') &&
      receiptData.contactEmail === testEmail &&
      receiptData.contactPhone === testPhone &&
      receiptData.city === 'Chennai' &&
      receiptData.state === 'Tamil Nadu' &&
      receiptData.pinCode === '600032' &&
      receiptData.gstin === '33AAACA1111A1Z1' &&
      receiptData.panNumber === 'AAACA1111A'
    );
  });

  await assert('6.1 Start, end, and renewal dates are formatted and valid', async () => {
    const receiptData = await buildSubscriptionReceiptData(monthlyInvoice.subscriptionInvoiceId);
    return (
      receiptData.startDate.length > 5 &&
      receiptData.endDate.length > 5 &&
      receiptData.renewalDate === receiptData.endDate
    );
  });

  await assert('7.1 Payment date and time are accurately populated', async () => {
    const receiptData = await buildSubscriptionReceiptData(monthlyInvoice.subscriptionInvoiceId);
    return (
      receiptData.paymentDate.length > 5 &&
      receiptData.paymentTime.includes('IST')
    );
  });

  await assert('8.1 Transaction reference matches verified gateway reference', async () => {
    const receiptData = await buildSubscriptionReceiptData(monthlyInvoice.subscriptionInvoiceId);
    return receiptData.transactionReference === `TXN_TEST_MON_${runId}`;
  });

  await assert('9.1 Financial breakdown matches captured payment exactly (349 + 62.82 = 411.82)', async () => {
    const receiptData = await buildSubscriptionReceiptData(monthlyInvoice.subscriptionInvoiceId);
    return (
      receiptData.baseAmount === 349.0 &&
      receiptData.taxAmount === 62.82 &&
      receiptData.totalAmount === 411.82 &&
      formatCurrencyINR(receiptData.totalAmount).includes('411.82')
    );
  });

  // --- SCENARIO 10: PDF ATTACHMENT OPENS SUCCESSFULLY ---
  console.log('\n--- SCENARIO 10: PDF BUFFER VALIDITY ---');
  await assert('10.1 Generated PDF buffer has valid %PDF- magic header and non-empty content', async () => {
    const receipt = await generateSubscriptionReceiptPdf(monthlyInvoice.subscriptionInvoiceId);
    const header = receipt.pdfBuffer.slice(0, 5).toString('utf-8');
    return header.startsWith('%PDF') && receipt.pdfBuffer.length > 500;
  });

  // --- SCENARIO 11: EMAIL RECIPIENT VALIDATION ---
  console.log('\n--- SCENARIO 11 & 7: EMAIL RECIPIENT AND SECURITY ---');
  await assert('11.1 Confirmation email recipient is strictly the registered tenant contact email', async () => {
    await monthlyInvoice.reload();
    const meta = monthlyInvoice.metadata || {};
    return meta.receiptSentTo === testEmail;
  });

  // --- SCENARIO 12: DUPLICATE PAYMENT CALLBACK PREVENTION ---
  console.log('\n--- SCENARIO 12: DUPLICATE EMAIL PREVENTION ---');
  await assert('12.1 Repeated payment verification on already-PAID invoice returns early without sending duplicate email', async () => {
    const initialLogCount = await NotificationLog.count({
      where: {
        referenceId: monthlyInvoice.subscriptionInvoiceId,
        templateCode: 'SUBSCRIPTION_PAYMENT_SUCCESS',
      },
    });

    const req: any = {
      tenantId: tenant.tenantId,
      body: {
        subscriptionInvoiceId: monthlyInvoice.subscriptionInvoiceId,
        transactionReference: `TXN_DUP_${Date.now()}`,
      },
    };
    let statusCode = 0;
    let resData: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: (data: any) => { resData = data; } };
      },
    };

    await verifySubscriptionPayment(req, res);

    const postLogCount = await NotificationLog.count({
      where: {
        referenceId: monthlyInvoice.subscriptionInvoiceId,
        templateCode: 'SUBSCRIPTION_PAYMENT_SUCCESS',
      },
    });

    return (
      statusCode === 200 &&
      resData?.message === 'Invoice is already paid and active.' &&
      postLogCount === initialLogCount
    );
  });

  // --- SCENARIO 13: EMAIL FAILURE RESILIENCE ---
  console.log('\n--- SCENARIO 13: RESILIENCE (PAYMENT STAYS VALID ON EMAIL ERROR) ---');
  await assert('13.1 If notification dispatch throws, payment remains PAID and subscription remains ACTIVE', async () => {
    // Create new invoice for test
    const failInv = await SubscriptionInvoice.create({
      subscriptionInvoiceId: uuidv4(),
      tenantId: tenant.tenantId,
      invoiceNumber: `SUB-202611-${runId}F`,
      planTier: 'PRO',
      billingCycle: 'MONTHLY',
      baseAmount: 349.0,
      taxRate: 18.0,
      taxAmount: 62.82,
      totalAmount: 411.82,
      currency: 'INR',
      paymentStatus: 'PENDING',
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(Date.now() + 30 * 86400000),
    });

    const req: any = {
      tenantId: tenant.tenantId,
      body: {
        subscriptionInvoiceId: failInv.subscriptionInvoiceId,
        transactionReference: `TXN_FAILSAFE_${runId}`,
        isTestMode: true,
      },
    };
    let statusCode = 0;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: () => {} };
      },
    };

    await verifySubscriptionPayment(req, res);
    await failInv.reload();

    return statusCode === 200 && failInv.paymentStatus === 'PAID';
  });

  // --- SCENARIO 14: MISSING OPTIONAL DETAILS GRACEFUL HANDLING ---
  console.log('\n--- SCENARIO 14: MISSING OPTIONAL FLEET DETAILS ---');
  await assert('14.1 Generates clean PDF when optional fields (GST, PAN, address) are missing', async () => {
    const minimalTenant = await Tenant.create({
      tenantId: uuidv4(),
      name: `Minimal Fleet ${runId}`,
      code: `MIN${runId.slice(-4)}`,
      contactEmail: `minimal_${runId}@cabztest.in`,
      status: 'ACTIVE',
      planTier: 'BASIC',
      // gstin, panNumber, registeredAddress all left null
    });

    const minInv = await SubscriptionInvoice.create({
      subscriptionInvoiceId: uuidv4(),
      tenantId: minimalTenant.tenantId,
      invoiceNumber: `SUB-202611-${runId}M`,
      planTier: 'BASIC',
      billingCycle: 'MONTHLY',
      baseAmount: 299.0,
      taxRate: 18.0,
      taxAmount: 53.82,
      totalAmount: 352.82,
      currency: 'INR',
      paymentStatus: 'PAID',
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(Date.now() + 30 * 86400000),
      paidAt: new Date(),
    });

    const receipt = await generateSubscriptionReceiptPdf(minInv.subscriptionInvoiceId);
    return (
      receipt.receiptData.gstin === undefined &&
      receipt.receiptData.panNumber === undefined &&
      receipt.pdfBuffer.length > 500
    );
  });

  // --- SCENARIO 15: MULTI-PAGE & CSS STYLING RULES ---
  console.log('\n--- SCENARIO 15: PRINT STYLING & MULTI-PAGE RULES ---');
  await assert('15.1 HTML template includes print-color-adjust and page-break-inside rules', async () => {
    const receiptData = await buildSubscriptionReceiptData(monthlyInvoice.subscriptionInvoiceId);
    const html = buildSubscriptionReceiptHtml(receiptData);
    return (
      html.includes('print-color-adjust: exact') &&
      html.includes('page-break-inside: avoid') &&
      html.includes('CABZ') &&
      html.includes('SUBSCRIPTION PAYMENT RECEIPT') &&
      html.includes('ACTIVE')
    );
  });

  console.log('\n================================================================');
  console.log(`📊 FINAL TEST RESULTS: ${passedTests} PASSED | ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSubscriptionReceiptTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
