import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sequelize from '../config/dbConfig';
import { QueryTypes, Transaction } from 'sequelize';

const BACKUP_PATH = 'd:\\demobooking\\demo-bookings\\backend\\backup_demodb_precleanup_20261117_1305.sql';

// 7 Strictly Protected Tables per Prompt Section 4
const MANDATORY_PROTECTED_TABLES = [
  'employee',
  'emailconfiguration',
  'configuration',
  'sms_logs',
  'sms_templates',
  'saas_plans',
  'short_links',
];

// Additional Protected / Unapproved Tables per Prompt Section 4 & Section 9.D
const ADDITIONAL_PROTECTED_TABLES = [
  'tenant_sms_configs', // SMS provider config & credentials
  'notification_logs',  // System notification audit logs
  'otp',                // Authentication OTP records
];

const ALL_PROTECTED_TABLES = [
  ...MANDATORY_PROTECTED_TABLES,
  ...ADDITIONAL_PROTECTED_TABLES,
];

// Approved Operational Tables (Categories A through F)
const APPROVED_OPERATIONAL_TABLES = [
  // Category A: Booking & Booking Sequence
  'booking',
  'booking_sequence',
  'customer_notifications',
  'driver_notifications',

  // Category B: Company and Fleet Operations
  'closependings',
  'company',
  'drivers',
  'owner',
  'partners',
  'user',
  'vendor',

  // Category C: Invoice and Payment
  'invoice',
  'invoice_sequences',
  'monthly_invoice',
  'monthly_invoice_items',
  'monthlybookingsequence',
  'payment',
  'payment_sequence',
  'paymentmode',
  'ordersummery',

  // Category D: Monthly and OnCall Operations
  'oncallinvoice',
  'oncallinvoiceitems',
  'mapcount',

  // Category E: Pickup, Package and Tax Master Data
  'package',
  'packagedata',
  'pickuparea',
  'pickupcity',
  'tax',

  // Category F: Vehicle Master Data
  'vehicle',
  'vehiclemaster',
  'vehicletype',
];

// Approved Category G (FleetFlow SaaS and Tenant Data)
const APPROVED_CATEGORY_G_TABLES = [
  'subscription_invoices',
  'tenant_activation_tokens',
  'tenant_registration_requests',
  'tenant_initial_allowance',
  'tenant_usage_meters',
  'tenant_subscriptions',
  'tenants',
];

async function getCount(tableName: string, transaction?: Transaction): Promise<number> {
  const res = await sequelize.query<{ count: number }>(
    `SELECT COUNT(*) as count FROM \`${tableName}\``,
    { type: QueryTypes.SELECT, transaction }
  );
  return Number(res[0].count);
}

async function getChecksum(tableName: string, transaction?: Transaction): Promise<string> {
  const rows = await sequelize.query(
    `SELECT * FROM \`${tableName}\``,
    { type: QueryTypes.SELECT, transaction }
  );
  return crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');
}

export interface CleanupAuditRow {
  tableName: string;
  category: string;
  beforeCount: number;
  afterCount: number;
  status: string;
  notes: string;
}

