import { TenantSubscription } from '../models/tenantSubscription';
import { TenantUsageMeter } from '../models/tenantUsageMeter';
import { Vehicle } from '../models/vehicle';
import { Drivers } from '../models/drivers';
import { Company } from '../models/company';
import { Booking } from '../models/booking';
import { User } from '../models/user';
import { Tax } from '../models/tax';
import { Pickuparea } from '../models/pickuparea';
import { Pickupcity } from '../models/pickupcity';
import { PackageData } from '../models/packageData';
import { PaymentMode } from '../models/paymentmode';
import { SaaSPlan } from '../models/saasPlan';
import { TenantInitialAllowance } from '../models/tenantInitialAllowance';
import sequelize from '../config/dbConfig';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { Op, Transaction } from 'sequelize';

export interface BillingPeriodInfo {
  start: Date;
  end: Date;
  cycle: 'MONTHLY' | 'ANNUAL';
  nextResetDate: Date;
}

export interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  max: number | 'Unlimited';
  isUnlimited?: boolean;
  planTier: string;
  resource?: string;
  recommendedPlan?: string;
  message?: string;
  billingPeriod?: BillingPeriodInfo;
}

export interface PlanDefinition {
  planTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  priceMonthlyINR: number;
  priceAnnualINR: number;
  priceMonthlyUSD: number;
  billingFrequency: 'MONTHLY' | 'ANNUAL';
  features: string[];
  themeLevel: 'STANDARD' | 'PRESETS' | 'CUSTOM';
  themePresets?: string[];
  quotas: {
    vehicles: number;
    drivers: number;
    companies: number;
    users: number;
    trips: number;
    taxes: number;
    pickupAreas: number;
    pickupCities: number;
    packages: number;
    paymentModes: number;
    sms: number;
    maps: number;
    storageGb: number;
  };
  overageRates: {
    perExtraTripINR: number;
    perExtraSmsINR: number;
    perExtraMapCallINR: number;
  };
}

export const PLAN_LIMITS = {
  BASIC: {
    vehicles: 15,
    drivers: 15,
    companies: 3,
    employees: 5,
    users: 5,
    trips: 100, // 100 bookings per monthly billing period
    taxes: 1, // Max 1 tax configuration
    pickupAreas: 10,
    pickupCities: 5,
    packages: 5,
    paymentModes: 3,
    themeLevel: 'STANDARD' as const,
    sms: 500,
    maps: 1000,
    storageGb: 5,
  },
  PRO: {
    vehicles: 75,
    drivers: 75,
    companies: 20,
    employees: 25,
    users: 25,
    trips: 250, // 250 bookings per monthly billing period (confirmed business decision)
    taxes: 2, // Max 2 tax configurations
    pickupAreas: 50,
    pickupCities: 25,
    packages: 25,
    paymentModes: 10,
    themeLevel: 'PRESETS' as const,
    themePresets: ['terracotta', 'emerald', 'slate', 'indigo'],
    sms: 5000,
    maps: 10000,
    storageGb: 25,
  },
  ENTERPRISE: {
    vehicles: -1, // Unlimited
    drivers: -1,
    companies: -1,
    employees: -1,
    users: -1,
    trips: -1, // Unlimited bookings
    taxes: -1, // Unlimited tax configurations
    pickupAreas: -1,
    pickupCities: -1,
    packages: -1,
    paymentModes: -1,
    themeLevel: 'CUSTOM' as const,
    themePresets: ['terracotta', 'emerald', 'slate', 'indigo'],
    sms: 100000,
    maps: 100000,
    storageGb: 100,
  },
};

