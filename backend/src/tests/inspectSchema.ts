import { sequelize } from '../models';

async function check() {
  await sequelize.authenticate();
  const [tenants]: any = await sequelize.query('SELECT tenantId, name, displayName, code, subdomain FROM tenants');
  console.log('EXISTING TENANTS:', JSON.stringify(tenants, null, 2));
  process.exit(0);
}
check();
