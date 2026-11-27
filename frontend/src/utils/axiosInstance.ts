import axios from 'axios';
import config from "../config/config"; 
const BASE_URL = config.baseurl.apibaseurl;

export const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('/register-fleet') ||
    lower.includes('/public/register') ||
    lower.includes('/tenants/register') ||
    lower.includes('/activation') ||
    lower.includes('/verify-activation-token') ||
    lower.includes('/activate-account') ||
    lower.includes('/public/booking') ||
    lower.includes('/auth/login') ||
    lower.includes('/auth/emplogin') ||
    lower.includes('/auth/fleet-login') ||
    lower.includes('/auth/userlogin') ||
    lower.includes('/auth/vendorlogin') ||
    lower.includes('/auth/companylogin') ||
    lower.includes('/auth/send-otp') ||
    lower.includes('/auth/verify-otp') ||
    lower.includes('/auth/resend-otp') ||
    lower.includes('/auth/forgetpassword') ||
    lower.includes('/auth/forgot-password') ||
    lower.includes('/public/login') ||
    lower.includes('/public/demo-session') ||
    lower.includes('/demo-session') ||
    lower.includes('/public/contact-info') ||
    lower.includes('/contact-info') ||
    lower.includes('/public/slug') ||
    lower.includes('/public/fleet-by-slug') ||
    lower.includes('/subscription/plans') ||
    lower.includes('/plan-summary')
  );
};

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (req) => {
    const isPublic = isPublicEndpoint(req.url);

    const token = localStorage.getItem('token');
    let isDemoToken = false;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.isDemo || payload?.role === 'demo' || payload?.tenantId === 'demo-tenant') {
          isDemoToken = true;
        }
      } catch {}
    }

    // Attach Authorization and X-Tenant-ID for authenticated requests
    // DO NOT attach stale demo token to public endpoints!
    if (token && req.headers && (!isPublic || !isDemoToken)) {
      req.headers['Authorization'] = `Bearer ${token}`;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.tenantId && payload.role !== 'superadmin' && payload.role !== 'SUPERADMIN' && !isDemoToken) {
          req.headers['X-Tenant-ID'] = payload.tenantId;
          localStorage.setItem('tenantId', payload.tenantId);
          return req;
        }
      } catch {}
    }

    const tenantId = localStorage.getItem('tenantId');
    if (tenantId && req.headers && (!isPublic || tenantId !== 'demo-tenant')) {
      req.headers['X-Tenant-ID'] = tenantId;
    }

    const isDemo = localStorage.getItem('isDemoMode') === 'true' ||
      localStorage.getItem('isDemoView') === 'true' ||
      localStorage.getItem('role') === 'demo';

    // NEVER attach demo headers to public onboarding or auth endpoints!
    if (isDemo && !isPublic && req.headers) {
      req.headers['X-Demo-Mode'] = 'true';
      req.headers['X-Demo-View'] = 'true';
      if (!req.headers['X-Tenant-ID']) {
        req.headers['X-Tenant-ID'] = 'demo-tenant';
      }
    }

    return req;
  },
);

// Response interceptor to catch entitlement and subscription lock responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const data = error.response.data;
      const isPublic = isPublicEndpoint(error.config?.url);

      // Handle Demo View read-only response (never for public endpoints)
      if (!isPublic && (data?.code === 'DEMO_MODE_READ_ONLY' || data?.isDemoReadOnly)) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('cabz:demo_read_only', {
              detail: {
                message: data?.message || 'Demo Preview is read-only. This action is unavailable.',
              },
            })
          );
        }
        return Promise.reject(error);
      }
      if (
        !isPublic && (
        data?.code === 'QUOTA_EXCEEDED' ||
        data?.code === 'RESTRICTED_FREE_ACCESS' ||
        data?.code === 'SUBSCRIPTION_LOCKED' ||
        data?.code === 'SUBSCRIPTION_EXPIRED' ||
        data?.code === 'SUBSCRIPTION_PAYMENT_REQUIRED' ||
        data?.subscriptionRequired ||
        data?.requiresUpgrade ||
        data?.requiresPayment)
      ) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('fleetflow:subscription_required', {
              detail: {
                title:
                  data.code === 'SUBSCRIPTION_EXPIRED'
                    ? 'Subscription Expired'
                    : data.code === 'SUBSCRIPTION_PAYMENT_REQUIRED'
                    ? 'Payment Required to Activate Fleet'
                    : 'Subscription Required',
                message: data.message,
                isExpired: data.code === 'SUBSCRIPTION_EXPIRED',
                isLocked: data.isLocked ?? (data.code === 'SUBSCRIPTION_PAYMENT_REQUIRED' || data.code === 'SUBSCRIPTION_EXPIRED' || data.code === 'SUBSCRIPTION_LOCKED'),
                lockReason: data.lockReason || (data.code === 'SUBSCRIPTION_EXPIRED' ? 'EXPIRED' : 'PAYMENT_PENDING'),
                subscriptionStatus: data.subscriptionStatus || (data.code === 'SUBSCRIPTION_EXPIRED' ? 'EXPIRED' : 'PENDING_PAYMENT'),
                planTier: data.planTier || 'PRO',
                billingCycle: data.billingCycle || 'MONTHLY',
                payableAmount: data.payableAmount,
                baseAmount: data.baseAmount,
                taxAmount: data.taxAmount,
                resource: data.resource,
                current: data.current,
                limit: data.limit,
              },
            })
          );
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;