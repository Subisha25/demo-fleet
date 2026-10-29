import axios from 'axios';
import { TenantSmsConfig, TemplateMappingItem } from '../models/tenantSmsConfig';
import { TenantSubscription } from '../models/tenantSubscription';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { encryptSmsApiKey, decryptSmsApiKey, maskApiKey } from '../utils/cryptoUtils';
import { normalizePhoneNumberForSms } from './smsServices';
import { NotificationLog } from '../models/notificationLog';

/**
 * Pre-approved telecom DLT templates matching Indian carrier regulations under header GRCCAB.
 */
export const STANDARD_DLT_TEMPLATES: Array<TemplateMappingItem & { templateCode: string }> = [
  {
    templateCode: 'BOOKING_CREATION',
    templateName: 'Booking Confimation Message',
    expectedVars: 10,
    description: 'Direct Booking Confirmation with Driver Details',
    varNames: [
      'Customer Name',
      'Booking Code',
      'Route Shortlink',
      'Booking Date & Time',
      'Driver Name',
      'Driver Phone',
      'Vehicle Name',
      'Vehicle Number',
      'Fleet Name',
      'Customer Support Phone',
    ],
    isApproved: true,
  },
  {
    templateCode: 'BOOKING_CONFIRM_GUEST',
    templateName: 'BookingConfirmGuest',
    expectedVars: 8,
    description: 'Guest Booking Confirmation with Driver Details',
    varNames: [
      'Passenger Name',
      'Driver Name',
      'Driver Phone',
      'Vehicle Name',
      'Vehicle Number',
      'Booking Date & Time',
      'Fleet Name',
      'Customer Support Phone',
    ],
    isApproved: true,
  },
  {
    templateCode: 'DRIVER_ASSIGNED_TO_DRIVER',
    templateName: 'Driver Assigning',
    expectedVars: 4,
    description: 'Driver Trip Assignment Notification',
    varNames: ['Driver Name', 'Passenger & Booking Code', 'Passenger Contact Phone', 'Route Details'],
    isApproved: true,
  },
  {
    templateCode: 'BOOKING_CANCELLATION',
    templateName: 'Booking Cancellation',
    expectedVars: 4,
    description: 'Customer Booking Cancellation Notification',
    varNames: ['Customer Name', 'Booking Code', 'Pickup Location', 'Drop Location'],
    isApproved: true,
  },
  {
    templateCode: 'MANAGER_BOOKING_CONFIRMATION',
    templateName: 'Manager Booking Confirmation',
    expectedVars: 6,
    description: 'Manager New Booking Notification',
    varNames: ['Manager', 'Booking Code', 'Booking Date', 'Customer Name', 'Pickup Location', 'Drop Location'],
    isApproved: true,
  },
  {
    templateCode: 'MANAGER_CANCEL_BOOKING',
    templateName: 'ManagerCancelBooking',
    expectedVars: 4,
    description: 'Manager Booking Cancellation Notification',
    varNames: ['Customer Name', 'Booking Code', 'Pickup Location', 'Drop Location'],
    isApproved: true,
  },
  {
    templateCode: 'INVOICE_CANCEL',
    templateName: 'Invoice Cancel',
    expectedVars: 3,
    description: 'Invoice Cancellation Notification',
    varNames: ['Customer Name', 'Booking Code', 'Invoice Number'],
    isApproved: true,
  },
  {
    templateCode: 'USER_BOOKING_ACKNOWLEDGMENT',
    templateName: 'Booking Creation',
    expectedVars: 1,
    description: 'User Booking Creation Acknowledgment',
    varNames: ['Booking Code / Summary'],
    isApproved: true,
  },
  {
    templateCode: 'SYSTEM_OTP',
    templateName: 'OTP1',
    expectedVars: 0,
    description: '2Factor System Pre-Approved OTP Route',
    varNames: ['Phone', 'OTP Code', 'Template Name (OTP1)'],
    isApproved: true,
  },
];

