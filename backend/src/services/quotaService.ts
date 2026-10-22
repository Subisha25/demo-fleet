import { TenantSubscription } from '../models/tenantSubscription';
import { TenantUsageMeter } from '../models/tenantUsageMeter';
import { Vehicle } from '../models/vehicle';
import { Drivers } from '../models/drivers';
import { Company } from '../models/company';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { Op } from 'sequelize';

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
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }
  return sub;
};

/**
 * Checks vehicle fleet quota.
 */
export const checkVehicleQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const tenantCondition = tenantId === ROOT_TENANT_ID
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Vehicle.count({ where: { isDeleted: false, ...tenantCondition } });

  const max = sub.vehicleQuota;
  const allowed = currentCount < max || sub.planTier === 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    planTier: sub.planTier,
    message: allowed
      ? undefined
      : `Vehicle quota reached (${currentCount}/${max}). Upgrade to add more vehicles.`,
  };
};

/**
 * Checks driver roster quota.
 */
export const checkDriverQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const tenantCondition = tenantId === ROOT_TENANT_ID
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Drivers.count({ where: { isDeleted: false, ...tenantCondition } });

  const max = sub.driverQuota;
  const allowed = currentCount < max || sub.planTier === 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    planTier: sub.planTier,
    message: allowed
      ? undefined
      : `Driver limit reached (${currentCount}/${max}). Upgrade to register more drivers.`,
  };
};

/**
 * Checks corporate client quota.
 */
export const checkCompanyQuota = async (tenantId: string): Promise<QuotaCheckResult> => {
  const sub = await getOrCreateSubscription(tenantId);
  const tenantCondition = tenantId === ROOT_TENANT_ID
    ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
    : { tenantId };
  const currentCount = await Company.count({ where: { isDeleted: false, ...tenantCondition } });

  const max = sub.companyQuota;
  const allowed = currentCount < max || sub.planTier === 'ENTERPRISE';

  return {
    allowed,
    current: currentCount,
    max,
    planTier: sub.planTier,
    message: allowed
      ? undefined
      : `Corporate company limit reached (${currentCount}/${max}). Upgrade to add more client accounts.`,
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
