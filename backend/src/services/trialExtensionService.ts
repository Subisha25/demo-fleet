import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { TrialExtensionRequest } from '../models/trialExtensionRequest';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { sendNotification, getSuperAdminEmail } from './notificationService';

/**
 * Fleet Admin: Submit a request for additional Free Trial days.
 * POST /api/subscriptions/trial-extension/request
 */
export const requestTrialExtension = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId;

    if (!tenantId || tenantId === ROOT_TENANT_ID) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tenant context. Root administrator cannot request trial extensions.',
      });
    }

    const { requestedDays, reason } = req.body;
    const days = parseInt(String(requestedDays), 10);

    if (!days || isNaN(days) || days <= 0 || days > 60) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid number of requested trial days (between 1 and 60 days).',
      });
    }

    const cleanReason = (reason || '').trim();
    if (!cleanReason || cleanReason.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear reason / business justification for the extension request (minimum 5 characters).',
      });
    }

    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant account not found.',
      });
    }

    const sub = await TenantSubscription.findOne({ where: { tenantId } });
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: 'Subscription record not found for tenant.',
      });
    }

    // Check if there is already an active PENDING request
    const existingPending = await TrialExtensionRequest.findOne({
      where: {
        tenantId,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending trial extension request under review by the platform administrator.',
        data: {
          requestId: existingPending.requestId,
          requestedDays: existingPending.requestedDays,
          requestedAt: existingPending.requestedAt,
          status: 'PENDING',
        },
      });
    }

    const now = new Date();
    const existingExpiry = sub.trialEndsAt
      ? new Date(sub.trialEndsAt)
      : (sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : now);

    const newRequest = await TrialExtensionRequest.create({
      requestId: uuidv4(),
      tenantId,
      requestedDays: days,
      approvedDays: null,
      reason: cleanReason,
      status: 'PENDING',
      requestedAt: now,
      previousExpiry: existingExpiry,
      newExpiry: null,
      extensionType: null,
      adminNotes: null,
    });

    // Dispatch notification to SuperAdmin
    try {
      const superAdminEmail = await getSuperAdminEmail();
      const formattedExpiry = existingExpiry.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });

      await sendNotification({
        channel: 'EMAIL',
        recipient: superAdminEmail,
        templateCode: 'TRIAL_EXTENSION_REQUESTED_SUPERADMIN',
        subject: `CABZ – New Free Trial Extension Request: ${tenant.name}`,
        body: `Dear Platform Administrator,\n\n` +
          `A new Free Trial Extension Request has been submitted for your review.\n\n` +
          `FLEET OPERATOR DETAILS:\n` +
          `• Fleet Name: ${tenant.name}\n` +
          `• Contact Email: ${tenant.contactEmail || 'N/A'}\n` +
          `• Contact Phone: ${tenant.contactPhone || 'N/A'}\n` +
          `• Current Trial Expiry: ${formattedExpiry}\n` +
          `• Requested Extension: ${days} Additional Days\n` +
          `• Reason / Justification:\n"${cleanReason}"\n\n` +
          `Please review and approve or reject this request in the SuperAdmin Free Trial Management portal:\n` +
          `/admin/trial-management\n\n` +
          `Best regards,\nCABZ SaaS Automation`,
        referenceEntity: 'TENANT',
        referenceId: tenantId,
        metadata: {
          tenantId,
          fleetName: tenant.name,
          requestedDays: String(days),
          reason: cleanReason,
          actionText: 'Review Extension Request',
        },
      });
    } catch (notifErr) {
      console.warn('[TrialExtensionService] Notice: SuperAdmin notification dispatch warning:', notifErr);
    }

    return res.status(201).json({
      success: true,
      message: `Your request for ${days} additional free trial days has been submitted successfully and is pending SuperAdmin review.`,
      data: newRequest,
    });
  } catch (error: any) {
    console.error('Error submitting trial extension request:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Fleet Admin: Get trial extension request history for current tenant.
 * GET /api/subscriptions/trial-extension/history
 */
export const getTenantTrialExtensionHistory = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Missing tenant context.' });
    }

    const requests = await TrialExtensionRequest.findAll({
      where: { tenantId },
      order: [['requestedAt', 'DESC']],
    });

    const pendingRequest = requests.find((r) => r.status === 'PENDING') || null;

    return res.status(200).json({
      success: true,
      data: {
        requests,
        pendingRequest,
        totalRequests: requests.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching tenant trial extension history:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Get all trial extension requests with filters.
 * GET /api/admin/trial-extensions
 */
export const getSuperAdminTrialExtensionRequests = async (req: Request, res: Response) => {
  try {
    const statusFilter = (req.query.status as string) || 'ALL';
    const search = ((req.query.search as string) || '').trim().toLowerCase();

    const whereClause: any = {};
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter.toUpperCase();
    }

    const requests = await TrialExtensionRequest.findAll({
      where: whereClause,
      include: [
        {
          model: Tenant,
          attributes: ['tenantId', 'name', 'displayName', 'code', 'slug', 'contactEmail', 'contactPhone', 'legalName', 'status'],
        },
      ],
      order: [
        ['status', 'ASC'], // PENDING first
        ['requestedAt', 'DESC'],
      ],
    });

    let filtered = requests;
    if (search) {
      filtered = requests.filter((r: any) => {
        const fleetName = (r.tenant?.name || '').toLowerCase();
        const contactEmail = (r.tenant?.contactEmail || '').toLowerCase();
        const code = (r.tenant?.code || '').toLowerCase();
        const reason = (r.reason || '').toLowerCase();
        return (
          fleetName.includes(search) ||
          contactEmail.includes(search) ||
          code.includes(search) ||
          reason.includes(search)
        );
      });
    }

    const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
    const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
    const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

    return res.status(200).json({
      success: true,
      data: {
        requests: filtered,
        counts: {
          total: requests.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching trial extension requests for admin:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Free Trial Management Overview across all fleets.
 * GET /api/admin/trial-management
 */
export const getSuperAdminTrialManagementOverview = async (req: Request, res: Response) => {
  try {
    const tenants = await Tenant.findAll({
      where: {
        tenantId: { [Op.ne]: ROOT_TENANT_ID },
      },
      include: [
        {
          model: TenantSubscription,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const now = new Date();

    // Query all extension requests grouped by tenant
    const allRequests = await TrialExtensionRequest.findAll({
      order: [['requestedAt', 'DESC']],
    });

    const overview = tenants.map((t: any) => {
      const sub = t.subscription;
      const trialEnd = sub?.trialEndsAt ? new Date(sub.trialEndsAt) : (sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null);
      const isTrialValid = trialEnd ? trialEnd.getTime() >= now.getTime() : false;
      const isTrialing = sub?.status === 'TRIALING';

      const originalDays = 7;
      const totalDays = Number(sub?.trialDurationDays) || 7;
      const extendedDays = Math.max(0, totalDays - originalDays);

      const remainingMs = trialEnd ? Math.max(0, trialEnd.getTime() - now.getTime()) : 0;
      const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

      const tenantRequests = allRequests.filter((r) => r.tenantId === t.tenantId);
      const pendingRequest = tenantRequests.find((r) => r.status === 'PENDING') || null;

      let displayStatus = 'UNKNOWN';
      if (sub?.status === 'ACTIVE') {
        displayStatus = 'PAID_ACTIVE';
      } else if (isTrialing && isTrialValid) {
        displayStatus = 'TRIAL_ACTIVE';
      } else if (isTrialing && !isTrialValid) {
        displayStatus = 'TRIAL_EXPIRED';
      } else if (sub?.status === 'PAST_DUE') {
        displayStatus = 'PAST_DUE';
      } else {
        displayStatus = sub?.status || 'TRIAL_EXPIRED';
      }

      return {
        tenantId: t.tenantId,
        fleetName: t.name,
        displayName: t.displayName || t.name,
        code: t.code,
        slug: t.slug,
        contactEmail: t.contactEmail,
        contactPhone: t.contactPhone,
        registeredAt: t.createdAt,
        planTier: sub?.planTier || 'PRO',
        status: sub?.status || 'TRIALING',
        displayStatus,
        trialStartDate: sub?.trialStartDate || t.createdAt,
        trialEndsAt: trialEnd,
        trialDurationDays: totalDays,
        originalTrialDays: originalDays,
        extendedTrialDays: extendedDays,
        remainingDays: isTrialValid ? remainingDays : 0,
        isTrialValid,
        hasPendingRequest: !!pendingRequest,
        pendingRequest: pendingRequest ? {
          requestId: pendingRequest.requestId,
          requestedDays: pendingRequest.requestedDays,
          reason: pendingRequest.reason,
          requestedAt: pendingRequest.requestedAt,
        } : null,
        extensionCount: tenantRequests.filter((r) => r.status === 'APPROVED').length,
        totalRequestsCount: tenantRequests.length,
      };
    });

    const activeTrialsCount = overview.filter((o) => o.displayStatus === 'TRIAL_ACTIVE').length;
    const expiredTrialsCount = overview.filter((o) => o.displayStatus === 'TRIAL_EXPIRED').length;
    const pendingRequestsCount = overview.filter((o) => o.hasPendingRequest).length;
    const paidSubscriptionsCount = overview.filter((o) => o.displayStatus === 'PAID_ACTIVE').length;

    return res.status(200).json({
      success: true,
      data: {
        fleets: overview,
        metrics: {
          totalFleets: overview.length,
          activeTrials: activeTrialsCount,
          expiredTrials: expiredTrialsCount,
          pendingRequests: pendingRequestsCount,
          paidSubscriptions: paidSubscriptionsCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching trial management overview:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Approve a trial extension request.
 * POST /api/admin/trial-extensions/:requestId/approve
 */
export const approveTrialExtensionRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { approvedDays: customApprovedDays, adminNotes } = req.body;

    const request = await TrialExtensionRequest.findByPk(requestId, {
      include: [{ model: Tenant }],
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Trial extension request not found.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()}. Cannot process again.`,
      });
    }

    const tenant = request.tenant;
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const sub = await TenantSubscription.findOne({ where: { tenantId: request.tenantId } });
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription record not found.' });
    }

    // Determine approved days (either customized or the originally requested days)
    const days = customApprovedDays ? parseInt(String(customApprovedDays), 10) : request.requestedDays;
    if (!days || isNaN(days) || days <= 0 || days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approved days (must be between 1 and 365).',
      });
    }

    const now = new Date();
    const existingExpiry = sub.trialEndsAt
      ? new Date(sub.trialEndsAt)
      : (sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : now);

    // If existing trial is still active, extend from existing expiry date
    // If trial is already expired, extend from right now!
    const baseTime = existingExpiry.getTime() < now.getTime() ? now.getTime() : existingExpiry.getTime();
    const newExpiry = new Date(baseTime + days * 24 * 60 * 60 * 1000);

    const reviewer = (req as any).user?.username || (req as any).user?.userId || 'SuperAdmin';

    // 1. Update TrialExtensionRequest record
    await request.update({
      approvedDays: days,
      status: 'APPROVED',
      reviewedBy: reviewer,
      reviewedAt: now,
      previousExpiry: existingExpiry,
      newExpiry,
      extensionType: 'REQUEST_APPROVED',
      adminNotes: adminNotes ? String(adminNotes).trim() : 'Extension request approved by SuperAdmin',
    });

    // 2. Update TenantSubscription (Task 7: authoritative trial status updated, operational access restored immediately!)
    const currentHistory = Array.isArray(sub.trialExtensionHistory) ? sub.trialExtensionHistory : [];
    const newHistoryEntry = {
      requestId: request.requestId,
      extendedBy: reviewer,
      extendedAt: now,
      daysAdded: days,
      previousExpiry: existingExpiry,
      newExpiry,
      reason: request.reason,
      adminNotes: adminNotes || '',
      extensionType: 'REQUEST_APPROVED',
    };
    const newDuration = (Number(sub.trialDurationDays) || 7) + days;

    await sub.update({
      trialEndsAt: newExpiry,
      currentPeriodEnd: newExpiry,
      trialDurationDays: newDuration,
      trialExtensionHistory: [...currentHistory, newHistoryEntry],
      status: 'TRIALING',
    });

    // 3. Dispatch confirmation notification to Fleet Admin (Task 11)
    try {
      if (tenant.contactEmail && tenant.contactEmail.includes('@')) {
        const formattedNewExpiry = newExpiry.toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
        });

        await sendNotification({
          channel: 'EMAIL',
          recipient: tenant.contactEmail,
          templateCode: 'TRIAL_EXTENSION_APPROVED',
          subject: `CABZ – Your Free Trial Has Been Extended | ${days} Additional Days Granted`,
          body: `Dear ${tenant.name} Administrator,\n\n` +
            `Great news! Your request for additional Free Trial days has been APPROVED by the platform administrator.\n\n` +
            `TRIAL EXTENSION DETAILS:\n` +
            `• Fleet Name: ${tenant.name}\n` +
            `• Additional Days Granted: ${days} Days\n` +
            `• New Free Trial Expiry: ${formattedNewExpiry}\n` +
            `• Trial Status: FREE TRIAL ACTIVE\n\n` +
            (adminNotes ? `Admin Note: ${adminNotes}\n\n` : '') +
            `Your full operational access across CABZ (bookings, dispatch, vehicles, drivers & corporate accounts) is active and ready to use.\n\n` +
            `Log in to your fleet portal anytime:\n` +
            `/login\n\n` +
            `Best regards,\nCABZ SaaS Platform Team`,
          referenceEntity: 'TENANT',
          referenceId: tenant.tenantId,
          metadata: {
            tenantId: tenant.tenantId,
            fleetName: tenant.name,
            approvedDays: String(days),
            newExpiry: formattedNewExpiry,
            adminNotes: adminNotes || '',
            actionText: 'Open Fleet Portal',
          },
        });
      }
    } catch (notifErr) {
      console.warn('[TrialExtensionService] Approval email dispatch warning:', notifErr);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully approved request and extended free trial by ${days} days for ${tenant.name}. Access is restored immediately.`,
      data: {
        request,
        newExpiry,
        daysAdded: days,
        status: 'APPROVED',
      },
    });
  } catch (error: any) {
    console.error('Error approving trial extension request:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Reject a trial extension request.
 * POST /api/admin/trial-extensions/:requestId/reject
 */
export const rejectTrialExtensionRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { reason, adminNotes } = req.body;

    const rejectionReason = (reason || adminNotes || '').trim();
    if (!rejectionReason || rejectionReason.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear reason for rejecting the extension request (minimum 5 characters).',
      });
    }

    const request = await TrialExtensionRequest.findByPk(requestId, {
      include: [{ model: Tenant }],
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Trial extension request not found.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()}. Cannot process again.`,
      });
    }

    const reviewer = (req as any).user?.username || (req as any).user?.userId || 'SuperAdmin';
    const now = new Date();

    await request.update({
      status: 'REJECTED',
      reviewedBy: reviewer,
      reviewedAt: now,
      extensionType: 'REJECTED',
      adminNotes: rejectionReason,
    });

    const tenant = request.tenant;

    // Dispatch rejection notification to Fleet Admin (Task 11)
    try {
      if (tenant?.contactEmail && tenant.contactEmail.includes('@')) {
        await sendNotification({
          channel: 'EMAIL',
          recipient: tenant.contactEmail,
          templateCode: 'TRIAL_EXTENSION_REJECTED',
          subject: `CABZ – Free Trial Extension Request Update: ${tenant.name}`,
          body: `Dear ${tenant.name} Administrator,\n\n` +
            `Thank you for using the CABZ Smart Fleet Mobility platform.\n\n` +
            `Regarding your recent request for additional Free Trial days: after review, your request could not be approved at this time.\n\n` +
            `Reason:\n${rejectionReason}\n\n` +
            `To continue operating your fleet without interruption, you can select and activate a paid subscription plan anytime from your dashboard:\n` +
            `/admin/billing\n\n` +
            `If you have questions or need assistance, our support team is available at support@cabz.com.\n\n` +
            `Best regards,\nCABZ SaaS Platform Team`,
          referenceEntity: 'TENANT',
          referenceId: tenant.tenantId,
          metadata: {
            tenantId: tenant.tenantId,
            fleetName: tenant.name,
            rejectionReason,
            actionText: 'Choose Subscription Plan',
          },
        });
      }
    } catch (notifErr) {
      console.warn('[TrialExtensionService] Rejection email dispatch warning:', notifErr);
    }

    return res.status(200).json({
      success: true,
      message: `Trial extension request for ${tenant?.name || 'fleet'} has been rejected.`,
      data: request,
    });
  } catch (error: any) {
    console.error('Error rejecting trial extension request:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * SuperAdmin: Grant trial extension directly to any fleet (Manual SuperAdmin Extension).
 * POST /api/admin/trial-management/:tenantId/extend
 */
export const manualExtendTrial = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { additionalDays, reason, adminNotes } = req.body;

    const days = parseInt(String(additionalDays), 10);
    if (!days || isNaN(days) || days <= 0 || days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid number of trial extension days (between 1 and 365).',
      });
    }

    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const sub = await TenantSubscription.findOne({ where: { tenantId } });
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription record not found for tenant.' });
    }

    const now = new Date();
    const existingExpiry = sub.trialEndsAt
      ? new Date(sub.trialEndsAt)
      : (sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : now);

    const baseTime = existingExpiry.getTime() < now.getTime() ? now.getTime() : existingExpiry.getTime();
    const newExpiry = new Date(baseTime + days * 24 * 60 * 60 * 1000);
    const reviewer = (req as any).user?.username || (req as any).user?.userId || 'SuperAdmin';
    const extensionReason = reason ? String(reason).trim() : (adminNotes ? String(adminNotes).trim() : 'Free trial extension granted directly by SuperAdmin');

    // 1. Create audit record in TrialExtensionRequest
    const auditRecord = await TrialExtensionRequest.create({
      requestId: uuidv4(),
      tenantId,
      requestedDays: days,
      approvedDays: days,
      reason: extensionReason,
      status: 'APPROVED',
      requestedAt: now,
      reviewedBy: reviewer,
      reviewedAt: now,
      previousExpiry: existingExpiry,
      newExpiry,
      extensionType: 'MANUAL_SUPERADMIN',
      adminNotes: extensionReason,
    });

    // 2. Update TenantSubscription
    const currentHistory = Array.isArray(sub.trialExtensionHistory) ? sub.trialExtensionHistory : [];
    const newHistoryEntry = {
      requestId: auditRecord.requestId,
      extendedBy: reviewer,
      extendedAt: now,
      daysAdded: days,
      previousExpiry: existingExpiry,
      newExpiry,
      reason: extensionReason,
      extensionType: 'MANUAL_SUPERADMIN',
    };
    const newDuration = (Number(sub.trialDurationDays) || 7) + days;

    await sub.update({
      trialEndsAt: newExpiry,
      currentPeriodEnd: newExpiry,
      trialDurationDays: newDuration,
      trialExtensionHistory: [...currentHistory, newHistoryEntry],
      status: 'TRIALING',
    });

    // 3. Dispatch email notification to Fleet Admin
    try {
      if (tenant.contactEmail && tenant.contactEmail.includes('@')) {
        const formattedNewExpiry = newExpiry.toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
        });

        await sendNotification({
          channel: 'EMAIL',
          recipient: tenant.contactEmail,
          templateCode: 'TRIAL_EXTENSION_APPROVED',
          subject: `CABZ – Your Free Trial Has Been Extended | ${days} Additional Days Granted`,
          body: `Dear ${tenant.name} Administrator,\n\n` +
            `The platform administrator has granted your fleet an additional ${days} days of Free Trial access.\n\n` +
            `TRIAL EXTENSION DETAILS:\n` +
            `• Fleet Name: ${tenant.name}\n` +
            `• Additional Days Granted: ${days} Days\n` +
            `• New Free Trial Expiry: ${formattedNewExpiry}\n` +
            `• Trial Status: FREE TRIAL ACTIVE\n\n` +
            `Your full operational access across CABZ is active.\n\n` +
            `Best regards,\nCABZ SaaS Platform Team`,
          referenceEntity: 'TENANT',
          referenceId: tenant.tenantId,
          metadata: {
            tenantId: tenant.tenantId,
            fleetName: tenant.name,
            approvedDays: String(days),
            newExpiry: formattedNewExpiry,
            actionText: 'Open Fleet Portal',
          },
        });
      }
    } catch (notifErr) {
      console.warn('[TrialExtensionService] Manual extension email dispatch warning:', notifErr);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully extended trial by ${days} days for ${tenant.name}. New expiry is ${newExpiry.toLocaleDateString('en-IN')}.`,
      data: {
        tenantId,
        fleetName: tenant.name,
        previousExpiry: existingExpiry,
        newExpiry,
        daysAdded: days,
        originalTrialDays: 7,
        extendedTrialDays: newDuration - 7,
        totalTrialDays: newDuration,
        trialStatus: 'TRIAL_ACTIVE',
        auditRecord,
      },
    });
  } catch (error: any) {
    console.error('Error granting manual trial extension:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