export const PLAN_CATALOG: Record<'BASIC' | 'PRO' | 'ENTERPRISE', PlanDefinition> = {
  BASIC: {
    planTier: 'BASIC',
    name: 'Starter Mobility',
    priceMonthlyINR: 299,
    priceAnnualINR: 3050,
    priceMonthlyUSD: 4,
    billingFrequency: 'MONTHLY',
    themeLevel: 'STANDARD',
    features: [
      'Fleet & Driver Operations (Up to 15 Vehicles / 15 Drivers)',
      '100 Bookings per Monthly Billing Cycle',
      'Up to 1 Tax Configuration',
      'Up to 3 Corporate Client Accounts',
      'Standard System Theme (Fixed)',
      'Basic Booking-to-Invoice Lifecycle & Dispatch',
      'Standard PDF Invoice Generation',
      'Email Notification Support',
    ],
    quotas: PLAN_LIMITS.BASIC,
    overageRates: {
      perExtraTripINR: 5,
      perExtraSmsINR: 0.35,
      perExtraMapCallINR: 0.50,
    },
  },
  PRO: {
    planTier: 'PRO',
    name: 'Growth Fleet Pro',
    priceMonthlyINR: 349,
    priceAnnualINR: 3560,
    priceMonthlyUSD: 5,
    billingFrequency: 'MONTHLY',
    themeLevel: 'PRESETS',
    themePresets: ['terracotta', 'emerald', 'slate', 'indigo'],
    features: [
      'Expanded Fleet Management (Configurable Vehicles / 75 Drivers)',
      '250 Bookings per Monthly Billing Cycle',
      'Up to 2 Tax Configurations',
      'Up to 20 Corporate Client Accounts',
      'Predefined Brand Theme Presets',
      'On-Call, Monthly Consolidated & Spot Trip Invoicing',
      'Advanced Route Card Aggregation & Financial Summary Reports',
      'Custom Email/SMS Reminders & Payment Tracking',
    ],
    quotas: PLAN_LIMITS.PRO,
    overageRates: {
      perExtraTripINR: 3,
      perExtraSmsINR: 0.25,
      perExtraMapCallINR: 0.35,
    },
  },
  ENTERPRISE: {
    planTier: 'ENTERPRISE',
    name: 'Enterprise Mobility Suite',
    priceMonthlyINR: 549,
    priceAnnualINR: 5600,
    priceMonthlyUSD: 7,
    billingFrequency: 'MONTHLY',
    themeLevel: 'CUSTOM',
    themePresets: ['terracotta', 'emerald', 'slate', 'indigo'],
    features: [
      'Unlimited Vehicles & Unlimited Bookings (No artificial caps)',
      'Unlimited Tax Configurations',
      'Unlimited Corporate Client Accounts & Driver Rosters',
      'Full Custom Theme & Brand Color Customizer with Live Preview',
      'Full Multi-Tenant SaaS Isolation & Custom Domains',
      'Consolidated Monthly Corporate Route Invoicing',
      'Multi-Role Server Authorization (SuperAdmin, Operator, Manager, Employee, Vendor)',
      'Priority Support & High-Volume Telemetry Metering',
    ],
    quotas: PLAN_LIMITS.ENTERPRISE,
    overageRates: {
      perExtraTripINR: 1.5,
      perExtraSmsINR: 0.20,
      perExtraMapCallINR: 0.25,
    },
  },
};

export const getPlanDefinition = async (planTier: string): Promise<any> => {
  try {
    const dbPlan = await SaaSPlan.findOne({
      where: { planTier: planTier.toUpperCase(), isActive: true },
    });
    if (dbPlan) {
      return {
        planTier: dbPlan.planTier,
        name: dbPlan.name,
        priceMonthlyINR: Number(dbPlan.priceMonthlyINR),
        priceAnnualINR: Number(dbPlan.priceAnnualINR),
        priceMonthlyUSD: Number(dbPlan.priceMonthlyUSD),
        billingFrequency: dbPlan.billingFrequency,
        features: dbPlan.features || [],
        themeLevel: dbPlan.themeLevel || (dbPlan.planTier === 'ENTERPRISE' ? 'CUSTOM' : dbPlan.planTier === 'PRO' ? 'PRESETS' : 'STANDARD'),
        themePresets: ['terracotta', 'emerald', 'slate', 'indigo'],
        featureEntitlements: dbPlan.featureEntitlements || {},
        isUnlimitedVehicles: Boolean(dbPlan.isUnlimitedVehicles),
        isUnlimitedDrivers: Boolean(dbPlan.isUnlimitedDrivers),
        isUnlimitedCompanies: Boolean(dbPlan.isUnlimitedCompanies),
        isUnlimitedUsers: Boolean(dbPlan.isUnlimitedUsers),
        isUnlimitedTrips: Boolean(dbPlan.isUnlimitedTrips),
        isUnlimitedTaxes: Boolean(dbPlan.isUnlimitedTaxes),
        isUnlimitedPickupAreas: Boolean(dbPlan.isUnlimitedPickupAreas),
        isUnlimitedPickupCities: Boolean(dbPlan.isUnlimitedPickupCities),
        isUnlimitedPackages: Boolean(dbPlan.isUnlimitedPackages),
        isUnlimitedPaymentModes: Boolean(dbPlan.isUnlimitedPaymentModes),
        quotas: {
          vehicles: dbPlan.isUnlimitedVehicles ? -1 : dbPlan.maxVehicles,
          drivers: dbPlan.isUnlimitedDrivers ? -1 : dbPlan.maxDrivers,
          companies: dbPlan.isUnlimitedCompanies ? -1 : dbPlan.maxCompanies,
          users: dbPlan.isUnlimitedUsers ? -1 : dbPlan.maxUsers,
          trips: dbPlan.isUnlimitedTrips ? -1 : dbPlan.monthlyTripQuota,
          taxes: dbPlan.isUnlimitedTaxes ? -1 : (dbPlan.maxTaxes || (dbPlan.planTier === 'PRO' ? 2 : 1)),
          pickupAreas: dbPlan.isUnlimitedPickupAreas ? -1 : (dbPlan.maxPickupAreas || 10),
          pickupCities: dbPlan.isUnlimitedPickupCities ? -1 : (dbPlan.maxPickupCities || 5),
          packages: dbPlan.isUnlimitedPackages ? -1 : (dbPlan.maxPackages || 5),
          paymentModes: dbPlan.isUnlimitedPaymentModes ? -1 : (dbPlan.maxPaymentModes || 3),
        },
      };
    }
  } catch (err) {
    console.warn('Error reading SaaSPlan from DB, falling back to static catalog:', err);
  }

  const key = (['BASIC', 'PRO', 'ENTERPRISE'].includes(planTier.toUpperCase())
    ? planTier.toUpperCase()
    : 'PRO') as 'BASIC' | 'PRO' | 'ENTERPRISE';

  return PLAN_CATALOG[key];
};

