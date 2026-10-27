import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function auditDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'demodb',
  });

  console.log('================================================================================');
  console.log('               PHASE 1: AUDIT OF ALL TABLES IN DEMODB');
  console.log('================================================================================\n');

  const [tables]: any = await conn.query('SHOW TABLES');
  const tableNames: string[] = tables.map((t: any) => Object.values(t)[0]);

  console.log(`Found ${tableNames.length} tables in demodb.\n`);

  // 1. Row counts of all tables
  const rowCounts: Record<string, number> = {};
  for (const tableName of tableNames) {
    try {
      const [res]: any = await conn.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
      rowCounts[tableName] = res[0].cnt;
    } catch (err: any) {
      rowCounts[tableName] = -1;
    }
  }

  console.log('TABLE ROW COUNTS:');
  console.log('--------------------------------------------------------------------------------');
  for (const [table, count] of Object.entries(rowCounts).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${table.padEnd(32)} : ${count} rows`);
  }

  // 2. Foreign Key Dependencies
  console.log('\n--------------------------------------------------------------------------------');
  console.log('FOREIGN KEY CONSTRAINTS (PARENT -> CHILD DEPENDENCIES):');
  console.log('--------------------------------------------------------------------------------');
  const [fks]: any = await conn.query(`
    SELECT 
      TABLE_NAME, 
      COLUMN_NAME, 
      CONSTRAINT_NAME, 
      REFERENCED_TABLE_NAME, 
      REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'demodb' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY REFERENCED_TABLE_NAME, TABLE_NAME;
  `);

  if (fks.length === 0) {
    console.log('  No foreign key constraints defined in INFORMATION_SCHEMA.');
  } else {
    for (const fk of fks) {
      console.log(`  Child [${fk.TABLE_NAME}.${fk.COLUMN_NAME}] -> References Parent [${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}] (FK: ${fk.CONSTRAINT_NAME})`);
    }
  }

  // 3. Inspect Protected Tables
  console.log('\n--------------------------------------------------------------------------------');
  console.log('INSPECTING PROTECTED TABLES:');
  console.log('--------------------------------------------------------------------------------');
  
  // A. configuration
  const [configs]: any = await conn.query('SELECT * FROM configuration');
  console.log(`\nProtected Table [configuration]: ${configs.length} row(s)`);
  if (configs.length > 0) {
    const c = configs[0];
    console.log(`  ID: ${c.id || c.configurationId}, SMTP: ${c.smtpServer}, User: ${c.smtpEmailAddress}, Port: ${c.smtpEmailPort}`);
  }

  // B. emailconfiguration
  const [emailConfigs]: any = await conn.query('SELECT COUNT(*) as cnt FROM emailconfiguration');
  console.log(`\nProtected Table [emailconfiguration]: ${emailConfigs[0].cnt} template row(s)`);

  // C. short_links (and check if shortlinks exists)
  const hasShortLinks = tableNames.includes('short_links');
  const hasShortlinks = tableNames.includes('shortlinks');
  console.log(`\nProtected Table [shortlinks check]: short_links exists? ${hasShortLinks} (${rowCounts['short_links']} rows), shortlinks exists? ${hasShortlinks}`);

  // D. sms_logs and notification_logs
  const hasSmsLogs = tableNames.includes('sms_logs');
  const hasNotificationLogs = tableNames.includes('notification_logs');
  console.log(`\nProtected Table [sms_logs / notification_logs check]:`);
  console.log(`  - sms_logs exists: ${hasSmsLogs} (${rowCounts['sms_logs'] || 0} rows)`);
  console.log(`  - notification_logs exists: ${hasNotificationLogs} (${rowCounts['notification_logs'] || 0} rows)`);
  if (hasSmsLogs && rowCounts['sms_logs'] > 0) {
    const [sampleSms]: any = await conn.query('SELECT * FROM sms_logs LIMIT 2');
    console.log('  Sample sms_logs:', sampleSms);
  }

  // 4. Inspect System Identity Tables
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SYSTEM IDENTITIES & ESSENTIAL PLATFORM DATA:');
  console.log('--------------------------------------------------------------------------------');

  // Employee (SuperAdmin)
  const [superAdmins]: any = await conn.query("SELECT employeeId, username, email, phno, role, tenantId FROM employee WHERE role = 'superadmin'");
  console.log(`SuperAdmin Employees (${superAdmins.length}):`, superAdmins);

  const [allEmployees]: any = await conn.query("SELECT employeeId, username, email, role, tenantId FROM employee");
  console.log(`Total Employees in employee table: ${allEmployees.length}`);

  // Root Tenant
  const [rootTenants]: any = await conn.query("SELECT tenantId, name, code, status, planTier, contactEmail FROM tenants WHERE tenantId = 'e7b8a1c0-0000-0000-0000-000000000001' OR code = 'GC'");
  console.log(`Root Platform Tenant (${rootTenants.length}):`, rootTenants);

  const [allTenants]: any = await conn.query("SELECT tenantId, name, code, status, planTier FROM tenants");
  console.log(`Total Tenants in tenants table: ${allTenants.length} (Root: 1, Demo/Customer Fleets: ${allTenants.length - 1})`);

  // SaaS Plans
  const [plans]: any = await conn.query("SELECT planId, planTier, name, priceMonthlyINR, isActive FROM saas_plans");
  console.log(`SaaS Plans (${plans.length}):`, plans);

  await conn.end();
}

auditDatabase().catch(console.error);
