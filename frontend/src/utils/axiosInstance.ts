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
    }
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId && req.headers) {
      req.headers['X-Tenant-ID'] = tenantId;
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
      if (
        data?.code === 'QUOTA_EXCEEDED' ||
        data?.code === 'RESTRICTED_FREE_ACCESS' ||
        data?.code === 'SUBSCRIPTION_LOCKED' ||
        data?.code === 'SUBSCRIPTION_EXPIRED' ||
        data?.requiresUpgrade
      ) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('fleetflow:subscription_required', {
              detail: {
                title:
                  data.code === 'SUBSCRIPTION_EXPIRED' || data.code === 'SUBSCRIPTION_LOCKED'
                    ? 'Subscription Expired'
                    : 'Subscription Required',
                message: data.message,
                isExpired: data.code === 'SUBSCRIPTION_EXPIRED' || data.code === 'SUBSCRIPTION_LOCKED',
                resource: data.resource,
                current: data.current,
                limit: data.limit,
                planTier: data.planTier,
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