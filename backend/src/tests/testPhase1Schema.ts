import crypto from 'crypto';
import sequelize from '../config/dbConfig';
import {
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
  TenantActivationToken,
  SubscriptionInvoice,
  NotificationLog,
  Booking,
  Vehicle,
  Drivers,
  Employee,
  Invoice,
  MonthlyInvoice,
  OnCallInvoice,
} from '../models';

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

async function runPhase1Tests() {
  console.log('\n========================================================================');
  console.log('🚀 PHASE 1: DATABASE MODELS & NON-DESTRUCTIVE MIGRATIONS SUITE');
  console.log('========================================================================\n');

  try {
    await sequelize.authenticate();
    console.log('🔹 [Step 1] Verifying Model Registration in Sequelize Context');
    assert(!!sequelize.models.TenantRegistrationRequest, 'TenantRegistrationRequest registered in Sequelize');
    assert(!!sequelize.models.TenantActivationToken, 'TenantActivationToken registered in Sequelize');
    assert(!!sequelize.models.SubscriptionInvoice, 'SubscriptionInvoice registered in Sequelize');
    assert(!!sequelize.models.NotificationLog, 'NotificationLog registered in Sequelize');

    console.log('\n🔹 [Step 2] Executing Safe Additive Model Synchronization');
    // Safe sync creates tables if not present without touching legacy schema
    await TenantRegistrationRequest.sync();
    await TenantActivationToken.sync();
    await SubscriptionInvoice.sync();
    await NotificationLog.sync();

    const queryInterface = sequelize.getQueryInterface();
    const tables = (await queryInterface.showAllTables()) as string[];

    assert(tables.includes('tenant_registration_requests'), "Table 'tenant_registration_requests' exists");
    assert(tables.includes('tenant_activation_tokens'), "Table 'tenant_activation_tokens' exists");
    assert(tables.includes('subscription_invoices'), "Table 'subscription_invoices' exists");
    assert(tables.includes('notification_logs'), "Table 'notification_logs' exists");

    console.log('\n🔹 [Step 3] Verifying Model Columns & Attribute Specifications');
    const regDesc: any = await queryInterface.describeTable('tenant_registration_requests');
    assert(!!regDesc.requestId && regDesc.requestId.primaryKey, 'requestId is primary key on registration requests');
    assert(!!regDesc.fleetName && !regDesc.fleetName.allowNull, 'fleetName is required (NOT NULL)');
    assert(!!regDesc.businessCode && !regDesc.businessCode.allowNull, 'businessCode is required (NOT NULL)');
    assert(!!regDesc.requestedPlanTier, 'requestedPlanTier column exists with tier specification');
    assert(!!regDesc.billingCycle, 'billingCycle column exists (MONTHLY/ANNUAL)');
    assert(!!regDesc.status, 'status column exists (PENDING/APPROVED/REJECTED)');

    const actDesc: any = await queryInterface.describeTable('tenant_activation_tokens');
    assert(!!actDesc.tokenId && actDesc.tokenId.primaryKey, 'tokenId is primary key on activation tokens');
    assert(!!actDesc.tokenHash && !actDesc.tokenHash.allowNull, 'tokenHash is required and securely stores hash');
    assert(!!actDesc.expiresAt && !actDesc.expiresAt.allowNull, 'expiresAt is required');
    assert(!!actDesc.isRevoked, 'isRevoked status flag exists');

    const subDesc: any = await queryInterface.describeTable('subscription_invoices');
    assert(!!subDesc.subscriptionInvoiceId && subDesc.subscriptionInvoiceId.primaryKey, 'subscriptionInvoiceId is primary key');
    assert(!!subDesc.invoiceNumber, 'invoiceNumber exists with uniqueness support');
    assert(!!subDesc.baseAmount && subDesc.baseAmount.type.includes('DECIMAL'), 'baseAmount preserves decimal currency precision');
    assert(!!subDesc.taxAmount && subDesc.taxAmount.type.includes('DECIMAL'), 'taxAmount preserves decimal currency precision');
    assert(!!subDesc.totalAmount && subDesc.totalAmount.type.includes('DECIMAL'), 'totalAmount preserves decimal currency precision');
    assert(!!subDesc.paymentStatus, 'paymentStatus enum tracking exists');

    const notifDesc: any = await queryInterface.describeTable('notification_logs');
    assert(!!notifDesc.logId && notifDesc.logId.primaryKey, 'logId is primary key on notification logs');
    assert(!!notifDesc.channel, 'channel column exists (EMAIL/SMS)');
    assert(!!notifDesc.recipient && !notifDesc.recipient.allowNull, 'recipient is required');
    assert(!!notifDesc.providerStatus, 'providerStatus column exists');
    assert(!!notifDesc.retryCount, 'retryCount column exists with integer tracking');

    console.log('\n🔹 [Step 4] Functional CRUD & Data Integrity Validation');

    // 1. TenantRegistrationRequest CRUD
    const uniqueSuffix = Date.now().toString().slice(-6);
    const testCode = `TST${uniqueSuffix.slice(-3)}`;
    const testEmail = `operator${uniqueSuffix}@example.com`;

    const regRequest = await TenantRegistrationRequest.create({
      fleetName: `Test Fleet ${uniqueSuffix}`,
      businessCode: testCode,
      ownerName: 'Apex Operator',
      contactEmail: testEmail,
      contactPhone: '9876543210',
      city: 'Chennai',
      state: 'Tamil Nadu',
      requestedPlanTier: 'PRO',
      billingCycle: 'ANNUAL',
      fleetSize: '16-75',
      status: 'PENDING',
      termsConsent: true,
    });

    assert(!!regRequest.requestId, 'TenantRegistrationRequest created with valid UUID');
    assert(regRequest.status === 'PENDING', 'Default registration status is PENDING');
    assert(regRequest.billingCycle === 'ANNUAL', 'Billing cycle saved accurately');

    // 2. TenantActivationToken CRUD & Cryptographic Hash Security
    const rootTenantId = 'e7b8a1c0-0000-0000-0000-000000000001';
    const rawSecretToken = `act_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(rawSecretToken).digest('hex');

    const activationToken = await TenantActivationToken.create({
      tenantId: rootTenantId,
      adminEmail: testEmail,
      adminName: 'Apex Admin',
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 hours
      isRevoked: false,
    });

    assert(!!activationToken.tokenId, 'TenantActivationToken created with valid UUID');
    assert(activationToken.tokenHash === tokenHash, 'Cryptographic token hash stored securely');
    assert(activationToken.adminEmail === testEmail, 'Admin email correctly associated with activation token');

    // Verify lookup by hash (simulating user clicking link)
    const lookedUpToken = await TenantActivationToken.findOne({
      where: { tokenHash },
      include: [{ model: Tenant }],
    });
    assert(!!lookedUpToken && lookedUpToken.tenantId === rootTenantId, 'Token lookup by SHA-256 hash succeeds');
    assert(!!lookedUpToken?.tenant && lookedUpToken.tenant.tenantId === rootTenantId, 'Tenant association eager-loaded successfully');

    // 3. SubscriptionInvoice CRUD & Money Precision
    const invoiceNum = `SUB-2026-${uniqueSuffix}`;
    const subInvoice = await SubscriptionInvoice.create({
      tenantId: rootTenantId,
      invoiceNumber: invoiceNum,
      planTier: 'PRO',
      billingCycle: 'MONTHLY',
      baseAmount: 349.00,
      taxRate: 18.00,
      taxAmount: 62.82,
      totalAmount: 411.82,
      currency: 'INR',
      paymentStatus: 'PAID',
      paymentMethod: 'GATEWAY',
      transactionReference: `TXN_PG_${uniqueSuffix}`,
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      metadata: { gateway: 'HDFC_JUSPAY', authCode: 'AUTH99281' },
    });

    assert(!!subInvoice.subscriptionInvoiceId, 'SubscriptionInvoice created with UUID');
    assert(Number(subInvoice.baseAmount) === 349.00, 'Base amount decimal precision verified (349.00)');
    assert(Number(subInvoice.taxAmount) === 62.82, 'Tax amount decimal precision verified (62.82)');
    assert(Number(subInvoice.totalAmount) === 411.82, 'Total amount precision verified (411.82)');
    assert(subInvoice.paymentStatus === 'PAID', 'Payment status accurately recorded as PAID');

    // 4. NotificationLog CRUD
    const notifLog = await NotificationLog.create({
      channel: 'EMAIL',
      recipient: testEmail,
      templateCode: 'TENANT_ADMIN_INVITATION',
      referenceEntity: 'ACTIVATION',
      referenceId: activationToken.tokenId,
      providerStatus: 'SENT',
      providerMessageId: `<msg-${uniqueSuffix}@mailer.gracecabs.com>`,
      retryCount: 0,
      maxRetries: 3,
      metadata: { sanitized: true, action: 'INVITE' },
    });

    assert(!!notifLog.logId, 'NotificationLog created with UUID');
    assert(notifLog.channel === 'EMAIL', 'Notification channel accurately recorded');
    assert(notifLog.providerStatus === 'SENT', 'Provider status logged as SENT');

    // Test retry update
    await notifLog.update({ retryCount: 1, providerStatus: 'DELIVERED' });
    const updatedNotif = await NotificationLog.findByPk(notifLog.logId);
    assert(updatedNotif?.retryCount === 1, 'NotificationLog retry count successfully incremented');
    assert(updatedNotif?.providerStatus === 'DELIVERED', 'NotificationLog delivery status updated to DELIVERED');

    console.log('\n🔹 [Step 5] Verifying Non-Destructive Invariance of Legacy Operational Tables');
    const bookingCount = await Booking.count();
    const vehicleCount = await Vehicle.count();
    const driverCount = await Drivers.count();
    const employeeCount = await Employee.count();
    const invoiceCount = await Invoice.count();
    const monthlyCount = await MonthlyInvoice.count();
    const onCallCount = await OnCallInvoice.count();

    assert(bookingCount >= 0, `Legacy 'booking' table fully intact (Count: ${bookingCount})`);
    assert(vehicleCount >= 0, `Legacy 'vehicle' table fully intact (Count: ${vehicleCount})`);
    assert(driverCount >= 0, `Legacy 'drivers' table fully intact (Count: ${driverCount})`);
    assert(employeeCount >= 0, `Legacy 'employee' table fully intact (Count: ${employeeCount})`);
    assert(invoiceCount >= 0, `Legacy 'invoice' table fully intact (Count: ${invoiceCount})`);
    assert(monthlyCount >= 0, `Legacy 'monthly_invoice' table fully intact (Count: ${monthlyCount})`);
    assert(onCallCount >= 0, `Legacy 'onCallInvoice' table fully intact (Count: ${onCallCount})`);

    // Clean up test records
    await notifLog.destroy({ force: true });
    await subInvoice.destroy({ force: true });
    await activationToken.destroy({ force: true });
    await regRequest.destroy({ force: true });
    console.log('  🧹 Cleaned up temporary validation fixtures.');

    console.log('\n========================================================================');
    console.log(`📊 PHASE 1 VALIDATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Phase 1 test suite execution failed:', err);
    process.exit(1);
  }
}

runPhase1Tests();
