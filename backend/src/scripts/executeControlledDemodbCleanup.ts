import fs from 'fs';
import path from 'path';
import sequelize from '../config/dbConfig';
import { QueryTypes, Transaction } from 'sequelize';

const BACKUP_PATH = 'd:\\demobooking\\demo-bookings\\backend\\backup_demodb_precleanup_20261117_1215.sql';

// Mandatory Protected Tables per Prompt Section 7
const MANDATORY_PROTECTED_TABLES = [
  'employee',
  'emailconfiguration',
  'configuration',
  'sms_logs',
  'sms_templates',
  'short_links',
  'saas_plans',
];

// Additional SaaS Architecture & System Tables protected per Prompt Section 7
const SAAS_SYSTEM_PROTECTED_TABLES = [
  'tenants',
  'tenant_subscriptions',
  'tenant_activation_tokens',
  'tenant_registration_requests',
  'tenant_sms_configs',
  'tenant_initial_allowance',
  'tenant_usage_meters',
  'subscription_invoices',
  'notification_logs',
  'otp',
];

const ALL_PROTECTED_TABLES = [
  ...MANDATORY_PROTECTED_TABLES,
  ...SAAS_SYSTEM_PROTECTED_TABLES,
];

// Approved Operational Tables for Clearing per Prompt Section 6
const APPROVED_OPERATIONAL_TABLES_ORDERED = [
  // 1. Child invoice / booking items
  'monthly_invoice_items',
  'oncallinvoiceitems',
  
  // 2. Billing & order closing
  'closependings',
  'payment',
  'invoice',
  'monthly_invoice',
  'oncallinvoice',
  
  // 3. Bookings
  'booking',
  'ordersummery',
  
  // 4. Sequences & counters
  'booking_sequence',
  'invoice_sequences',
  'payment_sequence',
  'monthlybookingsequence',
  'mapcount',
  
  // 5. Packages
  'packagedata',
  'package',
  
  // 6. Vehicles, drivers, vendors
  'vehiclemaster',
  'vehicle',
  'drivers',
  
  // 7. Corporate clients & users
  'user',
  'company',
  'vendor',
  
  // 8. Operational master data
  'tax',
  'pickuparea',
  'pickupcity',
  'paymentmode',
  'vehicletype',
  
  // 9. Operational notifications & partners
  'customer_notifications',
  'driver_notifications',
  'owner',
  'partners',
];

async function getCount(tableName: string, transaction?: Transaction): Promise<number> {
  const rows: any = await sequelize.query(
    `SELECT COUNT(*) as cnt FROM \`${tableName}\``,
    { type: QueryTypes.SELECT, transaction }
  );
  return Number(rows[0]?.cnt || 0);
}

