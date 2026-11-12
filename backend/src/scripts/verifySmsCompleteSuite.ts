import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import axios from 'axios';
import {
  validateMobileRecipient,
  validateEmailRecipient,
  maskPhoneNumber,
  maskEmail,
} from '../utils/validationUtils';
import {
  APPROVED_2FACTOR_TEMPLATES,
  DLT_TEMPLATE_VARIABLE_SPECS,
  send2FactorTemplateSms,
  send2FactorOTP,
  sendDriverAllocationTwoWaySms,
  dispatchAuditedSms,
  normalizePhoneNumberForSms,
} from '../services/smsServices';
import { OTP } from '../models/otp';
import { NotificationLog } from '../models/notificationLog';
import sequelize from '../config/dbConfig';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { sendPublicBookingOtp, verifyPublicBookingOtp } from '../services/publicBookingServices';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✔ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ✘ [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('    FLEETFLOW SAAS — COMPLETE SMS DELIVERY & VALIDATION AUDIT SUITE     ');
  console.log('========================================================================\n');

  await sequelize.authenticate();
  console.log('✔ Database connection established.\n');

  // ------------------------------------------------------------------------
  // SECTION 1: Advanced Mobile and Email Validation
  // ------------------------------------------------------------------------
  console.log('--- SECTION 1: Mobile & Email Validation Utility ---');

  // Legitimate Indian numbers across various series
  const validNumbers = [
    { input: '9080280818', expected: '9080280818', desc: 'Valid 9-series mobile' },
    { input: '+91 90802 80818', expected: '9080280818', desc: 'Formatted with +91 prefix and spaces' },
    { input: '919080280818', expected: '9080280818', desc: 'Leading 91 without plus' },
    { input: '8870123456', expected: '8870123456', desc: 'Valid 8-series mobile' },
    { input: '7358123456', expected: '7358123456', desc: 'Valid 7-series mobile' },
    { input: '6380123456', expected: '6380123456', desc: 'Valid 6-series mobile' },
  ];

  for (const item of validNumbers) {
    const res = validateMobileRecipient(item.input);
    assert(res.valid && res.normalizedPhone === item.expected, `${item.desc}: "${item.input}" -> normalized to ${item.expected}`);
  }

  // Reject fake, dummy, repeating, sequential, or placeholder numbers
  const dummyNumbers = [
    { input: '0000000000', desc: 'Repeated 0s' },
    { input: '1111111111', desc: 'Repeated 1s' },
    { input: '9999999999', desc: 'Repeated 9s' },
    { input: '1234567890', desc: 'Ascending sequential 1-0' },
    { input: '0123456789', desc: 'Ascending sequential 0-9' },
    { input: '9898989898', desc: 'Alternating repeating pairs (98)' },
    { input: '9000000000', desc: 'Known dummy placeholder' },
    { input: '5123456789', desc: 'Invalid initial digit (5 - not TRAI 6-9)' },
    { input: '98765', desc: 'Incomplete number (5 digits)' },
    { input: '98765432109876', desc: 'Overlong number (>10 digits)' },
    { input: '', desc: 'Empty string' },
    { input: null, desc: 'Null value' },
  ];

  for (const item of dummyNumbers) {
    const res = validateMobileRecipient(item.input as any);
    assert(!res.valid, `Rejected dummy/invalid mobile: "${item.input}" (${item.desc}) -> Reason: ${res.error}`);
  }

  // Email Validation
  const validEmails = ['admin@fleetflow.com', 'operations@gracecabs.com', 'user.name+tag@gmail.com'];
  for (const email of validEmails) {
    const res = validateEmailRecipient(email);
    assert(res.valid, `Accepted legitimate email: "${email}"`);
  }

  const dummyEmails = [
    { email: 'test@example.com', desc: 'example.com domain' },
    { email: 'user@fake.com', desc: 'fake.com domain' },
    { email: 'bot@mailinator.com', desc: 'disposable mailinator' },
    { email: 'invalid-email-no-at', desc: 'Missing @' },
  ];
  for (const item of dummyEmails) {
    const res = validateEmailRecipient(item.email);
    assert(!res.valid, `Rejected synthetic/invalid email: "${item.email}" (${item.desc})`);
  }

  // Masking functions
  assert(maskPhoneNumber('9080280818') === '******0818', 'maskPhoneNumber masks all but last 4 digits');
  assert(maskEmail('subisha2002.m@gmail.com').includes('*'), 'maskEmail masks local part properly');

  // ------------------------------------------------------------------------
  // SECTION 2: DLT Templates Specification & Parameter Mapping
  // ------------------------------------------------------------------------
  console.log('\n--- SECTION 2: DLT Templates Registration & Spec ---');

  const requiredTemplates = [
    { name: 'Booking Confimation Message', expectedVars: 10 },
    { name: 'BookingConfirmGuest', expectedVars: 8 },
    { name: 'ManageAlert', expectedVars: 6 },
    { name: 'Driver Assigning', expectedVars: 4 },
    { name: 'Booking Cancellation', expectedVars: 4 },
    { name: 'ManagerCancelBooking', expectedVars: 4 },
    { name: 'Invoice Cancel', expectedVars: 3 },
    { name: 'Booking Creation', expectedVars: 1 },
    { name: 'OTP1', expectedVars: 0 },
  ];

  for (const tmpl of requiredTemplates) {
    const resolved = APPROVED_2FACTOR_TEMPLATES[tmpl.name];
    assert(Boolean(resolved), `Template "${tmpl.name}" is approved in APPROVED_2FACTOR_TEMPLATES`);

    if (tmpl.expectedVars > 0) {
      const spec = DLT_TEMPLATE_VARIABLE_SPECS[tmpl.name];
      assert(spec?.expectedVars === tmpl.expectedVars, `Template "${tmpl.name}" correctly specifies ${tmpl.expectedVars} variables`);
    }
  }

  // ------------------------------------------------------------------------
  // SECTION 3: Public Booking OTP Workflow, Rate Limiting & Cooldown
  // ------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Public Booking OTP Security & Resend Cooldown ---');

  // 3A: Dummy Number Rejection
  const dummyReq: any = { body: { phone: '9999999999' } };
  let dummyResStatus = 0;
  let dummyResData: any = {};
  const dummyRes: any = {
    status: (s: number) => { dummyResStatus = s; return dummyRes; },
    json: (d: any) => { dummyResData = d; return dummyRes; },
  };
  await sendPublicBookingOtp(dummyReq, dummyRes);
  assert(dummyResStatus === 400 && dummyResData.success === false, `Dummy number 9999999999 is rejected by sendPublicBookingOtp (Status 400: ${dummyResData.message})`);

  // 3B: Legitimate Test Number OTP Generation
  const testPhone = '9080280818';
  let validResStatus = 0;
  let validResData: any = {};
  const validRes: any = {
    status: (s: number) => { validResStatus = s; return validRes; },
    json: (d: any) => { validResData = d; return validRes; },
  };
  await sendPublicBookingOtp({ body: { phone: testPhone } } as any, validRes);
  assert(validResStatus === 200 && validResData.success === true, `Valid number ${testPhone} received OTP session (${validResData.sessionId})`);

  const createdSessionId = validResData.sessionId;

  // 3C: 30-Second Cooldown Enforcement
  let cooldownResStatus = 0;
  let cooldownResData: any = {};
  const cooldownRes: any = {
    status: (s: number) => { cooldownResStatus = s; return cooldownRes; },
    json: (d: any) => { cooldownResData = d; return cooldownRes; },
  };
  await sendPublicBookingOtp({ body: { phone: testPhone } } as any, cooldownRes);
  assert(cooldownResStatus === 429 && cooldownResData.message?.includes('wait'), `30s resend cooldown enforced on immediate repeat OTP request (Status 429: ${cooldownResData.message})`);

  // 3D: Verification Attempt Limit (Brute Force Protection)
  const otpRecord = await OTP.findOne({ where: { sessionId: createdSessionId } });
  assert(Boolean(otpRecord), 'OTP record exists in database table "otps"');

  const actualOtp = otpRecord?.otp;

  // Try wrong OTP 4 times
  for (let i = 1; i <= 4; i++) {
    let wrongStatus = 0;
    let wrongData: any = {};
    const wrongRes: any = {
      status: (s: number) => { wrongStatus = s; return wrongRes; },
      json: (d: any) => { wrongData = d; return wrongRes; },
    };
    await verifyPublicBookingOtp(
      { body: { phone: testPhone, otp: '000000', sessionId: createdSessionId } } as any,
      wrongRes
    );
    assert(wrongStatus === 400 && wrongData.message?.includes('remaining'), `Failed attempt #${i} tracked with remaining attempts message: "${wrongData.message}"`);
  }

  // 5th wrong attempt should lock/invalidate session
  let lockStatus = 0;
  let lockData: any = {};
  const lockRes: any = {
    status: (s: number) => { lockStatus = s; return lockRes; },
    json: (d: any) => { lockData = d; return lockRes; },
  };
  await verifyPublicBookingOtp(
    { body: { phone: testPhone, otp: '000000', sessionId: createdSessionId } } as any,
    lockRes
  );
  assert(lockStatus === 429, `Session invalidated after 5 failed attempts (Status 429: "${lockData.message}")`);

  const deletedOtp = await OTP.findOne({ where: { sessionId: createdSessionId } });
  assert(deletedOtp === null, 'Invalidated OTP record was destroyed from database');

  // ------------------------------------------------------------------------
  // SECTION 4: Two-Way Driver Allocation SMS & Deduplication
  // ------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Two-Way Driver Allocation SMS & Deduplication ---');

  const mockBooking = {
    bookingId: 99998888,
    bookingCode: 'TEST-DLT-8888',
    pickupArea: 'Chennai Central',
    dropPoint: 'T Nagar',
    bookingDate: '2026-11-10',
    bookingTime: '10:00 AM',
    tenantId: ROOT_TENANT_ID,
  };

  const mockDriver = {
    driverId: 'drv-test-1',
    driverName: 'Ramesh Kumar',
    phno: '9080280818',
    tenantId: ROOT_TENANT_ID,
  };

  const allocationResult = await sendDriverAllocationTwoWaySms({
    booking: mockBooking,
    driver: mockDriver,
    customerName: 'Suresh Raina',
    customerPhone: '9080280818',
    vehicleName: 'Toyota Innova Crysta',
    vehicleNumber: 'TN 01 AB 1234',
  });

  assert(allocationResult.customerSms.sent, `Customer allocation SMS sent (ProviderStatus: ${allocationResult.customerSms.providerStatus})`);
  assert(allocationResult.driverSms.sent, `Driver allocation SMS sent (ProviderStatus: ${allocationResult.driverSms.providerStatus})`);

  // Repeat dispatch should be deduplicated
  const repeatAllocation = await sendDriverAllocationTwoWaySms({
    booking: mockBooking,
    driver: mockDriver,
    customerName: 'Suresh Raina',
    customerPhone: '9080280818',
    vehicleName: 'Toyota Innova Crysta',
    vehicleNumber: 'TN 01 AB 1234',
  });

  assert(repeatAllocation.customerSms.skipped === true, 'Duplicate customer SMS was safely skipped via NotificationLog deduplication');
  assert(repeatAllocation.driverSms.skipped === true, 'Duplicate driver SMS was safely skipped via NotificationLog deduplication');

  // Cleanup test notification logs
  await NotificationLog.destroy({ where: { referenceId: '99998888' } });

  // ------------------------------------------------------------------------
  // SECTION 5: 2Factor Gateway Live Connectivity Check (Read-Only)
  // ------------------------------------------------------------------------
  console.log('\n--- SECTION 5: 2Factor Gateway Live Connectivity ---');
  const apiKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
  const senderId = (process.env.TWO_FACTOR_SENDER_ID || 'GRCCAB').trim();

  assert(apiKey.length > 20, `2Factor API Key is present and configured (Sender Header: ${senderId})`);

  try {
    const balUrl = `https://2factor.in/API/V1/${apiKey}/BAL/SMS`;
    const balRes = await axios.get(balUrl, { timeout: 10000 });
    assert(balRes.data?.Status === 'Success', `Live 2Factor balance check returned Status "Success"`);
    assert(Number(balRes.data?.Details) > 0, `Available 2Factor credits: ${balRes.data?.Details}`);
  } catch (err: any) {
    assert(false, `Live 2Factor balance query failed: ${err.message}`);
  }

  // ------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('                          FINAL AUDIT SUMMARY                           ');
  console.log('========================================================================');
  console.log(` TOTAL VERIFICATIONS: ${totalTests}`);
  console.log(` PASSED:              ${passedTests}`);
  console.log(` FAILED:              ${failedTests}`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((e) => {
  console.error('Test suite uncaught error:', e);
  process.exit(1);
});
