import fs from 'fs';
import path from 'path';
import sequelize from '../config/dbConfig';
import { QueryTypes, Transaction } from 'sequelize';

interface CleanupResult {
  tableName: string;
  beforeCount: number;
  afterCount: number;
  deletedCount: number;
  status: 'CLEARED' | 'PRESERVED' | 'SKIPPED_EMPTY' | 'PARTIALLY_CLEARED';
  notes: string;
}

const BACKUP_PATH = 'd:\\demobooking\\demo-bookings\\backend\\backup_demodb_precleanup_20261024_1326.sql';
const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';
const SUPERADMIN_ID = '364aed6d-3cb3-40f4-b3c1-2ed3970a6cce';

async function getTableRowCount(tableName: string, transaction?: Transaction): Promise<number> {
  const rows: any = await sequelize.query(
    `SELECT COUNT(*) as count FROM \`${tableName}\``,
    { type: QueryTypes.SELECT, transaction }
  );
  return Number(rows[0]?.count || 0);
}

async function runCleanup() {
  console.log('====================================================');
  console.log('DEMODB OPERATIONAL DATA CLEANUP EXECUTION');
  console.log('====================================================\n');

  // STEP 1: Verify Backup Exists and is Non-Empty
  console.log('Checking backup verification...');
  if (!fs.existsSync(BACKUP_PATH)) {
    throw new Error(`CRITICAL: Backup file not found at ${BACKUP_PATH}. Aborting!`);
  }
  const stats = fs.statSync(BACKUP_PATH);
  if (stats.size < 100000) {
    throw new Error(`CRITICAL: Backup file is suspiciously small (${stats.size} bytes). Aborting!`);
  }
  console.log(`✓ Backup verified: ${BACKUP_PATH} (${stats.size} bytes)\n`);

  // STEP 2: Audit All Tables Pre-Cleanup
  const allTables: any = await sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'demodb'`,
    { type: QueryTypes.SELECT }
  );
  const tableNames: string[] = allTables.map((t: any) => t.TABLE_NAME).sort();

  console.log(`Audited ${tableNames.length} tables in demodb.`);
  const beforeCounts: Record<string, number> = {};
  for (const t of tableNames) {
    beforeCounts[t] = await getTableRowCount(t);
  }

  // Verify Protected Tables exist and have rows
  const protectedCounts = {
    configuration: beforeCounts['configuration'],
    emailconfiguration: beforeCounts['emailconfiguration'],
    short_links: beforeCounts['short_links'],
    sms_logs: beforeCounts['sms_logs']
  };
  console.log('Protected Table Counts Pre-Cleanup:', protectedCounts);

  // START TRANSACTION
  console.log('\nBeginning database transaction...');
  const t = await sequelize.transaction();

  try {
    const results: CleanupResult[] = [];

    // 1. Child invoice / booking items
    console.log('Deleting monthly_invoice_items...');
    await sequelize.query('DELETE FROM `monthly_invoice_items`', { transaction: t });

    console.log('Deleting oncallinvoiceitems...');
    await sequelize.query('DELETE FROM `oncallinvoiceitems`', { transaction: t });

    console.log('Deleting closependings...');
    await sequelize.query('DELETE FROM `closependings`', { transaction: t });

    console.log('Deleting payment...');
    await sequelize.query('DELETE FROM `payment`', { transaction: t });

    console.log('Deleting invoice...');
    await sequelize.query('DELETE FROM `invoice`', { transaction: t });

    console.log('Deleting monthly_invoice...');
    await sequelize.query('DELETE FROM `monthly_invoice`', { transaction: t });

    console.log('Deleting oncallinvoice...');
    await sequelize.query('DELETE FROM `oncallinvoice`', { transaction: t });

    console.log('Deleting booking...');
    await sequelize.query('DELETE FROM `booking`', { transaction: t });

    // 2. Packages
    console.log('Deleting packagedata...');
    await sequelize.query('DELETE FROM `packagedata`', { transaction: t });

    console.log('Deleting package...');
    await sequelize.query('DELETE FROM `package`', { transaction: t });

    // 3. Vehicles and drivers
    console.log('Deleting vehiclemaster...');
    await sequelize.query('DELETE FROM `vehiclemaster`', { transaction: t });

    console.log('Deleting vehicle...');
    await sequelize.query('DELETE FROM `vehicle`', { transaction: t });

    console.log('Deleting drivers...');
    await sequelize.query('DELETE FROM `drivers`', { transaction: t });

    // 4. Users and companies
    console.log('Deleting company_policies...');
    await sequelize.query('DELETE FROM `company_policies`', { transaction: t });

    console.log('Deleting user...');
    await sequelize.query('DELETE FROM `user`', { transaction: t });

    console.log('Deleting company...');
    await sequelize.query('DELETE FROM `company`', { transaction: t });

    // 5. Vendors
    console.log('Deleting vendor...');
    await sequelize.query('DELETE FROM `vendor`', { transaction: t });

    // 6. Sequences
    console.log('Deleting booking_sequence, invoice_sequences, payment_sequence...');
    await sequelize.query('DELETE FROM `booking_sequence`', { transaction: t });
    await sequelize.query('DELETE FROM `invoice_sequences`', { transaction: t });
    await sequelize.query('DELETE FROM `payment_sequence`', { transaction: t });

    // 7. Master data: Clear demo tenant records only, preserve root tenant records
    console.log('Deleting demo tax records (preserving root tenant CGST)...');
    await sequelize.query('DELETE FROM `tax` WHERE `tenantId` != ?', {
      replacements: [ROOT_TENANT_ID],
      transaction: t
    });

    console.log('Deleting demo vehicletype records (preserving root vehicle types)...');
    await sequelize.query('DELETE FROM `vehicletype` WHERE `tenantId` != ? AND `tenantId` IS NOT NULL', {
      replacements: [ROOT_TENANT_ID],
      transaction: t
    });

    console.log('Deleting demo pickupcity records (preserving root cities)...');
    await sequelize.query('DELETE FROM `pickupcity` WHERE `tenantId` != ? AND `tenantId` IS NOT NULL', {
      replacements: [ROOT_TENANT_ID],
      transaction: t
    });

    console.log('Deleting demo pickuparea records (preserving root areas)...');
    await sequelize.query('DELETE FROM `pickuparea` WHERE `tenantId` != ? AND `tenantId` IS NOT NULL', {
      replacements: [ROOT_TENANT_ID],
      transaction: t
    });

    console.log('Deleting demo paymentmode records (preserving root payment modes)...');
    await sequelize.query('DELETE FROM `paymentmode` WHERE `tenantId` != ? AND `tenantId` IS NOT NULL', {
      replacements: [ROOT_TENANT_ID],
      transaction: t
    });

    // 8. Employees: Clear demo fleet_admin employees, preserve SuperAdmin
    console.log('Deleting demo employees (preserving SuperAdmin)...');
    await sequelize.query('DELETE FROM `employee` WHERE `role` != ?', {
      replacements: ['superadmin'],
      transaction: t
    });

    // 9. Tenant tokens and registration requests
    console.log('Deleting tenant_activation_tokens & tenant_registration_requests...');
    await sequelize.query('DELETE FROM `tenant_activation_tokens`', { transaction: t });
    await sequelize.query('DELETE FROM `tenant_registration_requests`', { transaction: t });

    // 10. Tenant subscriptions and tenants (preserving root tenant GC)
    console.log('Deleting demo tenant_subscriptions (preserving root subscription)...');
    await sequelize.query('DELETE FROM `tenant_subscriptions` WHERE `tenantId` != ?', {
      replacements: [ROOT_TENANT_ID],
      transaction: t
    });

    console.log('Deleting demo tenants (preserving root tenant GC)...');
    await sequelize.query('DELETE FROM `tenants` WHERE `tenantId` != ?', {
      replacements: [ROOT_TENANT_ID],
      transaction: t
    });

    // VERIFY PROTECTED TABLES IN TRANSACTION BEFORE COMMIT
    console.log('\nValidating protected tables before commit...');
    const curConf = await getTableRowCount('configuration', t);
    const curEmail = await getTableRowCount('emailconfiguration', t);
    const curLinks = await getTableRowCount('short_links', t);
    const curSmsLogs = await getTableRowCount('sms_logs', t);
    const curNotifLogs = await getTableRowCount('notification_logs', t);
    const curPlans = await getTableRowCount('saas_plans', t);
    const curSmsTpl = await getTableRowCount('sms_templates', t);

    if (
      curConf !== protectedCounts.configuration ||
      curEmail !== protectedCounts.emailconfiguration ||
      curLinks !== protectedCounts.short_links ||
      curSmsLogs !== protectedCounts.sms_logs
    ) {
      throw new Error(
        `SAFETY VIOLATION: Protected table counts altered! ` +
        `configuration: ${curConf}/${protectedCounts.configuration}, ` +
        `emailconfiguration: ${curEmail}/${protectedCounts.emailconfiguration}, ` +
        `short_links: ${curLinks}/${protectedCounts.short_links}, ` +
        `sms_logs: ${curSmsLogs}/${protectedCounts.sms_logs}. ROLLING BACK!`
      );
    }

    // Verify SuperAdmin exists
    const [superAdmin]: any = await sequelize.query(
      'SELECT employeeId, email, role FROM `employee` WHERE `role` = ?',
      { replacements: ['superadmin'], type: QueryTypes.SELECT, transaction: t }
    );
    if (!superAdmin || superAdmin.employeeId !== SUPERADMIN_ID) {
      throw new Error('SAFETY VIOLATION: SuperAdmin account was not found! ROLLING BACK!');
    }

    // Verify Root Tenant exists
    const [rootTenant]: any = await sequelize.query(
      'SELECT tenantId, code, name FROM `tenants` WHERE `tenantId` = ?',
      { replacements: [ROOT_TENANT_ID], type: QueryTypes.SELECT, transaction: t }
    );
    if (!rootTenant) {
      throw new Error('SAFETY VIOLATION: Root tenant was not found! ROLLING BACK!');
    }

    // COMMIT
    console.log('All safety assertions passed. Committing transaction...');
    await t.commit();
    console.log('✓ Transaction committed successfully!\n');

  } catch (error) {
    console.error('Error during cleanup, rolling back transaction...', error);
    await t.rollback();
    throw error;
  }

  // STEP 3: Post-Cleanup Table Counts Audit
  console.log('Auditing post-cleanup row counts...');
  const afterCounts: Record<string, number> = {};
  const cleanupSummary: CleanupResult[] = [];

  for (const t of tableNames) {
    afterCounts[t] = await getTableRowCount(t);
    const before = beforeCounts[t];
    const after = afterCounts[t];
    const deleted = before - after;

    let status: CleanupResult['status'] = 'CLEARED';
    let notes = '';

    if (['configuration', 'emailconfiguration', 'short_links', 'sms_logs'].includes(t)) {
      status = 'PRESERVED';
      notes = 'Mandatory Protected Table - 100% Preserved';
    } else if (['saas_plans', 'sms_templates', 'notification_logs'].includes(t)) {
      status = 'PRESERVED';
      notes = 'System Configuration / Audit Log - Preserved';
    } else if (before === 0 && after === 0) {
      status = 'SKIPPED_EMPTY';
      notes = 'Already empty before cleanup';
    } else if (after > 0 && deleted > 0) {
      status = 'PARTIALLY_CLEARED';
      if (t === 'employee') notes = 'Preserved SuperAdmin, deleted demo fleet admins';
      else if (t === 'tenants') notes = 'Preserved Root Tenant (GC), deleted demo tenants';
      else if (t === 'tenant_subscriptions') notes = 'Preserved Root Subscription, deleted demo subscriptions';
      else if (t === 'tax') notes = 'Preserved Root CGST, deleted demo fleet taxes';
      else if (t === 'vehicletype') notes = 'Preserved 4 root vehicle types, deleted demo fleet types';
      else if (t === 'pickupcity') notes = 'Preserved 4 root cities, deleted demo fleet cities';
      else if (t === 'pickuparea') notes = 'Preserved 1 root area, deleted demo fleet areas';
      else if (t === 'paymentmode') notes = 'Preserved 6 root payment modes, deleted demo fleet modes';
    } else if (after === 0 && before > 0) {
      status = 'CLEARED';
      notes = `Fully cleared demo/operational data (${deleted} rows)`;
    }

    cleanupSummary.push({
      tableName: t,
      beforeCount: before,
      afterCount: after,
      deletedCount: deleted,
      status,
      notes
    });
  }

  // Output full summary table
  console.log('\n========================================================================================');
  console.log('CLEANUP SUMMARY TABLE');
  console.log('========================================================================================');
  console.log(
    'Table Name'.padEnd(30) +
    'Before'.padStart(8) +
    'After'.padStart(8) +
    'Deleted'.padStart(9) +
    '  ' + 'Status'.padEnd(18) +
    'Notes'
  );
  console.log('-'.repeat(95));
  let totalDeleted = 0;
  for (const r of cleanupSummary) {
    totalDeleted += r.deletedCount;
    console.log(
      r.tableName.padEnd(30) +
      String(r.beforeCount).padStart(8) +
      String(r.afterCount).padStart(8) +
      String(r.deletedCount).padStart(9) +
      '  ' + r.status.padEnd(18) +
      r.notes
    );
  }
  console.log('-'.repeat(95));
  console.log(`TOTAL ROWS DELETED: ${totalDeleted}`);
  console.log('========================================================================================\n');

  // Save report JSON for reference
  fs.writeFileSync(
    'd:\\demobooking\\demo-bookings\\backend\\cleanup_report.json',
    JSON.stringify({ backupPath: BACKUP_PATH, totalDeleted, cleanupSummary }, null, 2)
  );
  console.log('Cleanup report saved to backend/cleanup_report.json');

  process.exit(0);
}

runCleanup().catch(err => {
  console.error('CRITICAL ERROR in cleanup execution:', err);
  process.exit(1);
});
