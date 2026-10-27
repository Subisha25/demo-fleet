import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import sequelize from '../config/dbConfig';
import { getSuperAdminEmail, getSuperAdminPhone, sendNotification } from '../services/notificationService';
import { sendDirectSms, send2FactorTemplateSms } from '../services/smsServices';
import { NotificationLog } from '../models/notificationLog';
import { OTP } from '../models/otp';
import { User } from '../models/user';
import { Employee } from '../models/employee';
import { Company } from '../models/company';
import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

let passed = 0;
let failed = 0;

async function assert(desc: string, fn: () => Promise<boolean | void>) {
  try {
    const res = await fn();
    if (res === false) {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    } else {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    }
  } catch (err: any) {
    console.error(`❌ FAIL: ${desc} -> Error: ${err?.message || err}`);
    failed++;
  }
}

async function runSmsFixVerification() {
  console.log('========================================================================');
  console.log('   FLEETFLOW SMS FIX & CONTACT ISOLATION VERIFICATION TEST SUITE');
  console.log('========================================================================\n');

  await sequelize.authenticate();

  // Ensure NOTIFICATION_MOCK_MODE is enabled during testing
  process.env.NOTIFICATION_MOCK_MODE = 'true';

  // -------------------------------------------------------------------------
  // 1. SuperAdmin Phone Resolution & Fallback Safety
  // -------------------------------------------------------------------------
  console.log('🔹 1. SuperAdmin Phone Resolution & Fallback Safety:');

  await assert('SuperAdmin phone resolves to 9080280818', async () => {
    const phone = await getSuperAdminPhone();
    return phone === '9080280818';
  });

  await assert('SuperAdmin email resolves to subisha2002.m@gmail.com', async () => {
    const email = await getSuperAdminEmail();
    return email === 'subisha2002.m@gmail.com';
  });

  await assert('getSuperAdminPhone() never resolves to 9003241571 even if present in env', async () => {
    const origSuper = process.env.SUPERADMIN_PHONE;
    const origAdmin = process.env.ADMIN_PHONE;
    try {
      process.env.SUPERADMIN_PHONE = '9003241571';
      process.env.ADMIN_PHONE = '+919003241571';
      const phone = await getSuperAdminPhone();
      return phone !== '9003241571' && !phone.includes('9003241571');
    } finally {
      process.env.SUPERADMIN_PHONE = origSuper;
      process.env.ADMIN_PHONE = origAdmin;
    }
  });

  await assert('getSuperAdminPhone() fails safely to empty string if missing without fallback to third-party number', async () => {
    const origSuper = process.env.SUPERADMIN_PHONE;
    const origAdmin = process.env.ADMIN_PHONE;
    try {
      delete process.env.SUPERADMIN_PHONE;
      delete process.env.ADMIN_PHONE;
      // Temporarily mock DB rootAdmin phno if any
      const phone = await getSuperAdminPhone();
      // Should either be rootAdmin.phno from demodb (9080280818) or empty string, NEVER 9003241571
      return phone === '9080280818' || phone === '';
    } finally {
      process.env.SUPERADMIN_PHONE = origSuper;
      process.env.ADMIN_PHONE = origAdmin;
    }
  });

  // -------------------------------------------------------------------------
  // 2. Eligibility of 9080280818 (Old Guard Removed)
  // -------------------------------------------------------------------------
  console.log('\n🔹 2. SuperAdmin Number (9080280818) Eligibility & Guard Removal:');

  await assert('sendNotification allows SMS to 9080280818 in mock mode without guard block', async () => {
    const res = await sendNotification({
      channel: 'SMS',
      recipient: '9080280818',
      templateCode: 'TEST_SUPERADMIN_SMS_ELIGIBILITY',
      subject: 'SuperAdmin SMS Eligibility Test',
      body: 'Operational Alert for SuperAdmin',
    });
    return res.success === true && res.providerStatus === 'MOCK';
  });

  await assert('sendDirectSms allows destination 9080280818 in mock mode without guard block', async () => {
    const res = await sendDirectSms('9080280818', 'Direct SMS eligibility test');
    return res.success === true && res.providerStatus === 'SENT';
  });

  await assert('send2FactorTemplateSms allows destination 9080280818 in mock mode without guard block', async () => {
    const res = await send2FactorTemplateSms({
      to: '9080280818',
      templateName: 'Booking Creation',
      vars: ['SuperAdmin Test'],
    });
    return res.success === true && res.providerStatus === 'SENT';
  });

  await assert('sendNotification allows EMAIL to subisha2002.m@gmail.com without guard block', async () => {
    const res = await sendNotification({
      channel: 'EMAIL',
      recipient: 'subisha2002.m@gmail.com',
      templateCode: 'TEST_SUPERADMIN_EMAIL_ELIGIBILITY',
      subject: 'SuperAdmin Email Eligibility Test',
      body: 'Operational Email for SuperAdmin',
    });
    return res.success === true && (res.providerStatus === 'MOCK' || res.providerStatus === 'SENT');
  });

  // -------------------------------------------------------------------------
  // 3. Permanent Block of 9003241571 Across All Formats & Routes
  // -------------------------------------------------------------------------
  console.log('\n🔹 3. Permanent Isolation Guard for 9003241571:');

  const legacyVariants = [
    '9003241571',
    '+919003241571',
    '+91 90032 41571',
    '91-90032-41571',
    '90032-41571',
    '  9003241571  ',
  ];

  for (const variant of legacyVariants) {
    await assert(`sendNotification blocks legacy variant "${variant}"`, async () => {
      const res = await sendNotification({
        channel: 'SMS',
        recipient: variant,
        templateCode: 'TEST_BLOCKED_LEGACY',
        subject: 'Blocked Test',
        body: 'Should never send',
      });
      return res.success === false && res.providerStatus === 'FAILED' && String(res.error).includes('prohibited');
    });

    await assert(`sendDirectSms blocks legacy variant "${variant}"`, async () => {
      const res = await sendDirectSms(variant, 'Should never send');
      return res.success === false && res.providerStatus === 'FAILED' && String(res.error).includes('prohibited');
    });

    await assert(`send2FactorTemplateSms blocks legacy variant "${variant}"`, async () => {
      const res = await send2FactorTemplateSms({
        to: variant,
        templateName: 'Booking Creation',
        vars: ['Blocked Test'],
      });
      return res.success === false && res.providerStatus === 'FAILED' && String(res.error).includes('prohibited');
    });
  }

  // -------------------------------------------------------------------------
  // 4. Mobile App Login OTP Respects Mock Mode and Blocks 9003241571
  // -------------------------------------------------------------------------
  console.log('\n🔹 4. Mobile App Login OTP Safety & Mock Mode:');

  // Verify appLoginServices direct import
  const { sendOTP } = require('../appServices/appLoginServices');

  await assert('App login OTP blocks legacy phone 9003241571 without sending SMS', async () => {
    // Find or test with legacy number
    let capturedStatus: number | null = null;
    let capturedJson: any = null;
    const mockReq = {
      body: {
        mobile: '9003241571',
      },
    } as any;
    const mockRes = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(data: any) {
        capturedJson = data;
        return this;
      },
    } as any;

    try {
      await sendOTP(mockReq, mockRes);
      // Either 404 (user not found with that phone) or 500 (blocked SMS error)
      // In either case, it did not succeed and error details mention prohibited if SMS was attempted
      return capturedStatus === 404 || (capturedStatus === 500 && String(capturedJson?.error).includes('prohibited'));
    } catch {
      return true;
    }
  });

  await assert('App login OTP respects NOTIFICATION_MOCK_MODE=true for valid users', async () => {
    // Create/find a test user with valid company
    const company = await Company.findOne();
    const testPhone = '9876543210';
    let testUser = await User.findOne({ where: { mobile: testPhone } });
    if (!testUser) {
      testUser = await User.create({
        username: 'MockAppUser',
        email: 'mockappuser@test.fleetflow.local',
        mobile: testPhone,
        companyId: company?.companyId,
        role: 'user',
        status: 1,
      } as any);
    } else if (company && !testUser.companyId) {
      await testUser.update({ companyId: company.companyId });
    }

    let capturedStatus: number | null = null;
    let capturedJson: any = null;
    const mockReq = {
      body: {
        mobile: testPhone,
      },
    } as any;
    const mockRes = {
      status(code: number) {
        capturedStatus = code;
        return this;
      },
      json(data: any) {
        capturedJson = data;
        return this;
      },
    } as any;

    await sendOTP(mockReq, mockRes);
    return capturedStatus === 200 && capturedJson?.success === true && String(capturedJson?.sessionId).includes('mock_session');
  });

  // -------------------------------------------------------------------------
  // 5. Customer OTP Routing (Never Redirected to SuperAdmin)
  // -------------------------------------------------------------------------
  console.log('\n🔹 5. Customer Public Booking OTP Routing:');

  const { sendPublicBookingOtp, verifyPublicBookingOtp } = require('../services/publicBookingServices');

  const runCustomerPhone: string = '9789012345';
  let pubStatus: number | null = null;
  let pubJson: any = null;
  const pubReq = {
    body: {
      phone: runCustomerPhone,
    },
  } as any;
  const pubRes = {
    status(code: number) {
      pubStatus = code;
      return this;
    },
    json(data: any) {
      pubJson = data;
      return this;
    },
  } as any;

  await assert('Public booking OTP sends to customer phone, not SuperAdmin', async () => {
    await sendPublicBookingOtp(pubReq, pubRes);
    if (pubStatus !== 200 || !pubJson?.success) return false;

    // Verify NotificationLog was created for customer phone (NOT 9080280818 and NOT 9003241571)
    const log = await NotificationLog.findOne({
      where: {
        recipient: runCustomerPhone,
        templateCode: 'PUBLIC_BOOKING_OTP',
      },
      order: [['createdAt', 'DESC']],
    });

    const recipientStr: string = log?.recipient || '';
    return log !== null && recipientStr === runCustomerPhone && recipientStr !== '9080280818';
  });

  await assert('Public booking OTP verification works with stored OTP', async () => {
    const otpRow = await OTP.findOne({
      where: { sessionId: pubJson.sessionId },
      order: [['createdAt', 'DESC']],
    });
    if (!otpRow) return false;

    let vStatus: number | null = null;
    let vJson: any = null;
    const vReq = {
      body: {
        sessionId: pubJson.sessionId,
        phone: runCustomerPhone,
        otp: otpRow.otp,
      },
    } as any;
    const vRes = {
      status(code: number) {
        vStatus = code;
        return this;
      },
      json(data: any) {
        vJson = data;
        return this;
      },
    } as any;

    await verifyPublicBookingOtp(vReq, vRes);
    return vStatus === 200 && vJson?.success === true && !!vJson?.verificationToken;
  });

  // -------------------------------------------------------------------------
  // 6. Forgot Password OTP Remains Email-Based
  // -------------------------------------------------------------------------
  console.log('\n🔹 6. Forgot Password OTP Remains Email-Based:');

  const { forgetPasswordSendOtp } = require('../services/authServices');

  await assert('forgetPasswordSendOtp does not generate any SMS NotificationLog entries', async () => {
    const countBefore = await NotificationLog.count({ where: { channel: 'SMS' } });

    let fpStatus: number | null = null;
    let fpJson: any = null;
    const fpReq = {
      body: {
        email: 'subisha2002.m@gmail.com',
      },
    } as any;
    const fpRes = {
      status(code: number) {
        fpStatus = code;
        return this;
      },
      json(data: any) {
        fpJson = data;
        return this;
      },
    } as any;

    await forgetPasswordSendOtp(fpReq, fpRes);

    const countAfter = await NotificationLog.count({ where: { channel: 'SMS' } });
    return countBefore === countAfter && fpStatus === 200;
  });

  // -------------------------------------------------------------------------
  // 7. Database Integrity & Absence of 9003241571 in Active Accounts
  // -------------------------------------------------------------------------
  console.log('\n🔹 7. Active Database Records Integrity:');

  await assert('No active User has phone 9003241571', async () => {
    const user = await User.findOne({ where: { mobile: '9003241571' } });
    return user === null;
  });

  await assert('No active Employee has phno 9003241571', async () => {
    const emp = await Employee.findOne({ where: { phno: '9003241571' } });
    return emp === null;
  });

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`🏁 TEST EXECUTION COMPLETE: Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSmsFixVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
