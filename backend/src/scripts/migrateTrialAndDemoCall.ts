import sequelize from '../config/dbConfig';

async function runMigration() {
  console.log('Connecting to database...');
  await sequelize.authenticate();
  console.log('Connected to database successfully.');

  // 1. Check & add columns to tenant_registration_requests
  const [existingRegCols]: any[] = await sequelize.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tenant_registration_requests'
  `);
  const regColNames = existingRegCols.map((r: any) => r.COLUMN_NAME);
  console.log('Existing columns in tenant_registration_requests count:', regColNames.length);

  if (!regColNames.includes('demoCallDate')) {
    console.log('Adding demoCallDate to tenant_registration_requests...');
    await sequelize.query(`ALTER TABLE tenant_registration_requests ADD COLUMN demoCallDate VARCHAR(20) NULL AFTER fleetSize;`);
  } else {
    console.log('demoCallDate already exists.');
  }

  if (!regColNames.includes('demoCallTime')) {
    console.log('Adding demoCallTime to tenant_registration_requests...');
    await sequelize.query(`ALTER TABLE tenant_registration_requests ADD COLUMN demoCallTime VARCHAR(30) NULL AFTER demoCallDate;`);
  } else {
    console.log('demoCallTime already exists.');
  }

  if (!regColNames.includes('demoCallStatus')) {
    console.log('Adding demoCallStatus to tenant_registration_requests...');
    await sequelize.query(`ALTER TABLE tenant_registration_requests ADD COLUMN demoCallStatus ENUM('Requested', 'Confirmed', 'Completed', 'Rescheduled', 'Cancelled') DEFAULT 'Requested' AFTER demoCallTime;`);
  } else {
    console.log('demoCallStatus already exists.');
  }

  // 2. Check & add columns to tenant_subscriptions
  const [existingSubCols]: any[] = await sequelize.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tenant_subscriptions'
  `);
  const subColNames = existingSubCols.map((r: any) => r.COLUMN_NAME);
  console.log('Existing columns in tenant_subscriptions count:', subColNames.length);

  if (!subColNames.includes('trialStartDate')) {
    console.log('Adding trialStartDate to tenant_subscriptions...');
    await sequelize.query(`ALTER TABLE tenant_subscriptions ADD COLUMN trialStartDate DATETIME NULL AFTER trialEndsAt;`);
  } else {
    console.log('trialStartDate already exists.');
  }

  if (!subColNames.includes('trialDurationDays')) {
    console.log('Adding trialDurationDays to tenant_subscriptions...');
    await sequelize.query(`ALTER TABLE tenant_subscriptions ADD COLUMN trialDurationDays INT NOT NULL DEFAULT 7 AFTER trialStartDate;`);
  } else {
    console.log('trialDurationDays already exists.');
  }

  if (!subColNames.includes('trialExtensionHistory')) {
    console.log('Adding trialExtensionHistory to tenant_subscriptions...');
    await sequelize.query(`ALTER TABLE tenant_subscriptions ADD COLUMN trialExtensionHistory JSON NULL AFTER trialDurationDays;`);
  } else {
    console.log('trialExtensionHistory already exists.');
  }

  console.log('Migration completed successfully.');
  await sequelize.close();
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
