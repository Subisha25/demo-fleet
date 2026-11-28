const path = require('path');
const mysql = require(path.join(__dirname, '../../node_modules/mysql2/promise'));

const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'demodb'
  });

  console.log('--- Step 1: Identifying Genuine Paid Tenants ---');
  const [paidRows] = await conn.query("SELECT DISTINCT tenantId FROM subscription_invoices WHERE paymentStatus = 'PAID';");
  const paidTenantIds = new Set(paidRows.map(r => r.tenantId));
  paidTenantIds.add(ROOT_TENANT_ID);
  console.log('Protected Paid Tenant IDs:', Array.from(paidTenantIds));

  console.log('--- Step 2: Correcting tenant_registration_requests ---');
  const [regResult] = await conn.query(
    "UPDATE tenant_registration_requests SET requestedPlanTier = 'FREE_TRIAL' WHERE requestedPlanTier IS NULL OR requestedPlanTier != 'FREE_TRIAL';"
  );
  console.log(`Updated ${regResult.affectedRows} registration requests to FREE_TRIAL.`);

  console.log('--- Step 3: Correcting tenants without paid invoices ---');
  const [tenants] = await conn.query("SELECT tenantId, name, code, planTier, status FROM tenants;");
  let tenantUpdates = 0;
  for (const t of tenants) {
    if (!paidTenantIds.has(t.tenantId) && t.planTier !== null) {
      console.log(`Setting planTier=null for trial tenant: ${t.name} (${t.code}) [was ${t.planTier}]`);
      await conn.query("UPDATE tenants SET planTier = NULL WHERE tenantId = ?;", [t.tenantId]);
      tenantUpdates++;
    }
  }
  console.log(`Updated ${tenantUpdates} trial tenants.`);

  console.log('--- Step 4: Correcting tenant_subscriptions without paid invoices ---');
  const [subs] = await conn.query("SELECT subscriptionId, tenantId, planTier, status, agreedPrice FROM tenant_subscriptions;");
  let subUpdates = 0;
  for (const s of subs) {
    if (!paidTenantIds.has(s.tenantId)) {
      if (s.planTier !== null || s.agreedPrice !== '0.00') {
        console.log(`Clearing planTier and resetting agreedPrice to 0 for subscription: ${s.subscriptionId} (tenant: ${s.tenantId}) [was ${s.planTier}, ₹${s.agreedPrice}]`);
        await conn.query("UPDATE tenant_subscriptions SET planTier = NULL, agreedPrice = 0.00 WHERE subscriptionId = ?;", [s.subscriptionId]);
        subUpdates++;
      }
    }
  }
  console.log(`Updated ${subUpdates} trial subscriptions.`);

  console.log('--- Step 5: Verification of Updated Records ---');
  const [finalTenants] = await conn.query("SELECT tenantId, name, code, planTier, status FROM tenants WHERE planTier IS NOT NULL;");
  console.log('Remaining tenants with planTier (should only be paid or root):');
  console.table(finalTenants);

  const [finalSubs] = await conn.query("SELECT subscriptionId, tenantId, planTier, status, agreedPrice FROM tenant_subscriptions WHERE planTier IS NOT NULL;");
  console.log('Remaining subscriptions with planTier (should only be paid or root):');
  console.table(finalSubs);

  await conn.end();
  console.log('Audit and correction completed successfully.');
}

run().catch(console.error);
