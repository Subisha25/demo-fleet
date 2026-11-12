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

async function inspectTables() {
  try {
    await sequelize.authenticate();
    const tables = [
      'notification_logs',
      'customer_notifications',
      'driver_notifications',
      'tenant_sms_configs',
      'saas_plans',
      'tenants',
      'tenant_subscriptions',
      'tenant_activation_tokens',
      'tenant_initial_allowance',
      'tenant_registration_requests',
      'tenant_usage_meters',
      'subscription_invoices',
      'otp',
      'user',
      'employee',
      'configuration',
      'emailconfiguration',
      'sms_logs',
      'sms_templates',
      'short_links'
    ];

    for (const table of tables) {
      console.log(`\n================ ${table} ================`);
      const cols: any = await sequelize.query(`DESCRIBE \`${table}\`;`, { type: QueryTypes.SELECT });
      console.log('Columns:', cols.map((c: any) => `${c.Field} (${c.Type})`).join(', '));
      const countRes: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\`;`, { type: QueryTypes.SELECT });
      console.log(`Row count: ${countRes[0].count}`);
      if (countRes[0].count > 0) {
        const sample: any = await sequelize.query(`SELECT * FROM \`${table}\` LIMIT 2;`, { type: QueryTypes.SELECT });
        console.log('Sample row:', JSON.stringify(sample[0]));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

inspectTables();

