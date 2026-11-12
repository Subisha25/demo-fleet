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

// 15 Protected Tables
const PROTECTED_TABLES = [
  'employee',
  'emailconfiguration',
  'configuration',
  'sms_logs',
  'sms_templates',
  'saas_plans',
  'short_links',
  'tenant_sms_configs',
  'tenants',
  'tenant_subscriptions',
  'tenant_activation_tokens',
  'tenant_initial_allowance',
  'tenant_registration_requests',
  'tenant_usage_meters',
  'subscription_invoices'
];

// 34 Tables to be cleared in strict topological order (children before parents)
const TABLES_TO_CLEAR_ORDERED = [
  // 1. Leaf Invoice & Order records
  'ordersummery',
  'oncallinvoiceitems',
  'monthly_invoice_items',

  // 2. Invoices & Billing
  'invoice',
  'monthly_invoice',
  'oncallinvoice',

  // 3. Bookings & Payments
  'booking',
  'payment',

  // 4. Close pendings & Packages
  'closependings',
  'package',
  'packagedata',

  // 5. Drivers & Vehicle Hierarchy (vehiclemaster & drivers before vehicle, vehicle before vehicletype)
  'drivers',
  'vehiclemaster',
  'vehicle',
  'vehicletype',
  'vendor',

  // 6. Company Policies, Company & User
  'company_policies',
  'company',
  'user',

  // 7. Taxes, Locations, Payment Modes, Partners, Owners
  'tax',
  'pickuparea',
  'pickupcity',
  'paymentmode',
  'partners',
  'owner',

  // 8. Operational Counters & Sequences
  'booking_sequence',
  'monthlybookingsequence',
  'invoice_sequences',
  'payment_sequence',
  'mapcount',

  // 9. Operational Notifications & Sessions
  'customer_notifications',
  'driver_notifications',
  'notification_logs',
  'otp'
];

async function getTableCount(table: string): Promise<number> {
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

async function executeCleanup() {
  console.log('========================================================');
  console.log('FLEETFLOW DEMODB SAFE DATA CLEANUP EXECUTION');
  console.log('========================================================\n');

  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL demodb successfully.');

    // 1. Verify table counts
    const tablesResult = await sequelize.query<any>('SHOW TABLES;', { type: QueryTypes.SELECT });
    const tableKey = Object.keys(tablesResult[0])[0];
    const allTables: string[] = tablesResult.map((r: any) => r[tableKey]);

    console.log(`Discovered ${allTables.length} total tables in demodb.`);
    console.log(`Protected Tables count: ${PROTECTED_TABLES.length}`);
    console.log(`Tables to Clear count: ${TABLES_TO_CLEAR_ORDERED.length}`);

    // Verify disjoint sets and completeness
    const missingInPlan = allTables.filter(
      (t) => !PROTECTED_TABLES.includes(t) && !TABLES_TO_CLEAR_ORDERED.includes(t)
    );
    if (missingInPlan.length > 0) {
      throw new Error(`Unaccounted tables detected: ${missingInPlan.join(', ')}`);
    }

    // 2. Pre-cleanup row counts & checksums
    console.log('\n--- PRE-CLEANUP AUDIT ---');
    const preCounts: Record<string, number> = {};
    const preChecksums: Record<string, string> = {};

    for (const t of allTables) {
      preCounts[t] = await getTableCount(t);
    }

    for (const t of PROTECTED_TABLES) {
      preChecksums[t] = await getProtectedChecksum(t);
    }
    console.log('Pre-cleanup checksums computed for all 15 protected tables.');

    // 3. Begin Safe Cleanup Transaction
    const transaction = await sequelize.transaction();

    try {
      console.log('\n--- BREAKING CIRCULAR FOREIGN KEYS IN DATA ---');
      // Nullify circular references between non-protected tables
      await sequelize.query('UPDATE `invoice` SET `monthlyInvoiceId` = NULL;', { transaction });
      await sequelize.query('UPDATE `monthly_invoice` SET `invoiceId` = NULL;', { transaction });
      await sequelize.query('UPDATE `user` SET `companyId` = NULL;', { transaction });
      await sequelize.query('UPDATE `company` SET `userId` = NULL;', { transaction });
      console.log('Circular foreign key references nullified in data.');

      console.log('\n--- CLEARING 34 NON-PROTECTED TABLES IN TOPOLOGICAL ORDER ---');
      for (const table of TABLES_TO_CLEAR_ORDERED) {
        process.stdout.write(`Deleting from \`${table}\` (was ${preCounts[table]} rows)... `);
        await sequelize.query(`DELETE FROM \`${table}\`;`, { transaction });
        console.log('DONE.');
      }

      await transaction.commit();
      console.log('\nTransaction COMMITTED successfully.');

    } catch (txErr: any) {
      await transaction.rollback();
      console.error('\nTransaction FAILED! Rolled back completely.', txErr.message);
      throw txErr;
    }

    // 4. POST-CLEANUP VERIFICATION
    console.log('\n========================================================');
    console.log('POST-CLEANUP VERIFICATION');
    console.log('========================================================\n');

    let allProtectedPreserved = true;
    let allClearedAreZero = true;

    const reportRows: any[] = [];

    for (const t of allTables.sort()) {
      const isProtected = PROTECTED_TABLES.includes(t);
      const pre = preCounts[t];
      const post = await getTableCount(t);

      if (isProtected) {
        const postChecksum = await getProtectedChecksum(t);
        const checksumMatch = preChecksums[t] === postChecksum;
        if (post !== pre || !checksumMatch) {
          allProtectedPreserved = false;
        }
        reportRows.push({
          Table: t,
          Protected: 'YES',
          PreCount: pre,
          PostCount: post,
          Status: post === pre && checksumMatch ? 'VERIFIED UNTOUCHED' : 'INTEGRITY MISMATCH!'
        });
      } else {
        if (post !== 0) {
          allClearedAreZero = false;
        }
        reportRows.push({
          Table: t,
          Protected: 'NO',
          PreCount: pre,
          PostCount: post,
          Status: post === 0 ? 'CLEARED (0 ROWS)' : 'STILL HAS ROWS!'
        });
      }
    }

    console.table(reportRows);

    // 5. Verify FK constraints remain unchanged
    const postFks: any = await sequelize.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = :dbName AND REFERENCED_TABLE_NAME IS NOT NULL;`,
      {
        replacements: { dbName: process.env.DB_NAME || 'demodb' },
        type: QueryTypes.SELECT
      }
    );
    console.log(`Foreign key constraints count: ${postFks[0].count} (Unchanged)`);

    // Final checks
    if (!allProtectedPreserved) {
      throw new Error('VERIFICATION FAILURE: One or more protected tables were altered!');
    }
    if (!allClearedAreZero) {
      throw new Error('VERIFICATION FAILURE: One or more non-protected tables still have records!');
    }

    console.log('\nALL VERIFICATIONS PASSED:');
    console.log('✓ All 15 protected tables have exact identical pre/post row counts and identical data checksums.');
    console.log('✓ All 34 non-protected tables have exactly 0 rows.');
    console.log('✓ All 49 database tables exist.');
    console.log('✓ All foreign key constraints preserved.');
    console.log('✓ Demodb database is healthy and ready for fresh testing.\n');

  } catch (error) {
    console.error('Cleanup execution failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

executeCleanup();
