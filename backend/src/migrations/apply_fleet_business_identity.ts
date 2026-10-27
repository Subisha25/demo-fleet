import sequelize from '../config/dbConfig';
import { QueryTypes } from 'sequelize';

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const [result]: any = await sequelize.query(
    `SELECT COUNT(*) as count 
     FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'demodb' 
       AND TABLE_NAME = ? 
       AND COLUMN_NAME = ?`,
    { replacements: [tableName, columnName], type: QueryTypes.SELECT }
  );
  return Number(result?.count || 0) > 0;
}

export async function runMigration() {
  console.log('--- Applying Fleet Business Identity Additive Migration ---');

  // Columns for `tenants`
  const tenantColumns: { name: string; definition: string }[] = [
    { name: 'legalName', definition: 'VARCHAR(255) NULL AFTER name' },
    { name: 'displayName', definition: 'VARCHAR(255) NULL AFTER legalName' },
    { name: 'registeredAddress', definition: 'TEXT NULL AFTER displayName' },
    { name: 'gstin', definition: 'VARCHAR(20) NULL AFTER registeredAddress' },
    { name: 'panNumber', definition: 'VARCHAR(15) NULL AFTER gstin' },
    { name: 'sacCode', definition: "VARCHAR(10) NULL DEFAULT '996609' AFTER panNumber" },
    { name: 'website', definition: 'VARCHAR(255) NULL AFTER sacCode' },
    { name: 'businessEmail', definition: 'VARCHAR(255) NULL AFTER website' },
    { name: 'businessPhone', definition: 'VARCHAR(50) NULL AFTER businessEmail' },
    { name: 'billingFooterText', definition: 'TEXT NULL AFTER businessPhone' },
    { name: 'city', definition: 'VARCHAR(100) NULL AFTER billingFooterText' },
    { name: 'state', definition: 'VARCHAR(100) NULL AFTER city' },
    { name: 'pinCode', definition: 'VARCHAR(20) NULL AFTER state' },
    { name: 'logoUrl', definition: 'VARCHAR(500) NULL AFTER pinCode' },
  ];

  for (const col of tenantColumns) {
    const exists = await columnExists('tenants', col.name);
    if (!exists) {
      console.log(`Adding column '${col.name}' to tenants...`);
      await sequelize.query(`ALTER TABLE \`tenants\` ADD COLUMN \`${col.name}\` ${col.definition}`);
      console.log(`✓ Added '${col.name}' to tenants`);
    } else {
      console.log(`Column '${col.name}' already exists on tenants.`);
    }
  }

  // Columns for `tenant_registration_requests`
  const regColumns: { name: string; definition: string }[] = [
    { name: 'legalName', definition: 'VARCHAR(255) NULL AFTER fleetName' },
    { name: 'displayName', definition: 'VARCHAR(255) NULL AFTER legalName' },
    { name: 'registeredAddress', definition: 'TEXT NULL AFTER displayName' },
    { name: 'gstin', definition: 'VARCHAR(20) NULL AFTER registeredAddress' },
    { name: 'panNumber', definition: 'VARCHAR(15) NULL AFTER gstin' },
    { name: 'sacCode', definition: "VARCHAR(10) NULL DEFAULT '996609' AFTER panNumber" },
    { name: 'website', definition: 'VARCHAR(255) NULL AFTER sacCode' },
    { name: 'businessEmail', definition: 'VARCHAR(255) NULL AFTER website' },
    { name: 'businessPhone', definition: 'VARCHAR(50) NULL AFTER businessEmail' },
    { name: 'billingFooterText', definition: 'TEXT NULL AFTER businessPhone' },
    { name: 'pinCode', definition: 'VARCHAR(20) NULL AFTER state' },
    { name: 'logoUrl', definition: 'VARCHAR(500) NULL AFTER pinCode' },
  ];

  for (const col of regColumns) {
    const exists = await columnExists('tenant_registration_requests', col.name);
    if (!exists) {
      console.log(`Adding column '${col.name}' to tenant_registration_requests...`);
      await sequelize.query(`ALTER TABLE \`tenant_registration_requests\` ADD COLUMN \`${col.name}\` ${col.definition}`);
      console.log(`✓ Added '${col.name}' to tenant_registration_requests`);
    } else {
      console.log(`Column '${col.name}' already exists on tenant_registration_requests.`);
    }
  }

  console.log('✓ Fleet business identity schema migration completed successfully.');
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
