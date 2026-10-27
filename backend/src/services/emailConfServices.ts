import { Request, Response } from 'express';
import { Configuration, EmailConfiguration, NotificationLog } from '../models';
import { USERS } from "../utils/costants";
import nodemailer from "nodemailer";
import config from "../config/config";
import SMTPTransport from "nodemailer/lib/smtp-transport";
const { ROLES } = USERS;
import fs from 'fs';
import { SentMessageInfo } from "nodemailer";
import { Op } from 'sequelize';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { getFleetDocumentBranding } from './fleetBrandingService';
import { isTestOrSyntheticRecipient } from './notificationService';

// ---------------- Utility ----------------
function replacePlaceholders(template: string, data: Record<string, string>) {
  if (!template) return '';
  return Object.keys(data).reduce((acc, key) => {
    const val = data[key] ?? '';
    const legacyRegex = new RegExp(`###${key}###`, 'g');
    const mustacheRegex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    return acc.replace(legacyRegex, val).replace(mustacheRegex, val);
  }, template);
}

// export const sendEmailFromTemplate = async (
//   idOrCode: string | number,
//   data: Record<string, string>,
//   attachments: Array<{ path: string; filename: string }> = []
// ) => {
//   // Load email template
//   let emailConf;
//   if (typeof idOrCode === "number") {
//     emailConf = await EmailConfiguration.findByPk(idOrCode);
//   } else {
//     emailConf = await EmailConfiguration.findOne({ where: { emailCode: idOrCode } });
//   }
//   if (!emailConf) throw new Error("Email template not found");

//   // Build final message/subject
//   const finalMessage = replacePlaceholders(emailConf.message, data);
//   const finalSubject = replacePlaceholders(emailConf.subject, data);

//   // Load SMTP configuration and sanitize
//   const conf = await Configuration.findOne();
//   const portNum = Number(conf?.smtpEmailPort) || 587;
//   const smtpHost = (conf?.smtpServer || "").trim();
//   const smtpUser = (conf?.smtpEmailAddress || "").trim();
//   const smtpPass = (conf?.smtpEmailPassword || "").trim();
//   console.log(smtpUser," passss ",smtpPass)
//   if (!smtpHost || !smtpUser || !smtpPass) {
//     throw new Error("SMTP configuration incomplete");
//   }

//   // Prepare recipients array
//   const recipients: string[] = [];
//   if (data?.UserEmail) recipients.push(String(data.UserEmail).trim());
//   if (data?.EmployeeEmail) recipients.push(String(data.EmployeeEmail).trim());
//   if (data?.to) {
//     recipients.push(
//       ...String(data.to)
//         .split(",")
//         .map(s => s.trim())
//         .filter(Boolean)
//     );
//   }
//   if (recipients.length === 0) {
//     throw new Error("No recipients specified for email");
//   }

//   const normalizeToCRLF = (s: any) =>
//     String(s == null ? "" : s)
//       .replace(/\r\n/g, "\n") // normalize CRLF -> LF
//       .replace(/\r/g, "\n") // convert lone CR -> LF
//       .replace(/\n/g, "\r\n"); // convert LF -> CRLF

//   // Friendly From header and envelope
//   const headerFrom = `${emailConf.fromName || "No-Reply"} <${emailConf.fromAddress || smtpUser}>`;
//   const safeHeaderFrom = normalizeToCRLF(headerFrom);
//   const safeSubject = normalizeToCRLF(finalSubject);
//   const safeMessage = normalizeToCRLF(finalMessage);

//   // parse BCC from emailConf.emailBcc (robustly)
//   const bccList: string[] = emailConf.emailBcc
//     ? String(emailConf.emailBcc)
//         .split(",")
//         .map(s => s.trim())
//         .filter(Boolean)
//     : [];

//   // dedupe and filter recipients
//   const allRecipients = Array.from(
//     new Set([...recipients.map(r => r.trim()).filter(Boolean)])
//   );

//   const mailOptions: any = {
//     from: safeHeaderFrom,
//     to: allRecipients.join(", "),
//     // set bcc as an array (clearer)
//     bcc: bccList.length > 0 ? bccList : undefined,
//     subject: safeSubject,
//     html: safeMessage,
//     attachments: attachments.length > 0 ? attachments : undefined,
//     // include bcc in envelope too so SMTP will actually deliver to them
//     envelope: {
//       from: smtpUser,
//       to: [...allRecipients, ...bccList]
//     },
//     replyTo: emailConf.fromAddress || smtpUser
//   };

