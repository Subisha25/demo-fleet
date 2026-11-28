import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/dbConfig';
import { Tenant } from '../models/tenant';
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
import { TenantSubscription } from '../models/tenantSubscription';
import { ROOT_TENANT_ID, runWithTenantContext } from '../context/tenantContext';

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'jk23DFEo';

async function runTests() {
  console.log('======================================================================');
  console.log('   CABZ BRANDING, TENANT PROFILE & ROUTE ISOLATION E2E TEST SUITE     ');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database.');

    // -------------------------------------------------------------------------
    // TEST 1: Public Contact Info API returns Canonical Platform Branding
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: Public Contact Info Returns Platform Platform Details ---');
    const contactRes = await axios.get(`${API_BASE}/public/contact-info`);
    assert(contactRes.status === 200, 'Public contact-info returns HTTP 200');
    assert(contactRes.data.success === true, 'Public contact response is successful');
    assert(!!contactRes.data.contact.phone, 'Platform support phone is present');
    assert(contactRes.data.contact.email.includes('support@'), 'Platform support email is present');

    // -------------------------------------------------------------------------
    // TEST 2: Seed Two Separate Fleets (Fleet A: GANTHI, Fleet B: APEX)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Seed Registered Fleets with Complete Registration Data ---');
    const uniqueSuffix = Date.now().toString().slice(-4);
    const tenantAId = uuidv4();
    const codeA = `GA${uniqueSuffix}`;
    const emailA = `ganthi_${uniqueSuffix}@example.com`;

    const tenantBId = uuidv4();
    const codeB = `AP${uniqueSuffix}`;
    const emailB = `apex_${uniqueSuffix}@example.com`;

    // Create Fleet A
    await runWithTenantContext({ tenantId: ROOT_TENANT_ID, tenantCode: 'GC', isPlatformSuperAdmin: true }, async () => {
      await TenantRegistrationRequest.create({
        requestId: uuidv4(),
        fleetName: 'Ganthimurugan Fleet Solutions',
        legalName: 'Ganthimurugan Logistics Private Limited',
        displayName: 'Ganthimurugan Travels',
        businessCode: codeA,
        ownerName: 'Ganthimathi Murugan',
        contactEmail: emailA,
        contactPhone: '9994789683',
        registeredAddress: '104 Cross Cut Road, Gandhipuram',
        gstin: '33AAACG1234A1Z5',
        panNumber: 'AAACG1234A',
        sacCode: '996609',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641012',
        status: 'APPROVED',
        termsConsent: true,
        tenantId: tenantAId,
      });

      await Tenant.create({
        tenantId: tenantAId,
        name: 'Ganthimurugan Fleet Solutions',
        displayName: 'Ganthimurugan Travels',
        legalName: 'Ganthimurugan Logistics Private Limited',
        code: codeA,
        contactEmail: emailA,
        contactPhone: '9994789683',
        registeredAddress: '104 Cross Cut Road, Gandhipuram',
        gstin: '33AAACG1234A1Z5',
        panNumber: 'AAACG1234A',
        sacCode: '996609',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641012',
        status: 'ACTIVE',
        planTier: 'PRO',
        brandingTokens: {
          primaryColor: '#7C3AED',
          portalTitle: 'Ganthimurugan Travels Portal',
          ownerName: 'Ganthimathi Murugan',
        },
      });

      await TenantSubscription.create({
        subscriptionId: uuidv4(),
        tenantId: tenantAId,
        planTier: 'PRO',
        status: 'TRIALING',
        vehicleQuota: 75,
        driverQuota: 75,
        companyQuota: 20,
        monthlyTripQuota: 2500,
        trialDurationDays: 7,
      });

      // Create Fleet B
      await TenantRegistrationRequest.create({
        requestId: uuidv4(),
        fleetName: 'Apex City Mobility',
        legalName: 'Apex City Mobility Services LLP',
        displayName: 'Apex Cabs',
        businessCode: codeB,
        ownerName: 'Vikram Sundaram',
        contactEmail: emailB,
        contactPhone: '9841022334',
        registeredAddress: '42 Anna Salai, Guindy',
        gstin: '33BBBCG5678B1Z2',
        panNumber: 'BBBCG5678B',
        sacCode: '996609',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pinCode: '600032',
        status: 'APPROVED',
        termsConsent: true,
        tenantId: tenantBId,
      });

      await Tenant.create({
        tenantId: tenantBId,
        name: 'Apex City Mobility',
        displayName: 'Apex Cabs',
        legalName: 'Apex City Mobility Services LLP',
        code: codeB,
        contactEmail: emailB,
        contactPhone: '9841022334',
        registeredAddress: '42 Anna Salai, Guindy',
        gstin: '33BBBCG5678B1Z2',
        panNumber: 'BBBCG5678B',
        sacCode: '996609',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pinCode: '600032',
        status: 'ACTIVE',
        planTier: 'BASIC',
        brandingTokens: {
          primaryColor: '#0F766E',
          portalTitle: 'Apex Cabs Portal',
          ownerName: 'Vikram Sundaram',
        },
      });

      await TenantSubscription.create({
        subscriptionId: uuidv4(),
        tenantId: tenantBId,
        planTier: 'BASIC',
        status: 'TRIALING',
        vehicleQuota: 25,
        driverQuota: 25,
        companyQuota: 5,
        monthlyTripQuota: 500,
        trialDurationDays: 7,
      });
    });

    console.log(`Created Fleet A (${codeA}: Ganthimurugan Travels) and Fleet B (${codeB}: Apex Cabs).`);

    // Mint Tokens
    const tokenA = jwt.sign(
      { userId: uuidv4(), email: emailA, role: 'fleet_admin', tenantId: tenantAId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const tokenB = jwt.sign(
      { userId: uuidv4(), email: emailB, role: 'fleet_admin', tenantId: tenantBId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // -------------------------------------------------------------------------
    // TEST 3: Fetch Current Tenant Profile (Populated from Registration)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: GET /tenants/current/profile Returns Enriched Registration Data ---');
    const profileResA = await axios.get(`${API_BASE}/tenants/current/profile`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert(profileResA.status === 200, 'GET /tenants/current/profile returns HTTP 200');
    assert(profileResA.data.tenant.tenantId === tenantAId, 'Tenant ID matches Fleet A');
    assert(profileResA.data.tenant.displayName === 'Ganthimurugan Travels', 'Display name matches registered value');
    assert(profileResA.data.tenant.legalName === 'Ganthimurugan Logistics Private Limited', 'Legal name matches registered value');
    assert(profileResA.data.tenant.ownerName === 'Ganthimathi Murugan', 'Owner name populated from registration request');
    assert(profileResA.data.tenant.businessCode === codeA, 'Business code matches registration code');
    assert(profileResA.data.tenant.gstin === '33AAACG1234A1Z5', 'GSTIN matches registration');
    assert(profileResA.data.tenant.panNumber === 'AAACG1234A', 'PAN matches registration');
    assert(profileResA.data.tenant.city === 'Coimbatore', 'City matches registration');
    assert(profileResA.data.tenant.state === 'Tamil Nadu', 'State matches registration');
    assert(profileResA.data.tenant.pinCode === '641012', 'PIN code matches registration');
    assert(profileResA.data.tenant.displayName !== 'CABZ Primary', 'External tenant never receives CABZ Primary fallback');

    // -------------------------------------------------------------------------
    // TEST 4: Update Fleet Profile (PUT /tenants/current/profile)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: PUT /tenants/current/profile Updates Fleet Profile & Protects Sensitive Fields ---');
    const updatePayload = {
      displayName: 'GANTHI SMART EXPRESS',
      legalName: 'Ganthimurugan Logistics Private Limited',
      ownerName: 'Ganthimathi Murugan Lead',
      contactPhone: '9994789683',
      contactEmail: emailA,
      city: 'Coimbatore South',
      state: 'Tamil Nadu',
      pinCode: '641028',
      gstin: '33AAACG1234A1Z5',
      panNumber: 'AAACG1234A',
      sacCode: '996609',
      registeredAddress: '205 Avinashi Road, Peelamedu',
      // Attacker attempts to hijack sensitive fields:
      tenantId: 'hacked-tenant-id',
      status: 'SUSPENDED',
      planTier: 'ENTERPRISE',
      trialDurationDays: 999,
    };

    const updateRes = await axios.put(`${API_BASE}/tenants/current/profile`, updatePayload, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    assert(updateRes.status === 200, 'PUT /tenants/current/profile returns HTTP 200');
    assert(updateRes.data.success === true, 'Update returns success: true');
    assert(updateRes.data.tenant.displayName === 'GANTHI SMART EXPRESS', 'Display name updated to GANTHI SMART EXPRESS');
    assert(updateRes.data.tenant.ownerName === 'Ganthimathi Murugan Lead', 'Owner name updated');
    assert(updateRes.data.tenant.pinCode === '641028', 'PIN code updated');
    assert(updateRes.data.tenant.city === 'Coimbatore South', 'City updated');

    // Verify sensitive fields remained protected
    assert(updateRes.data.tenant.tenantId === tenantAId, 'Tenant ID was NOT modified by payload');
    assert(updateRes.data.tenant.status === 'ACTIVE', 'Subscription status was NOT modified by payload');
    assert(updateRes.data.tenant.planTier === 'PRO', 'Plan tier was NOT hijacked by payload');

    // Verify persistence by refetching
    const verifyFetch = await axios.get(`${API_BASE}/tenants/current/profile`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(verifyFetch.data.tenant.displayName === 'GANTHI SMART EXPRESS', 'Re-fetched profile reflects updated display name');
    assert(verifyFetch.data.tenant.registeredAddress === '205 Avinashi Road, Peelamedu', 'Re-fetched profile reflects updated address');

    // -------------------------------------------------------------------------
    // TEST 5: Cross-Tenant Isolation Security
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Cross-Tenant Security & Direct ID Parameter Enforcements ---');
    
    // Fleet A attempting to fetch Fleet B's profile via direct ID
    try {
      await axios.get(`${API_BASE}/tenants/${tenantBId}`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      assert(false, 'Fleet A fetching Fleet B profile should have failed');
    } catch (err: any) {
      assert(err.response?.status === 403, 'Fleet A querying Fleet B profile returns HTTP 403 Forbidden');
    }

    // Fleet A attempting to fetch Fleet B's billing history
    try {
      await axios.get(`${API_BASE}/tenants/${tenantBId}/billing-history`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      assert(false, 'Fleet A fetching Fleet B billing history should have failed');
    } catch (err: any) {
      assert(err.response?.status === 403, 'Fleet A querying Fleet B billing history returns HTTP 403 Forbidden');
    }

    // Fleet A attempting to switch tenant via X-Tenant-ID header
    try {
      await axios.get(`${API_BASE}/tenants/current/profile`, {
        headers: {
          Authorization: `Bearer ${tokenA}`,
          'X-Tenant-ID': tenantBId,
        },
      });
      assert(false, 'Fleet A supplying Fleet B X-Tenant-ID should have failed');
    } catch (err: any) {
      assert(err.response?.status === 403, 'Attempting to spoof X-Tenant-ID header returns HTTP 403 Forbidden');
    }

    // -------------------------------------------------------------------------
    // TEST 6: Strict Unauthenticated Access Protection
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Unauthenticated Direct API Access Protection ---');
    try {
      await axios.get(`${API_BASE}/tenants/current/profile`);
      assert(false, 'Unauthenticated call to /tenants/current/profile should fail');
    } catch (err: any) {
      assert(err.response?.status === 401, 'Unauthenticated call returns HTTP 401 Unauthorized');
    }

    try {
      await axios.put(`${API_BASE}/tenants/current/profile`, { displayName: 'Hacked Fleet' });
      assert(false, 'Unauthenticated PUT to /tenants/current/profile should fail');
    } catch (err: any) {
      assert(err.response?.status === 401, 'Unauthenticated PUT returns HTTP 401 Unauthorized');
    }

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n======================================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error('Test execution aborted due to unexpected error:', err.message || err);
    process.exit(1);
  }
}

runTests();
