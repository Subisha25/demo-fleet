import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import axios from 'axios';
import {
  APPROVED_2FACTOR_TEMPLATES,
  DLT_TEMPLATE_VARIABLE_SPECS,
  sanitizeDltLocationString,
  send2FactorTemplateSms,
  send2FactorOTP,
  sendDirectSms,
  sendDriverAllocationTwoWaySms,
  normalizePhoneNumberForSms,
  dispatchAuditedSms,
} from '../services/smsServices';
import {
  sendNotification,
  getSuperAdminPhone,
  getSuperAdminEmail,
} from '../services/notificationService';
import config from '../config/config';

let realNetworkCalls = 0;
const originalGet = axios.get;
const originalPost = axios.post;

function installNetworkGuard() {
  (axios as any).get = async (url: string, ...args: any[]) => {
    if (typeof url === 'string' && (url.includes('2factor.in') || url.includes('twilio.com'))) {
      realNetworkCalls++;
      throw new Error(`[NETWORK GUARD VIOLATION] Real SMS provider call attempted to URL: ${url}`);
    }
    return originalGet(url, ...args);
  };

  (axios as any).post = async (url: string, ...args: any[]) => {
    if (typeof url === 'string' && (url.includes('2factor.in') || url.includes('twilio.com'))) {
      realNetworkCalls++;
      throw new Error(`[NETWORK GUARD VIOLATION] Real SMS provider call attempted to URL: ${url}`);
    }
    return originalPost(url, ...args);
  };
}