//   // Create transporter (no debug/logger)
//   const transporter = nodemailer.createTransport({
//     host: smtpHost,
//     port: portNum,
//     secure: portNum === 465,
//     auth: { user: smtpUser, pass: smtpPass },
//     tls: { rejectUnauthorized: false },
//     newline: "windows"
//   } as SMTPTransport.Options);

//   // Fire-and-forget: verify then start the send and return immediately.
//   transporter
//     .verify()
//     .then(() => {
//       transporter
//         .sendMail(mailOptions)
//         .then((info) => {
//           // log accepted/rejected/envelope for diagnostics
//           try {
//             console.log("EMAIL SEND INFO:", {
//               accepted: info.accepted,
//               rejected: info.rejected,
//               envelope: info.envelope,
//               messageId: info.messageId
//             });
//           } catch (e) {
//             // ignore logging errors
//           }

//           // cleanup attachments AFTER successful send
//           if (attachments.length > 0) {
//             attachments.forEach((attachment) => {
//               try {
//                 if (fs.existsSync(attachment.path)) {
//                   fs.unlinkSync(attachment.path);
//                 }
//               } catch (err) {
//                 // keep quiet in background; optionally log to a monitoring system
//               }
//             });
//           }
//           // optionally you can persist info to DB or monitoring here
//         })
//         .catch((err) => {
//           // log sendMail error
//           console.error("EMAIL SEND ERROR (sendMail):", err);
//         });
//     })
//     .catch((err) => {
//       // transporter.verify failed; log and still attempt to send (to preserve current behavior)
//       console.error("SMTP VERIFY FAILED:", err);
//       transporter
//         .sendMail(mailOptions)
//         .then((info) => {
//           try {
//             console.log("EMAIL SEND INFO (after verify fail):", {
//               accepted: info.accepted,
//               rejected: info.rejected,
//               envelope: info.envelope,
//               messageId: info.messageId
//             });
//           } catch (e) {}
//           if (attachments.length > 0) {
//             attachments.forEach((attachment) => {
//               try {
//                 if (fs.existsSync(attachment.path)) {
//                   fs.unlinkSync(attachment.path);
//                 }
//               } catch (err) {}
//             });
//           }
//         })
//         .catch((err2) => {
//           console.error("EMAIL SEND ERROR (sendMail after verify):", err2);
//         });
//     });

//   // return immediately so caller (createBooking) finishes fast
//   return { queued: true };
// };




