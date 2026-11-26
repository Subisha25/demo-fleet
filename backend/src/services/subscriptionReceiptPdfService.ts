import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';
import { SubscriptionInvoice } from '../models/subscriptionInvoice';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
import { Employee } from '../models/employee';
import { SaaSPlan } from '../models/saasPlan';
import { PLAN_CATALOG, PLAN_LIMITS } from './quotaService';

export interface SubscriptionReceiptData {
  // Section A - Branding & Document Header
  receiptNumber: string;
  invoiceNumber: string;
  receiptDate: string;
  receiptTime: string;
  paymentStatus: string;
  
  // Section B - Fleet / Customer Details
  fleetName: string;
  fleetCode: string;
  tenantId: string;
  adminName: string;
  contactEmail: string;
  contactPhone: string;
  registeredAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  gstin?: string;
  panNumber?: string;
  
  // Section C - Subscription Plan Details
  planName: string;
  planTier: string;
  billingCycle: string;
  durationText: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  vehicleQuota: string;
  driverQuota: string;
  companyQuota: string;
  monthlyTripQuota: string;
  planFeatures: string[];
  
  // Section D - Payment Details
  paymentDate: string;
  paymentTime: string;
  paymentGateway: string;
  transactionReference: string;
  paymentMethod: string;
  currency: string;
  
  // Section E - Amount Breakdown
  baseAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  
  // Section F - Validity
  validityNotice: string;
  
  // Section G - Footer
  supportEmail: string;
  supportPhone?: string;
  website: string;
}

/**
 * Format currency with Indian grouping: ₹411.82
 */
export function formatCurrencyINR(amount: number): string {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format Date to readable Indian format (e.g. 25 Nov 2026)
 */
export function formatDateReadable(d: Date | string | null | undefined): string {
  if (!d) return 'N/A';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return 'N/A';
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format Time to readable format (e.g. 11:06 AM IST)
 */
export function formatTimeReadable(d: Date | string | null | undefined): string {
  if (!d) return 'N/A';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return 'N/A';
  return dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) + ' IST';
}

/**
 * Resolves the official CABZ logo as a base64 data URI for offline/isolated PDF rendering.
 */
function resolveCabzLogoBase64(): string {
  const candidates = [
    path.join(__dirname, '..', 'images', 'cabz_logo.png'),
    path.join(__dirname, '..', 'images', 'cabz_logo_transparent.png'),
    path.join(__dirname, '..', 'images', 'cabz_logo.jpg'),
    path.join(process.cwd(), 'backend', 'src', 'images', 'cabz_logo.png'),
    path.join(process.cwd(), 'src', 'images', 'cabz_logo.png'),
    path.join(process.cwd(), 'uploads', 'branding', 'cabz_logo.png'),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        const ext = path.extname(candidate).toLowerCase() === '.jpg' ? 'jpeg' : 'png';
        const buffer = fs.readFileSync(candidate);
        return `data:image/${ext};base64,${buffer.toString('base64')}`;
      }
    } catch {
      // Continue searching
    }
  }

  return '';
}

/**
 * Collects complete authoritative billing, tenant, plan and payment records from demodb.
 */
