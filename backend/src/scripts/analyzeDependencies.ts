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

async function analyzeDependencies() {
  try {
    await sequelize.authenticate();

    // All tables
    const tablesResult = await sequelize.query<any>('SHOW TABLES;', { type: QueryTypes.SELECT });
    const tableKey = Object.keys(tablesResult[0])[0];
    const allTables: string[] = tablesResult.map((r: any) => r[tableKey]);

    // Foreign keys
    const fks = await sequelize.query<any>(
      `SELECT DISTINCT
        TABLE_NAME as childTable, 
        COLUMN_NAME as childColumn,
        REFERENCED_TABLE_NAME as parentTable, 
        REFERENCED_COLUMN_NAME as parentColumn
      FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE 
        TABLE_SCHEMA = :dbName 
        AND REFERENCED_TABLE_NAME IS NOT NULL;`,
      {
        replacements: { dbName: process.env.DB_NAME || 'demodb' },
        type: QueryTypes.SELECT
      }
    );

    console.log(`Found ${fks.length} foreign key relationships.`);

    // Candidate protected tables:
    const explicitlyProtected = [
      'employee',            // 1. employee
      'emailconfiguration',  // 2. Email configuration
      'configuration',       // 3. configuration
      'sms_logs',            // 4. SMS logs
      'notification_logs',   // 4. SMS logs / notification audit logs
      'sms_templates',       // 5. SMS templates
      'saas_plans',          // 6. SaaS plans
      'short_links',         // 7. Short links
      'tenant_sms_configs'   // SMS configuration
    ];

    console.log('\n--- Protected Tables Candidates ---');
    console.log(explicitlyProtected);

    // Check which tables are referenced by ANY table
    // For each table to clear, who references it?
    for (const table of allTables) {
      const children = fks.filter((fk: any) => fk.parentTable === table && fk.childTable !== table);
      const isProt = explicitlyProtected.includes(table);
      console.log(`Table: ${table.padEnd(30)} | Protected: ${isProt ? 'YES' : 'NO '} | Referenced by: ${children.map((c: any) => c.childTable).join(', ') || 'None'}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

analyzeDependencies();