/**
 * Checks whether tenant's subscription is eligible to activate SMS provider integration.
 * Modular implementation so future subscription/payment workflow can activate SMS configuration seamlessly.
 */
export async function isTenantEligibleForSms(tenantId: string): Promise<{
  eligible: boolean;
  reason?: string;
  planTier?: string;
  subscriptionStatus?: string;
}> {
  if (tenantId === ROOT_TENANT_ID) {
    return {
      eligible: true,
      planTier: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
    };
  }

  try {
    const sub = await TenantSubscription.findOne({ where: { tenantId } });
    if (!sub) {
      return {
        eligible: false,
        reason: 'No active subscription record found for this fleet.',
      };
    }

    if (sub.status === 'SUSPENDED' || sub.status === 'CANCELED') {
      return {
        eligible: false,
        reason: `Subscription is currently ${sub.status}. Please renew your subscription to activate SMS features.`,
        planTier: sub.planTier,
        subscriptionStatus: sub.status,
      };
    }

    return {
      eligible: true,
      planTier: sub.planTier,
      subscriptionStatus: sub.status,
    };
  } catch (err: any) {
    return {
      eligible: false,
      reason: err?.message || 'Failed to verify subscription eligibility.',
    };
  }
}

/**
 * Retrieves tenant's SMS configuration without ever exposing plaintext credentials.
 */
export async function getTenantSmsConfig(tenantId: string): Promise<{
  success: boolean;
  config: {
    tenantId: string;
    provider: string;
    senderId: string;
    apiKeyMasked: string;
    hasApiKey: boolean;
    otpRoute: string;
    status: string;
    isVerified: boolean;
    isEnabled: boolean;
    lastVerifiedAt: Date | null;
    lastVerificationResult: any;
    templateMappings: Record<string, TemplateMappingItem>;
    subscriptionEligibility: {
      eligible: boolean;
      reason?: string;
      planTier?: string;
      subscriptionStatus?: string;
    };
  };
}> {
  const eligibility = await isTenantEligibleForSms(tenantId);

  let record = await TenantSmsConfig.findOne({ where: { tenantId } });

  // If root tenant and not in DB yet, create or fallback
  if (!record && tenantId === ROOT_TENANT_ID) {
    const envKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
    const envSender = (process.env.TWO_FACTOR_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'GRCCAB').trim();
    if (envKey) {
      record = await TenantSmsConfig.create({
        tenantId,
        provider: '2FACTOR',
        encryptedApiKey: encryptSmsApiKey(envKey),
        apiKeyMasked: maskApiKey(envKey),
        senderId: envSender,
        otpRoute: 'OTP1',
        status: 'ACTIVE',
        isVerified: true,
        isEnabled: true,
      });
    }
  }

  // Build default template mappings
  const defaultMappings: Record<string, TemplateMappingItem> = {};
  STANDARD_DLT_TEMPLATES.forEach((t) => {
    defaultMappings[t.templateCode] = {
      templateName: t.templateName,
      expectedVars: t.expectedVars,
      description: t.description,
      varNames: t.varNames,
      isApproved: t.isApproved,
    };
  });

  const mergedMappings = {
    ...defaultMappings,
    ...(record?.templateMappings || {}),
  };

  const hasApiKey = Boolean(record?.encryptedApiKey);

  return {
    success: true,
    config: {
      tenantId,
      provider: record?.provider || '2FACTOR',
      senderId: record?.senderId || (tenantId === ROOT_TENANT_ID ? 'GRCCAB' : ''),
      apiKeyMasked: record?.apiKeyMasked || (hasApiKey ? '••••••••••••' : 'Not Configured'),
      hasApiKey,
      otpRoute: record?.otpRoute || 'OTP1',
      status: record?.status || (hasApiKey ? 'ACTIVE' : 'UNCONFIGURED'),
      isVerified: Boolean(record?.isVerified),
      isEnabled: record ? record.isEnabled : true,
      lastVerifiedAt: record?.lastVerifiedAt || null,
      lastVerificationResult: record?.lastVerificationResult || null,
      templateMappings: mergedMappings,
      subscriptionEligibility: eligibility,
    },
  };
}

