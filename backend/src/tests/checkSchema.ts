import sequelize from '../config/dbConfig';

async function check() {
  try {
    await sequelize.query(
      "ALTER TABLE employee ADD COLUMN tenantId VARCHAR(36) NULL DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001'"
    );
    console.log('Added tenantId to employee table.');
  } catch (err: any) {
    if (err.message.includes('Duplicate column')) {
      console.log('tenantId column already exists in employee.');
    } else {
      console.error('Error adding column:', err.message);
    }
  }

  const [cols]: any = await sequelize.query("SHOW COLUMNS FROM employee LIKE 'tenantId'");
  console.log('employee tenantId col now:', cols);

  await sequelize.close();
}

check().catch(console.error);



