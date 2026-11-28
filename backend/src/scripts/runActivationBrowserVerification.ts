import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import {
  connectDB,
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
  TenantActivationToken,
} from '../models';

const SCREENSHOT_DIR = 'C:/Users/PCS/.gemini/antigravity/brain/e18f1677-ec07-45c1-84e5-b7be80bc79a7/screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserVerification() {
  console.log('======================================================================');
  console.log('   PUPPETEER VISUAL VERIFICATION: FREE TRIAL ACCOUNT ACTIVATION       ');
  console.log('======================================================================\n');

  await connectDB();

  const uniqueSuffix = Math.floor(100000 + Math.random() * 900000);
  const testTenantId = uuidv4();
  const testCode = `VF${uniqueSuffix.toString().slice(-4)}`;
  const testEmail = `operator_${uniqueSuffix}@trialfleet.com`;
  const rawToken = `act_vis_${crypto.randomBytes(24).toString('hex')}`;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 1. Create registration request
  await TenantRegistrationRequest.create({
    requestId: uuidv4(),
    fleetName: `Visual Trial Fleet ${uniqueSuffix}`,
    legalName: `Visual Trial Fleet Mobility Pvt Ltd`,
    displayName: `Visual Trial Fleet ${uniqueSuffix}`,
    businessCode: testCode,
    ownerName: 'Praveen Murugan',
    contactEmail: testEmail,
    contactPhone: `98${uniqueSuffix}11`,
    city: 'Chennai',
    state: 'Tamil Nadu',
    status: 'APPROVED',
    requestedPlanTier: 'FREE_TRIAL',
    termsConsent: true,
    tenantId: testTenantId,
    demoCallDate: '2026-11-29',
    demoCallTime: '11:00 AM',
    demoCallStatus: 'Requested',
  });

  // 2. Create Tenant with planTier = null (Free trial)
  await Tenant.create({
    tenantId: testTenantId,
    name: `Visual Trial Fleet ${uniqueSuffix}`,
    legalName: `Visual Trial Fleet Mobility Pvt Ltd`,
    displayName: `Visual Trial Fleet ${uniqueSuffix}`,
    code: testCode,
    subdomain: testCode.toLowerCase(),
    status: 'ACTIVE',
    planTier: null,
    contactEmail: testEmail,
    contactPhone: `98${uniqueSuffix}11`,
    city: 'Chennai',
    state: 'Tamil Nadu',
    brandingTokens: {
      primaryColor: '#0f1c3f',
      portalTitle: `Visual Trial Fleet Operations`,
    },
  });

  // 3. Create Subscription with planTier = null, status = 'TRIALING', agreedPrice = 0
  await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: testTenantId,
    planTier: null,
    status: 'TRIALING',
    vehicleQuota: 75,
    driverQuota: 75,
    companyQuota: 20,
    monthlyTripQuota: 250,
    taxQuota: 2,
    allowOverage: false,
    billingCycle: 'MONTHLY',
    agreedPrice: 0,
    trialStartDate: null,
    trialEndsAt: null,
    trialDurationDays: 7,
  });

  // 4. Create Activation Token
  await TenantActivationToken.create({
    tokenId: uuidv4(),
    tenantId: testTenantId,
    adminEmail: testEmail,
    adminName: 'Praveen Murugan',
    tokenHash,
    expiresAt,
    isRevoked: false,
  });

  console.log(`✓ Seeded test fleet: Visual Trial Fleet ${uniqueSuffix} (Code: ${testCode})`);
  console.log(`✓ Activation URL: http://localhost:3000/activate-account?token=${rawToken}\n`);

  // 5. Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    const activationUrl = `http://localhost:3000/activate-account?token=${rawToken}`;
    console.log(`Navigating to: ${activationUrl}`);
    await page.goto(activationUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for form to appear
    await page.waitForSelector('form', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Verify page content
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('--- Page Content Verification ---');

    const hasFreeTrial = pageText.includes('FREE TRIAL') || pageText.includes('7-Day Free Trial');
    const hasProSelected = pageText.includes('Selected Plan:\nPRO') || pageText.includes('Selected Plan: PRO');
    const hasPaidPrice = pageText.includes('₹349') || pageText.includes('₹411.82');

    console.log(`  - Displays Free Trial: ${hasFreeTrial ? 'YES (PASS)' : 'NO (FAIL)'}`);
    console.log(`  - Displays Selected Plan PRO: ${hasProSelected ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.log(`  - Displays Paid Amount (₹349 / ₹411.82): ${hasPaidPrice ? 'YES (FAIL)' : 'NO (PASS)'}`);

    if (!hasFreeTrial) throw new Error('Activation page failed to display Free Trial details');
    if (hasProSelected) throw new Error('Activation page incorrectly displayed Selected Plan: PRO');
    if (hasPaidPrice) throw new Error('Activation page incorrectly displayed paid amount');

    // Screenshot 1: Activation form showing FREE TRIAL
    const shot1Path = path.join(SCREENSHOT_DIR, '01_activation_form_free_trial.png');
    await page.screenshot({ path: shot1Path as any, fullPage: true });
    console.log(`📸 Screenshot saved: ${shot1Path}`);

    // Fill password and activate account
    console.log('\nSubmitting password to activate account...');
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].type('Password123!');
      await passwordInputs[1].type('Password123!');
    }

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }

    // Wait for success screen
    await page.waitForFunction(
      () => document.body.innerText.includes('Account Ready!') || document.body.innerText.includes('Operator Login'),
      { timeout: 15000 }
    );
    await new Promise((r) => setTimeout(r, 1000));

    // Screenshot 2: Activation success screen
    const shot2Path = path.join(SCREENSHOT_DIR, '02_activation_success_card.png');
    await page.screenshot({ path: shot2Path as any, fullPage: true });
    console.log(`📸 Screenshot saved: ${shot2Path}`);

    console.log('\n✅ VISUAL BROWSER VERIFICATION COMPLETED WITH 100% SUCCESS.');
  } catch (err: any) {
    console.error('Browser verification failed:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runBrowserVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
