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
import { APPLICANT_TEST_PHONE, APPLICANT_FORMATTED_VARIANTS } from './fixtures/smsFixtures';
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

  await assert('getSuperAdminPhone() never resolves to unconfigured fallback and fails safely for dummy input', async () => {
    const origSuper = process.env.SUPERADMIN_PHONE;
    const origAdmin = process.env.ADMIN_PHONE;
    try {
      process.env.SUPERADMIN_PHONE = '9999900000';
      process.env.ADMIN_PHONE = '9999900000';
      const phone = await getSuperAdminPhone();
      return phone === '' || phone === '9080280818';
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
      // Should either be rootAdmin.phno from demodb (9080280818) or empty string fail-safe
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
  // 3. Normal Applicant & User SMS Flow: Allowed in Mock Mode Without Redirection
  // -------------------------------------------------------------------------
  console.log(`\n🔹 3. Applicant & Normal User SMS Routing for Valid Contact (${APPLICANT_TEST_PHONE}):`);

  for (const variant of APPLICANT_FORMATTED_VARIANTS) {
    await assert(`sendNotification allows applicant variant "${variant}" in mock mode`, async () => {
      const res = await sendNotification({
        channel: 'SMS',
        recipient: variant,
        templateCode: 'APPLICANT_REGISTRATION_TEST',
        subject: 'Applicant Notification Test',
        body: 'Welcome to FleetFlow. Your registration is received.',
      });
      return res.success === true && (res.providerStatus === 'MOCK' || res.providerStatus === 'SENT');
    });

    await assert(`sendDirectSms allows applicant variant "${variant}" in mock mode`, async () => {
      const res = await sendDirectSms(variant, 'Applicant test notification');
      return res.success === true && res.providerStatus === 'SENT';
    });

    await assert(`send2FactorTemplateSms allows applicant variant "${variant}" in mock mode`, async () => {
      const res = await send2FactorTemplateSms({
        to: variant,
        templateName: 'Booking Creation',
        vars: ['Applicant Booking Test'],
      });
      return res.success === true && res.providerStatus === 'SENT';
    });
  }

  await assert(`Applicant SMS to ${APPLICANT_TEST_PHONE} is never redirected to SuperAdmin`, async () => {
    const applicantPhone = APPLICANT_TEST_PHONE;
    const superAdminPhone = await getSuperAdminPhone();

    // Send applicant SMS
    const resApplicant = await sendNotification({
      channel: 'SMS',
      recipient: applicantPhone,
      templateCode: 'APPLICANT_SMS_ROUTING_CHECK',
      subject: 'Applicant Direct SMS',
      body: 'Applicant verification copy',
    });

    // Check NotificationLog recipient
    const log = await NotificationLog.findOne({
      where: {
        recipient: applicantPhone,
        templateCode: 'APPLICANT_SMS_ROUTING_CHECK',
      },
      order: [['createdAt', 'DESC']],
    });

    const loggedRecipient = log?.recipient || '';
    return (
      resApplicant.success === true &&
      loggedRecipient === applicantPhone &&
      loggedRecipient !== superAdminPhone
    );
  });

  // -------------------------------------------------------------------------
  // 4. Mobile App Login OTP Safety & Mock Mode
  // -------------------------------------------------------------------------
  console.log('\n🔹 4. Mobile App Login OTP Safety & Mock Mode:');

  // Verify appLoginServices direct import
  const { sendOTP } = require('../appServices/appLoginServices');

  await assert(`App login OTP returns 404 for unassigned phone ${APPLICANT_TEST_PHONE} without throwing or blocking solely on number`, async () => {
    let capturedStatus: number | null = null;
    let capturedJson: any = null;
    const mockReq = {
      body: {
        mobile: APPLICANT_TEST_PHONE,
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
      // Since APPLICANT_TEST_PHONE is not registered in demodb user/driver table, should return 404
      return capturedStatus === 404 && (capturedJson?.message?.includes('not registered') || capturedJson?.message?.includes('not found'));
    } catch {
      return false;
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

    // Verify NotificationLog was created for customer phone (NOT SuperAdmin phone)
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
  // 7. Database Integrity & Absence of unassigned test contacts in Active Accounts
  // -------------------------------------------------------------------------
  console.log('\n🔹 7. Active Database Records Integrity:');

  await assert(`No active User has unassigned test phone ${APPLICANT_TEST_PHONE}`, async () => {
    const user = await User.findOne({ where: { mobile: APPLICANT_TEST_PHONE } });
    return user === null;
  });

  await assert(`No active Employee has unassigned test phno ${APPLICANT_TEST_PHONE}`, async () => {
    const emp = await Employee.findOne({ where: { phno: APPLICANT_TEST_PHONE } });
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
