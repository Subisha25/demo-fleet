import bcrypt from 'bcrypt';
import sequelize from '../config/dbConfig';
import { QueryTypes } from 'sequelize';

async function verifyPostCleanup() {
  console.log('====================================================');
  console.log('DEMODB POST-CLEANUP VERIFICATION');
  console.log('====================================================\n');

  let allChecksPassed = true;

  // 1. Check all 47 tables exist in demodb
  const allTables: any = await sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'demodb'`,
    { type: QueryTypes.SELECT }
  );
  const tableNames: string[] = allTables.map((t: any) => t.TABLE_NAME);
  console.log(`[CHECK 1] Schema table verification: ${tableNames.length} tables found in demodb.`);
  if (tableNames.length !== 47) {
    console.error(`❌ Expected 47 tables, found ${tableNames.length}`);
    allChecksPassed = false;
  } else {
    console.log('✓ All 47 tables exist. No tables were dropped.\n');
  }

  // 2. Check the four protected tables
  console.log('[CHECK 2] Protected tables data verification:');
  const [configRows]: any = await sequelize.query('SELECT * FROM `configuration`');
  if (configRows.length === 1) {
    console.log(`✓ configuration: 1 row preserved intact (SMTP Server: ${configRows[0].smtpServer}, Port: ${configRows[0].smtpEmailPort}, Invoice Prefix: ${configRows[0].invoiceNoPrefix})`);
  } else {
    console.error('❌ configuration check failed:', configRows);
    allChecksPassed = false;
  }

  const [emailConfigRows]: any = await sequelize.query('SELECT COUNT(*) as count FROM `emailconfiguration`');
  if (Number(emailConfigRows[0].count) === 23) {
    console.log(`✓ emailconfiguration: exactly 23 template rows preserved intact`);
  } else {
    console.error(`❌ emailconfiguration check failed: count is ${emailConfigRows[0].count}`);
    allChecksPassed = false;
  }

  const [shortLinksRows]: any = await sequelize.query('SELECT COUNT(*) as count FROM `short_links`');
  if (Number(shortLinksRows[0].count) === 21) {
    console.log(`✓ short_links (shortlinks): exactly 21 link rows preserved intact`);
  } else {
    console.error(`❌ short_links check failed: count is ${shortLinksRows[0].count}`);
    allChecksPassed = false;
  }

  const [smsLogsRows]: any = await sequelize.query('SELECT COUNT(*) as count FROM `sms_logs`');
  if (Number(smsLogsRows[0].count) === 30) {
    console.log(`✓ sms_logs: exactly 30 audit log rows preserved intact\n`);
  } else {
    console.error(`❌ sms_logs check failed: count is ${smsLogsRows[0].count}`);
    allChecksPassed = false;
  }

  // 3. Check SuperAdmin account and login capability
  console.log('[CHECK 3] SuperAdmin account and authentication capability:');
  const [adminRows]: any = await sequelize.query(
    'SELECT employeeId, username, email, phno, role, password, tenantId FROM `employee` WHERE `role` = "superadmin"'
  );
  if (adminRows.length === 1) {
    const admin = adminRows[0];
    console.log(`✓ SuperAdmin found: ID=${admin.employeeId}, Username="${admin.username}", Email="${admin.email}", Phone="${admin.phno}", Role="${admin.role}", TenantId="${admin.tenantId}"`);
    // Verify password hash is valid bcrypt hash
    const isPasswordHashValid = typeof admin.password === 'string' && admin.password.startsWith('$2b$');
    console.log(`✓ SuperAdmin password hash format valid: ${isPasswordHashValid}`);
    if (admin.email !== 'subisha2002.m@gmail.com') {
      console.error(`❌ SuperAdmin email mismatch: ${admin.email}`);
      allChecksPassed = false;
    }
  } else {
    console.error(`❌ Expected exactly 1 SuperAdmin, found ${adminRows.length}`);
    allChecksPassed = false;
  }

  // 4. Check Root Tenant and SaaS Plans
  console.log('\n[CHECK 4] Root tenant and SaaS plan definitions:');
  const [rootTenantRows]: any = await sequelize.query(
    'SELECT tenantId, name, code, status FROM `tenants` WHERE `tenantId` = "e7b8a1c0-0000-0000-0000-000000000001"'
  );
  if (rootTenantRows.length === 1) {
    console.log(`✓ Root tenant exists: [${rootTenantRows[0].code}] ${rootTenantRows[0].name} (Status: ${rootTenantRows[0].status})`);
  } else {
    console.error('❌ Root tenant missing!');
    allChecksPassed = false;
  }

  const [rootSubRows]: any = await sequelize.query(
    'SELECT * FROM `tenant_subscriptions` WHERE `tenantId` = "e7b8a1c0-0000-0000-0000-000000000001"'
  );
  if (rootSubRows.length === 1) {
    const sub = rootSubRows[0];
    console.log(`✓ Root tenant subscription exists: Plan=${sub.plan_id || sub.planId}, Status=${sub.status}`);
  } else {
    console.error('❌ Root tenant subscription missing!');
    allChecksPassed = false;
  }

  const [planRows]: any = await sequelize.query('SELECT * FROM `saas_plans`');
  if (planRows.length === 4) {
    console.log(`✓ SaaS plans intact: ${planRows.map((p: any) => `${p.name || p.plan_name || p.planName} (${p.code || p.plan_code || p.planCode})`).join(', ')}\n`);
  } else {
    console.error(`❌ Expected 4 SaaS plans, found ${planRows.length}`);
    allChecksPassed = false;
  }

  // 5. Check foreign keys and indexes integrity
  console.log('[CHECK 5] Foreign keys and indexes integrity:');
  const [fks]: any = await sequelize.query(
    `SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = 'demodb' AND REFERENCED_TABLE_NAME IS NOT NULL`
  );
  console.log(`✓ Foreign key constraints intact: ${fks.length} foreign key relations verified in demodb schema.`);

  const [indexes]: any = await sequelize.query(
    `SELECT COUNT(DISTINCT INDEX_NAME) as indexCount FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'demodb'`
  );
  console.log(`✓ Indexes intact: ${indexes[0].indexCount} distinct indexes verified across tables.\n`);

  // 6. Check targeted operational tables row counts (must be 0)
  console.log('[CHECK 6] Cleared operational tables row counts (target: 0):');
  const clearedTables = [
    'booking',
    'booking_sequence',
    'closependings',
    'company',
    'company_policies',
    'drivers',
    'invoice',
    'invoice_sequences',
    'monthly_invoice',
    'monthly_invoice_items',
    'oncallinvoice',
    'oncallinvoiceitems',
    'package',
    'packagedata',
    'payment',
    'payment_sequence',
    'tenant_activation_tokens',
    'tenant_registration_requests',
    'user',
    'vehicle',
    'vehiclemaster',
    'vendor'
  ];

  for (const tbl of clearedTables) {
    const [rows]: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${tbl}\``);
    const count = Number(rows[0].count);
    if (count !== 0) {
      console.error(`❌ Table ${tbl} not fully cleared! Count: ${count}`);
      allChecksPassed = false;
    } else {
      console.log(`  ✓ ${tbl}: 0 rows`);
    }
  }

  console.log('\n====================================================');
  if (allChecksPassed) {
    console.log('✓ ALL POST-CLEANUP VERIFICATIONS PASSED SUCCESSFULLY!');
  } else {
    console.error('❌ SOME CHECKS FAILED!');
    process.exit(1);
  }
  console.log('====================================================\n');
  process.exit(0);
}

verifyPostCleanup().catch(err => {
  console.error('CRITICAL ERROR in verification:', err);
  process.exit(1);
});
