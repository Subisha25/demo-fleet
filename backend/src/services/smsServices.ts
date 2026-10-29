import axios from 'axios';
import { Op } from 'sequelize';
import { NotificationLog } from '../models/notificationLog';
import { createShortCode } from '../utils/shortLinkStore';
import { getFleetDocumentBranding } from './fleetBrandingService';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { getTenantDecryptedCredentials } from './tenantSmsConfigService';

/**
 * Masks phone number for secure production logging.
 * Masks all but the last 4 digits.
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return 'UNKNOWN';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length <= 4) return '****';
  return '*'.repeat(clean.length - 4) + clean.slice(-4);
}

/**
 * Normalizes and validates phone numbers.
 * Supports standard Indian mobile numbers (10 digits).
 * Prevents duplicate country codes (+91+91 or 9191).
 */
export function normalizePhoneNumberForSms(phone?: string | null): {
  valid: boolean;
  normalizedPhone: string;
  error?: string;
} {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, normalizedPhone: '', error: 'Phone number is missing or empty' };
  }

  const trimmed = phone.trim();
  let cleaned = trimmed.replace(/[\s\-\(\)]/g, '');
  let digitsOnly = cleaned.replace(/\D/g, '');

  // Strip redundant leading 91 prefixes until 10 digits remain
  while (digitsOnly.startsWith('91') && digitsOnly.length > 10) {
    digitsOnly = digitsOnly.substring(2);
  }

  if (digitsOnly.length !== 10) {
    return {
      valid: false,
      normalizedPhone: digitsOnly,
      error: `Invalid phone length: ${digitsOnly.length} digits (10 digits required)`,
    };
  }

  return { valid: true, normalizedPhone: digitsOnly };
}

/**
 * Parses 2Factor DLR XML response to distinguish API acceptance from true handset delivery.
 */
export function parse2FactorDlrXml(xmlStr: string): {
  deliveryStatus: 'DELIVERED' | 'PENDING' | 'FAILED';
  rawStatus: string;
  deliveredAt?: Date;
} {
  const statusMatch = xmlStr.match(/<statusDesc>(.*?)<\/statusDesc>/i);
  const deliveredAtMatch = xmlStr.match(/<deliveredAt>(.*?)<\/deliveredAt>/i);
  const errorMatch = xmlStr.match(/<errorId>(.*?)<\/errorId>/i);
  const rawStatus = statusMatch ? statusMatch[1].toUpperCase() : 'UNKNOWN';

  let deliveryStatus: 'DELIVERED' | 'PENDING' | 'FAILED' = 'PENDING';
  if (rawStatus === 'DELIVERED') {
    deliveryStatus = 'DELIVERED';
  } else if (
    rawStatus === 'FAILED' ||
    rawStatus === 'UNDELIVERED' ||
    rawStatus === 'REJECTED' ||
    (errorMatch && errorMatch[1] !== '0' && errorMatch[1] !== 'NA')
  ) {
    deliveryStatus = 'FAILED';
  } else {
    deliveryStatus = 'PENDING';
  }

  let deliveredAt: Date | undefined;
  if (deliveredAtMatch && deliveredAtMatch[1]) {
    try {
      deliveredAt = new Date(deliveredAtMatch[1]);
    } catch {
      // Ignored
    }
  }

  return { rawStatus, deliveryStatus, deliveredAt };
}

/**
 * Queries 2Factor DLR Delivery Status API using the provider session ID.
 */
