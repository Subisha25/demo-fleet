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
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  billingCycle?: string;
  agreedPrice?: number;
  currency?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
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
  selectedFleet: string;
  fleetChangeVersion: number;
  switchTenant: (tenantId: string) => void;
  refreshTenant: () => Promise<void>;
  loadAllTenants: () => Promise<void>;
}

const DEFAULT_ROOT_TENANT: TenantInfo = {
  tenantId: 'e7b8a1c0-0000-0000-0000-000000000001',
  name: 'FleetFlow Fleet Operations',
  code: 'FF',
  subdomain: 'fleetflow',
  status: 'ACTIVE',
  planTier: 'ENTERPRISE',
  contactEmail: 'subisha2002.m@gmail.com',
  brandingTokens: {
    primaryColor: '#0F766E',
    secondaryColor: '#1C1A18',
    portalTitle: 'FleetFlow Mobility SaaS',
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

const ALL_FLEETS_TENANT: TenantInfo = {
  tenantId: 'all',
  name: 'All Fleets (Platform-Wide View)',
  code: 'ALL',
  subdomain: 'platform',
  status: 'ACTIVE',
  planTier: 'ENTERPRISE',
  contactEmail: 'subisha2002.m@gmail.com',
  brandingTokens: {
    primaryColor: '#C04E24',
    secondaryColor: '#1C1A18',
    portalTitle: 'All Fleets Platform Dashboard',
  },
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const role = localStorage.getItem('role');
  const isSuperAdmin = role === 'superadmin';

  const [selectedFleet, setSelectedFleet] = useState<string>(() => {
    if (!isSuperAdmin) {
      return localStorage.getItem('tenantId') || 'e7b8a1c0-0000-0000-0000-000000000001';
    }
    return localStorage.getItem('selectedTenantId') || 'all';
  });

  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(
    selectedFleet === 'all' ? ALL_FLEETS_TENANT : DEFAULT_ROOT_TENANT
  );
  const [tenantList, setTenantList] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fleetChangeVersion, setFleetChangeVersion] = useState<number>(0);

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
      if (selectedFleet === 'all') {
        setCurrentTenant(ALL_FLEETS_TENANT);
        applyBranding(ALL_FLEETS_TENANT);
        setLoading(false);
        return;
      }

      const res = await axiosInstance.get('/tenants/current/profile');
      if (res.data && res.data.tenant) {
        setCurrentTenant(res.data.tenant);
        applyBranding(res.data.tenant);
      }
    } catch (err) {
      // Fallback
      if (selectedFleet === 'all') {
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
  }, []);

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
