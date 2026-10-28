import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
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
import { NotificationLog } from '../models/notificationLog';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { User } from '../models/user';
import { SaaSPlan } from '../models/saasPlan';
import { Vendor } from '../models/vendor';
import { Tax } from '../models/tax';
import { Pickupcity } from '../models/pickupcity';
import { Pickuparea } from '../models/pickuparea';
import { PaymentMode } from '../models/paymentmode';
import { VehicleType } from '../models/vehicleType';
import { VehicleMaster } from '../models/vehicleMaster';
import { PLAN_LIMITS, PLAN_CATALOG, getOrCreateSubscription, getTenantEntitlementsSummary } from './quotaService';
import { sendNotification } from './notificationService';
import { generateUniqueFleetSlug, getFleetLoginUrl } from './slugService';
import { Security } from '../utils/Security';
import bcrypt from 'bcrypt';
import config from '../config/config';

const WEB_BASE_URL = config.baseurl?.webbaseurl || 'http://localhost:3000';

/**
 * List all tenants (Platform SuperAdmin only).
 * Enriched with authoritative resource usage counts and latest subscription payment.
 */
export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await Tenant.findAll({
      include: [{ model: TenantSubscription }],
      order: [['createdAt', 'DESC']],
    });

    const enrichedTenants = await Promise.all(
      tenants.map(async (t: any) => {
        const tenantId = t.tenantId;
        const tenantFilter = tenantId === ROOT_TENANT_ID
          ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
          : { tenantId };

        const [vehicleCount, driverCount, companyCount, userCount, lastPaidInvoice] = await Promise.all([
          Vehicle.count({ where: { isDeleted: false, ...tenantFilter } }),
          Drivers.count({ where: { isDeleted: false, ...tenantFilter } }),
          Company.count({ where: { isDeleted: false, ...tenantFilter } }),
          User.count({ where: { isDeleted: false, ...tenantFilter } }),
          SubscriptionInvoice.findOne({
            where: { tenantId, paymentStatus: 'PAID' },
            order: [['paidAt', 'DESC']],
          }),
        ]);

        const plain = t.toJSON();
        const sub = plain.subscription || {};

        return {
          ...plain,
          subscription: {
            ...sub,
            billingCycle: sub.billingCycle || 'MONTHLY',
            agreedPrice: sub.agreedPrice || (sub.planTier === 'ENTERPRISE' ? 549 : sub.planTier === 'PRO' ? 349 : 299),
            currency: sub.currency || 'INR',
          },
          usage: {
            vehicles: vehicleCount,
            drivers: driverCount,
            companies: companyCount,
            users: userCount,
          },
          lastPayment: lastPaidInvoice
            ? {
              date: lastPaidInvoice.paidAt,
              amount: Number(lastPaidInvoice.totalAmount),
              invoiceNumber: lastPaidInvoice.invoiceNumber,
              transactionReference: lastPaidInvoice.transactionReference,
            }
            : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      tenants: enrichedTenants,
      data: enrichedTenants,
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const SAC_REGEX = /^[0-9]{6}$/;

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
      legalName,
      displayName,
      registeredAddress,
      gstin,
      panNumber,
      sacCode = '996609',
      website,
      businessEmail,
      businessPhone,
      billingFooterText,
      city,
      state,
      pinCode,
      logoUrl,
      brandingTokens,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Tenant name and code are required.',
      });
    }

    const cleanName = String(name).trim();
    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Tenant name must be at least 2 characters long.',
      });
    }

    // Canonical fleet name uniqueness
    const existingName = await Tenant.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('name'))),
        cleanName.toLowerCase()
      ),
    });
    if (existingName) {
      return res.status(409).json({
        success: false,
        message: `A fleet with name '${cleanName}' already exists. Fleet names must be unique.`,
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

    // Format validations for legal identity when provided
    const cleanGstin = gstin ? String(gstin).trim().toUpperCase() : null;
    if (cleanGstin && !GSTIN_REGEX.test(cleanGstin)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GSTIN format. Expected 15-character Indian GSTIN (e.g., 33AAMCG2518C1Z0).',
      });
    }

    const cleanPan = panNumber ? String(panNumber).trim().toUpperCase() : (cleanGstin && cleanGstin.length >= 12 ? cleanGstin.substring(2, 12) : null);
    if (cleanPan && !PAN_REGEX.test(cleanPan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format. Expected 10-character alphanumeric PAN (e.g., AAMCG2518C).',
      });
    }

    const cleanSac = sacCode ? String(sacCode).trim() : '996609';
    if (cleanSac && !SAC_REGEX.test(cleanSac)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SAC code format. Expected 6-digit Service Accounting Code (e.g., 996609).',
      });
    }

    const tenantId = uuidv4();
    const normalizedTier = (planTier.toUpperCase() in PLAN_LIMITS ? planTier.toUpperCase() : 'BASIC') as
      | 'BASIC'
      | 'PRO'
      | 'ENTERPRISE';

    const limits = PLAN_LIMITS[normalizedTier];

    const mergedBrandingTokens = {
      primaryColor: '#C04E24',
      portalTitle: `${displayName || name} Mobility Portal`,
      legalName: legalName || name,
      displayName: displayName || name,
      registeredAddress: registeredAddress || null,
      gstin: cleanGstin,
      gstNumber: cleanGstin,
      panNumber: cleanPan,
      sacCode: cleanSac,
      website: website || null,
      businessEmail: businessEmail || contactEmail || null,
      businessPhone: businessPhone || contactPhone || null,
      billingFooterText: billingFooterText || null,
      city: city || null,
      state: state || null,
      pinCode: pinCode || null,
      logoUrl: logoUrl || (brandingTokens?.logoUrl) || null,
      ...(brandingTokens || {}),
    };

    const slug = await generateUniqueFleetSlug(displayName || name);

    const newTenant = await Tenant.create({
      tenantId,
      name,
      code: cleanCode,
      slug,
      legalName: legalName || name,
      displayName: displayName || name,
      registeredAddress: registeredAddress || null,
      gstin: cleanGstin,
      panNumber: cleanPan,
      sacCode: cleanSac,
      website: website || null,
      businessEmail: businessEmail || contactEmail || null,
      businessPhone: businessPhone || contactPhone || null,
      billingFooterText: billingFooterText || null,
      city: city || null,
      state: state || null,
      pinCode: pinCode || null,
      logoUrl: logoUrl || (brandingTokens?.logoUrl) || null,
      subdomain: subdomain ? subdomain.toLowerCase().trim() : undefined,
      customDomain: customDomain ? customDomain.toLowerCase().trim() : undefined,
      planTier: normalizedTier,
      status: 'ACTIVE',
      contactEmail,
      contactPhone,
      brandingTokens: mergedBrandingTokens,
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
        body: `Dear ${name} Administrator,\n\nYour fleet operator account on FleetFlow Mobility Platform has been provisioned.\n\nPlease click the secure activation link below to set your administrator password and access your dashboard:\n\n${activationUrl}\n\nNote: This link will expire in 24 hours.\n\nBest regards,\nFleetFlow SaaS Team`,
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
        name: 'FleetFlow Primary',
        code: 'FF',
        subdomain: 'fleetflow',
        status: 'ACTIVE',
        planTier: 'PRO',
        contactEmail: 'admin@fleetflow.com',
        brandingTokens: {
          primaryColor: '#0284c7',
          portalTitle: 'FleetFlow Enterprise Mobility',
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
 * Get dynamic SaaS entitlements summary for the current tenant.
 */
export const getCurrentTenantEntitlements = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const summary = await getTenantEntitlementsSummary(tenantId);

    return res.status(200).json({
      success: true,
      entitlements: summary,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching tenant entitlements:', error);
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

    const {
      brandingTokens,
      contactEmail,
      contactPhone,
      legalName,
      displayName,
      registeredAddress,
      gstin,
      panNumber,
      sacCode,
      website,
      businessEmail,
      businessPhone,
      billingFooterText,
      city,
      state,
      pinCode,
      logoUrl,
    } = req.body;

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

    // Format validations for legal identity when provided
    const cleanGstin = gstin !== undefined ? (gstin ? String(gstin).trim().toUpperCase() : null) : tenant.gstin;
    if (cleanGstin && !GSTIN_REGEX.test(cleanGstin)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GSTIN format. Expected 15-character Indian GSTIN (e.g., 33AAMCG2518C1Z0).',
      });
    }

    const cleanPan = panNumber !== undefined
      ? (panNumber ? String(panNumber).trim().toUpperCase() : null)
      : (cleanGstin && cleanGstin.length >= 12 ? cleanGstin.substring(2, 12) : tenant.panNumber);
    if (cleanPan && !PAN_REGEX.test(cleanPan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format. Expected 10-character alphanumeric PAN (e.g., AAMCG2518C).',
      });
    }

    const cleanSac = sacCode !== undefined ? (sacCode ? String(sacCode).trim() : '996609') : tenant.sacCode;
    if (cleanSac && !SAC_REGEX.test(cleanSac)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SAC code format. Expected 6-digit Service Accounting Code (e.g., 996609).',
      });
    }

    const updatedLegalName = legalName !== undefined ? legalName : tenant.legalName;
    const updatedDisplayName = displayName !== undefined ? displayName : tenant.displayName;
    const updatedRegAddress = registeredAddress !== undefined ? registeredAddress : tenant.registeredAddress;
    const updatedWebsite = website !== undefined ? website : tenant.website;
    const updatedBizEmail = businessEmail !== undefined ? businessEmail : (tenant.businessEmail || contactEmail);
    const updatedBizPhone = businessPhone !== undefined ? businessPhone : (tenant.businessPhone || contactPhone);
    const updatedFooterText = billingFooterText !== undefined ? billingFooterText : tenant.billingFooterText;
    const updatedCity = city !== undefined ? city : tenant.city;
    const updatedState = state !== undefined ? state : tenant.state;
    const updatedPin = pinCode !== undefined ? pinCode : tenant.pinCode;
    const updatedLogoUrl = logoUrl !== undefined ? logoUrl : tenant.logoUrl;

    const mergedTokens = {
      ...(tenant.brandingTokens || {}),
      ...(brandingTokens || {}),
      legalName: updatedLegalName,
      displayName: updatedDisplayName,
      registeredAddress: updatedRegAddress,
      gstin: cleanGstin,
      gstNumber: cleanGstin,
      panNumber: cleanPan,
      sacCode: cleanSac,
      website: updatedWebsite,
      businessEmail: updatedBizEmail,
      businessPhone: updatedBizPhone,
      billingFooterText: updatedFooterText,
      city: updatedCity,
      state: updatedState,
      pinCode: updatedPin,
      logoUrl: updatedLogoUrl,
    };

    await tenant.update({
      legalName: updatedLegalName,
      displayName: updatedDisplayName,
      registeredAddress: updatedRegAddress,
      gstin: cleanGstin,
      panNumber: cleanPan,
      sacCode: cleanSac,
      website: updatedWebsite,
      businessEmail: updatedBizEmail,
      businessPhone: updatedBizPhone,
      billingFooterText: updatedFooterText,
      city: updatedCity,
      state: updatedState,
      pinCode: updatedPin,
      logoUrl: updatedLogoUrl,
      contactEmail: contactEmail || tenant.contactEmail,
      contactPhone: contactPhone || tenant.contactPhone,
      brandingTokens: mergedTokens,
    });

    return res.status(200).json({
      success: true,
      message: 'Fleet profile and branding updated successfully.',
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

    await tenant.update({
      logoUrl,
      brandingTokens,
    });

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
 * SuperAdmin: Notification Monitoring & Audit Logs.
 * Returns paginated, searchable delivery records with masked recipients and sanitized errors.
 */
export const getNotificationAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'))));
    const offset = (page - 1) * limit;

    const { channel, status, tenantId, search } = req.query;
    const where: any = {};

    if (channel && (channel === 'EMAIL' || channel === 'SMS')) {
      where.channel = channel;
    }
    if (status && typeof status === 'string' && status !== 'all') {
      where.providerStatus = status.toUpperCase();
    }
    if (tenantId && typeof tenantId === 'string' && tenantId !== 'all') {
      where.tenantId = tenantId;
    }
    if (search && typeof search === 'string') {
      where[Op.or] = [
        { templateCode: { [Op.like]: `%${search}%` } },
        { referenceEntity: { [Op.like]: `%${search}%` } },
        { referenceId: { [Op.like]: `%${search}%` } },
        { recipient: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await NotificationLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Resolve tenant names
    const tenantIds = Array.from(new Set(rows.map((r: any) => r.tenantId).filter(Boolean))) as string[];
    const tenants = tenantIds.length > 0 ? await Tenant.findAll({ where: { tenantId: tenantIds } }) : [];
    const tenantMap = new Map<string, string>();
    tenants.forEach((t: any) => tenantMap.set(t.tenantId, t.name || t.code));

    const maskRecipient = (recipient: string) => {
      if (!recipient) return '';
      if (recipient.includes('@')) {
        const parts = recipient.split('@');
        const name = parts[0];
        const domain = parts[1] || '';
        const masked = name.length <= 2 ? name[0] + '***' : name.slice(0, 2) + '***' + name.slice(-1);
        return `${masked}@${domain}`;
      }
      if (recipient.length > 4) {
        return recipient.slice(0, 3) + '****' + recipient.slice(-3);
      }
      return '****';
    };

    const sanitizedLogs = rows.map((log: any) => ({
      logId: log.logId,
      channel: log.channel,
      maskedRecipient: maskRecipient(log.recipient),
      recipient: maskRecipient(log.recipient),
      templateCode: log.templateCode,
      referenceEntity: log.referenceEntity,
      referenceId: log.referenceId,
      tenantId: log.tenantId,
      fleetName: log.tenantId
        ? (tenantMap.get(log.tenantId) || (log.tenantId === ROOT_TENANT_ID ? 'Platform Default / FleetFlow' : log.tenantId))
        : 'Platform Default / FleetFlow',
      providerStatus: log.providerStatus,
      attemptCount: (log.retryCount || 0) + 1,
      maxRetries: log.maxRetries || 3,
      errorDetails: log.errorDetails ? log.errorDetails.slice(0, 255) : null,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      totalCount: count,
      page,
      totalPages: Math.ceil(count / limit),
      logs: sanitizedLogs,
    });
  } catch (err: any) {
    console.error('Error fetching notification audit logs:', err);
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
            contactPhone: '9080280818',
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

/**
 * List all SaaS plans with subscriber counts (Platform SuperAdmin only).
 */
export const listSaaSPlans = async (req: Request, res: Response) => {
  try {
    const plans = await SaaSPlan.findAll({
      order: [['priceMonthlyINR', 'ASC']],
    });

    const enriched = await Promise.all(
      plans.map(async (p: any) => {
        const subscribersCount = await TenantSubscription.count({
          where: { planTier: p.planTier, status: 'ACTIVE' },
        });
        const plain = p.toJSON();
        return {
          ...plain,
          priceMonthlyINR: Number(plain.priceMonthlyINR),
          priceAnnualINR: Number(plain.priceAnnualINR),
          priceMonthlyUSD: Number(plain.priceMonthlyUSD),
          subscribersCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      plans: enriched,
      data: enriched,
    });
  } catch (error) {
    console.error('Error listing SaaS plans:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Create a new SaaS plan (Platform SuperAdmin only).
 */
export const createSaaSPlan = async (req: Request, res: Response) => {
  try {
    const {
      planTier,
      name,
      description,
      priceMonthlyINR,
      priceAnnualINR,
      priceMonthlyUSD,
      currency = 'INR',
      billingFrequency = 'MONTHLY',
      billingCycles = ['MONTHLY', 'ANNUAL'],
      maxVehicles = 15,
      maxDrivers = 15,
      maxCompanies = 3,
      maxUsers = 5,
      monthlyTripQuota = 100,
      annualTripQuota = null,
      maxTaxes = 1,
      themeLevel = 'STANDARD',
      maxPickupAreas = 10,
      maxPickupCities = 5,
      maxPackages = 5,
      maxPaymentModes = 3,
      isUnlimitedVehicles = false,
      isUnlimitedDrivers = false,
      isUnlimitedCompanies = false,
      isUnlimitedUsers = false,
      isUnlimitedTrips = false,
      isUnlimitedTaxes = false,
      isUnlimitedPickupAreas = false,
      isUnlimitedPickupCities = false,
      isUnlimitedPackages = false,
      isUnlimitedPaymentModes = false,
      features = [],
      featureEntitlements = {},
      isActive = true,
    } = req.body;

    if (!planTier || !name) {
      return res.status(400).json({ success: false, message: 'Plan tier code and name are required.' });
    }

    const tierKey = String(planTier).toUpperCase().trim();
    const existing = await SaaSPlan.findOne({ where: { planTier: tierKey } });
    if (existing) {
      return res.status(409).json({ success: false, message: `Plan tier '${tierKey}' already exists.` });
    }

    const newPlan = await SaaSPlan.create({
      planId: uuidv4(),
      planTier: tierKey,
      name: name.trim(),
      description,
      priceMonthlyINR: Math.max(0, Number(priceMonthlyINR) || 0),
      priceAnnualINR: Math.max(0, Number(priceAnnualINR) || 0),
      priceMonthlyUSD: Math.max(0, Number(priceMonthlyUSD) || 0),
      currency,
      billingFrequency,
      billingCycles,
      maxVehicles: isUnlimitedVehicles ? 0 : Math.max(0, Number(maxVehicles) || 15),
      maxDrivers: isUnlimitedDrivers ? 0 : Math.max(0, Number(maxDrivers) || 15),
      maxCompanies: isUnlimitedCompanies ? 0 : Math.max(0, Number(maxCompanies) || 3),
      maxUsers: isUnlimitedUsers ? 0 : Math.max(0, Number(maxUsers) || 5),
      monthlyTripQuota: isUnlimitedTrips ? 0 : Math.max(0, Number(monthlyTripQuota) || 100),
      annualTripQuota: annualTripQuota !== null && annualTripQuota !== undefined ? Math.max(0, Number(annualTripQuota)) : null,
      maxTaxes: isUnlimitedTaxes ? 0 : Math.max(0, Number(maxTaxes) || 1),
      themeLevel: ['STANDARD', 'PRESETS', 'CUSTOM'].includes(String(themeLevel).toUpperCase()) ? String(themeLevel).toUpperCase() : 'STANDARD',
      maxPickupAreas: isUnlimitedPickupAreas ? 0 : Math.max(0, Number(maxPickupAreas) || 10),
      maxPickupCities: isUnlimitedPickupCities ? 0 : Math.max(0, Number(maxPickupCities) || 5),
      maxPackages: isUnlimitedPackages ? 0 : Math.max(0, Number(maxPackages) || 5),
      maxPaymentModes: isUnlimitedPaymentModes ? 0 : Math.max(0, Number(maxPaymentModes) || 3),
      isUnlimitedVehicles: Boolean(isUnlimitedVehicles),
      isUnlimitedDrivers: Boolean(isUnlimitedDrivers),
      isUnlimitedCompanies: Boolean(isUnlimitedCompanies),
      isUnlimitedUsers: Boolean(isUnlimitedUsers),
      isUnlimitedTrips: Boolean(isUnlimitedTrips),
      isUnlimitedTaxes: Boolean(isUnlimitedTaxes),
      isUnlimitedPickupAreas: Boolean(isUnlimitedPickupAreas),
      isUnlimitedPickupCities: Boolean(isUnlimitedPickupCities),
      isUnlimitedPackages: Boolean(isUnlimitedPackages),
      isUnlimitedPaymentModes: Boolean(isUnlimitedPaymentModes),
      features: Array.isArray(features) ? features : [],
      featureEntitlements: typeof featureEntitlements === 'object' ? featureEntitlements : {},
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      success: true,
      message: `Plan '${newPlan.name}' created successfully.`,
      plan: newPlan,
      data: newPlan,
    });
  } catch (error) {
    console.error('Error creating SaaS plan:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Edit an existing SaaS plan definition (Platform SuperAdmin only).
 * Protects existing fleet subscriptions while updating definitions for future use.
 */
export const updateSaaSPlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const plan = await SaaSPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    const {
      name,
      description,
      priceMonthlyINR,
      priceAnnualINR,
      priceMonthlyUSD,
      currency,
      billingFrequency,
      billingCycles,
      maxVehicles,
      maxDrivers,
      maxCompanies,
      maxUsers,
      monthlyTripQuota,
      annualTripQuota,
      maxTaxes,
      themeLevel,
      maxPickupAreas,
      maxPickupCities,
      maxPackages,
      maxPaymentModes,
      isUnlimitedVehicles,
      isUnlimitedDrivers,
      isUnlimitedCompanies,
      isUnlimitedUsers,
      isUnlimitedTrips,
      isUnlimitedTaxes,
      isUnlimitedPickupAreas,
      isUnlimitedPickupCities,
      isUnlimitedPackages,
      isUnlimitedPaymentModes,
      features,
      featureEntitlements,
      isActive,
    } = req.body;

    await plan.update({
      name: name !== undefined ? name.trim() : plan.name,
      description: description !== undefined ? description : plan.description,
      priceMonthlyINR: priceMonthlyINR !== undefined ? Math.max(0, Number(priceMonthlyINR)) : plan.priceMonthlyINR,
      priceAnnualINR: priceAnnualINR !== undefined ? Math.max(0, Number(priceAnnualINR)) : plan.priceAnnualINR,
      priceMonthlyUSD: priceMonthlyUSD !== undefined ? Math.max(0, Number(priceMonthlyUSD)) : plan.priceMonthlyUSD,
      currency: currency !== undefined ? currency : plan.currency,
      billingFrequency: billingFrequency !== undefined ? billingFrequency : plan.billingFrequency,
      billingCycles: billingCycles !== undefined ? billingCycles : plan.billingCycles,
      maxVehicles: maxVehicles !== undefined ? Math.max(0, Number(maxVehicles)) : plan.maxVehicles,
      maxDrivers: maxDrivers !== undefined ? Math.max(0, Number(maxDrivers)) : plan.maxDrivers,
      maxCompanies: maxCompanies !== undefined ? Math.max(0, Number(maxCompanies)) : plan.maxCompanies,
      maxUsers: maxUsers !== undefined ? Math.max(0, Number(maxUsers)) : plan.maxUsers,
      monthlyTripQuota: monthlyTripQuota !== undefined ? Math.max(0, Number(monthlyTripQuota)) : plan.monthlyTripQuota,
      annualTripQuota: annualTripQuota !== undefined ? (annualTripQuota !== null ? Math.max(0, Number(annualTripQuota)) : null) : plan.annualTripQuota,
      maxTaxes: maxTaxes !== undefined ? Math.max(0, Number(maxTaxes)) : plan.maxTaxes,
      themeLevel: themeLevel !== undefined ? (['STANDARD', 'PRESETS', 'CUSTOM'].includes(String(themeLevel).toUpperCase()) ? String(themeLevel).toUpperCase() : plan.themeLevel) : plan.themeLevel,
      maxPickupAreas: maxPickupAreas !== undefined ? Math.max(0, Number(maxPickupAreas)) : plan.maxPickupAreas,
      maxPickupCities: maxPickupCities !== undefined ? Math.max(0, Number(maxPickupCities)) : plan.maxPickupCities,
      maxPackages: maxPackages !== undefined ? Math.max(0, Number(maxPackages)) : plan.maxPackages,
      maxPaymentModes: maxPaymentModes !== undefined ? Math.max(0, Number(maxPaymentModes)) : plan.maxPaymentModes,
      isUnlimitedVehicles: isUnlimitedVehicles !== undefined ? Boolean(isUnlimitedVehicles) : plan.isUnlimitedVehicles,
      isUnlimitedDrivers: isUnlimitedDrivers !== undefined ? Boolean(isUnlimitedDrivers) : plan.isUnlimitedDrivers,
      isUnlimitedCompanies: isUnlimitedCompanies !== undefined ? Boolean(isUnlimitedCompanies) : plan.isUnlimitedCompanies,
      isUnlimitedUsers: isUnlimitedUsers !== undefined ? Boolean(isUnlimitedUsers) : plan.isUnlimitedUsers,
      isUnlimitedTrips: isUnlimitedTrips !== undefined ? Boolean(isUnlimitedTrips) : plan.isUnlimitedTrips,
      isUnlimitedTaxes: isUnlimitedTaxes !== undefined ? Boolean(isUnlimitedTaxes) : plan.isUnlimitedTaxes,
      isUnlimitedPickupAreas: isUnlimitedPickupAreas !== undefined ? Boolean(isUnlimitedPickupAreas) : plan.isUnlimitedPickupAreas,
      isUnlimitedPickupCities: isUnlimitedPickupCities !== undefined ? Boolean(isUnlimitedPickupCities) : plan.isUnlimitedPickupCities,
      isUnlimitedPackages: isUnlimitedPackages !== undefined ? Boolean(isUnlimitedPackages) : plan.isUnlimitedPackages,
      isUnlimitedPaymentModes: isUnlimitedPaymentModes !== undefined ? Boolean(isUnlimitedPaymentModes) : plan.isUnlimitedPaymentModes,
      features: features !== undefined ? features : plan.features,
      featureEntitlements: featureEntitlements !== undefined ? featureEntitlements : plan.featureEntitlements,
      isActive: isActive !== undefined ? Boolean(isActive) : plan.isActive,
    });

    return res.status(200).json({
      success: true,
      message: `Plan '${plan.name}' updated successfully.`,
      plan,
      data: plan,
    });
  } catch (error) {
    console.error('Error updating SaaS plan:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Toggle SaaS plan active/inactive status (Platform SuperAdmin only).
 */
export const toggleSaaSPlanActive = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const plan = await SaaSPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    const nextState = !plan.isActive;
    await plan.update({ isActive: nextState });

    return res.status(200).json({
      success: true,
      message: `Plan '${plan.name}' is now ${nextState ? 'active' : 'inactive'}.`,
      plan,
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Get complete subscription and billing history for a tenant.
 * Exposes current plan, renewal dates, agreed prices, and all historical subscription invoices.
 */
export const getTenantBillingHistory = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const ctx = getTenantContext();

    if (!ctx?.isPlatformSuperAdmin && ctx?.tenantId !== tenantId) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot access other tenant billing history.' });
    }

    const tenant = await Tenant.findByPk(tenantId, {
      include: [{ model: TenantSubscription }],
    });
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const sub = tenant.subscription || (await getOrCreateSubscription(tenantId));
    const invoices = await SubscriptionInvoice.findAll({
      where: { tenantId },
      order: [['createdAt', 'DESC']],
    });

    const lastPaid = invoices.find((inv) => inv.paymentStatus === 'PAID');

    return res.status(200).json({
      success: true,
      data: {
        tenantId: tenant.tenantId,
        fleetName: tenant.name,
        code: tenant.code,
        subscription: {
          subscriptionId: sub.subscriptionId,
          planTier: sub.planTier,
          status: sub.status,
          billingCycle: (sub as any).billingCycle || 'MONTHLY',
          agreedPrice: (sub as any).agreedPrice || (sub.planTier === 'ENTERPRISE' ? 549 : sub.planTier === 'PRO' ? 349 : 299),
          currency: (sub as any).currency || 'INR',
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          trialEndsAt: sub.trialEndsAt,
          lastPaymentDate: (sub as any).lastPaymentDate || lastPaid?.paidAt || null,
          lastPaymentAmount: (sub as any).lastPaymentAmount || (lastPaid ? Number(lastPaid.totalAmount) : null),
          quotas: {
            vehicles: sub.vehicleQuota,
            drivers: sub.driverQuota,
            companies: sub.companyQuota,
            trips: sub.monthlyTripQuota,
          },
        },
        invoices: invoices.map((inv) => ({
          subscriptionInvoiceId: inv.subscriptionInvoiceId,
          invoiceNumber: inv.invoiceNumber,
          planTier: inv.planTier,
          billingCycle: inv.billingCycle,
          baseAmount: Number(inv.baseAmount),
          taxAmount: Number(inv.taxAmount),
          totalAmount: Number(inv.totalAmount),
          currency: inv.currency,
          paymentStatus: inv.paymentStatus,
          paymentMethod: inv.paymentMethod,
          transactionReference: inv.transactionReference,
          billingPeriodStart: inv.billingPeriodStart,
          billingPeriodEnd: inv.billingPeriodEnd,
          paidAt: inv.paidAt,
          createdAt: inv.createdAt,
          metadata: inv.metadata,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching tenant billing history:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Dedicated Read-Only Fleet Inspection Profile for SuperAdmin.
 * Returns authoritative metadata, subscription dates, resource quotas, and verified operational counts.
 */
export const getFleetInspectionProfile = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const ctx = getTenantContext();

    if (!ctx?.isPlatformSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: SuperAdmin platform role required for fleet inspection.' });
    }

    const tenant = await Tenant.findByPk(tenantId, {
      include: [{ model: TenantSubscription }],
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Fleet tenant not found.' });
    }

    const sub = tenant.subscription || (await getOrCreateSubscription(tenantId));
    const tenantFilter = { tenantId };

    const [
      vehicleCount,
      driverCount,
      companyCount,
      userCount,
      ownerCount,
      totalBookings,
      completedTrips,
      pendingBookings,
      taxCount,
      pickupCityCount,
      pickupAreaCount,
      paymentModeCount,
      vehicleTypeCount,
      vehicleMasterCount,
      recentBookings,
      recentCompanies,
    ] = await Promise.all([
      Vehicle.count({ where: { isDeleted: false, ...tenantFilter } }),
      Drivers.count({ where: { isDeleted: false, ...tenantFilter } }),
      Company.count({ where: { isDeleted: false, ...tenantFilter } }),
      User.count({ where: { isDeleted: false, ...tenantFilter } }),
      Vendor.count({ where: { isDeleted: false, ...tenantFilter } }),
      Booking.count({ where: tenantFilter }),
      Booking.count({ where: { ...tenantFilter, confirmStatus: { [Op.in]: ['3', 3, 'completed'] } } }),
      Booking.count({ where: { ...tenantFilter, confirmStatus: { [Op.in]: ['0', '1', '2', 0, 1, 2] } } }),
      Tax.count({ where: tenantFilter }),
      Pickupcity.count({ where: tenantFilter }),
      Pickuparea.count({ where: tenantFilter }),
      PaymentMode.count({ where: tenantFilter }),
      VehicleType.count({ where: tenantFilter }),
      VehicleMaster.count({ where: tenantFilter }),
      Booking.findAll({
        where: tenantFilter,
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
      Company.findAll({
        where: { isDeleted: false, ...tenantFilter },
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
    ]);

    const branding = tenant.brandingTokens || {};

    return res.status(200).json({
      success: true,
      data: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        legalName: tenant.legalName || tenant.name,
        displayName: tenant.displayName || tenant.name,
        code: tenant.code,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
        status: tenant.status,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        logoUrl: tenant.logoUrl || branding.logoUrl || null,
        headerColor: (branding as any).headerColor || branding.primaryColor || '#1A365D',
        primaryColor: branding.primaryColor || '#1A365D',
        gstNumber: tenant.gstin || (branding as any).gstNumber || '',
        gstin: tenant.gstin || (branding as any).gstNumber || '',
        panNumber: tenant.panNumber || '',
        sacCode: tenant.sacCode || '996609',
        registeredAddress: tenant.registeredAddress || (branding as any).registeredAddress || '',
        website: tenant.website || '',
        businessEmail: tenant.businessEmail || tenant.contactEmail || '',
        businessPhone: tenant.businessPhone || tenant.contactPhone || '',
        billingFooterText: tenant.billingFooterText || '',
        city: tenant.city || '',
        state: tenant.state || '',
        pinCode: tenant.pinCode || '',
        createdAt: tenant.createdAt,
        subscription: {
          subscriptionId: sub.subscriptionId,
          planTier: sub.planTier,
          status: sub.status,
          billingCycle: (sub as any).billingCycle || 'MONTHLY',
          agreedPrice: Number((sub as any).agreedPrice) || (sub.planTier === 'ENTERPRISE' ? 549 : sub.planTier === 'PRO' ? 349 : 299),
          currency: (sub as any).currency || 'INR',
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          trialEndsAt: sub.trialEndsAt,
          quotas: {
            vehicles: sub.vehicleQuota,
            drivers: sub.driverQuota,
            companies: sub.companyQuota,
            trips: sub.monthlyTripQuota,
          },
        },
        counts: {
          vehicles: vehicleCount,
          drivers: driverCount,
          companies: companyCount,
          users: userCount,
          owners: ownerCount,
          totalBookings,
          completedTrips,
          pendingBookings,
          taxes: taxCount,
          pickupCities: pickupCityCount,
          pickupAreas: pickupAreaCount,
          paymentModes: paymentModeCount,
          vehicleTypes: vehicleTypeCount,
          vehicleMasters: vehicleMasterCount,
        },
        recentBookings,
        recentCompanies,
        modules: [
          'dashboard',
          'companies',
          'vehicles',
          'drivers',
          'owners',
          'taxes',
          'pickupcities',
          'pickupareas',
          'paymentmodes',
          'vehicletypes',
          'orders',
          'users',
          'invoices',
          'reports',
        ],
      },
    });
  } catch (error) {
    console.error('Error fetching fleet inspection profile:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Dedicated Read-Only Fleet Inspection Module Data for SuperAdmin.
 * Returns verified operational lists strictly scoped to the target tenantId.
 */
export const getFleetInspectionData = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { module: moduleName } = req.query;
    const ctx = getTenantContext();

    if (!ctx?.isPlatformSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: SuperAdmin platform role required.' });
    }

    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Fleet tenant not found.' });
    }

    const tenantFilter = { tenantId };

    if (moduleName === 'companies') {
      const companies = await Company.findAll({
        where: { isDeleted: false, ...tenantFilter },
        order: [['createdAt', 'DESC']],
      });
      return res.status(200).json({ success: true, data: companies });
    }

    if (moduleName === 'vehicles') {
      const vehicles = await Vehicle.findAll({
        where: { isDeleted: false, ...tenantFilter },
        include: [{ model: VehicleType, as: 'vehicleType' }],
        order: [['createdAt', 'DESC']],
      });
      return res.status(200).json({ success: true, data: vehicles });
    }

    if (moduleName === 'drivers') {
      const drivers = await Drivers.findAll({
        where: { isDeleted: false, ...tenantFilter },
        order: [['createdAt', 'DESC']],
      });
      return res.status(200).json({ success: true, data: drivers });
    }

    if (moduleName === 'owners') {
      const owners = await Vendor.findAll({
        where: { isDeleted: false, ...tenantFilter },
        order: [['createdAt', 'DESC']],
      });
      return res.status(200).json({ success: true, data: owners });
    }

    if (moduleName === 'bookings') {
      const bookings = await Booking.findAll({
        where: tenantFilter,
        order: [['createdAt', 'DESC']],
        limit: 100,
      });
      return res.status(200).json({ success: true, data: bookings });
    }

    if (moduleName === 'users') {
      const users = await User.findAll({
        where: { isDeleted: false, ...tenantFilter },
        attributes: ['userId', 'username', 'email', 'mobile', 'role', 'gender', 'city', 'state', 'companyId', 'status', 'createdAt'],
        include: [{ model: Company, attributes: ['companyId', 'companyName', 'companyCode'] }],
        order: [['createdAt', 'DESC']],
      });
      return res.status(200).json({ success: true, data: users });
    }

    if (moduleName === 'vehiclemasters') {
      const vMasters = await VehicleMaster.findAll({
        where: { isDeleted: 0, ...tenantFilter },
        order: [['createdAt', 'DESC']],
      });
      return res.status(200).json({ success: true, data: vMasters });
    }

    if (moduleName === 'billing' || moduleName === 'subscription') {
      const sub = await TenantSubscription.findOne({ where: { tenantId } });
      const invoices = await SubscriptionInvoice.findAll({
        where: tenantFilter,
        order: [['createdAt', 'DESC']],
      });
      return res.status(200).json({
        success: true,
        data: { subscription: sub, invoices },
      });
    }

    if (moduleName === 'masters') {
      const [taxes, cities, areas, paymentModes, vehicleTypes, vehicleMasters] = await Promise.all([
        Tax.findAll({ where: tenantFilter }),
        Pickupcity.findAll({ where: tenantFilter }),
        Pickuparea.findAll({ where: tenantFilter }),
        PaymentMode.findAll({ where: tenantFilter }),
        VehicleType.findAll({ where: tenantFilter }),
        VehicleMaster.findAll({ where: { isDeleted: 0, ...tenantFilter } }),
      ]);
      return res.status(200).json({
        success: true,
        data: { taxes, cities, areas, paymentModes, vehicleTypes, vehicleMasters },
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid inspection module specified.' });
  } catch (error) {
    console.error('Error fetching fleet inspection data:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Public: Resolves fleet branding identity by unique slug.
 * Exposes only safe public branding attributes without leaking sensitive operational data or secrets.
 * Returns safe 404 if slug is unknown.
 */
export const getPublicFleetBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Slug is required.' });
    }

    const cleanSlug = String(slug).toLowerCase().trim();
    const tenant = await Tenant.findOne({
      where: {
        isDeleted: false,
        [Op.or]: [
          { slug: cleanSlug },
          { subdomain: cleanSlug },
        ],
      },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        code: 'FLEET_NOT_FOUND',
        message: 'Fleet operator not found.',
      });
    }

    const tokens = (tenant.brandingTokens as any) || {};

    return res.status(200).json({
      success: true,
      fleet: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        displayName: tenant.displayName || tenant.name,
        legalName: tenant.legalName || tenant.name,
        logoUrl: tenant.logoUrl || tokens.logoUrl || null,
        registeredAddress: tenant.registeredAddress || null,
        city: tenant.city || null,
        state: tenant.state || null,
        pinCode: tenant.pinCode || null,
        slug: tenant.slug || tenant.subdomain,
        portalTitle: tokens.portalTitle || `${tenant.displayName || tenant.name} Fleet Portal`,
        primaryColor: tokens.primaryColor || '#0f1c3f',
        secondaryColor: tokens.secondaryColor || '#0d9488',
        loginUrl: getFleetLoginUrl(tenant.slug || tenant.subdomain),
      },
    });
  } catch (error) {
    console.error('Error fetching public fleet branding by slug:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Public: Authenticate a user via the fleet's unique dedicated login URL.
 * Server resolves the slug to tenantId and strictly verifies tenant membership.
 * Users belonging to Fleet A are strictly rejected if attempting to log in via Fleet B URL.
 */
export const fleetLoginBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { email, password } = req.body;

    if (!slug) {
      return res.status(400).json({ success: false, message: 'Fleet slug is required.' });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanSlug = String(slug).toLowerCase().trim();
    const tenant = await Tenant.findOne({
      where: {
        isDeleted: false,
        [Op.or]: [
          { slug: cleanSlug },
          { subdomain: cleanSlug },
        ],
      },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        code: 'FLEET_NOT_FOUND',
        message: 'Fleet operator not found.',
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // 1. Resolve credentials across Employee, Vendor, User
    let userRecord: any = await Employee.findOne({ where: { email: cleanEmail } });
    let role = userRecord?.role || 'operator';
    let userId = userRecord?.employeeId;
    let companyId: string | undefined = undefined;

    if (!userRecord) {
      userRecord = await Vendor.findOne({ where: { email: cleanEmail } });
      if (userRecord) {
        role = userRecord.role || 'vendor';
        userId = userRecord.vendorId;
      }
    }

    if (!userRecord) {
      userRecord = await User.findOne({ where: { email: cleanEmail } });
      if (userRecord) {
        role = userRecord.role || (userRecord.companyManager ? 'manager' : 'user');
        userId = userRecord.userId;
        companyId = userRecord.companyId;
      }
    }

    if (!userRecord) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userTenantId = userRecord.tenantId || ROOT_TENANT_ID;
    const targetTenantId = tenant.tenantId;

    // Strict Cross-Tenant Authentication Guard:
    // User of Fleet A cannot authenticate through Fleet B's dedicated login URL!
    const configuredSuperAdminEmail = (process.env.SUPERADMIN_EMAIL || 'subisha2002.m@gmail.com').toLowerCase();
    const isSuperAdmin = (role === 'superadmin' || role === 'SUPERADMIN') &&
      (userTenantId === ROOT_TENANT_ID || userRecord.email?.toLowerCase() === configuredSuperAdminEmail);

    if (!isSuperAdmin && userTenantId !== targetTenantId) {
      return res.status(403).json({
        success: false,
        code: 'CROSS_TENANT_LOGIN_FORBIDDEN',
        message: 'Access denied: Your account does not belong to this fleet operator.',
      });
    }

    const effectiveTenantId = isSuperAdmin ? targetTenantId : userTenantId;

    const token = Security.generateJwtToken(
      {
        userId,
        roles: role,
        tenantId: effectiveTenantId,
        companyId,
        email: userRecord.email,
      },
      config.security.jwtSecret,
      config.security.accessTokenExpiry
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      id: userId,
      email: userRecord.email,
      role,
      companyId,
      tenantId: effectiveTenantId,
      token,
      accessToken: token,
      tenant: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        displayName: tenant.displayName || tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
      },
      fleet: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        displayName: tenant.displayName || tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
      },
    });
  } catch (error) {
    console.error('Error authenticating fleet login by slug:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


