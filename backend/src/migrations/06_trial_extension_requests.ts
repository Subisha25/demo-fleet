import sequelize from '../config/dbConfig';

export async function up() {
  console.log('Running migration 06_trial_extension_requests...');
  const queryInterface = sequelize.getQueryInterface();

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`trial_extension_requests\` (
      \`requestId\` VARCHAR(36) NOT NULL,
      \`tenantId\` VARCHAR(36) NOT NULL,
      \`requestedDays\` INT NOT NULL,
      \`approvedDays\` INT DEFAULT NULL,
      \`reason\` TEXT NOT NULL,
      \`status\` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
      \`requestedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`reviewedBy\` VARCHAR(255) DEFAULT NULL,
      \`reviewedAt\` DATETIME DEFAULT NULL,
      \`previousExpiry\` DATETIME NOT NULL,
      \`newExpiry\` DATETIME DEFAULT NULL,
      \`extensionType\` ENUM('REQUEST_APPROVED', 'MANUAL_SUPERADMIN', 'REJECTED') DEFAULT NULL,
      \`adminNotes\` TEXT DEFAULT NULL,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`requestId\`),
      KEY \`idx_trial_ext_tenant\` (\`tenantId\`),
      KEY \`idx_trial_ext_status\` (\`status\`),
      KEY \`idx_trial_ext_created\` (\`createdAt\`),
      CONSTRAINT \`fk_trial_ext_tenant\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\` (\`tenantId\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Migration 06_trial_extension_requests executed successfully.');
}

if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
