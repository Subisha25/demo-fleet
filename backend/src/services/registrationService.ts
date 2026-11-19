import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Op, Sequelize } from 'sequelize';
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
import { TenantActivationToken } from '../models/tenantActivationToken';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { User } from '../models/user';
import { Employee } from '../models/employee';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { PLAN_LIMITS, getPlanDefinition } from './quotaService';
import { generatePlanSummaryPDF } from './planSummaryPdfService';
import { calculateSubscriptionPeriodEnd } from './subscriptionBillingService';
import { sendNotification, getSuperAdminEmail, getSuperAdminPhone, diagnoseSmtpConfig } from './notificationService';
import { generateUniqueFleetSlug, getFleetLoginUrl } from './slugService';
import sequelize from '../config/dbConfig';
import config from '../config/config';

const WEB_BASE_URL = config.baseurl?.webbaseurl || 'http://localhost:3000';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const SAC_REGEX = /^[0-9]{6}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Public: Submit a fleet registration application.
 */
export const submitFleetRegistration = async (req: Request, res: Response) => {
  try {
    const {
      fleetName,
      businessCode,
      ownerName,
      contactEmail,
      contactPhone,
      city,
      state,
      pinCode,
      requestedPlanTier = 'PRO',
      billingCycle = 'MONTHLY',
      fleetSize = '1-15',
      termsConsent = true,
      legalName,
      displayName,
      registeredAddress,
      gstin,
      panNumber,
      sacCode = '996609',
      website,
      businessEmail,
      businessPhone,
      billingFooterText,
      logoUrl,
    } = req.body;

    // Strict validation of required fields
    if (!fleetName || !businessCode || !ownerName || !contactEmail || !contactPhone || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'All registration fields (Fleet Name, Code, Owner Name, Email, Phone, City, State) are required.',
      });
    }

    if (!termsConsent) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions to register.',
      });
    }

    // Email syntax validation
    const cleanEmail = String(contactEmail || '').toLowerCase().trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact email format. Please provide a valid email address (e.g. operator@fleet.com).',
      });
    }

    // Phone format validation
    const cleanPhone = String(contactPhone || '').trim().replace(/\D/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact phone format. Expected a 10-digit Indian mobile number starting with 6-9.',
      });
    }

    // PIN code validation when provided
    if (pinCode) {
      const cleanPin = String(pinCode).trim();
      if (!PINCODE_REGEX.test(cleanPin)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PIN code format. Expected a 6-digit Indian postal code.',
        });
      }
    }

    // Fleet name validation and canonical uniqueness
    const cleanFleetName = String(fleetName).trim();
    if (cleanFleetName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Fleet name must be at least 2 characters long.',
      });
    }

    const existingFleetName = await Tenant.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('name'))),
        cleanFleetName.toLowerCase()
      ),
    });
    if (existingFleetName) {
      return res.status(409).json({
        success: false,
        message: `A fleet with name '${cleanFleetName}' is already registered on CABZ. Fleet names must be unique.`,
      });
    }

    const existingPendingName = await TenantRegistrationRequest.findOne({
      where: {
        status: 'PENDING',
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('fleetName'))),
            cleanFleetName.toLowerCase()
          ),
        ],
      },
    });
    if (existingPendingName) {
      return res.status(409).json({
        success: false,
        message: `An application with fleet name '${cleanFleetName}' is currently under review.`,
      });
    }

    const cleanCode = String(businessCode).toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
    if (cleanCode.length < 2 || cleanCode.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Business code must be between 2 and 10 alphanumeric characters (e.g. APX, BLU, GC).',
      });
    }

    // Optional Legal Field Validation
    const cleanGstin = gstin ? String(gstin).trim().toUpperCase() : null;
    if (cleanGstin && !GSTIN_REGEX.test(cleanGstin)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GSTIN format. Expected 15-character Indian GSTIN (e.g., 33AAMCG2518C1Z0).',
      });
    }

    const cleanPan = panNumber ? String(panNumber).trim().toUpperCase() : (cleanGstin && cleanGstin.length >= 12 ? cleanGstin.substring(2, 12) : null);
    if (cleanPan && !PAN_REGEX.test(cleanPan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format. Expected 10-character alphanumeric PAN (e.g., AAMCG2518C).',
      });
    }

    const cleanSac = sacCode ? String(sacCode).trim() : '996609';
    if (cleanSac && !SAC_REGEX.test(cleanSac)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SAC code format. Expected 6-digit Service Accounting Code (e.g., 996609).',
      });
    }

    // Check duplicate code against active tenants
    const existingTenant = await Tenant.findOne({ where: { code: cleanCode } });
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: `Business code '${cleanCode}' is already registered by an active fleet operator. Please choose another.`,
      });
    }

    // Check duplicate code against existing pending registrations
    const existingPending = await TenantRegistrationRequest.findOne({
      where: {
        businessCode: cleanCode,
        status: 'PENDING',
      },
    });
    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: `An application with business code '${cleanCode}' is currently under review.`,
      });
    }

    const requestId = uuidv4();
    const normalizedTier = ['BASIC', 'PRO', 'ENTERPRISE'].includes(String(requestedPlanTier).toUpperCase())
      ? (String(requestedPlanTier).toUpperCase() as 'BASIC' | 'PRO' | 'ENTERPRISE')
      : 'PRO';

    const normalizedCycle = String(billingCycle).toUpperCase() === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';

    const slug = await generateUniqueFleetSlug(
      displayName ? String(displayName).trim() : String(fleetName).trim()
    );

    const registration = await TenantRegistrationRequest.create({
      requestId,
      fleetName: String(fleetName).trim(),
      legalName: legalName ? String(legalName).trim() : String(fleetName).trim(),
      displayName: displayName ? String(displayName).trim() : String(fleetName).trim(),
      slug,
      businessCode: cleanCode,
      ownerName: String(ownerName).trim(),
      contactEmail: String(contactEmail).toLowerCase().trim(),
      contactPhone: String(contactPhone).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      pinCode: pinCode ? String(pinCode).trim() : null,
      registeredAddress: registeredAddress ? String(registeredAddress).trim() : null,
      gstin: cleanGstin,
      panNumber: cleanPan,
      sacCode: cleanSac,
      website: website ? String(website).trim() : null,
      businessEmail: businessEmail ? String(businessEmail).toLowerCase().trim() : String(contactEmail).toLowerCase().trim(),
      businessPhone: businessPhone ? String(businessPhone).trim() : String(contactPhone).trim(),
      billingFooterText: billingFooterText ? String(billingFooterText).trim() : null,
      logoUrl: logoUrl ? String(logoUrl).trim() : null,
      requestedPlanTier: normalizedTier,
      billingCycle: normalizedCycle,
      fleetSize: String(fleetSize).trim(),
      status: 'PENDING',
      termsConsent: Boolean(termsConsent),
    });

    // Strict Recipient Separation (Prompt Section 4):
    // Dedicated isolated variables for all notification channels
    const applicantEmail = cleanEmail;
    const applicantPhone = cleanPhone;
    const superAdminNotificationEmail = (await getSuperAdminEmail()).toLowerCase().trim();

    // Guard: Applicant email must be valid; never redirect to SuperAdmin
    if (!applicantEmail || !EMAIL_REGEX.test(applicantEmail)) {
      console.error('[Registration] Cannot dispatch registration email: Invalid applicant email:', applicantEmail);
      return res.status(400).json({ success: false, message: 'Invalid applicant contact email format.' });
    }

    // Resolve plan details for template display
    const plan = await getPlanDefinition(normalizedTier);
    const agreedPrice = normalizedCycle === 'ANNUAL'
      ? (plan?.priceAnnualINR || 3560)
      : (plan?.priceMonthlyINR || 349);

    const notificationTasks: Promise<any>[] = [
      // EVENT 1 (Email): Registration Received acknowledgment email strictly to applicant
      sendNotification({
        channel: 'EMAIL',
        recipient: applicantEmail,
        templateCode: 'REGISTRATION_RECEIVED',
        subject: `Application Received: Welcome to CABZ — ${registration.fleetName}`,
        body: `Hello ${registration.ownerName},\n\nThank you for applying to join CABZ Mobility Platform. Your application for ${registration.fleetName} (Code: ${registration.businessCode}) has been received and is currently under review by our platform administration team.\n\nApplication Reference: ${requestId}\nPlan: ${normalizedTier} (${normalizedCycle} billing)\nAgreed Price: ₹${agreedPrice}\n\nYou will receive a secure activation link once your fleet application is approved.`,
        referenceEntity: 'REGISTRATION_REQUEST',
        referenceId: requestId,
        metadata: {
          fleetName: registration.fleetName,
          businessCode: registration.businessCode,
          ownerName: registration.ownerName,
          contactEmail: applicantEmail,
          contactPhone: applicantPhone,
          planTier: normalizedTier,
          billingCycle: normalizedCycle,
          agreedPrice: String(agreedPrice),
          supportEmail: 'support@cabz.com',
        },
      }),

      // EVENT 1 (SMS): Registration Received acknowledgment SMS strictly to applicant mobile
      sendNotification({
        channel: 'SMS',
        recipient: applicantPhone,
        templateCode: 'REGISTRATION_RECEIVED_SMS',
        smsTemplateName: 'Booking Creation',
        smsVars: [registration.ownerName || 'Applicant'],
        subject: `CABZ: Registration Received - ${registration.fleetName}`,
        body: `CABZ: Registration for ${registration.fleetName} (${registration.businessCode}) has been received and is awaiting SuperAdmin approval. Ref: ${requestId.substring(0, 8)}.`,
        referenceEntity: 'REGISTRATION_REQUEST',
        referenceId: requestId,
        metadata: {
          fleetName: registration.fleetName,
          businessCode: registration.businessCode,
          ownerName: registration.ownerName,
          contactPhone: applicantPhone,
        },
      }),

      // EVENT 2: Alert SuperAdmin via separate pending approval alert email only (NO SMS to SuperAdmin)
      sendNotification({
        channel: 'EMAIL',
        recipient: superAdminNotificationEmail,
        templateCode: 'SUPERADMIN_NEW_APPLICATION_ALERT',
        subject: `🚨 New Fleet Application Received: ${registration.fleetName} (${registration.businessCode})`,
        body: `A new fleet transport operator has submitted a registration application for review:\n\nFleet Name: ${registration.fleetName}\nBusiness Code: ${registration.businessCode}\nApplicant: ${registration.ownerName}\nContact Email: ${applicantEmail}\nContact Phone: ${applicantPhone}\nLocation: ${registration.city}, ${registration.state}\nRequested Plan: ${normalizedTier} (${normalizedCycle})\nAgreed Price: ₹${agreedPrice}\n\nPlease review the application at: ${WEB_BASE_URL}/admin/registrations`,
        referenceEntity: 'REGISTRATION_REQUEST',
        referenceId: requestId,
        metadata: {
          fleetName: registration.fleetName,
          businessCode: registration.businessCode,
          ownerName: registration.ownerName,
          contactEmail: applicantEmail,
          contactPhone: applicantPhone,
          city: registration.city,
          state: registration.state,
          planTier: normalizedTier,
          billingCycle: normalizedCycle,
          agreedPrice: String(agreedPrice),
          reviewUrl: `${WEB_BASE_URL}/admin/registrations`,
          actionText: 'Review Inbound Applications',
        },
      }),
    ];

    // NOTE: Per strict requirements:
    // - SuperAdmin receives EMAIL ONLY (SUPERADMIN_NEW_APPLICATION_ALERT). SuperAdmin phone receives ZERO SMS.
    // - SuperAdmin never receives applicant registration success email or SMS.
    // - Applicant receives BOTH registration success email (REGISTRATION_RECEIVED) and SMS (REGISTRATION_RECEIVED_SMS).

    await Promise.allSettled(notificationTasks);

    return res.status(201).json({
      success: true,
      message: 'Your fleet registration application has been submitted successfully. Our team will review it within 24 hours.',
      data: {
        requestId,
        fleetName: registration.fleetName,
        businessCode: registration.businessCode,
        slug: registration.slug,
        loginUrl: getFleetLoginUrl(registration.slug || registration.businessCode.toLowerCase()),
        status: registration.status,
      },
    });
  } catch (error: any) {
    console.error('Error submitting fleet registration:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: List all fleet registration requests.
 */
export const getRegistrationRequests = async (req: Request, res: Response) => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(String(status).toUpperCase())) {
      where.status = String(status).toUpperCase();
    }

    if (search) {
      where[Op.or] = [
        { fleetName: { [Op.like]: `%${search}%` } },
        { businessCode: { [Op.like]: `%${search}%` } },
        { ownerName: { [Op.like]: `%${search}%` } },
        { contactEmail: { [Op.like]: `%${search}%` } },
        { contactPhone: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit))));
    const offset = (pageNum - 1) * limitNum;

    const { rows: requests, count: total } = await TenantRegistrationRequest.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    const mapped = requests.map((r: any) => {
      const json = r.toJSON ? r.toJSON() : r;
      return {
        ...json,
        id: json.requestId,
        requestId: json.requestId,
        adminName: json.ownerName,
        ownerName: json.ownerName,
        adminEmail: json.contactEmail,
        contactEmail: json.contactEmail,
        adminPhone: json.contactPhone,
        contactPhone: json.contactPhone,
        requestedPlan: json.requestedPlanTier,
        requestedPlanTier: json.requestedPlanTier,
        requestedBilling: json.billingCycle,
        billingCycle: json.billingCycle,
        reviewerNotes: json.reviewNotes,
        reviewNotes: json.reviewNotes,
      };
    });

    return res.status(200).json({
      success: true,
      data: mapped,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching registration requests:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Get single registration request by ID.
 */
export const getRegistrationRequestById = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId || req.params.id;
    const request = await TenantRegistrationRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Registration request not found.' });
    }
    const json = request.toJSON ? request.toJSON() : request;
    return res.status(200).json({
      success: true,
      data: {
        ...json,
        id: json.requestId,
        requestId: json.requestId,
        adminName: json.ownerName,
        ownerName: json.ownerName,
        adminEmail: json.contactEmail,
        contactEmail: json.contactEmail,
        adminPhone: json.contactPhone,
        contactPhone: json.contactPhone,
        requestedPlan: json.requestedPlanTier,
        requestedPlanTier: json.requestedPlanTier,
        requestedBilling: json.billingCycle,
        billingCycle: json.billingCycle,
        reviewerNotes: json.reviewNotes,
        reviewNotes: json.reviewNotes,
      },
    });
  } catch (error: any) {
    console.error('Error fetching registration request:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Approve a registration application and dispatch a 24h expiring activation token.
 */
export const approveRegistrationRequest = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId || req.params.id;
    const { reviewNotes } = req.body;

    const reg = await TenantRegistrationRequest.findByPk(requestId);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration request not found.' });
    }

    if (reg.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status '${reg.status}'.`,
      });
    }

    // 1. Provision Tenant, Subscription & Activation Token inside an ACID transaction
    // Strictly ensures approval email triggers only after database transaction commits
    const tenantId = uuidv4();
    const limits = PLAN_LIMITS[reg.requestedPlanTier];
    const plan = await getPlanDefinition(reg.requestedPlanTier);
    const billingCycle = reg.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
    const agreedPrice = billingCycle === 'ANNUAL'
      ? (plan?.priceAnnualINR || 3560)
      : (plan?.priceMonthlyINR || 349);

    const tenantSlug = reg.slug || await generateUniqueFleetSlug(reg.displayName || reg.fleetName);

    const now = new Date();
    const periodEnd = calculateSubscriptionPeriodEnd(now, billingCycle);

    const rawToken = `act_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    let tenant: Tenant;
    let subscription: TenantSubscription;
    let activationTokenRecord: TenantActivationToken;

    await sequelize.transaction(async (t) => {
      tenant = await Tenant.create({
        tenantId,
        name: reg.fleetName,
        legalName: reg.legalName || reg.fleetName,
        displayName: reg.displayName || reg.fleetName,
        code: reg.businessCode,
        subdomain: reg.businessCode.toLowerCase(),
        slug: tenantSlug,
        status: 'ACTIVE',
        planTier: reg.requestedPlanTier,
        contactEmail: reg.contactEmail,
        contactPhone: reg.contactPhone,
        registeredAddress: reg.registeredAddress || null,
        gstin: reg.gstin || null,
        panNumber: reg.panNumber || null,
        sacCode: reg.sacCode || '996609',
        website: reg.website || null,
        businessEmail: reg.businessEmail || reg.contactEmail,
        businessPhone: reg.businessPhone || reg.contactPhone,
        billingFooterText: reg.billingFooterText || null,
        city: reg.city || null,
        state: reg.state || null,
        pinCode: reg.pinCode || null,
        logoUrl: reg.logoUrl || null,
        brandingTokens: {
          primaryColor: '#0f1c3f',
          secondaryColor: '#0d9488',
          portalTitle: `${reg.displayName || reg.fleetName} Fleet Portal`,
          legalName: reg.legalName || reg.fleetName,
          displayName: reg.displayName || reg.fleetName,
          registeredAddress: reg.registeredAddress || null,
          gstin: reg.gstin || null,
          gstNumber: reg.gstin || null,
          panNumber: reg.panNumber || null,
          sacCode: reg.sacCode || '996609',
          website: reg.website || null,
          businessEmail: reg.businessEmail || reg.contactEmail,
          businessPhone: reg.businessPhone || reg.contactPhone,
          billingFooterText: reg.billingFooterText || null,
          city: reg.city || null,
          state: reg.state || null,
          pinCode: reg.pinCode || null,
          logoUrl: reg.logoUrl || null,
        },
      }, { transaction: t });

      subscription = await TenantSubscription.create({
        subscriptionId: uuidv4(),
        tenantId,
        planTier: reg.requestedPlanTier,
        status: 'TRIALING',
        vehicleQuota: limits.vehicles,
        driverQuota: limits.drivers,
        companyQuota: limits.companies,
        monthlyTripQuota: limits.trips,
        allowOverage: reg.requestedPlanTier !== 'BASIC',
        monthlyOverageSpendCap: reg.requestedPlanTier === 'PRO' ? 5000 : 1000,
        billingCycle,
        agreedPrice,
        currency: 'INR',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      }, { transaction: t });

      activationTokenRecord = await TenantActivationToken.create({
        tokenId: uuidv4(),
        tenantId,
        adminEmail: reg.contactEmail,
        adminName: reg.ownerName,
        tokenHash,
        expiresAt,
        isRevoked: false,
      }, { transaction: t });

      await reg.update({
        status: 'APPROVED',
        reviewedBy: (req as any).user?.userId || 'SuperAdmin',
        reviewedAt: new Date(),
        tenantId,
        reviewNotes: reviewNotes || 'Application reviewed and approved.',
      }, { transaction: t });
    });

    // 2. Generate Official SaaS Plan Summary Document PDF (after transaction succeeds)
    let pdfResult: any = null;
    try {
      pdfResult = await generatePlanSummaryPDF({
        tenantId,
        fleetName: reg.fleetName,
        businessCode: reg.businessCode,
        ownerName: reg.ownerName,
        contactEmail: reg.contactEmail,
        planName: plan?.name || `${reg.requestedPlanTier} Mobility Plan`,
        planTier: reg.requestedPlanTier,
        billingCycle,
        agreedPrice,
        currency: 'INR',
        startDate: now,
        renewalDate: periodEnd,
        quotas: {
          vehicles: limits.vehicles,
          drivers: limits.drivers,
          companies: limits.companies,
          trips: limits.trips,
        },
        features: plan?.features || [],
      });
    } catch (pdfErr) {
      console.warn('Notice: PDF generation error handled gracefully:', pdfErr);
    }

    // 3. Strict Recipient Separation: Dispatch activation & approval email to applicant only
    // EVENT 3: SuperAdmin Approves Fleet — sent ONLY to registered applicant / Fleet Admin email
    const applicantEmail = reg.contactEmail.trim().toLowerCase();
    const activationUrl = `${WEB_BASE_URL}/activate-account?token=${rawToken}`;
    const fleetLoginUrl = getFleetLoginUrl(tenantSlug);
    const downloadPdfUrl = pdfResult
      ? `${config.baseurl?.apibaseurl || 'http://localhost:5000'}/api/tenants/plan-summary/download/${pdfResult.fileName}?token=${pdfResult.downloadToken}`
      : '';

    if (!applicantEmail || !EMAIL_REGEX.test(applicantEmail)) {
      console.error('[Approval] Cannot dispatch activation email: missing or invalid contactEmail on request', reg.requestId);
    } else {
      await sendNotification({
        channel: 'EMAIL',
        recipient: applicantEmail,
        templateCode: 'TENANT_ADMIN_ACTIVATION_LINK',
        subject: `🎉 Congratulations! Your CABZ Account is Approved: ${reg.fleetName}`,
        body: `Dear ${reg.ownerName},\n\nYour application for ${reg.fleetName} has been approved!\n\n` +
          `PLAN SUMMARY:\n` +
          `• Plan: ${plan?.name || reg.requestedPlanTier}\n` +
          `• Agreed Price: ₹${agreedPrice} / ${billingCycle.toLowerCase()}\n` +
          `• Included Quotas: Up to ${limits.vehicles} Vehicles, ${limits.drivers} Drivers, ${limits.companies} Corporate Accounts\n\n` +
          `STEP 1 — ACTIVATE YOUR ACCOUNT:\n` +
          `Click the secure activation link below to set your administrator password:\n${activationUrl}\n` +
          `(Note: This link will expire in 24 hours. Never share this link with anyone.)\n\n` +
          `STEP 2 — DEDICATED FLEET LOGIN PORTAL:\n` +
          `Access your branded fleet operator dashboard at your unique URL:\n${fleetLoginUrl}\n\n` +
          (downloadPdfUrl ? `STEP 3 — DOWNLOAD PLAN SUMMARY PDF:\nView and download your official subscription agreement: ${downloadPdfUrl}\n\n` : '') +
          `Best regards,\nCABZ SaaS Platform Team`,
        referenceEntity: 'TENANT',
        referenceId: tenantId,
        metadata: {
          tenantId,
          fleetName: reg.fleetName,
          ownerName: reg.ownerName,
          planTier: reg.requestedPlanTier,
          billingCycle,
          agreedPrice: String(agreedPrice),
          activationUrl,
          loginUrl: fleetLoginUrl,
          fleetLoginUrl,
          planSummaryPdfUrl: downloadPdfUrl,
          attachments: pdfResult?.filePath ? [{ filename: pdfResult.fileName, path: pdfResult.filePath }] : undefined,
          actionText: 'Set Up Administrator Password',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application approved successfully, plan summary generated, and activation link dispatched.',
      tenantId,
      planSummaryPdfPath: pdfResult?.filePath,
      planSummaryPdfUrl: downloadPdfUrl,
      data: {
        tenantId,
        fleetName: tenant!.name,
        code: tenant!.code,
        rawToken, // Provided in development for automated verification
        activationUrl,
        loginUrl: fleetLoginUrl,
        fleetLoginUrl,
        planSummaryPdfUrl: downloadPdfUrl,
        planSummaryPdfPath: pdfResult?.filePath,
      },
    });
  } catch (error: any) {
    console.error('Error approving registration request:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Reject a registration application.
 */
export const rejectRegistrationRequest = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId || req.params.id;
    const { rejectionReason, reviewNotes } = req.body;

    const reg = await TenantRegistrationRequest.findByPk(requestId);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration request not found.' });
    }

    if (reg.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status '${reg.status}'.`,
      });
    }

    if (!rejectionReason || !String(rejectionReason).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.',
      });
    }

    await sequelize.transaction(async (t) => {
      await reg.update({
        status: 'REJECTED',
        rejectionReason: String(rejectionReason).trim(),
        reviewNotes: reviewNotes || null,
        reviewedBy: (req as any).user?.userId || 'SuperAdmin',
        reviewedAt: new Date(),
      }, { transaction: t });
    });

    // EVENT 4: Dispatch Rejection Notification strictly to applicant only
    const applicantEmail = reg.contactEmail.trim().toLowerCase();
    if (applicantEmail && EMAIL_REGEX.test(applicantEmail)) {
      await sendNotification({
        channel: 'EMAIL',
        recipient: applicantEmail,
        templateCode: 'REGISTRATION_REJECTED',
        subject: `Update on Your CABZ Application: ${reg.fleetName}`,
        body: `Dear ${reg.ownerName},\n\nThank you for your interest in CABZ. After careful review, we regret to inform you that we are unable to approve your application for ${reg.fleetName} at this time.\n\nReason: ${reg.rejectionReason}\n\nIf you have any questions or feel this decision was made in error, please contact our support team at support@cabz.com.`,
        referenceEntity: 'REGISTRATION_REQUEST',
        referenceId: requestId,
        metadata: {
          fleetName: reg.fleetName,
          ownerName: reg.ownerName,
          rejectionReason: reg.rejectionReason,
          supportEmail: 'support@cabz.com',
        },
      });
    } else {
      console.warn('[Rejection] Cannot dispatch rejection notification: invalid or missing applicant email');
    }

    return res.status(200).json({
      success: true,
      message: 'Registration application rejected.',
      data: {
        requestId,
        status: 'REJECTED',
        rejectionReason: reg.rejectionReason,
      },
    });
  } catch (error: any) {
    console.error('Error rejecting registration request:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Resend activation link for an approved tenant.
 */
export const resendActivationLink = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId || req.params.id;
    const reg = await TenantRegistrationRequest.findByPk(requestId);
    if (!reg || !reg.tenantId) {
      return res.status(404).json({ success: false, message: 'Approved registration request not found.' });
    }

    // Revoke old tokens
    await TenantActivationToken.update(
      { isRevoked: true },
      { where: { tenantId: reg.tenantId, usedAt: null } }
    );

    // Generate new token
    const rawToken = `act_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await TenantActivationToken.create({
      tokenId: uuidv4(),
      tenantId: reg.tenantId,
      adminEmail: reg.contactEmail,
      adminName: reg.ownerName,
      tokenHash,
      expiresAt,
      isRevoked: false,
    });

    const applicantEmail = reg.contactEmail.trim().toLowerCase();
    const activationUrl = `${WEB_BASE_URL}/activate-account?token=${rawToken}`;
    await sendNotification({
      channel: 'EMAIL',
      recipient: applicantEmail,
      templateCode: 'TENANT_ADMIN_ACTIVATION_LINK',
      subject: `Resent: Set Up Your CABZ Administrator Password: ${reg.fleetName}`,
      body: `Dear ${reg.ownerName},\n\nAs requested, here is your updated activation link to access your fleet operations:\n\n${activationUrl}\n\nThis link is valid for 24 hours.`,
      referenceEntity: 'TENANT',
      referenceId: reg.tenantId,
      metadata: {
        tenantId: reg.tenantId,
        fleetName: reg.fleetName,
        ownerName: reg.ownerName,
        activationUrl,
        actionText: 'Set Up Password',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'New activation link generated and dispatched successfully.',
      data: { rawToken, activationUrl },
    });
  } catch (error: any) {
    console.error('Error resending activation link:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Public: Validate activation token.
 */
export const verifyActivationToken = async (req: Request, res: Response) => {
  try {
    const token = req.params?.token || req.query?.token || req.body?.token;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Activation token is required.' });
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const record = await TenantActivationToken.findOne({
      where: {
        tokenHash,
        isRevoked: false,
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [{ model: Tenant }],
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'This activation link is invalid, expired, or has already been used.',
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      data: {
        email: record.adminEmail,
        name: record.adminName,
        adminName: record.adminName,
        tenantName: record.tenant?.name || 'Fleet Operator',
        fleetName: record.tenant?.name || 'Fleet Operator',
        businessCode: record.tenant?.code || '',
        plan: record.tenant?.planTier || 'PRO',
        billingCycle: 'MONTHLY',
        expiresAt: record.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Error verifying activation token:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Public: Complete account activation and set initial password.
 */
export const completeAccountActivation = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword, email } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const record = await TenantActivationToken.findOne({
      where: {
        tokenHash,
        isRevoked: false,
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Activation token is invalid, expired, or has already been used.',
      });
    }

    // Strict validation: Verify email is registered for an approved fleet
    if (email && String(email).toLowerCase().trim() !== record.adminEmail.toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is not registered for an approved fleet.',
      });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const regReq = await TenantRegistrationRequest.findOne({ where: { tenantId: record.tenantId } });
    const cleanPhone = regReq?.contactPhone || `9${Date.now().toString().slice(-9)}`;

    // Upsert Employee record for login authentication via /api/auth/login
    let emp = await Employee.findOne({ where: { email: record.adminEmail } });
    if (emp) {
      await emp.update({
        password: hashedPassword,
        tenantId: record.tenantId,
        role: 'fleet_admin',
      });
    } else {
      let finalPhone = cleanPhone;
      const existingPhone = await Employee.findOne({ where: { phno: finalPhone } });
      if (existingPhone) {
        finalPhone = `9${Date.now().toString().slice(-9)}`;
      }

      await Employee.create({
        employeeId: uuidv4(),
        email: record.adminEmail,
        username: record.adminName || record.adminEmail.split('@')[0],
        phno: finalPhone,
        password: hashedPassword,
        role: 'fleet_admin',
        tenantId: record.tenantId,
      });
    }

    // Upsert User record
    let user = await User.findOne({ where: { email: record.adminEmail } });
    if (user) {
      await user.update({
        password: hashedPassword,
        tenantId: record.tenantId,
        role: 'fleet_admin',
      });
    } else {
      await User.create({
        userId: uuidv4(),
        email: record.adminEmail,
        username: record.adminEmail.split('@')[0],
        mobile: cleanPhone,
        password: hashedPassword,
        role: 'fleet_admin',
        tenantId: record.tenantId,
        status: 'active',
      });
    }

    // Mark token as used
    await record.update({ usedAt: new Date() });

    // Send confirmation welcome notification
    const loginUrl = `${WEB_BASE_URL}/login`;
    await sendNotification({
      channel: 'EMAIL',
      recipient: record.adminEmail,
      templateCode: 'ACCOUNT_ACTIVATED',
      subject: `✅ Welcome to CABZ: Your Operator Account is Ready`,
      body: `Dear ${record.adminName || 'Fleet Operator'},\n\nYour administrator password has been set successfully. You can now log into your CABZ fleet management portal.\n\nSign In URL: ${loginUrl}\nLogin Email: ${record.adminEmail}\n\nFrom your dashboard, you can configure your fleet, assign vehicles, dispatch trips, and monitor operations.\n\nBest regards,\nCABZ SaaS Team`,
      referenceEntity: 'TENANT',
      referenceId: record.tenantId,
      metadata: { loginUrl, actionText: 'Sign In to Fleet Portal' },
    });

    return res.status(200).json({
      success: true,
      message: 'Password set successfully! Your account is now active. Please sign in.',
      data: {
        email: record.adminEmail,
        tenantId: record.tenantId,
        loginUrl,
      },
    });
  } catch (error: any) {
    console.error('Error completing account activation:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Diagnose SMTP configuration and transporter connectivity.
 */
export const diagnoseEmailEndpoint = async (req: Request, res: Response) => {
  try {
    const diagnostic = await diagnoseSmtpConfig();
    return res.status(200).json({
      success: true,
      diagnostic,
    });
  } catch (error: any) {
    console.error('Error diagnosing SMTP:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Send test email to verified destination.
 */
export const sendTestEmailEndpoint = async (req: Request, res: Response) => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || (await getSuperAdminEmail());

    const result = await sendNotification({
      channel: 'EMAIL',
      recipient,
      templateCode: 'TEST_EMAIL',
      subject: '🧪 Grace Cabs Diagnostic Test Email',
      body: `This is a test notification dispatched from the Grace Cabs diagnostic console.\n\nTimestamp: ${new Date().toISOString()}\nTarget: ${recipient}\n\nIf you received this message, SMTP transmission is functioning correctly.`,
      referenceEntity: 'DIAGNOSTIC',
      referenceId: 'DIAG_' + Date.now(),
    });

    return res.status(200).json({
      success: result.success,
      result,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Public/Authorized download of generated SaaS Plan Summary PDF.
 */
export const downloadPlanSummaryPDF = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    const { token } = req.query;

    const safeFileName = path.basename(fileName);
    if (!safeFileName || safeFileName !== fileName || fileName.includes('..')) {
      return res.status(400).json({ message: 'Invalid file name' });
    }

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ message: 'Missing or invalid download token' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired download token' });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'plans', safeFileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Plan summary document not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFileName}"`);
    return res.sendFile(filePath);
  } catch (err: any) {
    console.error('Error serving plan summary PDF:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


