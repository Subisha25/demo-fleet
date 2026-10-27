import { TenantSubscription } from '../models/tenantSubscription';
import { TenantUsageMeter } from '../models/tenantUsageMeter';
import { Vehicle } from '../models/vehicle';
import { Drivers } from '../models/drivers';
import { Company } from '../models/company';
import { Booking } from '../models/booking';
import { TenantInitialAllowance } from '../models/tenantInitialAllowance';
import sequelize from '../config/dbConfig';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { Op, Transaction } from 'sequelize';

export interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  max: number;
  planTier: string;
  message?: string;
}

export interface PlanDefinition {
  planTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  priceMonthlyINR: number;
  priceAnnualINR: number;
  priceMonthlyUSD: number;
  billingFrequency: 'MONTHLY' | 'ANNUAL';
  features: string[];
  quotas: {
    vehicles: number;
    drivers: number;
    companies: number;
    trips: number;
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
    trips: 1000,
    sms: 500,
    maps: 1000,
    storageGb: 5,
  },
  PRO: {
    vehicles: 75,
    drivers: 75,
    companies: 20,
    employees: 25,
    trips: 10000,
    sms: 5000,
    maps: 10000,
    storageGb: 25,
  },
  ENTERPRISE: {
    vehicles: 250,
    drivers: 250,
    companies: 100,
    employees: 100,
    trips: 50000,
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
    features: [
      'Fleet & Driver Operations (Up to 15 Vehicles / 15 Drivers)',
      'Up to 3 Corporate Client Accounts',
      'Basic Booking-to-Invoice Lifecycle & Dispatch',
      'Automated Standard Tax & Trip Rate Calculation',
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
    features: [
      'Expanded Fleet Management (Up to 75 Vehicles / 75 Drivers)',
      'Up to 20 Corporate Client Accounts',
      'On-Call, Monthly Consolidated & Spot Trip Invoicing',
      'Advanced Tenant Branding & Portal Theming',
      'Dynamic Corporate Booking Policies & Domain Validation',
      'Route Card Aggregation & Financial Summary Reports',
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
    features: [
      'High-Volume Fleet Operations (Up to 250 Vehicles / 250 Drivers)',
      'Up to 100 Corporate Client Accounts',
      'Full Multi-Tenant SaaS Isolation & Custom Domains',
      'Dedicated Database Tenant Scoping & Policy Engine',
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

import { SaaSPlan } from '../models/saasPlan';
import { User } from '../models/user';

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
        featureEntitlements: dbPlan.featureEntitlements || {},
        isUnlimitedVehicles: dbPlan.isUnlimitedVehicles,
        isUnlimitedDrivers: dbPlan.isUnlimitedDrivers,
        isUnlimitedCompanies: dbPlan.isUnlimitedCompanies,
        isUnlimitedUsers: dbPlan.isUnlimitedUsers,
        isUnlimitedTrips: dbPlan.isUnlimitedTrips,
        quotas: {
          vehicles: dbPlan.maxVehicles,
          drivers: dbPlan.maxDrivers,
          companies: dbPlan.maxCompanies,
          users: dbPlan.maxUsers,
          trips: dbPlan.monthlyTripQuota,
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
 * Gets or creates the subscription for a tenant.
 */
export const getOrCreateSubscription = async (tenantId: string): Promise<TenantSubscription> => {
  let sub = await TenantSubscription.findOne({ where: { tenantId } });
  if (!sub) {
    // Default root tenant or newly registered tenant gets PRO or defaults
    const isRoot = tenantId === ROOT_TENANT_ID;
    sub = await TenantSubscription.create({
      tenantId,
      planTier: isRoot ? 'PRO' : 'BASIC',
      status: 'ACTIVE',
      vehicleQuota: isRoot ? PLAN_LIMITS.PRO.vehicles : PLAN_LIMITS.BASIC.vehicles,
      driverQuota: isRoot ? PLAN_LIMITS.PRO.drivers : PLAN_LIMITS.BASIC.drivers,
      companyQuota: isRoot ? PLAN_LIMITS.PRO.companies : PLAN_LIMITS.BASIC.companies,
      monthlyTripQuota: isRoot ? PLAN_LIMITS.PRO.trips : PLAN_LIMITS.BASIC.trips,
      allowOverage: isRoot,
      monthlyOverageSpendCap: 2000,
      billingCycle: 'MONTHLY',
      agreedPrice: isRoot ? 349 : 299,
      currency: 'INR',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }
  return sub;
};

/**
 * Evaluates whether a subscription is expired or suspended.
 * Returns true if status is SUSPENDED/CANCELED or if currentPeriodEnd is in the past.
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
  module: 'VEHICLES' | 'DRIVERS' | 'COMPANIES' | 'USERS' | 'BOOKINGS'
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
 * Concurrency-safe check and consumption of the one-time initial free allowance.
 * Uses atomic DB transaction with row-level locking (SELECT ... FOR UPDATE) to ensure
 * two simultaneous requests cannot exceed the single-record allowance.
 */
export const checkAndConsumeAllowance = async (
  tenantId: string,
  module: 'VEHICLES' | 'DRIVERS' | 'COMPANIES' | 'USERS' | 'BOOKINGS',
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

/**
 * Rolls back the initial allowance if a record creation fails downstream.
 * Ensures atomicity: a failed record creation will not consume the one-time allowance.
 */
export const rollbackAllowance = async (
  tenantId: string,
  module: 'VEHICLES' | 'DRIVERS' | 'COMPANIES' | 'USERS' | 'BOOKINGS'
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
 * Checks vehicle fleet quota.
 * Enforces 1-record free setup allowance when TRIALING, blocks when EXPIRED/SUSPENDED, and validates plan quota when ACTIVE.
 */
export const checkVehicleQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Vehicle.count({ where: { isDeleted: false, ...tenantCondition } });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: -1, planTier: 'PRO' };
  }

  // 1. Block operations if subscription is expired or suspended
  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to add vehicles.',
    };
  }

  // 2. Initial free setup allowance for unpaid / trialing tenants: strictly 1 vehicle
  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'VEHICLES');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      message: allowed
        ? undefined
        : `Free setup allowance reached (${Math.max(currentCount, 1)}/1 vehicle). Upgrade to an active paid plan to add more vehicles.`,
    };
  }

  // 3. Active paid plan quota verification
  const plan = await getPlanDefinition(sub.planTier || 'PRO');
  if (plan?.isUnlimitedVehicles || sub.vehicleQuota >= 999999) {
    return { allowed: true, current: currentCount, max: -1, planTier: sub.planTier };
  }

  const max = sub.vehicleQuota || plan?.quotas?.vehicles || 15;
  const allowed = currentCount < max;

  return {
    allowed,
    current: currentCount,
    max,
    planTier: sub.planTier,
    message: allowed
      ? undefined
      : `Vehicle quota reached (${currentCount}/${max}). Upgrade your SaaS plan to add more vehicles.`,
  };
};

/**
 * Checks driver roster quota.
 * Enforces 1-record free setup allowance when TRIALING, blocks when EXPIRED/SUSPENDED, and validates plan quota when ACTIVE.
 */
export const checkDriverQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Drivers.count({ where: { isDeleted: false, ...tenantCondition } });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: -1, planTier: 'PRO' };
  }

  // 1. Block operations if subscription is expired or suspended
  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to register drivers.',
    };
  }

  // 2. Initial free setup allowance for unpaid / trialing tenants: strictly 1 driver
  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'DRIVERS');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      message: allowed
        ? undefined
        : `Free setup allowance reached (${Math.max(currentCount, 1)}/1 driver). Upgrade to an active paid plan to register more drivers.`,
    };
  }

  // 3. Active paid plan quota verification
  const plan = await getPlanDefinition(sub.planTier || 'PRO');
  if (plan?.isUnlimitedDrivers || sub.driverQuota >= 999999) {
    return { allowed: true, current: currentCount, max: -1, planTier: sub.planTier };
  }

  const max = sub.driverQuota || plan?.quotas?.drivers || 15;
  const allowed = currentCount < max;

  return {
    allowed,
    current: currentCount,
    max,
    planTier: sub.planTier,
    message: allowed
      ? undefined
      : `Driver limit reached (${currentCount}/${max}). Upgrade your SaaS plan to register more drivers.`,
  };
};

