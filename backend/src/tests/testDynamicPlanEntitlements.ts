/**
 * Dynamic SaaS Plan, Menu-by-Menu Entitlements & Theme Verification Suite
 *
 * Validates dynamic DB-backed quotas for Basic, Pro, and Enterprise tiers,
 * monthly/yearly period rules, theme customization levels, and API middlewares.
 */

import sequelize from '../config/dbConfig';
import { SaaSPlan } from '../models/saasPlan';
import { TenantSubscription } from '../models/tenantSubscription';
import { Tenant } from '../models/tenant';
import { Tax } from '../models/tax';
import { Booking } from '../models/booking';
import { Vehicle } from '../models/vehicle';
import {
  getPlanDefinition,
  checkTaxQuota,
  checkBookingQuota,
  checkVehicleQuota,
  checkDriverQuota,
  checkCompanyQuota,
  checkPickupAreaQuota,
  checkPickupCityQuota,
  checkPackageQuota,
  checkPaymentModeQuota,
  checkThemeEntitlement,
  getBillingPeriodDates,
  isSubscriptionExpired,
  getTenantEntitlementsSummary,
  PLAN_LIMITS,
} from '../services/quotaService';
import {
  requireTaxQuota,
  requireThemeCustomization,
  requireBookingQuota,
} from '../middleware/entitlementMiddleware';
import { runWithTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { updateSaaSPlan, createSaaSPlan } from '../services/tenantService';

interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(id: number, name: string, condition: boolean, details?: string) {
  results.push({ id, name, passed: condition, details });
  if (condition) {
    console.log(`  \x1b[32m✔ [PASS]\x1b[0m Test ${id}: ${name}`);
  } else {
    console.error(`  \x1b[31m✘ [FAIL]\x1b[0m Test ${id}: ${name} - ${details || 'Assertion failed'}`);
  }
}

function mockReqRes(reqPartial: any = {}) {
  let statusCode = 200;
  let jsonPayload: any = null;
  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (payload: any) => {
      jsonPayload = payload;
      return res;
    },
    send: (payload: any) => {
      jsonPayload = payload;
      return res;
    },
    on: (_evt: string, _cb: any) => res,
  };
  const req: any = {
    params: {},
    query: {},
    body: {},
    headers: {},
    user: { role: 'FLEET_ADMIN', email: 'fleet@test.com' },
    ...reqPartial,
  };
  return { req, res, getResult: () => ({ status: statusCode, json: jsonPayload }) };
}