/**
 * Saves or updates tenant's SMS configuration securely.
 * Encrypts provider credentials using server-side AES-256-GCM.
 */
export async function upsertTenantSmsConfig(
  tenantId: string,
  payload: {
    provider?: string;
    apiKey?: string;
    senderId?: string;
    otpRoute?: string;
    isEnabled?: boolean;
    templateMappings?: Record<string, TemplateMappingItem>;
  }
): Promise<{
  success: boolean;
  message: string;
  config: any;
}> {
  const eligibility = await isTenantEligibleForSms(tenantId);

  let record = await TenantSmsConfig.findOne({ where: { tenantId } });

  const provider = (payload.provider || record?.provider || '2FACTOR').toUpperCase();
  if (provider !== '2FACTOR' && provider !== 'TWILIO') {
    throw new Error('Unsupported SMS provider. Currently supported: 2FACTOR');
  }

  const senderId = (payload.senderId || record?.senderId || 'GRCCAB').trim().toUpperCase();
  if (senderId.length < 3 || senderId.length > 10) {
    throw new Error('Sender ID must be between 3 and 10 alphanumeric characters (e.g. GRCCAB).');
  }

  const otpRoute = (payload.otpRoute || record?.otpRoute || 'OTP1').trim();

  let encryptedApiKey = record?.encryptedApiKey || null;
  let apiKeyMasked = record?.apiKeyMasked || null;

  // Only re-encrypt if a new raw API key is provided and not already masked
  if (payload.apiKey && typeof payload.apiKey === 'string') {
    const rawKey = payload.apiKey.trim();
    if (rawKey && !rawKey.includes('••••')) {
      encryptedApiKey = encryptSmsApiKey(rawKey);
      apiKeyMasked = maskApiKey(rawKey);
    }
  }

  let status = record?.status || 'UNCONFIGURED';
  if (!encryptedApiKey) {
    status = 'UNCONFIGURED';
  } else if (!eligibility.eligible) {
    status = 'PENDING_SUBSCRIPTION';
  } else if (status === 'UNCONFIGURED') {
    status = 'ACTIVE';
  }

  const isEnabled = payload.isEnabled !== undefined ? Boolean(payload.isEnabled) : (record ? record.isEnabled : true);

  const templateMappings = payload.templateMappings || record?.templateMappings || null;

  if (record) {
    await record.update({
      provider: provider as any,
      encryptedApiKey,
      apiKeyMasked,
      senderId,
      otpRoute,
      status: status as any,
      isEnabled,
      templateMappings,
    });
  } else {
    record = await TenantSmsConfig.create({
      tenantId,
      provider: provider as any,
      encryptedApiKey,
      apiKeyMasked,
      senderId,
      otpRoute,
      status: status as any,
      isEnabled,
      templateMappings,
      isVerified: false,
    });
  }

  return {
    success: true,
    message: 'SMS provider configuration saved successfully.',
    config: {
      tenantId,
      provider: record.provider,
      senderId: record.senderId,
      apiKeyMasked: record.apiKeyMasked,
      hasApiKey: Boolean(record.encryptedApiKey),
      otpRoute: record.otpRoute,
      status: record.status,
      isVerified: record.isVerified,
      isEnabled: record.isEnabled,
      lastVerifiedAt: record.lastVerifiedAt,
      subscriptionEligibility: eligibility,
    },
  };
}

/**
 * Validates tenant's 2Factor connectivity safely without transmitting any real SMS.
 * Uses 2Factor's read-only account balance check endpoint.
 */
