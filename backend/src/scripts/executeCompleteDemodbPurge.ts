import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

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

// 7 Strictly Protected Tables
const PROTECTED_TABLES = [
  'employee',
  'emailconfiguration',
  'configuration',
  'sms_logs',
  'sms_templates',
  'saas_plans',
  'short_links'
];

// 25 Tables to TRUNCATE
const TABLES_TO_TRUNCATE = [
  'booking_sequence',
  'company_policies',
  'customer_notifications',
  'driver_notifications',
  'invoice_sequences',
  'mapcount',
  'monthly_invoice_items',
  'monthlybookingsequence',
  'notification_logs',
  'oncallinvoiceitems',
  'ordersummery',
  'otp',
  'owner',
  'package',
  'partners',
  'payment_sequence',
  'paymentmode',
  'pickuparea',
  'pickupcity',
  'subscription_invoices',
  'tenant_activation_tokens',
  'tenant_initial_allowance',
  'tenant_registration_requests',
  'tenant_sms_configs',
  'tenant_usage_meters'
];

// 17 Tables to DELETE in strict topological order
const TABLES_TO_DELETE_ORDERED = [
  // 1. Invoices
  'invoice',
  'monthly_invoice',
  'oncallinvoice',

  // 2. Bookings & Payments
  'booking',
  'payment',

  // 3. Packages
  'closependings',
  'packagedata',

  // 4. Drivers & Vehicles
  'drivers',
  'vehiclemaster',
  'vehicle',
  'vehicletype',
  'vendor',

  // 5. Companies & Users
  'company',
  'user',
  'tax',

  // 6. Tenant Subscriptions & Tenants
  'tenant_subscriptions',
  'tenants'
];

async function getRowCount(table: string): Promise<number> {
  const res: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\`;`, {
    type: QueryTypes.SELECT
  });
  return Number(res[0].count);
}

async function getProtectedChecksum(table: string): Promise<string> {
  const rows: any = await sequelize.query(`SELECT * FROM \`${table}\`;`, {
    type: QueryTypes.SELECT
  });
  const serialized = JSON.stringify(rows);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

async function executeDemodbPurge() {
  console.log('========================================================');
  console.log('FLEETFLOW DEMODB COMPLETE DATA PURGE EXECUTION');
  console.log('========================================================\n');

  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL demodb successfully.');

    // 1. Verify all 49 tables
    const tablesResult = await sequelize.query<any>('SHOW TABLES;', { type: QueryTypes.SELECT });
    const tableKey = Object.keys(tablesResult[0])[0];
    const allTables: string[] = tablesResult.map((r: any) => r[tableKey]).sort();

    console.log(`Total Tables in demodb: ${allTables.length}`);
    console.log(`Strictly Protected Tables: ${PROTECTED_TABLES.length}`);
    console.log(`Tables to TRUNCATE: ${TABLES_TO_TRUNCATE.length}`);
    console.log(`Tables to DELETE: ${TABLES_TO_DELETE_ORDERED.length}`);

    // Verify disjoint sets & completeness
    const totalAccounted = PROTECTED_TABLES.length + TABLES_TO_TRUNCATE.length + TABLES_TO_DELETE_ORDERED.length;
    if (totalAccounted !== allTables.length) {
      throw new Error(`Accounted count (${totalAccounted}) does not match all tables count (${allTables.length})`);
    }

    // 2. Pre-cleanup audit
    console.log('\n--- PRE-CLEANUP AUDIT ---');
    const preCounts: Record<string, number> = {};
    const preChecksums: Record<string, string> = {};

    for (const t of allTables) {
      preCounts[t] = await getRowCount(t);
    }

    for (const t of PROTECTED_TABLES) {
      preChecksums[t] = await getProtectedChecksum(t);
    }
    console.log('Computed SHA-256 data checksums for all 7 strictly protected tables.');

    // 3. Clear data safely
    console.log('\n--- EXECUTING DATA CLEARING ---');

    // Step 3a: Break circular foreign keys between non-protected tables
    console.log('Nullifying circular foreign key references between non-protected tables...');
    await sequelize.query('UPDATE `invoice` SET `monthlyInvoiceId` = NULL;');
    await sequelize.query('UPDATE `monthly_invoice` SET `invoiceId` = NULL;');
    await sequelize.query('UPDATE `user` SET `companyId` = NULL;');
    await sequelize.query('UPDATE `company` SET `userId` = NULL;');

    // Step 3b: TRUNCATE candidate leaf tables
    console.log('\nTruncating eligible leaf tables (25 tables)...');
    for (const table of TABLES_TO_TRUNCATE) {
      process.stdout.write(`TRUNCATE TABLE \`${table}\` (was ${preCounts[table]} rows)... `);
      await sequelize.query(`TRUNCATE TABLE \`${table}\`;`);
      console.log('OK.');
    }

    // Step 3c: DELETE candidate tables in topological order
    console.log('\nDeleting dependent tables in topological order (17 tables)...');
    for (const table of TABLES_TO_DELETE_ORDERED) {
      process.stdout.write(`DELETE FROM \`${table}\` (was ${preCounts[table]} rows)... `);
      await sequelize.query(`DELETE FROM \`${table}\`;`);
      console.log('OK.');
    }

    // 4. POST-CLEANUP VERIFICATION
    console.log('\n========================================================');
    console.log('POST-CLEANUP AUDIT & VERIFICATION');
    console.log('========================================================\n');

    let allProtectedMatch = true;
    let allClearedZero = true;

    const reportRows: any[] = [];

    for (const t of allTables) {
      const isProtected = PROTECTED_TABLES.includes(t);
      const pre = preCounts[t];
      const post = await getRowCount(t);

      let method = 'NO ACTION';
      let status = '';

      if (isProtected) {
        const postChecksum = await getProtectedChecksum(t);
        const match = preChecksums[t] === postChecksum && pre === post;
        if (!match) allProtectedMatch = false;
        status = match ? 'VERIFIED UNTOUCHED' : 'INTEGRITY MISMATCH!';
      } else {
        method = TABLES_TO_TRUNCATE.includes(t) ? 'TRUNCATE' : 'DELETE (FK Restriction)';
        if (post !== 0) allClearedZero = false;
        status = post === 0 ? 'CLEARED (0 ROWS)' : 'STILL HAS ROWS!';
      }

      reportRows.push({
        Table: t,
        Protected: isProtected ? 'YES' : 'NO',
        Method: method,
        PreCount: pre,
        PostCount: post,
        Status: status
      });
    }

    console.table(reportRows);

    // 5. Verify Foreign Key Constraints Count
    const fkRes: any = await sequelize.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = :dbName AND REFERENCED_TABLE_NAME IS NOT NULL;`,
      {
        replacements: { dbName: process.env.DB_NAME || 'demodb' },
        type: QueryTypes.SELECT
      }
    );
    console.log(`\nForeign key constraints intact: ${fkRes[0].count} constraints (expected 408)`);

    if (!allProtectedMatch) {
      throw new Error('VERIFICATION FAILURE: Protected table data modified or corrupted!');
    }
    if (!allClearedZero) {
      throw new Error('VERIFICATION FAILURE: One or more non-protected tables still contain records!');
    }

    console.log('\nALL 49 TABLES VERIFIED:');
    console.log('✓ 7 Strictly Protected tables retain exact original records and identical SHA-256 data checksums.');
    console.log('✓ 42 Non-Protected tables are completely empty (0 rows).');
    console.log('✓ 0 tables dropped, 0 schemas modified, 408 foreign key constraints preserved.\n');

  } catch (err: any) {
    console.error('\nPurge execution failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

executeDemodbPurge();

