import { Router, Request, Response } from 'express';
import {
  getAllTenants,
  createTenant,
  getTenantById,
  updateTenantSubscription,
  getCurrentTenantProfile,
  updateCurrentTenantBranding,
  getSubscriptionPlans,
  renewTenantSubscription,
  getFleetDashboardOverview,
  uploadCurrentTenantLogo,
  getRegistrationNotifications,
  markRegistrationNotificationRead,
  markAllRegistrationNotificationsRead,
} from '../services/tenantService';
import { uploadFleetLogo } from '../middleware/uploadConfig';
import { getCompanyPolicy, upsertCompanyPolicy } from '../services/policyService';
import {
  submitFleetRegistration,
  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  resendActivationLink,
  verifyActivationToken,
  completeAccountActivation,
  diagnoseEmailEndpoint,
  sendTestEmailEndpoint,
} from '../services/registrationService';
import {
  createSubscriptionCheckout,
  verifySubscriptionPayment,
  getTenantSubscriptionInvoices,
} from '../services/subscriptionBillingService';
import {
  runLifecycleEvaluation,
  getLifecycleStatus,
} from '../services/subscriptionLifecycleService';
import { authMiddleware, requireSuperAdmin } from '../middleware/authMiddleware';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';

const router = Router();

// =============================================================================
// PUBLIC SAAS ENDPOINTS (Self-Service Registration & Account Activation)
// =============================================================================
router.post('/register', submitFleetRegistration);
router.post('/register-fleet', submitFleetRegistration);
router.post('/public/register-fleet', submitFleetRegistration);
router.get('/subscription/plans', getSubscriptionPlans);
router.get('/activation/verify/:token', verifyActivationToken);
router.post('/activation/verify', verifyActivationToken);
router.get('/verify-activation-token', verifyActivationToken);
router.post('/activation/complete', completeAccountActivation);
router.post('/activate-account', completeAccountActivation);

// =============================================================================
// SUPERADMIN REGISTRATION REVIEW & ONBOARDING QUEUE
// =============================================================================
router.get('/admin/registrations', authMiddleware, requireSuperAdmin, getRegistrationRequests);
router.get('/admin/registrations/:requestId', authMiddleware, requireSuperAdmin, getRegistrationRequestById);
router.post('/admin/registrations/:requestId/approve', authMiddleware, requireSuperAdmin, approveRegistrationRequest);
router.post('/admin/registrations/:requestId/reject', authMiddleware, requireSuperAdmin, rejectRegistrationRequest);
router.post('/admin/registrations/:requestId/resend-activation', authMiddleware, requireSuperAdmin, resendActivationLink);
router.post('/admin/registrations/:requestId/resend-token', authMiddleware, requireSuperAdmin, resendActivationLink);

// Direct aliases for /api/admin mounts
router.get('/registrations', authMiddleware, requireSuperAdmin, getRegistrationRequests);
router.get('/registrations/:requestId', authMiddleware, requireSuperAdmin, getRegistrationRequestById);
router.post('/registrations/:requestId/approve', authMiddleware, requireSuperAdmin, approveRegistrationRequest);
router.post('/registrations/:requestId/reject', authMiddleware, requireSuperAdmin, rejectRegistrationRequest);
router.post('/registrations/:requestId/resend-activation', authMiddleware, requireSuperAdmin, resendActivationLink);
router.post('/registrations/:requestId/resend-token', authMiddleware, requireSuperAdmin, resendActivationLink);

// =============================================================================
// SUBSCRIPTION CHECKOUT & INVOICING (Authenticated Tenant Operator)
// =============================================================================
router.post('/subscription/checkout', authMiddleware, createSubscriptionCheckout);
router.post('/subscription/verify-payment', authMiddleware, verifySubscriptionPayment);
router.get('/subscription/invoices', authMiddleware, getTenantSubscriptionInvoices);

