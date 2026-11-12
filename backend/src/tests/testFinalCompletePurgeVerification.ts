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

const EXPECTED_PROTECTED_TABLES: Record<string, number> = {
  employee: 2,
  emailconfiguration: 40,
  configuration: 1,
  sms_logs: 30,
  sms_templates: 7,
  saas_plans: 4,
  short_links: 27
};

const EXPECTED_EMPTY_TABLES = [
  'booking',
  'booking_sequence',
  'closependings',
  'company',
  'company_policies',
  'customer_notifications',
  'driver_notifications',
  'drivers',
  'invoice',
  'invoice_sequences',
  'mapcount',
  'monthly_invoice',
  'monthly_invoice_items',
  'monthlybookingsequence',
  'notification_logs',
  'oncallinvoice',
  'oncallinvoiceitems',
  'ordersummery',
  'otp',
  'owner',
  'package',
  'packagedata',
  'partners',
  'payment',
  'payment_sequence',
  'paymentmode',
  'pickuparea',
  'pickupcity',
  'subscription_invoices',
  'tax',
  'tenant_activation_tokens',
  'tenant_initial_allowance',
  'tenant_registration_requests',
  'tenant_sms_configs',
  'tenant_subscriptions',
  'tenant_usage_meters',
  'tenants',
  'user',
  'vehicle',
  'vehiclemaster',
  'vehicletype',
  'vendor'
];

async function runFinalPurgeVerification() {
  console.log('--- FINAL MANDATORY PURGE VERIFICATION SUITE ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    await sequelize.authenticate();
    assert(true, 'Database connectivity healthy (demodb connected)');

    // 1. Total tables
    const tablesResult = await sequelize.query<any>('SHOW TABLES;', { type: QueryTypes.SELECT });
    const tableKey = Object.keys(tablesResult[0])[0];
    const actualTables: string[] = tablesResult.map((r: any) => r[tableKey]).sort();
    assert(actualTables.length === 49, `Total database tables intact: 49 found (expected 49)`);

    // 2. 7 Strictly Protected tables check
    for (const [table, expectedCount] of Object.entries(EXPECTED_PROTECTED_TABLES)) {
      const res: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\`;`, { type: QueryTypes.SELECT });
      const count = Number(res[0].count);
      assert(
        count === expectedCount,
        `Protected table \`${table}\`: has ${count} rows (expected ${expectedCount})`
      );
    }

    // 3. 42 Empty tables check
    for (const table of EXPECTED_EMPTY_TABLES) {
      const res: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\`;`, { type: QueryTypes.SELECT });
      const count = Number(res[0].count);
      assert(count === 0, `Non-protected table \`${table}\`: is completely empty (0 rows)`);
    }

    // 4. Protected records integrity
    const superAdmin: any = await sequelize.query(
      "SELECT employeeId, email, role FROM employee WHERE email = 'subisha2002.m@gmail.com';",
      { type: QueryTypes.SELECT }
    );
    assert(
      superAdmin.length === 1 && superAdmin[0].role === 'superadmin',
      'SuperAdmin employee record preserved intact'
    );

    const plans: any = await sequelize.query('SELECT COUNT(*) as count FROM saas_plans;', { type: QueryTypes.SELECT });
    assert(Number(plans[0].count) === 4, 'SaaS subscription plans intact (4 tiers)');

    const emailTemplates: any = await sequelize.query('SELECT COUNT(*) as count FROM emailconfiguration;', { type: QueryTypes.SELECT });
    assert(Number(emailTemplates[0].count) === 40, 'Email configuration templates intact (40 templates)');

    const smsTemplates: any = await sequelize.query('SELECT COUNT(*) as count FROM sms_templates;', { type: QueryTypes.SELECT });
    assert(Number(smsTemplates[0].count) === 7, 'SMS DLT templates intact (7 templates)');

    const shortLinks: any = await sequelize.query('SELECT COUNT(*) as count FROM short_links;', { type: QueryTypes.SELECT });
    assert(Number(shortLinks[0].count) === 27, 'Short links intact (27 short links)');

    const smsLogs: any = await sequelize.query('SELECT COUNT(*) as count FROM sms_logs;', { type: QueryTypes.SELECT });
    assert(Number(smsLogs[0].count) === 30, 'SMS logs intact (30 logs)');

    const config: any = await sequelize.query('SELECT COUNT(*) as count FROM configuration;', { type: QueryTypes.SELECT });
    assert(Number(config[0].count) === 1, 'Global configuration record intact (1 record)');

    // 5. Foreign Key Constraints check
    const fkCountRes: any = await sequelize.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = 'demodb' AND REFERENCED_TABLE_NAME IS NOT NULL;`,
      { type: QueryTypes.SELECT }
    );
    assert(Number(fkCountRes[0].count) === 408, `Foreign key constraints intact: 408 constraints`);

    console.log(`\nFinal Verification Results: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      throw new Error(`${failed} verification tests failed!`);
    }

  } catch (err: any) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runFinalPurgeVerification();

