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

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm transition-colors duration-200">
      {/* Left: Tenant Branding & Plan Badge */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-2 text-gray-900">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
            <FontAwesomeIcon icon={isSuperAdmin ? faShieldAlt : faBuilding} className="text-sm" />
          </div>
          <span className="font-bold tracking-tight text-base sm:text-lg text-gray-900">
            {isSuperAdmin
              ? 'FleetFlow SaaS'
              : currentTenant?.name || 'Fleet Mobility Portal'}
          </span>
        </div>

        {/* Identity Badge */}
        {isSuperAdmin ? (
          <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full uppercase tracking-wider shadow-sm border bg-purple-50 text-purple-700 border-purple-200">
            SuperAdmin
          </span>
        ) : (
          <div className="flex items-center gap-2">
            {currentTenant?.planTier && (
              <span
                className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full uppercase tracking-wider shadow-sm border ${
                  currentTenant.planTier === 'ENTERPRISE'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : currentTenant.planTier === 'PRO'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {currentTenant.planTier} ({currentTenant.subscription?.billingCycle || 'MONTHLY'})
              </span>
            )}

            {/* Subscription Status Indicator */}
            {currentTenant?.subscription?.status && (
              <span
                className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider border ${
                  currentTenant.subscription.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : currentTenant.subscription.status === 'TRIALING'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                    : currentTenant.subscription.status === 'PAST_DUE'
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                }`}
              >
                {currentTenant.subscription.status === 'ACTIVE'
                  ? 'Active'
                  : currentTenant.subscription.status === 'TRIALING'
                  ? 'Trial Setup'
                  : currentTenant.subscription.status === 'PAST_DUE'
                  ? 'Grace Period'
                  : 'Suspended'}
              </span>
            )}

            {/* Renewal / Upgrade CTA if not active */}
            {currentTenant?.subscription?.status && currentTenant.subscription.status !== 'ACTIVE' && (
              <a
                href="/subscription/current"
                className="px-2.5 py-0.5 text-[10px] font-black rounded bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white transition shadow-sm"
              >
                Renew &rarr;
              </a>
            )}
          </div>
        )}

        {/* Persistent Global Fleet Selector — STRICTLY SuperAdmin Only */}
        {isSuperAdmin && (
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-700 text-xs border border-gray-300 shadow-sm">
            <FontAwesomeIcon icon={faExchangeAlt} className="text-xs text-purple-600" />
            <span className="font-semibold text-gray-600">Fleet Scope:</span>
            <select
              value={selectedFleet}
              onFocus={() => {
                if (!tenantList.length) loadAllTenants();
              }}
              onChange={(e) => switchTenant(e.target.value)}
              className="bg-transparent text-gray-900 font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-600 [&>option]:text-gray-900 [&>option]:bg-white"
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
      <div className="flex items-center space-x-3.5">
        {/* SuperAdmin In-App Registration Notifications Bell */}
        {isSuperAdmin && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
              title="Fleet Registration Alerts"
            >
              <FontAwesomeIcon icon={faBell} className="text-sm text-purple-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-[10px] font-black rounded-full h-4.5 min-w-[18px] px-1 flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl py-3 px-4 z-50 border border-gray-200 animate-fadeIn text-slate-800">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faClipboardList} className="text-purple-600 text-sm" />
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Fleet Registration Alerts
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-purple-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faCheckDouble} className="text-[10px]" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 py-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-6">
                      No inbound fleet registrations yet.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.requestId}
                        onClick={() => handleMarkRead(n.requestId)}
                        className={`py-2.5 px-2 rounded-lg cursor-pointer transition flex items-start justify-between gap-2 hover:bg-purple-50/50 ${
                          !n.isRead ? 'bg-purple-50/70 font-medium' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {n.fleetName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                              {n.businessCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 truncate">
                            {n.ownerName} &bull; {n.contactEmail}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
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

                <div className="pt-2 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      navigate('/admin/registrations');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 transition"
                  >
                    Open Registration Queue &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-xs font-semibold border border-gray-200">
          <FontAwesomeIcon icon={faUserCircle} className="text-purple-600 text-sm" />
          <span className="capitalize">{role}</span>
        </div>

        <div className="relative">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 shadow-sm"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Sign Out</span>
          </button>

          {showConfirm && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-4 px-4 z-50 border border-gray-200 animate-fadeIn text-slate-800">
              <div className="text-sm font-semibold text-gray-900 mb-1">
                Confirm Sign Out
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Are you sure you want to end your current active session?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelLogout}
                  className="px-3 py-1.5 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
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
