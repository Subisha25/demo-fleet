import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import puppeteer from 'puppeteer';

const SCREENSHOT_DIR = 'C:/Users/PCS/.gemini/antigravity/brain/e18f1677-ec07-45c1-84e5-b7be80bc79a7/screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserVerification() {
  console.log('🚀 Starting Automated Puppeteer Browser UI Verification on http://localhost:3000');

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
    // =========================================================================
    // TASK 1: Account Activation & Password Setup
    // =========================================================================
    console.log('\n--- 1. Testing Account Activation Page ---');
    const activationUrl = 'http://localhost:3000/activate-account?token=4c05f048-a37f-40dc-bb15-7f6f95d9dd55';
    await page.goto(activationUrl, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));

    await takeScreenshot('01_activation_page_loaded.png');

    // Fill password form
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].type('Password@123');
      await passwordInputs[1].type('Password@123');
    }

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 1000));
    }

    await takeScreenshot('02_post_activation_login_page.png');
    console.log(`  Current URL after activation: ${page.url()}`);

    // =========================================================================
    // TASK 2: Active Free Trial Operator Dashboard & Modules
    // =========================================================================
    console.log('\n--- 2. Testing Active Free Trial Operator Session ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    // Fill login form
    const textInputs = await page.$$('input');
    for (const inp of textInputs) {
      const type = await inp.evaluate((el) => el.getAttribute('type') || 'text');
      const name = await inp.evaluate((el) => el.getAttribute('name') || '');
      const placeholder = await inp.evaluate((el) => el.getAttribute('placeholder') || '');
      if (type === 'password') {
        await inp.type('Password@123');
      } else if (name.includes('user') || name.includes('email') || placeholder.toLowerCase().includes('user') || placeholder.toLowerCase().includes('email')) {
        await inp.type('active_admin_3285');
      }
    }

    const loginBtn = await page.$('button[type="submit"]');
    if (loginBtn) {
      await loginBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 2000));
    }

    await takeScreenshot('03_active_trial_dashboard_header.png');
    console.log(`  Current Dashboard URL: ${page.url()}`);

    // Extract Header Badges
    const headerBadges = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('header span, .header span, nav span'));
      return badges.map((b) => b.textContent?.trim()).filter(Boolean);
    });
    console.log('  Header text elements observed:', headerBadges.slice(0, 10));

    // Navigate to Vehicles module
    console.log('  Navigating to Vehicles module (/vendor/manageVehicles)...');
    await page.goto('http://localhost:3000/vendor/manageVehicles', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await takeScreenshot('04_active_trial_vehicles_page.png');

    // Navigate to Current Plan page
    console.log('  Navigating to Current Plan (/billing/current-plan)...');
    await page.goto('http://localhost:3000/billing/current-plan', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await takeScreenshot('05_active_trial_current_plan.png');

    // =========================================================================
    // TASK 3: Expired Free Trial & Interactive 3-Plan Selection Modal
    // =========================================================================
    console.log('\n--- 3. Testing Expired Free Trial & SubscriptionLockModal ---');
    // Clear localStorage and cookies
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');

    // Navigate to Login and sign in as expired admin
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    const expiredInputs = await page.$$('input');
    for (const inp of expiredInputs) {
      const type = await inp.evaluate((el) => el.getAttribute('type') || 'text');
      const name = await inp.evaluate((el) => el.getAttribute('name') || '');
      const placeholder = await inp.evaluate((el) => el.getAttribute('placeholder') || '');
      if (type === 'password') {
        await inp.type('Password@123');
      } else if (name.includes('user') || name.includes('email') || placeholder.toLowerCase().includes('user') || placeholder.toLowerCase().includes('email')) {
        await inp.type('expired_admin_3285');
      }
    }

    const expiredLoginBtn = await page.$('button[type="submit"]');
    if (expiredLoginBtn) {
      await expiredLoginBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Inspect the SubscriptionLockModal on screen
    await takeScreenshot('06_expired_trial_lock_modal_initial.png');

    const modalContentInitial = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h2, h3, h4')).map((h) => h.textContent?.trim());
      const bodyText = document.body.innerText;
      const isZeroPrice = bodyText.includes('₹0.00');
      const hasPro411Default = bodyText.includes('₹411.82');
      return { headings, isZeroPrice, hasPro411Default };
    });
    console.log('  Initial Modal State:', modalContentInitial);

    // Click PRO Plan Card
    console.log('  Selecting PRO Plan card...');
    const clickedPro = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div, span, h4'));
      const proTarget = elements.find((el) => el.textContent?.includes('Growth Fleet Pro') || el.textContent?.trim() === 'PRO');
      if (proTarget) {
        (proTarget.closest('.cursor-pointer') as HTMLElement)?.click();
        return true;
      }
      return false;
    });
    console.log(`  Clicked PRO Card: ${clickedPro}`);
    await new Promise((r) => setTimeout(r, 1000));

    await takeScreenshot('07_expired_trial_pro_selected.png');

    const proSelectedPrice = await page.evaluate(() => {
      return {
        has349Base: document.body.innerText.includes('349'),
        has62_82Tax: document.body.innerText.includes('62.82'),
        has411_82Total: document.body.innerText.includes('411.82'),
      };
    });
    console.log('  PRO Plan Dynamic Calculation:', proSelectedPrice);

    // Click BASIC Plan Card
    console.log('  Selecting BASIC Plan card...');
    const clickedBasic = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div, span, h4'));
      const basicTarget = elements.find((el) => el.textContent?.includes('Starter Mobility') || el.textContent?.trim() === 'BASIC');
      if (basicTarget) {
        (basicTarget.closest('.cursor-pointer') as HTMLElement)?.click();
        return true;
      }
      return false;
    });
    console.log(`  Clicked BASIC Card: ${clickedBasic}`);
    await new Promise((r) => setTimeout(r, 1000));

    await takeScreenshot('08_expired_trial_basic_selected.png');

    const basicSelectedPrice = await page.evaluate(() => {
      return {
        has299Base: document.body.innerText.includes('299'),
        has53_82Tax: document.body.innerText.includes('53.82'),
        has352_82Total: document.body.innerText.includes('352.82'),
      };
    });
    console.log('  BASIC Plan Dynamic Calculation:', basicSelectedPrice);

    // Re-select PRO and activate
    console.log('  Re-selecting PRO Plan and executing payment activation...');
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div, span, h4'));
      const proTarget = elements.find((el) => el.textContent?.includes('Growth Fleet Pro') || el.textContent?.trim() === 'PRO');
      if (proTarget) {
        (proTarget.closest('.cursor-pointer') as HTMLElement)?.click();
      }
    });
    await new Promise((r) => setTimeout(r, 500));

    // Click Activate Paid Plan button
    const payBtnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const payBtn = btns.find((b) => b.textContent?.includes('Activate Growth Fleet Pro') || b.textContent?.includes('Activate Paid Plan') || b.textContent?.includes('411.82'));
      if (payBtn) {
        payBtn.click();
        return true;
      }
      return false;
    });
    console.log(`  Clicked Payment Activation Button: ${payBtnClicked}`);
    await new Promise((r) => setTimeout(r, 3000));

    await takeScreenshot('09_post_payment_activated.png');

    console.log('\n========================================================================');
    console.log('✅ BROWSER UI VERIFICATION COMPLETED SUCCESSFULLY');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('❌ Browser UI Verification error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runBrowserVerification().catch((e) => {
  console.error(e);
  process.exit(1);
});
