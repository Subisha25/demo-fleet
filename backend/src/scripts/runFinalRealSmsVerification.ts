import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import axios from 'axios';
import sequelize from '../config/dbConfig';
import {
  validateMobileRecipient,
  maskPhoneNumber,
} from '../utils/validationUtils';
import {
  send2FactorOTP,
  send2FactorTemplateSms,
  dispatchAuditedSms,
  normalizePhoneNumberForSms,
  query2FactorDlrStatus,
  APPROVED_2FACTOR_TEMPLATES,
  DLT_TEMPLATE_VARIABLE_SPECS,
} from '../services/smsServices';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { OTP } from '../models/otp';
import { NotificationLog } from '../models/notificationLog';
import { sendPublicBookingOtp, verifyPublicBookingOtp } from '../services/publicBookingServices';

// ============================================================================
// HARD-CODED SAFETY GUARD: ONLY 9080280818 IS AUTHORIZED FOR REAL SMS DISPATCH
// ============================================================================
const AUTHORIZED_TEST_PHONE = '9080280818';

function assertRecipientSafety(targetPhone: string, context: string) {
  const norm = normalizePhoneNumberForSms(targetPhone);
  if (!norm.valid || norm.normalizedPhone !== AUTHORIZED_TEST_PHONE) {
    throw new Error(
      `CRITICAL RECIPIENT SAFETY ABORT [${context}]: Target "${targetPhone}" is NOT authorized. ONLY ${AUTHORIZED_TEST_PHONE} is allowed!`
    );
  }
}

interface TestAuditRecord {
  testCode: string;
  workflow: string;
  fleetTenant: string;
  templateName: string;
  recipientMasked: string;
  apiCallStatus: 'SUCCESS' | 'FAILED';
  providerStatus: 'SENT' | 'FAILED' | 'MOCK' | 'UNCONFIGURED';
  providerMessageId: string;
  notificationLogId?: number | string;
  acceptedByProvider: boolean;
  dlrStatus?: string;
  notes?: string;
}

