import sequelize from '../config/dbConfig';
import { QueryTypes } from 'sequelize';

export function slugifyFleetName(name: string): string {
  if (!name) return 'fleet';
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-')   // replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
  return slug || 'fleet';
}

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
  console.log('--- Applying Slug and Concurrency-Safe Initial Allowance Migration ---');

  // 1. Add slug to tenants
  const tenantSlugExists = await columnExists('tenants', 'slug');
  if (!tenantSlugExists) {
    console.log("Adding column 'slug' to tenants table...");
    await sequelize.query(
      'ALTER TABLE `tenants` ADD COLUMN `slug` VARCHAR(150) NULL UNIQUE AFTER `subdomain`'
    );
    console.log("✓ Added 'slug' column to tenants");
  } else {
    console.log("Column 'slug' already exists on tenants");
  }

  // 2. Add slug to tenant_registration_requests
  const regSlugExists = await columnExists('tenant_registration_requests', 'slug');
  if (!regSlugExists) {
    console.log("Adding column 'slug' to tenant_registration_requests table...");
    await sequelize.query(
      'ALTER TABLE `tenant_registration_requests` ADD COLUMN `slug` VARCHAR(150) NULL AFTER `fleetName`'
    );
    console.log("✓ Added 'slug' column to tenant_registration_requests");
  } else {
    console.log("Column 'slug' already exists on tenant_registration_requests");
  }

  // 3. Create tenant_initial_allowance table
  console.log('Ensuring tenant_initial_allowance table exists...');
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`tenant_initial_allowance\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`tenantId\` VARCHAR(50) NOT NULL,
      \`module\` VARCHAR(30) NOT NULL,
      \`usedCount\` INT NOT NULL DEFAULT 1,
      \`firstUsedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`lastUsedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY \`uq_tenant_module\` (\`tenantId\`, \`module\`),
      INDEX \`idx_allowance_tenant\` (\`tenantId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ tenant_initial_allowance table ready');

  // 4. Backfill existing tenants with canonical slugs
  const [tenants]: any = await sequelize.query(
    'SELECT tenantId, name, displayName, subdomain, slug FROM `tenants`'
  );

  const usedSlugs = new Set<string>();

  for (const t of tenants) {
    if (t.slug && t.slug.trim()) {
      usedSlugs.add(t.slug.trim().toLowerCase());
    }
  }

  for (const t of tenants) {
    if (!t.slug || !t.slug.trim()) {
      let baseName = t.displayName || t.name || t.subdomain || 'fleet';
      if (t.tenantId === 'e7b8a1c0-0000-0000-0000-000000000001') {
        baseName = 'grace-cabs';
      }
      let candidate = slugifyFleetName(baseName);
      let suffix = 1;
      let finalSlug = candidate;

      while (usedSlugs.has(finalSlug)) {
        suffix++;
        finalSlug = `${candidate}-${suffix}`;
      }

      usedSlugs.add(finalSlug);
      await sequelize.query(
        'UPDATE `tenants` SET `slug` = ? WHERE `tenantId` = ?',
        { replacements: [finalSlug, t.tenantId] }
      );
      console.log(`Assigned canonical slug '${finalSlug}' to tenant: ${t.name} (${t.tenantId})`);
    }
  }

  console.log('✓ Migration completed successfully.');
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
