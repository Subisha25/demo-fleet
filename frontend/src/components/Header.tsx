import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faSignOutAlt,
  faBuilding,
  faExchangeAlt,
  faShieldAlt,
  faBell,
  faCheckDouble,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../utils/axiosInstance';

interface RegNotification {
  requestId: string;
  fleetName: string;
  businessCode: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  requestedPlanTier: string;
  billingCycle: string;
  city: string;
  state: string;
  status: string;
  createdAt: string;
  isRead: boolean;
}

const Header: React.FC = () => {
  const { logout } = useAuth();
  const { currentTenant, tenantList, switchTenant, selectedFleet, loadAllTenants } = useTenant();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<RegNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const role = (localStorage.getItem('role') || 'User').toLowerCase();
  const isSuperAdmin = role === 'superadmin';

  // Fetch registration notifications for SuperAdmin
  const fetchNotifications = async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await axiosInstance.get('/tenants/admin/notifications');
      if (res.data && res.data.success) {
        setUnreadCount(res.data.unreadCount || 0);
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      // Handled silently
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadAllTenants();
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isSuperAdmin]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (requestId: string) => {
    try {
      await axiosInstance.post(`/tenants/admin/notifications/mark-read/${requestId}`);
      setNotifications((prev) =>
        prev.map((n) => (n.requestId === requestId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      navigate('/admin/registrations');
      setShowNotifications(false);
    } catch (err) {
      navigate('/admin/registrations');
      setShowNotifications(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.post('/tenants/admin/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      // Handled silently
    }
  };

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

  const primaryColor = isSuperAdmin
    ? '#1C1A18'
    : currentTenant?.brandingTokens?.primaryColor || '#1C1A18';
  const effectiveBg =
    primaryColor === '#0f1c3f' || primaryColor === '#1e40af' || primaryColor === '#275981'
      ? '#1C1A18'
      : primaryColor;

  return (
    <header
      className="h-16 flex items-center justify-between px-6 shadow-md transition-colors duration-300 border-b border-[#2E2A26]"
      style={{ backgroundColor: effectiveBg }}
    >
      {/* Left: Tenant Branding & Plan Badge */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-2 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#C04E24]/20 border border-[#C04E24]/40 flex items-center justify-center text-[#E9B195]">
            <FontAwesomeIcon icon={isSuperAdmin ? faShieldAlt : faBuilding} className="text-sm" />
          </div>
          <span className="font-bold tracking-tight text-base sm:text-lg">
            {isSuperAdmin
              ? 'Grace Cabs SaaS'
              : currentTenant?.name || 'Fleet Mobility Portal'}
          </span>
        </div>

        {/* Identity Badge */}
        {isSuperAdmin ? (
          <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full uppercase tracking-wider shadow-sm border bg-[#FDF6F0] text-[#C04E24] border-[#F3D0BD]">
            SuperAdmin
          </span>
        ) : (
          currentTenant?.planTier && (
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
          )
        )}

        {/* Persistent Global Fleet Selector — STRICTLY SuperAdmin Only */}
        {isSuperAdmin && (
          <div className="flex items-center space-x-2 bg-[#121110]/90 px-3 py-1.5 rounded-lg text-white text-xs border border-[#C04E24]/30 shadow-inner">
            <FontAwesomeIcon icon={faExchangeAlt} className="text-xs text-[#C04E24]" />
            <span className="font-semibold text-[#A8A199]">Fleet Scope:</span>
            <select
              value={selectedFleet}
              onFocus={() => {
                if (!tenantList.length) loadAllTenants();
              }}
              onChange={(e) => switchTenant(e.target.value)}
              className="bg-transparent text-white font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C04E24] [&>option]:text-gray-900 [&>option]:bg-white"
            >
              <option value="all">🌟 All Fleets (Platform-Wide View)</option>
              {tenantList.map((t) => (
                <option key={t.tenantId} value={t.tenantId}>
                  🏢 {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Notifications, User Role & Logout */}
      <div className="flex items-center space-x-4">
        {/* SuperAdmin In-App Registration Notifications Bell */}
        {isSuperAdmin && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition"
              title="Fleet Registration Alerts"
            >
              <FontAwesomeIcon icon={faBell} className="text-sm text-[#E9B195]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C04E24] text-white text-[10px] font-black rounded-full h-4.5 min-w-[18px] px-1 flex items-center justify-center border border-[#1C1A18] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl py-3 px-4 z-50 border border-[#E0DAD1] animate-fadeIn text-slate-800">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#FAF8F5]">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faClipboardList} className="text-[#C04E24] text-sm" />
                    <span className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider">
                      Fleet Registration Alerts
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#C04E24] hover:underline font-semibold flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faCheckDouble} className="text-[10px]" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#FAF8F5] py-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      No inbound fleet registrations yet.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.requestId}
                        onClick={() => handleMarkRead(n.requestId)}
                        className={`py-2.5 px-2 rounded-lg cursor-pointer transition flex items-start justify-between gap-2 hover:bg-[#FAF8F5] ${
                          !n.isRead ? 'bg-[#FAF0E6]/50' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1C1A18] truncate">
                              {n.fleetName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {n.businessCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5C5752] truncate">
                            {n.ownerName} &bull; {n.contactEmail}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                            <span>&bull;</span>
                            <span className="font-semibold text-emerald-700 uppercase">
                              {n.requestedPlanTier}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            n.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : n.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {n.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-[#FAF8F5] text-center">
                  <button
                    onClick={() => {
                      navigate('/admin/registrations');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-bold text-[#C04E24] hover:text-[#A43D1A] transition"
                  >
                    Open Registration Queue &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
