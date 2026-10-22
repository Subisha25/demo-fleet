import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt, faBuilding, faExchangeAlt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {
  const { logout } = useAuth();
  const { currentTenant, tenantList, switchTenant } = useTenant();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const role = localStorage.getItem('role') || 'User';

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/adminlogin');
    setShowConfirm(false);
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  const primaryColor = currentTenant?.brandingTokens?.primaryColor || '#1C1A18';
  const effectiveBg = (primaryColor === '#0f1c3f' || primaryColor === '#1e40af' || primaryColor === '#275981') ? '#1C1A18' : primaryColor;

  return (
    <header
      className="h-16 flex items-center justify-between px-6 shadow-md transition-colors duration-300 border-b border-[#2E2A26]"
      style={{ backgroundColor: effectiveBg }}
    >
      {/* Left: Tenant Branding & Plan Badge */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-2 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#C04E24]/20 border border-[#C04E24]/40 flex items-center justify-center text-[#E9B195]">
            <FontAwesomeIcon icon={faBuilding} className="text-sm" />
          </div>
          <span className="font-bold tracking-tight text-base sm:text-lg">
            {currentTenant?.name || 'Fleet Mobility Portal'}
          </span>
        </div>

        {currentTenant?.planTier && (
          <span
            className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full uppercase tracking-wider shadow-sm border ${
              currentTenant.planTier === 'ENTERPRISE'
                ? 'bg-[#FDF6F0] text-[#C04E24] border-[#F3D0BD]'
                : currentTenant.planTier === 'PRO'
                ? 'bg-[#F5F2EB] text-[#843217] border-[#E0DAD1]'
                : 'bg-[#262320] text-[#E0DAD1] border-[#3D3833]'
            }`}
          >
            {currentTenant.planTier}
          </span>
        )}

        {/* Tenant Switcher for Superadmin / Admin */}
        {(role === 'superadmin' || role === 'admin') && tenantList.length > 1 && (
          <div className="flex items-center space-x-2 bg-[#121110]/90 px-3 py-1.5 rounded-lg text-white text-xs border border-[#C04E24]/30 shadow-inner">
            <FontAwesomeIcon icon={faExchangeAlt} className="text-xs text-[#C04E24]" />
            <span className="font-semibold text-[#A8A199]">Tenant:</span>
            <select
              value={currentTenant?.tenantId || ''}
              onChange={(e) => switchTenant(e.target.value)}
              className="bg-transparent text-white font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C04E24] [&>option]:text-gray-900 [&>option]:bg-white"
            >
              {tenantList.map((t) => (
                <option key={t.tenantId} value={t.tenantId}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: User Role & Logout */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-slate-200 text-xs font-semibold border border-white/10">
          <FontAwesomeIcon icon={faUserCircle} className="text-[#E9B195] text-sm" />
          <span className="capitalize">{role}</span>
        </div>

        <div className="relative">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 shadow-sm"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Sign Out</span>
          </button>

          {showConfirm && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl py-4 px-4 z-50 border border-slate-200 animate-fadeIn text-slate-800">
              <div className="text-sm font-semibold text-slate-900 mb-1">
                Confirm Sign Out
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Are you sure you want to end your current active session?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelLogout}
                  className="px-3 py-1.5 text-xs text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-3 py-1.5 text-xs text-white bg-rose-600 rounded-lg hover:bg-rose-700 font-semibold shadow transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