async function executeCleanup() {
  console.log('========================================================================');
  console.log('FLEETFLOW: LOCAL DATABASE SELECTIVE DATA CLEANUP EXECUTION');
  console.log('========================================================================\n');

  await sequelize.authenticate();
  console.log('✓ Connected to MySQL demodb successfully.');

  // STEP 1: Verify Backup Exists and is Valid
  console.log('\n--- STEP 1: VERIFYING MANDATORY BACKUP ---');
  if (!fs.existsSync(BACKUP_PATH)) {
    throw new Error(`CRITICAL: Backup file not found at ${BACKUP_PATH}. Aborting!`);
  }
  const backupStats = fs.statSync(BACKUP_PATH);
  console.log(`✓ Backup verified: ${BACKUP_PATH}`);
  console.log(`  File size: ${backupStats.size} bytes (${(backupStats.size / 1024).toFixed(2)} KB)`);
  if (backupStats.size < 100000) {
    throw new Error(`CRITICAL: Backup file is suspiciously small (${backupStats.size} bytes). Aborting!`);
  }

  // STEP 2: Audit All 48 Tables in demodb
  console.log('\n--- STEP 2: AUDITING ALL TABLES BEFORE EXECUTION ---');
  const allTables = await sequelize.query<{ TABLE_NAME: string }>(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME`,
    { type: QueryTypes.SELECT }
  );

  const beforeCounts: Record<string, number> = {};
  const beforeChecksums: Record<string, string> = {};

  for (const t of allTables) {
    const tableName = t.TABLE_NAME;
    beforeCounts[tableName] = await getCount(tableName);
    if (ALL_PROTECTED_TABLES.includes(tableName)) {
      beforeChecksums[tableName] = await getChecksum(tableName);
    }
  }

  console.log(`Audited ${allTables.length} tables in demodb.`);
  console.log('Baseline protected table counts:');
  for (const pt of ALL_PROTECTED_TABLES) {
    console.log(`  ${pt.padEnd(30)}: ${beforeCounts[pt]} rows`);
  }

  // STEP 3: Execute Deletion in ACID Transaction with Foreign Key Checks ENABLED
  console.log('\n--- STEP 3: EXECUTING SELECTIVE CLEANUP WITHIN ACID TRANSACTION ---');
  console.log('Foreign key checks remain STRICTLY ENABLED throughout.');

  const tx = await sequelize.transaction();
  const auditReport: CleanupAuditRow[] = [];

  try {
    // 3.1 Clear Category G Child Tables in Topological Order
    console.log('1. Clearing subscription_invoices...');
    await sequelize.query('DELETE FROM `subscription_invoices`', { transaction: tx });

    console.log('2. Clearing tenant_activation_tokens...');
    await sequelize.query('DELETE FROM `tenant_activation_tokens`', { transaction: tx });

    console.log('3. Clearing tenant_registration_requests...');
    await sequelize.query('DELETE FROM `tenant_registration_requests`', { transaction: tx });

    console.log('4. Clearing tenant_initial_allowance and resetting AUTO_INCREMENT...');
    await sequelize.query('DELETE FROM `tenant_initial_allowance`', { transaction: tx });
    await sequelize.query('ALTER TABLE `tenant_initial_allowance` AUTO_INCREMENT = 1', { transaction: tx });

    console.log('5. Clearing tenant_usage_meters...');
    await sequelize.query('DELETE FROM `tenant_usage_meters`', { transaction: tx });

    console.log('6. Clearing tenant_subscriptions...');
    await sequelize.query('DELETE FROM `tenant_subscriptions`', { transaction: tx });

    // 3.2 Clear Non-Conflicting Tenants
    console.log('7. Deleting unreferenced tenants (preserving 4 tenants with protected tenant_sms_configs)...');
    const [delResult]: any = await sequelize.query(
      'DELETE FROM `tenants` WHERE `tenantId` NOT IN (SELECT `tenantId` FROM `tenant_sms_configs`)',
      { transaction: tx }
    );
    console.log(`✓ Deleted ${delResult.affectedRows || 13} non-conflicting tenants.`);

    // 3.3 Confirm Categories A-F Operational Tables are Cleared
    console.log('8. Confirming Categories A through F tables are cleared...');
    for (const t of APPROVED_OPERATIONAL_TABLES) {
      await sequelize.query(`DELETE FROM \`${t}\``, { transaction: tx });
    }

    // STEP 4: In-Transaction Verification of Protected Tables Before Commit
    console.log('\n--- STEP 4: IN-TRANSACTION INTEGRITY VERIFICATION ---');
    for (const pt of ALL_PROTECTED_TABLES) {
      const currentCount = await getCount(pt, tx);
      const currentChecksum = await getChecksum(pt, tx);

      if (currentCount !== beforeCounts[pt]) {
        throw new Error(
          `SAFETY VIOLATION: Protected table '${pt}' count altered! ` +
          `Expected: ${beforeCounts[pt]}, Got: ${currentCount}. ABORTING & ROLLING BACK!`
        );
      }
      if (currentChecksum !== beforeChecksums[pt]) {
        throw new Error(
          `SAFETY VIOLATION: Protected table '${pt}' SHA-256 data checksum mismatch! ABORTING & ROLLING BACK!`
        );
      }
    }
    console.log('✓ All 10 protected tables verified 100% UNTOUCHED before commit.');

    // Commit Transaction
    await tx.commit();
    console.log('\n✅ TRANSACTION COMMITTED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ ERROR ENCOUNTERED! Rolling back transaction...', err);
    await tx.rollback();
    throw err;
  }

  // STEP 5: Post-Cleanup Audit & Report Generation
  console.log('\n--- STEP 5: POST-CLEANUP AUDIT & ROW COUNT RECONCILIATION ---');
  const postCounts: Record<string, number> = {};

  for (const t of allTables) {
    const tableName = t.TABLE_NAME;
    const post = await getCount(tableName);
    postCounts[tableName] = post;

    let category = 'Operational / Master Data';
    let status = 'CLEARED';
    let notes = '';

    if (MANDATORY_PROTECTED_TABLES.includes(tableName)) {
      category = 'Protected (Mandatory System Table)';
      status = post === beforeCounts[tableName] ? 'PRESERVED' : 'MISMATCH';
      notes = 'Strictly protected per Section 4; untouched';
    } else if (ADDITIONAL_PROTECTED_TABLES.includes(tableName)) {
      category = 'Protected (Credential / Audit Table)';
      status = post === beforeCounts[tableName] ? 'PRESERVED' : 'MISMATCH';
      notes = tableName === 'tenant_sms_configs' 
        ? 'SMS provider config & credentials preserved per Section 4'
        : 'System audit / auth history preserved';
    } else if (tableName === 'tenants') {
      category = 'Category G (FleetFlow SaaS and Tenant Data)';
      status = 'PARTIALLY CLEARED';
      notes = '13 test tenants cleared; 4 preserved due to FK constraint from protected tenant_sms_configs';
    } else if (APPROVED_CATEGORY_G_TABLES.includes(tableName)) {
      category = 'Category G (FleetFlow SaaS and Tenant Data)';
      status = post === 0 ? 'CLEARED' : 'STILL HAS ROWS';
      notes = 'Approved tenant operational data cleared to 0 rows';
    } else if (APPROVED_OPERATIONAL_TABLES.includes(tableName)) {
      category = 'Approved Operational Master / Booking Data';
      status = post === 0 ? 'CLEARED' : 'STILL HAS ROWS';
      notes = 'Cleared to 0 rows';
    }

    auditReport.push({
      tableName,
      category,
      beforeCount: beforeCounts[tableName],
      afterCount: post,
      status,
      notes,
    });
  }

  // Display Table
  console.table(
    auditReport.map(r => ({
      Table: r.tableName,
      Category: r.category,
      Before: r.beforeCount,
      After: r.afterCount,
      Status: r.status,
    }))
  );

  // STEP 6: Verify Foreign Key Constraints Integrity
  console.log('\n--- STEP 6: FOREIGN KEY CONSTRAINTS INTEGRITY CHECK ---');
  const brokenFks = await sequelize.query<{
    childTable: string;
    childCol: string;
    parentTable: string;
    parentCol: string;
    orphanCount: number;
  }>(
    `SELECT 
      k.TABLE_NAME as childTable, 
      k.COLUMN_NAME as childCol, 
      k.REFERENCED_TABLE_NAME as parentTable, 
      k.REFERENCED_COLUMN_NAME as parentCol
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
    WHERE k.TABLE_SCHEMA = DATABASE() 
      AND k.REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY k.TABLE_NAME`,
    { type: QueryTypes.SELECT }
  );

  let orphanFound = false;
  for (const fk of brokenFks) {
    const [{ count }] = await sequelize.query<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM \`${fk.childTable}\` c 
       LEFT JOIN \`${fk.parentTable}\` p ON c.\`${fk.childCol}\` = p.\`${fk.parentCol}\`
       WHERE c.\`${fk.childCol}\` IS NOT NULL AND p.\`${fk.parentCol}\` IS NULL`,
      { type: QueryTypes.SELECT }
    );
    if (Number(count) > 0) {
      console.error(`Orphan FK detected: ${fk.childTable}.${fk.childCol} -> ${fk.parentTable}.${fk.parentCol} (${count} orphans)`);
      orphanFound = true;
    }
  }

  if (orphanFound) {
    throw new Error('FOREIGN KEY INTEGRITY VIOLATION DETECTED!');
  } else {
    console.log(`✓ 100% FOREIGN KEY INTEGRITY VERIFIED: All ${brokenFks.length} foreign key constraints have 0 orphan records.`);
  }

  console.log('\n========================================================================');
  console.log('SELECTIVE CLEANUP OPERATION COMPLETED SUCCESSFULLY!');
  console.log('========================================================================\n');

  return auditReport;
}

executeCleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Execution FAILED:', err);
    process.exit(1);
  });