/**
 * Resolves current billing period dates and next reset date for a subscription.
 */
export const getBillingPeriodDates = (sub: TenantSubscription): BillingPeriodInfo => {
  const cycle: 'MONTHLY' | 'ANNUAL' = sub.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
  const now = new Date();

  let start: Date;
  let end: Date;

  if (sub.currentPeriodStart && sub.currentPeriodEnd) {
    start = new Date(sub.currentPeriodStart);
    end = new Date(sub.currentPeriodEnd);
  } else {
    // Default to calendar month boundary
    start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  }

  return {
    start,
    end,
    cycle,
    nextResetDate: end,
  };
};

/**
 * Gets or creates the subscription for a tenant.
 */
export const getOrCreateSubscription = async (tenantId: string): Promise<TenantSubscription> => {
  let sub = await TenantSubscription.findOne({ where: { tenantId } });
  if (!sub) {
    const isRoot = tenantId === ROOT_TENANT_ID;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    sub = await TenantSubscription.create({
      tenantId,
      planTier: isRoot ? 'ENTERPRISE' : 'BASIC',
      status: 'ACTIVE',
      vehicleQuota: isRoot ? 0 : 15,
      driverQuota: isRoot ? 0 : 15,
      companyQuota: isRoot ? 0 : 3,
      monthlyTripQuota: isRoot ? 0 : 100,
      taxQuota: isRoot ? 0 : 1,
      isUnlimitedVehicles: isRoot,
      isUnlimitedTrips: isRoot,
      isUnlimitedTaxes: isRoot,
      allowOverage: isRoot,
      monthlyOverageSpendCap: 2000,
      billingCycle: 'MONTHLY',
      agreedPrice: isRoot ? 549 : 299,
      currency: 'INR',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });
  }
  return sub;
};

/**
 * Evaluates whether a subscription is expired or suspended.
 */
export const isSubscriptionExpired = (sub: TenantSubscription): boolean => {
  if (sub.status === 'SUSPENDED' || sub.status === 'CANCELED') return true;
  if (sub.status === 'ACTIVE' && sub.currentPeriodEnd) {
    const end = new Date(sub.currentPeriodEnd);
    if (!isNaN(end.getTime()) && end < new Date()) {
      return true;
    }
  }
  return false;
};

/**
 * Checks whether the initial allowance has already been consumed for a module.
 */
export const isInitialAllowanceConsumed = async (
  tenantId: string,
  module: 'VEHICLES' | 'DRIVERS' | 'COMPANIES' | 'USERS' | 'BOOKINGS' | 'TAXES'
): Promise<boolean> => {
  const row = await TenantInitialAllowance.findOne({
    where: { tenantId, module },
  });
  return Boolean(row && row.usedCount >= 1);
};

export interface AllowanceResult {
  allowed: boolean;
  consumed: boolean;
  count: number;
  message?: string;
}

/**
 * Concurrency-safe check and consumption of one-time initial free allowance.
 */
