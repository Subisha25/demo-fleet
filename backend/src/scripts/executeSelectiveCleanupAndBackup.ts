import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Sequelize, QueryTypes } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'demodb',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const MYSQL_DUMP_EXE = 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\mysqldump.exe';
const BACKUP_PATH = path.join(__dirname, '../../backup_demodb_precleanup_20261126_1100.sql');

// Explicitly approved categories and tables per prompt
const APPROVED_TABLES_ORDERED = [
  // 1. Order summary & invoice items (child-most invoice tables)
  'ordersummery',
  'monthly_invoice_items',
  'oncallinvoiceitems',

  // 2. Invoices & close pending
  'invoice',
  'closependings',
  'monthly_invoice',
  'oncallinvoice',

  // 3. Payments & subscriptions invoices
  'payment',
  'subscription_invoices',

  // 4. Bookings & notifications & OTP
  'booking',
  'customer_notifications',
  'driver_notifications',
  'otp',

  // 5. Sequences & counters
  'booking_sequence',
  'invoice_sequences',
  'payment_sequence',
  'monthlybookingsequence',
  'mapcount',

  // 6. Packages & Fleet Masters
  'packagedata',
  'package',
  'vehiclemaster',
  'vehicle',
  'vehicletype',
  'drivers',
  'vendor',
  'company',
  'partners',
  'owner',

  // 7. Tenant & SaaS tables
  'tenant_activation_tokens',
  'tenant_initial_allowance',
  'tenant_registration_requests',
  'tenant_subscriptions',
  'tenant_usage_meters',
];

// Protected Tables per prompt
const PROTECTED_TABLES = [
  'emailconfiguration',
  'configuration',
  'sms_logs',
  'sms_templates',
  'saas_plans',
  'short_links',
  'notification_logs',
  'tenant_sms_configs',
];

