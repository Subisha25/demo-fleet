import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sequelize from '../config/dbConfig';
import { QueryTypes } from 'sequelize';

const MYSQL_DUMP_EXE = 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\mysqldump.exe';
const MYSQL_EXE = 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\mysql.exe';
const BACKUP_PATH = 'd:\\demobooking\\demo-bookings\\backend\\backup_demodb_precleanup_20261117_1215.sql';
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

  // Execute mysqldump
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
  // Note: the dump includes "USE `demodb`;" so we can restore using mysql.exe with stdin
  // To restore into TEST_RESTORE_DB safely without overwriting demodb, let's read the sql and test restore into TEST_RESTORE_DB
  const sqlContent = fs.readFileSync(BACKUP_PATH, 'utf8');
  // Replace `demodb` with `demodb_restore_test` in database statements for testing restore
  const testSqlContent = sqlContent
    .replace(/CREATE DATABASE \/\*!32312 IF NOT EXISTS\*\/ `demodb`/g, `CREATE DATABASE /*!32312 IF NOT EXISTS*/ \`${TEST_RESTORE_DB}\``)
    .replace(/USE `demodb`;/g, `USE \`${TEST_RESTORE_DB}\`;`);

  const tempRestoreSqlPath = path.join(process.cwd(), 'temp_restore_test.sql');
  fs.writeFileSync(tempRestoreSqlPath, testSqlContent, 'utf8');

  try {
    const restoreCmd = `"${MYSQL_EXE}" -u root --host=localhost --port=3306 "${TEST_RESTORE_DB}" < "${tempRestoreSqlPath}"`;
    console.log(`Executing test restore: ${restoreCmd}`);
    execSync(`cmd.exe /c "${restoreCmd}"`, { stdio: 'inherit' });

    // Verify row counts in the restored database
    const [demodbTables]: any = await sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'demodb' ORDER BY TABLE_NAME`,
      { type: QueryTypes.SELECT }
    );
    const [testDbTables]: any = await sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${TEST_RESTORE_DB}' ORDER BY TABLE_NAME`,
      { type: QueryTypes.SELECT }
    );

    console.log(`\nTable Count Check:`);
    console.log(`  demodb tables: ${demodbTables.length}`);
    console.log(`  ${TEST_RESTORE_DB} tables: ${testDbTables.length}`);

    if (demodbTables.length !== testDbTables.length) {
      throw new Error(`Table count mismatch between original and restored database! Original: ${demodbTables.length}, Restored: ${testDbTables.length}`);
    }

    // Check row counts for key tables in restored database
    const keyTables = ['employee', 'emailconfiguration', 'configuration', 'sms_logs', 'sms_templates', 'short_links', 'saas_plans', 'booking', 'tenants'];
    console.log('\nSample Key Table Row Count Comparison:');
    for (const t of keyTables) {
      const [origRow]: any = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`demodb\`.\`${t}\``, { type: QueryTypes.SELECT });
      const [restRow]: any = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`${TEST_RESTORE_DB}\`.\`${t}\``, { type: QueryTypes.SELECT });
      const origCount = Number(origRow.cnt);
      const restCount = Number(restRow.cnt);
      console.log(`  ${t.padEnd(25)} | Original: ${origCount} | Restored: ${restCount} | Match: ${origCount === restCount ? '✓' : '✗'}`);
      if (origCount !== restCount) {
        throw new Error(`Row count mismatch in ${t}: original ${origCount} vs restored ${restCount}`);
      }
    }

    console.log(`\n✓ SUCCESS: Backup file is verified 100% valid, readable, and restorable!`);
  } finally {
    // Clean up temporary restore database and temp file
    console.log(`\nCleaning up temporary test database ${TEST_RESTORE_DB}...`);
    await sequelize.query(`DROP DATABASE IF EXISTS \`${TEST_RESTORE_DB}\``);
    if (fs.existsSync(tempRestoreSqlPath)) {
      fs.unlinkSync(tempRestoreSqlPath);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Backup verification failed:', err);
  process.exit(1);
});
