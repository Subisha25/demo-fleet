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
          <span
            className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              tenant.planTier === 'ENTERPRISE'
                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                : tenant.planTier === 'PRO'
                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {tenant.planTier}
          </span>
          <div className="text-[11px] text-slate-500">
            Cycle: <strong className="text-slate-700">{(tenant.subscription as any)?.billingCycle || 'MONTHLY'}</strong>
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
      header: 'Subscription Dates',
      accessor: 'subscription',
      render: (tenant: EnrichedTenant) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-600">
            Start: <strong className="text-slate-800">{formatDate(tenant.subscription?.currentPeriodStart)}</strong>
          </div>
          <div className="text-slate-600">
            Renewal: <strong className="text-slate-800">{formatDate(tenant.subscription?.currentPeriodEnd)}</strong>
          </div>
        </div>
      ),
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
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm"
          />
          <CommonButton
            text="SaaS Plans"
            onClick={() => navigate('/tenants/plans')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm"
          />
          <CommonButton
            text="Corporate Policies"
            onClick={() => navigate('/tenants/policies')}
            className="bg-[#0f1c3f] hover:bg-[#1b2d5b] text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm"
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
              className="border border-slate-300 rounded-lg p-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
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
              className="border border-slate-300 rounded-lg p-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TenantList;