async function main() {
  console.log('========================================================================');
  console.log('  CABZ — STRICT SELECTIVE DATABASE CLEANUP ON LOCAL DEMODB');
  console.log('========================================================================\n');

  await sequelize.authenticate();
  console.log('✔ Connected to MySQL database `demodb`.');

  // Verify foreign key checks are enabled
  const [fkStatus]: any = await sequelize.query('SELECT @@FOREIGN_KEY_CHECKS as fk', { type: QueryTypes.SELECT });
  console.log(`✔ Foreign key checks status: ${fkStatus.fk === 1 ? 'ACTIVE (Strict Enforcement)' : 'DISABLED'}`);
  if (fkStatus.fk !== 1) {
    throw new Error('Foreign key checks must be active!');
  }

  // -------------------------------------------------------------------------
  // STEP 1: CREATE AND VERIFY FULL DATABASE BACKUP
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 1: CREATING VERIFIED FULL DATABASE BACKUP');
  console.log('========================================================================');
  if (!fs.existsSync(MYSQL_DUMP_EXE)) {
    throw new Error(`mysqldump executable not found at: ${MYSQL_DUMP_EXE}`);
  }

  const dumpCmd = `"${MYSQL_DUMP_EXE}" -u root --host=localhost --port=3306 --single-transaction --routines --triggers --databases demodb --result-file="${BACKUP_PATH}"`;
  console.log(`Executing mysqldump: ${dumpCmd}`);
  execSync(dumpCmd, { stdio: 'inherit' });

  if (!fs.existsSync(BACKUP_PATH)) {
    throw new Error(`Backup file was not created at ${BACKUP_PATH}`);
  }

  const backupStats = fs.statSync(BACKUP_PATH);
  console.log(`✔ Backup file created successfully: ${BACKUP_PATH}`);
  console.log(`  File size: ${backupStats.size} bytes (${(backupStats.size / 1024).toFixed(2)} KB)`);
  if (backupStats.size < 50000) {
    throw new Error(`Backup file suspiciously small (${backupStats.size} bytes). Aborting!`);
  }

  // -------------------------------------------------------------------------
  // STEP 2: RECORD CURRENT ROW COUNTS BEFORE DELETION
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 2: RECORDING CURRENT ROW COUNTS BEFORE DELETION');
  console.log('========================================================================');
  const allTablesResult: any = await sequelize.query('SHOW TABLES', { type: QueryTypes.SELECT });
  const allTables: string[] = allTablesResult.map((t: any) => Object.values(t)[0]);

  const beforeCounts: Record<string, number> = {};
  for (const table of allTables) {
    const [row]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\``, { type: QueryTypes.SELECT });
    beforeCounts[table] = Number(row.count);
  }

  console.log('\nBaseline Row Counts for Approved Tables:');
  for (const table of [...APPROVED_TABLES_ORDERED, 'tenants', 'employee']) {
    console.log(`  ${table.padEnd(30)} : ${beforeCounts[table] ?? 'N/A'} rows`);
  }

  console.log('\nBaseline Row Counts for Protected Tables:');
  for (const table of PROTECTED_TABLES) {
    console.log(`  ${table.padEnd(30)} : ${beforeCounts[table] ?? 'N/A'} rows`);
  }

  // -------------------------------------------------------------------------
  // STEP 3: VERIFY SUPERADMIN RECORD IN EMPLOYEE TABLE
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 3: VERIFYING SUPERADMIN ACCOUNT IN EMPLOYEE TABLE');
  console.log('========================================================================');
  const superAdminRows: any = await sequelize.query(
    "SELECT employeeId, username, email, role, tenantId FROM employee WHERE role = 'superadmin' OR email LIKE '%subisha2002%'",
    { type: QueryTypes.SELECT }
  );

  if (superAdminRows.length === 0) {
    throw new Error('FATAL: SuperAdmin account subisha2002 not found in employee table! Aborting cleanup.');
  }

  const superAdmin = superAdminRows[0];
  console.log(`✔ Found verified SuperAdmin account:`);
  console.log(`  employeeId : ${superAdmin.employeeId}`);
  console.log(`  username   : ${superAdmin.username}`);
  console.log(`  email      : ${superAdmin.email}`);
  console.log(`  role       : ${superAdmin.role}`);
  console.log(`  tenantId   : ${superAdmin.tenantId}`);

  // -------------------------------------------------------------------------
  // STEP 4: EXECUTE SELECTIVE DELETIONS IN STRICT FOREIGN-KEY ORDER
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 4: EXECUTING SELECTIVE DELETIONS IN STRICT FK ORDER');
  console.log('========================================================================');

  // Deletion Phase A: Operational & Billing Tables
  for (const table of APPROVED_TABLES_ORDERED) {
    const count = beforeCounts[table] || 0;
    if (count > 0) {
      console.log(`Deleting ${count} rows from approved table \`${table}\`...`);
      await sequelize.query(`DELETE FROM \`${table}\``);
      const [check]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\``, { type: QueryTypes.SELECT });
      console.log(`  ✔ Cleared \`${table}\`. Remaining rows: ${check.count}`);
    } else {
      console.log(`Table \`${table}\` already has 0 rows.`);
    }
  }

  // Deletion Phase B: Tenants Table
  // Note: tenant_sms_configs (4 rows) has FK references with ON DELETE NO ACTION.
  // We preserve the root tenant and any tenants referenced by protected tenant_sms_configs.
  console.log('\nProcessing \`tenants\` table deletion...');
  const smsTenantRows: any = await sequelize.query('SELECT DISTINCT tenantId FROM tenant_sms_configs', { type: QueryTypes.SELECT });
  const protectedTenantIds: string[] = smsTenantRows.map((r: any) => r.tenantId);
  if (!protectedTenantIds.includes(superAdmin.tenantId)) {
    protectedTenantIds.push(superAdmin.tenantId);
  }
  console.log(`Protected Tenant IDs from deletion (referenced by tenant_sms_configs / SuperAdmin): ${protectedTenantIds.length} tenants.`);

  const tenantsBefore = beforeCounts['tenants'] || 0;
  console.log(`Deleting non-protected tenant records from \`tenants\` (${tenantsBefore} rows before)...`);
  const placeholders = protectedTenantIds.map(() => '?').join(',');
  await sequelize.query(`DELETE FROM \`tenants\` WHERE tenantId NOT IN (${placeholders})`, {
    replacements: protectedTenantIds,
  });

  const [tenantsAfter]: any = await sequelize.query('SELECT COUNT(*) as count FROM `tenants`', { type: QueryTypes.SELECT });
  console.log(`  ✔ Cleaned \`tenants\`. Remaining rows: ${tenantsAfter.count} (Protected gateway/root tenants preserved).`);

  // Deletion Phase C: Employee Table (Preserve ONLY SuperAdmin)
  console.log('\nProcessing \`employee\` table deletion (Preserving SuperAdmin only)...');
  const employeesBefore = beforeCounts['employee'] || 0;
  console.log(`Deleting non-SuperAdmin records from \`employee\` (${employeesBefore} rows before)...`);
  await sequelize.query('DELETE FROM `employee` WHERE employeeId != ? AND role != ?', {
    replacements: [superAdmin.employeeId, 'superadmin'],
  });

  const [employeesAfter]: any = await sequelize.query('SELECT COUNT(*) as count FROM `employee`', { type: QueryTypes.SELECT });
  console.log(`  ✔ Cleaned \`employee\`. Remaining rows: ${employeesAfter.count} (Exactly 1 SuperAdmin preserved).`);

  // -------------------------------------------------------------------------
  // STEP 5: RESET AUTO_INCREMENT ON CLEARED TABLES WHERE APPLICABLE
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 5: RESETTING AUTO_INCREMENT ON CLEARED TABLES');
  console.log('========================================================================');
  const autoIncTables = [
    'booking_sequence',
    'invoice_sequences',
    'payment_sequence',
    'monthlybookingsequence',
    'mapcount',
    'otp',
    'customer_notifications',
    'driver_notifications',
  ];

  for (const table of autoIncTables) {
    try {
      await sequelize.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
      console.log(`  ✔ Reset AUTO_INCREMENT on \`${table}\``);
    } catch (e: any) {
      console.log(`  Note on \`${table}\`: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // STEP 6: POST-DELETION VERIFICATION OF ALL TABLES
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 6: POST-DELETION VERIFICATION OF ALL TABLES');
  console.log('========================================================================');
  const afterCounts: Record<string, number> = {};
  for (const table of allTables) {
    const [row]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\``, { type: QueryTypes.SELECT });
    afterCounts[table] = Number(row.count);
  }

  console.log('\nPost-Deletion Row Counts for Approved Tables:');
  let approvedSuccess = true;
  for (const table of APPROVED_TABLES_ORDERED) {
    const cnt = afterCounts[table];
    const isZero = cnt === 0;
    console.log(`  ${table.padEnd(30)} : ${cnt} rows ${isZero ? '✔ [CLEARED]' : '✖ [NOT ZERO]'}`);
    if (!isZero) approvedSuccess = false;
  }

  console.log('\nPost-Deletion Row Counts for Protected Tables:');
  let protectedSuccess = true;
  for (const table of PROTECTED_TABLES) {
    const before = beforeCounts[table];
    const after = afterCounts[table];
    const matches = before === after;
    console.log(`  ${table.padEnd(30)} : ${after} rows (was ${before}) ${matches ? '✔ [INTACT]' : '✖ [CHANGED]'}`);
    if (!matches) protectedSuccess = false;
  }

  // Verify SuperAdmin
  const preservedSuperAdmin: any = await sequelize.query(
    'SELECT employeeId, username, email, role, tenantId FROM employee',
    { type: QueryTypes.SELECT }
  );
  console.log('\nPreserved SuperAdmin row:');
  console.table(preservedSuperAdmin);

  const superAdminValid =
    Array.isArray(preservedSuperAdmin) &&
    preservedSuperAdmin.length === 1 &&
    preservedSuperAdmin[0].employeeId === superAdmin.employeeId &&
    preservedSuperAdmin[0].role === 'superadmin';

  console.log(`SuperAdmin preservation check: ${superAdminValid ? '✔ [PASSED]' : '✖ [FAILED]'}`);

  console.log('\n========================================================================');
  if (approvedSuccess && protectedSuccess && superAdminValid) {
    console.log('  ✔ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  } else {
    console.log('  ✖ SOME VERIFICATIONS FAILED!');
    process.exit(1);
  }
  console.log('========================================================================\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal cleanup error:', err);
  process.exit(1);
});
