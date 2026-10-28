/**
 * Phase 3: Isolated, Single Authorized Real SMS Test
 *
 * Rules:
 * - Authorized recipient ONLY: 9080280818
 * - Exact message ONLY: "FleetFlow SMS verification test. This is a single authorized test message."
 * - Exactly ONE request. Zero retries.
 * - Redact secrets.
 * - Immediately restore NOTIFICATION_MOCK_MODE=true.
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import axios from 'axios';
import { maskPhoneNumber } from '../services/smsServices';

const AUTHORIZED_PHONE = '9080280818';
const EXACT_MESSAGE = 'FleetFlow SMS verification test. This is a single authorized test message.';

async function executeSingleAuthorizedRealSms() {
  console.log('\n========================================================================');
  console.log('       FLEETFLOW PHASE 3: SINGLE AUTHORIZED REAL SMS TEST');
  console.log('========================================================================\n');

  let providerRequestAttempted = 'NO';
  let providerAccepted = 'UNKNOWN';
  let phoneDeliveryConfirmed = 'NOT YET CONFIRMED';
  let realRequestsCount = 0;
  let mockModeRestored = 'NO';
  let capturedResponse: any = null;
  let capturedError: any = null;

  const twoFactorKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
  const twoFactorSender = (process.env.TWO_FACTOR_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'FLTFLW').trim();

  try {
    // 1. Safety Checks
    if (!twoFactorKey) {
      console.error('❌ SAFETY ABORT: TWO_FACTOR_API_KEY is not configured in backend/.env.');
      return;
    }

    console.log(`[Target Check] Destination: ${maskPhoneNumber(AUTHORIZED_PHONE)} (Authorized)`);
    console.log(`[Message Check] "${EXACT_MESSAGE}"`);
    console.log(`[Provider Check] 2Factor.in with Sender ID: ${twoFactorSender}`);

    // 2. Temporarily disable mock mode ONLY for this isolated single execution
    const previousMockMode = process.env.NOTIFICATION_MOCK_MODE;
    process.env.NOTIFICATION_MOCK_MODE = 'false';

    try {
      providerRequestAttempted = 'YES';
      realRequestsCount = 1;

      // Make exactly ONE request to 2Factor.in TRANS_SMS module
      const url = `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${twoFactorKey}&to=${AUTHORIZED_PHONE}&from=${twoFactorSender}&msg=${encodeURIComponent(EXACT_MESSAGE)}&templatename=Booking Creation&var1=${encodeURIComponent('Single Test')}`;

      console.log(`\n[Dispatching] Sending single real SMS to ${maskPhoneNumber(AUTHORIZED_PHONE)}...`);
      const res = await axios.get(url, { timeout: 12000 });
      capturedResponse = res.data;

      console.log('\n[Provider Response Received]');
      console.log(`Status: ${res.data?.Status}`);
      console.log(`Details: ${res.data?.Details || res.data?.message || 'N/A'}`);

      if (res.data?.Status === 'Success') {
        providerAccepted = 'YES';
      } else {
        providerAccepted = 'NO';
      }
    } catch (err: any) {
      capturedError = err.response?.data || err.message;
      providerAccepted = 'NO';
      console.error('Provider Request Error:', capturedError);
    } finally {
      // 3. Immediately restore NOTIFICATION_MOCK_MODE=true
      process.env.NOTIFICATION_MOCK_MODE = 'true';
      mockModeRestored = process.env.NOTIFICATION_MOCK_MODE === 'true' ? 'YES' : 'NO';
    }

    // 4. Check Handset DLR if session ID returned
    if (providerAccepted === 'YES' && capturedResponse?.Details) {
      const sessionId = String(capturedResponse.Details).trim();
      console.log(`\n[Checking Delivery DLR for Session: ${sessionId}]`);
      try {
        const dlrUrl = `https://2factor.in/API/V1/${twoFactorKey}/ADDON_SERVICES/RPT/TSMS/${sessionId}`;
        const dlrRes = await axios.get(dlrUrl, { timeout: 8000 });
        const rawDlr = String(dlrRes.data);
        console.log(`DLR Status Lookup Result: ${rawDlr.substring(0, 120)}...`);
        if (rawDlr.includes('<statusDesc>DELIVERED</statusDesc>')) {
          phoneDeliveryConfirmed = 'YES';
        } else {
          phoneDeliveryConfirmed = 'NOT YET CONFIRMED';
        }
      } catch (dlrErr: any) {
        console.log(`DLR Lookup notice (carrier delivery report in progress): ${dlrErr.message}`);
      }
    }
  } finally {
    // Guarantees NOTIFICATION_MOCK_MODE is true under all circumstances
    process.env.NOTIFICATION_MOCK_MODE = 'true';
    mockModeRestored = process.env.NOTIFICATION_MOCK_MODE === 'true' ? 'YES' : 'NO';
  }

  console.log('\n========================================================================');
  console.log('             PHASE 3: REAL SMS AUDIT SUMMARY REPORT');
  console.log('========================================================================');
  console.log(` Provider request attempted:  ${providerRequestAttempted}`);
  console.log(` Provider accepted request:   ${providerAccepted}`);
  console.log(` Phone delivery confirmed:    ${phoneDeliveryConfirmed}`);
  console.log(` Real SMS requests made:      ${realRequestsCount}`);
  console.log(` Mock mode restored/verified: ${mockModeRestored}`);
  console.log('========================================================================\n');
}

executeSingleAuthorizedRealSms().then(() => {
  process.exit(0);
}).catch((e) => {
  console.error('Fatal execution error:', e);
  process.exit(1);
});
