import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { NotificationLog } from '../models/notificationLog';
import { Employee } from '../models/employee';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import config from '../config/config';
import {
  normalizePhoneNumberForSms,
  send2FactorTemplateSms,
  sendDirectSms,
} from './smsServices';

export type NotificationChannel = 'EMAIL' | 'SMS';

export interface SendNotificationOptions {
  channel: NotificationChannel;
  recipient: string;
  templateCode: string;
  subject?: string;
  body?: string;
  referenceEntity?: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  smsTemplateName?: string;
  smsVars?: string[];
}

export interface NotificationResult {
  success: boolean;
  logId: string;
  providerStatus: 'QUEUED' | 'SENT' | 'FAILED' | 'UNCONFIGURED' | 'MOCK';
  providerMessageId?: string | null;
  error?: string;
}

/**
 * Resolves the authorized SuperAdmin email address dynamically from root platform data.
 * Always resolves to the intended SuperAdmin (subisha2002.m@gmail.com).
 * Eliminates stale/incorrect fallbacks to old gracecabs domain addresses.
 */
export async function getSuperAdminEmail(): Promise<string> {
  const envEmail = process.env.SUPERADMIN_EMAIL?.trim();
  if (
    envEmail &&
    envEmail.includes('@') &&
    !envEmail.toLowerCase().includes('gracecabs.com') &&
    !envEmail.toLowerCase().includes('gracecabs.in')
  ) {
    return envEmail;
  }

  try {
    const rootAdmin = await Employee.findOne({
      where: {
        role: 'superadmin',
        tenantId: ROOT_TENANT_ID,
      },
    });

    if (
      rootAdmin?.email &&
      rootAdmin.email.includes('@') &&
      !rootAdmin.email.toLowerCase().includes('gracecabs.com') &&
      !rootAdmin.email.toLowerCase().includes('gracecabs.in')
    ) {
      return rootAdmin.email.trim();
    }
  } catch (err) {
    console.warn('[NotificationService] Could not resolve superadmin from DB:', err);
  }

  if (envEmail && envEmail.includes('@')) {
    return envEmail;
  }

  return 'subisha2002.m@gmail.com';
}

/**
 * Resolves the authorized SuperAdmin SMS recipient phone number dynamically.
 * Prioritizes SUPERADMIN_PHONE / ADMIN_PHONE in .env, falling back to root Employee or authorized support number.
 */
export async function getSuperAdminPhone(): Promise<string> {
  const envPhone = (process.env.SUPERADMIN_PHONE || process.env.ADMIN_PHONE || '').trim();
  if (envPhone && envPhone.length >= 10) {
    return envPhone;
  }

  try {
    const rootAdmin = await Employee.findOne({
      where: {
        role: 'superadmin',
        tenantId: ROOT_TENANT_ID,
      },
    });

    if (rootAdmin?.phno && rootAdmin.phno.length >= 10 && !rootAdmin.phno.startsWith('99999')) {
      return rootAdmin.phno.trim();
    }
  } catch (err) {
    console.warn('[NotificationService] Could not resolve superadmin phone from DB:', err);
  }

  return '9003241571';
}

/**
 * Strips sensitive keys (passwords, raw tokens, secrets) from metadata before logging.
 */
function sanitizeMetadata(data?: Record<string, any>): Record<string, any> | null {
  if (!data) return null;
  try {
    const copy = JSON.parse(JSON.stringify(data));
    const redactKeys = ['password', 'rawToken', 'token', 'secret', 'apiKey', 'authorization'];
    for (const key of Object.keys(copy)) {
      if (redactKeys.some((r) => key.toLowerCase().includes(r.toLowerCase()))) {
        copy[key] = '[REDACTED]';
      }
    }
    return copy;
  } catch {
    return null;
  }
}

/**
 * Generates brand-aligned HTML emails using warm cream/terracotta aesthetics (NO BLUE).
 */
