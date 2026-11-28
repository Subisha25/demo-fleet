import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

export const isPublicPath = (pathname: string): boolean => {
  const p = (pathname || '').toLowerCase();
  return (
    p === '' ||
    p === '/' ||
    p.startsWith('/register') ||
    p.startsWith('/pricing') ||
    p.startsWith('/about') ||
    p.startsWith('/services') ||
    p.startsWith('/contact') ||
    p.startsWith('/portfolio') ||
    p.startsWith('/book') ||
    p.startsWith('/login') ||
    p.startsWith('/adminlogin') ||
    p.startsWith('/forgetpasword') ||
    p.startsWith('/forgot-password') ||
    p.startsWith('/activate') ||
    p.startsWith('/demo') ||
    p.startsWith('/terms') ||
    p.startsWith('/privacy') ||
    p.startsWith('/cancel-reservation')
  );
};

export const RouteBrandingSync: React.FC = () => {
  const location = useLocation();
  const { currentTenant } = useTenant();

  useEffect(() => {
    const isPublic = isPublicPath(location.pathname);
    const role = (localStorage.getItem('role') || '').toLowerCase();
    const isSuperAdmin = role === 'superadmin';

    if (isPublic) {
      document.title = 'CABZ | Smart Fleet Mobility';
      document.documentElement.style.setProperty('--primary-tenant-color', '#5B3DF5');
    } else {
      if (isSuperAdmin) {
        document.title = 'CABZ SaaS | Platform Administration';
        document.documentElement.style.setProperty('--primary-tenant-color', '#5B3DF5');
      } else if (currentTenant) {
        const title = currentTenant.brandingTokens?.portalTitle || currentTenant.displayName || currentTenant.name || 'Fleet Portal';
        if (title && title !== 'CABZ Primary') {
          document.title = `${title} — CABZ`;
        } else {
          document.title = 'Fleet Operations Portal — CABZ';
        }
        const primary = currentTenant.brandingTokens?.primaryColor || '#7C3AED';
        document.documentElement.style.setProperty('--primary-tenant-color', primary);
      }
    }
  }, [location.pathname, currentTenant]);

  return null;
};

export default RouteBrandingSync;
