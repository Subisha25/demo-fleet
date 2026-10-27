import sequelize from '../config/dbConfig';
import { up, down, migrationName } from './03_superadmin_profile_fields';

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
      await up(queryInterface);
      console.log(`[Migration] ✅ Migration ${migrationName} applied successfully.`);
    }

    const tableInfo = await queryInterface.describeTable('employee');
    console.log(`[Migration] Verified employee columns:`, {
      address: !!tableInfo['address'],
      gstin: !!tableInfo['gstin'],
      profileImage: !!tableInfo['profileImage'],
    });

    process.exit(0);
  } catch (err) {
    console.error(`[Migration] ❌ Error executing migration ${migrationName}:`, err);
    process.exit(1);
  }
}

run();
