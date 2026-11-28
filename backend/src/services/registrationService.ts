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
import { PLAN_LIMITS, TRIAL_BASELINE_LIMITS, getPlanDefinition } from './quotaService';
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
      requestedPlanTier = 'FREE_TRIAL',
      billingCycle = 'MONTHLY',
      fleetSize = '1-15',
      termsConsent = true,
      demoCallDate,
      demoCallTime,
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
    if (!fleetName || !String(fleetName).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the fleet name.',
        errors: { fleetName: 'Please enter the fleet name.' },
      });
    }

    // Preferred Demo Call Date & Time Validation
    if (!demoCallDate || !String(demoCallDate).trim() || !demoCallTime || !String(demoCallTime).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please select your preferred demo call date and time.',
        errors: { demoCallDate: 'Please select your preferred demo call date and time.' },
      });
    }

    const cleanDemoDate = String(demoCallDate).trim();
    const cleanDemoTime = String(demoCallTime).trim();

    // Check date against current date (cannot be in the past)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

    if (cleanDemoDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Demo call date cannot be in the past.',
        errors: { demoCallDate: 'Demo call date cannot be in the past.' },
      });
    }

    if (cleanDemoDate > maxDateStr) {
      return res.status(400).json({
        success: false,
        message: 'Please select a demo call time within the next 7 days.',
        errors: { demoCallDate: 'Please select a demo call time within the next 7 days.' },
      });
    }

    const cleanCode = String(businessCode || '').toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
    if (!cleanCode || cleanCode.length < 2 || cleanCode.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Business code must be between 2 and 10 alphanumeric characters (e.g. APX, BLU, GC).',
        errors: { businessCode: 'Business code must be between 2 and 10 alphanumeric characters (e.g. APX, BLU, GC).' },
      });
    }

    if (!ownerName || !String(ownerName).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the contact person name.',
        errors: { ownerName: 'Please enter the contact person name.' },
      });
    }

    // Email syntax validation
    const cleanEmail = String(contactEmail || '').toLowerCase().trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
        errors: { contactEmail: 'Please enter a valid email address.' },
      });
    }

    // Phone format validation (must be exactly 10 digits)
    const cleanPhone = String(contactPhone || '').trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits.',
        errors: { contactPhone: 'Phone number must be exactly 10 digits.' },
      });
    }

    if (!city || !String(city).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the city.',
        errors: { city: 'Please enter the city.' },
      });
    }

    if (!state || !String(state).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the state.',
        errors: { state: 'Please enter the state.' },
      });
    }

    if (!termsConsent) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions to register.',
        errors: { termsConsent: 'You must accept the terms and conditions to register.' },
      });
    }

    // PIN code validation when provided
    if (pinCode && String(pinCode).trim()) {
      const cleanPin = String(pinCode).trim().replace(/\D/g, '');
      if (cleanPin.length !== 6 || !PINCODE_REGEX.test(cleanPin)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid 6-digit pincode.',
          errors: { pinCode: 'Please enter a valid 6-digit pincode.' },
        });
      }
    }

    // Fleet name validation and canonical uniqueness
    const cleanFleetName = String(fleetName).trim();
    if (cleanFleetName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Fleet name must be at least 2 characters long.',
        errors: { fleetName: 'Fleet name must be at least 2 characters long.' },
      });
    }

    // Optional Legal Field Validation
    const cleanGstin = gstin && String(gstin).trim() ? String(gstin).trim().toUpperCase() : null;
    if (cleanGstin && (!GSTIN_REGEX.test(cleanGstin) || cleanGstin.length !== 15)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 15-character GST number.',
        errors: { gstin: 'Please enter a valid 15-character GST number.' },
      });
    }

    const cleanPan = panNumber && String(panNumber).trim()
      ? String(panNumber).trim().toUpperCase()
      : (cleanGstin && cleanGstin.length >= 12 ? cleanGstin.substring(2, 12) : null);
    if (cleanPan && (!PAN_REGEX.test(cleanPan) || cleanPan.length !== 10)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-character PAN number.',
        errors: { panNumber: 'Please enter a valid 10-character PAN number.' },
      });
    }

    const cleanSac = sacCode ? String(sacCode).trim() : '996609';
    if (cleanSac && !SAC_REGEX.test(cleanSac)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SAC code format. Expected 6 digits (default: 996609).',
        errors: { sacCode: 'Invalid SAC code format. Expected 6 digits (default: 996609).' },
      });
    }

    // DUPLICATE CHECKS AGAINST LIVE DATABASE

    // 1. Duplicate Email Check
    const existingEmailPending = await TenantRegistrationRequest.findOne({
      where: {
        contactEmail: cleanEmail,
        status: 'PENDING',
      },
    });
    const existingEmailTenant = await Tenant.findOne({ where: { contactEmail: cleanEmail } });
    const existingEmailEmp = await Employee.findOne({ where: { email: cleanEmail } });
    const existingEmailUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingEmailPending || existingEmailTenant || existingEmailEmp || existingEmailUser) {
      return res.status(409).json({
        success: false,
        message: 'This email address is already registered.',
        errors: { contactEmail: 'This email address is already registered.' },
      });
    }

    // 2. Duplicate Phone Check
    const existingPhonePending = await TenantRegistrationRequest.findOne({
      where: {
        contactPhone: cleanPhone,
        status: 'PENDING',
      },
    });
    const existingPhoneTenant = await Tenant.findOne({ where: { contactPhone: cleanPhone } });
    const existingPhoneEmp = await Employee.findOne({ where: { phno: cleanPhone } });
    const existingPhoneUser = await User.findOne({ where: { mobile: cleanPhone } });
    if (existingPhonePending || existingPhoneTenant || existingPhoneEmp || existingPhoneUser) {
      return res.status(409).json({
        success: false,
        message: 'This phone number is already registered.',
        errors: { contactPhone: 'This phone number is already registered.' },
      });
    }

    // 3. Duplicate GSTIN Check (if entered)
    if (cleanGstin) {
      const existingGstinTenant = await Tenant.findOne({ where: { gstin: cleanGstin } });
      const existingGstinPending = await TenantRegistrationRequest.findOne({
        where: { gstin: cleanGstin, status: 'PENDING' },
      });
      if (existingGstinTenant || existingGstinPending) {
        return res.status(409).json({
          success: false,
          message: 'This GST number is already registered.',
          errors: { gstin: 'This GST number is already registered.' },
        });
      }
    }

    // 4. Duplicate PAN Check (if entered)
    if (cleanPan) {
      const existingPanTenant = await Tenant.findOne({ where: { panNumber: cleanPan } });
      const existingPanPending = await TenantRegistrationRequest.findOne({
        where: { panNumber: cleanPan, status: 'PENDING' },
      });
      if (existingPanTenant || existingPanPending) {
        return res.status(409).json({
          success: false,
          message: 'This PAN number is already registered.',
          errors: { panNumber: 'This PAN number is already registered.' },
        });
      }
    }

    // 5. Duplicate Fleet Name Check
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
        errors: { fleetName: `A fleet with name '${cleanFleetName}' is already registered on CABZ. Fleet names must be unique.` },
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
        errors: { fleetName: `An application with fleet name '${cleanFleetName}' is currently under review.` },
      });
    }

    // 6. Duplicate Business Code Check
    const existingTenant = await Tenant.findOne({ where: { code: cleanCode } });
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: `Business code '${cleanCode}' is already registered by an active fleet operator. Please choose another.`,
        errors: { businessCode: `Business code '${cleanCode}' is already registered.` },
      });
    }

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
        errors: { businessCode: `An application with business code '${cleanCode}' is currently under review.` },
      });
    }

    const requestId = uuidv4();
    const normalizedTier = 'FREE_TRIAL';
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
      demoCallDate: cleanDemoDate,
      demoCallTime: cleanDemoTime,
      demoCallStatus: 'Requested',
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

    const agreedPrice = 0; // Free trial application only; no paid plan price assigned

    const notificationTasks: Promise<any>[] = [
      // EVENT 1 (Email): Registration Received acknowledgment email strictly to applicant
      sendNotification({
        channel: 'EMAIL',
        recipient: applicantEmail,
        templateCode: 'REGISTRATION_RECEIVED',
        subject: `Application Received: Welcome to CABZ — ${registration.fleetName}`,
        body: `Hello ${registration.ownerName},\n\nThank you for applying to join CABZ Mobility Platform. Your application for ${registration.fleetName} (Code: ${registration.businessCode}) has been received and is currently under review by our platform administration team.\n\nApplication Reference: ${requestId}\nPlan: 7-Day Free Trial (₹0 Upfront, Full Operational Access)\nAgreed Price: ₹0 (No paid plan required during trial)\n\nYou will receive a secure activation link once your fleet application is approved.`,
        referenceEntity: 'REGISTRATION_REQUEST',
        referenceId: requestId,
        metadata: {
          fleetName: registration.fleetName,
          businessCode: registration.businessCode,
          ownerName: registration.ownerName,
          contactEmail: applicantEmail,
          contactPhone: applicantPhone,
          planTier: 'FREE_TRIAL',
          billingCycle: normalizedCycle,
          agreedPrice: '0',
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
        body: `A new fleet transport operator has submitted a registration application for review:\n\nFleet Name: ${registration.fleetName}\nBusiness Code: ${registration.businessCode}\nApplicant: ${registration.ownerName}\nContact Email: ${applicantEmail}\nContact Phone: ${applicantPhone}\nLocation: ${registration.city}, ${registration.state}\nRequested Plan: Free Trial (7 Days)\nAgreed Price: ₹0\n\nPlease review the application at: ${WEB_BASE_URL}/admin/registrations`,
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
          planTier: 'FREE_TRIAL',
          billingCycle: normalizedCycle,
          agreedPrice: '0',
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
        demoCallDate: registration.demoCallDate,
        demoCallTime: registration.demoCallTime,
        demoCallStatus: registration.demoCallStatus,
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
        demoCallDate: json.demoCallDate,
        demoCallTime: json.demoCallTime,
        demoCallStatus: json.demoCallStatus || 'Requested',
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
        demoCallDate: json.demoCallDate,
        demoCallTime: json.demoCallTime,
        demoCallStatus: json.demoCallStatus || 'Requested',
      },
    });
  } catch (error: any) {
    console.error('Error fetching registration request:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Update demo call appointment status and date/time.
 */
export const updateDemoCallStatus = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId || req.params.id;
    const { demoCallStatus, demoCallDate, demoCallTime } = req.body;

    const reg = await TenantRegistrationRequest.findByPk(requestId);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration request not found.' });
    }

    const validStatuses = ['Requested', 'Confirmed', 'Completed', 'Rescheduled', 'Cancelled'];
    if (demoCallStatus && !validStatuses.includes(demoCallStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid demo call status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const updates: any = {};
    if (demoCallStatus) updates.demoCallStatus = demoCallStatus;
    if (demoCallDate) updates.demoCallDate = demoCallDate;
    if (demoCallTime) updates.demoCallTime = demoCallTime;

    await reg.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Demo call details updated successfully.',
      data: {
        requestId: reg.requestId,
        demoCallDate: reg.demoCallDate,
        demoCallTime: reg.demoCallTime,
        demoCallStatus: reg.demoCallStatus,
      },
    });
  } catch (error: any) {
    console.error('Error updating demo call status:', error);
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
    const billingCycle = reg.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
    const tenantSlug = reg.slug || await generateUniqueFleetSlug(reg.displayName || reg.fleetName);

    const approvalNow = new Date();
    // Critical: Free trial dates are NOT initialized at approval time.
    // The 7-day Free Trial starts ONLY when the Fleet Admin sets password and activates their account!
    const rawToken = `act_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry for activation token

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
        planTier: null, // Free trial: No customer-selected paid plan
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
        planTier: null, // Free trial: Internal technical baseline profile applies, no customer-selected paid plan
        status: 'TRIALING',
        vehicleQuota: TRIAL_BASELINE_LIMITS.vehicles,
        driverQuota: TRIAL_BASELINE_LIMITS.drivers,
        companyQuota: TRIAL_BASELINE_LIMITS.companies,
        monthlyTripQuota: TRIAL_BASELINE_LIMITS.trips,
        taxQuota: TRIAL_BASELINE_LIMITS.taxes,
        allowOverage: false,
        monthlyOverageSpendCap: 0,
        billingCycle,
        agreedPrice: 0, // ₹0 Free Trial; no paid subscription invoice generated
        currency: 'INR',
        trialStartDate: null, // Critical: 7-day Free Trial starts ONLY when Fleet Admin sets password and activates account!
        trialEndsAt: null,   // Calculated upon account activation (trialStartDate + 7 days)
        trialDurationDays: 7,
        trialExtensionHistory: [],
        currentPeriodStart: null,
        currentPeriodEnd: null,
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
        reviewedAt: approvalNow,
        tenantId,
        reviewNotes: reviewNotes || 'Application reviewed and approved. Free trial starts upon account activation.',
      }, { transaction: t });
    });

    // 2. Strict Recipient Separation: Dispatch Free Trial activation link to applicant only
    // EVENT 3: SuperAdmin Approves Fleet — sent ONLY to registered applicant / Fleet Admin email
    // Free Trial details ONLY: No paid plans (BASIC, PRO, ENTERPRISE), No pricing/rates, No billing cycle, No plan summary PDF
    const applicantEmail = reg.contactEmail.trim().toLowerCase();
    const activationUrl = `${WEB_BASE_URL}/activate-account?token=${rawToken}`;
    const fleetLoginUrl = getFleetLoginUrl(tenantSlug);

    if (!applicantEmail || !EMAIL_REGEX.test(applicantEmail)) {
      console.error('[Approval] Cannot dispatch activation email: missing or invalid contactEmail on request', reg.requestId);
    } else {
      await sendNotification({
        channel: 'EMAIL',
        recipient: applicantEmail,
        templateCode: 'TENANT_ADMIN_ACTIVATION_LINK',
        subject: `CABZ – Your Fleet Registration Is Approved | Set Password to Start 7-Day Free Trial`,
        body: `Dear ${reg.ownerName},\n\n` +
          `Congratulations! Your fleet registration application for ${reg.fleetName} has been approved by the platform administrator.\n\n` +
          `Your 7-Day Free Trial with full operational access to all CABZ mobility features will start as soon as you complete your password setup and activate your account.\n\n` +
          `7-DAY FREE TRIAL ENTITLEMENTS:\n` +
          `• Account Status: Pending Account Activation\n` +
          `• Free Trial Duration: 7 Full Calendar Days (starts upon password setup)\n` +
          `• Trial Start Date & Time: Awaiting Account Activation\n` +
          `• Trial End Date & Time: To be calculated automatically from your exact activation timestamp\n` +
          `• Validity: 100% full access to all fleet mobility features (vehicles, drivers, companies, bookings, dispatch & invoicing)\n` +
          `• Selected Plan: None (₹0 upfront, choose your plan anytime before or at trial completion)\n\n` +
          `EXPLORE & OPERATE WITHOUT RESTRICTIONS:\n` +
          `During your 7-day free trial, you can explore and operate all platform features without restriction. No trial days are consumed while waiting for your account activation.\n\n` +
          `STEP 1 — ACTIVATE YOUR ACCOUNT & START YOUR TRIAL:\n` +
          `Click the secure activation link below to set your administrator password:\n${activationUrl}\n` +
          `(Note: This link will expire in 24 hours. Never share this link with anyone.)\n\n` +
          `STEP 2 — DEDICATED FLEET LOGIN PORTAL:\n` +
          `Access your branded fleet operator dashboard at your unique URL:\n${fleetLoginUrl}\n\n` +
          `Best regards,\nCABZ SaaS Platform Team`,
        referenceEntity: 'TENANT',
        referenceId: tenantId,
        metadata: {
          tenantId,
          fleetName: reg.fleetName,
          ownerName: reg.ownerName,
          trialStartDate: 'Awaiting Account Activation',
          trialEndDate: 'To be calculated after activation',
          trialEndsAt: null,
          trialDurationDays: '7',
          trialStatus: 'AWAITING_ACTIVATION',
          approvalStatus: 'Approved',
          activationUrl,
          loginUrl: fleetLoginUrl,
          fleetLoginUrl,
          actionText: 'Set Up Administrator Password & Start Trial',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application approved successfully. Activation link dispatched to Fleet Admin to set password and start 7-day free trial.',
      tenantId,
      data: {
        tenantId,
        fleetName: reg.fleetName,
        tenantSlug,
        activationUrl,
        fleetLoginUrl,
        trialStatus: 'AWAITING_ACTIVATION',
        trialStartDate: null,
        trialEndsAt: null,
        status: 'APPROVED',
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

    const hasPaidPlan = Boolean(record.tenant?.planTier && ['BASIC', 'PRO', 'ENTERPRISE'].includes(record.tenant.planTier));
    const effectivePlan = hasPaidPlan ? record.tenant!.planTier : 'FREE TRIAL';

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
        plan: effectivePlan,
        planTier: hasPaidPlan ? record.tenant!.planTier : 'FREE_TRIAL',
        isFreeTrial: !hasPaidPlan,
        trialDuration: '7 Days',
        trialDurationDays: 7,
        startCondition: 'Starts upon account activation',
        upfrontPayment: '₹0 / Free',
        accessLevel: 'Full Operational Access',
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

    // Critical: The 7-day Free Trial starts ONLY AT THIS EXACT MOMENT (successful password setup & account activation).
    // Idempotency: If trial has already started, do not overwrite trialStartDate or trialEndsAt.
    const activationNow = new Date();
    const trialEndsAt = new Date(activationNow.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sub = await TenantSubscription.findOne({ where: { tenantId: record.tenantId } });
    if (sub && !sub.trialStartDate) {
      await sub.update({
        trialStartDate: activationNow,
        trialEndsAt: trialEndsAt,
        trialDurationDays: 7,
        status: 'TRIALING',
        planTier: null,
        agreedPrice: 0,
        currentPeriodStart: activationNow,
        currentPeriodEnd: trialEndsAt,
      });
    }

    // Mark token as used
    await record.update({ usedAt: activationNow });

    // Send confirmation welcome notification with exact trial validity
    const loginUrl = `${WEB_BASE_URL}/login`;
    const formattedActivationStart = activationNow.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const formattedActivationEnd = trialEndsAt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    await sendNotification({
      channel: 'EMAIL',
      recipient: record.adminEmail,
      templateCode: 'ACCOUNT_ACTIVATED',
      subject: `CABZ – Account Activated & 7-Day Free Trial Started`,
      body: `Dear ${record.adminName || 'Fleet Operator'},\n\n` +
        `Your administrator password has been set successfully and your account is now active!\n\n` +
        `YOUR 7-DAY FREE TRIAL HAS NOW STARTED:\n` +
        `• Status: FREE TRIAL ACTIVE\n` +
        `• Trial Start: ${formattedActivationStart} (IST)\n` +
        `• Trial Expiry: ${formattedActivationEnd} (IST)\n` +
        `• Duration: 7 Full Calendar Days\n` +
        `• Operational Access: Unrestricted access to add vehicles, onboard drivers, register client companies, dispatch bookings, and issue invoices.\n\n` +
        `Sign In URL: ${loginUrl}\n` +
        `Login Email: ${record.adminEmail}\n\n` +
        `Best regards,\nCABZ SaaS Platform Team`,
      referenceEntity: 'TENANT',
      referenceId: record.tenantId,
      metadata: {
        loginUrl,
        actionText: 'Sign In to Fleet Portal',
        trialStartDate: formattedActivationStart,
        trialEndDate: formattedActivationEnd,
        trialEndsAt: trialEndsAt.toISOString(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Password set successfully! Your account is active and your 7-day free trial has started. Please sign in.',
      data: {
        email: record.adminEmail,
        tenantId: record.tenantId,
        loginUrl,
        trialStartDate: activationNow,
        trialEndsAt,
        trialDurationDays: 7,
        subscriptionStatus: 'TRIALING',
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


