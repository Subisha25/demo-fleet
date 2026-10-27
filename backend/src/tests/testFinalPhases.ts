import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import {
  sequelize,
  Tenant,
  Company,
  Drivers,
  Vehicle,
  VehicleType,
  VehicleMaster,
  User,
  TenantSubscription,
  SubscriptionInvoice,
  EmailConfiguration,
  NotificationLog,
  TenantInitialAllowance,
  TenantRegistrationRequest,
} from '../models';
import config from '../config/config';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { generateUniqueFleetSlug, getFleetLoginUrl, slugifyFleetName } from '../services/slugService';
import { getFleetDocumentBranding } from '../services/fleetBrandingService';

dotenv.config();

// Enforce test/mock safety
process.env.NOTIFICATION_MOCK_MODE = 'true';
process.env.NODE_ENV = 'test';

const PORT = config.server.port || 5000;
const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';

interface ResponsePayload {
  statusCode: number;
  data: any;
  headers: http.IncomingHttpHeaders;
}

function makeRequest(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<ResponsePayload> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {
            // Keep raw text if not JSON
          }
          resolve({
            statusCode: res.statusCode || 0,
            data: parsed,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let passedAssertions = 0;
let totalAssertions = 0;

function assertCheck(condition: boolean, description: string, details?: any) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] Assertion ${totalAssertions}: ${description}`);
  } else {
    console.error(`  [FAIL] Assertion ${totalAssertions}: ${description}`);
    if (details) console.error('         Details:', JSON.stringify(details, null, 2));
    throw new Error(`Assertion failed: ${description}`);
  }
}

async function runRegressionSuite() {
  console.log('================================================================================');
  console.log(' FLEETFLOW FINAL REGRESSION TEST SUITE: UNIQUE URL, STRICT LOCK & SUPERADMIN CONFIG');
  console.log('================================================================================\n');

  await sequelize.authenticate();

  // 0. SuperAdmin Token
  const superAdminToken = jwt.sign(
    {
      userId: '00000000-0000-0000-0000-000000000001',
      role: 'superadmin',
      tenantId: ROOT_TENANT_ID,
      email: 'superadmin@fleetflow.com',
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // ============================================================================
  // SECTION 1: PHASE 1 — REMOVE UNNECESSARY REGISTRATION FIELDS
  // ============================================================================
  console.log('\n--- SECTION 1: PHASE 1 — REGISTRATION FIELDS AUDIT ---');

  const regPayload1 = {
    fleetName: `Express Fleet ${Date.now()}`,
    businessCode: `EXP${Date.now().toString().slice(-4)}`,
    ownerName: 'Vikram Singh',
    contactEmail: `vikram_${Date.now()}@example.com`,
    contactPhone: '9840123456',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600002',
    requestedPlanTier: 'PRO',
    billingCycle: 'MONTHLY',
    agreedPrice: 3500,
    legalName: 'Express Fleet Logistics Pvt Ltd',
    displayName: 'Express Fleet',
    registeredAddress: '77 Anna Salai, Chennai, Tamil Nadu 600002',
    gstin: '33AABCE1234F1Z5',
    panNumber: 'AABCE1234F',
    sacCode: '996601',
    // Deliberately omitting website, billingEmail, billingPhone
  };

  const regRes = await makeRequest('POST', '/api/tenants/register', regPayload1);
  assertCheck(
    regRes.statusCode === 201 && regRes.data?.success === true,
    'Public fleet registration succeeds without website, billingEmail, or billingPhone',
    regRes.data
  );
  assertCheck(
    Boolean(regRes.data?.data?.slug),
    'Registration automatically assigns a canonical slug',
    regRes.data?.data
  );

  // SuperAdmin Add Tenant without website / billing email / billing phone
  const saAddTenantPayload = {
    name: `Direct Fleet ${Date.now()}`,
    code: `DIR${Date.now().toString().slice(-4)}`,
    contactEmail: `direct_${Date.now()}@example.com`,
    contactPhone: '9840999888',
    planTier: 'BASIC',
    legalName: 'Direct Fleet Private Limited',
    displayName: 'Direct Fleet',
    registeredAddress: '100 Mount Road, Chennai',
    gstin: '33AABCD5678F1Z9',
    panNumber: 'AABCD5678F',
    sacCode: '996609',
    // No website, businessEmail, businessPhone required
  };

  const saTenantRes = await makeRequest('POST', '/api/tenants', saAddTenantPayload, {
    Authorization: `Bearer ${superAdminToken}`,
  });
  assertCheck(
    saTenantRes.statusCode === 201 && saTenantRes.data?.success === true,
    'SuperAdmin creates tenant without website, billing email, or billing phone',
    saTenantRes.data
  );
  assertCheck(
    Boolean(saTenantRes.data?.tenant?.slug),
    'SuperAdmin-created tenant is assigned a canonical slug automatically',
    saTenantRes.data?.tenant
  );

  // ============================================================================
  // SECTION 2: PHASE 2 — UNIQUE FLEET LOGIN URL & CROSS-TENANT ISOLATION
  // ============================================================================
  console.log('\n--- SECTION 2: PHASE 2 — UNIQUE FLEET LOGIN URL & CROSS-TENANT ISOLATION ---');

  // Test slug generator and collision handling
  const runId = Date.now().toString().slice(-4);
  const baseName = `Royal Crown ${runId}`;
  const expectedSlug1 = slugifyFleetName(baseName);
  const slug1 = await generateUniqueFleetSlug(baseName);
  assertCheck(slug1 === expectedSlug1, `Slug format is clean: expected ${expectedSlug1}, got ${slug1}`);

  // Create Fleet A with slug1
  const tenantAId = uuidv4();
  const tenantA = await Tenant.create({
    tenantId: tenantAId,
    name: baseName,
    code: `RCT${runId}`,
    slug: slug1,
    contactEmail: `admin_${runId}@royalcrown.com`,
    contactPhone: '9840111222',
    planTier: 'PRO',
    status: 'ACTIVE',
    legalName: `${baseName} Pvt Ltd`,
    displayName: baseName,
    registeredAddress: '55 Beach Road, Chennai, Tamil Nadu',
    gstin: '33AAACR9988F1Z2',
    panNumber: 'AAACR9988F',
    sacCode: '996609',
  });

  // Verify slug collision handling for duplicate name
  const expectedSlug2 = `${expectedSlug1}-2`;
  const slug2 = await generateUniqueFleetSlug(baseName);
  assertCheck(
    slug2 === expectedSlug2,
    `Duplicate fleet name generates unique collision slug: expected ${expectedSlug2}, got ${slug2}`
  );

  // Create Fleet B with slug2
  const tenantBId = uuidv4();
  const tenantB = await Tenant.create({
    tenantId: tenantBId,
    name: 'Royal Crown Travels',
    code: `RC2${Date.now().toString().slice(-4)}`,
    slug: slug2,
    contactEmail: 'admin@royalcrown2.com',
    contactPhone: '9840333444',
    planTier: 'BASIC',
    status: 'ACTIVE',
    legalName: 'Royal Crown Travels Secondary LLP',
    displayName: 'Royal Crown Travels Branch 2',
    registeredAddress: '120 OMR Road, Chennai, Tamil Nadu',
    gstin: '33BBBCE5544F1Z1',
    panNumber: 'BBBCE5544F',
    sacCode: '996609',
  });

  // Public fleet branding by slug
  const pubResA = await makeRequest('GET', `/api/tenants/public/slug/${slug1}`);
  assertCheck(pubResA.statusCode === 200 && pubResA.data?.success === true, 'Public endpoint returns Fleet A branding by slug');
  assertCheck(pubResA.data?.fleet?.displayName === baseName, 'Fleet A branding displayName is correct');
  assertCheck(pubResA.data?.fleet?.slug === slug1, 'Fleet A branding slug matches canonical slug');
  assertCheck(pubResA.data?.fleet?.registeredAddress.includes('Beach Road'), 'Fleet A branding registeredAddress is tenant-specific');

  // Verify safe 404 for unknown slug
  const pubResUnknown = await makeRequest('GET', '/api/tenants/public/slug/non-existent-fleet-slug-9999');
  assertCheck(
    pubResUnknown.statusCode === 404 && pubResUnknown.data?.success === false,
    'Unknown slug returns safe HTTP 404 not-found state without leaking tenant records',
    pubResUnknown.data
  );

  // Create users for Fleet A and Fleet B
  const hashedPassword = await bcrypt.hash('SecurePassword@123', 10);

  const userAId = uuidv4();
  await User.create({
    userId: userAId,
    name: 'Fleet Admin A',
    email: `adminA_${Date.now()}@royalcrown.com`,
    mobile: '9840111222',
    password: hashedPassword,
    role: 'fleet_admin',
    userStatus: 'Active',
    tenantId: tenantAId,
  });

  const userBId = uuidv4();
  await User.create({
    userId: userBId,
    name: 'Fleet Admin B',
    email: `adminB_${Date.now()}@royalcrown2.com`,
    mobile: '9840333444',
    password: hashedPassword,
    role: 'fleet_admin',
    userStatus: 'Active',
    tenantId: tenantBId,
  });

  // Dedicated fleet login for Fleet A user on Fleet A URL
  const loginResA = await makeRequest('POST', `/api/auth/fleet-login/${slug1}`, {
    email: `adminA_${Date.now()}@royalcrown.com`.toLowerCase(),
    password: 'SecurePassword@123',
  });
  // Note: search was case-sensitive or exact email
  const userARecord = await User.findByPk(userAId);
  const loginResAExact = await makeRequest('POST', `/api/auth/fleet-login/${slug1}`, {
    email: userARecord!.email,
    password: 'SecurePassword@123',
  });
  assertCheck(
    loginResAExact.statusCode === 200 && loginResAExact.data?.success === true,
    'Fleet A admin successfully logs in through Fleet A unique slug portal',
    loginResAExact.data
  );
  assertCheck(
    loginResAExact.data?.tenant?.slug === slug1,
    'Login session correctly bound to Fleet A tenant context'
  );

  // Cross-tenant attack: User of Fleet A attempts to log in through Fleet B's slug
  const crossLoginRes = await makeRequest('POST', `/api/auth/fleet-login/${slug2}`, {
    email: userARecord!.email,
    password: 'SecurePassword@123',
  });
  assertCheck(
    crossLoginRes.statusCode === 403,
    'Cross-tenant login attempt is strictly rejected with HTTP 403',
    crossLoginRes.data
  );
  assertCheck(
    crossLoginRes.data?.code === 'CROSS_TENANT_LOGIN_FORBIDDEN' || crossLoginRes.data?.errorCode === 'CROSS_TENANT_LOGIN_FORBIDDEN',
    'Cross-tenant rejection returns CROSS_TENANT_LOGIN_FORBIDDEN error code',
    crossLoginRes.data
  );

  // Verify Document Branding includes canonical fleetLoginUrl
  const brandingA = await getFleetDocumentBranding(tenantAId);
  assertCheck(
    brandingA.fleetLoginUrl.includes(`/login/${slug1}`),
    'Fleet document branding includes canonical login URL',
    brandingA.fleetLoginUrl
  );

  // ============================================================================
  // SECTION 3: PHASE 3 — STRICT SUBSCRIPTION LOCK & INITIAL TESTING ALLOWANCE
  // ============================================================================
  console.log('\n--- SECTION 3: PHASE 3 — STRICT SUBSCRIPTION LOCK & INITIAL ALLOWANCE ---');

  // 1. Setup newly registered unpaid/trialing tenant
  const tenantTrialId = uuidv4();
  const trialSlug = await generateUniqueFleetSlug('Alpha Trial Fleet');
  const tenantTrial = await Tenant.create({
    tenantId: tenantTrialId,
    name: 'Alpha Trial Fleet',
    code: `TRL${Date.now().toString().slice(-4)}`,
    slug: trialSlug,
    contactEmail: `trial_${Date.now()}@example.com`,
    contactPhone: '9840777888',
    planTier: 'BASIC',
    status: 'TRIALING',
  });

  const trialSub = await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: tenantTrialId,
    planTier: 'BASIC',
    status: 'TRIALING',
    vehicleQuota: 15,
    driverQuota: 15,
    companyQuota: 5,
    monthlyTripQuota: 1000,
    allowOverage: false,
    billingCycle: 'MONTHLY',
    currentPeriodEnd: null,
  });

  const trialUser = await User.create({
    userId: uuidv4(),
    name: 'Trial Admin',
    email: `trialadmin_${Date.now()}@example.com`,
    mobile: '9840777888',
    password: hashedPassword,
    role: 'fleet_admin',
    userStatus: 'Active',
    tenantId: tenantTrialId,
  });

  const trialToken = jwt.sign(
    {
      userId: trialUser.userId,
      role: 'fleet_admin',
      tenantId: tenantTrialId,
      email: trialUser.email,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Create VehicleType for foreign key
  let testVType = await VehicleType.findOne({ where: { tenantId: tenantTrialId } });
  if (!testVType) {
    testVType = await VehicleType.create({
      vehicleTypeId: uuidv4(),
      vehicleTypeName: 'Sedan AC',
      tenantId: tenantTrialId,
    });
  }

  // 3.1 Initial Allowance: 1st Vehicle creation succeeds
  const vPayload1 = {
    vehicleName: 'Trial Vehicle 1',
    vehicleNo: `TN-01-TR-${Date.now().toString().slice(-4)}`,
    vehicleTypeId: testVType.vehicleTypeId,
    model: 'Etios',
    brand: 'Toyota',
    color: 'White',
    fuelType: 'Diesel',
    ownerName: 'Self',
    ownerContact: '9840112233',
    ownerAddress: 'Chennai',
    manufacturing: '2023',
    availableStatus: 'Available',
  };

  const vRes1 = await makeRequest('POST', '/api/vendor/createVehicle', vPayload1, {
    Authorization: `Bearer ${trialToken}`,
    'x-tenant-id': tenantTrialId,
  });
  assertCheck(
    vRes1.statusCode === 201 || (vRes1.statusCode === 200 && vRes1.data?.success !== false),
    '1st vehicle creation succeeds under the one-time initial testing allowance',
    vRes1.data
  );

  // Check that allowance record was persisted in database
  const allowanceRecord = await TenantInitialAllowance.findOne({
    where: { tenantId: tenantTrialId, module: 'VEHICLES' },
  });
  assertCheck(
    Boolean(allowanceRecord && allowanceRecord.usedCount === 1),
    'Database accurately records that the initial allowance for vehicle was consumed'
  );

  // 3.2 Second Vehicle creation MUST BE BLOCKED (HTTP 403 QUOTA_EXCEEDED / SUBSCRIPTION_REQUIRED)
  const vPayload2 = {
    vehicleName: 'Trial Vehicle 2',
    vehicleNo: `TN-01-TR-9999`,
    vehicleTypeId: testVType.vehicleTypeId,
    model: 'Etios',
    brand: 'Toyota',
    color: 'White',
    fuelType: 'Diesel',
    ownerName: 'Self',
    ownerContact: '9840112233',
    ownerAddress: 'Chennai',
    manufacturing: '2023',
    availableStatus: 'Available',
  };

  const vRes2 = await makeRequest('POST', '/api/vendor/createVehicle', vPayload2, {
    Authorization: `Bearer ${trialToken}`,
    'x-tenant-id': tenantTrialId,
  });
  assertCheck(
    vRes2.statusCode === 403,
    '2nd vehicle creation attempt is strictly blocked by backend entitlement middleware with HTTP 403',
    vRes2.data
  );
  assertCheck(
    vRes2.data?.subscriptionRequired === true || vRes2.data?.code === 'QUOTA_EXCEEDED',
    'Entitlement error indicates subscription required to proceed beyond initial allowance',
    vRes2.data
  );

  // 3.3 Initial Allowance for Company: 1st company creation succeeds
  const cPayload1 = {
    companyName: `Trial Corporate Client ${Date.now()}`,
    companyAddress: '100 IT Expressway, Chennai',
    companyPhno: '9840112244',
    managerEmail: `manager_${Date.now()}@tech.com`,
    gstNo: '33AABCT9988F1Z3',
  };

  const cRes1 = await makeRequest('POST', '/api/emp/createCompany', cPayload1, {
    Authorization: `Bearer ${trialToken}`,
    'x-tenant-id': tenantTrialId,
  });
  assertCheck(
    cRes1.statusCode === 201 || (cRes1.statusCode === 200 && cRes1.data?.success !== false),
    '1st company creation succeeds under initial testing allowance',
    cRes1.data
  );

  // 3.4 2nd company creation MUST BE BLOCKED
  const cPayload2 = {
    companyName: `Trial Corporate Client 2`,
    companyAddress: '200 IT Expressway, Chennai',
    companyPhno: '9840112255',
    managerEmail: `manager2_${Date.now()}@tech.com`,
    gstNo: '33AABCT9988F1Z4',
  };

  const cRes2 = await makeRequest('POST', '/api/emp/createCompany', cPayload2, {
    Authorization: `Bearer ${trialToken}`,
    'x-tenant-id': tenantTrialId,
  });
  assertCheck(
    cRes2.statusCode === 403,
    '2nd company creation attempt is strictly blocked by backend entitlement middleware with HTTP 403',
    cRes2.data
  );

  // 3.5 Allowance does not reset on repeated login or logout
  const reTrialToken = jwt.sign(
    {
      userId: trialUser.userId,
      role: 'fleet_admin',
      tenantId: tenantTrialId,
      email: trialUser.email,
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const reRes = await makeRequest('POST', '/api/vendor/createVehicle', vPayload2, {
    Authorization: `Bearer ${reTrialToken}`,
    'x-tenant-id': tenantTrialId,
  });
  assertCheck(
    reRes.statusCode === 403,
    'Re-login / fresh token does not reset initial testing allowance; subsequent requests remain blocked',
    reRes.data
  );

  // ============================================================================
  // SECTION 4: CONCURRENCY-SAFE ALLOWANCE CONSUMPTION
  // ============================================================================
  console.log('\n--- SECTION 4: CONCURRENCY-SAFE ALLOWANCE CONSUMPTION ---');

  // Create another fresh trialing tenant for parallel concurrency test
  const tenantConcId = uuidv4();
  const concSlug = await generateUniqueFleetSlug('Concurrency Test Fleet');
  await Tenant.create({
    tenantId: tenantConcId,
    name: 'Concurrency Test Fleet',
    code: `CON${Date.now().toString().slice(-4)}`,
    slug: concSlug,
    contactEmail: `conc_${Date.now()}@example.com`,
    contactPhone: '9840666555',
    planTier: 'BASIC',
    status: 'TRIALING',
  });

  await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: tenantConcId,
    planTier: 'BASIC',
    status: 'TRIALING',
    vehicleQuota: 15,
    driverQuota: 15,
    companyQuota: 5,
    monthlyTripQuota: 1000,
    allowOverage: false,
    billingCycle: 'MONTHLY',
    currentPeriodEnd: null,
  });

  const concUser = await User.create({
    userId: uuidv4(),
    name: 'Conc Admin',
    email: `conc_${Date.now()}@example.com`,
    mobile: '9840666555',
    password: hashedPassword,
    role: 'fleet_admin',
    userStatus: 'Active',
    tenantId: tenantConcId,
  });

  const concToken = jwt.sign(
    {
      userId: concUser.userId,
      role: 'fleet_admin',
      tenantId: tenantConcId,
      email: concUser.email,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const concVType = await VehicleType.create({
    vehicleTypeId: uuidv4(),
    vehicleTypeName: 'Sedan AC Concurrency',
    tenantId: tenantConcId,
  });

  // Launch 5 simultaneous requests to create a vehicle
  const parallelPromises = [1, 2, 3, 4, 5].map((idx) =>
    makeRequest(
      'POST',
      '/api/vendor/createVehicle',
      {
        vehicleName: `Conc Vehicle ${idx}`,
        vehicleNo: `TN-CON-${idx}-${Date.now().toString().slice(-4)}`,
        vehicleTypeId: concVType.vehicleTypeId,
        model: 'Innova',
        brand: 'Toyota',
        color: 'Silver',
        fuelType: 'Diesel',
        ownerName: 'Self',
        ownerContact: '9840112233',
        ownerAddress: 'Chennai',
        manufacturing: '2023',
        availableStatus: 'Available',
      },
      {
        Authorization: `Bearer ${concToken}`,
        'x-tenant-id': tenantConcId,
      }
    )
  );

  const parallelResults = await Promise.all(parallelPromises);
  console.log('PARALLEL_RESULTS_STATUS:', parallelResults.map(r => r.statusCode));
  console.log('PARALLEL_RESULTS_DATA:', parallelResults.map(r => r.data));
  const successCount = parallelResults.filter((r) => r.statusCode === 201 || (r.statusCode === 200 && r.data?.success !== false)).length;
  const blockedCount = parallelResults.filter((r) => r.statusCode === 403).length;

  assertCheck(
    successCount === 1,
    `Concurrency test: exactly 1 request succeeded under atomic row lock (expected 1, got ${successCount})`
  );
  assertCheck(
    blockedCount === 4,
    `Concurrency test: 4 simultaneous requests were safely blocked (expected 4, got ${blockedCount})`
  );

  // Total vehicles in database for this tenant must be exactly 1
  const vehicleCountInDb = await Vehicle.count({ where: { tenantId: tenantConcId } });
  assertCheck(
    vehicleCountInDb === 1,
    `Database verification: exactly 1 vehicle record was persisted in database under high concurrency (got ${vehicleCountInDb})`
  );

  // ============================================================================
  // SECTION 5: EXPIRED SUBSCRIPTION COMPLETE MUTATION LOCK
  // ============================================================================
  console.log('\n--- SECTION 5: EXPIRED SUBSCRIPTION COMPLETE MUTATION LOCK ---');

  const tenantExpId = uuidv4();
  const expSlug = await generateUniqueFleetSlug('Expired Fleet Logistics');
  const tenantExp = await Tenant.create({
    tenantId: tenantExpId,
    name: 'Expired Fleet Logistics',
    code: `EXP${Date.now().toString().slice(-4)}`,
    slug: expSlug,
    contactEmail: `expired_${Date.now()}@example.com`,
    contactPhone: '9840888999',
    planTier: 'BASIC',
    status: 'SUSPENDED',
  });

  await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: tenantExpId,
    planTier: 'BASIC',
    status: 'SUSPENDED',
    vehicleQuota: 15,
    driverQuota: 15,
    companyQuota: 5,
    monthlyTripQuota: 1000,
    allowOverage: false,
    billingCycle: 'MONTHLY',
    currentPeriodEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  });

  const expUser = await User.create({
    userId: uuidv4(),
    name: 'Expired Admin',
    email: `expadmin_${Date.now()}@example.com`,
    mobile: '9840888999',
    password: hashedPassword,
    role: 'fleet_admin',
    userStatus: 'Active',
    tenantId: tenantExpId,
  });

  const expToken = jwt.sign(
    {
      userId: expUser.userId,
      role: 'fleet_admin',
      tenantId: tenantExpId,
      email: expUser.email,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Pre-seed an existing vehicle and driver to test edit/delete lock
  const expVType = await VehicleType.create({
    vehicleTypeId: uuidv4(),
    vehicleTypeName: 'SUV Pre-existing',
    tenantId: tenantExpId,
  });

  const seededVehicle = await Vehicle.create({
    vehicleId: uuidv4(),
    vehicleName: 'Seeded Vehicle',
    vehicleNo: `TN-EXP-${Date.now().toString().slice(-4)}`,
    vehicleTypeId: expVType.vehicleTypeId,
    manufacturing: '2023',
    availableStatus: 'Available',
    model: 'Xylo',
    brand: 'Mahindra',
    tenantId: tenantExpId,
  });

  const seededDriver = await Drivers.create({
    driverId: uuidv4(),
    driverName: 'Seeded Driver',
    phno: '9840112277',
    licenseNo: 'TN-DL-998822',
    tenantId: tenantExpId,
  });

  // 5.1 Block creation on expired subscription
  const expCreateV = await makeRequest(
    'POST',
    '/api/vendor/createVehicle',
    {
      vehicleName: 'Blocked Vehicle',
      vehicleNo: 'TN-EXP-BLOCKED',
      vehicleTypeId: expVType.vehicleTypeId,
      model: 'Innova',
    },
    { Authorization: `Bearer ${expToken}`, 'x-tenant-id': tenantExpId }
  );
  assertCheck(
    expCreateV.statusCode === 403 && (expCreateV.data?.errorCode === 'SUBSCRIPTION_LOCKED' || expCreateV.data?.code === 'SUBSCRIPTION_LOCKED'),
    'Creation on expired subscription is strictly blocked (403 SUBSCRIPTION_LOCKED)',
    expCreateV.data
  );

  // 5.2 Block driver creation on expired subscription
  const expCreateD = await makeRequest(
    'POST',
    '/api/vendor/createDriver',
    {
      driverName: 'New Blocked Driver',
      phno: '9840112288',
      licenseNo: 'TN-DL-776655',
    },
    { Authorization: `Bearer ${expToken}`, 'x-tenant-id': tenantExpId }
  );
  assertCheck(
    expCreateD.statusCode === 403,
    'Driver creation on expired subscription is strictly blocked with HTTP 403',
    expCreateD.data
  );

  // 5.3 Block editing/updating existing vehicle
  const expEditV = await makeRequest(
    'put',
    `/api/vehicle/${seededVehicle.vehicleId}/updateVehicle`,
    { vehicleName: 'Hacked Name Edit' },
    { Authorization: `Bearer ${expToken}`, 'x-tenant-id': tenantExpId }
  );
  assertCheck(
    expEditV.statusCode === 403 && (expEditV.data?.errorCode === 'SUBSCRIPTION_LOCKED' || expEditV.data?.code === 'SUBSCRIPTION_LOCKED'),
    'Editing operational records on expired subscription is strictly blocked (403 SUBSCRIPTION_LOCKED)',
    expEditV.data
  );

  // 5.4 Block deleting existing driver
  const expDeleteD = await makeRequest(
    'delete',
    `/api/driver/delete/${seededDriver.driverId}`,
    {},
    { Authorization: `Bearer ${expToken}`, 'x-tenant-id': tenantExpId }
  );
  assertCheck(
    expDeleteD.statusCode === 403 && (expDeleteD.data?.errorCode === 'SUBSCRIPTION_LOCKED' || expDeleteD.data?.code === 'SUBSCRIPTION_LOCKED'),
    'Deleting operational records on expired subscription is strictly blocked (403 SUBSCRIPTION_LOCKED)',
    expDeleteD.data
  );

  // 5.5 Verify existing operational records remain completely intact
  const intactVehicle = await Vehicle.findByPk(seededVehicle.vehicleId);
  const intactDriver = await Drivers.findByPk(seededDriver.driverId);
  assertCheck(Boolean(intactVehicle), 'Existing vehicle was preserved without corruption or data loss');
  assertCheck(Boolean(intactDriver), 'Existing driver was preserved without corruption or data loss');

  // 5.6 Verify read access to subscription history and current plan is NOT blocked
  const subHistoryRes = await makeRequest('GET', '/api/tenants/subscription/history', undefined, {
    Authorization: `Bearer ${expToken}`,
    'x-tenant-id': tenantExpId,
  });
  assertCheck(
    subHistoryRes.statusCode === 200,
    'Fleet admin on expired subscription can still view subscription history & renewal invoices (200 OK)'
  );

  // ============================================================================
  // SECTION 6: PAYMENT RESTORATION & IDEMPOTENT CALLBACKS
  // ============================================================================
  console.log('\n--- SECTION 6: PAYMENT RESTORATION & IDEMPOTENT CALLBACKS ---');

  // 6.1 Create checkout invoice and simulate verified payment
  const checkoutRes = await makeRequest(
    'POST',
    '/api/tenants/subscription/checkout',
    { planTier: 'BASIC', billingCycle: 'MONTHLY' },
    { Authorization: `Bearer ${trialToken}`, 'x-tenant-id': tenantTrialId }
  );
  const subInvId = checkoutRes.data?.data?.invoice?.subscriptionInvoiceId || checkoutRes.data?.invoice?.subscriptionInvoiceId;
  assertCheck(
    (checkoutRes.statusCode === 200 || checkoutRes.statusCode === 201) && Boolean(subInvId),
    'Subscription checkout generates subscription invoice',
    checkoutRes.data
  );
  const paymentTxnRef = `TXN_MOCK_${Date.now()}`;

  // Verify payment
  const payVerifyRes1 = await makeRequest(
    'POST',
    '/api/tenants/subscription/verify-payment',
    {
      subscriptionInvoiceId: subInvId,
      transactionReference: paymentTxnRef,
    },
    { Authorization: `Bearer ${trialToken}`, 'x-tenant-id': tenantTrialId }
  );
  assertCheck(
    payVerifyRes1.statusCode === 200 && payVerifyRes1.data?.success === true,
    'Trusted payment verification successfully activates tenant subscription',
    payVerifyRes1.data
  );

  // Verify DB state updated
  await tenantTrial.reload();
  const activeSub = await TenantSubscription.findOne({ where: { tenantId: tenantTrialId } });
  assertCheck(
    tenantTrial.status === 'ACTIVE',
    'Tenant status updated to ACTIVE in database'
  );
  assertCheck(
    activeSub?.status === 'ACTIVE',
    'Subscription record status updated to ACTIVE in database'
  );

  // Check subscription invoice stored with PAID
  const invoiceRecord = await SubscriptionInvoice.findOne({
    where: { tenantId: tenantTrialId, subscriptionInvoiceId: subInvId },
  });
  assertCheck(
    Boolean(invoiceRecord && invoiceRecord.paymentStatus === 'PAID'),
    'Subscription invoice record marked as PAID in database'
  );

  // 6.2 Test duplicate payment verification idempotency
  const payVerifyRes2 = await makeRequest(
    'POST',
    '/api/tenants/subscription/verify-payment',
    {
      subscriptionInvoiceId: subInvId,
      transactionReference: paymentTxnRef,
    },
    { Authorization: `Bearer ${trialToken}`, 'x-tenant-id': tenantTrialId }
  );
  assertCheck(
    payVerifyRes2.statusCode === 200 && payVerifyRes2.data?.message?.includes('already paid'),
    'Duplicate payment callback handled idempotently (200 OK)',
    payVerifyRes2.data
  );

  // 6.3 Test that unlocked fleet can now create records within purchased plan quota (Basic = 15 vehicles)
  const vPaidRes = await makeRequest(
    'POST',
    '/api/vendor/createVehicle',
    {
      vehicleName: 'Purchased Quota Vehicle 2',
      vehicleTypeId: testVType.vehicleTypeId,
      manufacturing: '2023',
      availableStatus: 'Available',
    },
    { Authorization: `Bearer ${trialToken}`, 'x-tenant-id': tenantTrialId }
  );
  assertCheck(
    vPaidRes.statusCode === 201 || (vPaidRes.statusCode === 200 && vPaidRes.data?.success !== false),
    'Verified payment unlocks purchased plan quota: vehicle creation succeeds beyond initial allowance',
    vPaidRes.data
  );

  // ============================================================================
  // SECTION 7: PHASE 4 — SUPERADMIN CONFIGURATION & SCOPE ISOLATION
  // ============================================================================
  console.log('\n--- SECTION 7: PHASE 4 — SUPERADMIN CONFIGURATION & SCOPE ISOLATION ---');

  // 7.1 SuperAdmin retrieves all email configs -> includes PLATFORM scope
  const saConfigsRes = await makeRequest('GET', '/api/emailConfRoutes/getAllEmailConf', undefined, {
    Authorization: `Bearer ${superAdminToken}`,
  });
  assertCheck(
    saConfigsRes.statusCode === 200 && Array.isArray(saConfigsRes.data?.emailConfs),
    'SuperAdmin retrieves email configurations successfully'
  );
  const platformTemplates = saConfigsRes.data.emailConfs.filter((c: any) => c.scope === 'PLATFORM');
  assertCheck(
    platformTemplates.length > 0,
    `SuperAdmin sees PLATFORM scope templates (${platformTemplates.length} found)`
  );

  // 7.2 Fleet Admin retrieves email configs -> ONLY FLEET scope
  const faConfigsRes = await makeRequest('GET', '/api/emailConfRoutes/getAllEmailConf', undefined, {
    Authorization: `Bearer ${trialToken}`,
    'x-tenant-id': tenantTrialId,
  });
  assertCheck(
    faConfigsRes.statusCode === 200 && Array.isArray(faConfigsRes.data?.emailConfs),
    'Fleet Admin retrieves email configurations'
  );
  const leakedPlatformTemplates = faConfigsRes.data.emailConfs.filter((c: any) => c.scope === 'PLATFORM');
  assertCheck(
    leakedPlatformTemplates.length === 0,
    `Fleet Admin sees ZERO platform templates (scope strictly restricted to FLEET operational)`
  );

  // 7.3 Fleet Admin attempts to modify a PLATFORM-scoped template -> HTTP 403 Forbidden
  if (platformTemplates.length > 0) {
    const targetPlatformTmpl = platformTemplates[0];
    const faHackRes = await makeRequest(
      'PUT',
      `/api/emailConfRoutes/updateEmailConf/${targetPlatformTmpl.emailConfigId}`,
      { subject: 'Hacked Platform Subject' },
      { Authorization: `Bearer ${trialToken}`, 'x-tenant-id': tenantTrialId }
    );
    assertCheck(
      faHackRes.statusCode === 403,
      'Fleet Admin attempting to edit a PLATFORM scope template is strictly forbidden with HTTP 403',
      faHackRes.data
    );
  }

  // 7.4 SuperAdmin CAN modify platform templates
  if (platformTemplates.length > 0) {
    const targetPlatformTmpl = platformTemplates[0];
    const originalSubject = targetPlatformTmpl.subject;
    const testSubject = `Updated Platform Notice - ${Date.now()}`;

    const saUpdateRes = await makeRequest(
      'PUT',
      `/api/emailConfRoutes/updateEmailConf/${targetPlatformTmpl.emailConfigId}`,
      { subject: testSubject },
      { Authorization: `Bearer ${superAdminToken}` }
    );
    assertCheck(
      saUpdateRes.statusCode === 200,
      'SuperAdmin successfully updates platform-scoped email template'
    );

    // Restore original subject
    await makeRequest(
      'PUT',
      `/api/emailConfRoutes/updateEmailConf/${targetPlatformTmpl.emailConfigId}`,
      { subject: originalSubject },
      { Authorization: `Bearer ${superAdminToken}` }
    );
  }

  // 7.5 Fleet A edits its operational template without modifying Fleet B
  const operationalTemplates = saConfigsRes.data.emailConfs.filter((c: any) => c.scope === 'FLEET');
  if (operationalTemplates.length > 0) {
    const opTmpl = operationalTemplates[0];
    const fleetACustomSubject = `Fleet A Custom Subject - ${Date.now()}`;

    // Fleet A customizes
    const fleetAEditRes = await makeRequest(
      'PUT',
      `/api/emailConfRoutes/updateEmailConf/${opTmpl.emailConfigId}`,
      { subject: fleetACustomSubject },
      { Authorization: `Bearer ${loginResAExact.data.token}`, 'x-tenant-id': tenantAId }
    );
    assertCheck(
      fleetAEditRes.statusCode === 200,
      'Fleet A successfully saves custom operational template override',
      fleetAEditRes.data
    );

    // Fleet B inspects its template -> must NOT have Fleet A's subject
    const tokenB = jwt.sign(
      { userId: userBId, role: 'fleet_admin', tenantId: tenantBId, email: `adminB_${Date.now()}@royalcrown2.com` },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const fleetBConfigsRes = await makeRequest('GET', '/api/emailConfRoutes/getAllEmailConf', undefined, {
      Authorization: `Bearer ${tokenB}`,
      'x-tenant-id': tenantBId,
    });
    const emailConfsB = fleetBConfigsRes.data?.emailConfs || [];
    const fleetBVersion = emailConfsB.find((c: any) => c.emailCode === opTmpl.emailCode);
    assertCheck(
      fleetBVersion?.subject !== fleetACustomSubject,
      'Fleet A template modification did NOT affect Fleet B (tenant template isolation verified)'
    );
  }

  // ============================================================================
  // SECTION 8: ZERO LIVE MESSAGES VERIFICATION
  // ============================================================================
  console.log('\n--- SECTION 8: ZERO LIVE MESSAGES AUDIT ---');

  const recentLogs = await NotificationLog.findAll({
    limit: 10,
    order: [['createdAt', 'DESC']],
  });
  const liveSent = recentLogs.filter((l) => l.providerStatus === 'LIVE_SENT');
  assertCheck(
    liveSent.length === 0,
    `Zero live emails or SMS messages were sent during implementation or testing (all ${recentLogs.length} verified MOCK)`
  );

  console.log('\n================================================================================');
  console.log(` ALL ${totalAssertions} REGRESSION ASSERTIONS PASSED WITH ZERO FAILURES!`);
  console.log('================================================================================\n');
}

runRegressionSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n[REGRESSION TEST SUITE FAILED]:', err);
    process.exit(1);
  });
