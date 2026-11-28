import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import { DataTable, Column } from '../../../components/DataTable';
import CommonButton from '../../../components/CommonButton';
import SearchBar from '../../../components/SearchBar';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';
import { useTenant, TenantInfo } from '../../../context/TenantContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faReceipt,
  faSlidersH,
  faShieldAlt,
  faCrown,
  faCheckCircle,
  faClock,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';

interface EnrichedTenant extends TenantInfo {
  createdAt?: string;
  trialStartDate?: string;
  originalTrialDays?: number;
  extendedTrialDays?: number;
  totalTrialDays?: number;
  originalTrialExpiry?: string;
  trialEndsAt?: string;
  trialDurationDays?: number;
  trialStatus?: string;
  remainingTrialDays?: number;
  remainingTrialMs?: number;
  actualPlanDisplay?: string;
  paymentStatusDisplay?: string;
  trialExtensionHistory?: Array<{
    extendedBy: string;
    extendedAt: string;
    daysAdded: number;
    previousExpiry: string;
    newExpiry: string;
    reason: string;
  }>;
  usage?: {
    vehicles: number;
    drivers: number;
    companies: number;
    users?: number;
  };
  lastPayment?: {
    date: string | null;
    amount: number | null;
    invoiceNumber: string | null;
    transactionReference: string | null;
  } | null;
  demoCallDate?: string | null;
  demoCallTime?: string | null;
  demoCallStatus?: 'ACTIVE' | 'INACTIVE' | 'NOT SCHEDULED';
  demoCall?: {
    demoCallDate: string | null;
    demoCallTime: string | null;
    demoCallStatus: 'ACTIVE' | 'INACTIVE' | 'NOT SCHEDULED';
    appointmentIso: string | null;
    formattedAppointment: string | null;
    isUpcoming: boolean;
    registrationDate?: string | null;
    approvalDate?: string | null;
  };
}

