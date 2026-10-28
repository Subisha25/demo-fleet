import sequelize from '../config/dbConfig';

async function runAudit() {
  try {
    const [plans]: any = await sequelize.query('SELECT * FROM saas_plans');
    console.log('=== SAAS PLANS ===');
    console.log(JSON.stringify(plans, null, 2));

    const [subs]: any = await sequelize.query('SELECT * FROM tenant_subscriptions');
    console.log('=== TENANT SUBSCRIPTIONS ===');
    console.log(JSON.stringify(subs, null, 2));

    const [tenants]: any = await sequelize.query('SELECT tenantId, name, code, planTier, status, brandingTokens FROM tenants');
    console.log('=== TENANTS ===');
    console.log(JSON.stringify(tenants, null, 2));

    const [taxes]: any = await sequelize.query('SELECT taxId, tenantId, taxName, taxPercent FROM tax');
    console.log('=== TAX RECORDS ===');
    console.log(JSON.stringify(taxes, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Audit query error:', err);
    process.exit(1);
  }
}

runAudit();
