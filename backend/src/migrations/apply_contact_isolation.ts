import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function applyContactIsolation() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'demodb',
  });

  console.log('--- Applying Contact Isolation to MySQL demodb ---');

  // 1. Purge obsolete Grace Cabs BCC from emailconfiguration
  const [emailConfRes]: any = await conn.query(
    "UPDATE `emailconfiguration` SET `emailBcc` = NULL WHERE `emailBcc` LIKE '%subisha2002.m%'"
  );
  console.log(`[PASS] Cleared obsolete subisha2002.m BCC from emailconfiguration: ${emailConfRes.affectedRows} rows updated.`);

  // 2. Drop redundant global unique indexes on employee.phno
  const [indexes]: any = await conn.query('SHOW INDEX FROM `employee`');
  const phnoIndexes = Array.from(new Set(
    indexes
      .filter((i: any) => i.Column_name === 'phno' && i.Non_unique === 0 && i.Key_name !== 'PRIMARY')
      .map((i: any) => i.Key_name)
  ));

  console.log(`Found ${phnoIndexes.length} global unique indexes on employee.phno to drop.`);
  for (const idxName of phnoIndexes) {
    try {
      await conn.query(`ALTER TABLE \`employee\` DROP INDEX \`${idxName}\``);
      console.log(`  Dropped index ${idxName} from employee.`);
    } catch (err: any) {
      console.log(`  Could not drop index ${idxName}: ${err.message}`);
    }
  }

  // 3. Add composite tenant-scoped index on (tenantId, phno) if not exists
  try {
    await conn.query('ALTER TABLE `employee` ADD INDEX `idx_employee_tenant_phno` (`tenantId`, `phno`)');
    console.log('[PASS] Added composite index idx_employee_tenant_phno on employee (tenantId, phno).');
  } catch (err: any) {
    if (!err.message.includes('Duplicate key name')) {
      console.warn('Notice adding idx_employee_tenant_phno:', err.message);
    }
  }

  // 4. Ensure SuperAdmin employee has Demo Fleet contact phone and email
  const [empRes]: any = await conn.query(
    "UPDATE `employee` SET `phno` = '9080280818', `email` = 'subisha2002.m@gmail.com' WHERE `role` = 'superadmin'"
  );
  console.log(`[PASS] Updated SuperAdmin employee contact in demodb: ${empRes.affectedRows} rows updated.`);

  // 5. Verify clean state
  const [remainBcc]: any = await conn.query(
    "SELECT COUNT(*) as cnt FROM `emailconfiguration` WHERE `emailBcc` LIKE '%subisha2002.m%'"
  );
  console.log(`[VERIFY] Remaining subisha2002.m BCC records: ${remainBcc[0].cnt}`);

  const [superadmins]: any = await conn.query(
    "SELECT employeeId, username, email, phno, role FROM `employee` WHERE `role` = 'superadmin'"
  );
  console.log('[VERIFY] Authoritative SuperAdmin Employee:', superadmins);

  await conn.end();
  console.log('--- Contact Isolation Database Migration Complete ---');
}

applyContactIsolation().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
