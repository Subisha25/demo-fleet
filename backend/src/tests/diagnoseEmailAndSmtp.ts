import nodemailer from 'nodemailer';
import sequelize from '../config/dbConfig';
import config from '../config/config';
import { Employee } from '../models/employee';
import { User } from '../models/user';
import { NotificationLog } from '../models/notificationLog';

async function diagnose() {
  console.log('=== EMAIL & NOTIFICATION SYSTEM DIAGNOSTIC ===');
  await sequelize.authenticate();

  // 1. Authorized SuperAdmin accounts
  const superEmployees = await Employee.findAll({
    where: { role: 'superadmin' },
    attributes: ['employeeId', 'username', 'email', 'phno', 'role', 'tenantId']
  });
  console.log('\n[1] SuperAdmin Employees in DB:');
  superEmployees.forEach(e => {
    console.log(`  - Username: ${e.username}, Email: ${e.email}, Phone: ${e.phno}, TenantId: ${e.tenantId}`);
  });

  const superUsers = await User.findAll({
    where: { role: 'superadmin' },
    attributes: ['userId', 'username', 'email', 'mobile', 'role', 'tenantId']
  });
  console.log('\n[2] SuperAdmin Users in DB:');
  superUsers.forEach(u => {
    console.log(`  - Username: ${u.username}, Email: ${u.email}, Mobile: ${u.mobile}, TenantId: ${u.tenantId}`);
  });

  // 2. SMTP Config Inspection (safe, no secrets)
  const smtpServer = config.sendmail?.smtp_server;
  const smtpEmail = config.sendmail?.smtp_email;
  const smtpPort = config.sendmail?.smtp_port;
  const hasPassword = Boolean(config.sendmail?.smtp_password && config.sendmail.smtp_password.length > 0);

  console.log('\n[3] SMTP Configuration:');
  console.log(`  - Host/Server: ${smtpServer || '(not set)'}`);
  console.log(`  - Port: ${smtpPort || '(not set)'}`);
  console.log(`  - Sender Email: ${smtpEmail || '(not set)'}`);
  console.log(`  - Has Password: ${hasPassword ? 'YES (configured)' : 'NO (missing)'}`);

  // 3. Test SMTP Connection / Transporter Verification
  if (smtpServer && smtpEmail && hasPassword) {
    console.log('\n[4] Testing SMTP Transporter Verification (transporter.verify)...');
    try {
      const transporter = nodemailer.createTransport({
        host: smtpServer,
        port: smtpPort || 587,
        secure: smtpPort === 465,
        auth: {
          user: smtpEmail,
          pass: config.sendmail.smtp_password,
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
      });

      const verifyResult = await transporter.verify();
      console.log('  ✅ SMTP Server connection verified successfully!', verifyResult);
    } catch (smtpErr: any) {
      console.log('  ❌ SMTP Verification failed:');
      console.log(`     Error Code: ${smtpErr.code || 'UNKNOWN'}`);
      console.log(`     Error Command: ${smtpErr.command || 'UNKNOWN'}`);
      console.log(`     Error Message: ${smtpErr.message}`);
    }
  } else {
    console.log('\n[4] SMTP Transporter Verification SKIPPED: Missing required SMTP credentials.');
  }

  // 4. Inspect Notification Logs
  const recentLogs = await NotificationLog.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
  });
  console.log(`\n[5] Recent Notification Logs (Total inspected: ${recentLogs.length}):`);
  recentLogs.forEach(l => {
    console.log(`  [${l.createdAt}] [${l.channel}] Template: ${l.templateCode} | Recipient: ${l.recipient} | Status: ${l.providerStatus} | MsgId: ${l.providerMessageId || 'N/A'}`);
    if (l.errorDetails) {
      console.log(`    Error Details: ${l.errorDetails}`);
    }
  });

  await sequelize.close();
  process.exit(0);
}

diagnose().catch(err => {
  console.error('Fatal diagnostic error:', err);
  process.exit(1);
});
