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

async function generateManifest() {
  try {
    await sequelize.authenticate();
    const tablesResult = await sequelize.query<any>('SHOW TABLES;', { type: QueryTypes.SELECT });
    const tableKey = Object.keys(tablesResult[0])[0];
    const tableNames: string[] = tablesResult.map((r: any) => r[tableKey]).sort();

    const explicitlyProtected = [
      'employee',
      'emailconfiguration',
      'configuration',
      'sms_logs',
      'notification_logs',
      'sms_templates',
      'saas_plans',
      'short_links',
      'tenant_sms_configs'
    ];

    const tenantSaaSTables = [
      'tenants',
      'tenant_subscriptions',
      'tenant_activation_tokens',
      'tenant_initial_allowance',
      'tenant_registration_requests',
      'tenant_usage_meters',
      'subscription_invoices'
    ];

    console.log('| Table | Protected? | Existing Rows | Category / Reason | Cleanup Action |');
    console.log('|---|---|---:|---|---|');

    for (const table of tableNames) {
      const countRes: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\`;`, { type: QueryTypes.SELECT });
      const count = Number(countRes[0].count);
      
      let isProtected = 'NO';
      let action = 'CLEAR';
      let category = 'Operational / Master Data';

      if (explicitlyProtected.includes(table)) {
        isProtected = 'YES';
        action = 'NO ACTION';
        category = 'Explicitly Protected';
      } else if (tenantSaaSTables.includes(table)) {
        category = 'Tenant SaaS Infrastructure';
        action = 'PENDING CLARIFICATION';
        isProtected = 'UNCERTAIN';
      }

      console.log(`| \`${table}\` | **${isProtected}** | ${count} | ${category} | ${action} |`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

generateManifest();

