import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'demodb',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function checkTruncateEligibility() {
  try {
    await sequelize.authenticate();

    // Query all tables referenced by any foreign key in demodb
    const referencedTablesResult: any = await sequelize.query(
      `SELECT DISTINCT REFERENCED_TABLE_NAME as tableName
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = :dbName AND REFERENCED_TABLE_NAME IS NOT NULL;`,
      {
        replacements: { dbName: process.env.DB_NAME || 'demodb' },
        type: QueryTypes.SELECT
      }
    );

    const referencedTables = new Set(referencedTablesResult.map((r: any) => r.tableName));
    console.log('Tables referenced by foreign keys (cannot TRUNCATE without disabling FK checks):');
    console.log(Array.from(referencedTables).sort());

    const tablesResult = await sequelize.query<any>('SHOW TABLES;', { type: QueryTypes.SELECT });
    const tableKey = Object.keys(tablesResult[0])[0];
    const allTables: string[] = tablesResult.map((r: any) => r[tableKey]).sort();

    const protectedTables = [
      'employee',
      'emailconfiguration',
      'configuration',
      'sms_logs',
      'sms_templates',
      'saas_plans',
      'short_links'
    ];

    const tablesToClear = allTables.filter((t) => !protectedTables.includes(t));

    console.log(`\nTotal tables to clear: ${tablesToClear.length}`);

    const truncateCandidates: string[] = [];
    const deleteRequired: string[] = [];

    for (const t of tablesToClear) {
      if (referencedTables.has(t)) {
        deleteRequired.push(t);
      } else {
        truncateCandidates.push(t);
      }
    }

    console.log(`\nTables eligible for TRUNCATE (${truncateCandidates.length}):`, truncateCandidates);
    console.log(`\nTables requiring DELETE due to FK restrictions (${deleteRequired.length}):`, deleteRequired);

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

checkTruncateEligibility();