const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<EnrichedTenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');

  // Edit Quotas & Plan Modal
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<EnrichedTenant | null>(null);
  const [editPlan, setEditPlan] = useState<'BASIC' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editVehicleQuota, setEditVehicleQuota] = useState(75);
  const [editDriverQuota, setEditDriverQuota] = useState(75);
  const [editCompanyQuota, setEditCompanyQuota] = useState(20);

  // Free Trial Extension Modal
  const [selectedTenantForTrial, setSelectedTenantForTrial] = useState<EnrichedTenant | null>(null);
  const [extensionDays, setExtensionDays] = useState(3);
  const [extensionReason, setExtensionReason] = useState('');
  const [extendingTrial, setExtendingTrial] = useState(false);

  const navigate = useNavigate();
  const { currentTenant, refreshTenant, loadAllTenants } = useTenant();

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/tenants');
      if (res.data && Array.isArray(res.data.tenants)) {
        setTenants(res.data.tenants);
      }
    } catch (err: any) {
      console.error('Failed to fetch tenants:', err);
      showToast('Error fetching fleet tenants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const openEditModal = (tenant: EnrichedTenant) => {
    setSelectedTenantForEdit(tenant);
    setEditPlan(tenant.planTier);
    setEditStatus(tenant.status);
    setEditVehicleQuota(tenant.subscription?.vehicleQuota || 75);
    setEditDriverQuota(tenant.subscription?.driverQuota || 75);
    setEditCompanyQuota(tenant.subscription?.companyQuota || 20);
  };

  const handleSaveSubscription = async () => {
    if (!selectedTenantForEdit) return;
    try {
      await axiosInstance.put(`/tenants/${selectedTenantForEdit.tenantId}/subscription`, {
        planTier: editPlan,
        status: editStatus,
        vehicleQuota: editVehicleQuota,
        driverQuota: editDriverQuota,
        companyQuota: editCompanyQuota,
      });
      showToast('Tenant plan and quotas updated successfully', 'success');
      setSelectedTenantForEdit(null);
      fetchTenants();
      refreshTenant();
      loadAllTenants();
    } catch (err: any) {
      console.error('Error updating tenant subscription:', err);
      showToast(err?.response?.data?.message || 'Failed to update subscription', 'error');
    }
  };

  const handleExtendTrial = async () => {
    if (!selectedTenantForTrial) return;
    setExtendingTrial(true);
    try {
      const res = await axiosInstance.post(`/tenants/${selectedTenantForTrial.tenantId}/extend-trial`, {
        additionalDays: extensionDays,
        reason: extensionReason,
      });
      if (res.data?.success) {
        showToast(res.data.message || 'Free trial extended successfully', 'success');
        setSelectedTenantForTrial(null);
        setExtensionReason('');
        fetchTenants();
      } else {
        showToast(res.data?.message || 'Failed to extend trial', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error extending trial', 'error');
    } finally {
      setExtendingTrial(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Authoritative filtering:
  // 1. Exclude platform root / demo record from customer table
  // 2. Filter by search query (name, code, email, phone)
  // 3. Filter by status (ACTIVE, TRIALING, etc.)
  // 4. Filter by plan (BASIC, PRO, ENTERPRISE)
  const filteredTenants = tenants
    .filter((t) => {
      // Exclude platform root identity
      if (t.tenantId === 'e7b8a1c0-0000-0000-0000-000000000001' || t.code === 'GC') {
        return false;
      }
      return true;
    })
    .filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (planFilter !== 'ALL' && t.planTier !== planFilter) return false;
      if (!search.trim()) return true;

      const s = search.toLowerCase();
      return (
        t.name?.toLowerCase().includes(s) ||
        t.code?.toLowerCase().includes(s) ||
        t.contactEmail?.toLowerCase().includes(s) ||
        t.contactPhone?.toLowerCase().includes(s) ||
        t.subdomain?.toLowerCase().includes(s)
      );
    });

  const columns: Column<EnrichedTenant>[] = [
    {
      header: 'Fleet Operator',
      accessor: 'name',
      render: (tenant: EnrichedTenant) => {
        const logo = tenant.brandingTokens?.logoUrl;
        const color = tenant.brandingTokens?.primaryColor || '#1A365D';
        return (
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt={tenant.name}
                className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-slate-50 p-0.5"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-sm"
                style={{ backgroundColor: color }}
              >
                {tenant.code?.substring(0, 3)}
              </div>
            )}
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{tenant.name}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                  {tenant.code}
                </span>
                {tenant.subdomain && <span>{tenant.subdomain}.fleetflow.com</span>}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Administrator Contact',
      accessor: 'contactEmail',
      render: (tenant: EnrichedTenant) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{tenant.contactEmail || 'N/A'}</div>
          <div className="text-slate-500 text-[11px] mt-0.5">{tenant.contactPhone || 'No Phone'}</div>
        </div>
      ),
    },
    {
      header: 'Plan & Billing',
      accessor: 'planTier',
      render: (tenant: EnrichedTenant) => (
        <div className="space-y-1">
          {tenant.status === 'TRIALING' ? (
            <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
              FREE TRIAL
            </span>
          ) : (
            <span
              className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                tenant.planTier === 'ENTERPRISE'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : tenant.planTier === 'PRO'
                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                  : 'bg-slate-100 text-slate-800 border border-slate-300'
              }`}
            >
              {tenant.planTier || 'NO PLAN'}
            </span>
          )}
          <div className="text-[11px] text-slate-500">
            {tenant.status === 'TRIALING' ? (
              <span className="text-emerald-700 font-semibold">₹0 Upfront</span>
            ) : (
              <>Cycle: <strong className="text-slate-700">{(tenant.subscription as any)?.billingCycle || 'MONTHLY'}</strong></>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (tenant: EnrichedTenant) => (
        <span
          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
            tenant.status === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : tenant.status === 'TRIALING'
              ? 'bg-sky-100 text-sky-800 border border-sky-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}
        >
          {tenant.status}
        </span>
      ),
    },
    {
      header: 'Demo Call Date',
      accessor: 'demoCallDate',
      render: (tenant: EnrichedTenant) => {
        const date = tenant.demoCallDate || tenant.demoCall?.demoCallDate;
        return (
          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-[11px]" />
            <span>{date || 'Not Scheduled'}</span>
          </div>
        );
      },
    },
    {
      header: 'Demo Call Time',
      accessor: 'demoCallTime',
      render: (tenant: EnrichedTenant) => {
        const time = tenant.demoCallTime || tenant.demoCall?.demoCallTime;
        return (
          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
            <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[11px]" />
            <span>{time || '—'}</span>
          </div>
        );
      },
    },
    {
      header: 'Demo Call Status',
      accessor: 'demoCallStatus',
      render: (tenant: EnrichedTenant) => {
        const status = tenant.demoCallStatus || tenant.demoCall?.demoCallStatus || 'NOT SCHEDULED';
        if (status === 'ACTIVE') {
          return (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              ACTIVE
            </span>
          );
        }
        if (status === 'INACTIVE') {
          return (
            <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300 tracking-wider">
              INACTIVE
            </span>
          );
        }
        return (
          <span className="inline-flex items-center text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 tracking-wider">
            NOT SCHEDULED
          </span>
        );
      },
    },
    {
      header: 'Resource Usage (Used / Quota)',
      accessor: 'subscription',
      render: (tenant: EnrichedTenant) => {
        const usage = tenant.usage || { vehicles: 0, drivers: 0, companies: 0 };
        const sub = tenant.subscription;
        const vMax = (sub?.vehicleQuota != null && sub.vehicleQuota >= 999999) ? '∞' : (sub?.vehicleQuota ?? 15);
        const dMax = (sub?.driverQuota != null && sub.driverQuota >= 999999) ? '∞' : (sub?.driverQuota ?? 15);
        const cMax = (sub?.companyQuota != null && sub.companyQuota >= 999999) ? '∞' : (sub?.companyQuota ?? 3);

        return (
          <div className="text-xs space-y-0.5">
            <div className="text-slate-700">
              Vehicles: <strong className="text-slate-900">{usage.vehicles}</strong> / {vMax}
            </div>
            <div className="text-slate-700">
              Drivers: <strong className="text-slate-900">{usage.drivers}</strong> / {dMax}
            </div>
            <div className="text-slate-700">
              Companies: <strong className="text-slate-900">{usage.companies}</strong> / {cMax}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Free Trial & Subscription',
      accessor: 'subscription',
      render: (tenant: EnrichedTenant) => {
        const start = tenant.trialStartDate || (tenant.subscription as any)?.trialStartDate || tenant.createdAt;
        const expiry = tenant.trialEndsAt || (tenant.subscription as any)?.trialEndsAt || (tenant.subscription as any)?.currentPeriodEnd;
        const remaining = tenant.remainingTrialDays ?? (expiry ? Math.max(0, Math.ceil((new Date(expiry).getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : 0);
        const originalDays = tenant.originalTrialDays || 7;
        const extendedDays = tenant.extendedTrialDays ?? Math.max(0, (tenant.totalTrialDays || tenant.trialDurationDays || 7) - 7);
        const total = tenant.totalTrialDays || tenant.trialDurationDays || (originalDays + extendedDays);
        const status = tenant.trialStatus || (tenant.status === 'TRIALING' ? (remaining > 0 ? 'TRIAL_ACTIVE' : 'TRIAL_EXPIRED') : tenant.status);
        const planDisplay = tenant.actualPlanDisplay || (tenant.status === 'TRIALING' ? 'FREE TRIAL' : tenant.planTier);
        const paymentDisplay = tenant.paymentStatusDisplay || (tenant.status === 'TRIALING' ? 'Unpaid (Trial)' : 'Active Verified');

        return (
          <div className="text-xs space-y-1.5 min-w-[200px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  status === 'TRIAL_ACTIVE' || status === 'TRIALING'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : status === 'TRIAL_EXPIRED'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : status === 'ACTIVE' || status === 'ACTIVE_PAID'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {status === 'TRIAL_ACTIVE' || status === 'TRIALING'
                  ? 'FREE TRIAL ACTIVE'
                  : status === 'TRIAL_EXPIRED'
                  ? 'TRIAL EXPIRED'
                  : status}
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {planDisplay}
              </span>
            </div>

            {/* Trial Duration Breakdown: Separate 7 Days vs Extended Days */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] space-y-0.5">
              <div className="flex justify-between text-slate-600">
                <span>Original Free Trial:</span>
                <strong className="text-indigo-700">7 Days</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Extra Extended:</span>
                <strong className="text-purple-700">+{extendedDays} Days</strong>
              </div>
              <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-0.5 font-bold">
                <span>Total Duration:</span>
                <span>{total} Days ({remaining}d left)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-0.5">
              <div>Start: <span className="text-slate-800 font-medium">{formatDate(start)}</span></div>
              <div>Expiry: <span className="text-slate-800 font-medium">{formatDate(expiry)}</span></div>
              <div>Payment: <span className="text-slate-700 font-medium">{paymentDisplay}</span></div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Last Payment',
      accessor: 'lastPayment',
      render: (tenant: EnrichedTenant) => {
        const lp = tenant.lastPayment;
        return (
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-slate-900">{lp ? formatCurrency(lp.amount) : 'None Recorded'}</div>
            <div className="text-[11px] text-slate-500">{lp ? formatDate(lp.date) : 'Pending Callback'}</div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'tenantId',
      render: (tenant: EnrichedTenant) => (
        <div className="flex items-center space-x-1.5">
          {/* Primary View / Inspect Action */}
          <button
            onClick={() => navigate(`/tenants/overview/${tenant.tenantId}`)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition shadow-sm flex items-center gap-1"
            title="Open Dedicated Read-Only Fleet Overview Dashboard"
          >
            <FontAwesomeIcon icon={faEye} />
            View
          </button>

          {/* Billing & Payment History */}
          <button
            onClick={() => navigate(`/tenants/billing-history/${tenant.tenantId}`)}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            title="View Subscription & Payment History"
          >
            <FontAwesomeIcon icon={faReceipt} />
          </button>

          {/* Quotas & Plan Modal */}
          <button
            onClick={() => openEditModal(tenant)}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            title="Adjust Quotas & Plan Tier"
          >
            <FontAwesomeIcon icon={faSlidersH} />
          </button>

          {/* Extend Free Trial Action */}
          <button
            onClick={() => {
              setSelectedTenantForTrial(tenant);
              setExtensionDays(3);
              setExtensionReason('');
            }}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center gap-1 shadow-sm"
            title="Extend Free Trial (+Days)"
          >
            <FontAwesomeIcon icon={faClock} />
            Extend
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout breadcrumbName="Fleet Operator Tenants">
      <AlertContainer />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fleet Operator Tenants (SaaS)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect authoritative customer fleet telemetry, subscription lifecycle, quotas, and payment history.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <CommonButton
            text="+ Provision Fleet Tenant"
            onClick={() => navigate('/tenants/add')}
            className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm"
          />
          <CommonButton
            text="SaaS Plans"
            onClick={() => navigate('/tenants/plans')}
            className="border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm"
          />
          <CommonButton
            text="Corporate Policies"
            onClick={() => navigate('/tenants/policies')}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm"
          />
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by fleet name, code, email, phone, or subdomain..."
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg p-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="TRIALING">TRIALING</option>
              <option value="PAST_DUE">PAST_DUE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="border border-slate-300 rounded-lg p-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
            >
              <option value="ALL">All Plans</option>
              <option value="BASIC">BASIC</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTenants}
        loading={loading}
        emptyMessage="No customer fleet operators match the selected criteria."
      />

      {/* Edit Quotas & Plan Modal */}
      {selectedTenantForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Adjust Quotas & Plan — {selectedTenantForEdit.name}
              </h3>
              <button
                onClick={() => setSelectedTenantForEdit(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Plan Tier</label>
                <select
                  value={editPlan}
                  onChange={(e: any) => setEditPlan(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="BASIC">BASIC (Starter Mobility)</option>
                  <option value="PRO">PRO (Growth Fleet Pro)</option>
                  <option value="ENTERPRISE">ENTERPRISE (Mobility Suite)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subscription Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="TRIALING">TRIALING</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="CANCELED">CANCELED</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Max Vehicles</label>
                  <input
                    type="number"
                    value={editVehicleQuota}
                    onChange={(e) => setEditVehicleQuota(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded p-1.5"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Max Drivers</label>
                  <input
                    type="number"
                    value={editDriverQuota}
                    onChange={(e) => setEditDriverQuota(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded p-1.5"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-semibold">Max Companies</label>
                  <input
                    type="number"
                    value={editCompanyQuota}
                    onChange={(e) => setEditCompanyQuota(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded p-1.5"
                    min="1"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedTenantForEdit(null)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSubscription}
                  className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Extend Free Trial */}
      {selectedTenantForTrial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Extend Free Trial</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grant additional free-trial days for <strong>{selectedTenantForTrial.name}</strong> ({selectedTenantForTrial.code})
                </p>
              </div>
              <button
                onClick={() => setSelectedTenantForTrial(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 font-medium block">Original Free Trial:</span>
                  <span className="text-sm font-bold text-indigo-700">7 Days</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Extra Extended:</span>
                  <span className="text-sm font-bold text-purple-700">
                    +{selectedTenantForTrial.extendedTrialDays ?? Math.max(0, (selectedTenantForTrial.trialDurationDays || 7) - 7)} Days
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Total Days So Far:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedTenantForTrial.totalTrialDays || selectedTenantForTrial.trialDurationDays || 7} Days
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Trial Started Date:</span>
                  <span className="text-xs font-bold text-slate-800">
                    {formatDate(
                      selectedTenantForTrial.trialStartDate ||
                      (selectedTenantForTrial.subscription as any)?.trialStartDate ||
                      selectedTenantForTrial.createdAt
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Current Expiry Date:</span>
                  <span className="text-xs font-bold text-slate-800">
                    {formatDate(
                      selectedTenantForTrial.trialEndsAt ||
                      (selectedTenantForTrial.subscription as any)?.trialEndsAt ||
                      (selectedTenantForTrial.subscription as any)?.currentPeriodEnd
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Remaining Days:</span>
                  <span className="text-xs font-bold text-emerald-700">
                    {selectedTenantForTrial.remainingTrialDays ?? '—'} Days
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Free Trial Days <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-1.5">
                    {[3, 7, 14, 30].map((quickDay) => (
                      <button
                        key={quickDay}
                        type="button"
                        onClick={() => setExtensionDays(quickDay)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md border transition ${
                          extensionDays === quickDay
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        +{quickDay}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculated New Expiry and Duration Live Preview */}
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-indigo-900 font-bold block text-xs">New Trial Expiry Date Preview:</span>
                    <span className="text-[11px] text-indigo-700">
                      Calculated from current expiry (+{extensionDays} days)
                    </span>
                  </div>
                  <div className="text-sm font-black text-indigo-950">
                    {(() => {
                      const existingStr =
                        selectedTenantForTrial.trialEndsAt ||
                        (selectedTenantForTrial.subscription as any)?.trialEndsAt ||
                        (selectedTenantForTrial.subscription as any)?.currentPeriodEnd;
                      const existingDate = existingStr ? new Date(existingStr) : new Date();
                      const baseTime = existingDate.getTime() < Date.now() ? Date.now() : existingDate.getTime();
                      const newExpiryDate = new Date(baseTime + extensionDays * 24 * 60 * 60 * 1000);
                      return newExpiryDate.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                    })()}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-indigo-100 pt-1.5 text-[11px]">
                  <span className="text-indigo-800">New Total Trial Duration:</span>
                  <span className="font-bold text-indigo-950">
                    {(selectedTenantForTrial.totalTrialDays || selectedTenantForTrial.trialDurationDays || 7) + extensionDays} Days
                    (7 Original + {((selectedTenantForTrial.extendedTrialDays ?? Math.max(0, (selectedTenantForTrial.trialDurationDays || 7) - 7)) + extensionDays)} Extended)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Extension (Optional)
                </label>
                <input
                  type="text"
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="E.g., Customer requested extra evaluation time for route consolidation."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Extension History Table */}
              {Array.isArray(selectedTenantForTrial.trialExtensionHistory) &&
                selectedTenantForTrial.trialExtensionHistory.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1.5">Trial Extension Audit History:</span>
                    <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <th className="p-2">Extended At</th>
                            <th className="p-2">Days</th>
                            <th className="p-2">Prev Expiry</th>
                            <th className="p-2">New Expiry</th>
                            <th className="p-2">Extended By</th>
                            <th className="p-2">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedTenantForTrial.trialExtensionHistory.map((h, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 text-slate-600">{new Date(h.extendedAt).toLocaleDateString('en-IN')}</td>
                              <td className="p-2 font-bold text-indigo-700">+{h.daysAdded}d</td>
                              <td className="p-2 text-slate-500">{new Date(h.previousExpiry).toLocaleDateString('en-IN')}</td>
                              <td className="p-2 font-semibold text-slate-800">{new Date(h.newExpiry).toLocaleDateString('en-IN')}</td>
                              <td className="p-2 font-medium text-slate-700">{h.extendedBy}</td>
                              <td className="p-2 text-slate-600 italic">{h.reason || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
              <button
                disabled={extendingTrial}
                onClick={() => setSelectedTenantForTrial(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                disabled={extendingTrial}
                onClick={handleExtendTrial}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                {extendingTrial && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Confirm Trial Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TenantList;
