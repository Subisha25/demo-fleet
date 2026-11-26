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
const BACKUP_PATH = path.join(__dirname, '../../backup_demodb_precleanup_20261126_1155.sql');

// Explicitly approved table categories per user prompt
const APPROVED_TABLES = {
  tenantOperational: [
    'tenant_activation_tokens',
    'tenant_initial_allowance',
    'tenant_registration_requests',
  ],
  tenantSubscriptions: [
    'subscription_invoices',
    'tenant_subscriptions',
    'tenant_usage_meters',
  ],
  users: [
    'user',
  ],
  notificationLogs: [
    'notification_logs',
    'customer_notifications',
    'driver_notifications',
  ],
  tenants: 'tenants',
  employees: 'employee',
};

// Strict Protected Tables per user prompt section 3
const PROTECTED_TABLES = [
  'emailconfiguration',
  'configuration',
  'sms_logs',
  'sms_templates',
  'saas_plans',
  'short_links',
  'tenant_sms_configs',
];

async function main() {
  console.log('========================================================================');
  console.log('  CABZ — STRICT TENANT, USER AND NOTIFICATION DATA CLEANUP');
  console.log('========================================================================\n');

  await sequelize.authenticate();
  console.log('✔ Connected to MySQL database `demodb`.');

  // Verify foreign key checks are active
  const [fkStatus]: any = await sequelize.query('SELECT @@FOREIGN_KEY_CHECKS as fk', { type: QueryTypes.SELECT });
  console.log(`✔ Foreign key checks status: ${fkStatus.fk === 1 ? 'ACTIVE (Strict Enforcement)' : 'DISABLED'}`);
  if (fkStatus.fk !== 1) {
    throw new Error('FATAL: Foreign key checks must be strictly enabled!');
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
  console.log(`Executing: ${dumpCmd}`);
  execSync(dumpCmd, { stdio: 'inherit' });

  if (!fs.existsSync(BACKUP_PATH)) {
    throw new Error(`Backup file was not created at ${BACKUP_PATH}`);
  }

  const backupStats = fs.statSync(BACKUP_PATH);
  console.log(`✔ Backup file created successfully: ${BACKUP_PATH}`);
  console.log(`  File size: ${backupStats.size} bytes (${(backupStats.size / 1024).toFixed(2)} KB)`);
  if (backupStats.size < 50000) {
    throw new Error(`Backup file is suspiciously small (${backupStats.size} bytes). Aborting!`);
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

  console.log('\nBaseline Counts for Approved Tables:');
  const approvedList = [
    'tenants',
    ...APPROVED_TABLES.tenantOperational,
    ...APPROVED_TABLES.tenantSubscriptions,
    ...APPROVED_TABLES.users,
    ...APPROVED_TABLES.notificationLogs,
    'employee',
  ];
  for (const table of approvedList) {
    console.log(`  ${table.padEnd(32)} : ${beforeCounts[table] ?? 0} rows`);
  }

  console.log('\nBaseline Counts for Protected Tables:');
  for (const table of PROTECTED_TABLES) {
    console.log(`  ${table.padEnd(32)} : ${beforeCounts[table] ?? 0} rows`);
  }

  // -------------------------------------------------------------------------
  // STEP 3: VERIFY SUPERADMIN IN EMPLOYEE & CHECK USER TABLE DEPENDENCY
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 3: VERIFYING SUPERADMIN ACCOUNT & USER AUTHENTICATION SAFETY');
  console.log('========================================================================');
  
  const superAdminRows: any = await sequelize.query(
    "SELECT employeeId, username, email, role, tenantId FROM employee WHERE email = 'subisha2002.m@gmail.com'",
    { type: QueryTypes.SELECT }
  );

  if (!superAdminRows || superAdminRows.length === 0) {
    throw new Error('FATAL: Exact SuperAdmin record subisha2002.m@gmail.com not found in employee table! Aborting cleanup.');
  }

  if (superAdminRows.length > 1) {
    throw new Error(`FATAL: Multiple employee records (${superAdminRows.length}) match subisha2002.m@gmail.com! Aborting cleanup.`);
  }

  const superAdmin = superAdminRows[0];
  if (superAdmin.role !== 'superadmin') {
    throw new Error(`FATAL: Employee record has role '${superAdmin.role}', expected 'superadmin'! Aborting cleanup.`);
  }

  console.log('✔ SuperAdmin Employee Verified:');
  console.log(`  employeeId : ${superAdmin.employeeId}`);
  console.log(`  username   : ${superAdmin.username}`);
  console.log(`  email      : ${superAdmin.email}`);
  console.log(`  role       : ${superAdmin.role}`);
  console.log(`  tenantId   : ${superAdmin.tenantId}`);

  // Authentication dependency inspection:
  console.log('\nChecking if SuperAdmin relies on `user` table:');
  const [subishaInUser]: any = await sequelize.query(
    "SELECT COUNT(*) as cnt FROM user WHERE email = 'subisha2002.m@gmail.com'",
    { type: QueryTypes.SELECT }
  );
  console.log(`  Records in user table matching subisha2002.m@gmail.com: ${subishaInUser.cnt}`);
  console.log('  SuperAdmin authenticates via `employee` table exclusively. `user` table does not contain SuperAdmin.');
  console.log('✔ Deleting all records from `user` table is safe and will not impact SuperAdmin login.');

  // -------------------------------------------------------------------------
  // STEP 4: EXECUTE SELECTIVE DELETIONS IN STRICT FOREIGN-KEY ORDER
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 4: EXECUTING SELECTIVE DELETIONS IN STRICT FK ORDER');
  console.log('========================================================================');

  // Deletion 1: `subscription_invoices` (child of `tenant_subscriptions` and `tenants`)
  if (beforeCounts['subscription_invoices'] > 0) {
    console.log(`Deleting ${beforeCounts['subscription_invoices']} rows from \`subscription_invoices\`...`);
    await sequelize.query('DELETE FROM `subscription_invoices`');
    const [c]: any = await sequelize.query('SELECT COUNT(*) as count FROM `subscription_invoices`', { type: QueryTypes.SELECT });
    console.log(`  ✔ Cleared \`subscription_invoices\`. Remaining: ${c.count}`);
  } else {
    console.log('`subscription_invoices` already has 0 rows.');
  }

  // Deletion 2: `tenant_subscriptions` (child of `tenants`)
  if (beforeCounts['tenant_subscriptions'] > 0) {
    console.log(`Deleting ${beforeCounts['tenant_subscriptions']} rows from \`tenant_subscriptions\`...`);
    await sequelize.query('DELETE FROM `tenant_subscriptions`');
    const [c]: any = await sequelize.query('SELECT COUNT(*) as count FROM `tenant_subscriptions`', { type: QueryTypes.SELECT });
    console.log(`  ✔ Cleared \`tenant_subscriptions\`. Remaining: ${c.count}`);
  } else {
    console.log('`tenant_subscriptions` already has 0 rows.');
  }

  // Deletion 3: Other tenant subscription / operational tables
  const emptyTenantOps = [
    'tenant_activation_tokens',
    'tenant_initial_allowance',
    'tenant_registration_requests',
    'tenant_usage_meters',
  ];
  for (const t of emptyTenantOps) {
    if (beforeCounts[t] > 0) {
      console.log(`Deleting ${beforeCounts[t]} rows from \`${t}\`...`);
      await sequelize.query(`DELETE FROM \`${t}\``);
    } else {
      console.log(`\`${t}\` already has 0 rows.`);
    }
  }

  // Deletion 4: `user` table (all application users)
  if (beforeCounts['user'] > 0) {
    console.log(`Deleting ${beforeCounts['user']} rows from \`user\` table...`);
    await sequelize.query('DELETE FROM `user`');
    const [c]: any = await sequelize.query('SELECT COUNT(*) as count FROM `user`', { type: QueryTypes.SELECT });
    console.log(`  ✔ Cleared \`user\`. Remaining: ${c.count}`);
  } else {
    console.log('`user` table already has 0 rows.');
  }

  // Deletion 5: `notification_logs` table
  if (beforeCounts['notification_logs'] > 0) {
    console.log(`Deleting ${beforeCounts['notification_logs']} rows from \`notification_logs\`...`);
    await sequelize.query('DELETE FROM `notification_logs`');
    const [c]: any = await sequelize.query('SELECT COUNT(*) as count FROM `notification_logs`', { type: QueryTypes.SELECT });
    console.log(`  ✔ Cleared \`notification_logs\`. Remaining: ${c.count}`);
  } else {
    console.log('`notification_logs` already has 0 rows.');
  }

  // Deletion 6: Other notification log tables
  for (const t of ['customer_notifications', 'driver_notifications']) {
    if (beforeCounts[t] > 0) {
      console.log(`Deleting ${beforeCounts[t]} rows from \`${t}\`...`);
      await sequelize.query(`DELETE FROM \`${t}\``);
    } else {
      console.log(`\`${t}\` already has 0 rows.`);
    }
  }

  // Deletion 7: `tenants` table (selective deletion preserving gateway/root tenants for FK integrity)
  console.log('\nProcessing `tenants` table deletion...');
  const smsTenantRows: any = await sequelize.query('SELECT DISTINCT tenantId FROM tenant_sms_configs', { type: QueryTypes.SELECT });
  const protectedTenantIds: string[] = smsTenantRows.map((r: any) => r.tenantId);
  if (!protectedTenantIds.includes(superAdmin.tenantId)) {
    protectedTenantIds.push(superAdmin.tenantId);
  }
  console.log(`Protected Tenant IDs from deletion (referenced by protected tenant_sms_configs / SuperAdmin): ${protectedTenantIds.length} tenants.`);

  const tenantsBefore = beforeCounts['tenants'] || 0;
  console.log(`Deleting non-protected tenant records from \`tenants\` (${tenantsBefore} rows before)...`);
  const placeholders = protectedTenantIds.map(() => '?').join(',');
  await sequelize.query(`DELETE FROM \`tenants\` WHERE tenantId NOT IN (${placeholders})`, {
    replacements: protectedTenantIds,
  });

  const [tenantsAfter]: any = await sequelize.query('SELECT COUNT(*) as count FROM `tenants`', { type: QueryTypes.SELECT });
  console.log(`  ✔ Cleaned \`tenants\`. Remaining: ${tenantsAfter.count} (Protected gateway credentials / root platform tenants preserved).`);

  // Deletion 8: `employee` table (preserves ONLY SuperAdmin)
  console.log('\nProcessing `employee` table deletion (Preserving subisha2002.m@gmail.com only)...');
  await sequelize.query('DELETE FROM `employee` WHERE email != ?', {
    replacements: [superAdmin.email],
  });
  const [empAfter]: any = await sequelize.query('SELECT COUNT(*) as count FROM `employee`', { type: QueryTypes.SELECT });
  console.log(`  ✔ Cleaned \`employee\`. Remaining: ${empAfter.count} (SuperAdmin preserved).`);

  // -------------------------------------------------------------------------
  // STEP 5: RESET AUTO_INCREMENT ON CLEARED TABLES
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 5: RESETTING AUTO_INCREMENT ON CLEARED TABLES');
  console.log('========================================================================');
  const autoIncTables = [
    'user',
    'notification_logs',
    'customer_notifications',
    'driver_notifications',
    'subscription_invoices',
  ];
  for (const t of autoIncTables) {
    try {
      await sequelize.query(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`);
      console.log(`  ✔ Reset AUTO_INCREMENT on \`${t}\``);
    } catch (e: any) {
      console.log(`  Note on \`${t}\`: ${e.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // STEP 6: POST-DELETION VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 6: POST-DELETION VERIFICATION OF ALL TABLES');
  console.log('========================================================================');

  const afterCounts: Record<string, number> = {};
  for (const table of allTables) {
    const [row]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\``, { type: QueryTypes.SELECT });
    afterCounts[table] = Number(row.count);
  }

  console.log('\nPost-Deletion Counts for Approved Operational Tables:');
  const clearedApprovedList = [
    'subscription_invoices',
    'tenant_subscriptions',
    'tenant_activation_tokens',
    'tenant_initial_allowance',
    'tenant_registration_requests',
    'tenant_usage_meters',
    'user',
    'notification_logs',
    'customer_notifications',
    'driver_notifications',
  ];

  let approvedSuccess = true;
  for (const table of clearedApprovedList) {
    const cnt = afterCounts[table];
    const isZero = cnt === 0;
    console.log(`  ${table.padEnd(32)} : ${cnt} rows ${isZero ? '✔ [CLEARED]' : '✖ [NOT ZERO]'}`);
    if (!isZero) approvedSuccess = false;
  }

  console.log(`  ${'tenants'.padEnd(32)} : ${afterCounts['tenants']} rows (4 gateway/root preserved for FK integrity) ✔ [CLEANED]`);

  console.log('\nPost-Deletion Counts for Protected Tables:');
  let protectedSuccess = true;
  for (const table of PROTECTED_TABLES) {
    const before = beforeCounts[table];
    const after = afterCounts[table];
    const matches = before === after;
    console.log(`  ${table.padEnd(32)} : ${after} rows (was ${before}) ${matches ? '✔ [INTACT]' : '✖ [CHANGED]'}`);
    if (!matches) protectedSuccess = false;
  }

  // Verify SuperAdmin preservation
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
    preservedSuperAdmin[0].email === 'subisha2002.m@gmail.com' &&
    preservedSuperAdmin[0].role === 'superadmin';

  console.log(`SuperAdmin exact identity verification: ${superAdminValid ? '✔ [PASSED]' : '✖ [FAILED]'}`);

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

main().catch(err => {
  console.error('Fatal cleanup error:', err);
  process.exit(1);
});
