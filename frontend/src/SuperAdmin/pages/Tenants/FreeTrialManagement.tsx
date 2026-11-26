import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  ChevronRight,
  ShieldAlert,
  Send,
  Loader2,
  Sparkles,
  UserCheck,
  Building,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { showToast } from '../../../components/AlertBox';

interface ExtensionRequest {
  requestId: string;
  tenantId: string;
  requestedDays: number;
  approvedDays: number | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  previousExpiry: string;
  newExpiry: string | null;
  extensionType: 'REQUEST_APPROVED' | 'MANUAL_SUPERADMIN' | 'REJECTED' | null;
  adminNotes: string | null;
  tenant?: {
    tenantId: string;
    name: string;
    displayName: string;
    code: string;
    slug: string;
    contactEmail: string;
    contactPhone: string;
    legalName: string;
    status: string;
  };
}

interface FleetTrialOverview {
  tenantId: string;
  fleetName: string;
  displayName: string;
  code: string;
  slug: string;
  contactEmail: string;
  contactPhone: string;
  registeredAt: string;
  planTier: string;
  status: string;
  displayStatus: string;
  trialStartDate: string;
  trialEndsAt: string;
  trialDurationDays: number;
  originalTrialDays: number;
  extendedTrialDays: number;
  remainingDays: number;
  isTrialValid: boolean;
  hasPendingRequest: boolean;
  pendingRequest?: {
    requestId: string;
    requestedDays: number;
    reason: string;
    requestedAt: string;
  } | null;
  extensionCount: number;
  totalRequestsCount: number;
}

