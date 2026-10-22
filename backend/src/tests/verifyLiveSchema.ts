import sequelize from '../config/dbConfig';

async function verify() {
  try {
    await sequelize.authenticate();
    const qi = sequelize.getQueryInterface();
    const tables = ['tenant_registration_requests', 'tenant_activation_tokens', 'subscription_invoices', 'notification_logs'];

    for (const t of tables) {
      console.log(`\n=== TABLE: ${t} ===`);
      const desc: any = await qi.describeTable(t);
      for (const col of Object.keys(desc)) {
        const c = desc[col];
        console.log(`  ${col.padEnd(24)} ${c.type.padEnd(22)} Null: ${c.allowNull} PK: ${c.primaryKey}`);
      }

      const rawIndexes: any = await qi.showIndex(t);
      const indexNames = [...new Set(rawIndexes.map((i: any) => i.name))];
      console.log(`Indexes:`, indexNames.join(', '));
    }

    const [fks]: any = await sequelize.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
        AND TABLE_NAME IN ('tenant_registration_requests', 'tenant_activation_tokens', 'subscription_invoices', 'notification_logs')
    `);
    console.log('\n=== PHASE 1 FOREIGN KEYS ===');
    for (const fk of fks) {
      console.log(`  ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

verify();
