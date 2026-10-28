/**
 * Phase 2 Targeted SMS Mock Mode Verification Suite
 *
 * Verifies all 8 required Phase 2 checks:
 * 1. SuperAdmin application notification routing
 * 2. Applicant registration confirmation
 * 3. Legitimate applicant phone-number handling (e.g. 9003241571)
 * 4. Phone-number validation and normalization
 * 5. Missing provider configuration handling (UNCONFIGURED)
 * 6. Provider error handling
 * 7. Mock-mode enforcement across every SMS/OTP route (ZERO external network calls)
 * 8. Duplicate notification prevention (idempotency window)
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import axios from 'axios';
import sequelize from '../config/dbConfig';
import {
  getSuperAdminEmail,
  getSuperAdminPhone,
  sendNotification,
} from '../services/notificationService';
import {
  sendDirectSms,
  send2FactorTemplateSms,
  normalizePhoneNumberForSms,
  maskPhoneNumber,
} from '../services/smsServices';
import { NotificationLog } from '../models/notificationLog';
import { APPLICANT_TEST_PHONE, APPLICANT_FORMATTED_VARIANTS } from './fixtures/smsFixtures';

let realNetworkCallsMade = 0;

// Intercept axios to guarantee ZERO real SMS network requests occur during mock tests
const originalGet = axios.get;
const originalPost = axios.post;

function installNetworkGuard() {
  (axios as any).get = async (url: string, ...args: any[]) => {
    if (typeof url === 'string' && (url.includes('2factor.in') || url.includes('twilio.com'))) {
      realNetworkCallsMade++;
      throw new Error(`[NETWORK GUARD VIOLATION] Real SMS provider call attempted to URL: ${url}`);
    }
    return originalGet(url, ...args);
  };

  (axios as any).post = async (url: string, ...args: any[]) => {
    if (typeof url === 'string' && (url.includes('2factor.in') || url.includes('twilio.com'))) {
      realNetworkCallsMade++;
      throw new Error(`[NETWORK GUARD VIOLATION] Real SMS provider call attempted to URL: ${url}`);
    }
    return originalPost(url, ...args);
  };
}

function restoreNetworkGuard() {
  axios.get = originalGet;
  axios.post = originalPost;
}

interface TestAssertion {
  id: number;
  name: string;
  passed: boolean;
  details?: string;
}

const assertions: TestAssertion[] = [];

function recordTest(id: number, name: string, passed: boolean, details?: string) {
  assertions.push({ id, name, passed, details });
  if (passed) {
    console.log(`  \x1b[32m✔ [PASS]\x1b[0m Test ${id}: ${name}`);
  } else {
    console.error(`  \x1b[31m✘ [FAIL]\x1b[0m Test ${id}: ${name} - ${details || 'Assertion failed'}`);
  }
}

async function runPhase2Tests() {
  console.log('\n========================================================================');
  console.log('       FLEETFLOW PHASE 2: TARGETED SMS MOCK-MODE VERIFICATION SUITE');
  console.log('========================================================================\n');

  await sequelize.authenticate();

  // Enforce Mock Mode
  process.env.NOTIFICATION_MOCK_MODE = 'true';
  installNetworkGuard();

  try {
    // -----------------------------------------------------------------------
    // CHECK 1: SuperAdmin Application Notification Routing
    // -----------------------------------------------------------------------
    const superAdminPhone = await getSuperAdminPhone();
    const superAdminEmail = await getSuperAdminEmail();

    const superAdminSmsRes = await sendNotification({
      channel: 'SMS',
      recipient: superAdminPhone,
      templateCode: 'SUPERADMIN_NEW_APPLICATION_SMS',
      subject: 'New Application Alert',
      body: 'FleetFlow Alert: New fleet registration submitted.',
      smsTemplateName: 'Booking Creation',
      smsVars: ['Test Fleet Corp'],
    });

    const c1Pass =
      superAdminPhone === '9080280818' &&
      superAdminEmail === 'subisha2002.m@gmail.com' &&
      superAdminSmsRes.success === true &&
      superAdminSmsRes.providerStatus === 'MOCK';

    recordTest(
      1,
      'SuperAdmin Application Notification Routing resolves correctly to 9080280818 in mock mode',
      c1Pass,
      `SuperAdmin Phone: ${superAdminPhone}, Email: ${superAdminEmail}, Status: ${superAdminSmsRes.providerStatus}`
    );

    // -----------------------------------------------------------------------
    // CHECK 2: Applicant Registration Confirmation Routing
    // -----------------------------------------------------------------------
    const applicantPhone = '9840112233';
    const applicantSmsRes = await sendNotification({
      channel: 'SMS',
      recipient: applicantPhone,
      templateCode: 'REGISTRATION_RECEIVED_SMS',
      subject: 'Application Received',
      body: 'Your FleetFlow fleet application has been received.',
      smsTemplateName: 'Booking Creation',
      smsVars: ['Applicant Name'],
    });

    const c2Pass = Boolean(
      applicantSmsRes.success === true &&
      applicantSmsRes.providerStatus === 'MOCK' &&
      applicantSmsRes.providerMessageId?.startsWith('mock_sms')
    );

    recordTest(
      2,
      'Applicant Registration Confirmation SMS dispatches to applicant mobile in mock mode',
      c2Pass,
      `Status: ${applicantSmsRes.providerStatus}, MsgId: ${applicantSmsRes.providerMessageId}`
    );

    // -----------------------------------------------------------------------
    // CHECK 3: Legitimate Applicant Phone-Number Handling (including 9003241571)
    // -----------------------------------------------------------------------
    // The old number 9003241571 must NOT be hardcoded as SuperAdmin fallback,
    // and must be handled as a standard eligible applicant phone number.
    const eligibleApplicantRes = await sendNotification({
      channel: 'SMS',
      recipient: APPLICANT_TEST_PHONE, // 9003241571
      templateCode: 'APPLICANT_APPLICATION_SUBMITTED',
      body: 'Fleet application acknowledgment for 9003241571.',
    });

    const log9003 = await NotificationLog.findOne({
      where: {
        recipient: APPLICANT_TEST_PHONE,
        templateCode: 'APPLICANT_APPLICATION_SUBMITTED',
      },
      order: [['createdAt', 'DESC']],
    });

    const c3Pass =
      eligibleApplicantRes.success === true &&
      eligibleApplicantRes.providerStatus === 'MOCK' &&
      log9003 !== null &&
      log9003.recipient === APPLICANT_TEST_PHONE &&
      log9003.recipient !== superAdminPhone;

    recordTest(
      3,
      `Applicant contact (${APPLICANT_TEST_PHONE}) is handled as ordinary applicant and not redirected to SuperAdmin`,
      c3Pass,
      `Logged recipient: ${log9003?.recipient}, SuperAdmin: ${superAdminPhone}`
    );

    // -----------------------------------------------------------------------
    // CHECK 4: Phone-Number Validation and Normalization
    // -----------------------------------------------------------------------
    const normalCases = [
      { input: '9080280818', expected: '9080280818', valid: true },
      { input: '+919080280818', expected: '9080280818', valid: true },
      { input: '+91 90802 80818', expected: '9080280818', valid: true },
      { input: '91919080280818', expected: '9080280818', valid: true },
      { input: '9840-112-233', expected: '9840112233', valid: true },
      { input: '12345', expected: '12345', valid: false }, // Too short
      { input: '', expected: '', valid: false }, // Empty
      { input: null, expected: '', valid: false }, // Null
      { input: '99999999999999999', expected: '99999999999999999', valid: false }, // Too long
    ];

    let allNormPass = true;
    for (const testCase of normalCases) {
      const res = normalizePhoneNumberForSms(testCase.input as any);
      if (res.valid !== testCase.valid) {
        allNormPass = false;
        console.error(`Normalization mismatch on "${testCase.input}": expected valid=${testCase.valid}, got ${res.valid}`);
      }
      if (testCase.valid && res.normalizedPhone !== testCase.expected) {
        allNormPass = false;
        console.error(`Normalization value mismatch on "${testCase.input}": expected ${testCase.expected}, got ${res.normalizedPhone}`);
      }
    }

    recordTest(
      4,
      'Phone-number validation and normalization correctly parses 10-digit Indian numbers and rejects invalid formats',
      allNormPass,
      `Tested ${normalCases.length} format variants`
    );

    // -----------------------------------------------------------------------
    // CHECK 5: Missing Provider Configuration Handling
    // -----------------------------------------------------------------------
    // In real mode with no API key, system must return UNCONFIGURED rather than claiming SENT
    const origKey = process.env.TWO_FACTOR_API_KEY;
    const origAltKey = process.env.TWOFACTOR_API_KEY;
    const origTwilioSid = process.env.TWILIO_ACCOUNT_SID;
    const origMock = process.env.NOTIFICATION_MOCK_MODE;

    try {
      // Temporarily simulate unconfigured real mode
      process.env.NOTIFICATION_MOCK_MODE = 'false';
      delete process.env.TWO_FACTOR_API_KEY;
      delete process.env.TWOFACTOR_API_KEY;
      delete process.env.TWILIO_ACCOUNT_SID;

      const unconfigDirect = await sendDirectSms('9840112233', 'Test unconfigured');
      const unconfigTemplate = await send2FactorTemplateSms({
        to: '9840112233',
        templateName: 'Booking Creation',
        vars: ['test'],
      });

      const c5Pass =
        unconfigDirect.providerStatus === 'UNCONFIGURED' &&
        unconfigDirect.success === false &&
        unconfigTemplate.providerStatus === 'UNCONFIGURED' &&
        unconfigTemplate.success === false;

      recordTest(
        5,
        'Missing provider configuration safely returns UNCONFIGURED and success: false (No fake delivery)',
        c5Pass,
        `Direct: ${unconfigDirect.providerStatus}, Template: ${unconfigTemplate.providerStatus}`
      );
    } finally {
      process.env.TWO_FACTOR_API_KEY = origKey;
      process.env.TWOFACTOR_API_KEY = origAltKey;
      process.env.TWILIO_ACCOUNT_SID = origTwilioSid;
      process.env.NOTIFICATION_MOCK_MODE = 'true';
    }

    // -----------------------------------------------------------------------
    // CHECK 6: Provider Error Handling (Invalid Destination Number)
    // -----------------------------------------------------------------------
    const invalidPhoneRes = await sendNotification({
      channel: 'SMS',
      recipient: '12345', // invalid length
      templateCode: 'TEST_INVALID_RECIPIENT',
      body: 'This should fail validation',
    });

    const c6Pass =
      invalidPhoneRes.success === false &&
      invalidPhoneRes.providerStatus === 'FAILED' &&
      Boolean(invalidPhoneRes.error);

    recordTest(
      6,
      'Provider / input validation gracefully catches invalid phone numbers and returns FAILED status',
      c6Pass,
      `Status: ${invalidPhoneRes.providerStatus}, Error: ${invalidPhoneRes.error}`
    );

    // -----------------------------------------------------------------------
    // CHECK 7: Mock-Mode Enforcement Across Every SMS/OTP Route
    // -----------------------------------------------------------------------
    // 7A: sendNotification (SMS)
    const m1 = await sendNotification({
      channel: 'SMS',
      recipient: '9840112233',
      templateCode: 'MOCK_TEST_NOTIF',
      body: 'Mock test notification',
    });

    // 7B: sendDirectSms
    const m2 = await sendDirectSms('9840112233', 'Mock direct test');

    // 7C: send2FactorTemplateSms
    const m3 = await send2FactorTemplateSms({
      to: '9840112233',
      templateName: 'Booking Creation',
      vars: ['Mock var'],
    });

    // 7D: appLoginServices send2FactorOTP
    const { sendOTP } = require('../appServices/appLoginServices');
    let appOtpStatus = 0;
    let appOtpJson: any = null;
    await sendOTP(
      { body: { mobile: '9876543210' } } as any,
      {
        status: (s: number) => {
          appOtpStatus = s;
          return {
            json: (d: any) => {
              appOtpJson = d;
            },
          };
        },
      } as any
    );

    // 7E: publicBookingServices sendPublicBookingOtp
    const { sendPublicBookingOtp } = require('../services/publicBookingServices');
    let pubOtpStatus = 0;
    let pubOtpJson: any = null;
    await sendPublicBookingOtp(
      { body: { phone: '9789012345' } } as any,
      {
        status: (s: number) => {
          pubOtpStatus = s;
          return {
            json: (d: any) => {
              pubOtpJson = d;
            },
          };
        },
      } as any
    );

    const c7Pass =
      m1.providerStatus === 'MOCK' &&
      m2.providerStatus === 'SENT' &&
      String(m2.providerMessageId).includes('mock') &&
      m3.providerStatus === 'SENT' &&
      String(m3.providerMessageId).includes('mock') &&
      appOtpStatus === 200 &&
      String(appOtpJson?.sessionId).includes('mock_session') &&
      pubOtpStatus === 200 &&
      pubOtpJson?.success === true &&
      realNetworkCallsMade === 0;

    recordTest(
      7,
      'Mock-mode is strictly enforced across ALL SMS/OTP routes with ZERO real external network calls',
      c7Pass,
      `Calls made: ${realNetworkCallsMade}, m1=${m1.providerStatus}, m2=${m2.providerStatus}, m3=${m3.providerStatus}, appOtp=${appOtpStatus}, pubOtp=${pubOtpStatus}`
    );

    // -----------------------------------------------------------------------
    // CHECK 8: Duplicate Notification Prevention (Idempotency Window)
    // -----------------------------------------------------------------------
    const testIdempotencyKey = `idem_${Date.now()}`;
    const firstDispatch = await sendNotification({
      channel: 'SMS',
      recipient: '9840112233',
      templateCode: 'TEST_IDEMPOTENCY_CHECK',
      idempotencyKey: testIdempotencyKey,
      body: 'Idempotency dispatch 1',
    });

    const secondDispatch = await sendNotification({
      channel: 'SMS',
      recipient: '9840112233',
      templateCode: 'TEST_IDEMPOTENCY_CHECK',
      idempotencyKey: testIdempotencyKey,
      body: 'Idempotency dispatch 2',
    });

    const c8Pass =
      firstDispatch.success === true &&
      secondDispatch.success === true &&
      firstDispatch.logId === secondDispatch.logId;

    recordTest(
      8,
      'Duplicate notification prevention (idempotency key deduplication) reuses existing log within 15-minute window',
      c8Pass,
      `First Log ID: ${firstDispatch.logId}, Second Log ID: ${secondDispatch.logId}`
    );

    // -----------------------------------------------------------------------
    // FINAL SUMMARY
    // -----------------------------------------------------------------------
    const passedCount = assertions.filter((a) => a.passed).length;
    const failedCount = assertions.filter((a) => !a.passed).length;

    console.log('\n------------------------------------------------------------------------');
    console.log(`PHASE 2 SUMMARY: Total: ${assertions.length} | Passed: ${passedCount} | Failed: ${failedCount} | Real Calls: ${realNetworkCallsMade}`);
    console.log('------------------------------------------------------------------------\n');

    return failedCount === 0 && realNetworkCallsMade === 0;
  } finally {
    restoreNetworkGuard();
  }
}

if (require.main === module) {
  runPhase2Tests().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
