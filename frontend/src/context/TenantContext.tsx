import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from './AuthContext';

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
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialStartDate?: string;
  trialEndsAt?: string;
  trialDurationDays?: number;
  billingCycle?: string;
  agreedPrice?: number;
  currency?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface TenantInfo {
  tenantId: string;
  name: string;
  displayName?: string;
  code: string;
  subdomain?: string;
  slug?: string;
  customDomain?: string;
  status: string;
  planTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  brandingTokens?: TenantBranding;
  subscription?: TenantSubscriptionInfo;
}

interface TenantContextType {
  currentTenant: TenantInfo | null;
  tenantList: TenantInfo[];
  loading: boolean;
  selectedFleet: string;
  fleetChangeVersion: number;
  switchTenant: (tenantId: string) => void;
  refreshTenant: () => Promise<void>;
  loadAllTenants: () => Promise<void>;
}

const DEMO_TENANT: TenantInfo = {
  tenantId: 'demo-tenant',
  name: 'CABZ Smart Fleet Demo',
  displayName: 'CABZ Demo Preview',
  code: 'DEMO',
  subdomain: 'demo',
  status: 'DEMO_PREVIEW',
  planTier: 'PRO',
  contactEmail: 'demo@cabz.com',
  brandingTokens: {
    primaryColor: '#7C3AED',
    secondaryColor: '#0B0B0F',
    portalTitle: 'CABZ Demo Preview',
  },
  subscription: {
    planTier: 'PRO',
    status: 'DEMO_PREVIEW',
    vehicleQuota: 75,
    driverQuota: 75,
    companyQuota: 20,
    monthlyTripQuota: 2500,
    allowOverage: false,
  },
};

const DEFAULT_ROOT_TENANT: TenantInfo = {
  tenantId: 'e7b8a1c0-0000-0000-0000-000000000001',
  name: 'CABZ Primary',
  code: 'CZ',
  subdomain: 'cabz',
  status: 'ACTIVE',
  planTier: 'PRO',
  contactEmail: 'subisha2002.m@gmail.com',
  brandingTokens: {
    primaryColor: '#7C3AED',
    secondaryColor: '#0B0B0F',
    portalTitle: 'CABZ Mobility Platform',
  },
  subscription: {
    planTier: 'PRO',
    status: 'TRIALING',
    vehicleQuota: 75,
    driverQuota: 75,
    companyQuota: 20,
    monthlyTripQuota: 2500,
    allowOverage: false,
  },
};

