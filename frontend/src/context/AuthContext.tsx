import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // `localStorage.getItem('token')` 
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('companyId');
    localStorage.removeItem('fleetName');
    localStorage.removeItem('tenantName');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('selectedTenantId');
    localStorage.removeItem('user');
    localStorage.removeItem('isDemoMode');
    localStorage.removeItem('isDemoView');
    localStorage.removeItem('inspectingTenantId');
    sessionStorage.clear();
    if (typeof document !== 'undefined') {
      document.title = 'CABZ | Smart Fleet Mobility';
      document.documentElement.style.setProperty('--primary-tenant-color', '#5B3DF5');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cabz:auth_logout'));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};