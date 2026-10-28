import { QueryInterface, DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig';

export const migrationName = '04_plan_limits_and_entitlements';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. saas_plans table
  const plansTable = 'saas_plans';
  const plansInfo = await queryInterface.describeTable(plansTable);

  if (!plansInfo['maxTaxes']) {
    console.log(`[Migration ${migrationName}] Adding 'maxTaxes' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'maxTaxes', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
  }

  if (!plansInfo['isUnlimitedTaxes']) {
    console.log(`[Migration ${migrationName}] Adding 'isUnlimitedTaxes' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'isUnlimitedTaxes', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }

  if (!plansInfo['themeLevel']) {
    console.log(`[Migration ${migrationName}] Adding 'themeLevel' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'themeLevel', {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'STANDARD',
    });
  }

  if (!plansInfo['maxPickupAreas']) {
    console.log(`[Migration ${migrationName}] Adding 'maxPickupAreas' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'maxPickupAreas', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    });
  }

  if (!plansInfo['isUnlimitedPickupAreas']) {
    console.log(`[Migration ${migrationName}] Adding 'isUnlimitedPickupAreas' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'isUnlimitedPickupAreas', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }

  if (!plansInfo['maxPickupCities']) {
    console.log(`[Migration ${migrationName}] Adding 'maxPickupCities' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'maxPickupCities', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    });
  }

  if (!plansInfo['isUnlimitedPickupCities']) {
    console.log(`[Migration ${migrationName}] Adding 'isUnlimitedPickupCities' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'isUnlimitedPickupCities', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }

  if (!plansInfo['maxPackages']) {
    console.log(`[Migration ${migrationName}] Adding 'maxPackages' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'maxPackages', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    });
  }

  if (!plansInfo['isUnlimitedPackages']) {
    console.log(`[Migration ${migrationName}] Adding 'isUnlimitedPackages' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'isUnlimitedPackages', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }

  if (!plansInfo['maxPaymentModes']) {
    console.log(`[Migration ${migrationName}] Adding 'maxPaymentModes' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'maxPaymentModes', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    });
  }

  if (!plansInfo['isUnlimitedPaymentModes']) {
    console.log(`[Migration ${migrationName}] Adding 'isUnlimitedPaymentModes' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'isUnlimitedPaymentModes', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }

  if (!plansInfo['annualTripQuota']) {
    console.log(`[Migration ${migrationName}] Adding 'annualTripQuota' to ${plansTable}...`);
    await queryInterface.addColumn(plansTable, 'annualTripQuota', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  }

  // 2. tenant_subscriptions table
  const subTable = 'tenant_subscriptions';
  const subInfo = await queryInterface.describeTable(subTable);

  if (!subInfo['taxQuota']) {
    console.log(`[Migration ${migrationName}] Adding 'taxQuota' to ${subTable}...`);
    await queryInterface.addColumn(subTable, 'taxQuota', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
  }

  if (!subInfo['isUnlimitedVehicles']) {
    console.log(`[Migration ${migrationName}] Adding 'isUnlimitedVehicles' to ${subTable}...`);
    await queryInterface.addColumn(subTable, 'isUnlimitedVehicles', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }

  if (!subInfo['isUnlimitedTrips']) {
    console.log(`[Migration ${migrationName}] Adding 'isUnlimitedTrips' to ${subTable}...`);
    await queryInterface.addColumn(subTable, 'isUnlimitedTrips', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }

  if (!subInfo['isUnlimitedTaxes']) {
    console.log(`[Migration ${migrationName}] Adding 'isUnlimitedTaxes' to ${subTable}...`);
    await queryInterface.addColumn(subTable, 'isUnlimitedTaxes', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }

  // 3. Update existing Basic, Pro, Enterprise records to conform to confirmed starting requirements
  // Basic: 15 vehicles, 100 bookings/mo, 1 tax configuration, STANDARD theme
  await sequelize.query(`
    UPDATE \`saas_plans\`
    SET \`maxVehicles\` = 15,
        \`isUnlimitedVehicles\` = 0,
        \`monthlyTripQuota\` = 100,
        \`isUnlimitedTrips\` = 0,
        \`maxTaxes\` = 1,
        \`isUnlimitedTaxes\` = 0,
        \`themeLevel\` = 'STANDARD',
        \`featureEntitlements\` = JSON_SET(
          COALESCE(\`featureEntitlements\`, '{}'),
          '$.customBranding', false,
          '$.themeLevel', 'STANDARD',
          '$.pdfCustomizationTier', 'STANDARD',
          '$.advancedReports', false,
          '$.emailTemplates', false,
          '$.smsTemplates', false,
          '$.bulkUpload', false,
          '$.monthlyInvoicing', false,
          '$.onCallInvoicing', false
        )
    WHERE \`planTier\` = 'BASIC'
  `);

  // Pro: Configurable vehicles (75), 250 bookings/mo (user-confirmed), 2 tax configurations, PRESETS theme
  await sequelize.query(`
    UPDATE \`saas_plans\`
    SET \`maxVehicles\` = 75,
        \`isUnlimitedVehicles\` = 0,
        \`monthlyTripQuota\` = 250,
        \`isUnlimitedTrips\` = 0,
        \`maxTaxes\` = 2,
        \`isUnlimitedTaxes\` = 0,
        \`themeLevel\` = 'PRESETS',
        \`featureEntitlements\` = JSON_SET(
          COALESCE(\`featureEntitlements\`, '{}'),
          '$.customBranding', true,
          '$.themeLevel', 'PRESETS',
          '$.themePresets', JSON_ARRAY('terracotta', 'emerald', 'slate', 'indigo'),
          '$.pdfCustomizationTier', 'BRANDED',
          '$.advancedReports', true,
          '$.emailTemplates', true,
          '$.smsTemplates', true,
          '$.bulkUpload', true,
          '$.monthlyInvoicing', true,
          '$.onCallInvoicing', true
        )
    WHERE \`planTier\` = 'PRO'
  `);

  // Enterprise: Unlimited vehicles, bookings, tax configurations, CUSTOM theme
  await sequelize.query(`
    UPDATE \`saas_plans\`
    SET \`maxVehicles\` = 0,
        \`isUnlimitedVehicles\` = 1,
        \`monthlyTripQuota\` = 0,
        \`isUnlimitedTrips\` = 1,
        \`maxTaxes\` = 0,
        \`isUnlimitedTaxes\` = 1,
        \`isUnlimitedDrivers\` = 1,
        \`isUnlimitedCompanies\` = 1,
        \`isUnlimitedUsers\` = 1,
        \`isUnlimitedPickupAreas\` = 1,
        \`isUnlimitedPickupCities\` = 1,
        \`isUnlimitedPackages\` = 1,
        \`isUnlimitedPaymentModes\` = 1,
        \`themeLevel\` = 'CUSTOM',
        \`featureEntitlements\` = JSON_SET(
          COALESCE(\`featureEntitlements\`, '{}'),
          '$.customBranding', true,
          '$.themeLevel', 'CUSTOM',
          '$.themePresets', JSON_ARRAY('terracotta', 'emerald', 'slate', 'indigo'),
          '$.pdfCustomizationTier', 'ADVANCED',
          '$.advancedReports', true,
          '$.emailTemplates', true,
          '$.smsTemplates', true,
          '$.bulkUpload', true,
          '$.monthlyInvoicing', true,
          '$.onCallInvoicing', true,
          '$.customDomain', true,
          '$.multiBranch', true,
          '$.dedicatedPolicyEngine', true
        )
    WHERE \`planTier\` = 'ENTERPRISE'
  `);

  // Synchronize Enterprise subscriptions so isUnlimited flags reflect explicitly
  await sequelize.query(`
    UPDATE \`tenant_subscriptions\`
    SET \`isUnlimitedVehicles\` = 1,
        \`isUnlimitedTrips\` = 1,
        \`isUnlimitedTaxes\` = 1
    WHERE \`planTier\` = 'ENTERPRISE'
  `);

  // Synchronize Basic & Pro subscriptions tax quotas
  await sequelize.query(`
    UPDATE \`tenant_subscriptions\`
    SET \`taxQuota\` = 1,
        \`isUnlimitedVehicles\` = 0,
        \`isUnlimitedTrips\` = 0,
        \`isUnlimitedTaxes\` = 0
    WHERE \`planTier\` = 'BASIC'
  `);

  await sequelize.query(`
    UPDATE \`tenant_subscriptions\`
    SET \`taxQuota\` = 2,
        \`isUnlimitedVehicles\` = 0,
        \`isUnlimitedTrips\` = 0,
        \`isUnlimitedTaxes\` = 0
    WHERE \`planTier\` = 'PRO'
  `);

  console.log(`[Migration ${migrationName}] ✅ Plan limits and entitlements updated successfully.`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const subTable = 'tenant_subscriptions';
  const subInfo = await queryInterface.describeTable(subTable);

  if (subInfo['isUnlimitedTaxes']) await queryInterface.removeColumn(subTable, 'isUnlimitedTaxes');
  if (subInfo['isUnlimitedTrips']) await queryInterface.removeColumn(subTable, 'isUnlimitedTrips');
  if (subInfo['isUnlimitedVehicles']) await queryInterface.removeColumn(subTable, 'isUnlimitedVehicles');
  if (subInfo['taxQuota']) await queryInterface.removeColumn(subTable, 'taxQuota');

  const plansTable = 'saas_plans';
  const plansInfo = await queryInterface.describeTable(plansTable);

  if (plansInfo['annualTripQuota']) await queryInterface.removeColumn(plansTable, 'annualTripQuota');
  if (plansInfo['isUnlimitedPaymentModes']) await queryInterface.removeColumn(plansTable, 'isUnlimitedPaymentModes');
  if (plansInfo['maxPaymentModes']) await queryInterface.removeColumn(plansTable, 'maxPaymentModes');
  if (plansInfo['isUnlimitedPackages']) await queryInterface.removeColumn(plansTable, 'isUnlimitedPackages');
  if (plansInfo['maxPackages']) await queryInterface.removeColumn(plansTable, 'maxPackages');
  if (plansInfo['isUnlimitedPickupCities']) await queryInterface.removeColumn(plansTable, 'isUnlimitedPickupCities');
  if (plansInfo['maxPickupCities']) await queryInterface.removeColumn(plansTable, 'maxPickupCities');
  if (plansInfo['isUnlimitedPickupAreas']) await queryInterface.removeColumn(plansTable, 'isUnlimitedPickupAreas');
  if (plansInfo['maxPickupAreas']) await queryInterface.removeColumn(plansTable, 'maxPickupAreas');
  if (plansInfo['themeLevel']) await queryInterface.removeColumn(plansTable, 'themeLevel');
  if (plansInfo['isUnlimitedTaxes']) await queryInterface.removeColumn(plansTable, 'isUnlimitedTaxes');
  if (plansInfo['maxTaxes']) await queryInterface.removeColumn(plansTable, 'maxTaxes');

  console.log(`[Rollback ${migrationName}] ✅ Columns rolled back.`);
}