// Billing desk aliases for /api/admin/billing and /api/tenants/billing
router.post('/billing/checkout', authMiddleware, createSubscriptionCheckout);
router.post('/billing/verify-payment', authMiddleware, verifySubscriptionPayment);
router.get('/billing/invoices', authMiddleware, getTenantSubscriptionInvoices);
router.post('/billing/run-lifecycle-check', authMiddleware, runLifecycleEvaluation);

// =============================================================================
// SUBSCRIPTION LIFECYCLE SCHEDULER & HEALTH STATUS
// =============================================================================
router.post('/admin/subscription-lifecycle/run', authMiddleware, requireSuperAdmin, runLifecycleEvaluation);
router.get('/admin/subscription-lifecycle/status', authMiddleware, requireSuperAdmin, getLifecycleStatus);

// =============================================================================
// TENANT PROFILE, DASHBOARD STATS & BRANDING (Authenticated Staff)
// =============================================================================
router.get('/current/profile', authMiddleware, getCurrentTenantProfile);
router.put('/current/branding', authMiddleware, updateCurrentTenantBranding);
router.post('/current/logo', authMiddleware, uploadFleetLogo.single('logo'), uploadCurrentTenantLogo);
router.put('/current/logo', authMiddleware, uploadFleetLogo.single('logo'), uploadCurrentTenantLogo);
router.get('/dashboard/stats', authMiddleware, getFleetDashboardOverview);
router.get('/dashboard/overview', authMiddleware, getFleetDashboardOverview);

// In-App Registration Notifications (SuperAdmin)
router.get('/admin/notifications', authMiddleware, requireSuperAdmin, getRegistrationNotifications);
router.post('/admin/notifications/mark-read/:requestId', authMiddleware, requireSuperAdmin, markRegistrationNotificationRead);
router.post('/admin/notifications/mark-all-read', authMiddleware, requireSuperAdmin, markAllRegistrationNotificationsRead);
router.get('/notifications', authMiddleware, requireSuperAdmin, getRegistrationNotifications);
router.post('/notifications/mark-read/:requestId', authMiddleware, requireSuperAdmin, markRegistrationNotificationRead);
router.post('/notifications/mark-all-read', authMiddleware, requireSuperAdmin, markAllRegistrationNotificationsRead);

// Notification Diagnostics (SuperAdmin / Dev)
router.get('/admin/notifications/diagnose-smtp', authMiddleware, requireSuperAdmin, diagnoseEmailEndpoint);
router.post('/admin/notifications/test-email', authMiddleware, requireSuperAdmin, sendTestEmailEndpoint);


// =============================================================================
// CORPORATE CLIENT DYNAMIC POLICY ENDPOINTS
// =============================================================================
const handleGetPolicy = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const policy = await getCompanyPolicy(companyId);
    return res.status(200).json({ success: true, policy, data: policy });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const handleUpsertPolicy = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || ROOT_TENANT_ID;
    const policy = await upsertCompanyPolicy(companyId, tenantId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Company policy updated successfully.',
      policy,
      data: policy,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

router.get('/policy/:companyId', authMiddleware, handleGetPolicy);
router.get('/policies/:companyId', authMiddleware, handleGetPolicy);
router.put('/policy/:companyId', authMiddleware, handleUpsertPolicy);
router.put('/policies/:companyId', authMiddleware, handleUpsertPolicy);
router.post('/policy/:companyId', authMiddleware, handleUpsertPolicy);
router.post('/policies/:companyId', authMiddleware, handleUpsertPolicy);

// =============================================================================
// PLATFORM TENANT MANAGEMENT (SuperAdmin)
// =============================================================================
router.get('/', authMiddleware, requireSuperAdmin, getAllTenants);
router.post('/', authMiddleware, requireSuperAdmin, createTenant);
router.get('/:tenantId', authMiddleware, getTenantById);
router.put('/:tenantId/subscription', authMiddleware, requireSuperAdmin, updateTenantSubscription);
router.post('/:tenantId/subscription/renew', authMiddleware, requireSuperAdmin, renewTenantSubscription);

export default router;
