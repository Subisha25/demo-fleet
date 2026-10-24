import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function main() {
  console.log('[Setup] Starting SuperAdmin & SMTP Synchronization...');

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'demodb',
    port: Number(process.env.DB_PORT) || 3306,
  });

  try {
    // 1. Fetch valid SMTP password from configuration table
    const [confRows]: any = await db.query(
      'SELECT smtpServer, smtpEmailAddress, smtpEmailPassword, smtpEmailPort FROM configuration LIMIT 1'
    );

    let activeSmtpPass = '';
    if (confRows && confRows.length > 0 && confRows[0].smtpEmailPassword) {
      activeSmtpPass = confRows[0].smtpEmailPassword;
      console.log('  -> Found working SMTP password in configuration table.');
    }

    // 2. Synchronize .env file with GoDaddy SMTP & SuperAdmin email without printing password
    const envPath = path.join(__dirname, '../../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    const updateOrAddKey = (key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    };

    updateOrAddKey('SMTP_SERVER', 'smtpout.secureserver.net');
    updateOrAddKey('SMTP_HOST', 'smtpout.secureserver.net');
    updateOrAddKey('SMTP_EMAIL_ADDRESS', 'traveldesk@gracecabs.com');
    updateOrAddKey('SMTP_USER', 'traveldesk@gracecabs.com');
    updateOrAddKey('SMTP_EMAIL_PORT', '587');
    updateOrAddKey('SMTP_PORT', '587');
    updateOrAddKey('SMTP_SECURE', 'false');
    updateOrAddKey('SUPERADMIN_EMAIL', 'subisha2002.m@gmail.com');

    if (activeSmtpPass) {
      updateOrAddKey('SMTP_EMAIL_PASSWORD', activeSmtpPass);
      updateOrAddKey('SMTP_PASS', activeSmtpPass);
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('  -> backend/.env updated with GoDaddy SMTP parameters and SUPERADMIN_EMAIL.');

    // 3. Test SMTP transporter verification directly
    if (activeSmtpPass) {
      const transporter = nodemailer.createTransport({
        host: 'smtpout.secureserver.net',
        port: 587,
        secure: false,
        auth: {
          user: 'traveldesk@gracecabs.com',
          pass: activeSmtpPass,
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
      });

      try {
        await transporter.verify();
        console.log('  -> SMTP transporter verify SUCCESS on smtpout.secureserver.net:587!');
      } catch (smtpErr: any) {
        console.error('  -> SMTP transporter verify FAILED:', smtpErr.message);
      }
    }

    // 4. Update / verify SuperAdmin account in Employee table
    const targetEmail = 'subisha2002.m@gmail.com';
    const rawPass = 'superadmin@123';
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const [existingSuper]: any = await db.query(
      "SELECT employeeId, email, role, tenantId FROM employee WHERE role = 'superadmin' AND tenantId = 'e7b8a1c0-0000-0000-0000-000000000001'"
    );

    if (existingSuper && existingSuper.length > 0) {
      const superEmp = existingSuper[0];
      console.log(`  -> Updating existing SuperAdmin (${superEmp.employeeId}) to ${targetEmail}`);
      await db.query(
        'UPDATE employee SET email = ?, password = ?, username = ? WHERE employeeId = ?',
        [targetEmail, hashedPassword, 'Super Admin', superEmp.employeeId]
      );
    } else {
      console.log('  -> Creating new SuperAdmin account in employee table...');
      const { v4: uuidv4 } = require('uuid');
      await db.query(
        "INSERT INTO employee (employeeId, username, email, phno, password, role, tenantId, createdAt) VALUES (?, ?, ?, ?, ?, 'superadmin', 'e7b8a1c0-0000-0000-0000-000000000001', NOW())",
        [uuidv4(), 'Super Admin', targetEmail, '9999900001', hashedPassword]
      );
    }

    // Also update any user table record for subisha to match
    await db.query(
      "UPDATE user SET email = ?, password = ? WHERE email = 'subisha2002.m@gmail.com' OR email = ?",
      [targetEmail, hashedPassword, targetEmail]
    );

    // 5. Verify the updated credentials via bcrypt compare
    const [verifyRows]: any = await db.query(
      'SELECT employeeId, email, role, password, tenantId FROM employee WHERE email = ?',
      [targetEmail]
    );

    if (verifyRows.length > 0) {
      const isMatch = await bcrypt.compare(rawPass, verifyRows[0].password);
      console.log(`  -> SuperAdmin account verified: email=${verifyRows[0].email}, role=${verifyRows[0].role}, passwordMatches=${isMatch}`);
    }

    console.log('[Setup] SuperAdmin & SMTP configuration completed successfully.');
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error('[Setup] Fatal error:', err);
  process.exit(1);
});