async function runTests() {
  installNetworkGuard();
  console.log('========================================================================');
  console.log('  FLEETFLOW — FINAL DLT SMS & TEMPLATE MAPPING VERIFICATION SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function check(desc: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  ✔ [PASS] ${desc}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✖ [FAIL] ${desc}\n    Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Sender ID GRCCAB verification
  await check('Sender ID is GRCCAB in .env and config.ts', () => {
    if (process.env.TWO_FACTOR_SENDER_ID !== 'GRCCAB') {
      throw new Error(`TWO_FACTOR_SENDER_ID in env is "${process.env.TWO_FACTOR_SENDER_ID}", expected "GRCCAB"`);
    }
    if (config.twofactor.senderId !== 'GRCCAB') {
      throw new Error(`config.twofactor.senderId is "${config.twofactor.senderId}", expected "GRCCAB"`);
    }
  });

  // 2. Mock mode enabled
  await check('NOTIFICATION_MOCK_MODE is strictly "true"', () => {
    if (process.env.NOTIFICATION_MOCK_MODE !== 'true') {
      throw new Error(`NOTIFICATION_MOCK_MODE is "${process.env.NOTIFICATION_MOCK_MODE}", expected "true"`);
    }
  });

  // 3. Approved 2Factor DLT Template Names
  await check('APPROVED_2FACTOR_TEMPLATES contains all verified DLT templates from reference', () => {
    const required = [
      'Booking Confimation Message',
      'BookingConfirmGuest',
      'Driver Assigning',
      'Booking Cancellation',
      'ManageAlert',
      'Manager Booking Confirmation',
      'ManagerCancelBooking',
      'Invoice Cancel',
      'Booking Creation',
      'OTP1',
    ];
    for (const t of required) {
      if (!APPROVED_2FACTOR_TEMPLATES[t]) {
        throw new Error(`Missing approved template mapping for: ${t}`);
      }
    }
  });

  // 4. Exact spelling of "Booking Confimation Message" (with DLT spelling)
  await check('BOOKING_CREATION maps to "Booking Confimation Message"', () => {
    if (APPROVED_2FACTOR_TEMPLATES['BOOKING_CREATION'] !== 'Booking Confimation Message') {
      throw new Error(`Expected "Booking Confimation Message", got "${APPROVED_2FACTOR_TEMPLATES['BOOKING_CREATION']}"`);
    }
  });

  // 5. ManageAlert mapping for manager booking alerts (from reference empServices.ts:2462)
  await check('ManageAlert maps correctly with 6 positional variables', () => {
    if (APPROVED_2FACTOR_TEMPLATES['ManageAlert'] !== 'ManageAlert') {
      throw new Error(`Expected ManageAlert, got: ${APPROVED_2FACTOR_TEMPLATES['ManageAlert']}`);
    }
    if (DLT_TEMPLATE_VARIABLE_SPECS['ManageAlert']?.expectedVars !== 6) {
      throw new Error(`Expected ManageAlert to have 6 variables, got: ${DLT_TEMPLATE_VARIABLE_SPECS['ManageAlert']?.expectedVars}`);
    }
  });

  // 6. Variable Count Specs Verification across all templates
  await check('DLT_TEMPLATE_VARIABLE_SPECS enforces correct counts for all registered templates', () => {
    const expectedCounts: Record<string, number> = {
      'Booking Confimation Message': 10,
      'BookingConfirmGuest': 8,
      'ManageAlert': 6,
      'Driver Assigning': 4,
      'Booking Cancellation': 4,
      'ManagerCancelBooking': 4,
      'Invoice Cancel': 3,
      'Booking Creation': 1,
    };

    for (const [tpl, count] of Object.entries(expectedCounts)) {
      if (DLT_TEMPLATE_VARIABLE_SPECS[tpl]?.expectedVars !== count) {
        throw new Error(`Template "${tpl}" expected ${count} variables, found: ${DLT_TEMPLATE_VARIABLE_SPECS[tpl]?.expectedVars}`);
      }
    }
  });

  // 7. Location string sanitization for DLT length constraints
  await check('sanitizeDltLocationString shortens long address before first comma if > 27 chars', () => {
    const longAddress = 'T. Nagar Central Bus Stand, Chennai, Tamil Nadu, 600017';
    const sanitized = sanitizeDltLocationString(longAddress, 27);
    if (sanitized !== 'T. Nagar Central Bus Stand') {
      throw new Error(`Expected "T. Nagar Central Bus Stand", got: "${sanitized}"`);
    }

    const shortAddress = 'Anna Nagar, Chennai';
    const shortSanitized = sanitizeDltLocationString(shortAddress, 27);
    if (shortSanitized !== 'Anna Nagar, Chennai') {
      throw new Error(`Expected "Anna Nagar, Chennai", got: "${shortSanitized}"`);
    }
  });

  // 8. Check OTP Route is OTP1
  await check('OTP route resolves to approved OTP1 template', async () => {
    const otpRes = await send2FactorOTP('9080280818', '654321', 'OTP1');
    if (!otpRes.success || (otpRes.providerStatus !== 'SENT' && otpRes.providerStatus !== 'MOCK')) {
      throw new Error(`Expected successful mock OTP send, got: ${JSON.stringify(otpRes)}`);
    }
  });

  // 9. SuperAdmin phone is NOT 9003241571
  await check('SuperAdmin contact phone is NOT 9003241571 and resolves to 9080280818', async () => {
    const phone = await getSuperAdminPhone();
    if (phone === '9003241571') {
      throw new Error('SuperAdmin phone incorrectly resolved to 9003241571!');
    }
    if (phone !== '9080280818') {
      throw new Error(`Expected SuperAdmin phone 9080280818, got: ${phone}`);
    }
  });

  // 10. sendNotification OTP route dispatches to OTP1 via Mock
  await check('sendNotification with OTP dispatches to OTP1 route with zero network calls', async () => {
    const res = await sendNotification({
      channel: 'SMS',
      recipient: '9080280818',
      templateCode: 'APP_LOGIN_OTP',
      body: 'Your code is 123456',
      metadata: { otp: '123456' },
    });
    if (!res.success || res.providerStatus !== 'MOCK') {
      throw new Error(`Expected MOCK status, got ${JSON.stringify(res)}`);
    }
  });

  // 11. send2FactorTemplateSms dispatches with correct vars in mock mode
  await check('send2FactorTemplateSms accepts DLT template and variable array with zero network calls', async () => {
    const res = await send2FactorTemplateSms({
      to: '9080280818',
      templateName: 'Driver Assigning',
      vars: ['Ramesh', 'Suresh (Booking: BK-100)', '9840112233', 'Route: Chennai to Bangalore'],
    });
    if (!res.success || (res.providerStatus !== 'SENT' && res.providerStatus !== 'MOCK')) {
      throw new Error(`Expected SENT/MOCK status, got ${JSON.stringify(res)}`);
    }
  });

  // 12. dispatchAuditedSms handles ManageAlert and writes MOCK log
  await check('dispatchAuditedSms handles ManageAlert template safely', async () => {
    const res = await dispatchAuditedSms({
      recipient: '9080280818',
      templateCode: 'MANAGER_BOOKING_CONFIRMATION',
      templateName: 'ManageAlert',
      vars: ['Manager', 'BK-TEST', 'John Doe', '9840112233', 'Koyambedu', 'Airport'],
    });
    if (!res.success) {
      throw new Error(`Expected successful dispatch, got: ${JSON.stringify(res)}`);
    }
  });

  // 13. Un-templated 2Factor message rejection safety when not mocked
  await check('sendDirectSms protects against un-templated text if 2Factor is configured without mock', async () => {
    const origMock = process.env.NOTIFICATION_MOCK_MODE;
    try {
      process.env.NOTIFICATION_MOCK_MODE = 'false';
      const res = await sendDirectSms('9080280818', 'Arbitrary text without DLT template');
      if (res.success || res.providerStatus !== 'FAILED') {
        throw new Error(`Expected rejection of un-templated SMS, got: ${JSON.stringify(res)}`);
      }
      if (!res.error?.includes('requires an approved DLT template name under header GRCCAB')) {
        throw new Error(`Unexpected error message: ${res.error}`);
      }
    } finally {
      process.env.NOTIFICATION_MOCK_MODE = origMock;
    }
  });

  // 14. Network guard confirms ZERO real SMS provider requests occurred
  await check('Network guard confirms ZERO real SMS provider requests occurred', () => {
    if (realNetworkCalls !== 0) {
      throw new Error(`Real network calls were made: ${realNetworkCalls}`);
    }
  });

  console.log('\n------------------------------------------------------------------------');
  console.log(`SUMMARY: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed} | Real Network Calls: ${realNetworkCalls}`);
  console.log('------------------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