export const checkAndConsumeAllowance = async (
  tenantId: string,
  module: 'VEHICLES' | 'DRIVERS' | 'COMPANIES' | 'USERS' | 'BOOKINGS' | 'TAXES',
  t?: Transaction
): Promise<AllowanceResult> => {
  try {
    const execute = async (trx: Transaction): Promise<AllowanceResult> => {
      const [existing]: any = await sequelize.query(
        'SELECT id, usedCount FROM `tenant_initial_allowance` WHERE `tenantId` = ? AND `module` = ? FOR UPDATE',
        { replacements: [tenantId, module], transaction: trx }
      );

      if (existing && existing.length > 0) {
        const row = existing[0];
        if (row.usedCount >= 1) {
          return {
            allowed: false,
            consumed: true,
            count: row.usedCount,
            message: `Free setup allowance for ${module.toLowerCase()} has already been consumed (1/1 record used). Upgrade to an active paid plan to create more.`,
          };
        }
        await sequelize.query(
          'UPDATE `tenant_initial_allowance` SET `usedCount` = `usedCount` + 1, `lastUsedAt` = NOW() WHERE `id` = ?',
          { replacements: [row.id], transaction: trx }
        );
        return { allowed: true, consumed: true, count: 1 };
      }

      await sequelize.query(
        'INSERT INTO `tenant_initial_allowance` (`tenantId`, `module`, `usedCount`, `firstUsedAt`, `lastUsedAt`) VALUES (?, ?, 1, NOW(), NOW())',
        { replacements: [tenantId, module], transaction: trx }
      );
      return { allowed: true, consumed: true, count: 1 };
    };

    if (t) {
      return await execute(t);
    }
    return await sequelize.transaction(async (trx) => execute(trx));
  } catch (err: any) {
    const msg = String(err?.parent?.message || err?.message || err).toLowerCase();
    const code = String(err?.parent?.code || err?.code || '');
    if (
      code === 'ER_DUP_ENTRY' ||
      code === 'ER_LOCK_DEADLOCK' ||
      err?.name === 'SequelizeUniqueConstraintError' ||
      msg.includes('duplicate') ||
      msg.includes('deadlock') ||
      msg.includes('lock')
    ) {
      return {
        allowed: false,
        consumed: true,
        count: 1,
        message: `Free setup allowance for ${module.toLowerCase()} has already been consumed (1/1 record used). Upgrade to an active paid plan to create more.`,
      };
    }
    throw err;
  }
};

export const rollbackAllowance = async (
  tenantId: string,
  module: 'VEHICLES' | 'DRIVERS' | 'COMPANIES' | 'USERS' | 'BOOKINGS' | 'TAXES'
): Promise<void> => {
  try {
    const [existing]: any = await sequelize.query(
      'SELECT id, usedCount FROM `tenant_initial_allowance` WHERE `tenantId` = ? AND `module` = ?',
      { replacements: [tenantId, module] }
    );
    if (existing && existing.length > 0) {
      const row = existing[0];
      if (row.usedCount > 1) {
        await sequelize.query(
          'UPDATE `tenant_initial_allowance` SET `usedCount` = `usedCount` - 1 WHERE `id` = ?',
          { replacements: [row.id] }
        );
      } else {
        await sequelize.query(
          'DELETE FROM `tenant_initial_allowance` WHERE `id` = ?',
          { replacements: [row.id] }
        );
      }
    }
  } catch (err) {
    console.error(`Failed to rollback allowance for ${module}:`, err);
  }
};

/**
 * 1. Checks Vehicle Quota (Active record count)
 * Basic: 15, Pro: configurable (e.g. 75), Enterprise: Unlimited
 */
export const checkVehicleQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Vehicle.count({ where: { isDeleted: false, ...tenantCondition } });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: 'ENTERPRISE', resource: 'VEHICLES' };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'VEHICLES',
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to add vehicles.',
    };
  }

  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'VEHICLES');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      resource: 'VEHICLES',
      recommendedPlan: 'BASIC',
      message: allowed
        ? undefined
        : `Free setup allowance reached (${Math.max(currentCount, 1)}/1 vehicle). Upgrade to an active paid plan to add more vehicles.`,
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedVehicles || sub.isUnlimitedVehicles || (sub.planTier === 'ENTERPRISE')) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: sub.planTier, resource: 'VEHICLES' };
  }

  const max = sub.vehicleQuota || plan?.quotas?.vehicles || 15;
  const allowed = currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'VEHICLES',
    recommendedPlan,
    message: allowed
      ? undefined
      : `You have reached your vehicle limit (${currentCount}/${max}). Upgrade your plan to add more vehicles.`,
  };
};

/**
 * 2. Checks Booking Quota (Period-based creations)
 * Basic: 100/mo, Pro: 250/mo (configurable), Enterprise: Unlimited
 */
