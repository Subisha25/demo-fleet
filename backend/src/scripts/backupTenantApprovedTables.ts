import { Sequelize, QueryTypes } from 'sequelize';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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

async function runBackup() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL successfully.');

    const approvedTables = [
      'tenants',
      'tenant_activation_tokens',
      'tenant_initial_allowance',
      'tenant_registration_requests'
    ];

    const backupData: Record<string, any[]> = {};
    const rowCounts: Record<string, number> = {};

    for (const table of approvedTables) {
      const rows = await sequelize.query(`SELECT * FROM \`${table}\``, {
        type: QueryTypes.SELECT
      });
      backupData[table] = rows;
      rowCounts[table] = rows.length;
      console.log(`Table ${table}: ${rows.length} rows`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFilePath = path.join(backupDir, `backup_approved_tenant_tables_${timestamp}.json`);
    fs.writeFileSync(backupFilePath, JSON.stringify({
      createdAt: new Date().toISOString(),
      database: process.env.DB_NAME || 'demodb',
      approvedTables,
      rowCounts,
      data: backupData
    }, null, 2), 'utf-8');

    console.log(`Backup saved successfully to: ${backupFilePath}`);

    // Verify backup
    const readBack = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));
    let verified = true;
    for (const table of approvedTables) {
      if (readBack.rowCounts[table] !== rowCounts[table] || readBack.data[table].length !== rowCounts[table]) {
        verified = false;
        console.error(`Verification failed for ${table}!`);
      }
    }

    if (verified) {
      console.log('Backup VERIFIED successfully. Row counts match exactly:');
      console.table(rowCounts);
    } else {
      throw new Error('Backup verification failed!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Backup error:', err);
    process.exit(1);
  }
}

runBackup();
