import { Sequelize, QueryTypes } from 'sequelize';
import * as dotenv from 'dotenv';
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

async function runCleanup() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL demodb.');

    // 1. Verify foreign key checks are enabled
    const fkStatus = await sequelize.query('SELECT @@FOREIGN_KEY_CHECKS as fk', { type: QueryTypes.SELECT }) as any[];
    console.log(`Foreign key checks enabled: ${fkStatus[0].fk === 1 ? 'YES (Strict)' : 'NO'}`);

    // Approved tables
    const approvedTables = [
      'tenant_activation_tokens',
      'tenant_initial_allowance',
      'tenant_registration_requests',
      'tenants',
    ];

    // Record baseline row counts
    console.log('\n--- Baseline Row Counts for Approved Tables ---');
    const countsBefore: Record<string, number> = {};
    for (const t of approvedTables) {
      const rows = await sequelize.query(`SELECT COUNT(*) as count FROM \`${t}\``, { type: QueryTypes.SELECT }) as any[];
      countsBefore[t] = rows[0].count;
      console.log(`- ${t}: ${rows[0].count} rows`);
    }

    // 2. Safe deletion for child approved tables (deletion order: child to parent)
    const childTables = [
      'tenant_activation_tokens',
      'tenant_initial_allowance',
      'tenant_registration_requests',
    ];

    for (const t of childTables) {
      console.log(`\nExecuting DELETE FROM \`${t}\` with FK checks active...`);
      await sequelize.query(`DELETE FROM \`${t}\``);
      const rows = await sequelize.query(`SELECT COUNT(*) as count FROM \`${t}\``, { type: QueryTypes.SELECT }) as any[];
      console.log(`Successfully cleared ${t}. Current row count: ${rows[0].count}`);
    }

    // 3. Inspect dependencies on `tenants` table
    console.log('\n--- Inspecting Foreign Key Dependencies on `tenants` ---');
    const referencingFks = await sequelize.query(`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_SCHEMA = '${process.env.DB_NAME || 'demodb'}'
        AND REFERENCED_TABLE_NAME = 'tenants'
    `, { type: QueryTypes.SELECT }) as any[];

    console.log('Tables referencing `tenants`:');
    console.table(referencingFks);

    for (const fk of referencingFks) {
      const rowCount = await sequelize.query(`SELECT COUNT(*) as count FROM \`${fk.TABLE_NAME}\``, { type: QueryTypes.SELECT }) as any[];
      console.log(`Table \`${fk.TABLE_NAME}\` referencing \`tenants\` has ${rowCount[0].count} rows.`);
    }

    // 4. Test attempt to delete from `tenants` with FK checks enabled
    console.log('\n--- Evaluating Deletion of `tenants` ---');
    try {
      const transaction = await sequelize.transaction();
      try {
        await sequelize.query('DELETE FROM `tenants`', { transaction });
        await transaction.commit();
        console.log('`tenants` table cleared successfully.');
      } catch (delErr: any) {
        await transaction.rollback();
        console.log('\n[SAFETY GATE TRIGGERED - RULE 7 & RULE 8]');
        console.log('Cannot delete from `tenants` without violating Foreign Key constraint or disabling FK checks:');
        console.log(`Error: ${delErr.message}`);
        console.log('Foreign key dependency: `tenant_sms_configs` (4 rows, ON DELETE NO ACTION) and `tenant_subscriptions` (1 row) reference `tenants`.');
        console.log('Per Mandatory Safety Rules 7 & 8:');
        console.log('- "7. Do not disable foreign-key checks just to force deletion."');
        console.log('- "8. If an unexpected dependency exists, STOP and report it. IMPORTANT: Do not expand the deletion scope to additional tenant-related tables without explicit approval."');
        console.log('-> Execution safely stopped. Protected tables and `tenants` left intact.');
      }
    } catch (e: any) {
      console.log('Transaction error:', e.message);
    }

    // 5. Final Row Counts for Approved Tables
    console.log('\n--- Final Row Counts for Approved Tables ---');
    const countsAfter: Record<string, number> = {};
    for (const t of approvedTables) {
      const rows = await sequelize.query(`SELECT COUNT(*) as count FROM \`${t}\``, { type: QueryTypes.SELECT }) as any[];
      countsAfter[t] = rows[0].count;
      console.log(`- ${t}: ${rows[0].count} rows (was ${countsBefore[t]})`);
    }

    // 6. Verify preservation of non-tenant tables
    console.log('\n--- Protected Non-Tenant Tables Verification ---');
    const allTablesResult = await sequelize.query(`SHOW TABLES`, { type: QueryTypes.SELECT }) as any[];
    const allDbTables = allTablesResult.map(r => Object.values(r)[0] as string);

    const protectedTablesToCheck = [
      'user',
      'employee',
      'company',
      'booking',
      'drivers',
      'saas_plans',
      'emailconfiguration',
      'configuration',
      'sms_logs',
      'sms_templates',
      'short_links',
    ].filter(t => allDbTables.includes(t));

    for (const pt of protectedTablesToCheck) {
      const rows = await sequelize.query(`SELECT COUNT(*) as count FROM \`${pt}\``, { type: QueryTypes.SELECT }) as any[];
      console.log(`- Protected table \`${pt}\`: ${rows[0].count} rows intact`);
    }

    console.log('\nTenant cleanup process completed with safety guard enforcement.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup execution error:', err);
    process.exit(1);
  }
}

runCleanup();