export const checkBookingQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;
  const billingPeriod = getBillingPeriodDates(sub);

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };

  // Period-based count: strictly within current billing period
  const currentCount = await Booking.count({
    where: {
      ...tenantCondition,
      createdAt: {
        [Op.gte]: billingPeriod.start,
        [Op.lte]: billingPeriod.end,
      },
    },
  });

  if (isRoot) {
    return {
      allowed: true,
      current: currentCount,
      max: 'Unlimited',
      isUnlimited: true,
      planTier: 'ENTERPRISE',
      resource: 'BOOKINGS',
      billingPeriod,
    };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'BOOKINGS',
      billingPeriod,
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to create bookings.',
    };
  }

  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'BOOKINGS');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      resource: 'BOOKINGS',
      recommendedPlan: 'BASIC',
      billingPeriod,
      message: allowed
        ? undefined
        : `Free trial booking allowance reached (${Math.max(currentCount, 1)}/1 booking). Upgrade to an active paid plan to dispatch more trips.`,
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedTrips || sub.isUnlimitedTrips || (sub.planTier === 'ENTERPRISE')) {
    return {
      allowed: true,
      current: currentCount,
      max: 'Unlimited',
      isUnlimited: true,
      planTier: sub.planTier,
      resource: 'BOOKINGS',
      billingPeriod,
    };
  }

  // Quota selection: check if annual plan with explicit annual quota, else monthly
  const configuredQuota = sub.billingCycle === 'ANNUAL' && plan?.annualTripQuota
    ? plan.annualTripQuota
    : (sub.monthlyTripQuota || plan?.quotas?.trips || (sub.planTier === 'BASIC' ? 100 : 250));

  const max = configuredQuota;
  const allowed = sub.allowOverage || currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  const resetDateStr = billingPeriod.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'BOOKINGS',
    recommendedPlan,
    billingPeriod,
    message: allowed
      ? undefined
      : `You have reached your booking allowance for this billing period (${currentCount}/${max}). Upgrade your plan or continue when the allowance resets on ${resetDateStr}.`,
  };
};

/**
 * 3. Checks Tax Configuration Quota (Active record count)
 * Basic: 1, Pro: 2, Enterprise: Unlimited
 */
export const checkTaxQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };

  const currentCount = await Tax.count({ where: tenantCondition });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: 'ENTERPRISE', resource: 'TAXES' };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'TAXES',
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to configure taxes.',
    };
  }

  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'TAXES');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      resource: 'TAXES',
      recommendedPlan: 'BASIC',
      message: allowed
        ? undefined
        : `Free setup allowance reached (${Math.max(currentCount, 1)}/1 tax configuration). Upgrade to an active paid plan to add more.`,
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedTaxes || sub.isUnlimitedTaxes || (sub.planTier === 'ENTERPRISE')) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: sub.planTier, resource: 'TAXES' };
  }

  const max = sub.taxQuota || plan?.quotas?.taxes || (sub.planTier === 'BASIC' ? 1 : sub.planTier === 'PRO' ? 2 : 1);
  const allowed = currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'TAXES',
    recommendedPlan,
    message: allowed
      ? undefined
      : `You have reached your tax configuration limit (${currentCount}/${max}). Upgrade your plan to add more tax configurations.`,
  };
};

/**
 * 4. Checks Driver Roster Quota (Active record count)
 * Basic: 15, Pro: 75, Enterprise: Unlimited
 */
export const checkDriverQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Drivers.count({ where: { isDeleted: false, ...tenantCondition } });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: 'ENTERPRISE', resource: 'DRIVERS' };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'DRIVERS',
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to register drivers.',
    };
  }

  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'DRIVERS');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      resource: 'DRIVERS',
      recommendedPlan: 'BASIC',
      message: allowed
        ? undefined
        : `Free setup allowance reached (${Math.max(currentCount, 1)}/1 driver). Upgrade to an active paid plan to register more drivers.`,
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedDrivers || (sub.planTier === 'ENTERPRISE')) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: sub.planTier, resource: 'DRIVERS' };
  }

  const max = sub.driverQuota || plan?.quotas?.drivers || (sub.planTier === 'BASIC' ? 15 : 75);
  const allowed = currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'DRIVERS',
    recommendedPlan,
    message: allowed
      ? undefined
      : `You have reached your driver limit (${currentCount}/${max}). Upgrade your plan to register more drivers.`,
  };
};

/**
 * 5. Checks Corporate Company Quota (Active record count)
 * Basic: 3, Pro: 20, Enterprise: Unlimited
 */
