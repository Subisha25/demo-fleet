import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../utils/axiosInstance';

export interface TenantBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  portalTitle?: string;
}

export interface TenantSubscriptionInfo {
  planTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: string;
  vehicleQuota: number;
  driverQuota: number;
  companyQuota: number;
  monthlyTripQuota: number;
  allowOverage: boolean;
}

export interface TenantInfo {
  tenantId: string;
  name: string;
  code: string;
  subdomain?: string;
  customDomain?: string;
  status: string;
  planTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  contactEmail?: string;
  contactPhone?: string;
  brandingTokens?: TenantBranding;
  subscription?: TenantSubscriptionInfo;
}

interface TenantContextType {
  currentTenant: TenantInfo | null;
  tenantList: TenantInfo[];
  loading: boolean;
  switchTenant: (tenantId: string) => void;
  refreshTenant: () => Promise<void>;
  loadAllTenants: () => Promise<void>;
}

const DEFAULT_ROOT_TENANT: TenantInfo = {
  tenantId: 'e7b8a1c0-0000-0000-0000-000000000001',
  name: 'Grace Cabs Fleet Operations',
  code: 'GC',
  subdomain: 'gracecabs',
  status: 'ACTIVE',
  planTier: 'ENTERPRISE',
  contactEmail: 'admin@gracecabs.com',
  brandingTokens: {
    primaryColor: '#C04E24',
    secondaryColor: '#262320',
    portalTitle: 'Grace Cabs Mobility SaaS',
  },
  subscription: {
    planTier: 'ENTERPRISE',
    status: 'ACTIVE',
    vehicleQuota: 250,
    driverQuota: 250,
    companyQuota: 100,
    monthlyTripQuota: 50000,
    allowOverage: true,
  },
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(DEFAULT_ROOT_TENANT);
  const [tenantList, setTenantList] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const applyBranding = (tenant: TenantInfo) => {
    const primary = tenant.brandingTokens?.primaryColor || '#C04E24';
    const title = tenant.brandingTokens?.portalTitle || tenant.name;
    document.documentElement.style.setProperty('--primary-tenant-color', primary);
    if (title) {
      document.title = `${title} | Transport Portal`;
    }
  };

  const refreshTenant = async () => {
    try {
      const res = await axiosInstance.get('/tenants/current/profile');
      if (res.data && res.data.tenant) {
        setCurrentTenant(res.data.tenant);
        applyBranding(res.data.tenant);
      }
    } catch (err) {
      // Fallback to default root tenant if unauthenticated or offline
      applyBranding(DEFAULT_ROOT_TENANT);
    } finally {
      setLoading(false);
    }
  };

  const loadAllTenants = async () => {
    try {
      const res = await axiosInstance.get('/tenants');
      if (res.data && Array.isArray(res.data.tenants)) {
        setTenantList(res.data.tenants);
      }
    } catch (err) {
      console.warn('Unable to load tenant directory:', err);
    }
  };

  const switchTenant = (tenantId: string) => {
    if (tenantId) {
      localStorage.setItem('tenantId', tenantId);
    } else {
      localStorage.removeItem('tenantId');
    }
    refreshTenant();
  };

  useEffect(() => {
    refreshTenant();
    const role = localStorage.getItem('role');
    if (role === 'superadmin' || role === 'admin') {
      loadAllTenants();
    }
  }, []);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        tenantList,
        loading,
        switchTenant,
        refreshTenant,
        loadAllTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