// ---------------- Create / Send ----------------
export const sendEmailFromTemplate = async (
  idOrCode: string | number,
  data: Record<string, string>,
  attachments: Array<{ path: string; filename: string; }> = []
) => {
  const ctx = getTenantContext();
  const tenantId = (data as any)?.tenantId || ctx?.tenantId || ROOT_TENANT_ID;

  // Load email template: tenant-specific first, then platform root fallback
  let emailConf: EmailConfiguration | null = null;
  if (typeof idOrCode === "number") {
    emailConf = await EmailConfiguration.findByPk(idOrCode);
  } else {
    // 1. Try tenant-specific template
    if (tenantId && tenantId !== ROOT_TENANT_ID) {
      emailConf = await EmailConfiguration.findOne({
        where: { emailCode: idOrCode, tenantId }
      });
    }
    // 2. Fallback to platform default template
    if (!emailConf) {
      emailConf = await EmailConfiguration.findOne({
        where: {
          emailCode: idOrCode,
          [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }]
        }
      });
    }
    // 3. Fallback by PK if idOrCode is UUID
    if (!emailConf && typeof idOrCode === 'string' && idOrCode.length === 36) {
      emailConf = await EmailConfiguration.findByPk(idOrCode);
    }
  }

  if (!emailConf) throw new Error(`Email template not found: ${idOrCode}`);

  // Fetch tenant branding to inject additional brand placeholders
  let brandingData: Record<string, string> = {};
  try {
    const branding = await getFleetDocumentBranding(tenantId);
    brandingData = {
      FleetName: branding.fleetName || 'FleetFlow Fleet',
      CompanyName: branding.fleetName || 'FleetFlow Fleet',
      SupportPhone: branding.contactPhone || '',
      SupportEmail: branding.contactEmail || '',
      PortalTitle: branding.portalTitle || 'Fleet Management Portal',
      Address: branding.registeredAddress || '',
      GstNumber: branding.gstNumber || '',
      FleetLoginUrl: branding.fleetLoginUrl || '',
      LoginUrl: branding.fleetLoginUrl || '',
    };
  } catch (bErr) {
    // Non-fatal branding fetch
  }

  const mergedData = { ...brandingData, ...data };

  // Build final message/subject
  const finalMessage = replacePlaceholders(emailConf.message, mergedData);
  const finalSubject = replacePlaceholders(emailConf.subject, mergedData);

  // Load SMTP configuration from environment with DB Configuration fallback
  const conf = await Configuration.findOne();
  const smtpHost = (process.env.SMTP_SERVER || process.env.SMTP_HOST || conf?.smtpServer || "").trim();
  const portNum = Number(process.env.SMTP_EMAIL_PORT || process.env.SMTP_PORT || conf?.smtpEmailPort) || 587;
  const smtpUser = (process.env.SMTP_EMAIL_ADDRESS || process.env.SMTP_USER || conf?.smtpEmailAddress || "").trim();
  const smtpPass = (process.env.SMTP_EMAIL_PASSWORD || process.env.SMTP_PASS || conf?.smtpEmailPassword || "").trim();
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP configuration incomplete");
  }

  // Prepare recipients
  const recipients: string[] = [];
  if (data?.UserEmail) recipients.push(String(data.UserEmail).trim());
  if (data?.EmployeeEmail) recipients.push(String(data.EmployeeEmail).trim());
  if (data?.to) {
    recipients.push(
      ...String(data.to).split(",").map(s => s.trim()).filter(Boolean)
    );
  }
  if (recipients.length === 0) {
    throw new Error("No recipients specified for email");
  }

  const normalizeToCRLF = (s: any) =>
    String(s ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n/g, "\r\n");

  // Headers with tenant-specific fromName if available
  const rawFromName = emailConf.fromName || '';
  const isGraceCabsDefault = rawFromName.toLowerCase().includes('gracecabs') || rawFromName.toLowerCase().includes('grace cabs');
  const headerFromName = (tenantId !== ROOT_TENANT_ID || isGraceCabsDefault)
    ? (brandingData.FleetName || 'FleetFlow')
    : (rawFromName || 'FleetFlow');
  const headerFrom = `${headerFromName} <${smtpUser}>`;

  // Strictly filter out any obsolete Grace Cabs customer contacts
  const isObsoleteContact = (email: string) => {
    const lower = (email || '').toLowerCase().trim();
    return (
      lower.includes('subisha2002.m') ||
      lower.includes('traveldesk@gracecabs.com') ||
      lower.includes('robertjayakumar@gmail.com') ||
      lower.endsWith('@gracecabs.com')
    );
  };

  const bccList: string[] = (emailConf.emailBcc
    ? String(emailConf.emailBcc).split(",").map(s => s.trim()).filter(Boolean)
    : []).filter((e) => !isObsoleteContact(e));

  let allRecipients = Array.from(new Set(recipients)).filter((e) => !isObsoleteContact(e));

  if (allRecipients.length === 0) {
    throw new Error("No authorized recipients specified for email (recipient was invalid or filtered out). Fallback rerouting to platform admin is strictly prohibited.");
  }

  const mailOptions = {
    from: normalizeToCRLF(headerFrom),
    to: allRecipients.join(", "),
    bcc: bccList.length ? bccList : undefined,
    subject: normalizeToCRLF(finalSubject),
    html: normalizeToCRLF(finalMessage),
    attachments: attachments.length ? attachments : undefined,
    replyTo: smtpUser
  };

  // Check if mock mode is requested or all recipients are synthetic/test
  const isMockMode =
    process.env.NOTIFICATION_MOCK_MODE === 'true' ||
    process.env.NODE_ENV === 'test' ||
    allRecipients.every(r => isTestOrSyntheticRecipient(r));

  if (isMockMode) {
    const mockMessageId = `mock_email_${Date.now()}`;
    console.log(`[EmailConfServices: MOCK MODE] Template: ${emailConf.emailCode} | Recipients: ${allRecipients.join(', ')} | Status: MOCK (Skipped real SMTP)`);

    try {
      await NotificationLog.create({
        channel: 'EMAIL',
        recipient: allRecipients.join(', '),
        tenantId: tenantId || null,
        templateCode: String(emailConf.emailCode || idOrCode),
        referenceEntity: 'EMAIL_CONF',
        referenceId: String(emailConf.emailConfigId || ''),
        providerStatus: 'MOCK',
        providerMessageId: mockMessageId,
        errorDetails: null,
        retryCount: 0,
        maxRetries: 3,
        metadata: { subject: finalSubject, accepted: allRecipients, tenantId },
      });
    } catch (logErr) {
      console.warn("Could not write NotificationLog for emailConf mock:", logErr);
    }

    if (attachments.length > 0) {
      attachments.forEach(a => {
        if (fs.existsSync(a.path)) fs.unlinkSync(a.path);
      });
    }

    return {
      accepted: allRecipients,
      rejected: [],
      messageId: mockMessageId,
      response: '250 Mock email accepted in test mode',
    };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: portNum,
    secure: portNum === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // SEND MAIL
  try {
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);

    console.log("EMAIL SENT SUCCESSFULLY:", {
      accepted: info.accepted,
      messageId: info.messageId,
      template: emailConf.emailCode,
      tenantId
    });

    try {
      await NotificationLog.create({
        channel: 'EMAIL',
        recipient: allRecipients.join(', '),
        templateCode: String(emailConf.emailCode || idOrCode),
        referenceEntity: 'EMAIL_CONF',
        referenceId: String(emailConf.emailConfigId || ''),
        providerStatus: 'SENT',
        providerMessageId: info.messageId || null,
        errorDetails: null,
        retryCount: 0,
        maxRetries: 3,
        metadata: { subject: finalSubject, accepted: info.accepted, tenantId },
      });
    } catch (logErr) {
      console.warn("Could not write NotificationLog for emailConf:", logErr);
    }

    // cleanup attachments
    if (attachments.length > 0) {
      attachments.forEach(a => {
        if (fs.existsSync(a.path)) fs.unlinkSync(a.path);
      });
    }

    return { sent: true };

  } catch (err: any) {
    console.error("EMAIL SEND FAILED:", err);
    try {
      await NotificationLog.create({
        channel: 'EMAIL',
        recipient: allRecipients.join(', '),
        templateCode: String(emailConf?.emailCode || idOrCode),
        referenceEntity: 'EMAIL_CONF',
        referenceId: String(emailConf?.emailConfigId || ''),
        providerStatus: 'FAILED',
        providerMessageId: null,
        errorDetails: err?.message || 'Email send failed',
        retryCount: 0,
        maxRetries: 3,
        metadata: { subject: finalSubject, tenantId },
      });
    } catch { }
    throw err;
  }
};