export const checkCompanyQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Company.count({ where: { isDeleted: false, ...tenantCondition } });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: 'ENTERPRISE', resource: 'COMPANIES' };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'COMPANIES',
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to add corporate accounts.',
    };
  }

  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'COMPANIES');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      resource: 'COMPANIES',
      recommendedPlan: 'BASIC',
      message: allowed
        ? undefined
        : `Free setup allowance reached (${Math.max(currentCount, 1)}/1 corporate account). Upgrade to an active paid plan to add more client accounts.`,
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedCompanies || (sub.planTier === 'ENTERPRISE')) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: sub.planTier, resource: 'COMPANIES' };
  }

  const max = sub.companyQuota || plan?.quotas?.companies || (sub.planTier === 'BASIC' ? 3 : 20);
  const allowed = currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'COMPANIES',
    recommendedPlan,
    message: allowed
      ? undefined
      : `You have reached your corporate company limit (${currentCount}/${max}). Upgrade your plan to add more client accounts.`,
  };
};

/**
 * 6. Checks Corporate User Quota (Active record count)
 * Basic: 5, Pro: 25, Enterprise: Unlimited
 */
export const checkUserQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await User.count({ where: { isDeleted: false, ...tenantCondition } });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: 'ENTERPRISE', resource: 'USERS' };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'USERS',
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to register users.',
    };
  }

  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'USERS');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      resource: 'USERS',
      recommendedPlan: 'BASIC',
      message: allowed
        ? undefined
        : `Free setup allowance reached (${Math.max(currentCount, 1)}/1 user). Upgrade to an active paid plan to register more users.`,
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedUsers || (sub.planTier === 'ENTERPRISE')) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: sub.planTier, resource: 'USERS' };
  }

  const max = (sub as any).userQuota || plan?.quotas?.users || (sub.planTier === 'BASIC' ? 5 : 25);
  const allowed = currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'USERS',
    recommendedPlan,
    message: allowed
      ? undefined
      : `You have reached your corporate user limit (${currentCount}/${max}). Upgrade your plan to register more users.`,
  };
};

/**
 * 7. Checks Pickup Area Quota (Active record count)
 */
export const checkPickupAreaQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Pickuparea.count({ where: tenantCondition });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: 'ENTERPRISE', resource: 'PICKUP_AREAS' };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'PICKUP_AREAS',
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan.',
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedPickupAreas || (sub.planTier === 'ENTERPRISE')) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: sub.planTier, resource: 'PICKUP_AREAS' };
  }

  const max = plan?.quotas?.pickupAreas || (sub.planTier === 'BASIC' ? 10 : 50);
  const allowed = currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'PICKUP_AREAS',
    recommendedPlan,
    message: allowed
      ? undefined
      : `You have reached your pickup area limit (${currentCount}/${max}). Upgrade your plan to add more pickup locations.`,
  };
};

/**
 * 8. Checks Pickup City Quota (Active record count)
 */
export const checkPickupCityQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Pickupcity.count({ where: tenantCondition });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: 'ENTERPRISE', resource: 'PICKUP_CITIES' };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'PICKUP_CITIES',
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan.',
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedPickupCities || (sub.planTier === 'ENTERPRISE')) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: sub.planTier, resource: 'PICKUP_CITIES' };
  }

  const max = plan?.quotas?.pickupCities || (sub.planTier === 'BASIC' ? 5 : 25);
  const allowed = currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'PICKUP_CITIES',
    recommendedPlan,
    message: allowed
      ? undefined
      : `You have reached your pickup city limit (${currentCount}/${max}). Upgrade your plan to add more cities.`,
  };
};

/**
 * 9. Checks Package Quota (Active record count)
 */
export const checkPackageQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await PackageData.count({ where: { isDeleted: false, ...tenantCondition } });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: 'ENTERPRISE', resource: 'PACKAGES' };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'PACKAGES',
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan.',
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedPackages || (sub.planTier === 'ENTERPRISE')) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: sub.planTier, resource: 'PACKAGES' };
  }

  const max = plan?.quotas?.packages || (sub.planTier === 'BASIC' ? 5 : 25);
  const allowed = currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'PACKAGES',
    recommendedPlan,
    message: allowed
      ? undefined
      : `You have reached your package limit (${currentCount}/${max}). Upgrade your plan to add more packages.`,
  };
};

/**
 * 10. Checks Payment Mode Quota (Active record count)
 */
export const checkPaymentModeQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await PaymentMode.count({ where: tenantCondition });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: 'ENTERPRISE', resource: 'PAYMENT_MODES' };
  }

  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      resource: 'PAYMENT_MODES',
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan.',
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  if (plan?.isUnlimitedPaymentModes || (sub.planTier === 'ENTERPRISE')) {
    return { allowed: true, current: currentCount, max: 'Unlimited', isUnlimited: true, planTier: sub.planTier, resource: 'PAYMENT_MODES' };
  }

  const max = plan?.quotas?.paymentModes || (sub.planTier === 'BASIC' ? 3 : 10);
  const allowed = currentCount < max;
  const recommendedPlan = sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    isUnlimited: false,
    planTier: sub.planTier,
    resource: 'PAYMENT_MODES',
    recommendedPlan,
    message: allowed
      ? undefined
      : `You have reached your payment mode limit (${currentCount}/${max}). Upgrade your plan to add more payment methods.`,
  };
};