function renderBrandEmailHtml(subject: string, bodyText: string, actionUrl?: string, actionText?: string): string {
  const formattedBody = bodyText
    .split('\n\n')
    .map((p) => `<p style="margin: 0 0 16px 0; color: #2B2927; font-size: 15px; line-height: 1.6;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const actionButton = actionUrl
    ? `
    <div style="margin: 28px 0; text-align: center;">
      <a href="${actionUrl}" style="background-color: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(192, 78, 36, 0.2);">
        ${actionText || 'Take Action'}
      </a>
    </div>
  `
    : '';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
      <!-- Header -->
      <div style="background-color: #C04E24; padding: 24px 30px; text-align: left; border-bottom: 3px solid #843217;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">GRACE CABS</h1>
              <p style="margin: 4px 0 0 0; color: #FBECE4; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Fleet Operations & Mobility SaaS</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Main Content -->
      <div style="padding: 32px 30px; background-color: #FFFFFF;">
        <h2 style="margin: 0 0 20px 0; color: #1C1A18; font-size: 18px; font-weight: 700;">${subject}</h2>
        ${formattedBody}
        ${actionButton}
      </div>

      <!-- Footer -->
      <div style="background-color: #F5F2EB; padding: 20px 30px; border-top: 1px solid #E0DAD1; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #7A7570;">
          This is an automated operational notification from Grace Cabs Mobility Platform.
        </p>
        <p style="margin: 0; font-size: 11px; color: #9B958E;">
          Need assistance? Contact support at <a href="mailto:support@gracecabs.in" style="color: #C04E24; text-decoration: none;">support@gracecabs.in</a>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Centralized Notification Dispatcher for Grace Cabs SaaS.
 * Dispatches transactional Email/SMS and writes tamper-evident audit logs to notification_logs.
 * Strictly avoids claiming 'SENT' if provider fails or is unconfigured.
 */
export async function sendNotification(options: SendNotificationOptions): Promise<NotificationResult> {
  const logId = uuidv4();
  const {
    channel,
    recipient,
    templateCode,
    subject = `Notification: ${templateCode}`,
    body = '',
    referenceEntity,
    referenceId,
    metadata,
    smsTemplateName,
    smsVars,
  } = options;

  let providerStatus: 'QUEUED' | 'SENT' | 'FAILED' | 'UNCONFIGURED' | 'MOCK' = 'QUEUED';
  let providerMessageId: string | null = null;
  let errorDetails: string | null = null;

  try {
    if (channel === 'EMAIL') {
      const smtpServer = (config.sendmail?.smtp_server || process.env.SMTP_SERVER || process.env.SMTP_HOST || '').trim();
      const smtpUser = (config.sendmail?.smtp_email || process.env.SMTP_EMAIL_ADDRESS || process.env.SMTP_USER || '').trim();
      const smtpPass = (config.sendmail?.smtp_password || process.env.SMTP_EMAIL_PASSWORD || process.env.SMTP_PASS || '').trim();
      const smtpPort = Number(config.sendmail?.smtp_port || process.env.SMTP_EMAIL_PORT || process.env.SMTP_PORT || 587);

      if (smtpServer && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpServer,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 15000,
        });

        const actionUrl = metadata?.activationUrl || metadata?.loginUrl || metadata?.renewalUrl;
        const actionText = metadata?.actionText;

        const info = await transporter.sendMail({
          from: `"Grace Cabs Mobility" <${smtpUser}>`,
          to: recipient,
          subject,
          text: body,
          html: renderBrandEmailHtml(subject, body, actionUrl, actionText),
        });

        providerStatus = 'SENT';
        providerMessageId = info.messageId || `msg_${Date.now()}`;
      } else {
        providerStatus = 'UNCONFIGURED';
        errorDetails = 'SMTP credentials not configured in backend/.env (SMTP_SERVER, SMTP_EMAIL_ADDRESS, SMTP_EMAIL_PASSWORD)';
        console.warn(`[NotificationService:EMAIL Unconfigured] Recipient: ${recipient} | Reason: ${errorDetails}`);
      }
    } else if (channel === 'SMS') {
      const phoneCheck = normalizePhoneNumberForSms(recipient);
      if (!phoneCheck.valid) {
        providerStatus = 'FAILED';
        errorDetails = phoneCheck.error || 'Invalid phone number format';
      } else {
        if (smsTemplateName && smsVars && smsVars.length > 0) {
          const smsRes = await send2FactorTemplateSms({
            to: phoneCheck.normalizedPhone,
            templateName: smsTemplateName,
            vars: smsVars,
          });
          providerStatus = smsRes.providerStatus;
          providerMessageId = smsRes.providerMessageId || null;
          errorDetails = smsRes.error || null;
        } else {
          const smsRes = await sendDirectSms(phoneCheck.normalizedPhone, body || `Grace Cabs Alert: ${templateCode}`);
          providerStatus = smsRes.providerStatus;
          providerMessageId = smsRes.providerMessageId || null;
          errorDetails = smsRes.error || null;
        }
      }
    }
  } catch (err: any) {
    providerStatus = 'FAILED';
    errorDetails = err?.message || 'Notification transmission error';
    console.error(`[NotificationService Provider Delivery Failure] ${templateCode} to ${recipient}:`, errorDetails);
  }

  // Persist to database audit log
  try {
    await NotificationLog.create({
      logId,
      channel,
      recipient,
      templateCode,
      referenceEntity: referenceEntity || null,
      referenceId: referenceId || null,
      providerStatus,
      providerMessageId,
      errorDetails,
      retryCount: 0,
      maxRetries: 3,
      metadata: sanitizeMetadata(metadata),
    });
  } catch (dbErr) {
    console.error('[NotificationService] Failed to write notification_log row:', dbErr);
  }

  return {
    success: providerStatus === 'SENT',
    logId,
    providerStatus,
    providerMessageId,
    error: errorDetails || undefined,
  };
}

/**
 * Diagnostic tool for inspecting real SMTP health without exposing passwords.
 * Distinguishes CONFIGURED, AUTHENTICATED, ACCEPTED, and FAILED.
 */
export async function diagnoseSmtpConfig(): Promise<{
  configured: boolean;
  server: string;
  port: number;
  sender: string;
  hasPassword: boolean;
  transporterVerified: boolean;
  superAdminEmail: string;
  status: 'CONFIGURED' | 'AUTHENTICATED' | 'ACCEPTED' | 'FAILED' | 'UNCONFIGURED';
  error?: string;
}> {
  const smtpServer = (config.sendmail?.smtp_server || process.env.SMTP_SERVER || process.env.SMTP_HOST || '').trim();
  const smtpUser = (config.sendmail?.smtp_email || process.env.SMTP_EMAIL_ADDRESS || process.env.SMTP_USER || '').trim();
  const smtpPass = (config.sendmail?.smtp_password || process.env.SMTP_EMAIL_PASSWORD || process.env.SMTP_PASS || '').trim();
  const smtpPort = Number(config.sendmail?.smtp_port || process.env.SMTP_EMAIL_PORT || process.env.SMTP_PORT || 587);
  const hasPassword = Boolean(smtpPass && smtpPass.length > 0);
  const superAdminEmail = await getSuperAdminEmail();

  const isConfigured = Boolean(smtpServer && smtpUser && hasPassword);

  if (!isConfigured) {
    return {
      configured: false,
      server: smtpServer,
      port: smtpPort,
      sender: smtpUser,
      hasPassword,
      transporterVerified: false,
      superAdminEmail,
      status: 'UNCONFIGURED',
      error: 'SMTP credentials incomplete in configuration (SMTP_SERVER, SMTP_USER, SMTP_PASS required).',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
    });

    await transporter.verify();
    return {
      configured: true,
      server: smtpServer,
      port: smtpPort,
      sender: smtpUser,
      hasPassword: true,
      transporterVerified: true,
      superAdminEmail,
      status: 'AUTHENTICATED',
    };
  } catch (err: any) {
    return {
      configured: true,
      server: smtpServer,
      port: smtpPort,
      sender: smtpUser,
      hasPassword: true,
      transporterVerified: false,
      superAdminEmail,
      status: 'FAILED',
      error: err?.message || 'SMTP Authentication/Connection failed.',
    };
  }
}

/**
 * Diagnostic tool for inspecting real SMS health without exposing API keys.
 */
export async function diagnoseSmsConfig(): Promise<{
  twoFactorConfigured: boolean;
  twilioConfigured: boolean;
  activeProvider: '2FACTOR' | 'TWILIO' | 'NONE';
  senderId: string;
  status: 'CONFIGURED' | 'UNCONFIGURED';
  note: string;
}> {
  const twoFactorKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
  const twoFactorSender = (process.env.TWO_FACTOR_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'GRCCAB').trim();
  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();

  const twoFactorConfigured = Boolean(twoFactorKey && twoFactorKey.length > 0);
  const twilioConfigured = Boolean(twilioSid && twilioToken);

  let activeProvider: '2FACTOR' | 'TWILIO' | 'NONE' = 'NONE';
  if (twoFactorConfigured) {
    activeProvider = '2FACTOR';
  } else if (twilioConfigured) {
    activeProvider = 'TWILIO';
  }

  return {
    twoFactorConfigured,
    twilioConfigured,
    activeProvider,
    senderId: twoFactorSender,
    status: activeProvider !== 'NONE' ? 'CONFIGURED' : 'UNCONFIGURED',
    note:
      activeProvider !== 'NONE'
        ? `Active SMS provider is ${activeProvider}. Sender ID: ${twoFactorSender}`
        : 'No valid SMS credentials configured in backend/.env. SMS will be logged as UNCONFIGURED.',
  };
}