export async function query2FactorDlrStatus(sessionId: string): Promise<{
  deliveryStatus: 'DELIVERED' | 'PENDING' | 'FAILED';
  rawStatus: string;
  deliveredAt?: Date;
  error?: string;
}> {
  const apiKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
  if (!apiKey || !sessionId || sessionId.startsWith('SIMULATED') || sessionId.startsWith('TW-')) {
    return { deliveryStatus: 'PENDING', rawStatus: 'NO_PROVIDER_DLR' };
  }

  try {
    const url = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/RPT/TSMS/${sessionId.trim()}`;
    const res = await axios.get(url, { timeout: 8000 });
    return parse2FactorDlrXml(String(res.data));
  } catch (err: any) {
    return {
      deliveryStatus: 'PENDING',
      rawStatus: 'PENDING_LOOKUP',
      error: err.response?.data || err.message,
    };
  }
}

/**
 * Sanitizes and shortens pickup and drop location strings for DLT template variables.
 * In Indian telecom DLT registrations (e.g., ManageAlert, ManagerCancelBooking), location parameters
 * typically have a 27-30 character maximum constraint.
 * If location string > 27 characters, takes only the text before the first comma, matching reference behavior.
 */
export function sanitizeDltLocationString(location?: string | null, maxLength = 27): string {
  if (!location || typeof location !== 'string') return '';
  const trimmed = location.trim();
  if (trimmed.length > maxLength) {
    return trimmed.split(',')[0].trim().substring(0, maxLength);
  }
  return trimmed;
}

/**
 * Approved 2Factor DLT Template Names registered under Header GRCCAB.
 * Sourced directly from production configuration and reference vehicle project.
 */
export const APPROVED_2FACTOR_TEMPLATES: Record<string, string> = {
  // Direct booking confirmation with driver details (10 vars)
  'Booking Confimation Message': 'Booking Confimation Message',
  'Booking Creation Confirmation': 'Booking Confimation Message',
  'BOOKING_CREATION': 'Booking Confimation Message', // Preserved for testFinalSmsDltVerification.ts compatibility
  'DRIVER_ASSIGNED_TO_CUSTOMER': 'Booking Confimation Message',

  // Guest booking confirmation (8 vars)
  'BookingConfirmGuest': 'BookingConfirmGuest',

  // User booking creation acknowledgment (1 var - reference empServices.ts:2840)
  'Booking Creation': 'Booking Creation',
  'BOOKING_CREATED': 'Booking Creation',

  // Driver notifications (4 vars)
  'Driver Assigning': 'Driver Assigning',
  'DRIVER_ASSIGNED_TO_DRIVER': 'Driver Assigning',
  'BOOKING_ASSIGNED_TO_DRIVER': 'Driver Assigning',

  // Customer cancellations (4 vars)
  'Booking Cancellation': 'Booking Cancellation',
  'BOOKING_CANCELLATION': 'Booking Cancellation',

  // Manager alerts (6 vars - reference empServices.ts:2462)
  'ManageAlert': 'ManageAlert',
  'MANAGER_BOOKING_CONFIRMATION': 'ManageAlert',
  'Manager Booking Confirmation': 'ManageAlert',

  // Manager cancellations (4 vars - reference empServices.ts:2597)
  'ManagerCancelBooking': 'ManagerCancelBooking',
  'MANAGER_CANCEL_BOOKING': 'ManagerCancelBooking',

  // Invoice cancellations (3 vars - reference invServices.ts:1278)
  'Invoice Cancel': 'Invoice Cancel',
  'INVOICE_CANCEL': 'Invoice Cancel',

  // System OTP route (pre-approved 2Factor system route)
  'OTP1': 'OTP1',
};

/**
 * Expected positional variable counts for registered 2Factor DLT templates under Header GRCCAB.
 */
export const DLT_TEMPLATE_VARIABLE_SPECS: Record<string, { expectedVars: number; description: string }> = {
  'Booking Confimation Message': { expectedVars: 10, description: 'Direct Booking Confirmation with Driver Details' },
  'BookingConfirmGuest': { expectedVars: 8, description: 'Guest Booking Confirmation with Driver Details' },
  'ManageAlert': { expectedVars: 6, description: 'Manager New Booking Alert' },
  'Driver Assigning': { expectedVars: 4, description: 'Driver Trip Assignment Notification' },
  'Booking Cancellation': { expectedVars: 4, description: 'Customer Booking Cancellation' },
  'ManagerCancelBooking': { expectedVars: 4, description: 'Manager Booking Cancellation' },
  'Invoice Cancel': { expectedVars: 3, description: 'Invoice Cancellation Notification' },
  'Booking Creation': { expectedVars: 1, description: 'User Booking Creation Acknowledgment' },
};

/**
 * Dispatches a registered 2Factor DLT Template SMS.
 * Clearly distinguishes CONFIGURED, ACCEPTED, and FAILED.
 * Does NOT claim delivery if provider is unconfigured or rejects request.
 */
export async function send2FactorTemplateSms(options: {
  to: string;
  templateName: string;
  vars: string[];
  tenantId?: string;
}): Promise<{
  success: boolean;
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED' | 'MOCK';
  providerMessageId?: string;
  error?: string;
}> {
  const phoneCheck = normalizePhoneNumberForSms(options.to);
  if (!phoneCheck.valid) {
    return {
      success: false,
      providerStatus: 'FAILED',
      error: phoneCheck.error || 'Invalid destination phone number',
    };
  }

  // Load tenant-isolated credentials
  const tenantCreds = await getTenantDecryptedCredentials(options.tenantId);

  // Safety mock mode check: Prevent real SMS transmission in test/mock environment
  if (process.env.NOTIFICATION_MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
    // If a non-root tenant is explicitly checked and is unconfigured, report UNCONFIGURED
    if (options.tenantId && options.tenantId !== ROOT_TENANT_ID && !tenantCreds.isConfigured) {
      const msg = `SMS provider unconfigured for tenant ${options.tenantId}`;
      console.warn(`[SMS Service: MOCK MODE Unconfigured] Destination: ${maskPhoneNumber(phoneCheck.normalizedPhone)} | Reason: ${msg}`);
      return {
        success: false,
        providerStatus: 'UNCONFIGURED',
        error: msg,
      };
    }
    console.log(`[SMS Service: MOCK MODE] Destination: ${maskPhoneNumber(phoneCheck.normalizedPhone)} | Template: ${options.templateName} | Status: MOCK`);
    return {
      success: true,
      providerStatus: 'SENT',
      providerMessageId: `mock_2factor_${Date.now()}`,
    };
  }

  if (!tenantCreds.isConfigured || !tenantCreds.apiKey) {
    const msg = `SMS provider configuration missing for tenant ${options.tenantId || 'root'}. Configure provider under Fleet Admin -> Settings -> SMS Integration.`;
    console.warn(`[SMS Service: Unconfigured] Destination: ${maskPhoneNumber(phoneCheck.normalizedPhone)} | Template: ${options.templateName} | Reason: ${msg}`);
    return {
      success: false,
      providerStatus: 'UNCONFIGURED',
      error: msg,
    };
  }

  const apiKey = tenantCreds.apiKey;
  const senderId = tenantCreds.senderId || 'GRCCAB';

  const resolvedTemplateName = APPROVED_2FACTOR_TEMPLATES[options.templateName] || options.templateName;
  const spec = DLT_TEMPLATE_VARIABLE_SPECS[resolvedTemplateName];
  if (spec && options.vars.length !== spec.expectedVars) {
    console.warn(`[SMS Service: Template Warning] Template "${resolvedTemplateName}" expects ${spec.expectedVars} variables, but ${options.vars.length} were supplied.`);
  }

  const vars = [...options.vars];
  // Pad with empty strings if fewer vars than expected by DLT specification
  if (spec && vars.length < spec.expectedVars) {
    while (vars.length < spec.expectedVars) {
      vars.push('');
    }
  }

  let url = `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${apiKey}&to=${encodeURIComponent(phoneCheck.normalizedPhone)}&from=${encodeURIComponent(senderId)}&templatename=${encodeURIComponent(resolvedTemplateName)}`;

  vars.forEach((v, index) => {
    url += `&var${index + 1}=${encodeURIComponent(v ?? '')}`;
  });

  try {
    const res = await axios.get(url, { timeout: 10000 });
    if (res.data?.Status === 'Success' && res.data?.Details) {
      return {
        success: true,
        providerStatus: 'SENT',
        providerMessageId: String(res.data.Details),
      };
    } else {
      const errMsg = res.data?.Details || res.data?.message || '2Factor API rejected request';
      return {
        success: false,
        providerStatus: 'FAILED',
        error: errMsg,
      };
    }
  } catch (err: any) {
    const errMsg = err.response?.data?.Details || err.response?.data?.message || err.message;
    return {
      success: false,
      providerStatus: 'FAILED',
      error: errMsg,
    };
  }
}

/**
 * Dispatches an OTP SMS via 2Factor's approved OTP route (/SMS/{phone}/{otp}/{template_name}).
 * Default template is OTP1 (2Factor system DLT pre-approved template).
 */
export async function send2FactorOTP(
  mobile: string,
  otp: string,
  templateName: string = 'OTP1',
  tenantId?: string
): Promise<{
  success: boolean;
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED' | 'MOCK';
  providerMessageId?: string;
  error?: string;
}> {
  const phoneCheck = normalizePhoneNumberForSms(mobile);
  if (!phoneCheck.valid) {
    return {
      success: false,
      providerStatus: 'FAILED',
      error: phoneCheck.error || 'Invalid destination phone number',
    };
  }

  const tenantCreds = await getTenantDecryptedCredentials(tenantId);

  // Respect mock mode
  if (process.env.NOTIFICATION_MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
    if (tenantId && tenantId !== ROOT_TENANT_ID && !tenantCreds.isConfigured) {
      return {
        success: false,
        providerStatus: 'UNCONFIGURED',
        error: `SMS OTP provider unconfigured for tenant ${tenantId}`,
      };
    }
    console.log(`[SMS Service OTP: MOCK MODE] Destination: ${maskPhoneNumber(phoneCheck.normalizedPhone)} | OTP: ${otp} | Template: ${templateName} | Status: MOCK`);
    return {
      success: true,
      providerStatus: 'SENT',
      providerMessageId: `mock_session_otp_${Date.now()}`,
    };
  }

  if (!tenantCreds.isConfigured || !tenantCreds.apiKey) {
    return {
      success: false,
      providerStatus: 'UNCONFIGURED',
      error: `2Factor API key not configured for tenant ${tenantId || 'root'}`,
    };
  }

  const apiKey = tenantCreds.apiKey;
  const resolvedTemplate = templateName || tenantCreds.otpRoute || 'OTP1';
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phoneCheck.normalizedPhone}/${otp}/${resolvedTemplate}`;

  try {
    const res = await axios.get(url, { timeout: 10000 });
    if (res.data?.Status === 'Success') {
      return {
        success: true,
        providerStatus: 'SENT',
        providerMessageId: String(res.data?.Details || `OTP-${Date.now()}`),
      };
    }
    return {
      success: false,
      providerStatus: 'FAILED',
      error: res.data?.Details || 'Failed to send OTP via 2Factor',
    };
  } catch (err: any) {
    return {
      success: false,
      providerStatus: 'FAILED',
      error: err.response?.data?.Details || err.message || 'Failed to send OTP',
    };
  }
}

/**
 * Sends a generic transactional SMS (Twilio or 2Factor fallback).
 * NEVER fabricates successful delivery if credentials are not configured.
 */
export async function sendDirectSms(
  to: string,
  message: string,
  templateName?: string,
  vars?: string[],
  tenantId?: string
): Promise<{
  success: boolean;
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED' | 'MOCK';
  providerMessageId?: string;
  error?: string;
}> {
  const phoneCheck = normalizePhoneNumberForSms(to);
  if (!phoneCheck.valid) {
    return {
      success: false,
      providerStatus: 'FAILED',
      error: phoneCheck.error || 'Invalid destination phone number',
    };
  }

  const tenantCreds = await getTenantDecryptedCredentials(tenantId);

  // Safety mock mode check: Prevent real SMS transmission in test/mock environment
  if (process.env.NOTIFICATION_MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
    if (tenantId && tenantId !== ROOT_TENANT_ID && !tenantCreds.isConfigured) {
      return {
        success: false,
        providerStatus: 'UNCONFIGURED',
        error: `SMS provider unconfigured for tenant ${tenantId}`,
      };
    }
    console.log(`[SMS Service: MOCK MODE] Destination: ${maskPhoneNumber(phoneCheck.normalizedPhone)} | Status: MOCK`);
    return {
      success: true,
      providerStatus: 'SENT',
      providerMessageId: `mock_direct_${Date.now()}`,
    };
  }

  const twoFactorKey = tenantCreds.apiKey;
  const twoFactorSender = tenantCreds.senderId || 'GRCCAB';

  if (twoFactorKey) {
    // If template and vars are provided, send via approved 2Factor template
    if (templateName && vars && vars.length > 0) {
      const resolved = APPROVED_2FACTOR_TEMPLATES[templateName];
      if (!resolved) {
        return {
          success: false,
          providerStatus: 'FAILED',
          error: `Template "${templateName}" is not registered under DLT header ${twoFactorSender}.`,
        };
      }
      return send2FactorTemplateSms({
        to: phoneCheck.normalizedPhone,
        templateName: resolved,
        vars,
        tenantId,
      });
    }

    if (templateName) {
      const resolvedTemplate = APPROVED_2FACTOR_TEMPLATES[templateName];
      if (resolvedTemplate) {
        return send2FactorTemplateSms({
          to: phoneCheck.normalizedPhone,
          templateName: resolvedTemplate,
          vars: vars || [message.substring(0, 30)],
          tenantId,
        });
      }
    }

    // 2Factor TRANS_SMS strictly requires an approved DLT template
    console.warn(`[SMS Service] Warning: 2Factor TRANS_SMS requires pre-approved DLT template under header ${twoFactorSender}.`);
    return {
      success: false,
      providerStatus: 'FAILED',
      error: `2Factor TRANS_SMS requires an approved DLT template name under header ${twoFactorSender}. Un-templated message text is rejected by Indian telecom regulations.`,
    };
  }


  // 2. Secondary: Twilio (if 2Factor is unconfigured and Twilio credentials provided)
  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioPhone = (process.env.TWILIO_PHONE_NUMBER || '').trim();

  if (twilioSid && twilioToken && twilioPhone) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', `+91${phoneCheck.normalizedPhone}`);
      params.append('From', twilioPhone);
      params.append('Body', message);

      const res = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        params.toString(),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );
      return {
        success: true,
        providerStatus: 'SENT',
        providerMessageId: res.data?.sid || `TW-${Date.now()}`,
      };
    } catch (err: any) {
      return {
        success: false,
        providerStatus: 'FAILED',
        error: err.response?.data?.message || err.message,
      };
    }
  }

  const msg = 'No SMS provider configured. Set TWO_FACTOR_API_KEY or TWILIO credentials in backend/.env';
  console.warn(`[SMS Service: Unconfigured] Target: ${maskPhoneNumber(phoneCheck.normalizedPhone)} | Reason: ${msg}`);
  return {
    success: false,
    providerStatus: 'UNCONFIGURED',
    error: msg,
  };
}