/**
 * Feature Entitlement Check:
 * Enforces boolean/feature access for modules like advancedReports, emailTemplates, smsTemplates, bulkUpload, monthlyInvoicing
 */
export const checkFeatureEntitlement = async (
  tenantId: string,
  featureKey: string
): Promise<{ allowed: boolean; planTier: string; recommendedPlan: string; message?: string }> => {
  const isRoot = tenantId === ROOT_TENANT_ID;
  if (isRoot) return { allowed: true, planTier: 'ENTERPRISE', recommendedPlan: 'ENTERPRISE' };

  const sub = await getOrCreateSubscription(tenantId);
  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      planTier: sub.planTier,
      recommendedPlan: 'PRO',
      message: 'Subscription has expired or is suspended. Please renew your plan to access this feature.',
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  const ents = plan?.featureEntitlements || {};

  const isEnabled = Boolean(ents[featureKey] ?? (sub.planTier === 'ENTERPRISE' || (sub.planTier === 'PRO' && ['advancedReports', 'emailTemplates', 'smsTemplates', 'bulkUpload', 'monthlyInvoicing', 'onCallInvoicing'].includes(featureKey))));

  if (!isEnabled) {
    return {
      allowed: false,
      planTier: sub.planTier,
      recommendedPlan: sub.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE',
      message: 'This feature is not included in your current plan. Upgrade to access it.',
    };
  }

  return { allowed: true, planTier: sub.planTier, recommendedPlan: sub.planTier };
};

/**
 * Theme Entitlement Check:
 * Basic: STANDARD only (no presets, no custom color editing)
 * Pro: PRESETS allowed
 * Enterprise: CUSTOM allowed
 */
export const checkThemeEntitlement = async (
  tenantId: string,
  requestedLevel: 'STANDARD' | 'PRESETS' | 'CUSTOM'
): Promise<{ allowed: boolean; planTier: string; allowedLevel: string; recommendedPlan: string; message?: string }> => {
  const isRoot = tenantId === ROOT_TENANT_ID;
  if (isRoot) return { allowed: true, planTier: 'ENTERPRISE', allowedLevel: 'CUSTOM', recommendedPlan: 'ENTERPRISE' };

  const sub = await getOrCreateSubscription(tenantId);
  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      planTier: sub.planTier,
      allowedLevel: 'STANDARD',
      recommendedPlan: 'PRO',
      message: 'Subscription has expired or is suspended. Please renew your plan to customize themes.',
    };
  }

  const plan = await getPlanDefinition(sub.planTier || 'BASIC');
  const allowedLevel: 'STANDARD' | 'PRESETS' | 'CUSTOM' = plan?.themeLevel || (sub.planTier === 'ENTERPRISE' ? 'CUSTOM' : sub.planTier === 'PRO' ? 'PRESETS' : 'STANDARD');

  if (requestedLevel === 'STANDARD') {
    return { allowed: true, planTier: sub.planTier, allowedLevel, recommendedPlan: sub.planTier };
  }

  if (requestedLevel === 'CUSTOM') {
    if (allowedLevel !== 'CUSTOM') {
      return {
        allowed: false,
        planTier: sub.planTier,
        allowedLevel,
        recommendedPlan: 'ENTERPRISE',
        message: 'Full custom color palette and branding is exclusive to the Enterprise Mobility plan. Upgrade to access it.',
      };
    }
  } else if (requestedLevel === 'PRESETS') {
    if (allowedLevel === 'STANDARD') {
      return {
        allowed: false,
        planTier: sub.planTier,
        allowedLevel,
        recommendedPlan: 'PRO',
        message: 'Theme presets are not included in your Basic plan. Upgrade to Pro to unlock curated theme presets.',
      };
    }
  }

  return { allowed: true, planTier: sub.planTier, allowedLevel, recommendedPlan: sub.planTier };
};

/**
 * Computes authoritative summary of all quotas and entitlements for a tenant.
 */