export const createEmailConf = async (req: any, res: Response) => {
  try {
    const { title, emailCode, subject, message, fromName, fromAddress, emailBcc } = req.body;

    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    const existing = await EmailConfiguration.findOne({
      where: { title, tenantId }
    });
    if (existing) {
      return res.status(400).json({ message: 'EmailConfiguration with this title already exists in this fleet' });
    }

    const emailConf = await EmailConfiguration.create({
      title,
      emailCode,
      subject,
      message,
      fromName,
      fromAddress,
      emailBcc,
      tenantId
    });

    return res.status(201).json({
      message: 'Email configuration created successfully',
      emailConf
    });

  } catch (err: any) {
    console.error('Create emailConf Error:', err);
    return res.status(500).json({
      error: err.message || 'Something went wrong while creating Email Configuration'
    });
  }
};

// ---------------- Get All ----------------
export const fetchAllEmailConfs = async (tenantId?: string, isPlatformAdmin: boolean = false, requestedScope?: string) => {
  const targetTenantId = tenantId || ROOT_TENANT_ID;

  const whereClause: any = {
    [Op.or]: [
      { tenantId: targetTenantId },
      { tenantId: ROOT_TENANT_ID },
      { tenantId: null }
    ]
  };

  // Fleet Admin can ONLY see 'FLEET' operational templates
  if (!isPlatformAdmin) {
    whereClause.scope = 'FLEET';
  } else if (requestedScope) {
    whereClause.scope = requestedScope.toUpperCase();
  }

  const allTemplates = await EmailConfiguration.findAll({
    where: whereClause,
    order: [['scope', 'ASC'], ['category', 'ASC'], ['createdAt', 'DESC']]
  });

  // Merge precedence: tenant-specific template first, fallback to platform default
  const templateMap = new Map<string, EmailConfiguration>();

  // First add root defaults
  allTemplates
    .filter(t => !t.tenantId || t.tenantId === ROOT_TENANT_ID)
    .forEach(t => {
      const code = t.emailCode || t.title;
      if (!templateMap.has(code)) {
        templateMap.set(code, t);
      }
    });

  // Then override with tenant-specific templates
  allTemplates
    .filter(t => t.tenantId === targetTenantId && targetTenantId !== ROOT_TENANT_ID)
    .forEach(t => {
      const code = t.emailCode || t.title;
      templateMap.set(code, t);
    });

  return Array.from(templateMap.values());
};

