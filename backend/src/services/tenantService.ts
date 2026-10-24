import { Request, Response } from 'express';
import { Op } from 'sequelize';
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
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
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
    const ctx = getTenantContext();

    if (!ctx?.isPlatformSuperAdmin && ctx?.tenantId !== tenantId) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied to tenant profile.' });
    }

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
    const isPlatformAdmin = !!ctx?.isPlatformSuperAdmin;
    const targetTenantId = (isPlatformAdmin && req.body.tenantId)
      ? req.body.tenantId
      : (ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID);

    const { brandingTokens, contactEmail, contactPhone } = req.body;

    const tenant = await Tenant.findByPk(targetTenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    // Validate header color format if provided
    if (brandingTokens?.headerColor && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(brandingTokens.headerColor)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid headerColor format. Expected hex color like #C04E24.',
      });
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
 * Upload fleet logo for current tenant (or target fleet if SuperAdmin).
 */
export const uploadCurrentTenantLogo = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).role;
    if (userRole && ['user', 'driver'].includes(String(userRole).toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Not Authorized: Staff permissions required to upload fleet logo.' });
    }

    const ctx = getTenantContext();
    const isPlatformAdmin = !!ctx?.isPlatformSuperAdmin;
    const targetTenantId = (isPlatformAdmin && req.body.tenantId)
      ? req.body.tenantId
      : (ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo file uploaded.' });
    }

    const tenant = await Tenant.findByPk(targetTenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const logoUrl = `/uploads/fleetLogo/${req.file.filename}`;
    const brandingTokens = {
      ...(tenant.brandingTokens || {}),
      logoUrl,
    };

    await tenant.update({ brandingTokens });

    return res.status(200).json({
      success: true,
      message: 'Fleet logo uploaded and saved successfully.',
      logoUrl,
      tenant,
    });
  } catch (error: any) {
    console.error('Error uploading fleet logo:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin In-App Notifications for inbound fleet registrations.
 */
export const getRegistrationNotifications = async (req: Request, res: Response) => {
  try {
    const unreadCount = await TenantRegistrationRequest.count({
      where: { status: 'PENDING', isNotificationRead: false },
    });

    const recentRequests = await TenantRegistrationRequest.findAll({
      order: [['createdAt', 'DESC']],
      limit: 15,
    });

    const notifications = recentRequests.map((r: any) => ({
      requestId: r.requestId,
      fleetName: r.fleetName,
      businessCode: r.businessCode,
      ownerName: r.ownerName,
      contactEmail: r.contactEmail,
      contactPhone: r.contactPhone,
      requestedPlanTier: r.requestedPlanTier,
      billingCycle: r.billingCycle,
      city: r.city,
      state: r.state,
      status: r.status,
      createdAt: r.createdAt,
      isRead: Boolean(r.isNotificationRead),
    }));

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (err: any) {
    console.error('Error fetching registration notifications:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Mark a single registration notification as read.
 */
export const markRegistrationNotificationRead = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const record = await TenantRegistrationRequest.findByPk(requestId);
    if (record) {
      await record.update({ isNotificationRead: true });
    }
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Mark all pending registration notifications as read.
 */
export const markAllRegistrationNotificationsRead = async (req: Request, res: Response) => {
  try {
    await TenantRegistrationRequest.update(
      { isNotificationRead: true },
      { where: { isNotificationRead: false } }
    );
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
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
    const isPlatformSuperAdmin = !!ctx?.isPlatformSuperAdmin;
    const isAllFleets = isPlatformSuperAdmin && (!ctx?.selectedTenantId || ctx?.selectedTenantId === 'all');

    // Determine target tenant ID for individual fleet view
    const targetTenantId = isAllFleets
      ? ROOT_TENANT_ID
      : (isPlatformSuperAdmin ? (ctx?.selectedTenantId || ROOT_TENANT_ID) : (ctx?.tenantId || ROOT_TENANT_ID));

    const whereTenant: Record<string, any> = isAllFleets
      ? {}
      : (targetTenantId === ROOT_TENANT_ID
        ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
        : { tenantId: targetTenantId });

    // 1. Tenant & Subscription Profile
    let tenant = await Tenant.findByPk(targetTenantId, {
      include: [{ model: TenantSubscription }],
    });

    if (!tenant) {
      tenant = await Tenant.findByPk(ROOT_TENANT_ID, {
        include: [{ model: TenantSubscription }],
      });
    }

    const sub = tenant?.subscription || (await getOrCreateSubscription(targetTenantId));
    const limits = PLAN_LIMITS[sub.planTier || 'PRO'];

    // Subscription Days & Alerts Calculation
    const now = new Date();
    const end = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : new Date(now.getTime() + 30 * 86400000);
    const diffMs = end.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const isRenewalWarning = daysRemaining <= 2 && daysRemaining >= 0;
    const isGracePeriod = daysRemaining < 0 && daysRemaining >= -3;
    const isSuspended = sub.status === 'SUSPENDED' || daysRemaining < -3;

    // 2. Resource Counts (platform aggregated if isAllFleets, else scoped to target tenant)
    const [vehicleCount, driverCount, companyCount, employeeCount, activeFleetsCount] = await Promise.all([
      Vehicle.count({ where: whereTenant }),
      Drivers.count({ where: whereTenant }),
      Company.count({ where: whereTenant }),
      Employee.count({ where: whereTenant }),
      Tenant.count({ where: { status: 'ACTIVE' } }),
    ]);

    // 3. Booking Pipeline
    const [confirmPending, closePending, paymentPending, completed, totalBookings] = await Promise.all([
      Booking.count({ where: { ...whereTenant, confirmStatus: '0' } }),
      Booking.count({ where: { ...whereTenant, confirmStatus: '1' } }),
      Booking.count({ where: { ...whereTenant, confirmStatus: '2' } }),
      Booking.count({ where: { ...whereTenant, confirmStatus: '3' } }),
      Booking.count({ where: whereTenant }),
    ]);

    // 4. Invoices Breakdown
    const [singleTripInvoices, monthlyInvoices, onCallInvoices, subscriptionInvoices] = await Promise.all([
      Invoice.count({ where: whereTenant }),
      MonthlyInvoice.count({ where: whereTenant }),
      OnCallInvoice.count({ where: whereTenant }),
      SubscriptionInvoice.findAll({
        where: isAllFleets ? {} : { tenantId: targetTenantId },
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        isPlatformSuperAdmin,
        isAllFleets,
        selectedTenantId: ctx?.selectedTenantId || (isPlatformSuperAdmin ? 'all' : ctx?.tenantId),
        activeFleetsCount: isPlatformSuperAdmin ? activeFleetsCount : undefined,
        tenant: isAllFleets
          ? {
              tenantId: 'all',
              name: 'Platform-Wide Aggregated Operations',
              code: 'ALL_FLEETS',
              contactEmail: 'subisha2002.m@gmail.com',
              contactPhone: '9003241571',
              brandingTokens: {
                primaryColor: '#C04E24',
                portalTitle: 'Platform Fleet Aggregator',
              },
            }
          : {
              tenantId: tenant?.tenantId,
              name: tenant?.name,
              code: tenant?.code,
              contactEmail: tenant?.contactEmail,
              contactPhone: tenant?.contactPhone,
              brandingTokens: tenant?.brandingTokens,
            },
        subscription: {
          planTier: isAllFleets ? 'ENTERPRISE' : sub.planTier,
          status: isSuspended ? 'SUSPENDED' : isGracePeriod ? 'PAST_DUE' : sub.status,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          daysRemaining,
          isRenewalWarning: isAllFleets ? false : isRenewalWarning,
          isGracePeriod: isAllFleets ? false : isGracePeriod,
          isSuspended: isAllFleets ? false : isSuspended,
          renewalUrl: '/admin/billing',
        },
        quotas: {
          vehicles: {
            current: vehicleCount,
            limit: isAllFleets ? 999999 : limits.vehicles,
            percent: isAllFleets ? 100 : Math.min(100, Math.round((vehicleCount / limits.vehicles) * 100)),
          },
          drivers: {
            current: driverCount,
            limit: isAllFleets ? 999999 : limits.drivers,
            percent: isAllFleets ? 100 : Math.min(100, Math.round((driverCount / limits.drivers) * 100)),
          },
          companies: {
            current: companyCount,
            limit: isAllFleets ? 999999 : limits.companies,
            percent: isAllFleets ? 100 : Math.min(100, Math.round((companyCount / limits.companies) * 100)),
          },
          employees: {
            current: employeeCount,
            limit: isAllFleets ? 999999 : (limits.employees || 25),
            percent: isAllFleets ? 100 : Math.min(100, Math.round((employeeCount / (limits.employees || 25)) * 100)),
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

