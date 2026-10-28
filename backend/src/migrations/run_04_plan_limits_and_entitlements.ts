import sequelize from '../config/dbConfig';
import { up, down, migrationName } from './04_plan_limits_and_entitlements';

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

    const plansInfo = await queryInterface.describeTable('saas_plans');
    console.log(`[Migration] Verified saas_plans columns:`, {
      maxTaxes: !!plansInfo['maxTaxes'],
      isUnlimitedTaxes: !!plansInfo['isUnlimitedTaxes'],
      themeLevel: !!plansInfo['themeLevel'],
      maxPickupAreas: !!plansInfo['maxPickupAreas'],
      maxPickupCities: !!plansInfo['maxPickupCities'],
      maxPackages: !!plansInfo['maxPackages'],
      maxPaymentModes: !!plansInfo['maxPaymentModes'],
    });

    const subInfo = await queryInterface.describeTable('tenant_subscriptions');
    console.log(`[Migration] Verified tenant_subscriptions columns:`, {
      taxQuota: !!subInfo['taxQuota'],
      isUnlimitedVehicles: !!subInfo['isUnlimitedVehicles'],
      isUnlimitedTrips: !!subInfo['isUnlimitedTrips'],
      isUnlimitedTaxes: !!subInfo['isUnlimitedTaxes'],
    });

    process.exit(0);
  } catch (err) {
    console.error(`[Migration] ❌ Error executing migration ${migrationName}:`, err);
    process.exit(1);
  }
}

run();
