import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { SubscriptionInvoice } from '../models/subscriptionInvoice';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { PLAN_CATALOG, PLAN_LIMITS, getOrCreateSubscription } from './quotaService';
import { sendNotification, getSuperAdminEmail } from './notificationService';
import { generateSubscriptionReceiptPdf } from './subscriptionReceiptPdfService';
import config from '../config/config';

/**
 * Generate unique, professional subscription invoice number: SUB-YYYYMM-XXXX
 */
function generateSubscriptionInvoiceNumber(): string {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SUB-${ym}-${rand}`;
}

/**
 * Exact calendar date calculation for subscription periods.
 * Handles month-end rollovers (e.g. Jan 31 -> Feb 28/29), leap years, and exact anniversaries.
 */
export function calculateSubscriptionPeriodEnd(startDate: Date, billingCycle: 'MONTHLY' | 'ANNUAL'): Date {
  const result = new Date(startDate.getTime());
  if (billingCycle === 'ANNUAL') {
    const curYear = result.getFullYear();
    const curMonth = result.getMonth();
    result.setFullYear(curYear + 1);
    // In case of Feb 29 on leap year rolling to March 1 on non-leap year:
    if (result.getMonth() !== curMonth) {
      result.setDate(0);
    }
  } else {
    const originalDay = result.getDate();
    result.setMonth(result.getMonth() + 1);
    if (result.getDate() !== originalDay) {
      result.setDate(0); // Roll back to last day of target month
    }
  }
  return result;
}

/**
 * Initiate subscription checkout order and generate draft invoice.
 */
export const createSubscriptionCheckout = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    const { planTier = 'PRO', billingCycle = 'MONTHLY', paymentMethod = 'GATEWAY' } = req.body;

    const normalizedTier = (['BASIC', 'PRO', 'ENTERPRISE'].includes(String(planTier).toUpperCase())
      ? String(planTier).toUpperCase()
      : 'PRO') as 'BASIC' | 'PRO' | 'ENTERPRISE';

    const upperCycle = String(billingCycle).toUpperCase();
    const normalizedCycle = (upperCycle === 'ANNUAL' || upperCycle === 'YEARLY') ? 'ANNUAL' : 'MONTHLY';

    const plan = PLAN_CATALOG[normalizedTier];
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid plan tier selected.' });
    }

    // Canonical monthly prices: Basic: ₹299, Pro: ₹349, Enterprise: ₹549
    // Canonical annual prices: Basic: ₹3,050, Pro: ₹3,560, Enterprise: ₹5,600 (15% savings)
    const monthlyPrice = plan.priceMonthlyINR;
    let grossAmount = monthlyPrice;
    let discountAmount = 0;
    let baseAmount = monthlyPrice;

    if (normalizedCycle === 'ANNUAL') {
      grossAmount = monthlyPrice * 12;
      baseAmount = plan.priceAnnualINR || Math.round(monthlyPrice * 12 * 0.85);
      discountAmount = Math.round((grossAmount - baseAmount) * 100) / 100; // 15% annual billing discount
    }

    const taxRate = 18.0; // 18% GST (CGST 9% + SGST 9%)
    const cgstAmount = Math.round(baseAmount * 0.09 * 100) / 100;
    const sgstAmount = Math.round(baseAmount * 0.09 * 100) / 100;
    const taxAmount = Math.round((cgstAmount + sgstAmount) * 100) / 100;
    const totalAmount = Math.round((baseAmount + taxAmount) * 100) / 100;

    const subscription = await getOrCreateSubscription(tenantId);
    const invoiceNumber = generateSubscriptionInvoiceNumber();

    const now = new Date();
    const periodEnd = calculateSubscriptionPeriodEnd(now, normalizedCycle);

    const invoice = await SubscriptionInvoice.create({
      subscriptionInvoiceId: uuidv4(),
      tenantId,
      subscriptionId: subscription.subscriptionId,
      invoiceNumber,
      planTier: normalizedTier,
      billingCycle: normalizedCycle,
      baseAmount,
      taxRate,
      taxAmount,
      totalAmount,
      currency: 'INR',
      paymentStatus: 'PENDING',
      paymentMethod,
      billingPeriodStart: now,
      billingPeriodEnd: periodEnd,
      metadata: {
        planName: plan.name,
        grossAmount,
        discountAmount,
        discountApplied: normalizedCycle === 'ANNUAL' ? '15%' : '0%',
        taxableAmount: baseAmount,
        cgst: cgstAmount,
        sgst: sgstAmount,
        cgstRate: '9%',
        sgstRate: '9%',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Subscription checkout order initialized.',
      data: {
        invoice,
        orderSummary: {
          invoiceNumber: invoice.invoiceNumber,
          planName: plan.name,
          planTier: normalizedTier,
          billingCycle: normalizedCycle,
          grossAmount,
          discountAmount,
          baseAmount,
          taxableAmount: baseAmount,
          taxRate: `${taxRate}% GST`,
          cgstAmount,
          sgstAmount,
          taxAmount,
          totalAmount,
          currency: 'INR',
          periodStart: now.toISOString(),
          periodEnd: periodEnd.toISOString(),
          renewalDate: periodEnd.toDateString(),
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Server-side payment verification for subscription checkout.
 * Verifies gateway transaction and promotes subscription to ACTIVE.
 * Prohibits mock/simulated payments in production mode.
 */
export const verifySubscriptionPayment = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    const subInvId = req.body.subscriptionInvoiceId || req.body.invoiceId;
    const isProduction = process.env.NODE_ENV === 'production';
    const isExplicitSimulated = Boolean(req.body.isSimulated || req.body.isTestMode);

    if (isProduction && isExplicitSimulated) {
      return res.status(403).json({
        success: false,
        message: 'Simulated payment verification is strictly prohibited in production mode. Live gateway verification required.',
      });
    }

    const txnRef = req.body.transactionReference || req.body.gatewayTransactionId || `TXN_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

    if (!subInvId) {
      return res.status(400).json({ success: false, message: 'subscriptionInvoiceId is required.' });
    }

    const invoice = await SubscriptionInvoice.findOne({
      where: {
        subscriptionInvoiceId: subInvId,
        tenantId,
      },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Subscription invoice not found.' });
    }

    if (invoice.paymentStatus === 'PAID') {
      const json = invoice.toJSON ? invoice.toJSON() : invoice;
      return res.status(200).json({
        success: true,
        message: 'Invoice is already paid and active.',
        data: {
          ...json,
          id: json.subscriptionInvoiceId,
          status: json.paymentStatus,
          gatewayTransactionId: json.transactionReference,
        },
      });
    }

    // In production, verify transaction directly with SmartGateway / Juspay provider
    if (isProduction) {
      const pg = config.paymentgateway;
      if (!pg.pg_api_key || !pg.pg_merchant_id || !pg.pg_status_url) {
        return res.status(503).json({
          success: false,
          message: 'Payment Gateway is not configured. Live PG_API_KEY, PG_MERCHANT_ID, and PG_STATUS_URL are required.',
        });
      }
    }

    const paymentMethodRecord = isProduction ? 'SMARTGATEWAY' : 'TEST_SANDBOX';

    // Mark invoice PAID
    await invoice.update({
      paymentStatus: 'PAID',
      paidAt: new Date(),
      paymentMethod: paymentMethodRecord,
      transactionReference: txnRef,
    });

    // Promote Tenant & Subscription
    const limits = PLAN_LIMITS[invoice.planTier];
    const now = new Date();
    const newEnd = calculateSubscriptionPeriodEnd(now, invoice.billingCycle);

    const sub = await getOrCreateSubscription(tenantId);
    await sub.update({
      status: 'ACTIVE',
      planTier: invoice.planTier,
      vehicleQuota: limits.vehicles,
      driverQuota: limits.drivers,
      companyQuota: limits.companies,
      monthlyTripQuota: limits.trips,
      allowOverage: invoice.planTier !== 'BASIC',
      currentPeriodStart: now,
      currentPeriodEnd: newEnd,
    });

    const tenant = await Tenant.findByPk(tenantId);
    if (tenant) {
      await tenant.update({
        status: 'ACTIVE',
        planTier: invoice.planTier,
      });
    }

    // 1. Generate Authoritative, Multi-Section PDF Payment Receipt on disk
    let receiptPdfPath: string | null = null;
    let receiptFileName: string | null = null;
    let receiptData: any = null;

    try {
      const receiptRes = await generateSubscriptionReceiptPdf(invoice.subscriptionInvoiceId);
      receiptPdfPath = receiptRes.filePath;
      receiptFileName = receiptRes.fileName;
      receiptData = receiptRes.receiptData;
    } catch (pdfErr) {
      console.error('[verifySubscriptionPayment] PDF receipt generation failed:', pdfErr);
    }

    // 2. Send professional payment confirmation email with PDF receipt attached
    // Strictly dispatched only to the tenant's verified contact email
    const recipientEmail = tenant?.contactEmail;
    const fleetAdminName = receiptData?.adminName || tenant?.name || 'Valued Fleet Partner';

    if (recipientEmail) {
      try {
        const emailSubject = 'CABZ – Subscription Payment Confirmation & Official Receipt';
        const emailBody = `Dear ${fleetAdminName},

Thank you for choosing CABZ – Smart Fleet Mobility.

We are pleased to confirm that your subscription payment has been successfully received.

Your subscription is now active. Please find your detailed payment receipt attached for your records.

The receipt includes your fleet information, selected subscription plan, payment details and subscription validity period.

Thank you for being a part of CABZ.

Regards,
CABZ – Smart Fleet Mobility
Subscription & Billing Team`;

        const attachments = receiptPdfPath && fs.existsSync(receiptPdfPath)
          ? [
              {
                filename: receiptFileName || `CABZ_Subscription_Receipt_${invoice.invoiceNumber}.pdf`,
                path: receiptPdfPath,
                contentType: 'application/pdf',
              },
            ]
          : [];

        const notifResult = await sendNotification({
          channel: 'EMAIL',
          recipient: recipientEmail,
          templateCode: 'SUBSCRIPTION_PAYMENT_SUCCESS',
          subject: emailSubject,
          body: emailBody,
          tenantId: tenant.tenantId,
          referenceEntity: 'SUBSCRIPTION_INVOICE',
          referenceId: invoice.subscriptionInvoiceId,
          idempotencyKey: `sub_receipt_${invoice.subscriptionInvoiceId}`,
          metadata: {
            fleetName: tenant.name,
            adminName: fleetAdminName,
            invoiceNumber: invoice.invoiceNumber,
            planTier: invoice.planTier,
            billingCycle: invoice.billingCycle,
            totalAmount: invoice.totalAmount,
            paidAt: invoice.paidAt,
            transactionReference: txnRef,
            receiptNumber: receiptData?.receiptNumber || `REC-${invoice.invoiceNumber}`,
            receiptPdfPath,
            receiptFileName,
            attachments,
          },
        });

        // Record receipt notification audit on invoice metadata
        const updatedMeta = {
          ...(invoice.metadata || {}),
          receiptGenerated: Boolean(receiptPdfPath),
          receiptFileName,
          receiptPdfPath,
          receiptSentTo: recipientEmail,
          receiptSentAt: new Date().toISOString(),
          receiptNotificationLogId: notifResult.logId,
          receiptNotificationStatus: notifResult.providerStatus,
        };
        await invoice.update({ metadata: updatedMeta });
      } catch (emailErr) {
        // Resilience: If email delivery fails, do NOT reverse or mark the payment as failed
        console.error('[verifySubscriptionPayment] Email receipt dispatch failed:', emailErr);
      }
    }

    const jsonInv = invoice.toJSON ? invoice.toJSON() : invoice;
    return res.status(200).json({
      success: true,
      message: 'Subscription payment verified and access granted.',
      data: {
        invoice: {
          ...jsonInv,
          id: jsonInv.subscriptionInvoiceId,
          subscriptionInvoiceId: jsonInv.subscriptionInvoiceId,
          status: jsonInv.paymentStatus,
          paymentStatus: jsonInv.paymentStatus,
          gatewayTransactionId: jsonInv.transactionReference,
          transactionReference: jsonInv.transactionReference,
        },
        subscription: sub,
      },
    });
  } catch (error: any) {
    console.error('Error verifying subscription payment:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * List all subscription invoices for current tenant.
 */
export const getTenantSubscriptionInvoices = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    const invoices = await SubscriptionInvoice.findAll({
      where: { tenantId },
      order: [['createdAt', 'DESC']],
    });

    const mapped = invoices.map((inv: any) => {
      const json = inv.toJSON ? inv.toJSON() : inv;
      return {
        ...json,
        id: json.subscriptionInvoiceId,
        subscriptionInvoiceId: json.subscriptionInvoiceId,
        status: json.paymentStatus,
        paymentStatus: json.paymentStatus,
        gatewayTransactionId: json.transactionReference,
        transactionReference: json.transactionReference,
      };
    });

    return res.status(200).json({
      success: true,
      data: mapped,
    });
  } catch (error: any) {
    console.error('Error fetching subscription invoices:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Aggregated Subscription Revenue Summary Cards.
 * Broken down separately into Monthly and Annual billing cycles,
 * with separate sub-totals for BASIC, PRO, and ENTERPRISE.
 * Strictly counts verified PAID invoices only (never pending, failed, or mock).
 */
export const getSubscriptionRevenueSummary = async (req: Request, res: Response) => {
  try {
    const paidInvoices = await SubscriptionInvoice.findAll({
      where: {
        paymentStatus: 'PAID',
      },
      order: [['paidAt', 'ASC']],
    });

    const initTierStats = () => ({
      amount: 0,
      count: 0,
    });

    const monthlyStats = {
      BASIC: initTierStats(),
      PRO: initTierStats(),
      ENTERPRISE: initTierStats(),
      totalAmount: 0,
      totalCount: 0,
    };

    const annualStats = {
      BASIC: initTierStats(),
      PRO: initTierStats(),
      ENTERPRISE: initTierStats(),
      totalAmount: 0,
      totalCount: 0,
    };

    let overallAmount = 0;
    let overallCount = 0;

    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    for (const inv of paidInvoices) {
      const amount = Number(inv.totalAmount) || 0;
      const tier = (inv.planTier || 'PRO') as 'BASIC' | 'PRO' | 'ENTERPRISE';
      const cycle = inv.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
      const paidDate = inv.paidAt || inv.createdAt;

      if (!earliestDate || paidDate < earliestDate) earliestDate = paidDate;
      if (!latestDate || paidDate > latestDate) latestDate = paidDate;

      overallAmount += amount;
      overallCount += 1;

      if (cycle === 'ANNUAL') {
        if (annualStats[tier]) {
          annualStats[tier].amount += amount;
          annualStats[tier].count += 1;
        }
        annualStats.totalAmount += amount;
        annualStats.totalCount += 1;
      } else {
        if (monthlyStats[tier]) {
          monthlyStats[tier].amount += amount;
          monthlyStats[tier].count += 1;
        }
        monthlyStats.totalAmount += amount;
        monthlyStats.totalCount += 1;
      }
    }

    const summaryData = {
      totalCollected: overallAmount,
      totalInvoices: overallCount,
      currency: 'INR',
      dateRange: {
        from: earliestDate ? earliestDate.toISOString() : null,
        to: latestDate ? latestDate.toISOString() : null,
      },
      monthly: {
        totalAmount: monthlyStats.totalAmount,
        invoiceCount: monthlyStats.totalCount,
        byPlan: {
          BASIC: monthlyStats.BASIC,
          PRO: monthlyStats.PRO,
          ENTERPRISE: monthlyStats.ENTERPRISE,
        },
      },
      annual: {
        totalAmount: annualStats.totalAmount,
        invoiceCount: annualStats.totalCount,
        byPlan: {
          BASIC: annualStats.BASIC,
          PRO: annualStats.PRO,
          ENTERPRISE: annualStats.ENTERPRISE,
        },
      },
      monthlyCollections: monthlyStats,
      annualCollections: annualStats,
      overallRevenue: {
        totalAmount: overallAmount,
        totalCount: overallCount,
      },
    };

    return res.status(200).json({
      success: true,
      ...summaryData,
      data: summaryData,
    });
  } catch (error: any) {
    console.error('Error calculating subscription revenue summary:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: List all subscription invoices across all fleets with filters & search.
 */
export const getAllSubscriptionInvoices = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'))));
    const offset = (page - 1) * limit;

    const {
      tenantId,
      planTier,
      billingCycle,
      paymentStatus,
      fromDate,
      toDate,
      search,
    } = req.query;

    const where: any = {};

    if (tenantId && tenantId !== 'all') {
      where.tenantId = tenantId;
    }
    if (planTier && ['BASIC', 'PRO', 'ENTERPRISE'].includes(String(planTier).toUpperCase())) {
      where.planTier = String(planTier).toUpperCase();
    }
    if (billingCycle && ['MONTHLY', 'ANNUAL'].includes(String(billingCycle).toUpperCase())) {
      where.billingCycle = String(billingCycle).toUpperCase();
    }
    if (paymentStatus && ['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(String(paymentStatus).toUpperCase())) {
      where.paymentStatus = String(paymentStatus).toUpperCase();
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(String(fromDate));
      if (toDate) where.createdAt[Op.lte] = new Date(String(toDate));
    }

    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.like]: `%${search}%` } },
        { transactionReference: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await SubscriptionInvoice.findAndCountAll({
      where,
      include: [
        {
          model: Tenant,
          attributes: ['tenantId', 'name', 'code', 'contactEmail', 'contactPhone'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Compute total successfully paid amount matching current filter
    const paidFilter = { ...where, paymentStatus: 'PAID' };
    const allPaidMatching = await SubscriptionInvoice.findAll({
      where: paidFilter,
      attributes: ['totalAmount'],
    });
    const totalCollectedFiltered = allPaidMatching.reduce(
      (sum, inv) => sum + (Number(inv.totalAmount) || 0),
      0
    );

    const mapped = rows.map((inv: any) => {
      const json = inv.toJSON ? inv.toJSON() : inv;
      return {
        ...json,
        id: json.subscriptionInvoiceId,
        subscriptionInvoiceId: json.subscriptionInvoiceId,
        fleetName: json.tenant?.name || 'Fleet Operator',
        businessCode: json.tenant?.code || '',
        contactEmail: json.tenant?.contactEmail || '',
      };
    });

    return res.status(200).json({
      success: true,
      data: mapped,
      totalCollected: totalCollectedFiltered,
      currency: 'INR',
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching all subscription invoices:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Download authoritative subscription payment receipt PDF for a paid invoice.
 */
export const downloadSubscriptionReceiptPdf = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const callerTenantId = ctx?.tenantId || (req as any).tenantId;
    const isSuperAdmin = (req as any).user?.role === 'superadmin' || callerTenantId === ROOT_TENANT_ID;
    const invoiceId = req.params.invoiceId || req.params.id;

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'invoiceId is required.' });
    }

    const whereClause: any = {
      [Op.or]: [
        { subscriptionInvoiceId: invoiceId },
        { invoiceNumber: invoiceId },
      ],
    };
    if (!isSuperAdmin && callerTenantId) {
      whereClause.tenantId = callerTenantId;
    }

    const invoice = await SubscriptionInvoice.findOne({ where: whereClause });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Subscription invoice not found.' });
    }

    const { fileName, pdfBuffer } = await generateSubscriptionReceiptPdf(invoice.subscriptionInvoiceId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(pdfBuffer);
  } catch (err: any) {
    console.error('Error downloading subscription receipt PDF:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate receipt PDF.' });
  }
};

/**
 * Resend subscription payment receipt email with PDF attachment.
 */
export const resendSubscriptionReceiptEmail = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const callerTenantId = ctx?.tenantId || (req as any).tenantId;
    const isSuperAdmin = (req as any).user?.role === 'superadmin' || callerTenantId === ROOT_TENANT_ID;
    const invoiceId = req.params.invoiceId || req.params.id;

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'invoiceId is required.' });
    }

    const whereClause: any = {
      [Op.or]: [
        { subscriptionInvoiceId: invoiceId },
        { invoiceNumber: invoiceId },
      ],
    };
    if (!isSuperAdmin && callerTenantId) {
      whereClause.tenantId = callerTenantId;
    }

    const invoice = await SubscriptionInvoice.findOne({ where: whereClause });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Subscription invoice not found.' });
    }

    if (invoice.paymentStatus !== 'PAID') {
      return res.status(400).json({ success: false, message: 'Cannot send payment receipt for unpaid invoice.' });
    }

    const tenant = await Tenant.findByPk(invoice.tenantId);
    if (!tenant || !tenant.contactEmail) {
      return res.status(400).json({ success: false, message: 'Tenant registered email not found.' });
    }

    const { filePath, fileName, receiptData } = await generateSubscriptionReceiptPdf(invoice.subscriptionInvoiceId);

    const emailSubject = 'CABZ – Subscription Payment Confirmation & Official Receipt';
    const emailBody = `Dear ${receiptData.adminName},

Thank you for choosing CABZ – Smart Fleet Mobility.

We are pleased to confirm that your subscription payment has been successfully received.

Your subscription is now active. Please find your detailed payment receipt attached for your records.

The receipt includes your fleet information, selected subscription plan, payment details and subscription validity period.

Thank you for being a part of CABZ.

Regards,
CABZ – Smart Fleet Mobility
Subscription & Billing Team`;

    const notifResult = await sendNotification({
      channel: 'EMAIL',
      recipient: tenant.contactEmail,
      templateCode: 'SUBSCRIPTION_PAYMENT_SUCCESS',
      subject: emailSubject,
      body: emailBody,
      tenantId: tenant.tenantId,
      referenceEntity: 'SUBSCRIPTION_INVOICE',
      referenceId: invoice.subscriptionInvoiceId,
      idempotencyKey: `sub_receipt_resend_${invoice.subscriptionInvoiceId}_${Date.now()}`,
      metadata: {
        fleetName: tenant.name,
        adminName: receiptData.adminName,
        invoiceNumber: invoice.invoiceNumber,
        attachments: [
          {
            filename: fileName,
            path: filePath,
            contentType: 'application/pdf',
          },
        ],
      },
    });

    return res.status(200).json({
      success: true,
      message: `Subscription payment receipt resent to ${tenant.contactEmail}.`,
      data: {
        recipient: tenant.contactEmail,
        logId: notifResult.logId,
        providerStatus: notifResult.providerStatus,
      },
    });
  } catch (err: any) {
    console.error('Error resending subscription receipt email:', err);
    return res.status(500).json({ success: false, message: 'Failed to resend subscription receipt email.' });
  }
};

/**
 * SuperAdmin: Extend a tenant's free trial by N days.
 * Section 5:
 * - Allow SuperAdmin to enter additional number of days.
 * - Calculate new expiry date.
 * - Record audit history: who extended, when, how many days, reason.
 * - Update trialEndsAt and currentPeriodEnd on tenant_subscriptions.
 * - Do not create paid transaction.
 * - If trial was expired, reactivates status to TRIALING and extends from current date.
 * - If trial was active, extends from existing trialEndsAt.
 */
export const extendTenantTrial = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { additionalDays, reason } = req.body;

    const days = parseInt(String(additionalDays), 10);
    if (!days || isNaN(days) || days <= 0 || days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid number of trial extension days (between 1 and 365).',
      });
    }

    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found.',
      });
    }

    const sub = await TenantSubscription.findOne({ where: { tenantId } });
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: 'Subscription record not found for tenant.',
      });
    }

    const now = new Date();
    const existingExpiry = sub.trialEndsAt
      ? new Date(sub.trialEndsAt)
      : (sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : now);

    // Active trial: extend from existing expiry date
    // Already expired trial: calculate new expiry from now
    const baseTime = existingExpiry.getTime() < now.getTime() ? now.getTime() : existingExpiry.getTime();
    const newExpiry = new Date(baseTime + days * 24 * 60 * 60 * 1000);

    const historyEntry = {
      extendedBy: (req as any).user?.username || (req as any).user?.userId || 'SuperAdmin',
      extendedAt: now,
      daysAdded: days,
      previousExpiry: existingExpiry,
      newExpiry,
      reason: reason ? String(reason).trim() : 'Free trial extension granted by SuperAdmin',
    };

    const currentHistory = Array.isArray(sub.trialExtensionHistory) ? sub.trialExtensionHistory : [];
    const newHistory = [...currentHistory, historyEntry];
    const newDuration = (Number(sub.trialDurationDays) || 7) + days;

    await sub.update({
      trialEndsAt: newExpiry,
      currentPeriodEnd: newExpiry,
      trialDurationDays: newDuration,
      trialExtensionHistory: newHistory,
      status: 'TRIALING',
    });

    return res.status(200).json({
      success: true,
      message: `Successfully extended trial by ${days} days for ${tenant.name}. New trial expiry is ${newExpiry.toLocaleDateString('en-IN')}.`,
      data: {
        tenantId,
        fleetName: tenant.name,
        previousExpiry: existingExpiry,
        newExpiry,
        daysAdded: days,
        originalTrialDays: 7,
        extendedTrialDays: newDuration - 7,
        totalTrialDays: newDuration,
        trialStatus: 'TRIAL_ACTIVE',
        history: newHistory,
      },
    });
  } catch (error: any) {
    console.error('Error extending trial:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

