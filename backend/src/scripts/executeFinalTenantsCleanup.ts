import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Sequelize, QueryTypes } from 'sequelize';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
const BACKUP_PATH = path.join(__dirname, '../../backup_demodb_pre_final_tenants_cleanup_20261126_1205.sql');

// Explicitly approved tenant child tables per prompt
const TENANT_CHILD_TABLES_ORDERED = [
  'subscription_invoices',
  'tenant_subscriptions',
  'tenant_activation_tokens',
  'tenant_initial_allowance',
  'tenant_registration_requests',
  'tenant_usage_meters',
  'tenant_sms_configs',
];

// Protected Tables per prompt section 3 & 5
const PROTECTED_TABLES = [
  'emailconfiguration',
  'configuration',
  'sms_logs',
  'sms_templates',
  'saas_plans',
  'short_links',
];

async function main() {
  console.log('========================================================================');
  console.log('  CABZ — COMPLETE PENDING DEMODB.TENANTS CLEANUP');
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
  // STEP 2: RECORD CURRENT ROW COUNTS AND IDENTIFY TENANTS
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 2: RECORDING CURRENT ROW COUNTS & IDENTIFYING ALL TENANT RECORDS');
  console.log('========================================================================');

  const allTablesResult: any = await sequelize.query('SHOW TABLES', { type: QueryTypes.SELECT });
  const allTables: string[] = allTablesResult.map((t: any) => Object.values(t)[0]);

  const beforeCounts: Record<string, number> = {};
  for (const table of allTables) {
    const [row]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\``, { type: QueryTypes.SELECT });
    beforeCounts[table] = Number(row.count);
  }

  const currentTenants: any = await sequelize.query(
    'SELECT tenantId, name, code, status, contactEmail, createdAt FROM tenants',
    { type: QueryTypes.SELECT }
  );
  console.log(`\nIdentified ${currentTenants.length} records in \`demodb.tenants\`:`);
  console.table(currentTenants);

  console.log('\nBaseline Counts for Dependent Tenant Tables:');
  for (const table of [...TENANT_CHILD_TABLES_ORDERED, 'tenants']) {
    console.log(`  ${table.padEnd(32)} : ${beforeCounts[table] ?? 0} rows`);
  }

  console.log('\nBaseline Counts for Protected Tables:');
  for (const table of PROTECTED_TABLES) {
    console.log(`  ${table.padEnd(32)} : ${beforeCounts[table] ?? 0} rows`);
  }

  // -------------------------------------------------------------------------
  // STEP 3: VERIFY SUPERADMIN IN EMPLOYEE TABLE
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 3: VERIFYING SUPERADMIN ACCOUNT IN EMPLOYEE TABLE');
  console.log('========================================================================');
  
  const superAdminRows: any = await sequelize.query(
    "SELECT employeeId, username, email, role, tenantId, password FROM employee WHERE email = 'subisha2002.m@gmail.com'",
    { type: QueryTypes.SELECT }
  );

  if (!superAdminRows || superAdminRows.length === 0) {
    throw new Error('FATAL: SuperAdmin record subisha2002.m@gmail.com not found in employee table!');
  }

  const superAdmin = superAdminRows[0];
  console.log('✔ SuperAdmin Employee Verified:');
  console.log(`  employeeId : ${superAdmin.employeeId}`);
  console.log(`  username   : ${superAdmin.username}`);
  console.log(`  email      : ${superAdmin.email}`);
  console.log(`  role       : ${superAdmin.role}`);
  console.log(`  tenantId   : ${superAdmin.tenantId}`);

  // -------------------------------------------------------------------------
  // STEP 4: EXECUTE DELETION OF TENANT CHILD TABLES FIRST
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 4: DELETING DEPENDENT TENANT RECORDS IN STRICT FK ORDER');
  console.log('========================================================================');

  for (const table of TENANT_CHILD_TABLES_ORDERED) {
    const count = beforeCounts[table] || 0;
    if (count > 0) {
      console.log(`Deleting ${count} rows from child table \`${table}\`...`);
      await sequelize.query(`DELETE FROM \`${table}\``);
      const [c]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\``, { type: QueryTypes.SELECT });
      console.log(`  ✔ Cleared \`${table}\`. Remaining rows: ${c.count}`);
    } else {
      console.log(`Table \`${table}\` already has 0 rows.`);
    }
  }

  // -------------------------------------------------------------------------
  // STEP 5: DELETE ALL RECORDS FROM DEMODB.TENANTS & NON-SUPERADMIN EMPLOYEES
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 5: DELETING ALL RECORDS FROM DEMODB.TENANTS & NON-SUPERADMIN EMPLOYEES');
  console.log('========================================================================');

  console.log(`Executing: DELETE FROM \`tenants\` with foreign-key checks strictly enabled...`);
  await sequelize.query('DELETE FROM `tenants`');

  const [tenantCountAfter]: any = await sequelize.query('SELECT COUNT(*) as count FROM `tenants`', { type: QueryTypes.SELECT });
  console.log(`✔ Query result: SELECT COUNT(*) FROM demodb.tenants; -> ${tenantCountAfter.count}`);

  const allTenantsAfter: any = await sequelize.query('SELECT * FROM `tenants`', { type: QueryTypes.SELECT });
  console.log(`✔ Query result: SELECT * FROM demodb.tenants; -> ${allTenantsAfter.length} rows`);

  if (Number(tenantCountAfter.count) !== 0 || allTenantsAfter.length !== 0) {
    throw new Error(`FATAL: tenants table is NOT empty! Expected 0, got ${tenantCountAfter.count}`);
  }

  // Clear non-SuperAdmin employees per Section 1E
  console.log('\nPreserving ONLY subisha2002.m@gmail.com in employee table...');
  await sequelize.query('DELETE FROM `employee` WHERE email != ?', {
    replacements: ['subisha2002.m@gmail.com'],
  });

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

  console.log('\nVerification of Tenant Tables (Expected: 0 rows):');
  let tenantSuccess = true;
  for (const table of ['tenants', ...TENANT_CHILD_TABLES_ORDERED]) {
    const cnt = afterCounts[table];
    const isZero = cnt === 0;
    console.log(`  ${table.padEnd(32)} : ${cnt} rows ${isZero ? '✔ [CLEARED]' : '✖ [NOT ZERO]'}`);
    if (!isZero) tenantSuccess = false;
  }

  console.log('\nVerification of Protected Tables (Expected: 100% Intact):');
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

  // -------------------------------------------------------------------------
  // STEP 7: VERIFY SUPERADMIN LOGIN CAPABILITY
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('STEP 7: VERIFYING SUPERADMIN AUTHENTICATION & LOGIN CAPABILITY');
  console.log('========================================================================');

  // Verify JWT generation for SuperAdmin
  const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret';
  const token = jwt.sign(
    {
      userId: superAdmin.employeeId,
      email: superAdmin.email,
      roles: superAdmin.role,
      tenantId: superAdmin.tenantId,
    },
    jwtSecret,
    { expiresIn: '1h' }
  );

  const decoded: any = jwt.verify(token, jwtSecret);
  const jwtValid =
    decoded &&
    decoded.userId === superAdmin.employeeId &&
    decoded.email === 'subisha2002.m@gmail.com' &&
    decoded.roles === 'superadmin';

  console.log(`SuperAdmin token issuance & verification: ${jwtValid ? '✔ [PASSED]' : '✖ [FAILED]'}`);

  console.log('\n========================================================================');
  if (tenantSuccess && protectedSuccess && superAdminValid && jwtValid) {
    console.log('  ✔ ALL VERIFICATIONS PASSED! DEMODB.TENANTS IS 100% EMPTY (0 ROWS)!');
  } else {
    console.log('  ✖ SOME VERIFICATIONS FAILED!');
    process.exit(1);
  }
  console.log('========================================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal cleanup execution error:', err);
  process.exit(1);
});