export const FreeTrialManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'overview'>('requests');
  const [loading, setLoading] = useState(true);

  // Data states
  const [requests, setRequests] = useState<ExtensionRequest[]>([]);
  const [fleets, setFleets] = useState<FleetTrialOverview[]>([]);
  const [metrics, setMetrics] = useState({
    totalFleets: 0,
    activeTrials: 0,
    expiredTrials: 0,
    pendingRequests: 0,
    paidSubscriptions: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [approveModal, setApproveModal] = useState<{
    open: boolean;
    request: ExtensionRequest | null;
    approvedDays: number;
    adminNotes: string;
    submitting: boolean;
  }>({
    open: false,
    request: null,
    approvedDays: 7,
    adminNotes: '',
    submitting: false,
  });

  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    request: ExtensionRequest | null;
    reason: string;
    submitting: boolean;
  }>({
    open: false,
    request: null,
    reason: '',
    submitting: false,
  });

  const [manualModal, setManualModal] = useState<{
    open: boolean;
    tenant: FleetTrialOverview | null;
    additionalDays: number;
    reason: string;
    submitting: boolean;
  }>({
    open: false,
    tenant: null,
    additionalDays: 7,
    reason: '',
    submitting: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, requestsRes] = await Promise.all([
        axiosInstance.get('/tenants/admin/trial-management'),
        axiosInstance.get(`/tenants/admin/trial-extensions?status=${statusFilter}`),
      ]);

      if (overviewRes.data?.success) {
        setFleets(overviewRes.data.data?.fleets || []);
        if (overviewRes.data.data?.metrics) {
          setMetrics(overviewRes.data.data.metrics);
        }
      }

      if (requestsRes.data?.success) {
        setRequests(requestsRes.data.data?.requests || []);
      }
    } catch (err: any) {
      console.error('Error loading trial management data:', err);
      showToast('Could not load trial management data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Handle Approve
  const handleConfirmApprove = async () => {
    if (!approveModal.request) return;
    setApproveModal((prev) => ({ ...prev, submitting: true }));

    try {
      const res = await axiosInstance.post(
        `/tenants/admin/trial-extensions/${approveModal.request.requestId}/approve`,
        {
          approvedDays: approveModal.approvedDays,
          adminNotes: approveModal.adminNotes.trim(),
        }
      );

      if (res.data?.success) {
        showToast(res.data.message || 'Trial extension approved successfully! Access restored immediately.', 'success');
        setApproveModal({ open: false, request: null, approvedDays: 7, adminNotes: '', submitting: false });
        loadData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to approve extension request.';
      showToast(msg, 'error');
      setApproveModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Handle Reject
  const handleConfirmReject = async () => {
    if (!rejectModal.request) return;
    if (!rejectModal.reason.trim() || rejectModal.reason.trim().length < 5) {
      showToast('Please provide a rejection reason (min 5 characters).', 'error');
      return;
    }

    setRejectModal((prev) => ({ ...prev, submitting: true }));

    try {
      const res = await axiosInstance.post(
        `/tenants/admin/trial-extensions/${rejectModal.request.requestId}/reject`,
        {
          reason: rejectModal.reason.trim(),
        }
      );

      if (res.data?.success) {
        showToast('Trial extension request rejected.', 'success');
        setRejectModal({ open: false, request: null, reason: '', submitting: false });
        loadData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to reject extension request.';
      showToast(msg, 'error');
      setRejectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Handle Manual Extend
  const handleConfirmManualExtend = async () => {
    if (!manualModal.tenant) return;
    setManualModal((prev) => ({ ...prev, submitting: true }));

    try {
      const res = await axiosInstance.post(
        `/tenants/admin/trial-management/${manualModal.tenant.tenantId}/extend`,
        {
          additionalDays: manualModal.additionalDays,
          reason: manualModal.reason.trim(),
        }
      );

      if (res.data?.success) {
        showToast(res.data.message || 'Trial extended successfully!', 'success');
        setManualModal({ open: false, tenant: null, additionalDays: 7, reason: '', submitting: false });
        loadData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to grant manual extension.';
      showToast(msg, 'error');
      setManualModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const term = searchQuery.toLowerCase();
    const fleetName = (r.tenant?.name || '').toLowerCase();
    const email = (r.tenant?.contactEmail || '').toLowerCase();
    const code = (r.tenant?.code || '').toLowerCase();
    const reason = (r.reason || '').toLowerCase();
    return fleetName.includes(term) || email.includes(term) || code.includes(term) || reason.includes(term);
  });

  // Filter fleets
  const filteredFleets = fleets.filter((f) => {
    const term = searchQuery.toLowerCase();
    const fleetName = (f.fleetName || '').toLowerCase();
    const email = (f.contactEmail || '').toLowerCase();
    const code = (f.code || '').toLowerCase();
    return fleetName.includes(term) || email.includes(term) || code.includes(term);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17171D] via-[#241F3A] to-[#17171D] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-4 border-indigo-600">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 uppercase tracking-wider">
              Tenant Lifecycle &amp; Access Control
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
              Authoritative Backend Guard
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            <Clock size={24} className="text-indigo-400" />
            Free Trial Management Desk
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Monitor 7-day free trial health across all fleets, review extension requests, grant additional trial days, and audit operational access restorations.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-white/20 shadow-sm shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Total Fleets</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{metrics.totalFleets}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Free Trials
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{metrics.activeTrials}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-gradient-to-br from-white to-rose-50/30">
          <span className="text-[11px] font-bold uppercase text-rose-700 tracking-wider">Expired Trials</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{metrics.expiredTrials}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
            <Clock size={12} className="text-amber-600" /> Pending Requests
          </span>
          <p className="text-2xl font-black text-amber-700 mt-1">{metrics.pendingRequests}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
          <span className="text-[11px] font-bold uppercase text-purple-700 tracking-wider">Paid Subscriptions</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{metrics.paidSubscriptions}</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={15} />
              <span>Trial Extension Requests</span>
              {metrics.pendingRequests > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold animate-pulse">
                  {metrics.pendingRequests}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Building size={15} />
              <span>All Fleets Trial Overview</span>
              <span className="px-2 py-0.2 rounded-full bg-gray-200 text-gray-800 text-[10px] font-extrabold">
                {fleets.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === 'requests' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-gray-300 bg-white font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PENDING">Pending Review ({metrics.pendingRequests})</option>
                <option value="APPROVED">Approved History</option>
                <option value="REJECTED">Rejected History</option>
                <option value="ALL">All Statuses</option>
              </select>
            )}

            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fleets, emails, codes..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* TAB 1: TRIAL EXTENSION REQUESTS */}
        {activeTab === 'requests' && (
          <div className="overflow-x-auto">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-700">No extension requests found</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {statusFilter === 'PENDING' ? 'All fleet trial extension requests have been processed.' : 'No records matching current filters.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 bg-gray-50/80">
                    <th className="py-3 px-3">Request Date</th>
                    <th className="py-3 px-3">Fleet Operator</th>
                    <th className="py-3 px-3">Current Expiry</th>
                    <th className="py-3 px-3">Requested</th>
                    <th className="py-3 px-3 max-w-xs">Reason / Justification</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Review Notes</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map((r) => (
                    <tr key={r.requestId} className="hover:bg-indigo-50/30 transition">
                      <td className="py-3 px-3 whitespace-nowrap text-gray-600 font-medium">
                        {new Date(r.requestedAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-extrabold text-gray-900">{r.tenant?.name || 'Fleet'}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Mail size={11} className="text-gray-400" />
                          <span>{r.tenant?.contactEmail || 'N/A'}</span>
                        </div>
                        {r.tenant?.contactPhone && (
                          <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                            <Phone size={10} className="text-gray-400" />
                            <span>{r.tenant.contactPhone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-700">
                          {new Date(r.previousExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                          +{r.requestedDays} Days
                        </span>
                        {r.approvedDays && (
                          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                            Approved: +{r.approvedDays}d
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 max-w-xs text-gray-700">
                        <p className="line-clamp-2 text-xs leading-relaxed italic" title={r.reason}>
                          "{r.reason}"
                        </p>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            r.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : r.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-gray-500 max-w-xs">
                        {r.adminNotes ? (
                          <span className="text-[11px] italic text-gray-600 line-clamp-2" title={r.adminNotes}>
                            {r.adminNotes}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                        {r.reviewedBy && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            By: {r.reviewedBy}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {r.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setApproveModal({
                                open: true,
                                request: r,
                                approvedDays: r.requestedDays,
                                adminNotes: '',
                                submitting: false,
                              })}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModal({
                                open: true,
                                request: r,
                                reason: '',
                                submitting: false,
                              })}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-gray-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: ALL FLEETS FREE TRIAL OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="overflow-x-auto">
            {filteredFleets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-700">No fleets found</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 bg-gray-50/80">
                    <th className="py-3 px-3">Fleet Name &amp; Code</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Registered On</th>
                    <th className="py-3 px-3">Trial Status</th>
                    <th className="py-3 px-3">Trial Expiry</th>
                    <th className="py-3 px-3">Remaining</th>
                    <th className="py-3 px-3">Total Duration</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFleets.map((f) => (
                    <tr key={f.tenantId} className="hover:bg-indigo-50/30 transition">
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-gray-900">{f.fleetName}</div>
                        <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                          Code: {f.code} {f.slug ? `• /${f.slug}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-gray-800 font-medium">{f.contactEmail}</div>
                        {f.contactPhone && <div className="text-[11px] text-gray-400">{f.contactPhone}</div>}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-gray-600 font-medium">
                        {new Date(f.registeredAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            f.displayStatus === 'TRIAL_ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : f.displayStatus === 'TRIAL_EXPIRED'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-purple-100 text-purple-800 border-purple-300'
                          }`}
                        >
                          {f.displayStatus === 'TRIAL_ACTIVE'
                            ? '● TRIAL ACTIVE'
                            : f.displayStatus === 'TRIAL_EXPIRED'
                            ? 'TRIAL EXPIRED'
                            : f.displayStatus}
                        </span>
                        {f.hasPendingRequest && (
                          <div className="mt-1">
                            <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                              Request Pending (+{f.pendingRequest?.requestedDays}d)
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-gray-700 font-semibold">
                        {f.trialEndsAt ? new Date(f.trialEndsAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        }) : '—'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {f.isTrialValid ? (
                          <span className="font-extrabold text-emerald-700">
                            {f.remainingDays} {f.remainingDays === 1 ? 'day' : 'days'} left
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">Expired</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                        <span className="font-bold text-gray-900">{f.trialDurationDays} Days</span>
                        {f.extendedTrialDays > 0 && (
                          <span className="text-[10px] text-indigo-600 font-semibold ml-1">
                            (+{f.extendedTrialDays}d ext)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setManualModal({
                            open: true,
                            tenant: f,
                            additionalDays: 7,
                            reason: '',
                            submitting: false,
                          })}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition shadow-sm"
                        >
                          Extend Manually &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: APPROVE REQUEST MODAL */}
      {approveModal.open && approveModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-scaleUp">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-300" />
                Approve Free Trial Extension Request
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Grant additional free trial days to {approveModal.request.tenant?.name}.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fleet Name:</span>
                  <span className="font-bold text-gray-900">{approveModal.request.tenant?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested Extension:</span>
                  <span className="font-bold text-indigo-600">+{approveModal.request.requestedDays} Days</span>
                </div>
                <div className="pt-1.5 border-t border-gray-200">
                  <span className="text-gray-500 block mb-0.5">Reason Submitted:</span>
                  <p className="text-gray-800 italic">"{approveModal.request.reason}"</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Approved Days (Adjust if needed):
                </label>
                <div className="flex items-center gap-2">
                  {[3, 5, 7, 14, 30].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setApproveModal((prev) => ({ ...prev, approvedDays: d }))}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        approveModal.approvedDays === d
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={approveModal.approvedDays}
                    onChange={(e) => setApproveModal((prev) => ({ ...prev, approvedDays: parseInt(e.target.value, 10) || 1 }))}
                    className="w-20 text-xs p-1.5 border border-gray-300 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Admin Note to Fleet (Optional):
                </label>
                <textarea
                  rows={2}
                  value={approveModal.adminNotes}
                  onChange={(e) => setApproveModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="e.g. Glad to support your ongoing fleet operations evaluation."
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-start gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  Immediate Access Restoration: Authoritative trial expiry will update and full operational access will restore immediately on backend. Confirmation email will be dispatched to fleet admin.
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setApproveModal({ open: false, request: null, approvedDays: 7, adminNotes: '', submitting: false })}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={approveModal.submitting}
                  onClick={handleConfirmApprove}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {approveModal.submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <span>Approve &amp; Restore Access</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT REQUEST MODAL */}
      {rejectModal.open && rejectModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-scaleUp">
            <div className="bg-gradient-to-r from-rose-800 to-red-900 text-white p-5">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <XCircle size={20} className="text-rose-300" />
                Reject Trial Extension Request
              </h3>
              <p className="text-xs text-rose-100 mt-0.5">
                Reject extension for {rejectModal.request.tenant?.name}.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Rejection Reason (Will be communicated to Fleet Admin):
                </label>
                <textarea
                  rows={3}
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. The maximum trial extension limit has been reached. Please choose a paid subscription plan."
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, request: null, reason: '', submitting: false })}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={rejectModal.submitting}
                  onClick={handleConfirmReject}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {rejectModal.submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <span>Confirm Rejection</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL EXTEND MODAL */}
      {manualModal.open && manualModal.tenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-scaleUp">
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-5">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <PlusCircle size={20} className="text-indigo-300" />
                Direct Free Trial Extension
              </h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Grant extra trial days directly to {manualModal.tenant.fleetName}.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Additional Days to Grant:
                </label>
                <div className="flex items-center gap-2">
                  {[3, 5, 7, 14, 30].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setManualModal((prev) => ({ ...prev, additionalDays: d }))}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        manualModal.additionalDays === d
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      +{d}d
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={manualModal.additionalDays}
                    onChange={(e) => setManualModal((prev) => ({ ...prev, additionalDays: parseInt(e.target.value, 10) || 1 }))}
                    className="w-20 text-xs p-1.5 border border-gray-300 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Extension Reason / Internal Audit Justification:
                </label>
                <textarea
                  rows={2}
                  value={manualModal.reason}
                  onChange={(e) => setManualModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Courtesy trial extension granted following SuperAdmin client consultation."
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setManualModal({ open: false, tenant: null, additionalDays: 7, reason: '', submitting: false })}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={manualModal.submitting}
                  onClick={handleConfirmManualExtend}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {manualModal.submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Extending...</span>
                    </>
                  ) : (
                    <span>Extend Free Trial</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeTrialManagement;
