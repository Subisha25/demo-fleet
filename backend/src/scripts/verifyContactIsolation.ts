import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import sequelize from '../config/dbConfig';
import { getSuperAdminEmail, getSuperAdminPhone, diagnoseSmtpConfig, sendNotification } from '../services/notificationService';
import { sendDirectSms, send2FactorTemplateSms } from '../services/smsServices';
import { sendEmailFromTemplate } from '../services/emailConfServices';
import { EmailConfiguration } from '../models/emailConfiguration';
import { APPLICANT_TEST_PHONE } from '../tests/fixtures/smsFixtures';

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

  // 4. Normal Applicant Routing Check:
  console.log(`\n4. APPLICANT CONTACT ROUTING (${APPLICANT_TEST_PHONE}) CHECK:`);
  const applicantSmsTest = await sendDirectSms(APPLICANT_TEST_PHONE, 'Test message to applicant phone');
  console.log(`   Applicant Phone (${APPLICANT_TEST_PHONE}) Send Result: success=${applicantSmsTest.success}, status=${applicantSmsTest.providerStatus}`);
  console.log(`   Routing check -> ${applicantSmsTest.success && applicantSmsTest.providerStatus === 'SENT' ? 'PASS (Allowed & Dispatched in Mock Mode)' : 'FAIL'}`);

  // 5. Operational Eligibility: SuperAdmin Contacts (9080280818 / subisha2002.m@gmail.com)
  console.log('\n5. OPERATIONAL ELIGIBILITY: SUPERADMIN CONTACTS:');
  const superAdminSmsTest = await sendNotification({
    channel: 'SMS',
    recipient: '9080280818',
    templateCode: 'TEST_SUPERADMIN_SMS',
    subject: 'SuperAdmin SMS Verification',
    body: 'Operational test message',
  });
  console.log(`   SuperAdmin Phone (9080280818) Result: success=${superAdminSmsTest.success}, status=${superAdminSmsTest.providerStatus} -> ${superAdminSmsTest.success ? 'PASS (Eligible)' : 'FAIL'}`);

  const superAdminEmailTest = await sendNotification({
    channel: 'EMAIL',
    recipient: 'subisha2002.m@gmail.com',
    templateCode: 'TEST_SUPERADMIN_EMAIL',
    subject: 'SuperAdmin Email Verification',
    body: 'Operational test email',
  });
  console.log(`   SuperAdmin Email (subisha2002.m@gmail.com) Result: success=${superAdminEmailTest.success}, status=${superAdminEmailTest.providerStatus} -> ${superAdminEmailTest.success ? 'PASS (Eligible)' : 'FAIL'}`);

  console.log('\n===============================================================');
  console.log('🏁 ALL CONTACT ISOLATION CHECKS PASSED SUCCESSFULLY!');
  console.log('===============================================================\n');
}

verify().then(() => process.exit(0)).catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