const ALL_FLEETS_TENANT: TenantInfo = {
  tenantId: 'all',
  name: 'All Fleets (Platform-Wide View)',
  code: 'ALL',
  subdomain: 'platform',
  status: 'ACTIVE',
  planTier: 'ENTERPRISE',
  contactEmail: 'subisha2002.m@gmail.com',
  brandingTokens: {
    primaryColor: '#5B3DF5',
    secondaryColor: '#0B0B0F',
    portalTitle: 'CABZ Global Platform',
  },
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const role = localStorage.getItem('role');
  const isSuperAdmin = role === 'superadmin';
  const isDemo = localStorage.getItem('isDemoView') === 'true' || localStorage.getItem('isDemoMode') === 'true' || role === 'demo';

  const [selectedFleet, setSelectedFleet] = useState<string>(() => {
    if (isDemo) return 'demo-tenant';
    if (!isSuperAdmin) {
      return localStorage.getItem('tenantId') || 'e7b8a1c0-0000-0000-0000-000000000001';
    }
    return localStorage.getItem('selectedTenantId') || 'all';
  });

  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(() => {
    if (isDemo) return DEMO_TENANT;
    if (isSuperAdmin) {
      return selectedFleet === 'all' ? ALL_FLEETS_TENANT : DEFAULT_ROOT_TENANT;
    }
    const savedName = localStorage.getItem('fleetName') || localStorage.getItem('tenantName');
    const savedUserStr = localStorage.getItem('user');
    let userFleetName = savedName;
    if (!userFleetName && savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.username && u.username !== 'SuperAdmin' && u.username !== 'CABZ Primary') {
          userFleetName = u.username;
        }
      } catch {}
    }
    const tenantId = localStorage.getItem('tenantId') || 'e7b8a1c0-0000-0000-0000-000000000001';
    return {
      tenantId,
      name: userFleetName || 'My Fleet',
      displayName: userFleetName || 'My Fleet',
      code: 'FL',
      subdomain: '',
      status: 'ACTIVE',
      planTier: 'FREE_TRIAL' as any,
      brandingTokens: {
        primaryColor: '#7C3AED',
        secondaryColor: '#0B0B0F',
        portalTitle: userFleetName || 'Fleet Operations Portal',
      },
      subscription: {
        planTier: 'FREE_TRIAL' as any,
        status: 'TRIALING',
        vehicleQuota: 75,
        driverQuota: 75,
        companyQuota: 20,
        monthlyTripQuota: 2500,
        allowOverage: false,
      },
    };
  });
  const [tenantList, setTenantList] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fleetChangeVersion, setFleetChangeVersion] = useState<number>(0);

  const applyBranding = (tenant: TenantInfo) => {
    const primary = tenant.brandingTokens?.primaryColor || '#7C3AED';
    const title = tenant.brandingTokens?.portalTitle || tenant.displayName || tenant.name;
    document.documentElement.style.setProperty('--primary-tenant-color', primary);
    if (tenant.tenantId === 'all' || !tenant.tenantId || tenant.tenantId === 'e7b8a1c0-0000-0000-0000-000000000001') {
      document.title = 'CABZ | Smart Fleet Mobility';
    } else if (title && title !== 'CABZ') {
      document.title = `${title} — CABZ`;
    } else {
      document.title = 'CABZ | Smart Fleet Mobility';
    }
  };

  const refreshTenant = async () => {
    try {
      const currentRole = localStorage.getItem('role');
      const isDemoSession = localStorage.getItem('isDemoView') === 'true' || localStorage.getItem('isDemoMode') === 'true' || currentRole === 'demo';

      if (isDemoSession) {
        setCurrentTenant(DEMO_TENANT);
        applyBranding(DEMO_TENANT);
        setLoading(false);
        return;
      }

      if (currentRole === 'superadmin' && selectedFleet === 'all') {
        setCurrentTenant(ALL_FLEETS_TENANT);
        applyBranding(ALL_FLEETS_TENANT);
        setLoading(false);
        return;
      }

      const res = await axiosInstance.get('/tenants/current/profile');
      if (res.data && res.data.tenant) {
        setCurrentTenant(res.data.tenant);
        applyBranding(res.data.tenant);
        if (res.data.tenant.name) {
          localStorage.setItem('fleetName', res.data.tenant.displayName || res.data.tenant.name);
        }
      }
    } catch (err) {
      // Fallback
      if (!isSuperAdmin) {
        const fallbackName = localStorage.getItem('fleetName') || 'My Fleet';
        const fallbackTenant: TenantInfo = {
          tenantId: localStorage.getItem('tenantId') || '',
          name: fallbackName,
          displayName: fallbackName,
          code: 'FL',
          subdomain: '',
          status: 'ACTIVE',
          planTier: 'PRO',
          brandingTokens: {
            primaryColor: '#7C3AED',
            portalTitle: fallbackName,
          },
        };
        setCurrentTenant(fallbackTenant);
        applyBranding(fallbackTenant);
      } else if (selectedFleet === 'all') {
        setCurrentTenant(ALL_FLEETS_TENANT);
        applyBranding(ALL_FLEETS_TENANT);
      } else {
        applyBranding(DEFAULT_ROOT_TENANT);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllTenants = async () => {
    const currentRole = localStorage.getItem('role');
    if (currentRole !== 'superadmin') {
      return; // Fleet Admin or others must never fetch all tenants directory
    }
    try {
      const res = await axiosInstance.get('/tenants');
      if (res.data && Array.isArray(res.data.tenants)) {
        // Authoritative filter: Exclude platform root and test fixtures
        const eligible = res.data.tenants.filter((t: any) => {
          if (!t || t.status !== 'ACTIVE') return false;
          // Exclude platform root record
          if (t.tenantId === 'e7b8a1c0-0000-0000-0000-000000000001' || t.code === 'GC') return false;
          // Exclude automated test fleets
          if (t.code?.startsWith('TST') || t.name?.startsWith('Test Fleet TST')) return false;
          return true;
        });
        setTenantList(eligible);
      }
    } catch (err) {
      console.warn('Unable to load tenant directory:', err);
    }
  };

  const switchTenant = (targetFleetId: string) => {
    const currentRole = localStorage.getItem('role');
    if (currentRole !== 'superadmin') {
      // Fleet Admin cannot switch tenants
      return;
    }

    const nextSelection = targetFleetId || 'all';
    setSelectedFleet(nextSelection);
    localStorage.setItem('selectedTenantId', nextSelection);
    localStorage.setItem('tenantId', nextSelection);

    if (nextSelection === 'all') {
      setCurrentTenant(ALL_FLEETS_TENANT);
      applyBranding(ALL_FLEETS_TENANT);
    } else {
      const found = tenantList.find((t) => t.tenantId === nextSelection);
      if (found) {
        setCurrentTenant(found);
        applyBranding(found);
      } else {
        // If not in pre-loaded list, refresh from backend profile
        refreshTenant();
      }
    }

    setFleetChangeVersion((prev) => prev + 1);
  };

  useEffect(() => {
    const currentRole = localStorage.getItem('role');
    if (currentRole === 'superadmin') {
      loadAllTenants();
      const saved = localStorage.getItem('selectedTenantId') || 'all';
      setSelectedFleet(saved);
      localStorage.setItem('tenantId', saved);
      if (saved === 'all') {
        setCurrentTenant(ALL_FLEETS_TENANT);
      } else {
        refreshTenant();
      }
    } else {
      // Non-superadmin: Lock to their own tenant and fetch their actual profile immediately
      const userTenant = localStorage.getItem('tenantId') || 'e7b8a1c0-0000-0000-0000-000000000001';
      setSelectedFleet(userTenant);
      localStorage.setItem('selectedTenantId', userTenant);
      localStorage.setItem('tenantId', userTenant);
      refreshTenant();
    }
  }, [isAuthenticated]);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        tenantList,
        loading,
        selectedFleet,
        fleetChangeVersion,
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
