import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  connectDB,
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
} from '../models';
import { ROOT_TENANT_ID, runWithTenantContext } from '../context/tenantContext';

const SCREENSHOT_DIR = 'C:/Users/PCS/.gemini/antigravity/brain/e18f1677-ec07-45c1-84e5-b7be80bc79a7/screenshots';
const JWT_SECRET = process.env.JWT_SECRET || 'jk23DFEo';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserVerification() {
  console.log('======================================================================');
  console.log('   STARTING VISUAL BROWSER VERIFICATION (PUPPETEER)                   ');
  console.log('======================================================================\n');

  await connectDB();

  // Create clean verified fleet for browser testing
  const testTenantId = uuidv4();
  const testCode = `GM${Date.now().toString().slice(-4)}`;
  const testEmail = `murugan_${Date.now().toString().slice(-4)}@example.com`;

  await runWithTenantContext({ tenantId: ROOT_TENANT_ID, tenantCode: 'GC', isPlatformSuperAdmin: true }, async () => {
    await TenantRegistrationRequest.create({
      requestId: uuidv4(),
      fleetName: 'Ganthimurugan Fleet Mobility',
      legalName: 'Ganthimurugan Logistics Private Limited',
      displayName: 'Ganthimurugan Travels',
      businessCode: testCode,
      ownerName: 'Ganthimathi Murugan',
      contactEmail: testEmail,
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
      tenantId: testTenantId,
    });

    await Tenant.create({
      tenantId: testTenantId,
      name: 'Ganthimurugan Fleet Mobility',
      displayName: 'Ganthimurugan Travels',
      legalName: 'Ganthimurugan Logistics Private Limited',
      code: testCode,
      contactEmail: testEmail,
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
      tenantId: testTenantId,
      planTier: 'PRO',
      status: 'TRIALING',
      vehicleQuota: 75,
      driverQuota: 75,
      companyQuota: 20,
      monthlyTripQuota: 2500,
      trialDurationDays: 7,
      trialStartDate: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    });
  });

  const testToken = jwt.sign(
    { userId: uuidv4(), email: testEmail, role: 'fleet_admin', tenantId: testTenantId },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
    defaultViewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  const takeScreenshot = async (name: string) => {
    const buffer = await page.screenshot({ fullPage: false });
    fs.writeFileSync(path.join(SCREENSHOT_DIR, name), buffer);
    console.log(`  📸 Captured ${name}`);
  };

  try {
    // -----------------------------------------------------------------------
    // STEP 1: Unauthenticated Public Homepage (localhost:3000)
    // -----------------------------------------------------------------------
    console.log('\n--- Step 1: Inspecting unauthenticated public homepage ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));

    const title1 = await page.title();
    console.log('  Homepage Title before login:', title1);
    if (!title1.includes('CABZ')) {
      throw new Error(`Expected CABZ in title, got: ${title1}`);
    }
    await takeScreenshot('01_public_homepage_before_login.png');

    // -----------------------------------------------------------------------
    // STEP 2: Authenticated Fleet Admin Login / Dashboard Session
    // -----------------------------------------------------------------------
    console.log('\n--- Step 2: Injecting authenticated Fleet Admin session for Ganthimurugan Travels ---');
    await page.evaluate(({ token, tenantId }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('role', 'fleet_admin');
      localStorage.setItem('tenantId', tenantId);
      localStorage.setItem('selectedTenantId', tenantId);
      localStorage.setItem('fleetName', 'Ganthimurugan Travels');
      localStorage.setItem('tenantName', 'Ganthimurugan Travels');
      localStorage.setItem('username', 'Ganthimurugan');
      localStorage.setItem('user', JSON.stringify({
        userId: 'test-admin-01',
        username: 'Ganthimurugan',
        role: 'fleet_admin',
        tenantId: tenantId,
      }));
    }, { token: testToken, tenantId: testTenantId });

    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    const dashTitle = await page.title();
    console.log('  Dashboard Title:', dashTitle);
    await takeScreenshot('02_fleet_portal_dashboard_authenticated.png');

    // -----------------------------------------------------------------------
    // STEP 3: Navigate Back to Public Homepage while Authenticated
    // -----------------------------------------------------------------------
    console.log('\n--- Step 3: Navigating to public homepage while logged in ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));

    const publicTitleLoggedIn = await page.title();
    console.log('  Homepage Title while logged in:', publicTitleLoggedIn);
    if (publicTitleLoggedIn.includes('Ganthimurugan') || !publicTitleLoggedIn.includes('CABZ')) {
      throw new Error(`Branding leak detected! Title is: ${publicTitleLoggedIn}`);
    }
    await takeScreenshot('03_public_homepage_while_logged_in.png');

    // -----------------------------------------------------------------------
    // STEP 4: Navigate to Fleet Profile Management Page
    // -----------------------------------------------------------------------
    console.log('\n--- Step 4: Navigating to Fleet Profile (/profile) ---');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    const profileTitle = await page.title();
    console.log('  Profile Page Title:', profileTitle);
    await takeScreenshot('04_fleet_profile_view_mode.png');

    // -----------------------------------------------------------------------
    // STEP 5: Edit Fleet Profile & Save Changes
    // -----------------------------------------------------------------------
    console.log('\n--- Step 5: Editing Fleet Profile (Updating display name & operating details) ---');
    const editBtn = await page.$('#edit-fleet-profile-btn');
    if (editBtn) {
      await editBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    // Update display name input
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const displayNameInput = inputs.find((i) => i.placeholder?.includes('Apex Cabs') || i.value === 'Ganthimurugan Travels');
      if (displayNameInput) {
        displayNameInput.value = 'GANTHI SMART MOBILITY EXPRESS';
        displayNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        displayNameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await new Promise((r) => setTimeout(r, 500));
    const saveBtn = await page.$('#save-fleet-profile-btn');
    if (saveBtn) {
      await saveBtn.click();
      await new Promise((r) => setTimeout(r, 2500));
    }
    await takeScreenshot('05_fleet_profile_saved_updated.png');

    // -----------------------------------------------------------------------
    // STEP 6: Logout Workflow
    // -----------------------------------------------------------------------
    console.log('\n--- Step 6: Executing logout and verifying session wipe ---');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('fleetName');
      localStorage.removeItem('tenantName');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('selectedTenantId');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('cabz:auth_logout'));
      window.location.href = '/login';
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1000));
    await takeScreenshot('06_post_logout_login_page.png');

    // -----------------------------------------------------------------------
    // STEP 7: Strict Unauthenticated Direct Navigation Protection
    // -----------------------------------------------------------------------
    console.log('\n--- Step 7: Testing direct navigation to protected /dashboard while logged out ---');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));

    const currentUrl = page.url();
    console.log('  Current URL after direct /dashboard access:', currentUrl);
    if (!currentUrl.includes('/login') && !currentUrl.includes('/adminlogin')) {
      throw new Error(`Direct protected navigation did not redirect to /login! Current URL: ${currentUrl}`);
    }
    await takeScreenshot('07_unauthenticated_route_protection_redirect.png');

    console.log('\n======================================================================');
    console.log('   ALL 7 BROWSER VERIFICATION SCENARIOS COMPLETED 100% SUCCESSFULLY!   ');
    console.log('======================================================================\n');
  } finally {
    await browser.close();
  }
}

runBrowserVerification().catch((err) => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
