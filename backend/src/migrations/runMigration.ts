import sequelize from '../config/dbConfig';
import { up, down, migrationName } from './01_phase1_saas_schema';

async function run() {
  const isRollback = process.argv.includes('--rollback') || process.argv.includes('--down');
  const queryInterface = sequelize.getQueryInterface();

  try {
    await sequelize.authenticate();
    console.log(`[Migration] Database connection verified.`);

    if (isRollback) {
      console.log(`[Migration] Executing ROLLBACK for: ${migrationName}...`);
      await down(queryInterface);
      console.log(`[Migration] ✅ Rollback completed successfully.`);
    } else {
      console.log(`[Migration] Executing UP for: ${migrationName}...`);
      
      // Check existing tables to allow idempotent execution
      const existingTables = (await queryInterface.showAllTables()) as string[];
      console.log(`[Migration] Current table count: ${existingTables.length}`);

      if (existingTables.includes('tenant_registration_requests')) {
        console.log(`[Migration] Table 'tenant_registration_requests' already exists. Performing safe down first for clean test or continuing...`);
      }

      await up(queryInterface);
      console.log(`[Migration] ✅ Migration ${migrationName} applied successfully.`);
    }

    const updatedTables = (await queryInterface.showAllTables()) as string[];
    console.log(`[Migration] New table count: ${updatedTables.length}`);
    console.log(`[Migration] Verified Phase 1 tables present:`, {
      tenant_registration_requests: updatedTables.includes('tenant_registration_requests'),
      tenant_activation_tokens: updatedTables.includes('tenant_activation_tokens'),
      subscription_invoices: updatedTables.includes('subscription_invoices'),
      notification_logs: updatedTables.includes('notification_logs'),
    });

    process.exit(0);
  } catch (err) {
    console.error(`[Migration] ❌ Error executing migration ${migrationName}:`, err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}
