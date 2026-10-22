import { Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { TenantUsageMeter } from '../models/tenantUsageMeter';
import { TenantActivationToken } from '../models/tenantActivationToken';
import { Vehicle } from '../models/vehicle';
import { Drivers } from '../models/drivers';
import { Company } from '../models/company';
import { Employee } from '../models/employee';
import { Booking } from '../models/booking';
import { Invoice } from '../models/invoice';
import { MonthlyInvoice } from '../models/monthlyInvoice';
import { OnCallInvoice } from '../models/onCallInvoice';
import { SubscriptionInvoice } from '../models/subscriptionInvoice';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { PLAN_LIMITS, PLAN_CATALOG, getOrCreateSubscription } from './quotaService';
import { sendNotification } from './notificationService';
import config from '../config/config';

const WEB_BASE_URL = config.baseurl?.webbaseurl || 'http://localhost:3000';

/**
 * List all tenants (Platform SuperAdmin only).
 */
export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await Tenant.findAll({
      include: [{ model: TenantSubscription }],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      tenants,
      data: tenants,
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Provision a new SaaS tenant fleet operator (Platform SuperAdmin).
 */
export const createTenant = async (req: Request, res: Response) => {
  try {
    const {
      name,
      code,
      subdomain,
      customDomain,
      planTier = 'BASIC',
      contactEmail,
      contactPhone,
      brandingTokens,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Tenant name and code are required.',
      });
    }

    const cleanCode = code.toUpperCase().trim();

    // Check duplicate code or subdomain
    const existingCode = await Tenant.findOne({ where: { code: cleanCode } });
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: `Tenant with code '${cleanCode}' already exists.`,
      });
    }

    if (subdomain) {
      const existingSubdomain = await Tenant.findOne({ where: { subdomain: subdomain.toLowerCase().trim() } });
      if (existingSubdomain) {
        return res.status(409).json({
          success: false,
          message: `Subdomain '${subdomain}' is already taken.`,
        });
      }
    }

    const tenantId = uuidv4();
    const normalizedTier = (planTier.toUpperCase() in PLAN_LIMITS ? planTier.toUpperCase() : 'BASIC') as
      | 'BASIC'
      | 'PRO'
      | 'ENTERPRISE';

    const limits = PLAN_LIMITS[normalizedTier];

    const newTenant = await Tenant.create({
      tenantId,
      name,
      code: cleanCode,
      subdomain: subdomain ? subdomain.toLowerCase().trim() : undefined,
      customDomain: customDomain ? customDomain.toLowerCase().trim() : undefined,
      planTier: normalizedTier,
      status: 'ACTIVE',
      contactEmail,
      contactPhone,
      brandingTokens: brandingTokens || {
        primaryColor: '#C04E24',
        portalTitle: `${name} Mobility Portal`,
      },
    });

    const subscription = await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId,
      planTier: normalizedTier,
      status: 'ACTIVE',
      vehicleQuota: limits.vehicles,
      driverQuota: limits.drivers,
      companyQuota: limits.companies,
      monthlyTripQuota: limits.trips,
      allowOverage: normalizedTier !== 'BASIC',
      monthlyOverageSpendCap: normalizedTier === 'PRO' ? 5000 : 1000,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    let rawToken: string | undefined;
    let activationUrl: string | undefined;

    // Dispatches 24h expiring activation link so operator sets their own password
    if (contactEmail && contactEmail.includes('@')) {
      rawToken = `act_${crypto.randomBytes(32).toString('hex')}`;
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await TenantActivationToken.create({
        tokenId: uuidv4(),
        tenantId,
        adminEmail: contactEmail.trim().toLowerCase(),
        adminName: name,
        tokenHash,
        expiresAt,
        isRevoked: false,
      });

      activationUrl = `${WEB_BASE_URL}/activate-account?token=${rawToken}`;
      await sendNotification({
        channel: 'EMAIL',
        recipient: contactEmail.trim().toLowerCase(),
        templateCode: 'TENANT_ADMIN_ACTIVATION_LINK',
        subject: `🎉 Your Fleet Account Has Been Provisioned: Set Up Your Password`,
        body: `Dear ${name} Administrator,\n\nYour fleet operator account on Grace Cabs Mobility Platform has been provisioned.\n\nPlease click the secure activation link below to set your administrator password and access your dashboard:\n\n${activationUrl}\n\nNote: This link will expire in 24 hours.\n\nBest regards,\nGrace Cabs SaaS Team`,
        referenceEntity: 'TENANT',
        referenceId: tenantId,
        metadata: { tenantId, activationUrl, actionText: 'Set Password & Activate' },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Tenant provisioned successfully and activation link dispatched.',
      tenant: newTenant,
      subscription,
      data: {
        tenant: newTenant,
        subscription,
        rawToken,
        activationUrl,
      },
    });
  } catch (error) {
    console.error('Error provisioning tenant:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Get tenant details and active quotas.
 */
export const getTenantById = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const tenant = await Tenant.findByPk(tenantId, {
      include: [{ model: TenantSubscription }],
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    return res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Get centralized SaaS subscription plans catalog with pricing and quotas.
 */
export const getSubscriptionPlans = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    plans: Object.values(PLAN_CATALOG),
    data: Object.values(PLAN_CATALOG),
  });
};

/**
 * Update tenant subscription plan tier, quotas, or lifecycle status.
 */
export const updateTenantSubscription = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const {
      planTier,
      status,
      vehicleQuota,
      driverQuota,
      companyQuota,
      allowOverage,
      monthlyOverageSpendCap,
      currentPeriodStart,
      currentPeriodEnd,
      trialEndsAt,
    } = req.body;

    const sub = await getOrCreateSubscription(tenantId);
    const tenant = await Tenant.findByPk(tenantId);

    const updatePayload: any = {};
    if (planTier && planTier.toUpperCase() in PLAN_LIMITS) {
      const tier = planTier.toUpperCase() as 'BASIC' | 'PRO' | 'ENTERPRISE';
      updatePayload.planTier = tier;
      const defaultLimits = PLAN_LIMITS[tier];
      updatePayload.vehicleQuota = vehicleQuota !== undefined ? vehicleQuota : defaultLimits.vehicles;
      updatePayload.driverQuota = driverQuota !== undefined ? driverQuota : defaultLimits.drivers;
      updatePayload.companyQuota = companyQuota !== undefined ? companyQuota : defaultLimits.companies;
      updatePayload.monthlyTripQuota = defaultLimits.trips;

      if (tenant) {
        await tenant.update({ planTier: tier });
      }
    }

    if (status) {
      updatePayload.status = status;
      if (tenant) {
        await tenant.update({ status });
      }
    }

    if (vehicleQuota !== undefined && !planTier) updatePayload.vehicleQuota = Number(vehicleQuota);
    if (driverQuota !== undefined && !planTier) updatePayload.driverQuota = Number(driverQuota);
    if (companyQuota !== undefined && !planTier) updatePayload.companyQuota = Number(companyQuota);
    if (allowOverage !== undefined) updatePayload.allowOverage = Boolean(allowOverage);
    if (monthlyOverageSpendCap !== undefined) updatePayload.monthlyOverageSpendCap = Number(monthlyOverageSpendCap);
    if (currentPeriodStart) updatePayload.currentPeriodStart = new Date(currentPeriodStart);
    if (currentPeriodEnd) updatePayload.currentPeriodEnd = new Date(currentPeriodEnd);
    if (trialEndsAt) updatePayload.trialEndsAt = new Date(trialEndsAt);

    await sub.update(updatePayload);

    return res.status(200).json({
      success: true,
      message: 'Subscription updated successfully.',
      subscription: sub,
      data: sub,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Renew tenant subscription.
 * Extends period by specified days, sets status to ACTIVE.
 */
export const renewTenantSubscription = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { durationDays = 30, paymentReference } = req.body;

    const sub = await getOrCreateSubscription(tenantId);
    const tenant = await Tenant.findByPk(tenantId);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const now = new Date();
    const currentEnd = sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > now
      ? new Date(sub.currentPeriodEnd)
      : now;

    const newStart = now;
    const newEnd = new Date(currentEnd.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000);

    await sub.update({
      status: 'ACTIVE',
      currentPeriodStart: newStart,
      currentPeriodEnd: newEnd,
    });

    await tenant.update({ status: 'ACTIVE' });

    return res.status(200).json({
      success: true,
      message: `Tenant subscription renewed successfully for ${durationDays} days.`,
      data: {
        tenantId,
        status: 'ACTIVE',
        currentPeriodStart: newStart,
        currentPeriodEnd: newEnd,
        paymentReference: paymentReference || null,
        subscription: sub,
      },
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Current tenant profile for logged-in operator.
 */
export const getCurrentTenantProfile = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    let tenant = await Tenant.findByPk(tenantId, {
      include: [{ model: TenantSubscription }],
    });

    if (!tenant) {
      // Seed root tenant on the fly if not yet in database
      tenant = await Tenant.create({
        tenantId: ROOT_TENANT_ID,
        name: 'Grace Cabs Primary',
        code: 'GC',
        subdomain: 'gracecabs',
        status: 'ACTIVE',
        planTier: 'PRO',
        contactEmail: 'support@gracecabs.in',
        brandingTokens: {
          primaryColor: '#0284c7',
          portalTitle: 'Grace Cabs Enterprise Mobility',
        },
      });
      await getOrCreateSubscription(ROOT_TENANT_ID);
      tenant = await Tenant.findByPk(ROOT_TENANT_ID, {
        include: [{ model: TenantSubscription }],
      });
    }

    // Fetch monthly telemetry metrics
    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const usageMeters = await TenantUsageMeter.findAll({
      where: { tenantId, billingMonth },
    });

    return res.status(200).json({
      success: true,
      tenant,
      data: {
        tenant,
        billingMonth,
        usage: usageMeters,
      },
    });
  } catch (error) {
    console.error('Error fetching tenant profile:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Update current tenant branding tokens.
 */
export const updateCurrentTenantBranding = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const { brandingTokens, contactEmail, contactPhone } = req.body;

    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    await tenant.update({
      brandingTokens: {
        ...(tenant.brandingTokens || {}),
        ...(brandingTokens || {}),
      },
      contactEmail: contactEmail || tenant.contactEmail,
      contactPhone: contactPhone || tenant.contactPhone,
    });

    return res.status(200).json({
      success: true,
      message: 'Branding updated successfully.',
      data: tenant,
    });
  } catch (error) {
    console.error('Error updating tenant branding:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Tenant-Specific Fleet Admin Dashboard Overview.
 * Applies authenticated tenant scoping on the server.
 * Returns profile, vehicle/driver/company quotas, booking pipelines, and subscription status.
 */
export const getFleetDashboardOverview = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    // 1. Tenant & Subscription Profile
    let tenant = await Tenant.findByPk(tenantId, {
      include: [{ model: TenantSubscription }],
    });

    if (!tenant) {
      tenant = await Tenant.findByPk(ROOT_TENANT_ID, {
        include: [{ model: TenantSubscription }],
      });
    }

    const sub = tenant?.subscription || (await getOrCreateSubscription(tenantId));
    const limits = PLAN_LIMITS[sub.planTier || 'PRO'];

    // Subscription Days & Alerts Calculation
    const now = new Date();
    const end = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : new Date(now.getTime() + 30 * 86400000);
    const diffMs = end.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const isRenewalWarning = daysRemaining <= 2 && daysRemaining >= 0;
    const isGracePeriod = daysRemaining < 0 && daysRemaining >= -3;
    const isSuspended = sub.status === 'SUSPENDED' || daysRemaining < -3;

    // 2. Strict Tenant-Scoped Resource Counts
    const [vehicleCount, driverCount, companyCount, employeeCount] = await Promise.all([
      Vehicle.count({ where: { tenantId } }),
      Drivers.count({ where: { tenantId } }),
      Company.count({ where: { tenantId } }),
      Employee.count({ where: { tenantId } }),
    ]);

    // 3. Strict Tenant-Scoped Booking Pipeline
    const [confirmPending, closePending, paymentPending, completed, totalBookings] = await Promise.all([
      Booking.count({ where: { tenantId, status: 'ConfirmPending' } }),
      Booking.count({ where: { tenantId, status: 'ClosePending' } }),
      Booking.count({ where: { tenantId, status: 'PaymentPending' } }),
      Booking.count({ where: { tenantId, status: 'Completed' } }),
      Booking.count({ where: { tenantId } }),
    ]);

    // 4. Strict Tenant-Scoped Invoices Breakdown
    const [singleTripInvoices, monthlyInvoices, onCallInvoices, subscriptionInvoices] = await Promise.all([
      Invoice.count({ where: { tenantId } }),
      MonthlyInvoice.count({ where: { tenantId } }),
      OnCallInvoice.count({ where: { tenantId } }),
      SubscriptionInvoice.findAll({
        where: { tenantId },
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        tenant: {
          tenantId: tenant?.tenantId,
          name: tenant?.name,
          code: tenant?.code,
          contactEmail: tenant?.contactEmail,
          contactPhone: tenant?.contactPhone,
          brandingTokens: tenant?.brandingTokens,
        },
        subscription: {
          planTier: sub.planTier,
          status: isSuspended ? 'SUSPENDED' : isGracePeriod ? 'PAST_DUE' : sub.status,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          daysRemaining,
          isRenewalWarning,
          isGracePeriod,
          isSuspended,
          renewalUrl: '/admin/billing',
        },
        quotas: {
          vehicles: {
            current: vehicleCount,
            limit: limits.vehicles,
            percent: Math.min(100, Math.round((vehicleCount / limits.vehicles) * 100)),
          },
          drivers: {
            current: driverCount,
            limit: limits.drivers,
            percent: Math.min(100, Math.round((driverCount / limits.drivers) * 100)),
          },
          companies: {
            current: companyCount,
            limit: limits.companies,
            percent: Math.min(100, Math.round((companyCount / limits.companies) * 100)),
          },
          employees: {
            current: employeeCount,
            limit: limits.employees || 25,
            percent: Math.min(100, Math.round((employeeCount / (limits.employees || 25)) * 100)),
          },
        },
        pipeline: {
          confirmPending,
          closePending,
          paymentPending,
          completed,
          totalBookings,
        },
        invoices: {
          singleTrip: singleTripInvoices,
          monthly: monthlyInvoices,
          onCall: onCallInvoices,
          recentSubscriptions: subscriptionInvoices,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching fleet dashboard overview:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