/**
 * Backward compatibility wrapper for sendTransactionalSms.
 */
export async function sendTransactionalSms(to: string, message: string) {
  return sendDirectSms(to, message);
}

export interface DriverAllocationSmsPayload {
  booking: any;
  driver: any;
  customerName: string;
  customerPhone: string;
  vehicleName: string;
  vehicleNumber: string;
}

export interface SmsDeliveryStatus {
  sent: boolean;
  skipped?: boolean;
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED' | 'MOCK';
  providerMessageId?: string;
  deliveryStatus?: 'DELIVERED' | 'PENDING' | 'FAILED';
  error?: string;
}

/**
 * Dispatches a fully audited SMS notification and records it directly to NotificationLog.
 */
export async function dispatchAuditedSms(options: {
  recipient: string;
  templateCode: string;
  templateName?: string;
  vars?: string[];
  message?: string;
  referenceEntity?: string;
  referenceId?: string;
  tenantId?: string;
  metadata?: any;
}): Promise<{
  success: boolean;
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED' | 'MOCK';
  providerMessageId?: string | null;
  error?: string;
}> {
  const { recipient, templateCode, templateName, vars, message, referenceEntity, referenceId, tenantId, metadata } = options;

  let sendResult: {
    success: boolean;
    providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED' | 'MOCK';
    providerMessageId?: string;
    error?: string;
  };

  if (templateName && vars && vars.length > 0) {
    sendResult = await send2FactorTemplateSms({
      to: recipient,
      templateName,
      vars,
      tenantId,
    });
  } else {
    sendResult = await sendDirectSms(recipient, message || `FleetFlow Alert: ${templateCode}`, templateName, vars, tenantId);
  }

  // Persist to notification_logs
  try {
    const isMock = process.env.NOTIFICATION_MOCK_MODE === 'true' || process.env.NODE_ENV === 'test';
    const statusToLog = isMock ? 'MOCK' : sendResult.providerStatus;

    await NotificationLog.create({
      channel: 'SMS',
      recipient,
      tenantId: tenantId || null,
      templateCode,
      referenceEntity: referenceEntity || null,
      referenceId: referenceId || null,
      providerStatus: statusToLog,
      providerMessageId: sendResult.providerMessageId || null,
      errorDetails: sendResult.error || null,
      retryCount: 0,
      maxRetries: 3,
      metadata: metadata || null,
    });
  } catch (dbErr) {
    console.error('[dispatchAuditedSms] Failed to write notification_logs:', dbErr);
  }

  return sendResult;
}


