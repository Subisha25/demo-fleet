import axios from 'axios';
import config from "../config/config"; 
const BASE_URL = config.baseurl.apibaseurl;

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    if (token && req.headers) {
      req.headers['Authorization'] = `Bearer ${token}`;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.tenantId && payload.role !== 'superadmin' && payload.role !== 'SUPERADMIN') {
          req.headers['X-Tenant-ID'] = payload.tenantId;
          localStorage.setItem('tenantId', payload.tenantId);
          return req;
        }
      } catch {}
    }
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId && req.headers) {
      req.headers['X-Tenant-ID'] = tenantId;
    }

    const isDemo = localStorage.getItem('isDemoMode') === 'true' ||
      localStorage.getItem('isDemoView') === 'true' ||
      localStorage.getItem('role') === 'demo';

    if (isDemo && req.headers) {
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

      // Handle Demo View read-only response
      if (data?.code === 'DEMO_MODE_READ_ONLY' || data?.isDemoReadOnly) {
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
        data?.code === 'QUOTA_EXCEEDED' ||
        data?.code === 'RESTRICTED_FREE_ACCESS' ||
        data?.code === 'SUBSCRIPTION_LOCKED' ||
        data?.code === 'SUBSCRIPTION_EXPIRED' ||
        data?.code === 'SUBSCRIPTION_PAYMENT_REQUIRED' ||
        data?.subscriptionRequired ||
        data?.requiresUpgrade ||
        data?.requiresPayment
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