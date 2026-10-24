import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../models';
import config from '../config/config';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { getFleetDocumentBranding } from '../services/fleetBrandingService';

dotenv.config();

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
          let parsed: any = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode || 500,
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

let passed = 0;
let failed = 0;

function assertCheck(cond: boolean, desc: string, detail?: string) {
  if (cond) {
    passed++;
    console.log(`  ✅ [PASS] ${desc}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${desc} ${detail ? `--> ${detail}` : ''}`);
  }
}

async function runMasterVerification() {
  console.log('================================================================');
  console.log('🚀 RUNNING MASTER MULTI-TENANT ARCHITECTURE & BRANDING VERIFICATION');
  console.log('================================================================');

  await connectDB();

  // Token creation for test roles
  const superAdminToken = jwt.sign(
    {
      userId: 'sa-001',
      roles: 'superadmin',
      role: 'superadmin',
      tenantId: ROOT_TENANT_ID,
      isPlatformSuperAdmin: true,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const fleetAlphaId = 'a1111111-aaaa-1111-aaaa-111111111111'; // Alpha Fleet Ltd
  const fleetBetaId = 'b2222222-bbbb-2222-bbbb-222222222222'; // Beta Transport Corp
  const fleetVijayId = '86dd7cb6-db2b-41f2-84b8-084239222083'; // vijay (BASIC plan)

  const fleetAlphaAdminToken = jwt.sign(
    {
      userId: 'fa-alpha-001',
      roles: 'fleet_admin',
      role: 'fleet_admin',
      tenantId: fleetAlphaId,
      isPlatformSuperAdmin: false,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const fleetBetaAdminToken = jwt.sign(
    {
      userId: 'fa-beta-001',
      roles: 'fleet_admin',
      role: 'fleet_admin',
      tenantId: fleetBetaId,
      isPlatformSuperAdmin: false,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // -------------------------------------------------------------------------
  // SCENARIO 1 & 2: SuperAdmin Identity and All Fleets Directory
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 1 & 2: SuperAdmin Identity & Fleets Directory ---');
  const dirRes = await makeRequest('GET', '/api/tenants', undefined, {
    Authorization: `Bearer ${superAdminToken}`,
  });
  assertCheck(dirRes.statusCode === 200, 'SuperAdmin can fetch all tenants directory (HTTP 200)', `Got ${dirRes.statusCode}: ${JSON.stringify(dirRes.data)}`);
  assertCheck(Array.isArray(dirRes.data?.tenants), 'Tenants returned as array');

  // Check that customer fleets exist
  const tenants = dirRes.data?.tenants || [];
  const foundAlpha = tenants.find((t: any) => t.tenantId === fleetAlphaId);
  const foundBeta = tenants.find((t: any) => t.tenantId === fleetBetaId);
  const foundVijay = tenants.find((t: any) => t.tenantId === fleetVijayId);
  assertCheck(!!foundAlpha, 'Alpha Fleet Ltd exists in authoritative tenant directory');
  assertCheck(!!foundBeta, 'Beta Transport Corp exists in authoritative tenant directory');
  assertCheck(!!foundVijay, 'vijay fleet exists in authoritative tenant directory');
  assertCheck(foundVijay?.planTier === 'BASIC', 'vijay fleet correctly has planTier BASIC');

  // -------------------------------------------------------------------------
  // SCENARIO 3 & 4: SuperAdmin Fleet Scoping & Isolation
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 3 & 4: SuperAdmin Fleet Scoping ---');
  // 3a. Platform-wide view (X-Tenant-ID: all)
  const allOverview = await makeRequest('GET', '/api/tenants/dashboard/overview', undefined, {
    Authorization: `Bearer ${superAdminToken}`,
    'X-Tenant-ID': 'all',
  });
  assertCheck(allOverview.statusCode === 200, 'Dashboard overview for all fleets returns HTTP 200');
  assertCheck(allOverview.data?.data?.isAllFleets === true, 'Overview correctly identifies isAllFleets=true');
  assertCheck(allOverview.data?.data?.tenant?.tenantId === 'all', 'Tenant identity in aggregated mode is all');

  // 3b. Scoped view to Alpha Fleet (X-Tenant-ID: fleetAlphaId)
  const scopedAlpha = await makeRequest('GET', '/api/tenants/dashboard/overview', undefined, {
    Authorization: `Bearer ${superAdminToken}`,
    'X-Tenant-ID': fleetAlphaId,
  });
  assertCheck(scopedAlpha.statusCode === 200, 'Dashboard overview scoped to Alpha Fleet returns HTTP 200');
  assertCheck(scopedAlpha.data?.data?.tenant?.tenantId === fleetAlphaId, 'Overview returns Alpha Fleet ID');
  assertCheck(scopedAlpha.data?.data?.tenant?.name === 'Alpha Fleet Ltd', 'Overview returns Alpha Fleet name');

  // 3c. Scoped view to vijay (BASIC plan)
  const scopedVijay = await makeRequest('GET', '/api/tenants/dashboard/overview', undefined, {
    Authorization: `Bearer ${superAdminToken}`,
    'X-Tenant-ID': fleetVijayId,
  });
  assertCheck(scopedVijay.statusCode === 200, 'Dashboard overview scoped to vijay returns HTTP 200');
  assertCheck(scopedVijay.data?.data?.tenant?.name === 'vijay', 'Overview returns vijay fleet name');
  assertCheck(scopedVijay.data?.data?.subscription?.planTier === 'BASIC', 'Overview returns vijay planTier BASIC');

  // -------------------------------------------------------------------------
  // SCENARIO 5: Fleet Admin Profile & Data Isolation
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 5: Fleet Admin Profile & Isolation ---');
  const alphaProfile = await makeRequest('GET', '/api/tenants/current/profile', undefined, {
    Authorization: `Bearer ${fleetAlphaAdminToken}`,
  });
  assertCheck(alphaProfile.statusCode === 200, 'Alpha Fleet Admin can fetch current profile (HTTP 200)');
  assertCheck(alphaProfile.data?.tenant?.name === 'Alpha Fleet Ltd', 'Alpha Fleet Admin profile name matches Alpha Fleet Ltd');
  assertCheck(alphaProfile.data?.tenant?.tenantId === fleetAlphaId, 'Alpha Fleet Admin profile matches alpha ID');

  // Fleet Admin CANNOT access directory of all tenants
  const forbiddenDir = await makeRequest('GET', '/api/tenants', undefined, {
    Authorization: `Bearer ${fleetAlphaAdminToken}`,
  });
  assertCheck(forbiddenDir.statusCode === 403, 'Fleet Admin calling /api/tenants directory is rejected with HTTP 403 Forbidden');

  // Fleet Admin CANNOT spoof another fleet ID via X-Tenant-ID
  const spoofAttempt = await makeRequest('GET', '/api/tenants/dashboard/overview', undefined, {
    Authorization: `Bearer ${fleetAlphaAdminToken}`,
    'X-Tenant-ID': fleetBetaId,
  });
  assertCheck(spoofAttempt.statusCode === 403, 'Fleet Admin trying to spoof another tenant via X-Tenant-ID is rejected with HTTP 403');

  // -------------------------------------------------------------------------
  // SCENARIO 8: SuperAdmin Registration Notifications
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 8: SuperAdmin In-App Notifications ---');
  // Submit new registration
  const testRegCode = `RG${Date.now().toString().slice(-6)}`;
  const regRes = await makeRequest('POST', '/api/tenants/register', {
    fleetName: `Swift Logistics ${testRegCode}`,
    businessCode: testRegCode,
    ownerName: 'Ramesh Sharma',
    contactEmail: `ramesh.${testRegCode.toLowerCase()}@swiftlogistics.com`,
    contactPhone: '9840123456',
    city: 'Chennai',
    state: 'Tamil Nadu',
    requestedPlanTier: 'PRO',
    billingCycle: 'MONTHLY',
    fleetSize: '10-25',
    termsConsent: true,
  });
  assertCheck(regRes.statusCode === 201, 'Public fleet registration submitted successfully (HTTP 201)');
  const submittedReqId = regRes.data?.data?.requestId;
  assertCheck(!!submittedReqId, 'Received requestId for new fleet application');

  // SuperAdmin fetches notifications
  const notifRes = await makeRequest('GET', '/api/tenants/admin/notifications', undefined, {
    Authorization: `Bearer ${superAdminToken}`,
  });
  assertCheck(notifRes.statusCode === 200, 'SuperAdmin can fetch registration notifications (HTTP 200)');
  assertCheck(typeof notifRes.data?.unreadCount === 'number', 'unreadCount is returned as number');
  assertCheck(notifRes.data?.unreadCount >= 1, `Unread count reflects pending registration (${notifRes.data?.unreadCount})`);

  // Verify the submitted registration appears in notifications
  const foundNotif = notifRes.data?.notifications?.find((n: any) => n.requestId === submittedReqId);
  assertCheck(!!foundNotif, 'Submitted registration appears in SuperAdmin notifications list');
  assertCheck(foundNotif?.fleetName === `Swift Logistics ${testRegCode}`, 'Notification contains correct fleet name');
  assertCheck(foundNotif?.isRead === false, 'Notification initially has isRead=false');

  // Mark notification as read
  const markReadRes = await makeRequest(
    'POST',
    `/api/tenants/admin/notifications/mark-read/${submittedReqId}`,
    undefined,
    { Authorization: `Bearer ${superAdminToken}` }
  );
  assertCheck(markReadRes.statusCode === 200, 'Notification marked as read returns HTTP 200');

  // -------------------------------------------------------------------------
  // SCENARIO 9 & 10: Registration Approval & Account Activation Token
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 9 & 10: Approval & Activation Validation ---');
  const approveRes = await makeRequest(
    'POST',
    `/api/tenants/admin/registrations/${submittedReqId}/approve`,
    { reviewNotes: 'Verified all compliance documents.' },
    { Authorization: `Bearer ${superAdminToken}` }
  );
  assertCheck(approveRes.statusCode === 200, 'SuperAdmin approval of registration succeeds (HTTP 200)');
  const rawToken = approveRes.data?.data?.rawToken;
  assertCheck(!!rawToken, 'Approval returns secure activation token');

  // Verify activation token public endpoint
  const verifyTokenRes = await makeRequest(
    'GET',
    `/api/tenants/activation/verify/${rawToken}`
  );
  assertCheck(verifyTokenRes.statusCode === 200, 'Public verify activation token returns HTTP 200');
  assertCheck(verifyTokenRes.data?.valid === true, 'Activation token is confirmed valid');

  // 10a. Unregistered email CANNOT activate account
  const invalidEmailActivation = await makeRequest('POST', '/api/tenants/activation/complete', {
    token: rawToken,
    email: 'hacker@unauthorized.com',
    password: 'MasterPassword123!',
    confirmPassword: 'MasterPassword123!',
  });
  assertCheck(
    invalidEmailActivation.statusCode === 400,
    'Activation with mismatched email is rejected with HTTP 400'
  );
  assertCheck(
    invalidEmailActivation.data?.message === 'Email is not registered for an approved fleet.',
    'Meaningful error toast returned: "Email is not registered for an approved fleet."'
  );

  // 10b. Registered email activates account successfully
  const validActivation = await makeRequest('POST', '/api/tenants/activation/complete', {
    token: rawToken,
    email: `ramesh.${testRegCode.toLowerCase()}@swiftlogistics.com`,
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
  });
  assertCheck(validActivation.statusCode === 200, 'Activation with registered email succeeds (HTTP 200)');

  // 10c. Token replay is blocked (single-use token invalidated)
  const replayActivation = await makeRequest('POST', '/api/tenants/activation/complete', {
    token: rawToken,
    email: `ramesh.${testRegCode.toLowerCase()}@swiftlogistics.com`,
    password: 'AnotherPassword123!',
    confirmPassword: 'AnotherPassword123!',
  });
  assertCheck(replayActivation.statusCode === 400, 'Replay of used activation token is blocked (HTTP 400)');

  // -------------------------------------------------------------------------
  // SCENARIO 11 & 12: Company SEO URL & Company-Level Login / Forgot Password
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 11 & 12: Company SEO URL & Authentication ---');
  // Create test company with unique SEO slug
  const compSlug = `logistics-hub-${Date.now()}`;
  const compRes = await makeRequest(
    'POST',
    '/api/emp/createCompany',
    {
      companyName: `Logistics Hub ${Date.now()}`,
      companyPhno: '9840998877',
      managerEmail: 'manager@hub.com',
      city: 'Chennai',
      companyaddress: 'Mount Road, Guindy',
      state: 'Tamil Nadu',
      country: 'India',
      pinCode: '600032',
      contactPerson: 'Karthik',
      email: `admin@${compSlug}.com`,
      seoUrl: compSlug,
    },
    { Authorization: `Bearer ${fleetBetaAdminToken}` }
  );
  assertCheck(compRes.statusCode === 200 || compRes.statusCode === 201, 'Company created with unique SEO URL (HTTP 200/201)', `Got ${compRes.statusCode}: ${JSON.stringify(compRes.data)}`);

  // Resolve public company by SEO URL
  const pubCompRes = await makeRequest('GET', `/api/company/${compSlug}`);
  assertCheck(pubCompRes.statusCode === 200, 'Company resolves by SEO URL (HTTP 200)', `Got ${pubCompRes.statusCode}: ${JSON.stringify(pubCompRes.data)}`);
  assertCheck(pubCompRes.data?.seoUrl === compSlug || pubCompRes.data?.company?.seoUrl === compSlug || pubCompRes.data?.data?.seoUrl === compSlug, 'Resolved company SEO URL matches requested slug');

  // Company forgot-password with SEO URL context
  const forgotOtpRes = await makeRequest('POST', '/api/auth/forgetPasswordSendOtp', {
    email: `nonexistent@${compSlug}.com`,
    seoUrl: compSlug,
  });
  assertCheck(forgotOtpRes.statusCode === 200, 'Forgot password returns generic 200 to prevent user enumeration');

  // -------------------------------------------------------------------------
  // SCENARIO 14: Fleet Document Branding (Logos, Colors, GST)
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 14: Dynamic Fleet Document Branding ---');
  // Update Alpha Fleet document branding
  const updateBrandingRes = await makeRequest(
    'PUT',
    '/api/tenants/current/branding',
    {
      brandingTokens: {
        headerColor: '#1A365D',
        primaryColor: '#2B6CB0',
        gstNumber: '33AAACA1234A1Z5',
        registeredAddress: 'Alpha Towers, OMR, Chennai - 600096',
      },
      contactPhone: '9840112233',
    },
    { Authorization: `Bearer ${fleetAlphaAdminToken}` }
  );
  assertCheck(updateBrandingRes.statusCode === 200, 'Fleet Admin can update branding tokens (HTTP 200)');

  // Verify authoritative resolver pulls the exact configured branding
  const alphaBranding = await getFleetDocumentBranding(fleetAlphaId);
  assertCheck(alphaBranding.fleetName === 'Alpha Fleet Ltd', 'Branding resolver returns Alpha Fleet Ltd');
  assertCheck(alphaBranding.headerColor === '#1A365D', 'Branding resolver returns custom header color #1A365D');
  assertCheck(alphaBranding.gstNumber === '33AAACA1234A1Z5', 'Branding resolver returns correct GST number');
  assertCheck(alphaBranding.registeredAddress === 'Alpha Towers, OMR, Chennai - 600096', 'Branding resolver returns correct registered address');
  assertCheck(alphaBranding.logoSrc.length > 0, 'Branding resolver provides valid logo source (embedded data URI or URL)');

  // Verify Beta Fleet has its own distinct branding
  const betaBranding = await getFleetDocumentBranding(fleetBetaId);
  assertCheck(betaBranding.fleetName === 'Beta Transport Corp', 'Beta Fleet has its own distinct fleet name');
  assertCheck(betaBranding.headerColor !== alphaBranding.headerColor, 'Beta Fleet header color is distinct from Alpha Fleet');

  // -------------------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🏁 MASTER MULTI-TENANT VERIFICATION COMPLETE:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMasterVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