export const getTenantEntitlementsSummary = async (tenantId: string) => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;
  const isExpired = isSubscriptionExpired(sub);
  const billingPeriod = getBillingPeriodDates(sub);
  const plan = await getPlanDefinition(sub.planTier || (isRoot ? 'ENTERPRISE' : 'BASIC'));

  const [
    vCheck,
    bCheck,
    tCheck,
    dCheck,
    cCheck,
    uCheck,
    areaCheck,
    cityCheck,
    pkgCheck,
    pmCheck,
  ] = await Promise.all([
    checkVehicleQuota(tenantId),
    checkBookingQuota(tenantId),
    checkTaxQuota(tenantId),
    checkDriverQuota(tenantId),
    checkCompanyQuota(tenantId),
    checkUserQuota(tenantId),
    checkPickupAreaQuota(tenantId),
    checkPickupCityQuota(tenantId),
    checkPackageQuota(tenantId),
    checkPaymentModeQuota(tenantId),
  ]);

  return {
    planTier: isRoot ? 'ENTERPRISE' : sub.planTier,
    status: sub.status,
    isExpired,
    billingCycle: sub.billingCycle || 'MONTHLY',
    billingPeriod,
    themeLevel: plan?.themeLevel || (sub.planTier === 'ENTERPRISE' ? 'CUSTOM' : sub.planTier === 'PRO' ? 'PRESETS' : 'STANDARD'),
    themePresets: ['terracotta', 'emerald', 'slate', 'indigo'],
    quotas: {
      vehicles: { current: vCheck.current, max: vCheck.max, isUnlimited: Boolean(vCheck.isUnlimited) },
      bookings: { current: bCheck.current, max: bCheck.max, isUnlimited: Boolean(bCheck.isUnlimited), nextResetDate: billingPeriod.nextResetDate },
      taxes: { current: tCheck.current, max: tCheck.max, isUnlimited: Boolean(tCheck.isUnlimited) },
      drivers: { current: dCheck.current, max: dCheck.max, isUnlimited: Boolean(dCheck.isUnlimited) },
      companies: { current: cCheck.current, max: cCheck.max, isUnlimited: Boolean(cCheck.isUnlimited) },
      users: { current: uCheck.current, max: uCheck.max, isUnlimited: Boolean(uCheck.isUnlimited) },
      pickupAreas: { current: areaCheck.current, max: areaCheck.max, isUnlimited: Boolean(areaCheck.isUnlimited) },
      pickupCities: { current: cityCheck.current, max: cityCheck.max, isUnlimited: Boolean(cityCheck.isUnlimited) },
      packages: { current: pkgCheck.current, max: pkgCheck.max, isUnlimited: Boolean(pkgCheck.isUnlimited) },
      paymentModes: { current: pmCheck.current, max: pmCheck.max, isUnlimited: Boolean(pmCheck.isUnlimited) },
    },
    features: {
      themeLevel: plan?.themeLevel || (sub.planTier === 'ENTERPRISE' ? 'CUSTOM' : sub.planTier === 'PRO' ? 'PRESETS' : 'STANDARD'),
      themePresets: ['terracotta', 'emerald', 'slate', 'indigo'],
      customBranding: Boolean(plan?.featureEntitlements?.customBranding ?? (sub.planTier !== 'BASIC')),
      advancedReports: Boolean(plan?.featureEntitlements?.advancedReports ?? (sub.planTier !== 'BASIC')),
      emailTemplates: Boolean(plan?.featureEntitlements?.emailTemplates ?? (sub.planTier !== 'BASIC')),
      smsTemplates: Boolean(plan?.featureEntitlements?.smsTemplates ?? (sub.planTier !== 'BASIC')),
      bulkUpload: Boolean(plan?.featureEntitlements?.bulkUpload ?? (sub.planTier !== 'BASIC')),
      monthlyInvoicing: Boolean(plan?.featureEntitlements?.monthlyInvoicing ?? (sub.planTier !== 'BASIC')),
      onCallInvoicing: Boolean(plan?.featureEntitlements?.onCallInvoicing ?? (sub.planTier !== 'BASIC')),
      pdfCustomizationTier: plan?.featureEntitlements?.pdfCustomizationTier || (sub.planTier === 'ENTERPRISE' ? 'ADVANCED' : sub.planTier === 'PRO' ? 'BRANDED' : 'STANDARD'),
    },
  };
};

/**
 * Tracks variable operational telemetry in tenant_usage_meters.
 */
export const trackTelemetry = async (
  tenantId: string,
  metricName: 'SMS' | 'MAPS' | 'STORAGE' | 'TRIPS',
  quantity: number = 1
): Promise<void> => {
  try {
    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let meter = await TenantUsageMeter.findOne({
      where: { tenantId, billingMonth, metricName },
    });

    if (meter) {
      await meter.increment('quantity', { by: quantity });
    } else {
      await TenantUsageMeter.create({
        tenantId,
        billingMonth,
        metricName,
        quantity,
      });
    }
  } catch (err) {
    console.error(`Telemetry tracking error for ${metricName}:`, err);
  }
};