export async function validateTenantSmsConnection(tenantId: string): Promise<{
  success: boolean;
  status: string;
  message: string;
  verifiedAt: Date;
  details?: any;
}> {
  const decrypted = await getTenantDecryptedCredentials(tenantId);
  if (!decrypted.isConfigured || !decrypted.apiKey) {
    throw new Error('Cannot validate SMS gateway: No API key configured for this fleet.');
  }

  const verifiedAt = new Date();

  // Safety Mock Check: In mock mode, validate syntax & configuration without remote HTTP requests
  if (process.env.NOTIFICATION_MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
    const mockDetails = {
      mock: true,
      senderId: decrypted.senderId,
      provider: '2Factor.in',
      balanceCheck: 'PASSED (Mocked Sandbox Verification)',
      endpointVerified: 'https://2factor.in/API/V1/{key}/BAL/SMS',
      verifiedAt: verifiedAt.toISOString(),
    };

    const record = await TenantSmsConfig.findOne({ where: { tenantId } });
    if (record) {
      await record.update({
        isVerified: true,
        lastVerifiedAt: verifiedAt,
        lastVerificationResult: mockDetails,
        status: 'VERIFIED',
      });
    }

    return {
      success: true,
      status: 'VERIFIED',
      message: 'Gateway connectivity validated successfully in safe mock mode (Zero real provider calls).',
      verifiedAt,
      details: mockDetails,
    };
  }

  // Live Gateway Verification: Read-only balance check
  try {
    const url = `https://2factor.in/API/V1/${decrypted.apiKey}/BAL/SMS`;
    const res = await axios.get(url, { timeout: 8000 });

    const isSuccess = res.data?.Status === 'Success';
    const resultDetails = {
      status: res.data?.Status,
      balance: res.data?.Details,
      senderId: decrypted.senderId,
      verifiedAt: verifiedAt.toISOString(),
    };

    const record = await TenantSmsConfig.findOne({ where: { tenantId } });
    if (record) {
      await record.update({
        isVerified: isSuccess,
        lastVerifiedAt: verifiedAt,
        lastVerificationResult: resultDetails,
        status: isSuccess ? 'VERIFIED' : 'TEST_FAILED',
      });
    }

    if (!isSuccess) {
      return {
        success: false,
        status: 'TEST_FAILED',
        message: res.data?.Details || '2Factor API rejected credentials during validation.',
        verifiedAt,
        details: resultDetails,
      };
    }

    return {
      success: true,
      status: 'VERIFIED',
      message: `2Factor Gateway validated successfully. Available transactional balance: ${res.data?.Details}`,
      verifiedAt,
      details: resultDetails,
    };
  } catch (err: any) {
    const errMsg = err.response?.data?.Details || err.message || 'Gateway connection error';
    const failureDetails = {
      error: errMsg,
      verifiedAt: verifiedAt.toISOString(),
    };

    const record = await TenantSmsConfig.findOne({ where: { tenantId } });
    if (record) {
      await record.update({
        isVerified: false,
        lastVerifiedAt: verifiedAt,
        lastVerificationResult: failureDetails,
        status: 'TEST_FAILED',
      });
    }

    return {
      success: false,
      status: 'TEST_FAILED',
      message: `Gateway validation failed: ${errMsg}`,
      verifiedAt,
      details: failureDetails,
    };
  }
}

/**
 * Sends a single test SMS with explicit confirmation.
 */
