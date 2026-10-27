import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import axios from 'axios';
import { maskPhoneNumber } from '../services/smsServices';

async function testSms() {
  console.log('\n===============================================================');
  console.log('         SMS PROVIDER AUDIT: 2FACTOR.IN & TWILIO');
  console.log('===============================================================\n');

  // =========================================================================
  // 1. 2FACTOR.IN AUDIT
  // =========================================================================
  console.log('--- 1. 2FACTOR.IN CONFIGURATION & AUTHENTICATION ---');
  const twoFactorKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
  const twoFactorSender = (process.env.TWO_FACTOR_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'GRCCAB').trim();
  const templateName = (process.env.TWOFACTOR_TEMPLATE_NAME || 'OTP1').trim();

  console.log(`2Factor API Key:     ${twoFactorKey ? 'PRESENT (' + twoFactorKey.length + ' chars)' : 'MISSING'}`);
  console.log(`2Factor Sender ID:   ${twoFactorSender}`);
  console.log(`Configured Template: ${templateName}`);

  let twoFactorAuthValid = false;
  let twoFactorBalance = 'UNKNOWN';

  if (twoFactorKey) {
    try {
      // 2Factor Balance API: https://2factor.in/API/V1/{api_key}/BAL/TRANS_SMS or /BAL/SMS
      const balUrl = `https://2factor.in/API/V1/${twoFactorKey}/BAL/SMS`;
      const balRes = await axios.get(balUrl, { timeout: 10000 });
      console.log('2Factor Balance API Response Status:', balRes.status);
      console.log('2Factor Balance API Response Data:', JSON.stringify(balRes.data));
      if (balRes.data?.Status === 'Success') {
        twoFactorAuthValid = true;
        twoFactorBalance = String(balRes.data.Details);
        console.log(`✅ 2FACTOR AUTHENTICATION: SUCCESS (Transactional Balance: ${twoFactorBalance})`);
      } else {
        console.log(`⚠️ 2FACTOR AUTHENTICATION RESPONSE: ${balRes.data?.Status} - ${balRes.data?.Details || balRes.data?.message}`);
        // Try TSMS balance
        const tsmsBalUrl = `https://2factor.in/API/V1/${twoFactorKey}/ADDON_SERVICES/BAL/TSMS`;
        const tsmsRes = await axios.get(tsmsBalUrl, { timeout: 10000 });
        console.log('2Factor TSMS Balance Response:', JSON.stringify(tsmsRes.data));
        if (tsmsRes.data?.Status === 'Success') {
          twoFactorAuthValid = true;
          twoFactorBalance = String(tsmsRes.data.Details);
          console.log(`✅ 2FACTOR TSMS AUTHENTICATION: SUCCESS (Balance: ${twoFactorBalance})`);
        }
      }
    } catch (err: any) {
      console.error('❌ 2FACTOR AUTHENTICATION FAILED:', err.response?.data || err.message);
    }
  } else {
    console.log('2Factor Status: NOT CONFIGURED');
  }

  // =========================================================================
  // 2. TWILIO AUDIT
  // =========================================================================
  console.log('\n--- 2. TWILIO CONFIGURATION & AUTHENTICATION ---');
  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioPhone = (process.env.TWILIO_PHONE_NUMBER || '').trim();

  console.log(`Twilio Account SID:  ${twilioSid ? twilioSid.substring(0, 6) + '...' + twilioSid.slice(-4) : 'MISSING'}`);
  console.log(`Twilio Auth Token:   ${twilioToken ? 'PRESENT (' + twilioToken.length + ' chars)' : 'MISSING'}`);
  console.log(`Twilio Phone Number: ${twilioPhone || 'MISSING'}`);

  let twilioAuthValid = false;
  let twilioStatus = 'UNKNOWN';

  if (twilioSid && twilioToken) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const twilioRes = await axios.get(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}.json`, {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 10000,
      });

      if (twilioRes.status === 200 && twilioRes.data?.status) {
        twilioAuthValid = true;
        twilioStatus = twilioRes.data.status;
        console.log(`✅ TWILIO AUTHENTICATION: SUCCESS (Account: "${twilioRes.data.friendly_name}", Status: "${twilioStatus}")`);
      } else {
        console.log('⚠️ TWILIO RESPONSE:', twilioRes.data);
      }
    } catch (err: any) {
      console.error('❌ TWILIO AUTHENTICATION FAILED:', err.response?.data?.message || err.message);
    }
  } else {
    console.log('Twilio Status: NOT CONFIGURED');
  }

  // =========================================================================
  // 3. IDENTIFY PRIMARY PROVIDER & LIVE TEST DISPATCH
  // =========================================================================
  console.log('\n--- 3. APPLICATION ACTIVE SMS PROVIDER SELECTION ---');
  let activeProvider: '2FACTOR' | 'TWILIO' | 'NONE' = 'NONE';

  if (twoFactorAuthValid) {
    activeProvider = '2FACTOR';
    console.log(' Active Provider: 2FACTOR.IN (Primary Indian DLT Transactional SMS Gateway)');
  } else if (twilioAuthValid) {
    activeProvider = 'TWILIO';
    console.log(' Active Provider: TWILIO (International SMS Gateway)');
  } else {
    console.log(' Active Provider: NONE (Neither provider authenticated successfully)');
  }

  console.log('\n--- 4. SINGLE TEST SMS DISPATCH ---');
  const testNumber = '9080280818';

  if (activeProvider === '2FACTOR') {
    console.log(`Attempting real 2Factor template SMS to authorized number: ${maskPhoneNumber(testNumber)}`);
    // Testing 2Factor with configured template or TRANS_SMS
    try {
      const url = `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${twoFactorKey}&to=${testNumber}&from=${twoFactorSender}&templatename=${encodeURIComponent('Booking Creation')}&var1=${encodeURIComponent('SuperAdmin')}`;
      console.log(`Calling 2Factor endpoint with Sender: ${twoFactorSender}, Template: Booking Creation...`);
      const sendRes = await axios.get(url, { timeout: 10000 });
      console.log('2Factor Send Response:', JSON.stringify(sendRes.data));
      if (sendRes.data?.Status === 'Success') {
        console.log(`✅ 2FACTOR SMS DISPATCHED: Session/Message-ID = ${sendRes.data.Details}`);
      } else {
        console.log(`⚠️ 2FACTOR REJECTION: ${sendRes.data?.Details || sendRes.data?.message}`);
      }
    } catch (sendErr: any) {
      console.error('2Factor Send Error:', sendErr.response?.data || sendErr.message);
    }
  } else if (activeProvider === 'TWILIO') {
    console.log(`Attempting real Twilio SMS to authorized number: ${maskPhoneNumber(testNumber)}`);
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', `+91${testNumber}`);
      params.append('From', twilioPhone);
      params.append('Body', 'Grace Cabs diagnostic verification SMS via Twilio.');

      const twilioSend = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        params.toString(),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );
      console.log(`✅ TWILIO SMS DISPATCHED: SID = ${twilioSend.data?.sid}, Status = ${twilioSend.data?.status}`);
    } catch (twErr: any) {
      console.error('Twilio Send Error:', twErr.response?.data?.message || twErr.message);
    }
  } else {
    console.log('⏭️ SKIPPING TEST SMS: Neither 2Factor nor Twilio has verified valid API authentication.');
  }

  console.log('\n===============================================================');
  console.log('                   SMS AUDIT SUMMARY');
  console.log('===============================================================');
  console.log(` 2Factor Auth:   ${twoFactorAuthValid ? 'PASS' : 'FAIL / INVALID KEY'} (Balance: ${twoFactorBalance})`);
  console.log(` Twilio Auth:    ${twilioAuthValid ? 'PASS' : 'FAIL'} (Account Status: ${twilioStatus})`);
  console.log(` Active Provider: ${activeProvider}`);
  console.log('===============================================================\n');

  process.exit(0);
}

testSms().catch((e) => {
  console.error('Fatal SMS audit error:', e);
  process.exit(1);
});