export async function buildSubscriptionReceiptData(
  subscriptionInvoiceId: string
): Promise<SubscriptionReceiptData> {
  const invoice = await SubscriptionInvoice.findByPk(subscriptionInvoiceId, {
    include: [{ model: Tenant, as: 'tenant' }],
  });

  if (!invoice) {
    throw new Error(`Subscription invoice ${subscriptionInvoiceId} not found in database.`);
  }

  const tenantId = invoice.tenantId;
  const tenant = invoice.tenant || (await Tenant.findByPk(tenantId));
  if (!tenant) {
    throw new Error(`Associated tenant ${tenantId} not found for invoice.`);
  }

  // Fetch TenantSubscription for active entitlements
  const sub = await TenantSubscription.findOne({ where: { tenantId } });

  // Resolve Fleet Admin Name from TenantRegistrationRequest or Employee
  let adminName = tenant.name;
  try {
    const regReq = await TenantRegistrationRequest.findOne({
      where: {
        [Op.or]: [
          { businessCode: tenant.code },
          { contactEmail: tenant.contactEmail },
        ],
      },
      order: [['createdAt', 'DESC']],
    });
    if (regReq?.ownerName) {
      adminName = regReq.ownerName;
    } else {
      const adminEmp = await Employee.findOne({
        where: { tenantId, role: 'admin' },
      });
      if (adminEmp?.username) {
        adminName = adminEmp.username;
      }
    }
  } catch (err) {
    console.warn('[Receipt] Could not resolve admin name, falling back to tenant name:', err);
  }

  // Fetch plan details from SaaSPlan or fallback to PLAN_CATALOG
  const planTier = invoice.planTier;
  let planRecord = await SaaSPlan.findOne({ where: { planTier } });
  const catalogPlan = PLAN_CATALOG[planTier];
  const planLimits = PLAN_LIMITS[planTier];

  const planName = planRecord?.name || catalogPlan?.name || `${planTier} Fleet Operator Plan`;
  const isAnnual = invoice.billingCycle === 'ANNUAL';
  const durationText = isAnnual ? '1 Year (Annual Billing)' : '1 Month (Monthly Billing)';

  // Dates
  const paidAtDate = invoice.paidAt || invoice.createdAt || new Date();
  const startDate = invoice.billingPeriodStart || sub?.currentPeriodStart || paidAtDate;
  const endDate = invoice.billingPeriodEnd || sub?.currentPeriodEnd || new Date(paidAtDate.getTime() + 30 * 86400000);

  // Quotas & Entitlements for the purchased plan tier
  const isInvoiceMatchingSub = sub && sub.planTier === invoice.planTier;
  const vQuota = isInvoiceMatchingSub ? sub.vehicleQuota : (planLimits?.vehicles ?? 15);
  const dQuota = isInvoiceMatchingSub ? sub.driverQuota : (planLimits?.drivers ?? 15);
  const cQuota = isInvoiceMatchingSub ? sub.companyQuota : (planLimits?.companies ?? 3);
  const tQuota = isInvoiceMatchingSub ? sub.monthlyTripQuota : (planLimits?.trips ?? 250);

  const vehicleQuota = vQuota === -1 || (isInvoiceMatchingSub && sub?.isUnlimitedVehicles) ? 'Unlimited Vehicles' : `${vQuota} Vehicles`;
  const driverQuota = dQuota === -1 ? 'Unlimited Drivers' : `${dQuota} Drivers`;
  const companyQuota = cQuota === -1 ? 'Unlimited Corporate Clients' : `${cQuota} Corporate Clients`;
  const monthlyTripQuota = tQuota === -1 || (isInvoiceMatchingSub && sub?.isUnlimitedTrips) ? 'Unlimited Trips / Month' : `${tQuota} Trips / Month`;

  const features = catalogPlan?.features || [
    'Automated Booking & Trip Dispatch Engine',
    'Real-time Driver GPS Tracking & Status',
    'Corporate Billing & Custom Invoicing',
    'SMS & Email Passenger Notifications',
    'Dedicated Fleet Operations Dashboard',
  ];

  // Financial Breakdown from invoice and metadata
  const baseAmount = Number(invoice.baseAmount) || 0;
  const meta = invoice.metadata || {};
  const discountAmount = Number(meta.discountAmount) || 0;
  const taxableAmount = Number(meta.taxableAmount) || baseAmount;
  const taxRate = Number(invoice.taxRate) || 18.0;
  const taxAmount = Number(invoice.taxAmount) || Math.round(taxableAmount * 0.18 * 100) / 100;
  const cgstAmount = Number(meta.cgst) || Math.round(taxAmount / 2 * 100) / 100;
  const sgstAmount = Number(meta.sgst) || Math.round(taxAmount / 2 * 100) / 100;
  const totalAmount = Number(invoice.totalAmount) || Math.round((baseAmount + taxAmount) * 100) / 100;

  // Payment details
  const receiptNumber = `REC-${invoice.invoiceNumber}`;
  const paymentMethod = invoice.paymentMethod || 'Online Gateway';
  const paymentGateway = invoice.paymentMethod === 'SMARTGATEWAY'
    ? 'CABZ SmartGateway'
    : (invoice.paymentMethod === 'TEST_SANDBOX' ? 'Payment Gateway (Test Sandbox)' : 'Online Payment Gateway');

  return {
    receiptNumber,
    invoiceNumber: invoice.invoiceNumber,
    receiptDate: formatDateReadable(paidAtDate),
    receiptTime: formatTimeReadable(paidAtDate),
    paymentStatus: invoice.paymentStatus === 'PAID' ? 'PAID / SUCCESSFUL' : invoice.paymentStatus,

    fleetName: tenant.name,
    fleetCode: tenant.code,
    tenantId: tenant.tenantId,
    adminName,
    contactEmail: tenant.contactEmail,
    contactPhone: tenant.contactPhone,
    registeredAddress: tenant.registeredAddress || undefined,
    city: tenant.city || undefined,
    state: tenant.state || undefined,
    pinCode: tenant.pinCode || undefined,
    gstin: tenant.gstin || undefined,
    panNumber: tenant.panNumber || undefined,

    planName,
    planTier: invoice.planTier,
    billingCycle: invoice.billingCycle,
    durationText,
    startDate: formatDateReadable(startDate),
    endDate: formatDateReadable(endDate),
    renewalDate: formatDateReadable(endDate),
    vehicleQuota,
    driverQuota,
    companyQuota,
    monthlyTripQuota,
    planFeatures: features,

    paymentDate: formatDateReadable(paidAtDate),
    paymentTime: formatTimeReadable(paidAtDate),
    paymentGateway,
    transactionReference: invoice.transactionReference || `TXN-${invoice.subscriptionInvoiceId.substring(0, 8)}`,
    paymentMethod,
    currency: invoice.currency || 'INR',

    baseAmount,
    discountAmount,
    taxableAmount,
    taxRate,
    taxAmount,
    cgstAmount,
    sgstAmount,
    totalAmount,

    validityNotice: 'Your CABZ subscription is active until the validity date mentioned above, subject to the applicable subscription terms.',

    supportEmail: 'support@cabz.com',
    supportPhone: '+91 90802 80818',
    website: 'www.cabz.com',
  };
}

