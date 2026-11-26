import sequelize from '../config/dbConfig';

async function updateRootTenant() {
  try {
    await sequelize.query(`
      UPDATE tenants 
      SET name = 'CABZ Primary',
          legalName = 'CABZ Smart Fleet Mobility',
          displayName = 'CABZ Primary',
          code = 'CZ',
          subdomain = 'cabz'
      WHERE tenantId = 'e7b8a1c0-0000-0000-0000-000000000001'
    `);
    console.log('Successfully updated root tenant e7b8a1c0-0000-0000-0000-000000000001 to CABZ Primary.');
  } catch (err) {
    console.error('Error updating root tenant:', err);
  } finally {
    await sequelize.close();
  }
}

updateRootTenant();