/**
 * Checks corporate client company quota.
 * Enforces 1-record free setup allowance when TRIALING, blocks when EXPIRED/SUSPENDED, and validates plan quota when ACTIVE.
 */
export const checkCompanyQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Company.count({ where: { isDeleted: false, ...tenantCondition } });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: -1, planTier: 'PRO' };
  }

  // 1. Block operations if subscription is expired or suspended
  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to add corporate accounts.',
    };
  }

  // 2. Initial free setup allowance for unpaid / trialing tenants: strictly 1 company
  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'COMPANIES');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      message: allowed
        ? undefined
        : `Free setup allowance reached (${Math.max(currentCount, 1)}/1 corporate account). Upgrade to an active paid plan to add more client accounts.`,
    };
  }

  // 3. Active paid plan quota verification
  const plan = await getPlanDefinition(sub.planTier || 'PRO');
  if (plan?.isUnlimitedCompanies || sub.companyQuota >= 999999) {
    return { allowed: true, current: currentCount, max: -1, planTier: sub.planTier };
  }

  const max = sub.companyQuota || plan?.quotas?.companies || 3;
  const allowed = currentCount < max;

  return {
    allowed,
    current: currentCount,
    max,
    planTier: sub.planTier,
    message: allowed
      ? undefined
      : `Corporate company limit reached (${currentCount}/${max}). Upgrade your SaaS plan to add more client accounts.`,
  };
};