async function runCleanup() {
  console.log('========================================================================');
  console.log('FLEETFLOW: CONTROLLED DEMODB OPERATIONAL DATA CLEANUP');
  console.log('========================================================================\n');

  // 1. Verify Active Database
  const [dbRow]: any = await sequelize.query('SELECT DATABASE() as dbName', { type: QueryTypes.SELECT });
  const activeDb = dbRow?.dbName;
  console.log(`Active Database: ${activeDb}`);
  if (activeDb !== 'demodb') {
    throw new Error(`CRITICAL: Expected active database to be 'demodb', found '${activeDb}'! Aborting.`);
  }

  // 2. Verify Backup File
  console.log(`\nChecking verified backup at: ${BACKUP_PATH}`);
  if (!fs.existsSync(BACKUP_PATH)) {
    throw new Error(`CRITICAL: Verified backup not found at ${BACKUP_PATH}! Aborting.`);
  }
  const backupStats = fs.statSync(BACKUP_PATH);
  console.log(`✓ Backup verified: ${backupStats.size} bytes (${(backupStats.size / 1024).toFixed(2)} KB)`);
  if (backupStats.size < 100000) {
    throw new Error(`CRITICAL: Backup file is smaller than expected (${backupStats.size} bytes)! Aborting.`);
  }

  // 3. Pre-cleanup audit of all tables in demodb
  const tablesResult: any = await sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'demodb' ORDER BY TABLE_NAME`,
    { type: QueryTypes.SELECT }
  );
  const allTables: string[] = tablesResult.map((r: any) => r.TABLE_NAME);
  console.log(`\nAuditing all ${allTables.length} tables in demodb pre-cleanup...`);

  const beforeCounts: Record<string, number> = {};
  for (const t of allTables) {
    beforeCounts[t] = await getCount(t);
  }

  console.log('\n--- Pre-Cleanup Baseline Counts of Mandatory Protected Tables ---');
  for (const t of MANDATORY_PROTECTED_TABLES) {
    console.log(`  ${t.padEnd(25)} : ${beforeCounts[t]}`);
  }

  console.log('\n--- Pre-Cleanup Baseline Counts of SaaS System Protected Tables ---');
  for (const t of SAAS_SYSTEM_PROTECTED_TABLES) {
    console.log(`  ${t.padEnd(30)} : ${beforeCounts[t]}`);
  }

  // 4. Begin ACID Transaction
  console.log('\nStarting database transaction...');
  const t = await sequelize.transaction();

  try {
    console.log('\nClearing approved operational tables in strict FK dependency order:');
    for (const tableName of APPROVED_OPERATIONAL_TABLES_ORDERED) {
      const countBefore = beforeCounts[tableName];
      process.stdout.write(`  Clearing ${tableName.padEnd(30)} (before: ${countBefore})... `);
      await sequelize.query(`DELETE FROM \`${tableName}\``, { transaction: t });
      const countInTx = await getCount(tableName, t);
      console.log(`done (remaining: ${countInTx})`);
    }

    // 5. In-Transaction Safety Validation of All Protected Tables
    console.log('\nValidating all protected tables before commit...');
    for (const protTable of ALL_PROTECTED_TABLES) {
      const currentInTx = await getCount(protTable, t);
      const expected = beforeCounts[protTable];
      if (currentInTx !== expected) {
        throw new Error(
          `CRITICAL SAFETY VIOLATION: Protected table '${protTable}' row count changed! Expected: ${expected}, Current: ${currentInTx}. ROLLING BACK!`
        );
      }
    }
    console.log('✓ All protected table counts exactly match baseline!');

    // 6. Commit Transaction
    console.log('\nCommitting transaction...');
    await t.commit();
    console.log('✓ Transaction committed successfully!\n');
  } catch (err) {
    console.error('❌ Error during cleanup! Rolling back transaction...', err);
    await t.rollback();
    throw err;
  }

  // 7. Post-Cleanup Full Verification
  console.log('========================================================================');
  console.log('POST-CLEANUP TABLE RECONCILIATION AUDIT');
  console.log('========================================================================');

  const afterCounts: Record<string, number> = {};
  for (const t of allTables) {
    afterCounts[t] = await getCount(t);
  }

  console.log(
    'Table Name'.padEnd(32) +
    'Category'.padEnd(20) +
    'Before'.padStart(8) +
    'After'.padStart(8) +
    'Deleted'.padStart(9) +
    '  ' + 'Status'
  );
  console.log('-'.repeat(90));

  let totalDeleted = 0;
  for (const tableName of allTables) {
    const before = beforeCounts[tableName];
    const after = afterCounts[tableName];
    const deleted = before - after;
    totalDeleted += deleted;

    let category = 'UNKNOWN';
    let status = 'OK';

    if (MANDATORY_PROTECTED_TABLES.includes(tableName)) {
      category = 'MANDATORY_PROTECTED';
      status = (before === after) ? 'PRESERVED ✓' : 'VIOLATION ❌';
    } else if (SAAS_SYSTEM_PROTECTED_TABLES.includes(tableName)) {
      category = 'SAAS_PROTECTED';
      status = (before === after) ? 'PRESERVED ✓' : 'VIOLATION ❌';
    } else if (APPROVED_OPERATIONAL_TABLES_ORDERED.includes(tableName)) {
      category = 'APPROVED_CLEARED';
      status = (after === 0) ? 'CLEARED ✓' : 'UNCLEARED ❌';
    }

    console.log(
      tableName.padEnd(32) +
      category.padEnd(20) +
      String(before).padStart(8) +
      String(after).padStart(8) +
      String(deleted).padStart(9) +
      '  ' + status
    );
  }

  console.log('-'.repeat(90));
  console.log(`TOTAL ROWS DELETED ACROSS OPERATIONAL TABLES: ${totalDeleted}`);
  console.log('========================================================================\n');

  // Final assertions
  for (const protTable of ALL_PROTECTED_TABLES) {
    if (afterCounts[protTable] !== beforeCounts[protTable]) {
      throw new Error(`CRITICAL: Protected table '${protTable}' row count changed post-commit!`);
    }
  }

  for (const clearedTable of APPROVED_OPERATIONAL_TABLES_ORDERED) {
    if (afterCounts[clearedTable] !== 0) {
      throw new Error(`CRITICAL: Approved table '${clearedTable}' was not completely cleared (remaining: ${afterCounts[clearedTable]})!`);
    }
  }

  console.log('🎉 ALL OPERATIONAL TABLES CLEARED AND ALL PROTECTED TABLES 100% PRESERVED!');
  process.exit(0);
}

runCleanup().catch((err) => {
  console.error('\n❌ Cleanup execution failed:', err);
  process.exit(1);
});