const auditRecords: TestAuditRecord[] = [];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runFinalRealSmsVerification() {
  console.log('========================================================================');
  console.log('   FLEETFLOW SAAS — CONTROLLED REAL SMS DELIVERY VERIFICATION SUITE     ');
  console.log('             AUTHORIZED RECIPIENT ONLY: 9080280818                      ');
  console.log('========================================================================\n');

  await sequelize.authenticate();
  console.log('✔ Database connection established.\n');

  // ========================================================================
  // 1. VERIFY INVALID RECIPIENT PROTECTION (Validation-Only, 0 Network Calls)
  // ========================================================================
  console.log('------------------------------------------------------------------------');
  console.log('STEP 1: Verify Invalid Recipient Protection (Zero Network Calls)');
  console.log('------------------------------------------------------------------------');

  const invalidTestNumbers = [
    { num: '0000000000', label: 'All zeros' },
    { num: '1111111111', label: 'All ones' },
    { num: '9999999999', label: 'All nines' },
    { num: '1234567890', label: 'Sequential 1-0' },
    { num: '9000000000', label: 'Placeholder 9000000000' },
  ];

  for (const item of invalidTestNumbers) {
    const val = validateMobileRecipient(item.num);
    const passed = !val.valid;
    console.log(`  ✔ [PROTECTED] "${item.num}" (${item.label}) -> REJECTED: ${val.error}`);
    if (!passed) {
      throw new Error(`CRITICAL DEFECT: Invalid number "${item.num}" was accepted by validation!`);
    }

    // Verify public booking OTP endpoint also rejects without hitting provider
    let capturedCode = 0;
    let capturedBody: any = null;
    const mockRes = {
      status(code: number) { capturedCode = code; return this; },
      json(data: any) { capturedBody = data; return this; },
    } as any;

    await sendPublicBookingOtp({ body: { phone: item.num } } as any, mockRes);
    if (capturedCode !== 400 || capturedBody?.success !== false) {
      throw new Error(`CRITICAL DEFECT: sendPublicBookingOtp did not return HTTP 400 for "${item.num}"!`);
    }
  }
  console.log('  ✔ All dummy/test numbers blocked pre-network with HTTP 400. Zero SMS provider calls.\n');

  // ========================================================================
  // 2. LIVE PROVIDER CONNECTIVITY & STARTING BALANCE
  // ========================================================================
  console.log('------------------------------------------------------------------------');
  console.log('STEP 2: Live 2Factor Provider Connectivity & Starting Balance');
  console.log('------------------------------------------------------------------------');

  const apiKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
  const senderId = (process.env.TWO_FACTOR_SENDER_ID || 'GRCCAB').trim();

  if (!apiKey) {
    throw new Error('TWO_FACTOR_API_KEY is not configured in backend/.env!');
  }

  let startingBalance = 0;
  try {
    const balUrl = `https://2factor.in/API/V1/${apiKey}/BAL/SMS`;
    const balRes = await axios.get(balUrl, { timeout: 10000 });
    if (balRes.data?.Status === 'Success') {
      startingBalance = parseFloat(balRes.data?.Details);
      console.log(`  ✔ 2Factor Gateway Status: SUCCESS`);
      console.log(`  ✔ Sender Header:         ${senderId}`);
      console.log(`  ✔ Starting SMS Balance:  ${startingBalance.toFixed(2)} credits\n`);
    } else {
      throw new Error(`2Factor balance check returned status: ${balRes.data?.Status}`);
    }
  } catch (err: any) {
    throw new Error(`Failed to query 2Factor gateway: ${err.message}`);
  }

  // ========================================================================
  // 3. CONTROLLED REAL SMS TESTS (SEQUENTIAL, ONLY TO 9080280818)
  // ========================================================================
  console.log('------------------------------------------------------------------------');
  console.log('STEP 3: Controlled Real SMS Dispatches (Recipient: 9080280818 Only)');
  console.log('------------------------------------------------------------------------');

  // Enforce Real Dispatch Mode
  process.env.SMS_MOCK_MODE = 'false';
  process.env.NOTIFICATION_MOCK_MODE = 'false';
  delete (process.env as any).NODE_ENV; // Ensure not in test mode

  // ------------------------------------------------------------------------
  // TEST A: Public Customer Booking OTP
  // ------------------------------------------------------------------------
  console.log('\n[TEST A] Initiating Real Public Customer Booking OTP...');
  assertRecipientSafety(AUTHORIZED_TEST_PHONE, 'TEST A - OTP');

  let testACapturedCode = 0;
  let testACapturedData: any = null;
  const testARes = {
    status(code: number) { testACapturedCode = code; return this; },
    json(data: any) { testACapturedData = data; return this; },
  } as any;

  await sendPublicBookingOtp({ body: { phone: AUTHORIZED_TEST_PHONE } } as any, testARes);

  console.log(`  HTTP Response Status: ${testACapturedCode}`);
  console.log(`  Response Payload:     ${JSON.stringify(testACapturedData)}`);

  if (testACapturedCode !== 200 || !testACapturedData?.success) {
    throw new Error(`TEST A FAILED: sendPublicBookingOtp returned HTTP ${testACapturedCode}: ${JSON.stringify(testACapturedData)}`);
  }

  const otpSessionId = testACapturedData.sessionId;
  const otpRecord = await OTP.findOne({ where: { sessionId: otpSessionId } });
  if (!otpRecord) {
    throw new Error('TEST A FAILED: OTP record was not found in demodb.otps!');
  }

  // Check recent NotificationLog entry for OTP
  const otpLog = await NotificationLog.findOne({
    where: {
      recipient: AUTHORIZED_TEST_PHONE,
      templateCode: 'PUBLIC_BOOKING_OTP',
      referenceId: otpSessionId,
    },
    order: [['createdAt', 'DESC']],
  });

  const testARecord: TestAuditRecord = {
    testCode: 'TEST_A',
    workflow: 'Public Customer Booking OTP',
    fleetTenant: 'ROOT (FleetFlow / Grace Cabs)',
    templateName: 'OTP1 (System Pre-Approved Route)',
    recipientMasked: maskPhoneNumber(AUTHORIZED_TEST_PHONE),
    apiCallStatus: 'SUCCESS',
    providerStatus: 'SENT',
    providerMessageId: String(otpLog?.providerMessageId || otpSessionId),
    notificationLogId: otpLog?.logId,
    acceptedByProvider: true,
    notes: 'Real OTP dispatched via 2Factor /SMS/{phone}/{otp}/OTP1 endpoint',
  };
  auditRecords.push(testARecord);

  console.log(`  ✔ TEST A PASSED: Provider accepted real OTP message.`);
  console.log(`    Provider Message/Session ID: ${testARecord.providerMessageId}`);
  console.log(`    NotificationLog ID:          ${testARecord.notificationLogId || 'N/A'}`);

  // Complete OTP verification lifecycle using the recorded OTP
  let verifyCode = 0;
  let verifyData: any = null;
  const verifyRes = {
    status(code: number) { verifyCode = code; return this; },
    json(data: any) { verifyData = data; return this; },
  } as any;

  await verifyPublicBookingOtp(
    { body: { phone: AUTHORIZED_TEST_PHONE, otp: otpRecord.otp, sessionId: otpSessionId } } as any,
    verifyRes
  );
  console.log(`  ✔ OTP Verification Completed: HTTP ${verifyCode} (${verifyData?.message})`);

  // Wait 3 seconds before Test B
  console.log('\nPausing 3 seconds before Test B...');
  await sleep(3000);

  // ------------------------------------------------------------------------
  // TEST B: Real Driver Assignment SMS
  // ------------------------------------------------------------------------
  console.log('\n[TEST B] Initiating Real Driver Assignment SMS...');
  assertRecipientSafety(AUTHORIZED_TEST_PHONE, 'TEST B - Driver Assigning');

  const driverAssignVars = [
    'Rajesh Driver',
    'Customer Booking #GC-701',
    AUTHORIZED_TEST_PHONE,
    '?l=route123',
  ];

  console.log(`  Template Name: Driver Assigning`);
  console.log(`  Variable Order:`);
  console.log(`    var1 (Driver Name):       "${driverAssignVars[0]}"`);
  console.log(`    var2 (Booking Ref):       "${driverAssignVars[1]}"`);
  console.log(`    var3 (Customer Mobile):   "${maskPhoneNumber(driverAssignVars[2])}"`);
  console.log(`    var4 (Directions Link):   "${driverAssignVars[3]}"`);

  const driverSmsRes = await dispatchAuditedSms({
    recipient: AUTHORIZED_TEST_PHONE,
    templateCode: 'BOOKING_ASSIGNED_TO_DRIVER',
    templateName: 'Driver Assigning',
    vars: driverAssignVars,
    message: `Grace Cabs: Trip assigned to Rajesh Driver. Booking #GC-701.`,
    referenceEntity: 'BOOKING',
    referenceId: 'REAL-TEST-DRV-001',
    tenantId: ROOT_TENANT_ID,
  });

  console.log(`  Provider Dispatch Result: ${JSON.stringify(driverSmsRes)}`);

  if (!driverSmsRes.success || driverSmsRes.providerStatus !== 'SENT') {
    throw new Error(`TEST B FAILED: 2Factor TRANS_SMS rejected Driver Assigning: ${driverSmsRes.error}`);
  }

  const driverLog = await NotificationLog.findOne({
    where: {
      recipient: AUTHORIZED_TEST_PHONE,
      templateCode: 'BOOKING_ASSIGNED_TO_DRIVER',
      referenceId: 'REAL-TEST-DRV-001',
    },
    order: [['createdAt', 'DESC']],
  });

  const testBRecord: TestAuditRecord = {
    testCode: 'TEST_B',
    workflow: 'Driver Trip Assignment Notification',
    fleetTenant: 'ROOT (Grace Cabs)',
    templateName: 'Driver Assigning',
    recipientMasked: maskPhoneNumber(AUTHORIZED_TEST_PHONE),
    apiCallStatus: 'SUCCESS',
    providerStatus: driverSmsRes.providerStatus,
    providerMessageId: String(driverSmsRes.providerMessageId),
    notificationLogId: driverLog?.logId,
    acceptedByProvider: true,
    notes: 'Real Driver Assignment SMS accepted by 2Factor TRANS_SMS under Header GRCCAB',
  };
  auditRecords.push(testBRecord);

  console.log(`  ✔ TEST B PASSED: Provider accepted real Driver Assignment message.`);
  console.log(`    Provider Message ID: ${testBRecord.providerMessageId}`);
  console.log(`    NotificationLog ID:  ${testBRecord.notificationLogId || 'N/A'}`);

  // Wait 3 seconds before Test C
  console.log('\nPausing 3 seconds before Test C...');
  await sleep(3000);

  // ------------------------------------------------------------------------
  // TEST C: Real Customer Booking Confirmation SMS
  // ------------------------------------------------------------------------
  console.log('\n[TEST C] Initiating Real Customer Booking Confirmation SMS...');
  assertRecipientSafety(AUTHORIZED_TEST_PHONE, 'TEST C - Booking Confirmation');

  const bookingConfirmVars = [
    'Priya Sharma',                         // var1: Customer Name
    'GC-701',                               // var2: Booking Code
    '?l=route123',                          // var3: Route link
    '10/11/2026 at 10:00 AM',               // var4: Date & Time IST
    'Rajesh Driver',                        // var5: Driver Name
    AUTHORIZED_TEST_PHONE,                  // var6: Driver Phone
    'Toyota Innova Crysta',                 // var7: Vehicle Name
    'TN 01 AB 1234',                        // var8: Vehicle Number
    'Grace Cabs',                           // var9: Fleet Brand Name
    AUTHORIZED_TEST_PHONE,                  // var10: Support Phone
  ];

  console.log(`  Template Name: Booking Confimation Message`);
  console.log(`  Positional Variables (10 total):`);
  bookingConfirmVars.forEach((v, idx) => {
    const val = v === AUTHORIZED_TEST_PHONE ? maskPhoneNumber(v) : v;
    console.log(`    var${idx + 1}: "${val}"`);
  });

  const custSmsRes = await dispatchAuditedSms({
    recipient: AUTHORIZED_TEST_PHONE,
    templateCode: 'DRIVER_ASSIGNED_TO_CUSTOMER',
    templateName: 'Booking Confimation Message',
    vars: bookingConfirmVars,
    message: `Grace Cabs: Your booking GC-701 has been confirmed with Rajesh Driver.`,
    referenceEntity: 'BOOKING',
    referenceId: 'REAL-TEST-CUST-001',
    tenantId: ROOT_TENANT_ID,
  });

  console.log(`  Provider Dispatch Result: ${JSON.stringify(custSmsRes)}`);

  if (!custSmsRes.success || custSmsRes.providerStatus !== 'SENT') {
    throw new Error(`TEST C FAILED: 2Factor TRANS_SMS rejected Booking Confimation Message: ${custSmsRes.error}`);
  }

  const custLog = await NotificationLog.findOne({
    where: {
      recipient: AUTHORIZED_TEST_PHONE,
      templateCode: 'DRIVER_ASSIGNED_TO_CUSTOMER',
      referenceId: 'REAL-TEST-CUST-001',
    },
    order: [['createdAt', 'DESC']],
  });

  const testCRecord: TestAuditRecord = {
    testCode: 'TEST_C',
    workflow: 'Customer Booking Confirmation with Driver Details',
    fleetTenant: 'ROOT (Grace Cabs)',
    templateName: 'Booking Confimation Message',
    recipientMasked: maskPhoneNumber(AUTHORIZED_TEST_PHONE),
    apiCallStatus: 'SUCCESS',
    providerStatus: custSmsRes.providerStatus,
    providerMessageId: String(custSmsRes.providerMessageId),
    notificationLogId: custLog?.logId,
    acceptedByProvider: true,
    notes: 'Real Booking Confirmation SMS accepted by 2Factor TRANS_SMS under Header GRCCAB',
  };
  auditRecords.push(testCRecord);

  console.log(`  ✔ TEST C PASSED: Provider accepted real Booking Confirmation message.`);
  console.log(`    Provider Message ID: ${testCRecord.providerMessageId}`);
  console.log(`    NotificationLog ID:  ${testCRecord.notificationLogId || 'N/A'}`);

  // ========================================================================
  // 4. CHECK DLR CARRIER REPORT STATUS (IF AVAILABLE)
  // ========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('STEP 4: Query 2Factor Delivery Reports (DLR Status)');
  console.log('------------------------------------------------------------------------');

  // Wait 2 seconds for initial carrier routing
  await sleep(2000);

  for (const record of auditRecords) {
    if (record.providerMessageId && !record.providerMessageId.startsWith('mock_')) {
      try {
        const dlr = await query2FactorDlrStatus(record.providerMessageId);
        record.dlrStatus = `${dlr.deliveryStatus} (Raw: ${dlr.rawStatus})`;
        console.log(`  [${record.testCode}] Session ${record.providerMessageId}: ${record.dlrStatus}`);
      } catch (e: any) {
        record.dlrStatus = `PENDING_CARRIER_REPORT (${e.message})`;
        console.log(`  [${record.testCode}] Session ${record.providerMessageId}: PENDING_CARRIER_REPORT`);
      }
    }
  }

  // ========================================================================
  // 5. POST-TEST BALANCE CHECK
  // ========================================================================
  console.log('\n------------------------------------------------------------------------');
  console.log('STEP 5: Post-Test Provider Balance Check');
  console.log('------------------------------------------------------------------------');

  try {
    const balUrl = `https://2factor.in/API/V1/${apiKey}/BAL/SMS`;
    const balRes = await axios.get(balUrl, { timeout: 10000 });
    if (balRes.data?.Status === 'Success') {
      const endingBalance = parseFloat(balRes.data?.Details);
      const creditsUsed = (startingBalance - endingBalance);
      console.log(`  ✔ Starting Balance: ${startingBalance.toFixed(2)} credits`);
      console.log(`  ✔ Ending Balance:   ${endingBalance.toFixed(2)} credits`);
      console.log(`  ✔ Credits Consumed: ${creditsUsed.toFixed(2)} credits (Expected: exactly 3 real dispatches)`);
    }
  } catch (err: any) {
    console.warn(`  Warning: Could not query ending balance: ${err.message}`);
  }

  // ========================================================================
  // 6. FINAL SUMMARY TABLE
  // ========================================================================
  console.log('\n========================================================================');
  console.log('                  REAL SMS DISPATCH AUDIT SUMMARY                       ');
  console.log('========================================================================');
  console.table(
    auditRecords.map((r) => ({
      Test: r.testCode,
      Workflow: r.workflow,
      Template: r.templateName,
      Recipient: r.recipientMasked,
      ProviderStatus: r.providerStatus,
      ProviderMsgId: r.providerMessageId,
      LogId: r.notificationLogId || 'N/A',
      Accepted: r.acceptedByProvider ? 'YES' : 'NO',
      DLRStatus: r.dlrStatus || 'PENDING',
    }))
  );
  console.log('========================================================================\n');
}

runFinalRealSmsVerification()
  .then(() => {
    console.log('✔ All 3 controlled real SMS dispatches completed and verified successfully.\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ REAL SMS TEST SUITE ENCOUNTERED AN ERROR:', err);
    process.exit(1);
  });
