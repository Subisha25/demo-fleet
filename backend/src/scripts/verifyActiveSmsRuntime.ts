import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import axios from 'axios';
import config from '../config/config';
import { SmsTemplate } from '../models/smsTemplate';
import sequelize from '../config/dbConfig';

async function verifyActiveSmsRuntime() {
  console.log('========================================================================');
  console.log('       FLEETFLOW ACTIVE SMS RUNTIME & DLT CONFIGURATION INSPECTION');
  console.log('========================================================================\n');

  // 1. Env & Config values
  const rawSenderEnv = process.env.TWO_FACTOR_SENDER_ID;
  const rawMockEnv = process.env.NOTIFICATION_MOCK_MODE;
  const configSender = config.twofactor.senderId;
  const configTemplate = config.twofactor.templateName;
  const hasApiKey = Boolean(config.twofactor.apiKey);

  console.log('1. Active Environment Configuration:');
  console.log(`   - process.env.TWO_FACTOR_SENDER_ID: "${rawSenderEnv}"`);
  console.log(`   - process.env.NOTIFICATION_MOCK_MODE: "${rawMockEnv}"`);
  console.log(`   - config.twofactor.senderId:        "${configSender}"`);
  console.log(`   - config.twofactor.templateName:    "${configTemplate}"`);
  console.log(`   - 2Factor API Key present:          ${hasApiKey} (Redacted for security)`);

  const senderIdVerified = rawSenderEnv === 'GRCCAB' && configSender === 'GRCCAB';
  const mockModeVerified = rawMockEnv === 'true';

  console.log(`   ✔ Sender ID matches "GRCCAB":       ${senderIdVerified}`);
  console.log(`   ✔ Mock Mode is strictly "true":      ${mockModeVerified}\n`);

  // 2. Query 2Factor Balance API (Safe read-only check, does NOT send SMS)
  console.log('2. 2Factor Gateway Connectivity (Read-Only Balance Check):');
  try {
    const balUrl = `https://2factor.in/API/V1/${config.twofactor.apiKey}/BAL/SMS`;
    const res = await axios.get(balUrl, { timeout: 8000 });
    console.log(`   ✔ Gateway response status: ${res.data?.Status}`);
    console.log(`   ✔ Available SMS Balance:   ${res.data?.Details} credits`);
  } catch (err: any) {
    console.error(`   ✘ Gateway balance check failed: ${err.message}`);
  }

  // 3. Inspect Database DLT Templates
  console.log('\n3. Database Registered Templates for Header GRCCAB:');
  await sequelize.authenticate();
  const dbTemplates = await SmsTemplate.findAll({
    where: { senderId: 'GRCCAB' },
    attributes: ['smsTemplateId', 'title', 'templateCode', 'message', 'senderId', 'isActive'],
  });

  console.log(`   Found ${dbTemplates.length} registered template(s) in demodb:`);
  for (const t of dbTemplates) {
    console.log(`   - Title: "${t.title}"`);
    console.log(`     Template Code: ${t.templateCode}`);
    console.log(`     Message Pattern: "${t.message}"`);
    console.log(`     Status: ${t.isActive ? 'ACTIVE' : 'INACTIVE'}`);
  }

  console.log('\n========================================================================');
  console.log('                      INSPECTION SUMMARY');
  console.log('========================================================================');
  console.log(` Runtime Sender ID:    ${configSender} (${senderIdVerified ? 'VERIFIED' : 'MISMATCH'})`);
  console.log(` Notification Mock:    ${rawMockEnv} (${mockModeVerified ? 'SAFE & ACTIVE' : 'UNSAFE'})`);
  console.log('========================================================================\n');
}

verifyActiveSmsRuntime().then(() => {
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
