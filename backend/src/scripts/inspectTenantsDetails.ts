import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'demodb',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function inspectTenantsDetails() {
  try {
    await sequelize.authenticate();
    const tenants: any = await sequelize.query(
      'SELECT tenantId, name, slug, status, planTier, createdAt FROM tenants ORDER BY createdAt ASC LIMIT 20;',
      { type: QueryTypes.SELECT }
    );
    console.log('Oldest 20 tenants:');
    console.table(tenants);

    const newest: any = await sequelize.query(
      'SELECT tenantId, name, slug, status, planTier, createdAt FROM tenants ORDER BY createdAt DESC LIMIT 10;',
      { type: QueryTypes.SELECT }
    );
    console.log('Newest 10 tenants:');
    console.table(newest);

    // Check which tenants are referenced by employee
    const empTenants: any = await sequelize.query(
      'SELECT DISTINCT tenantId FROM employee;',
      { type: QueryTypes.SELECT }
    );
    console.log('Tenants referenced by employee:', empTenants);

    // Check which tenants are referenced by tenant_sms_configs
    const smsTenants: any = await sequelize.query(
      'SELECT DISTINCT tenantId FROM tenant_sms_configs;',
      { type: QueryTypes.SELECT }
    );
    console.log('Tenants referenced by tenant_sms_configs:', smsTenants);

    // Check which tenants are referenced by emailconfiguration
    const emailTenants: any = await sequelize.query(
      'SELECT DISTINCT tenantId FROM emailconfiguration;',
      { type: QueryTypes.SELECT }
    );
    console.log('Tenants referenced by emailconfiguration:', emailTenants);

    // Check which tenants are referenced by sms_templates
    const templateTenants: any = await sequelize.query(
      'SELECT DISTINCT tenantId FROM sms_templates;',
      { type: QueryTypes.SELECT }
    );
    console.log('Tenants referenced by sms_templates:', templateTenants);

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

inspectTenantsDetails();

