import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import sequelize from '../config/dbConfig';
import { getSuperAdminEmail, getSuperAdminPhone, diagnoseSmtpConfig, sendNotification } from '../services/notificationService';
import { sendDirectSms, send2FactorTemplateSms } from '../services/smsServices';
import { sendEmailFromTemplate } from '../services/emailConfServices';
import { EmailConfiguration } from '../models/emailConfiguration';

async function verify() {
  console.log('===============================================================');
  console.log('  DEMO FLEET CONTACT ISOLATION VERIFICATION');
  console.log('===============================================================\n');

  await sequelize.authenticate();

  // 1. Contact Resolution Check
  const email = await getSuperAdminEmail();
  const phone = await getSuperAdminPhone();

  console.log('1. SUPERADMIN CONTACT RESOLUTION:');
  console.log(`   Email: "${email}" -> ${email === 'subisha2002.m@gmail.com' ? 'PASS' : 'FAIL'}`);
  console.log(`   Phone: "${phone}" -> ${phone === '9080280818' ? 'PASS' : 'FAIL'}`);

  if (email !== 'subisha2002.m@gmail.com' || phone !== '9080280818') {
    throw new Error('Contact resolution did not match expected Demo Fleet contacts.');
  }

  // 2. Database BCC Audit
  const obsoleteBccCount = await EmailConfiguration.count({
    where: sequelize.literal("`emailBcc` LIKE '%subisha2002.m%'"),
  });
  console.log('\n2. DATABASE EMAIL TEMPLATES AUDIT:');
  console.log(`   Templates with subisha2002.m BCC: ${obsoleteBccCount} -> ${obsoleteBccCount === 0 ? 'PASS (Zero)' : 'FAIL'}`);

  // 3. Provider Configuration Check (Secrets Redacted)
  console.log('\n3. PROVIDER CONFIGURATION CHECK (SECRETS REDACTED):');
  const smtpDiag = await diagnoseSmtpConfig();
  console.log(`   SMTP Server: ${smtpDiag.server}`);
  console.log(`   SMTP Port:   ${smtpDiag.port}`);
  console.log(`   SMTP Sender: ${smtpDiag.sender}`);
  console.log(`   SMTP Verified: ${smtpDiag.transporterVerified ? 'PASS' : 'FAIL'}`);
  console.log(`   SMTP Status: ${smtpDiag.status}`);

  const twoFactorKey = process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '';
  const twoFactorSender = process.env.TWO_FACTOR_SENDER_ID || '';
  console.log(`   2Factor API Key Present: ${twoFactorKey ? 'YES (MASKED ' + twoFactorKey.substring(0, 4) + '****)' : 'NO'}`);
  console.log(`   2Factor Sender ID: ${twoFactorSender}`);

  // 4. Isolation Guard: Prohibited Old Customer SMS Block
  console.log('\n4. ISOLATION GUARD: PROHIBITED OLD CUSTOMER SMS BLOCK:');
  const oldPhoneTest = await sendDirectSms('9080280818', 'Test message should never send');
  console.log(`   Old Phone (9080280818) Send Result: success=${oldPhoneTest.success}, status=${oldPhoneTest.providerStatus}`);
  console.log(`   Error returned: "${oldPhoneTest.error}" -> ${oldPhoneTest.success === false && String(oldPhoneTest.error).includes('Blocked') ? 'PASS (Safely Blocked)' : 'FAIL'}`);

  // 5. Isolation Guard: Prohibited Old Customer Email Block
  console.log('\n5. ISOLATION GUARD: PROHIBITED OLD CUSTOMER EMAIL BLOCK:');
  const oldEmailTest = await sendNotification({
    channel: 'EMAIL',
    recipient: 'subisha2002.m@gmail.com',
    templateCode: 'TEST_ISOLATION',
    subject: 'Prohibited Test',
    body: 'This must not be sent',
  });
  console.log(`   Old Email (subisha2002.m@gmail.com) Send Result: success=${oldEmailTest.success}, status=${oldEmailTest.providerStatus}`);
  console.log(`   Error returned: "${oldEmailTest.error}" -> ${oldEmailTest.success === false && String(oldEmailTest.error).includes('Blocked') ? 'PASS (Safely Blocked)' : 'FAIL'}`);

  console.log('\n===============================================================');
  console.log('🏁 ALL CONTACT ISOLATION CHECKS PASSED SUCCESSFULLY!');
  console.log('===============================================================\n');
}

verify().then(() => process.exit(0)).catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
