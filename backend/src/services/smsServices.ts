import axios from 'axios';
import { NotificationLog } from '../models/notificationLog';
import { createShortCode } from '../utils/shortLinkStore';
import { getFleetDocumentBranding } from './fleetBrandingService';

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
 * Dispatches a registered 2Factor DLT Template SMS.
 * Clearly distinguishes CONFIGURED, ACCEPTED, and FAILED.
 * Does NOT claim delivery if provider is unconfigured or rejects request.
 */
export async function send2FactorTemplateSms(options: {
  to: string;
  templateName: string;
  vars: string[];
}): Promise<{
  success: boolean;
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED';
  providerMessageId?: string;
  error?: string;
}> {
  const apiKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
  const senderId = (process.env.TWO_FACTOR_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'GRCCAB').trim();

  // Strict isolation guard: Never dispatch to obsolete customer phone 90802...
  if (options.to && (options.to.includes('90802') || options.to.replace(/\D/g, '').includes('9080280818'))) {
    const msg = 'Blocked: Transmission to obsolete customer phone number (90802...) is prohibited.';
    console.warn(`[SMS Service: ISOLATION GUARD] ${msg}`);
    return {
      success: false,
      providerStatus: 'FAILED',
      error: msg,
    };
  }

  const phoneCheck = normalizePhoneNumberForSms(options.to);
  if (!phoneCheck.valid) {
    return {
      success: false,
      providerStatus: 'FAILED',
      error: phoneCheck.error || 'Invalid destination phone number',
    };
  }

  if (!apiKey) {
    const msg = 'SMS provider configuration missing: TWO_FACTOR_API_KEY / TWOFACTOR_API_KEY not configured in backend/.env';
    console.warn(`[SMS Service: Unconfigured] Destination: ${maskPhoneNumber(phoneCheck.normalizedPhone)} | Template: ${options.templateName} | Reason: ${msg}`);
    return {
      success: false,
      providerStatus: 'UNCONFIGURED',
      error: msg,
    };
  }

  const { templateName, vars } = options;
  let url = `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${apiKey}&to=${encodeURIComponent(phoneCheck.normalizedPhone)}&from=${encodeURIComponent(senderId)}&templatename=${encodeURIComponent(templateName)}`;

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
 * Sends a generic transactional SMS (Twilio or 2Factor fallback).
 * NEVER fabricates successful delivery if credentials are not configured.
 */
export async function sendDirectSms(
  to: string,
  message: string,
  templateName?: string
): Promise<{
  success: boolean;
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED';
  providerMessageId?: string;
  error?: string;
}> {
  // Strict isolation guard: Never dispatch to obsolete customer phone 90802...
  if (to && (to.includes('90802') || to.replace(/\D/g, '').includes('9080280818'))) {
    const msg = 'Blocked: Transmission to obsolete customer phone number (90802...) is prohibited.';
    console.warn(`[SMS Service: ISOLATION GUARD] ${msg}`);
    return {
      success: false,
      providerStatus: 'FAILED',
      error: msg,
    };
  }

  const phoneCheck = normalizePhoneNumberForSms(to);
  if (!phoneCheck.valid) {
    return {
      success: false,
      providerStatus: 'FAILED',
      error: phoneCheck.error || 'Invalid destination phone number',
    };
  }

  // 1. Primary: 2Factor.in (Indian DLT Transactional Gateway)
  const twoFactorKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
  const twoFactorSender = (process.env.TWO_FACTOR_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'GRCCAB').trim();

  if (twoFactorKey) {
    try {
      const url = `https://2factor.in/API/V1/${twoFactorKey}/ADDON_SERVICES/SEND/TSMS`;
      const payload: any = {
        From: twoFactorSender,
        To: phoneCheck.normalizedPhone,
        Msg: message,
        TemplateName: templateName || process.env.TWOFACTOR_TEMPLATE_NAME || 'Booking Creation',
        var1: message.substring(0, 30),
      };
      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      if (res.data?.Status === 'Success') {
        return {
          success: true,
          providerStatus: 'SENT',
          providerMessageId: String(res.data?.Details || `2F-${Date.now()}`),
        };
      }
      return {
        success: false,
        providerStatus: 'FAILED',
        error: res.data?.Details || '2Factor TSMS returned non-success',
      };
    } catch (err: any) {
      return {
        success: false,
        providerStatus: 'FAILED',
        error: err.response?.data?.Details || err.message,
      };
    }
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
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED';
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
  metadata?: any;
}): Promise<{
  success: boolean;
  providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED';
  providerMessageId?: string | null;
  error?: string;
}> {
  const { recipient, templateCode, templateName, vars, message, referenceEntity, referenceId, metadata } = options;

  let sendResult: {
    success: boolean;
    providerStatus: 'SENT' | 'FAILED' | 'UNCONFIGURED';
    providerMessageId?: string;
    error?: string;
  };

  if (templateName && vars && vars.length > 0) {
    sendResult = await send2FactorTemplateSms({
      to: recipient,
      templateName,
      vars,
    });
  } else {
    sendResult = await sendDirectSms(recipient, message || `FleetFlow Alert: ${templateCode}`);
  }

  // Persist to notification_logs
  try {
    await NotificationLog.create({
      channel: 'SMS',
      recipient,
      templateCode,
      referenceEntity: referenceEntity || null,
      referenceId: referenceId || null,
      providerStatus: sendResult.providerStatus,
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
        providerStatus: 'SENT',
      },
    });

    if (existingCust) {
      result.customerSms = {
        sent: true,
        skipped: true,
        providerStatus: 'SENT',
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

      const custRes = await dispatchAuditedSms({
        recipient: customerPhone,
        templateCode: 'DRIVER_ASSIGNED_TO_CUSTOMER',
        templateName,
        vars,
        message: `${fleetDisplayName}: Your driver ${driverName} (${driverPhone}) has been assigned for booking ${bookingCode}. Vehicle: ${vehicleName} (${vehicleNumber}).`,
        referenceEntity: 'BOOKING',
        referenceId: String(bookingId),
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
        providerStatus: 'SENT',
      },
    });

    if (existingDriver) {
      result.driverSms = {
        sent: true,
        skipped: true,
        providerStatus: 'SENT',
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

      const driverRes = await dispatchAuditedSms({
        recipient: driverPhone,
        templateCode: 'BOOKING_ASSIGNED_TO_DRIVER',
        templateName: 'Driver Assigning',
        vars,
        message: `${fleetDisplayName}: Trip assigned to you. Passenger: ${booking?.behalfOfName || customerName} (${booking?.behalfOfPhone || customerPhone}). Pickup: ${pickupPoint}. Drop: ${dropPoint}.`,
        referenceEntity: 'BOOKING',
        referenceId: String(bookingId),
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