export async function sendTenantTestSms(
  tenantId: string,
  destinationPhone: string,
  confirmRealSms: boolean
): Promise<{
  success: boolean;
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED' | 'MOCK';
  message: string;
  providerMessageId?: string;
}> {
  if (!confirmRealSms) {
    throw new Error('Explicit confirmation is required to initiate an SMS delivery test.');
  }

  const phoneCheck = normalizePhoneNumberForSms(destinationPhone);
  if (!phoneCheck.valid) {
    throw new Error(phoneCheck.error || 'Invalid test recipient phone number.');
  }

  const decrypted = await getTenantDecryptedCredentials(tenantId);
  if (!decrypted.isConfigured || !decrypted.apiKey) {
    return {
      success: false,
      providerStatus: 'UNCONFIGURED',
      message: 'Cannot send test SMS: No SMS provider configuration saved for this tenant.',
    };
  }

  // Safety mock mode check
  if (process.env.NOTIFICATION_MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
    const mockId = `mock_test_${Date.now()}`;
    await NotificationLog.create({
      channel: 'SMS',
      recipient: phoneCheck.normalizedPhone,
      templateCode: 'TEST_SMS_VALIDATION',
      tenantId,
      providerStatus: 'MOCK',
      providerMessageId: mockId,
      metadata: {
        test: true,
        tenantId,
        senderId: decrypted.senderId,
      },
    });

    return {
      success: true,
      providerStatus: 'MOCK',
      message: 'Test SMS simulated successfully in mock mode. Zero provider calls occurred.',
      providerMessageId: mockId,
    };
  }

  // Real SMS test using pre-approved template Booking Creation or OTP1
  try {
    const url = `https://2factor.in/API/V1/${decrypted.apiKey}/SMS/${phoneCheck.normalizedPhone}/123456/OTP1`;
    const res = await axios.get(url, { timeout: 10000 });

    if (res.data?.Status === 'Success') {
      const msgId = String(res.data?.Details || `TEST-${Date.now()}`);
      await NotificationLog.create({
        channel: 'SMS',
        recipient: phoneCheck.normalizedPhone,
        templateCode: 'TEST_SMS_VALIDATION',
        tenantId,
        providerStatus: 'SENT',
        providerMessageId: msgId,
      });

      return {
        success: true,
        providerStatus: 'SENT',
        message: 'Live test SMS accepted by 2Factor gateway.',
        providerMessageId: msgId,
      };
    }

    return {
      success: false,
      providerStatus: 'FAILED',
      message: res.data?.Details || '2Factor gateway rejected test SMS request.',
    };
  } catch (err: any) {
    const errMsg = err.response?.data?.Details || err.message;
    return {
      success: false,
      providerStatus: 'FAILED',
      message: `Failed to deliver test SMS: ${errMsg}`,
    };
  }
}

/**
 * Internal resolver: Securely decrypts and returns tenant's credentials for SMS dispatch.
 * Enforces strict tenant isolation: Never falls back to another tenant's credentials!
 */
export async function getTenantDecryptedCredentials(tenantId?: string): Promise<{
  isConfigured: boolean;
  tenantId: string;
  provider: string;
  apiKey: string;
  senderId: string;
  otpRoute: string;
  templateMappings?: Record<string, TemplateMappingItem> | null;
  status: string;
}> {
  const targetTenantId = tenantId || ROOT_TENANT_ID;

  let record: TenantSmsConfig | null = null;
  try {
    record = await TenantSmsConfig.findOne({ where: { tenantId: targetTenantId } });
  } catch (dbErr) {
    // If table doesn't exist yet or DB issue, proceed to safe fallback / unconfigured logic
  }

  if (record && record.encryptedApiKey && record.isEnabled) {
    const apiKey = decryptSmsApiKey(record.encryptedApiKey);
    if (apiKey) {
      return {
        isConfigured: true,
        tenantId: targetTenantId,
        provider: record.provider,
        apiKey,
        senderId: record.senderId || 'GRCCAB',
        otpRoute: record.otpRoute || 'OTP1',
        templateMappings: record.templateMappings,
        status: record.status,
      };
    }
  }


  // Allow environment fallback ONLY for root platform tenant (backward compatibility)
  if (targetTenantId === ROOT_TENANT_ID) {
    const rootKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
    const rootSender = (process.env.TWO_FACTOR_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'GRCCAB').trim();
    if (rootKey) {
      return {
        isConfigured: true,
        tenantId: ROOT_TENANT_ID,
        provider: '2FACTOR',
        apiKey: rootKey,
        senderId: rootSender || 'GRCCAB',
        otpRoute: 'OTP1',
        status: 'ACTIVE',
      };
    }
  }

  // Tenant is unconfigured - DO NOT SILENTLY FALL BACK TO ANOTHER TENANT OR ROOT!
  return {
    isConfigured: false,
    tenantId: targetTenantId,
    provider: '2FACTOR',
    apiKey: '',
    senderId: '',
    otpRoute: 'OTP1',
    status: 'UNCONFIGURED',
  };
}
