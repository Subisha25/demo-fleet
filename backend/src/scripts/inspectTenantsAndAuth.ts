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

async function inspectTenantsAndAuth() {
  try {
    await sequelize.authenticate();
    
    console.log('\n--- EMPLOYEE ---');
    const employees = await sequelize.query('SELECT * FROM employee;', { type: QueryTypes.SELECT });
    console.table(employees);

    console.log('\n--- TENANTS (Sample 10) ---');
    const tenantsCount: any = await sequelize.query('SELECT count(*) as count FROM tenants;', { type: QueryTypes.SELECT });
    console.log(`Total tenants: ${tenantsCount[0].count}`);
    const tenants = await sequelize.query('SELECT tenantId, name, slug, status, planId, createdAt FROM tenants LIMIT 10;', { type: QueryTypes.SELECT });
    console.table(tenants);

    console.log('\n--- ROOT TENANT IN TENANTS ---');
    const rootTenant = await sequelize.query("SELECT * FROM tenants WHERE tenantId = 'e7b8a1c0-0000-0000-0000-000000000001';", { type: QueryTypes.SELECT });
    console.log('Root Tenant:', rootTenant);

    console.log('\n--- TENANT SMS CONFIGS ---');
    const smsConfigs = await sequelize.query('SELECT * FROM tenant_sms_configs;', { type: QueryTypes.SELECT });
    console.table(smsConfigs);

    console.log('\n--- SAAS PLANS ---');
    const plans = await sequelize.query('SELECT planId, planTier, name, priceMonthlyINR FROM saas_plans;', { type: QueryTypes.SELECT });
    console.table(plans);

    console.log('\n--- USER (Sample 5) ---');
    const usersCount: any = await sequelize.query('SELECT count(*) as count FROM user;', { type: QueryTypes.SELECT });
    console.log(`Total users: ${usersCount[0].count}`);
    const users = await sequelize.query('SELECT userId, name, email, role, companyId, tenantId FROM user LIMIT 5;', { type: QueryTypes.SELECT });
    console.table(users);

    console.log('\n--- OTP (Sample 5) ---');
    const otps = await sequelize.query('SELECT * FROM otp LIMIT 5;', { type: QueryTypes.SELECT });
    console.table(otps);

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

inspectTenantsAndAuth();