/**
 * Handles two-way SMS dispatch when a driver is assigned:
 * 1. Customer SMS (with driver details & tracking route)
 * 2. Driver SMS (with customer details & pickup/drop)
 * Executes with deduplication against NotificationLog to prevent repeat sends on retry.
 */
export async function sendDriverAllocationTwoWaySms(payload: DriverAllocationSmsPayload): Promise<{
  customerSms: SmsDeliveryStatus;
  driverSms: SmsDeliveryStatus;
}> {
  const { booking, driver, customerName, customerPhone, vehicleName, vehicleNumber } = payload;
  const bookingId = booking?.bookingId || booking?.id;
  const bookingCode = booking?.bookingCode || '';
  const driverName = driver?.driverName || 'Assigned Driver';
  const driverPhone = driver?.phno || driver?.phone || driver?.mobile || '';
  const pickupPoint = booking?.pickupPoint || booking?.pickupArea || '';
  const dropPoint = booking?.dropPoint || booking?.dropLocation || '';
  const rawDate = booking?.bookingDate || booking?.createdAt;
  const bookingDate = rawDate ? new Date(rawDate).toLocaleDateString('en-IN') : '';
  const bookingTime = booking?.bookingTime || '';
  const formattedBookingDate = bookingDate && bookingTime ? `${bookingDate} at ${bookingTime}` : bookingDate || bookingTime || '';

  // Build route short code
  let directionsCode = 'route';
  try {
    const origin = encodeURIComponent(pickupPoint || 'Pickup');
    const destination = encodeURIComponent(dropPoint || 'Drop');
    const longUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&dir_action=navigate`;
    directionsCode = await createShortCode(longUrl, 8);
  } catch {
    directionsCode = 'route';
  }

  const result: { customerSms: SmsDeliveryStatus; driverSms: SmsDeliveryStatus } = {
    customerSms: { sent: false, providerStatus: 'UNCONFIGURED' },
    driverSms: { sent: false, providerStatus: 'UNCONFIGURED' },
  };

  let fleetDisplayName = 'FleetFlow Fleet';
  try {
    const branding = await getFleetDocumentBranding(booking?.tenantId);
    if (branding?.fleetName) fleetDisplayName = branding.fleetName;
  } catch (e) {
    // Fallback to default fleet
  }

  // 1. CUSTOMER SMS
  try {
    const existingCust = await NotificationLog.findOne({
      where: {
        referenceId: String(bookingId),
        templateCode: 'DRIVER_ASSIGNED_TO_CUSTOMER',
        channel: 'SMS',
        providerStatus: { [Op.in]: ['SENT', 'MOCK'] },
      },
    });

    if (existingCust) {
      result.customerSms = {
        sent: true,
        skipped: true,
        providerStatus: (existingCust.providerStatus as any) || 'MOCK',
        providerMessageId: existingCust.providerMessageId || undefined,
        deliveryStatus: 'DELIVERED',
      };
    } else {
      const isGuest = !!booking?.behalfOfPhone;
      const templateName = isGuest ? 'BookingConfirmGuest' : 'Booking Confimation Message';
      const companySupportPhone = process.env.SUPPORT_PHONE || '9080280818';

      const vars = isGuest
        ? [
          booking.behalfOfName || customerName,
          driverName,
          driverPhone,
          vehicleName,
          vehicleNumber,
          formattedBookingDate,
          fleetDisplayName,
          companySupportPhone,
        ]
        : [
          customerName,
          bookingCode,
          `?l=${directionsCode}`,
          formattedBookingDate,
          driverName,
          driverPhone,
          vehicleName,
          vehicleNumber,
          fleetDisplayName,
          companySupportPhone,
        ];

      const resolvedTenantId = booking?.tenantId || driver?.tenantId || undefined;

      const custRes = await dispatchAuditedSms({
        recipient: customerPhone,
        templateCode: 'DRIVER_ASSIGNED_TO_CUSTOMER',
        templateName,
        vars,
        message: `${fleetDisplayName}: Your driver ${driverName} (${driverPhone}) has been assigned for booking ${bookingCode}. Vehicle: ${vehicleName} (${vehicleNumber}).`,
        referenceEntity: 'BOOKING',
        referenceId: String(bookingId),
        tenantId: resolvedTenantId,
      });

      result.customerSms = {
        sent: custRes.success,
        providerStatus: custRes.providerStatus,
        providerMessageId: custRes.providerMessageId || undefined,
        error: custRes.error,
      };
    }
  } catch (err: any) {
    result.customerSms = {
      sent: false,
      providerStatus: 'FAILED',
      error: err?.message,
    };
  }

  // 2. DRIVER SMS
  try {
    const existingDriver = await NotificationLog.findOne({
      where: {
        referenceId: String(bookingId),
        templateCode: 'BOOKING_ASSIGNED_TO_DRIVER',
        channel: 'SMS',
        providerStatus: { [Op.in]: ['SENT', 'MOCK'] },
      },
    });

    if (existingDriver) {
      result.driverSms = {
        sent: true,
        skipped: true,
        providerStatus: (existingDriver.providerStatus as any) || 'MOCK',
        providerMessageId: existingDriver.providerMessageId || undefined,
        deliveryStatus: 'DELIVERED',
      };
    } else {
      const vars = [
        driverName,
        booking?.behalfOfName || customerName,
        booking?.behalfOfPhone || customerPhone,
        `?l=${directionsCode}`,
      ];

      const resolvedTenantId = booking?.tenantId || driver?.tenantId || undefined;

      const driverRes = await dispatchAuditedSms({
        recipient: driverPhone,
        templateCode: 'BOOKING_ASSIGNED_TO_DRIVER',
        templateName: 'Driver Assigning',
        vars,
        message: `${fleetDisplayName}: Trip assigned to you. Passenger: ${booking?.behalfOfName || customerName} (${booking?.behalfOfPhone || customerPhone}). Pickup: ${pickupPoint}. Drop: ${dropPoint}.`,
        referenceEntity: 'BOOKING',
        referenceId: String(bookingId),
        tenantId: resolvedTenantId,
      });


      result.driverSms = {
        sent: driverRes.success,
        providerStatus: driverRes.providerStatus,
        providerMessageId: driverRes.providerMessageId || undefined,
        error: driverRes.error,
      };
    }
  } catch (err: any) {
    result.driverSms = {
      sent: false,
      providerStatus: 'FAILED',
      error: err?.message,
    };
  }

  return result;
}
