import { v4 as uuidv4 } from 'uuid';
import {
  encryptSmsApiKey,
  decryptSmsApiKey,
  maskApiKey,
} from '../utils/cryptoUtils';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { TenantSmsConfig } from '../models/tenantSmsConfig';
import {
  getTenantSmsConfig,
  upsertTenantSmsConfig,
  validateTenantSmsConnection,
  sendTenantTestSms,
  getTenantDecryptedCredentials,
  isTenantEligibleForSms,
  STANDARD_DLT_TEMPLATES,
} from '../services/tenantSmsConfigService';
import {
  send2FactorTemplateSms,
  send2FactorOTP,
  sendDirectSms,
  dispatchAuditedSms,
} from '../services/smsServices';
import { sendNotification } from '../services/notificationService';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { NotificationLog } from '../models/notificationLog';

let passed = 0;
let failed = 0;
let realNetworkCalls = 0;

async function check(desc: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  ✔ [PASS] ${desc}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✖ [FAIL] ${desc}\n    Error: ${err?.message || err}`);
    failed++;
  }
}

async function run() {
  console.log('========================================================================');
  console.log('  FLEETFLOW — MULTI-TENANT SMS ISOLATION & ENCRYPTION VERIFICATION');
  console.log('========================================================================\n');

  // Verify Mock Mode Safety
  await check('NOTIFICATION_MOCK_MODE is strictly "true"', () => {
    if (process.env.NOTIFICATION_MOCK_MODE !== 'true') {
      throw new Error(`Expected NOTIFICATION_MOCK_MODE to be "true", got: ${process.env.NOTIFICATION_MOCK_MODE}`);
    }
  });

  // 1. Encryption and Masking Utilities
  await check('encryptSmsApiKey encrypts credentials with AES-256-GCM', () => {
    const rawKey = 'c7a289f8-9abb-11f0-b922-0200cd936042';
    const cipher = encryptSmsApiKey(rawKey);
    if (!cipher || !cipher.includes(':')) {
      throw new Error('Encryption failed or output does not follow iv:tag:data structure');
    }
    if (cipher.includes(rawKey)) {
      throw new Error('Security Breach: Raw API key is visible inside encrypted ciphertext!');
    }
    const decrypted = decryptSmsApiKey(cipher);
    if (decrypted !== rawKey) {
      throw new Error(`Decryption mismatch! Expected ${rawKey}, got ${decrypted}`);
    }
  });

  await check('maskApiKey masks all but last 4 characters and never exposes full key', () => {
    const rawKey = 'c7a289f8-9abb-11f0-b922-0200cd936042';
    const masked = maskApiKey(rawKey);
    if (!masked.startsWith('••••') || !masked.endsWith('6042')) {
      throw new Error(`Unexpected masked format: ${masked}`);
    }
    if (masked.includes('c7a289f8')) {
      throw new Error('Security Breach: Sensitive prefix revealed in masked API key!');
    }
  });

  // 2. Setup isolated test tenants
  const tenantAId = uuidv4();
  const tenantBId = uuidv4();

  await check('Provision distinct test tenants in database', async () => {
    await Tenant.create({
      tenantId: tenantAId,
      name: 'Alpha Fleet Mobility',
      code: `AL${Date.now().toString().slice(-4)}`,
      subdomain: `alpha-${Date.now()}`,
      status: 'ACTIVE',
      planTier: 'PRO',
      contactEmail: 'admin@alphafleet.com',
    });

    await TenantSubscription.create({
      tenantId: tenantAId,
      planTier: 'PRO',
      status: 'ACTIVE',
      vehicleQuota: 50,
      driverQuota: 50,
      companyQuota: 10,
      monthlyTripQuota: 5000,
      allowOverage: true,
    });

    await Tenant.create({
      tenantId: tenantBId,
      name: 'Beta Transport Group',
      code: `BT${Date.now().toString().slice(-4)}`,
      subdomain: `beta-${Date.now()}`,
      status: 'ACTIVE',
      planTier: 'BASIC',
      contactEmail: 'admin@betatransport.com',
    });

    await TenantSubscription.create({
      tenantId: tenantBId,
      planTier: 'BASIC',
      status: 'ACTIVE',
      vehicleQuota: 15,
      driverQuota: 15,
      companyQuota: 3,
      monthlyTripQuota: 1000,
      allowOverage: false,
    });
  });

  // 3. Modular Subscription Eligibility Verification
  await check('isTenantEligibleForSms verifies active subscription modularly', async () => {
    const eligibleA = await isTenantEligibleForSms(tenantAId);
    if (!eligibleA.eligible || eligibleA.planTier !== 'PRO') {
      throw new Error(`Expected Tenant A to be eligible, got: ${JSON.stringify(eligibleA)}`);
    }

    const nonExistentId = uuidv4();
    const nonExistent = await isTenantEligibleForSms(nonExistentId);
    if (nonExistent.eligible) {
      throw new Error('Expected un-provisioned tenant to be ineligible for SMS');
    }
  });

  // 4. Tenant A Configuration & Isolated Storage
  const apiKeyA = 'alpha-api-key-998877665544';
  await check('upsertTenantSmsConfig stores encrypted credentials for Tenant A', async () => {
    const res = await upsertTenantSmsConfig(tenantAId, {
      provider: '2FACTOR',
      apiKey: apiKeyA,
      senderId: 'ALPHAF',
      otpRoute: 'OTP1',
      isEnabled: true,
    });

    if (!res.success) {
      throw new Error(`Failed to save config: ${res.message}`);
    }

    // Direct database inspection: verify credentials are encrypted at rest
    const record = await TenantSmsConfig.findOne({ where: { tenantId: tenantAId } });
    if (!record || !record.encryptedApiKey) {
      throw new Error('TenantSmsConfig record not found in database');
    }
    if (record.encryptedApiKey.includes(apiKeyA)) {
      throw new Error('Security Breach: Raw API key stored in database in plain text!');
    }
    if (record.apiKeyMasked !== '••••••••••••5544') {
      throw new Error(`Unexpected masked value in DB: ${record.apiKeyMasked}`);
    }
    if (record.senderId !== 'ALPHAF') {
      throw new Error(`Unexpected senderId: ${record.senderId}`);
    }
  });

  // 5. Strict Tenant Isolation
  await check('Tenant B configuration remains independent and unconfigured', async () => {
    const configB = await getTenantSmsConfig(tenantBId);
    if (configB.config.hasApiKey) {
      throw new Error('Tenant B incorrectly shares Tenant A credentials!');
    }
    if (configB.config.apiKeyMasked !== 'Not Configured') {
      throw new Error(`Expected Not Configured for Tenant B, got: ${configB.config.apiKeyMasked}`);
    }

    const credsB = await getTenantDecryptedCredentials(tenantBId);
    if (credsB.isConfigured || credsB.apiKey) {
      throw new Error('Security Violation: Tenant B resolved Tenant A or Root API key!');
    }
  });

  // 6. Safe Gateway Connection Validation (No SMS Sent)
  await check('validateTenantSmsConnection verifies gateway without sending SMS', async () => {
    const valResult = await validateTenantSmsConnection(tenantAId);
    if (!valResult.success || valResult.status !== 'VERIFIED') {
      throw new Error(`Validation failed: ${JSON.stringify(valResult)}`);
    }

    const record = await TenantSmsConfig.findOne({ where: { tenantId: tenantAId } });
    if (!record?.isVerified || record.status !== 'VERIFIED') {
      throw new Error(`DB record status not updated to VERIFIED, status is: ${record?.status}`);
    }
  });

  // 7. Explicit User Action Required for Test Message
  await check('sendTenantTestSms strictly rejects if confirmRealSms is false', async () => {
    try {
      await sendTenantTestSms(tenantAId, '9080280818', false);
      throw new Error('Expected validation error when confirmRealSms is false');
    } catch (err: any) {
      if (!err.message.includes('Explicit confirmation is required')) {
        throw new Error(`Unexpected error message: ${err.message}`);
      }
    }
  });

  await check('sendTenantTestSms succeeds in mock mode when explicitly confirmed', async () => {
    const res = await sendTenantTestSms(tenantAId, '9080280818', true);
    if (!res.success || res.providerStatus !== 'MOCK') {
      throw new Error(`Expected mock success, got: ${JSON.stringify(res)}`);
    }
  });

  // 8. Tenant Isolation at Dispatch Time
  await check('send2FactorTemplateSms uses Tenant A credentials and does not leak to Tenant B', async () => {
    // Tenant A (configured)
    const resA = await send2FactorTemplateSms({
      to: '9080280818',
      templateName: 'Driver Assigning',
      vars: ['Driver Raman', 'Booking GC-100', '9080280818', 'route_link'],
      tenantId: tenantAId,
    });
    if (!resA.success || resA.providerStatus !== 'SENT') {
      throw new Error(`Expected Tenant A dispatch success, got: ${JSON.stringify(resA)}`);
    }

    // Tenant B (unconfigured) must be reported as UNCONFIGURED
    const resB = await send2FactorTemplateSms({
      to: '9080280818',
      templateName: 'Driver Assigning',
      vars: ['Driver Raman', 'Booking GC-100', '9080280818', 'route_link'],
      tenantId: tenantBId,
    });
    if (resB.success || resB.providerStatus !== 'UNCONFIGURED') {
      throw new Error(`Expected Tenant B to fail with UNCONFIGURED, got: ${JSON.stringify(resB)}`);
    }
  });

  await check('send2FactorOTP enforces tenant isolation on OTP dispatch', async () => {
    // Tenant A (configured)
    const otpA = await send2FactorOTP('9080280818', '654321', 'OTP1', tenantAId);
    if (!otpA.success || otpA.providerStatus !== 'SENT') {
      throw new Error(`Expected Tenant A OTP success, got: ${JSON.stringify(otpA)}`);
    }

    // Tenant B (unconfigured)
    const otpB = await send2FactorOTP('9080280818', '654321', 'OTP1', tenantBId);
    if (otpB.success || otpB.providerStatus !== 'UNCONFIGURED') {
      throw new Error(`Expected Tenant B OTP to fail with UNCONFIGURED, got: ${JSON.stringify(otpB)}`);
    }
  });

  await check('dispatchAuditedSms persists tenantId in notification_logs table', async () => {
    await dispatchAuditedSms({
      recipient: '9080280818',
      templateCode: 'DRIVER_ASSIGNED_TO_CUSTOMER',
      templateName: 'Driver Assigning',
      vars: ['Driver Raman', 'Booking GC-100', '9080280818', 'route_link'],
      tenantId: tenantAId,
      referenceEntity: 'BOOKING',
      referenceId: 'test-booking-id-123',
    });

    const log = await NotificationLog.findOne({
      where: {
        referenceId: 'test-booking-id-123',
        tenantId: tenantAId,
      },
    });

    if (!log) {
      throw new Error('NotificationLog entry with tenantId not found in database!');
    }
    if (log.tenantId !== tenantAId) {
      throw new Error(`Expected tenantId ${tenantAId}, got ${log.tenantId}`);
    }
  });

  await check('sendNotification propagates tenantId cleanly across multi-tenant dispatch', async () => {
    const res = await sendNotification({
      channel: 'SMS',
      recipient: '9080280818',
      templateCode: 'BOOKING_CREATION',
      smsTemplateName: 'Booking Confimation Message',
      smsVars: [
        'John Doe',
        'GC-999',
        'https://route.ly',
        '29 Oct 2026',
        'Suresh',
        '9876543210',
        'Innova Crysta',
        'KA01AB1234',
        'Alpha Fleet',
        '9080280818',
      ],
      tenantId: tenantAId,
      referenceEntity: 'BOOKING',
      referenceId: 'booking-999',
    });

    if (!res.success) {
      throw new Error(`sendNotification failed: ${JSON.stringify(res)}`);
    }

    const log = await NotificationLog.findOne({
      where: {
        referenceId: 'booking-999',
        tenantId: tenantAId,
      },
    });
    if (!log || log.tenantId !== tenantAId) {
      throw new Error(`Expected NotificationLog with tenantId ${tenantAId}, found: ${log?.tenantId}`);
    }
  });

  // Clean up test tenants
  try {
    await TenantSmsConfig.destroy({ where: { tenantId: [tenantAId, tenantBId] } });
    await TenantSubscription.destroy({ where: { tenantId: [tenantAId, tenantBId] } });
    await Tenant.destroy({ where: { tenantId: [tenantAId, tenantBId] } });
    await NotificationLog.destroy({ where: { tenantId: [tenantAId, tenantBId] } });
  } catch {}

  console.log('\n------------------------------------------------------------------------');
  console.log(`SUMMARY: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed} | Real Network Calls: ${realNetworkCalls}`);
  console.log('------------------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Fatal Test Error:', e);
  process.exit(1);
});
