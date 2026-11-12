/**
 * FLEETFLOW — CONTROLLED STANDALONE REAL EMAIL VERIFICATION SCRIPT
 *
 * SAFETY GUARDS:
 * 1. Strict explicit confirmation flag (--confirm-live-email) required.
 * 2. ONLY delivers to the authoritative SuperAdmin email in database / config.
 * 3. NEVER touches SMS, Twilio, or 2Factor gateways.
 * 4. Zero SMS side-effects guaranteed (SMS_MOCK_MODE=true strictly enforced).
 * 5. Guarantees EMAIL_MOCK_MODE is immediately restored to true.
 *
 * USAGE (When authorized by administrator):
 *   cd backend
 *   npx ts-node src/scripts/testSingleRealSuperAdminEmail.ts --confirm-live-email
 */

import dotenv from 'dotenv';
dotenv.config();

import { sequelize, Employee, Configuration, NotificationLog } from '../models';
import { getSmtpConfig, createSmtpTransporter, verifySmtpConnection } from '../services/emailConfServices';
import { ROOT_TENANT_ID } from '../context/tenantContext';

async function runControlledRealEmailTest() {
  const isConfirmed = process.argv.includes('--confirm-live-email');

  console.log('======================================================================');
  console.log('   FLEETFLOW — CONTROLLED REAL SUPERADMIN EMAIL DISPATCH SCRIPT');
  console.log('======================================================================\n');

  if (!isConfirmed) {
    console.log('⚠️  SAFETY GUARD ACTIVE: Live email dispatch NOT confirmed.');
    console.log('To execute a controlled real email dispatch to SuperAdmin, run:');
    console.log('   npx ts-node src/scripts/testSingleRealSuperAdminEmail.ts --confirm-live-email\n');
    console.log('Performing dry-run SMTP connectivity and readiness check instead...\n');
  }

  await sequelize.authenticate();
  console.log('✅ Connected to MySQL demodb.');

  // 1. Identify Authoritative SuperAdmin
  const rootAdmin = await Employee.findOne({
    where: { role: 'superadmin', tenantId: ROOT_TENANT_ID },
  });

  if (!rootAdmin) {
    throw new Error('Platform SuperAdmin employee record not found in database!');
  }

  const superAdminEmail = rootAdmin.email.trim().toLowerCase();
  console.log(`\n1. Target SuperAdmin Account:`);
  console.log(`   - Employee ID:  ${rootAdmin.employeeId}`);
  console.log(`   - Name:         ${rootAdmin.username}`);
  console.log(`   - Email:        ${superAdminEmail}`);
  console.log(`   - Role:         ${rootAdmin.role}`);

  // 2. Resolve SMTP Configuration
  console.log(`\n2. SMTP Configuration Audit:`);
  const smtpConfig = await getSmtpConfig();
  if (!smtpConfig) {
    console.error('❌ SMTP configuration incomplete in environment and database.');
    process.exit(1);
  }

  console.log(`   - Host:         ${smtpConfig.host}`);
  console.log(`   - Port:         ${smtpConfig.port}`);
  console.log(`   - Secure/TLS:   ${smtpConfig.secure ? 'SSL/TLS (Port 465)' : 'STARTTLS (Port 587)'}`);
  console.log(`   - Username:     ${smtpConfig.user}`);
  console.log(`   - Password:     ${smtpConfig.pass ? '[CONFIGURED & PRESENT - REDACTED]' : '[MISSING]'}`);
  console.log(`   - From Name:    ${smtpConfig.fromName}`);
  console.log(`   - From Address: ${smtpConfig.fromAddress}`);

  // 3. Verify SMTP Transporter Connection
  console.log(`\n3. Verifying SMTP Provider Handshake...`);
  const verifyRes = await verifySmtpConnection();
  if (!verifyRes.success) {
    console.error(`❌ SMTP Transporter Verification FAILED: ${verifyRes.error}`);
    process.exit(1);
  }
  console.log(`✅ SMTP Transporter: AUTHENTICATED & READY.`);

  if (!isConfirmed) {
    console.log('\n======================================================================');
    console.log('DRY-RUN STATUS: SMTP Server connection verified successfully.');
    console.log('NO REAL EMAIL WAS SENT (Authorization flag omitted).');
    console.log('======================================================================');
    await sequelize.close();
    return;
  }

  // 4. Controlled Real Dispatch to SuperAdmin
  console.log(`\n4. Dispatching Single Controlled Test Email to: ${superAdminEmail}...`);

  // Ensure SMS mock mode remains strictly true so zero SMS can be triggered
  process.env.SMS_MOCK_MODE = 'true';
  const previousEmailMock = process.env.EMAIL_MOCK_MODE;
  process.env.EMAIL_MOCK_MODE = 'false';

  try {
    const transporter = createSmtpTransporter(smtpConfig);
    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const info = await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromAddress || smtpConfig.user}>`,
      to: superAdminEmail,
      subject: 'FleetFlow Controlled Test: SuperAdmin Verification Email',
      html: `
        <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #6d28d9; margin-top: 0;">FleetFlow Platform Email Verification</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Hello <strong>${rootAdmin.username}</strong>,
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            This is an authorized, controlled SMTP delivery test from your FleetFlow Mobility Platform backend.
          </p>
          <div style="background: #f8fafc; border-left: 4px solid #6d28d9; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold;">Verification Code</p>
            <p style="margin: 8px 0 0; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1e293b;">${testOtp}</p>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
            Timestamp: ${new Date().toISOString()} | Host: ${smtpConfig.host} | Port: ${smtpConfig.port}
          </p>
        </div>
      `,
    });

    console.log(`✅ Live Email Successfully Delivered to Provider!`);
    console.log(`   - Message ID:  ${info.messageId}`);
    console.log(`   - Response:    ${info.response}`);
    console.log(`   - Accepted:    ${JSON.stringify(info.accepted)}`);

    // Record audit entry in NotificationLog
    await NotificationLog.create({
      channel: 'EMAIL',
      recipient: superAdminEmail,
      templateCode: 'SUPERADMIN_CONTROLLED_REAL_TEST',
      tenantId: ROOT_TENANT_ID,
      providerStatus: 'SENT',
      providerMessageId: info.messageId,
      metadata: {
        accepted: info.accepted,
        response: info.response,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`✅ Audit Log saved to demodb.notification_logs.`);
  } catch (sendErr: any) {
    console.error(`❌ Real Email Dispatch FAILED:`, sendErr.message || sendErr);
    process.exit(1);
  } finally {
    // Guarantees EMAIL_MOCK_MODE is immediately restored
    process.env.EMAIL_MOCK_MODE = previousEmailMock || 'true';
    console.log(`🔒 EMAIL_MOCK_MODE restored to: "${process.env.EMAIL_MOCK_MODE}"`);
    console.log(`🔒 SMS_MOCK_MODE remains active: "${process.env.SMS_MOCK_MODE}"`);
  }

  await sequelize.close();
  console.log('\n======================================================================');
  console.log('REAL EMAIL DISPATCH COMPLETE.');
  console.log('======================================================================');
}

runControlledRealEmailTest().catch((err) => {
  console.error('Script Error:', err);
  process.exit(1);
});

