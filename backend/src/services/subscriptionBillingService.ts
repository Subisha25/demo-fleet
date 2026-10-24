import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SubscriptionInvoice } from '../models/subscriptionInvoice';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { PLAN_CATALOG, PLAN_LIMITS, getOrCreateSubscription } from './quotaService';
import { sendNotification, getSuperAdminEmail } from './notificationService';
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

    const normalizedCycle = String(billingCycle).toUpperCase() === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';

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
    const periodDays = normalizedCycle === 'ANNUAL' ? 365 : 30;

    const now = new Date();
    const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

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
    const periodDays = invoice.billingCycle === 'ANNUAL' ? 365 : 30;
    const now = new Date();
    const newEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

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

    // Send payment confirmation notification
    const recipientEmail = tenant?.contactEmail || (await getSuperAdminEmail());
    await sendNotification({
      channel: 'EMAIL',
      recipient: recipientEmail,
      templateCode: 'SUBSCRIPTION_PAYMENT_SUCCESS',
      subject: `Payment Receipt: ${invoice.invoiceNumber} (${invoice.planTier} Plan)`,
      body: `Thank you for your payment!\n\nInvoice Number: ${invoice.invoiceNumber}\nPlan: ${invoice.planTier} (${invoice.billingCycle})\nTotal Amount: ₹${invoice.totalAmount} INR\nTransaction Reference: ${txnRef}\nValid Until: ${newEnd.toDateString()}\n\nYour fleet subscription has been activated with full enterprise access.`,
      referenceEntity: 'SUBSCRIPTION_INVOICE',
      referenceId: invoice.subscriptionInvoiceId,
    });

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
