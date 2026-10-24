import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import nodemailer from 'nodemailer';
import { getSuperAdminEmail } from '../services/notificationService';
import sequelize from '../config/dbConfig';
import { NotificationLog } from '../models/notificationLog';

async function testGmail() {
  console.log('\n===============================================================');
  console.log('         GMAIL SMTP AUTHENTICATION & DELIVERY TEST');
  console.log('===============================================================\n');

  await sequelize.authenticate();

  const superAdminEmail = await getSuperAdminEmail();
  console.log(`Configured SuperAdmin Recipient: ${superAdminEmail}`);

  const smtpServer = (process.env.SMTP_SERVER || '').trim();
  const smtpPort = Number(process.env.SMTP_EMAIL_PORT || 587);
  const smtpUser = (process.env.SMTP_EMAIL_ADDRESS || '').trim();
  const smtpPass = (process.env.SMTP_EMAIL_PASSWORD || '').trim();

  console.log(`SMTP Host:   ${smtpServer}`);
  console.log(`SMTP Port:   ${smtpPort}`);
  console.log(`Sender User: ${smtpUser}`);
  console.log(`Password:    ${smtpPass ? 'PRESENT (' + smtpPass.length + ' chars)' : 'MISSING'}`);

  if (!smtpServer || !smtpUser || !smtpPass) {
    console.error('ERROR: Gmail SMTP credentials incomplete in backend/.env');
    process.exit(1);
  }

  // Gmail works on port 587 (STARTTLS) or port 465 (SSL/TLS)
  const isSecure = smtpPort === 465;
  console.log(`Connection Security: ${isSecure ? 'SSL/TLS (port 465)' : 'STARTTLS (port ' + smtpPort + ')'}`);

  const transporter = nodemailer.createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: isSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
  });

  console.log('\n--- Step 1: Testing SMTP Connection & Authentication Handshake ---');
  try {
    await transporter.verify();
    console.log('✅ SMTP AUTHENTICATION SUCCESSFUL: Google accepted credentials.');
  } catch (verifyErr: any) {
    console.error('❌ SMTP AUTHENTICATION FAILED:', verifyErr.message);
    process.exit(1);
  }

  console.log('\n--- Step 2: Sending Real Test Message to SuperAdmin ---');
  try {
    const timestamp = new Date().toISOString();
    const info = await transporter.sendMail({
      from: `"Grace Cabs Mobility SaaS" <${smtpUser}>`,
      to: superAdminEmail,
      subject: `[GMAIL SMTP VERIFIED] Grace Cabs SuperAdmin Alert Test (${new Date().toLocaleTimeString()})`,
      text: `Hello SuperAdmin,\n\nThis is a real diagnostic test email dispatched via Gmail SMTP (smtp.gmail.com) to verify actual provider acceptance.\n\nSender: ${smtpUser}\nRecipient: ${superAdminEmail}\nTimestamp: ${timestamp}\n\nProvider Status: ACCEPTED`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FAF8F5; border: 1px solid #E0DAD1; border-radius: 10px;">
          <h2 style="color: #C04E24; margin-top: 0;">Grace Cabs Mobility — SuperAdmin Email Verification</h2>
          <p style="color: #2B2927; font-size: 15px; line-height: 1.5;">
            This email confirms successful <strong>Gmail SMTP transmission</strong> from <code>${smtpUser}</code> to <code>${superAdminEmail}</code>.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #E0DAD1; font-weight: bold; width: 140px;">Provider:</td><td style="padding: 8px; border-bottom: 1px solid #E0DAD1;">smtp.gmail.com</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E0DAD1; font-weight: bold;">Authenticated User:</td><td style="padding: 8px; border-bottom: 1px solid #E0DAD1;">${smtpUser}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E0DAD1; font-weight: bold;">Recipient:</td><td style="padding: 8px; border-bottom: 1px solid #E0DAD1;">${superAdminEmail}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #E0DAD1; font-weight: bold;">Timestamp:</td><td style="padding: 8px; border-bottom: 1px solid #E0DAD1;">${timestamp}</td></tr>
          </table>
          <p style="color: #7A7570; font-size: 12px; margin-bottom: 0;">Automated operational test from Grace Cabs Mobility Platform.</p>
        </div>
      `,
    });

    console.log('✅ PROVIDER ACCEPTANCE CONFIRMED:');
    console.log(`   Message-ID: ${info.messageId}`);
    console.log(`   Accepted Recipients: ${JSON.stringify(info.accepted)}`);
    console.log(`   Rejected Recipients: ${JSON.stringify(info.rejected)}`);
    console.log(`   SMTP Server Response: ${info.response}`);

    // Persist to NotificationLog
    await NotificationLog.create({
      channel: 'EMAIL',
      recipient: superAdminEmail,
      templateCode: 'GMAIL_SMTP_VERIFICATION',
      providerStatus: 'SENT',
      providerMessageId: info.messageId,
      errorDetails: null,
      metadata: {
        host: smtpServer,
        sender: smtpUser,
        response: info.response,
      },
    });

    console.log('\n--- Step 3: Inbox Delivery Distinction ---');
    console.log('   Provider State: ACCEPTED (Google mail servers queued the message for delivery)');
    console.log(`   Destination: ${superAdminEmail}`);
    console.log('   NOTE: Provider acceptance proves Gmail SMTP accepted and forwarded the email.');
    console.log('   Actual inbox delivery depends on recipient mail client delivery and spam/filter settings.');
    console.log('\n===============================================================');
    console.log('                      TEST RESULT: PASS');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (sendErr: any) {
    console.error('❌ EMAIL SENDING FAILED:', sendErr.message);
    process.exit(1);
  }
}

testGmail().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