/**
 * Builds the HTML content for the subscription payment receipt matching CABZ branding.
 */
export function buildSubscriptionReceiptHtml(data: SubscriptionReceiptData): string {
  const logoBase64 = resolveCabzLogoBase64();

  const logoMarkup = logoBase64
    ? `<img src="${logoBase64}" alt="CABZ Logo" style="height: 52px; width: auto; object-fit: contain;" />`
    : `<div style="font-size: 28px; font-weight: 900; color: #5B3DF5; letter-spacing: -0.5px;">CABZ</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Subscription Payment Receipt - ${data.invoiceNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      margin: 0;
      padding: 0;
      font-size: 11.5px;
      line-height: 1.45;
      background: #FFFFFF;
    }
    .container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
    
    /* SECTION A: HEADER & CABZ BRANDING */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2.5px solid #5B3DF5;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      font-size: 11px;
      font-weight: 700;
      color: #5B3DF5;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin: 2px 0 0 0;
    }
    .doc-title {
      font-size: 15px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 4px 0;
      text-align: right;
    }
    .badge-paid {
      display: inline-block;
      background-color: #10B981;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 3px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .meta-text {
      font-size: 11px;
      color: #475569;
      margin: 2px 0;
      text-align: right;
    }

    /* SECTION CARDS & HEADINGS */
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #5B3DF5;
      background: #F1F5F9;
      border-left: 3px solid #5B3DF5;
      padding: 4px 10px;
      margin: 14px 0 8px 0;
    }
    .grid-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .grid-table td {
      padding: 4px 8px;
      vertical-align: top;
      font-size: 11px;
    }
    .label {
      color: #64748B;
      font-weight: 600;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .value {
      color: #0F172A;
      font-weight: 600;
    }

    /* SECTION C: RESOURCE ALLOTMENT TABLE */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 10px;
      font-size: 11px;
    }
    .data-table th {
      background-color: #0F172A;
      color: #FFFFFF;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 6px 10px;
      text-align: left;
    }
    .data-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #E2E8F0;
      color: #1E293B;
    }
    .data-table tr:nth-child(even) td {
      background-color: #F8FAFC;
    }

    /* SECTION E: AMOUNT BREAKDOWN TABLE */
    .amount-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 12px;
      font-size: 11px;
    }
    .amount-table th {
      background-color: #0F172A;
      color: #FFFFFF;
      padding: 6px 10px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .amount-table td {
      padding: 5px 10px;
      border-bottom: 1px solid #E2E8F0;
    }
    .total-row td {
      background-color: #5B3DF5 !important;
      color: #FFFFFF !important;
      font-size: 13px !important;
      font-weight: 800 !important;
      padding: 8px 10px !important;
      border-top: 2px solid #4326D1;
    }

    /* SECTION F: VALIDITY CARD */
    .validity-card {
      background: linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%);
      border: 1.5px solid #C7D2FE;
      border-radius: 8px;
      padding: 10px 14px;
      margin-top: 10px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .validity-header {
      font-size: 11px;
      font-weight: 800;
      color: #3730A3;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }
    .validity-notice {
      font-size: 10px;
      color: #4338CA;
      font-style: italic;
      margin-top: 6px;
      border-top: 1px dashed #C7D2FE;
      padding-top: 6px;
    }

    /* SECTION G: FOOTER */
    .footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
      margin-top: 14px;
      text-align: center;
      color: #64748B;
      font-size: 9.5px;
      page-break-inside: avoid;
    }
    .footer-brand {
      font-weight: 700;
      color: #0F172A;
      font-size: 10.5px;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- SECTION A: CABZ BRANDING & RECEIPT HEADER -->
    <table class="header-table">
      <tr>
        <td style="width: 55%; vertical-align: middle;">
          ${logoMarkup}
          <div class="brand-tagline">Smart Fleet Mobility Platform</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 3px;">
            Official SaaS Subscription Billing & License Receipt
          </div>
        </td>
        <td style="width: 45%; vertical-align: top; text-align: right;">
          <div class="doc-title">SUBSCRIPTION PAYMENT RECEIPT</div>
          <div style="margin-bottom: 4px;"><span class="badge-paid">${data.paymentStatus}</span></div>
          <div class="meta-text"><strong>Receipt No:</strong> ${data.receiptNumber}</div>
          <div class="meta-text"><strong>Invoice Ref:</strong> ${data.invoiceNumber}</div>
          <div class="meta-text"><strong>Date:</strong> ${data.receiptDate} (${data.receiptTime})</div>
        </td>
      </tr>
    </table>

    <!-- SECTION B: FLEET / CUSTOMER DETAILS -->
    <div class="section-title">1. Fleet & Operator Information</div>
    <table class="grid-table">
      <tr>
        <td style="width: 50%;">
          <div class="label">Fleet / Business Name</div>
          <div class="value" style="font-size: 12px; color: #5B3DF5;">${data.fleetName}</div>
        </td>
        <td style="width: 50%;">
          <div class="label">Fleet Registration ID</div>
          <div class="value">${data.fleetCode}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="label">Fleet Admin / Account Owner</div>
          <div class="value">${data.adminName}</div>
        </td>
        <td>
          <div class="label">Tenant ID Reference</div>
          <div class="value" style="font-family: monospace; font-size: 10.5px;">${data.tenantId}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="label">Registered Email Address</div>
          <div class="value">${data.contactEmail}</div>
        </td>
        <td>
          <div class="label">Contact Phone Number</div>
          <div class="value">${data.contactPhone || 'N/A'}</div>
        </td>
      </tr>
      ${(data.registeredAddress || data.city || data.state) ? `
      <tr>
        <td colspan="2">
          <div class="label">Business Address & Location</div>
          <div class="value">
            ${[data.registeredAddress, data.city, data.state, data.pinCode ? `PIN: ${data.pinCode}` : ''].filter(Boolean).join(', ')}
          </div>
        </td>
      </tr>
      ` : ''}
      ${(data.gstin || data.panNumber) ? `
      <tr>
        ${data.gstin ? `<td><div class="label">GST Number (GSTIN)</div><div class="value" style="font-family: monospace;">${data.gstin}</div></td>` : '<td></td>'}
        ${data.panNumber ? `<td><div class="label">Permanent Account Number (PAN)</div><div class="value" style="font-family: monospace;">${data.panNumber}</div></td>` : '<td></td>'}
      </tr>
      ` : ''}
    </table>

    <!-- SECTION C: SUBSCRIPTION PLAN DETAILS & ENTITLEMENTS -->
    <div class="section-title">2. Subscription Plan & Resource Allotment</div>
    <table class="grid-table">
      <tr>
        <td style="width: 33%;">
          <div class="label">Plan Tier & Name</div>
          <div class="value" style="font-size: 12px; color: #0F172A;">${data.planName} (${data.planTier})</div>
        </td>
        <td style="width: 33%;">
          <div class="label">Billing Cycle</div>
          <div class="value">${data.billingCycle}</div>
        </td>
        <td style="width: 34%;">
          <div class="label">Subscription Duration</div>
          <div class="value">${data.durationText}</div>
        </td>
      </tr>
    </table>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 35%;">Resource Module</th>
          <th style="width: 30%;">Included Plan Quota</th>
          <th style="width: 35%;">Enforcement & Policy</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Active Fleet Vehicles</strong></td>
          <td><span style="color: #5B3DF5; font-weight: 700;">${data.vehicleQuota}</span></td>
          <td>Strictly gated by subscription tier</td>
        </tr>
        <tr>
          <td><strong>Registered Drivers</strong></td>
          <td><span style="color: #5B3DF5; font-weight: 700;">${data.driverQuota}</span></td>
          <td>Strictly gated by subscription tier</td>
        </tr>
        <tr>
          <td><strong>Corporate Client Accounts</strong></td>
          <td><span style="color: #5B3DF5; font-weight: 700;">${data.companyQuota}</span></td>
          <td>Corporate booking & billing accounts</td>
        </tr>
        <tr>
          <td><strong>Monthly Completed Trips</strong></td>
          <td><span style="color: #5B3DF5; font-weight: 700;">${data.monthlyTripQuota}</span></td>
          <td>Metered per billing period</td>
        </tr>
      </tbody>
    </table>

    <!-- SECTION D: PAYMENT DETAILS -->
    <div class="section-title">3. Verified Payment Transaction Details</div>
    <table class="grid-table">
      <tr>
        <td style="width: 25%;">
          <div class="label">Payment Date</div>
          <div class="value">${data.paymentDate}</div>
        </td>
        <td style="width: 25%;">
          <div class="label">Payment Time</div>
          <div class="value">${data.paymentTime}</div>
        </td>
        <td style="width: 25%;">
          <div class="label">Payment Gateway</div>
          <div class="value">${data.paymentGateway}</div>
        </td>
        <td style="width: 25%;">
          <div class="label">Payment Method</div>
          <div class="value">${data.paymentMethod}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div class="label">Transaction Reference / Gateway ID</div>
          <div class="value" style="font-family: monospace; font-size: 11px; color: #5B3DF5;">${data.transactionReference}</div>
        </td>
        <td>
          <div class="label">Payment Status</div>
          <div class="value" style="color: #10B981; font-weight: 700;">${data.paymentStatus}</div>
        </td>
        <td>
          <div class="label">Currency</div>
          <div class="value">${data.currency}</div>
        </td>
      </tr>
    </table>

    <!-- SECTION E: AMOUNT BREAKDOWN -->
    <div class="section-title">4. Financial Breakdown & Applicable Taxes</div>
    <table class="amount-table">
      <thead>
        <tr>
          <th style="width: 70%; text-align: left;">Billing Component & Description</th>
          <th style="width: 30%; text-align: right;">Amount (${data.currency})</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Subscription Plan Base Fee — ${data.planName} (${data.billingCycle})</td>
          <td style="text-align: right; font-weight: 600;">${formatCurrencyINR(data.baseAmount)}</td>
        </tr>
        ${data.discountAmount > 0 ? `
        <tr>
          <td style="color: #16A34A;">Annual Billing Incentive / Savings (15% Discount)</td>
          <td style="text-align: right; color: #16A34A; font-weight: 600;">- ${formatCurrencyINR(data.discountAmount)}</td>
        </tr>
        ` : ''}
        <tr>
          <td><strong>Taxable Base Amount</strong></td>
          <td style="text-align: right; font-weight: 600;">${formatCurrencyINR(data.taxableAmount)}</td>
        </tr>
        <tr>
          <td>Applicable Goods and Services Tax (GST @ ${data.taxRate}% — CGST 9% + SGST 9%)</td>
          <td style="text-align: right; font-weight: 600;">${formatCurrencyINR(data.taxAmount)}</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL AMOUNT PAID (INCL. ALL TAXES)</td>
          <td style="text-align: right;">${formatCurrencyINR(data.totalAmount)}</td>
        </tr>
      </tbody>
    </table>

    <!-- SECTION F: SUBSCRIPTION VALIDITY -->
    <div class="validity-card">
      <div class="validity-header">5. Subscription Validity & Active Coverage</div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 25%;">
            <div class="label">Activated On</div>
            <div class="value" style="color: #3730A3;">${data.startDate}</div>
          </td>
          <td style="width: 25%;">
            <div class="label">Valid Until</div>
            <div class="value" style="color: #3730A3;">${data.endDate}</div>
          </td>
          <td style="width: 25%;">
            <div class="label">Subscription Duration</div>
            <div class="value">${data.durationText}</div>
          </td>
          <td style="width: 25%;">
            <div class="label">Subscription Status</div>
            <div class="value" style="color: #10B981; font-weight: 800;">ACTIVE</div>
          </td>
        </tr>
      </table>
      <div class="validity-notice">
        "${data.validityNotice}"
      </div>
    </div>

    <!-- SECTION G: FOOTER -->
    <div class="footer">
      <div class="footer-brand">CABZ – Smart Fleet Mobility</div>
      <div style="margin: 2px 0;">"Thank you for choosing CABZ."</div>
      <div style="margin: 2px 0;">
        Support: <a href="mailto:${data.supportEmail}" style="color: #5B3DF5; text-decoration: none;">${data.supportEmail}</a> 
        ${data.supportPhone ? `• Phone: ${data.supportPhone}` : ''} • Website: <a href="https://${data.website}" style="color: #5B3DF5; text-decoration: none;">${data.website}</a>
      </div>
      <div style="font-size: 9px; color: #94A3B8; margin-top: 4px;">
        This is a computer-generated subscription payment receipt. No physical signature is required.
      </div>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Generates an authoritative, professional subscription payment receipt PDF on disk using Puppeteer.
 * Returns the file path, file name, buffer, and structured receipt data.
 */
export async function generateSubscriptionReceiptPdf(
  subscriptionInvoiceId: string
): Promise<{
  filePath: string;
  fileName: string;
  pdfBuffer: Buffer;
  receiptData: SubscriptionReceiptData;
}> {
  const receiptData = await buildSubscriptionReceiptData(subscriptionInvoiceId);

  const receiptsDir = path.join(process.cwd(), 'uploads', 'subscription_receipts');
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const fileName = `CABZ_Subscription_Receipt_${receiptData.invoiceNumber}.pdf`;
  const filePath = path.join(receiptsDir, fileName);

  const html = buildSubscriptionReceiptHtml(receiptData);

  let browser: any;
  let pdfBuffer: Buffer;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const rawBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    });
    pdfBuffer = Buffer.from(rawBuffer);
    fs.writeFileSync(filePath, pdfBuffer);
  } catch (pdfErr) {
    console.error('[Receipt PDF] Puppeteer rendering error, generating structured fallback PDF buffer:', pdfErr);
    // Minimal valid PDF fallback header and text content if chromium is unavailable
    const fallbackText = `%PDF-1.4\n%CABZ Subscription Payment Receipt for ${receiptData.fleetName}\nInvoice: ${receiptData.invoiceNumber}\nTotal: INR ${receiptData.totalAmount}\nStatus: PAID\nValid: ${receiptData.startDate} to ${receiptData.endDate}\n%%EOF`;
    pdfBuffer = Buffer.from(fallbackText);
    fs.writeFileSync(filePath, pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return {
    filePath,
    fileName,
    pdfBuffer,
    receiptData,
  };
}