export const getAllEmailConf = async (req: any, res: Response) => {
  try {
    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin && !req.headers['x-tenant-id'];
    const requestedScope = req.query.scope ? String(req.query.scope) : undefined;

    const emailConfs = await fetchAllEmailConfs(tenantId, isPlatformAdmin, requestedScope);

    res.status(200).json({
      message: 'Email configurations retrieved successfully',
      emailConfs,
      count: emailConfs.length
    });

  } catch (err: any) {
    console.error('Get all emailConf Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};

// ---------------- Update ----------------
export const updateEmailConf = async (req: any, res: Response) => {
  const { id } = req.params;
  const { title, emailCode, subject, message, fromName, fromAddress, emailBcc, isActive } = req.body;

  try {
    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Email configuration ID is required' });
    }

    const emailConf = await EmailConfiguration.findByPk(id);
    if (!emailConf) {
      return res.status(404).json({ message: 'Email configuration not found' });
    }

    const ctx = getTenantContext();
    const callerTenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin && !req.headers['x-tenant-id'];

    // Guard: Fleet Admin cannot modify platform-scoped templates
    if (emailConf.scope === 'PLATFORM' && !isPlatformAdmin) {
      return res.status(403).json({ message: 'Forbidden: Platform SaaS templates can only be managed by SuperAdmin.' });
    }

    const updateData: any = {
      ...(title !== undefined && { title }),
      ...(emailCode !== undefined && { emailCode }),
      ...(subject !== undefined && { subject }),
      ...(message !== undefined && { message }),
      ...(fromName !== undefined && { fromName }),
      ...(fromAddress !== undefined && { fromAddress }),
      ...(emailBcc !== undefined && { emailBcc })
    };

    // If template belongs to caller's tenant, update directly
    if (emailConf.tenantId === callerTenantId) {
      await emailConf.update(updateData);
      return res.status(200).json({
        message: 'Email configuration updated successfully',
        emailConf
      });
    }

    // If template belongs to ROOT_TENANT_ID (platform default)
    if (!emailConf.tenantId || emailConf.tenantId === ROOT_TENANT_ID) {
      if (isPlatformAdmin) {
        // SuperAdmin updating root default
        await emailConf.update(updateData);
        return res.status(200).json({
          message: 'Root email configuration updated successfully',
          emailConf
        });
      }

      // Fleet Admin customizing a platform template:
      // Check if this fleet already has a customized template for this emailCode
      const existingFleetTemplate = await EmailConfiguration.findOne({
        where: { emailCode: emailConf.emailCode, tenantId: callerTenantId }
      });

      if (existingFleetTemplate) {
        await existingFleetTemplate.update(updateData);
        return res.status(200).json({
          message: 'Fleet email configuration updated successfully',
          emailConf: existingFleetTemplate
        });
      }

      // Clone as a new fleet-specific template so other fleets remain unchanged
      const newFleetTemplate = await EmailConfiguration.create({
        title: title || emailConf.title,
        emailCode: emailConf.emailCode,
        subject: subject !== undefined ? subject : emailConf.subject,
        message: message !== undefined ? message : emailConf.message,
        fromName: fromName !== undefined ? fromName : emailConf.fromName,
        fromAddress: fromAddress !== undefined ? fromAddress : emailConf.fromAddress,
        emailBcc: emailBcc !== undefined ? emailBcc : emailConf.emailBcc,
        tenantId: callerTenantId
      });

      return res.status(200).json({
        message: 'Fleet email configuration created and updated successfully',
        emailConf: newFleetTemplate
      });
    }

    // Attempting to modify another fleet's template
    return res.status(403).json({ message: 'Forbidden: Cannot modify another fleet\'s email configuration' });

  } catch (err: any) {
    console.error('Update emailConf Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};

// ---------------- Get By ID ----------------
export const getEmailConfById = async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Email configuration ID is required' });
    }

    const emailConf = await EmailConfiguration.findByPk(id);
    if (!emailConf) {
      return res.status(404).json({ message: 'Email configuration not found' });
    }

    const ctx = getTenantContext();
    const callerTenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin && !req.headers['x-tenant-id'];

    // Can read if belongs to caller's tenant, or is root default, or caller is superadmin
    if (
      emailConf.tenantId !== callerTenantId &&
      emailConf.tenantId !== ROOT_TENANT_ID &&
      emailConf.tenantId !== null &&
      !isPlatformAdmin
    ) {
      return res.status(403).json({ message: 'Forbidden: Cannot view another fleet\'s email configuration' });
    }

    res.status(200).json({
      message: 'Email configuration retrieved successfully',
      emailConf: emailConf
    });

  } catch (err: any) {
    console.error('Get emailConf by ID Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};

/**
 * Preview an email template with live variable resolution and fleet-specific document branding.
 */
export const previewEmailConf = async (req: any, res: Response) => {
  try {
    const { emailConfigId, emailCode, subject, message, mockData } = req.body;
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    let template: EmailConfiguration | null = null;
    if (emailConfigId) {
      template = await EmailConfiguration.findByPk(emailConfigId);
    } else if (emailCode) {
      template = await EmailConfiguration.findOne({ where: { emailCode, tenantId } });
      if (!template) {
        template = await EmailConfiguration.findOne({ where: { emailCode } });
      }
    }

    const branding = await getFleetDocumentBranding(tenantId);
    const defaultMock: Record<string, string> = {
      FleetName: branding.fleetName || 'FleetFlow Mobility',
      CompanyName: branding.fleetName || 'FleetFlow Mobility',
      SupportPhone: branding.contactPhone || '+91 9876543210',
      SupportEmail: branding.contactEmail || 'support@fleetflow.com',
      PortalTitle: branding.portalTitle || 'FleetFlow Portal',
      Address: branding.registeredAddress || '123 Tech Park, Bangalore',
      GstNumber: branding.gstNumber || '29ABCDE1234F1Z5',
      BookingCode: 'BK-2026-9041',
      OrderNumber: 'ORD-88219',
      BookingNumber: 'BK-88219',
      UserName: 'Rajesh Kumar',
      UserEmail: 'rajesh.kumar@example.com',
      DriverName: 'Suresh Kumar',
      VehicleNumber: 'KA-01-EQ-9988',
      InvoiceNumber: 'INV-2026-0042',
      TotalAmount: '3,540.00',
      Password: '••••••••••••',
      LoginUrl: 'https://fleetflow.com/adminlogin',
      CompanySeoUrl: 'https://fleetflow.com/portal/tech-corp',
      ActivationUrl: 'https://fleetflow.com/activate-account?token=act_sample_token',
      PlanTier: 'PRO',
      BillingCycle: 'ANNUAL',
      AgreedPrice: '3,560',
      DaysRemaining: '2',
      ExpiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toDateString(),
      RenewalAmount: '3,560',
      RenewalUrl: 'https://fleetflow.com/admin/billing/checkout',
      RejectionReason: 'Incomplete business registration documentation.',
      TransactionReference: 'TXN_TEST_998822',
      PeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toDateString(),
      DashboardUrl: 'https://fleetflow.com/dashboard',
      ...mockData,
    };

    const rawSubject = subject || template?.subject || 'Notification Subject';
    const rawMessage = message || template?.message || '<p>Notification message body</p>';

    const renderedSubject = replacePlaceholders(rawSubject, defaultMock);
    const renderedBody = replacePlaceholders(rawMessage, defaultMock);

    return res.status(200).json({
      success: true,
      renderedSubject,
      renderedBody,
      placeholdersUsed: defaultMock,
    });
  } catch (err: any) {
    console.error('Preview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate preview' });
  }
};

/**
 * Reset a fleet-customized template back to platform default.
 */
export const resetEmailConf = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const ctx = getTenantContext();
    const callerTenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    const emailConf = await EmailConfiguration.findByPk(id);
    if (!emailConf) {
      return res.status(404).json({ message: 'Email configuration not found' });
    }

    if (emailConf.tenantId && emailConf.tenantId !== ROOT_TENANT_ID) {
      if (emailConf.tenantId !== callerTenantId && !ctx?.isPlatformSuperAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      await emailConf.destroy();
      return res.status(200).json({ success: true, message: 'Template reset to platform default' });
    }

    return res.status(400).json({ message: 'Cannot reset default platform template' });
  } catch (err: any) {
    console.error('Reset error:', err);
    return res.status(500).json({ message: 'Failed to reset template' });
  }
};
