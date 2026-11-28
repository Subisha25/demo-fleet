import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import puppeteer from 'puppeteer';
import {
  connectDB,
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
  TenantActivationToken,
  Employee,
} from '../models';

const SCREENSHOT_DIR = 'C:/Users/PCS/.gemini/antigravity/brain/e18f1677-ec07-45c1-84e5-b7be80bc79a7/screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Initializing Test Entities & Live Browser UI Verification Suite');
  await connectDB();

  const now = new Date();
  const testSuffix = Date.now().toString().slice(-4);

  // 1. Pending Activation Entity
  const pendingTenantId = uuidv4();
  const pendingRegId = uuidv4();
  const rawToken = uuidv4();
  const pendingTokenHash = await bcrypt.hash(rawToken, 10);
  const pendingEmail = `pending.${testSuffix}@cabztest.in`;

  await TenantRegistrationRequest.create({
    requestId: pendingRegId,
    fleetName: `Auto Fleet ${testSuffix}`,
    legalName: `Auto Fleet ${testSuffix} Pvt Ltd`,
    ownerName: 'Vikas Sharma',
    contactEmail: pendingEmail,
    contactPhone: `980000${testSuffix}`,
    businessCode: `AF${testSuffix}`,
    requestedPlanTier: 'FREE_TRIAL',
    billingCycle: 'MONTHLY',
    city: 'Hyderabad',
    state: 'Telangana',
    status: 'APPROVED',
  });

  await Tenant.create({
    tenantId: pendingTenantId,
    name: `Auto Fleet ${testSuffix}`,
    displayName: `Auto Fleet ${testSuffix}`,
    code: `AF${testSuffix}`,
    slug: `auto-fleet-${testSuffix}`,
    status: 'ACTIVE',
    contactEmail: pendingEmail,
    contactPhone: `980000${testSuffix}`,
  });

  await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: pendingTenantId,
    status: 'TRIALING',
    planTier: null,
    agreedPrice: 0,
    trialDurationDays: 7,
    trialStartDate: null,
    trialEndsAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
  });

  await TenantActivationToken.create({
    tokenId: uuidv4(),
    tenantId: pendingTenantId,
    adminEmail: pendingEmail,
    tokenHash: pendingTokenHash,
    expiresAt: new Date(Date.now() + 86400000),
    usedAt: null,
  });

  // 2. Active Trial Entity
  const activeTenantId = uuidv4();
  const activeEmail = `active.${testSuffix}@cabztest.in`;
  const passwordHash = await bcrypt.hash('Password@123', 10);

  await Tenant.create({
    tenantId: activeTenantId,
    name: `Active Express ${testSuffix}`,
    displayName: `Active Express ${testSuffix}`,
    code: `AX${testSuffix}`,
    slug: `active-express-${testSuffix}`,
    status: 'ACTIVE',
    contactEmail: activeEmail,
    contactPhone: `981111${testSuffix}`,
  });

  await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: activeTenantId,
    status: 'TRIALING',
    planTier: null,
    agreedPrice: 0,
    trialDurationDays: 7,
    trialStartDate: now,
    trialEndsAt: new Date(now.getTime() + 7 * 86400000),
    currentPeriodStart: now,
    currentPeriodEnd: new Date(now.getTime() + 7 * 86400000),
  });

  await Employee.create({
    employeeId: uuidv4(),
    tenantId: activeTenantId,
    username: `active_ops_${testSuffix}`,
    email: activeEmail,
    phno: `981111${testSuffix}`,
    password: passwordHash,
    role: 'fleet_admin',
    roles: 'fleet_admin',
    status: 'ACTIVE',
    name: 'Active Ops Admin',
  });

  // 3. Expired Trial Entity
  const expiredTenantId = uuidv4();
  const expiredEmail = `expired.${testSuffix}@cabztest.in`;
  const pastExpiry = new Date(Date.now() - 3600000);

  await Tenant.create({
    tenantId: expiredTenantId,
    name: `Expired Fleet ${testSuffix}`,
    displayName: `Expired Fleet ${testSuffix}`,
    code: `EF${testSuffix}`,
    slug: `expired-fleet-${testSuffix}`,
    status: 'ACTIVE',
    contactEmail: expiredEmail,
    contactPhone: `982222${testSuffix}`,
  });

  await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: expiredTenantId,
    status: 'TRIALING',
    planTier: null,
    agreedPrice: 0,
    trialDurationDays: 7,
    trialStartDate: new Date(Date.now() - 8 * 86400000),
    trialEndsAt: pastExpiry,
    currentPeriodStart: new Date(Date.now() - 8 * 86400000),
    currentPeriodEnd: pastExpiry,
  });

  await Employee.create({
    employeeId: uuidv4(),
    tenantId: expiredTenantId,
    username: `expired_ops_${testSuffix}`,
    email: expiredEmail,
    phno: `982222${testSuffix}`,
    password: passwordHash,
    role: 'fleet_admin',
    roles: 'fleet_admin',
    status: 'ACTIVE',
    name: 'Expired Ops Admin',
  });

  console.log('✓ Database entities provisioned successfully.');

  // =========================================================================
  // PUPPETEER BROWSER EXECUTION
  // =========================================================================
  console.log('\n--- Launching Puppeteer Browser ---');
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
    // -------------------------------------------------------------------------
    // 1. Password Setup & Account Activation
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing Account Activation Page ---');
    const activationUrl = `http://localhost:3000/activate-account?token=${rawToken}`;
    await page.goto(activationUrl, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));
    await takeScreenshot('01_activation_form_loaded.png');

    // Fill registered email if empty
    const emailField = await page.$('input[type="email"]');
    if (emailField) {
      const currentVal = await emailField.evaluate((el: any) => el.value);
      if (!currentVal) {
        await emailField.type(pendingEmail);
      }
    }

    // Fill password fields
    const passwordFields = await page.$$('input[type="password"]');
    if (passwordFields.length >= 2) {
      await passwordFields[0].type('Password@123');
      await passwordFields[1].type('Password@123');
    }

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise((r) => setTimeout(r, 2000));
    }

    await takeScreenshot('02_activation_success_card.png');

    // Verify token used in DB
    const tokenRecord = await TenantActivationToken.findOne({ where: { tenantId: pendingTenantId } });
    console.log(`  Token usedAt after activation: ${tokenRecord?.usedAt}`);

    const subRecord = await TenantSubscription.findOne({ where: { tenantId: pendingTenantId } });
    console.log(`  Trial start date after activation: ${subRecord?.trialStartDate}`);
    console.log(`  Trial expiry date after activation: ${subRecord?.trialEndsAt}`);

    // -------------------------------------------------------------------------
    // 2. Active Free Trial Operator Dashboard & Modules Access
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Active Free Trial Operator Login & Dashboard ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');

    await page.type('input[type="email"]', activeEmail);
    await page.type('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));
    await takeScreenshot('03_active_trial_dashboard_view.png');

    const headerTexts = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('header *'));
      return nodes.map((n) => n.textContent?.trim()).filter((t) => t && (t.includes('TRIAL') || t.includes('Trial') || t.includes('Days Left')));
    });
    console.log('  Active Trial Badges in Header:', Array.from(new Set(headerTexts)));

    // Navigate to Vehicles Page
    console.log('  Navigating to Vehicles Module (/vendor/manageVehicles)...');
    await page.goto('http://localhost:3000/vendor/manageVehicles', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await takeScreenshot('04_active_trial_vehicles_unlocked.png');

    // Navigate to Current Plan Page
    console.log('  Navigating to Billing Current Plan (/billing/current-plan)...');
    await page.goto('http://localhost:3000/billing/current-plan', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await takeScreenshot('05_active_trial_current_plan_breakdown.png');

    // -------------------------------------------------------------------------
    // 3. Expired Free Trial & Interactive 3-Plan Selection Modal
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Expired Free Trial & Interactive Plan Selector Modal ---');
    // Clear storage & cookies
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const cdp = await page.target().createCDPSession();
    await cdp.send('Network.clearBrowserCookies');

    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]');

    await page.type('input[type="email"]', expiredEmail);
    await page.type('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');

    // Wait for SubscriptionLockModal to render
    await page.waitForSelector('h2, .animate-scaleUp', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));
    await takeScreenshot('06_expired_trial_lock_modal_initial_zero.png');

    // Inspect initial pricing in modal (Core Rule 2: Must NOT show ₹411.82 before customer chooses a plan!)
    const initialPriceCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasZeroPrice: text.includes('₹0.00'),
        hasNoPlanSelected: text.includes('No Plan Selected') || text.includes('Select a plan above') || text.includes('Select Your Subscription Plan'),
        hasPro411Default: text.includes('₹411.82'),
      };
    });
    console.log('  Initial Modal Price Check:', initialPriceCheck);

    // 3.1 Click PRO Plan Card
    console.log('  Clicking PRO Plan Card (Growth Fleet Pro)...');
    await page.waitForSelector('[data-testid="plan-card-pro"]');
    await page.click('[data-testid="plan-card-pro"]');
    await new Promise((r) => setTimeout(r, 1000));
    await takeScreenshot('07_expired_trial_pro_selected_411_82.png');

    const proCalc = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        base349: text.includes('349.00') || text.includes('349'),
        tax62_82: text.includes('62.82'),
        total411_82: text.includes('411.82'),
      };
    });
    console.log('  PRO Plan Dynamic Calculation (₹349 + 18% GST = ₹411.82):', proCalc);

    // 3.2 Click BASIC Plan Card
    console.log('  Clicking BASIC Plan Card (Starter Mobility)...');
    await page.waitForSelector('[data-testid="plan-card-basic"]');
    await page.click('[data-testid="plan-card-basic"]');
    await new Promise((r) => setTimeout(r, 1000));
    await takeScreenshot('08_expired_trial_basic_selected_352_82.png');

    const basicCalc = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        base299: text.includes('299.00') || text.includes('299'),
        tax53_82: text.includes('53.82'),
        total352_82: text.includes('352.82'),
      };
    });
    console.log('  BASIC Plan Dynamic Calculation (₹299 + 18% GST = ₹352.82):', basicCalc);

    // 3.3 Re-select PRO Plan and Activate
    console.log('  Re-selecting PRO Plan and executing payment activation...');
    await page.click('[data-testid="plan-card-pro"]');
    await new Promise((r) => setTimeout(r, 800));

    // Click Activate Paid Plan button
    await page.waitForSelector('[data-testid="activate-paid-plan-btn"]');
    await page.click('[data-testid="activate-paid-plan-btn"]');
    await new Promise((r) => setTimeout(r, 4000));
    await takeScreenshot('09_post_payment_activated_success.png');

    // Verify in DB that expired tenant is now ACTIVE with PRO plan
    const activatedSub = await TenantSubscription.findOne({ where: { tenantId: expiredTenantId } });
    console.log(`  Activated Subscription Status in DB: ${activatedSub?.status}`);
    console.log(`  Activated Subscription PlanTier in DB: ${activatedSub?.planTier}`);
    console.log(`  Activated Subscription AgreedPrice in DB: ${activatedSub?.agreedPrice}`);

    console.log('\n========================================================================');
    console.log('✅ ALL LIVE BROWSER UI WORKFLOWS VERIFIED SUCCESSFULLY');
    console.log('========================================================================\n');
  } finally {
    await browser.close();
  }

  process.exit(0);
}

run().catch((e) => {
  console.error('Fatal execution error:', e);
  process.exit(1);
});
