import { QueryInterface, DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig';

export const migrationName = '03_superadmin_profile_fields';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const table = 'employee';
  const tableInfo = await queryInterface.describeTable(table);

  if (!tableInfo['address']) {
    console.log(`[Migration ${migrationName}] Adding 'address' column to ${table}...`);
    await queryInterface.addColumn(table, 'address', {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    });
  }

  if (!tableInfo['gstin']) {
    console.log(`[Migration ${migrationName}] Adding 'gstin' column to ${table}...`);
    await queryInterface.addColumn(table, 'gstin', {
      type: DataTypes.STRING(15),
      allowNull: true,
      defaultValue: null,
    });
  }

  if (!tableInfo['profileImage']) {
    console.log(`[Migration ${migrationName}] Adding 'profileImage' column to ${table}...`);
    await queryInterface.addColumn(table, 'profileImage', {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    });
  }

  // Verify and ensure root platform SuperAdmin record has intended contact details
  await sequelize.query(`
    UPDATE \`employee\`
    SET \`phno\` = '9080280818',
        \`email\` = 'subisha2002.m@gmail.com'
    WHERE \`role\` = 'superadmin' AND \`tenantId\` = 'e7b8a1c0-0000-0000-0000-000000000001'
  `);
  console.log(`[Migration ${migrationName}] SuperAdmin employee record verified with phno=9080280818 and email=subisha2002.m@gmail.com.`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const table = 'employee';
  const tableInfo = await queryInterface.describeTable(table);

  if (tableInfo['profileImage']) {
    console.log(`[Rollback ${migrationName}] Dropping 'profileImage' column from ${table}...`);
    await queryInterface.removeColumn(table, 'profileImage');
  }

  if (tableInfo['gstin']) {
    console.log(`[Rollback ${migrationName}] Dropping 'gstin' column from ${table}...`);
    await queryInterface.removeColumn(table, 'gstin');
  }

  if (tableInfo['address']) {
    console.log(`[Rollback ${migrationName}] Dropping 'address' column from ${table}...`);
    await queryInterface.removeColumn(table, 'address');
  }
}