/**
 * Checks corporate user / employee quota.
 * Enforces 1-record free setup allowance when TRIALING, blocks when EXPIRED/SUSPENDED, and validates plan quota when ACTIVE.
 */
export const checkUserQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await User.count({ where: { isDeleted: false, ...tenantCondition } });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: -1, planTier: sub.planTier };
  }

  // 1. Block operations if subscription is expired or suspended
  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to register users.',
    };
  }

  // 2. Initial free setup allowance for unpaid / trialing tenants: strictly 1 user
  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'USERS');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      message: allowed
        ? undefined
        : `Free setup allowance reached (${Math.max(currentCount, 1)}/1 user). Upgrade to an active paid plan to register more users.`,
    };
  }

  // 3. Active paid plan quota verification
  const plan = await getPlanDefinition(sub.planTier || 'PRO');
  if (plan?.isUnlimitedUsers || (sub as any).userQuota >= 999999) {
    return { allowed: true, current: currentCount, max: -1, planTier: sub.planTier };
  }

  const max = (sub as any).userQuota || plan?.quotas?.users || 25;
  const allowed = currentCount < max;

  return {
    allowed,
    current: currentCount,
    max,
    planTier: sub.planTier,
    message: allowed
      ? undefined
      : `User limit reached (${currentCount}/${max}). Upgrade your SaaS plan to register more users.`,
  };
};

/**
 * Checks booking / trip creation quota.
 * Enforces 1-booking free setup allowance when TRIALING, blocks when EXPIRED/SUSPENDED, and validates plan trip quota when ACTIVE.
 */
export const checkBookingQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const isRoot = tenantId === ROOT_TENANT_ID;

  const tenantCondition = isRoot
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Booking.count({ where: tenantCondition });

  if (isRoot) {
    return { allowed: true, current: currentCount, max: -1, planTier: 'PRO' };
  }

  // 1. Block operations if subscription is expired or suspended
  if (isSubscriptionExpired(sub)) {
    return {
      allowed: false,
      current: currentCount,
      max: 0,
      planTier: sub.planTier,
      message: 'Subscription has expired or is suspended due to unpaid renewal. Please renew your plan to create bookings.',
    };
  }

  // 2. Initial free setup allowance for unpaid / trialing tenants: strictly 1 booking
  if (sub.status === 'TRIALING') {
    const consumed = await isInitialAllowanceConsumed(tenantId, 'BOOKINGS');
    const allowed = !consumed && currentCount < 1;
    return {
      allowed,
      current: currentCount,
      max: 1,
      planTier: sub.planTier,
      message: allowed
        ? undefined
        : `Free trial booking allowance reached (${Math.max(currentCount, 1)}/1 booking). Upgrade to an active paid plan to dispatch more trips.`,
    };
  }

  // 3. Active plan allows bookings within monthly quota
  const plan = await getPlanDefinition(sub.planTier || 'PRO');
  if (plan?.isUnlimitedTrips || sub.monthlyTripQuota >= 999999) {
    return { allowed: true, current: currentCount, max: -1, planTier: sub.planTier };
  }

  const max = sub.monthlyTripQuota || plan?.quotas?.trips || 1000;
  const allowed = sub.allowOverage || currentCount < max;

  return {
    allowed,
    current: currentCount,
    max,
    planTier: sub.planTier,
    message: allowed
      ? undefined
      : `Monthly trip quota reached (${currentCount}/${max}). Upgrade your SaaS plan to dispatch more trips.`,
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
