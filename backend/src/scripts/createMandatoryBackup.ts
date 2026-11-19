import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sequelize from '../config/dbConfig';
import { QueryTypes } from 'sequelize';

const MYSQL_DUMP_EXE = 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\mysqldump.exe';
const MYSQL_EXE = 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\mysql.exe';
const BACKUP_PATH = 'd:\\demobooking\\demo-bookings\\backend\\backup_demodb_precleanup_20261117_1305.sql';
const TEST_RESTORE_DB = 'demodb_restore_test';

async function main() {
  console.log('========================================================================');
  console.log('STEP 1: CREATING FULL BACKUP OF DEMODB');
  console.log('========================================================================\n');

  const timestamp = new Date().toISOString();
  console.log(`Backup Timestamp: ${timestamp}`);
  console.log(`Target Backup Path: ${BACKUP_PATH}`);

  if (!fs.existsSync(MYSQL_DUMP_EXE)) {
    throw new Error(`mysqldump.exe not found at ${MYSQL_DUMP_EXE}`);
  }

  // 1. Audit source demodb table counts before backup
  const sourceTables = await sequelize.query<{ TABLE_NAME: string }>(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'demodb' ORDER BY TABLE_NAME`,
    { type: QueryTypes.SELECT }
  );

  const sourceCounts: Record<string, number> = {};
  for (const t of sourceTables) {
    const [{ count }] = await sequelize.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM \`demodb\`.\`${t.TABLE_NAME}\``,
      { type: QueryTypes.SELECT }
    );
    sourceCounts[t.TABLE_NAME] = Number(count);
  }
  console.log(`Audited ${sourceTables.length} tables in demodb.`);

  // 2. Execute mysqldump
  const dumpCmd = `"${MYSQL_DUMP_EXE}" -u root --host=localhost --port=3306 --single-transaction --routines --triggers --databases demodb --result-file="${BACKUP_PATH}"`;
  console.log(`Executing: ${dumpCmd}`);
  execSync(dumpCmd, { stdio: 'inherit' });

  if (!fs.existsSync(BACKUP_PATH)) {
    throw new Error(`Backup file was not created at ${BACKUP_PATH}`);
  }

  const stats = fs.statSync(BACKUP_PATH);
  console.log(`\n✓ Backup file created successfully!`);
  console.log(`  File size: ${stats.size} bytes (${(stats.size / 1024).toFixed(2)} KB)`);

  if (stats.size < 50000) {
    throw new Error(`Backup file is suspiciously small (${stats.size} bytes). Expected > 50KB.`);
  }

  console.log('\n========================================================================');
  console.log('STEP 2: VERIFYING BACKUP RESTORATION INTO TEMPORARY TEST DATABASE');
  console.log('========================================================================\n');

  // Create temporary database for restore verification
  console.log(`Creating test database: ${TEST_RESTORE_DB}...`);
  await sequelize.query(`DROP DATABASE IF EXISTS \`${TEST_RESTORE_DB}\``);
  await sequelize.query(`CREATE DATABASE \`${TEST_RESTORE_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

  console.log(`Restoring backup into ${TEST_RESTORE_DB} using mysql.exe...`);
  const sqlContent = fs.readFileSync(BACKUP_PATH, 'utf8');
  const testSqlContent = sqlContent
    .replace(/CREATE DATABASE \/\*!32312 IF NOT EXISTS\*\/ `demodb`/g, `CREATE DATABASE /*!32312 IF NOT EXISTS*/ \`${TEST_RESTORE_DB}\``)
    .replace(/USE `demodb`;/g, `USE \`${TEST_RESTORE_DB}\`;`);

  const tempRestoreSqlPath = path.join(process.cwd(), 'temp_restore_test_1305.sql');
  fs.writeFileSync(tempRestoreSqlPath, testSqlContent, 'utf8');

  try {
    const restoreCmd = `"${MYSQL_EXE}" -u root --host=localhost --port=3306 "${TEST_RESTORE_DB}" < "${tempRestoreSqlPath}"`;
    execSync(restoreCmd, { stdio: 'inherit', shell: 'cmd.exe' });
    console.log(`✓ Restore finished into ${TEST_RESTORE_DB}`);

    // Verify all tables restored and compare row counts
    const restoredTables = await sequelize.query<{ TABLE_NAME: string }>(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${TEST_RESTORE_DB}' ORDER BY TABLE_NAME`,
      { type: QueryTypes.SELECT }
    );

    console.log(`Restored database table count: ${restoredTables.length} (Expected: ${sourceTables.length})`);
    if (restoredTables.length !== sourceTables.length) {
      throw new Error(`Table count mismatch! Source: ${sourceTables.length}, Restored: ${restoredTables.length}`);
    }

    let mismatchCount = 0;
    for (const t of sourceTables) {
      const tableName = t.TABLE_NAME;
      const [{ count }] = await sequelize.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM \`${TEST_RESTORE_DB}\`.\`${tableName}\``,
        { type: QueryTypes.SELECT }
      );
      const restoredCount = Number(count);
      const sourceCount = sourceCounts[tableName];
      if (restoredCount !== sourceCount) {
        console.error(`Mismatch in table ${tableName}: source=${sourceCount}, restored=${restoredCount}`);
        mismatchCount++;
      }
    }

    if (mismatchCount > 0) {
      throw new Error(`Restoration validation failed with ${mismatchCount} table row count mismatches!`);
    }

    console.log(`\n✅ 100% RESTORATION VERIFIED: All ${sourceTables.length} tables and all row counts match identically between demodb and restored backup!`);
  } finally {
    if (fs.existsSync(tempRestoreSqlPath)) {
      fs.unlinkSync(tempRestoreSqlPath);
    }
    // Drop test database
    console.log(`Dropping test restore database: ${TEST_RESTORE_DB}...`);
    await sequelize.query(`DROP DATABASE IF EXISTS \`${TEST_RESTORE_DB}\``);
    console.log(`✓ Test restore database dropped safely.`);
  }

  console.log('\n========================================================================');
  console.log('BACKUP CREATION AND RESTORATION VALIDATION SUCCESSFUL!');
  console.log('========================================================================');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('FAILED:', err);
    process.exit(1);
  });