export async function runDynamicPlanEntitlementsTests(): Promise<boolean> {
  console.log('\n================================================================');
  console.log(' FLEETFLOW DYNAMIC SAAS PLAN & ENTITLEMENTS VERIFICATION SUITE ');
  console.log('================================================================\n');

  try {
    await sequelize.authenticate();

    // -------------------------------------------------------------
    // TEST 1: Database Schema Verification for 04 Migration Columns
    // -------------------------------------------------------------
    const [planCols]: any = await sequelize.query('SHOW COLUMNS FROM `saas_plans`');
    const planColNames = planCols.map((c: any) => c.Field);

    const requiredPlanCols = [
      'maxTaxes',
      'isUnlimitedTaxes',
      'themeLevel',
      'maxPickupAreas',
      'isUnlimitedPickupAreas',
      'maxPickupCities',
      'isUnlimitedPickupCities',
      'maxPackages',
      'isUnlimitedPackages',
      'maxPaymentModes',
      'isUnlimitedPaymentModes',
      'annualTripQuota',
    ];
    const missingPlanCols = requiredPlanCols.filter((col) => !planColNames.includes(col));
    assert(
      1,
      'saas_plans table contains all dynamic entitlement columns',
      missingPlanCols.length === 0,
      missingPlanCols.length > 0 ? `Missing: ${missingPlanCols.join(', ')}` : undefined
    );

    // -------------------------------------------------------------
    // TEST 2: tenant_subscriptions table contains new quota columns
    // -------------------------------------------------------------
    const [subCols]: any = await sequelize.query('SHOW COLUMNS FROM `tenant_subscriptions`');
    const subColNames = subCols.map((c: any) => c.Field);

    const requiredSubCols = ['taxQuota', 'isUnlimitedVehicles', 'isUnlimitedTrips', 'isUnlimitedTaxes'];
    const missingSubCols = requiredSubCols.filter((col) => !subColNames.includes(col));
    assert(
      2,
      'tenant_subscriptions table contains taxQuota and unlimited flags',
      missingSubCols.length === 0,
      missingSubCols.length > 0 ? `Missing: ${missingSubCols.join(', ')}` : undefined
    );

    // -------------------------------------------------------------
    // TEST 3: Basic Plan DB Entitlements Conform to Requirements
    // 15 vehicles, 100 bookings/mo, 1 tax configuration, STANDARD theme
    // -------------------------------------------------------------
    const basicPlan = await getPlanDefinition('BASIC');
    const t3Pass =
      basicPlan &&
      basicPlan.quotas.vehicles === 15 &&
      basicPlan.quotas.trips === 100 &&
      basicPlan.quotas.taxes === 1 &&
      basicPlan.themeLevel === 'STANDARD' &&
      basicPlan.isUnlimitedVehicles === false &&
      basicPlan.isUnlimitedTrips === false &&
      basicPlan.isUnlimitedTaxes === false;

    assert(
      3,
      'Basic Plan in DB has 15 vehicles, 100 bookings/mo, 1 tax config, STANDARD theme',
      Boolean(t3Pass),
      `Vehicles: ${basicPlan?.quotas?.vehicles}, Trips: ${basicPlan?.quotas?.trips}, Taxes: ${basicPlan?.quotas?.taxes}, Theme: ${basicPlan?.themeLevel}`
    );

    // -------------------------------------------------------------
    // TEST 4: Pro Plan DB Entitlements Conform to Confirmed Requirements
    // 250 bookings/mo (user-confirmed), 2 tax configs, PRESETS theme
    // -------------------------------------------------------------
    const proPlan = await getPlanDefinition('PRO');
    const t4Pass =
      proPlan &&
      proPlan.quotas.trips === 250 &&
      proPlan.quotas.taxes === 2 &&
      proPlan.themeLevel === 'PRESETS' &&
      Array.isArray(proPlan.themePresets) &&
      proPlan.themePresets.includes('terracotta') &&
      proPlan.themePresets.includes('emerald') &&
      proPlan.themePresets.includes('slate') &&
      proPlan.themePresets.includes('indigo');

    assert(
      4,
      'Pro Plan in DB has 250 bookings/mo (user-confirmed), 2 tax configs, PRESETS theme (4 presets)',
      Boolean(t4Pass),
      `Trips: ${proPlan?.quotas?.trips}, Taxes: ${proPlan?.quotas?.taxes}, Theme: ${proPlan?.themeLevel}, Presets: ${proPlan?.themePresets?.join(', ')}`
    );

    // -------------------------------------------------------------
    // TEST 5: Enterprise Plan DB Entitlements Conform to Unlimited Requirements
    // Unlimited vehicles, trips, taxes, and CUSTOM theme
    // -------------------------------------------------------------
    const enterprisePlan = await getPlanDefinition('ENTERPRISE');
    const t5Pass =
      enterprisePlan &&
      enterprisePlan.isUnlimitedVehicles === true &&
      enterprisePlan.isUnlimitedTrips === true &&
      enterprisePlan.isUnlimitedTaxes === true &&
      enterprisePlan.themeLevel === 'CUSTOM' &&
      enterprisePlan.quotas.vehicles === -1 &&
      enterprisePlan.quotas.trips === -1 &&
      enterprisePlan.quotas.taxes === -1;

    assert(
      5,
      'Enterprise Plan has unlimited vehicles, unlimited trips, unlimited taxes, and CUSTOM theme',
      Boolean(t5Pass),
      `UnlimitedVehicles: ${enterprisePlan?.isUnlimitedVehicles}, UnlimitedTrips: ${enterprisePlan?.isUnlimitedTrips}, UnlimitedTaxes: ${enterprisePlan?.isUnlimitedTaxes}, Theme: ${enterprisePlan?.themeLevel}`
    );

    // -------------------------------------------------------------
    // TEST 6: Period-Based Billing Calculation
    // Asserts monthly billing period start/end boundaries
    // -------------------------------------------------------------
    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const mockSubMonthly: any = {
      billingCycle: 'MONTHLY',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      status: 'ACTIVE',
    };
    const periodInfo = getBillingPeriodDates(mockSubMonthly);
    const t6Pass =
      periodInfo.cycle === 'MONTHLY' &&
      periodInfo.start.getTime() === periodStart.getTime() &&
      periodInfo.end.getTime() === periodEnd.getTime();

    assert(
      6,
      'Billing period date calculator accurately computes monthly cycle boundaries',
      t6Pass,
      `Start: ${periodInfo.start.toISOString()}, End: ${periodInfo.end.toISOString()}`
    );

    // -------------------------------------------------------------
    // TEST 7: Subscription Expiry & Suspension Evaluation
    // -------------------------------------------------------------
    const activeSub: any = { status: 'ACTIVE', currentPeriodEnd: new Date(Date.now() + 86400000) };
    const expiredSub: any = { status: 'ACTIVE', currentPeriodEnd: new Date(Date.now() - 86400000) };
    const suspendedSub: any = { status: 'SUSPENDED', currentPeriodEnd: new Date(Date.now() + 86400000) };

    const t7Pass =
      !isSubscriptionExpired(activeSub) &&
      isSubscriptionExpired(expiredSub) &&
      isSubscriptionExpired(suspendedSub);

    assert(
      7,
      'Subscription expiration logic correctly identifies active vs expired vs suspended states',
      t7Pass,
      `Active: ${isSubscriptionExpired(activeSub)}, Expired: ${isSubscriptionExpired(expiredSub)}, Suspended: ${isSubscriptionExpired(suspendedSub)}`
    );

    // -------------------------------------------------------------
    // TEST 8: Theme Entitlement Checks for Basic, Pro, and Enterprise
    // -------------------------------------------------------------
    // Create an isolated in-memory or ephemeral tenant verification
    const testBasicTenantId = 'b0000000-0000-0000-0000-000000000001';
    const testProTenantId = 'b0000000-0000-0000-0000-000000000002';
    const testEntTenantId = 'b0000000-0000-0000-0000-000000000003';

    await Tenant.findOrCreate({
      where: { tenantId: testBasicTenantId },
      defaults: {
        tenantId: testBasicTenantId,
        name: 'Basic Test Tenant',
        code: 'BASIC_TST',
        status: 'ACTIVE',
        planTier: 'BASIC',
      },
    });

    await Tenant.findOrCreate({
      where: { tenantId: testProTenantId },
      defaults: {
        tenantId: testProTenantId,
        name: 'Pro Test Tenant',
        code: 'PRO_TST',
        status: 'ACTIVE',
        planTier: 'PRO',
      },
    });

    await Tenant.findOrCreate({
      where: { tenantId: testEntTenantId },
      defaults: {
        tenantId: testEntTenantId,
        name: 'Enterprise Test Tenant',
        code: 'ENT_TST',
        status: 'ACTIVE',
        planTier: 'ENTERPRISE',
      },
    });

    // Mock subscriptions in DB safely for entitlement checking
    await TenantSubscription.upsert({
      tenantId: testBasicTenantId,
      planTier: 'BASIC',
      status: 'ACTIVE',
      vehicleQuota: 15,
      driverQuota: 15,
      companyQuota: 3,
      monthlyTripQuota: 100,
      taxQuota: 1,
      isUnlimitedVehicles: false,
      isUnlimitedTrips: false,
      isUnlimitedTaxes: false,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    });

    await TenantSubscription.upsert({
      tenantId: testProTenantId,
      planTier: 'PRO',
      status: 'ACTIVE',
      vehicleQuota: 75,
      driverQuota: 75,
      companyQuota: 20,
      monthlyTripQuota: 250,
      taxQuota: 2,
      isUnlimitedVehicles: false,
      isUnlimitedTrips: false,
      isUnlimitedTaxes: false,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    });

    await TenantSubscription.upsert({
      tenantId: testEntTenantId,
      planTier: 'ENTERPRISE',
      status: 'ACTIVE',
      vehicleQuota: 0,
      driverQuota: 0,
      companyQuota: 0,
      monthlyTripQuota: 0,
      taxQuota: 0,
      isUnlimitedVehicles: true,
      isUnlimitedTrips: true,
      isUnlimitedTaxes: true,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    });

    // Check Basic theme restrictions
    const basicStandardCheck = await checkThemeEntitlement(testBasicTenantId, 'STANDARD');
    const basicPresetsCheck = await checkThemeEntitlement(testBasicTenantId, 'PRESETS');
    const basicCustomCheck = await checkThemeEntitlement(testBasicTenantId, 'CUSTOM');

    const t8BasicPass = basicStandardCheck.allowed && !basicPresetsCheck.allowed && !basicCustomCheck.allowed;
    assert(
      8,
      'Theme Entitlement: Basic plan permits STANDARD theme only, rejects PRESETS and CUSTOM',
      t8BasicPass,
      `Standard: ${basicStandardCheck.allowed}, Presets: ${basicPresetsCheck.allowed}, Custom: ${basicCustomCheck.allowed}`
    );

    // -------------------------------------------------------------
    // TEST 9: Theme Entitlement Checks for Pro & Enterprise
    // -------------------------------------------------------------
    const proPresetsCheck = await checkThemeEntitlement(testProTenantId, 'PRESETS');
    const proCustomCheck = await checkThemeEntitlement(testProTenantId, 'CUSTOM');
    const entCustomCheck = await checkThemeEntitlement(testEntTenantId, 'CUSTOM');

    const t9Pass = proPresetsCheck.allowed && !proCustomCheck.allowed && entCustomCheck.allowed;
    assert(
      9,
      'Theme Entitlement: Pro permits PRESETS but rejects CUSTOM; Enterprise permits full CUSTOM',
      t9Pass,
      `ProPresets: ${proPresetsCheck.allowed}, ProCustom: ${proCustomCheck.allowed}, EntCustom: ${entCustomCheck.allowed}`
    );

    // -------------------------------------------------------------
    // TEST 10: Tax Quota Enforcement (Basic: 1 max, Pro: 2 max, Ent: Unlimited)
    // -------------------------------------------------------------
    const basicTaxQuota = await checkTaxQuota(testBasicTenantId);
    const proTaxQuota = await checkTaxQuota(testProTenantId);
    const entTaxQuota = await checkTaxQuota(testEntTenantId);

    const t10Pass =
      basicTaxQuota.max === 1 &&
      proTaxQuota.max === 2 &&
      entTaxQuota.max === 'Unlimited' &&
      entTaxQuota.isUnlimited === true;

    assert(
      10,
      'Tax Quota: Basic max is 1, Pro max is 2, Enterprise is Unlimited',
      Boolean(t10Pass),
      `Basic: ${basicTaxQuota.max}, Pro: ${proTaxQuota.max}, Enterprise: ${entTaxQuota.max}`
    );

    // -------------------------------------------------------------
    // TEST 11: Booking Quota Enforcement (Basic: 100/mo, Pro: 250/mo, Ent: Unlimited)
    // -------------------------------------------------------------
    const basicBookingQuota = await checkBookingQuota(testBasicTenantId);
    const proBookingQuota = await checkBookingQuota(testProTenantId);
    const entBookingQuota = await checkBookingQuota(testEntTenantId);

    const t11Pass =
      basicBookingQuota.max === 100 &&
      proBookingQuota.max === 250 &&
      entBookingQuota.max === 'Unlimited' &&
      entBookingQuota.isUnlimited === true;

    assert(
      11,
      'Booking Quota: Basic max is 100/mo, Pro max is 250/mo, Enterprise is Unlimited',
      Boolean(t11Pass),
      `Basic: ${basicBookingQuota.max}, Pro: ${proBookingQuota.max}, Enterprise: ${entBookingQuota.max}`
    );

    // -------------------------------------------------------------
    // TEST 12: Master Data Geographic Quotas (Pickup Area / City / Package / Payment)
    // -------------------------------------------------------------
    const basicArea = await checkPickupAreaQuota(testBasicTenantId);
    const basicCity = await checkPickupCityQuota(testBasicTenantId);
    const basicPkg = await checkPackageQuota(testBasicTenantId);
    const basicPm = await checkPaymentModeQuota(testBasicTenantId);

    const entArea = await checkPickupAreaQuota(testEntTenantId);
    const entCity = await checkPickupCityQuota(testEntTenantId);

    const t12Pass =
      basicArea.max === 10 &&
      basicCity.max === 5 &&
      basicPkg.max === 5 &&
      basicPm.max === 3 &&
      entArea.isUnlimited === true &&
      entCity.isUnlimited === true;

    assert(
      12,
      'Master Data Quotas: Basic has 10 areas, 5 cities, 5 packages, 3 payment modes; Enterprise is Unlimited',
      Boolean(t12Pass),
      `Basic Areas: ${basicArea.max}, Cities: ${basicCity.max}, Packages: ${basicPkg.max}, PaymentModes: ${basicPm.max}`
    );

    // -------------------------------------------------------------
    // TEST 13: Middleware requireThemeCustomization Enforcement
    // -------------------------------------------------------------
    let basicMiddlewarePassed = false;
    let basicMiddlewareBlocked = false;

    // A) Request with no custom colors (legal name only) -> must pass through
    const { req: reqLegal, res: resLegal } = mockReqRes({
      tenantId: testBasicTenantId,
      body: { legalName: 'Apex Logistics Pvt Ltd' },
    });
    await requireThemeCustomization(reqLegal, resLegal, () => {
      basicMiddlewarePassed = true;
    });

    // B) Request with custom palette on Basic -> must be blocked with 403 FEATURE_LOCKED
    const { req: reqCustomColor, res: resCustomColor, getResult: getResCustom } = mockReqRes({
      tenantId: testBasicTenantId,
      body: { primaryColor: '#FF5733', secondaryColor: '#33FF57' },
    });
    await requireThemeCustomization(reqCustomColor, resCustomColor, () => {
      basicMiddlewareBlocked = false;
    });
    const customResult = getResCustom();
    basicMiddlewareBlocked = customResult.status === 403 && customResult.json?.code === 'FEATURE_LOCKED';

    assert(
      13,
      'Middleware requireThemeCustomization allows standard legal updates on Basic but blocks custom hex colors with 403 FEATURE_LOCKED',
      basicMiddlewarePassed && basicMiddlewareBlocked,
      `Legal passed: ${basicMiddlewarePassed}, Custom blocked: ${basicMiddlewareBlocked} (HTTP ${customResult.status})`
    );

    // -------------------------------------------------------------
    // TEST 14: Middleware requireThemeCustomization on Enterprise
    // -------------------------------------------------------------
    let entCustomPassed = false;
    const { req: reqEntCustom, res: resEntCustom } = mockReqRes({
      tenantId: testEntTenantId,
      body: { primaryColor: '#7C3AED', secondaryColor: '#1E1B4B' },
    });
    await requireThemeCustomization(reqEntCustom, resEntCustom, () => {
      entCustomPassed = true;
    });

    assert(
      14,
      'Middleware requireThemeCustomization allows custom hex colors on Enterprise tier',
      entCustomPassed
    );

    // -------------------------------------------------------------
    // TEST 15: getTenantEntitlementsSummary Comprehensive Aggregator
    // -------------------------------------------------------------
    const summary = await getTenantEntitlementsSummary(testProTenantId);
    const t15Pass =
      summary.planTier === 'PRO' &&
      summary.themeLevel === 'PRESETS' &&
      summary.quotas.bookings.max === 250 &&
      summary.quotas.taxes.max === 2 &&
      summary.quotas.vehicles.max === 75 &&
      Array.isArray(summary.themePresets);

    assert(
      15,
      'getTenantEntitlementsSummary returns complete unified entitlement schema for current tenant',
      Boolean(t15Pass),
      `Tier: ${summary.planTier}, Theme: ${summary.themeLevel}, Bookings Max: ${summary.quotas?.bookings?.max}, Taxes Max: ${summary.quotas?.taxes?.max}`
    );

    // Clean up test subscriptions
    await TenantSubscription.destroy({
      where: {
        tenantId: [testBasicTenantId, testProTenantId, testEntTenantId],
      },
    });
    await Tenant.destroy({
      where: {
        tenantId: [testBasicTenantId, testProTenantId, testEntTenantId],
      },
      force: true,
    });

    // -------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log('\n----------------------------------------------------------------');
    console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
    console.log('----------------------------------------------------------------\n');

    return failedCount === 0;
  } catch (error) {
    console.error('Test execution encountered unhandled error:', error);
    return false;
  }
}

if (require.main === module) {
  runDynamicPlanEntitlementsTests().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
