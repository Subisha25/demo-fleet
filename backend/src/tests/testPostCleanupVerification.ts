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
  short_links: 25,
  tenant_sms_configs: 1,
  tenants: 149,
  tenant_subscriptions: 96,
  tenant_activation_tokens: 35,
  tenant_initial_allowance: 57,
  tenant_registration_requests: 41,
  tenant_usage_meters: 0,
  subscription_invoices: 11
};

const EXPECTED_CLEARED_TABLES = [
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
  'tax',
  'user',
  'vehicle',
  'vehiclemaster',
  'vehicletype',
  'vendor'
];

async function runPostCleanupTests() {
  console.log('--- RUNNING POST-CLEANUP INDEPENDENT VERIFICATION SUITE ---\n');
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
    // Test 1: Connectivity
    await sequelize.authenticate();
    assert(true, 'Database connectivity healthy (demodb connected)');

    // Test 2: Check total tables in demodb
    const tablesResult = await sequelize.query<any>('SHOW TABLES;', { type: QueryTypes.SELECT });
    const tableKey = Object.keys(tablesResult[0])[0];
    const actualTables: string[] = tablesResult.map((r: any) => r[tableKey]);
    assert(actualTables.length === 49, `Total database tables intact: 49 found (expected 49)`);

    // Test 3: Check all 15 protected tables exist and have exact expected row counts
    for (const [table, expectedCount] of Object.entries(EXPECTED_PROTECTED_TABLES)) {
      const res: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\`;`, { type: QueryTypes.SELECT });
      const count = Number(res[0].count);
      assert(
        count === expectedCount,
        `Protected table \`${table}\`: has ${count} rows (expected ${expectedCount})`
      );
    }

    // Test 4: Check all 34 cleared tables have exactly 0 rows
    for (const table of EXPECTED_CLEARED_TABLES) {
      const res: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\`;`, { type: QueryTypes.SELECT });
      const count = Number(res[0].count);
      assert(count === 0, `Cleared table \`${table}\`: has 0 rows`);
    }

    // Test 5: Verify critical protected data contents
    // 5a. SuperAdmin user in employee
    const adminUser: any = await sequelize.query(
      "SELECT employeeId, email, role, tenantId FROM employee WHERE email = 'subisha2002.m@gmail.com';",
      { type: QueryTypes.SELECT }
    );
    assert(
      adminUser.length === 1 && adminUser[0].role === 'superadmin',
      'SuperAdmin employee record preserved and accessible'
    );

    // 5b. Root tenant in tenants
    const rootTenant: any = await sequelize.query(
      "SELECT tenantId, name, slug, status FROM tenants WHERE tenantId = 'e7b8a1c0-0000-0000-0000-000000000001';",
      { type: QueryTypes.SELECT }
    );
    assert(
      rootTenant.length === 1 && rootTenant[0].slug === 'grace-cabs',
      'Root tenant (Grace Cabs) preserved in tenants table'
    );

    // 5c. SMS configuration in tenant_sms_configs
    const smsConfig: any = await sequelize.query(
      "SELECT provider, senderId, otpRoute, status FROM tenant_sms_configs WHERE tenantId = 'e7b8a1c0-0000-0000-0000-000000000001';",
      { type: QueryTypes.SELECT }
    );
    assert(
      smsConfig.length === 1 && smsConfig[0].senderId === 'GRCCAB' && smsConfig[0].provider === '2FACTOR',
      '2Factor SMS configuration preserved intact under GRCCAB'
    );

    // 5d. SaaS plans in saas_plans
    const plans: any = await sequelize.query(
      'SELECT planTier, name FROM saas_plans ORDER BY planTier;',
      { type: QueryTypes.SELECT }
    );
    assert(plans.length === 4, 'SaaS subscription plans intact (4 plans)');

    // 5e. SMS templates in sms_templates
    const templates: any = await sequelize.query(
      'SELECT COUNT(*) as count FROM sms_templates WHERE isActive = 1;',
      { type: QueryTypes.SELECT }
    );
    assert(Number(templates[0].count) >= 6, `Active SMS templates intact: ${templates[0].count}`);

    // Test 6: Verify foreign key integrity
    const fkCountRes: any = await sequelize.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = 'demodb' AND REFERENCED_TABLE_NAME IS NOT NULL;`,
      { type: QueryTypes.SELECT }
    );
    assert(Number(fkCountRes[0].count) === 408, `Foreign key constraints intact: 408 constraints`);

    console.log(`\nPost-Cleanup Verification Results: ${passed} passed, ${failed} failed.`);
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

runPostCleanupTests();

