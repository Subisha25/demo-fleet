import sequelize from '../config/dbConfig';

export const migrationName = '05_otp_security_and_hardening';

export async function up() {
  const queryInterface = sequelize.getQueryInterface();
  const [cols]: any = await sequelize.query('DESCRIBE otp');
  const colNames = cols.map((c: any) => c.Field);

  // 1. Modify otp column to VARCHAR(255)
  console.log('[Migration 05] Modifying otp column to VARCHAR(255)...');
  await sequelize.query('ALTER TABLE otp MODIFY COLUMN otp VARCHAR(255) NULL');

  // 2. Add attempts column if not present
  if (!colNames.includes('attempts')) {
    console.log('[Migration 05] Adding attempts column...');
    await sequelize.query('ALTER TABLE otp ADD COLUMN attempts INT DEFAULT 0 AFTER sessionId');
  }

  // 3. Add verifiedAt column if not present
  if (!colNames.includes('verifiedAt')) {
    console.log('[Migration 05] Adding verifiedAt column...');
    await sequelize.query('ALTER TABLE otp ADD COLUMN verifiedAt DATETIME NULL AFTER attempts');
  }

  // 4. Add resetToken column if not present
  if (!colNames.includes('resetToken')) {
    console.log('[Migration 05] Adding resetToken column...');
    await sequelize.query('ALTER TABLE otp ADD COLUMN resetToken VARCHAR(255) NULL AFTER verifiedAt');
  }

  console.log('[Migration 05] ✅ Table otp successfully hardened for secure hashed OTPs and attempt tracking.');
}

export async function down() {
  console.log('[Migration 05] Down migration - no-op to preserve security');
}

if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

