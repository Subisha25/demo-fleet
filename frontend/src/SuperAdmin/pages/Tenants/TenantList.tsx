import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import { DataTable, Column } from '../../../components/DataTable';
import CommonButton from '../../../components/CommonButton';
import SearchBar from '../../../components/SearchBar';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';
import { useTenant, TenantInfo } from '../../../context/TenantContext';

const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<TenantInfo | null>(null);
  const [editPlan, setEditPlan] = useState<'BASIC' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editVehicleQuota, setEditVehicleQuota] = useState(75);
  const [editDriverQuota, setEditDriverQuota] = useState(75);
  const [editCompanyQuota, setEditCompanyQuota] = useState(20);

  const navigate = useNavigate();
  const { currentTenant, switchTenant, refreshTenant, loadAllTenants } = useTenant();

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

  const handleSwitchTenant = (tenant: TenantInfo) => {
    switchTenant(tenant.tenantId);
    showToast(`Switched context to ${tenant.name}`, 'success');
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const openEditModal = (tenant: TenantInfo) => {
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

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      (t.contactEmail && t.contactEmail.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<TenantInfo>[] = [
    {
      header: 'Fleet Operator',
      accessor: 'name',
      render: (tenant: TenantInfo) => (
        <div>
          <div className="font-semibold text-gray-900 flex items-center space-x-2">
            <span>{tenant.name}</span>
            {tenant.tenantId === currentTenant?.tenantId && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Active Context
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Code: {tenant.code} | Subdomain: {tenant.subdomain || 'default'}
          </div>
        </div>
      ),
    },
    {
      header: 'Plan Tier',
      accessor: 'planTier',
      render: (tenant: TenantInfo) => (
        <span
          className={`badge-status ${
            tenant.planTier === 'ENTERPRISE'
              ? 'badge-status-enterprise'
              : tenant.planTier === 'PRO'
              ? 'badge-status-pro'
              : 'badge-status-basic'
          }`}
        >
          {tenant.planTier}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (tenant: TenantInfo) => (
        <span
          className={`badge-status ${
            tenant.status === 'ACTIVE'
              ? 'badge-status-active'
              : 'badge-status-suspended'
          }`}
        >
          {tenant.status}
        </span>
      ),
    },
    {
      header: 'Quotas (Vehicles / Drivers / Companies)',
      accessor: 'subscription',
      render: (tenant: TenantInfo) => (
        <div className="text-xs text-slate-700 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Vehicles:</span>
            <span className="font-bold text-slate-800">{tenant.subscription?.vehicleQuota ?? '—'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Drivers:</span>
            <span className="font-bold text-slate-800">{tenant.subscription?.driverQuota ?? '—'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Companies:</span>
            <span className="font-bold text-slate-800">{tenant.subscription?.companyQuota ?? '—'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Email',
      accessor: 'contactEmail',
      render: (tenant: TenantInfo) => (
        <span className="text-xs text-slate-600 font-medium">{tenant.contactEmail || 'N/A'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'tenantId',
      render: (tenant: TenantInfo) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSwitchTenant(tenant)}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white transition shadow-sm"
          >
            Switch To
          </button>
          <button
            onClick={() => openEditModal(tenant)}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition"
          >
            Quotas & Plan
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
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Fleet Operator Tenants (SaaS)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage independent fleet operators, subscription entitlements, and quotas.</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <CommonButton
            text="+ Provision Fleet Tenant"
            onClick={() => navigate('/tenants/add')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm"
          />
          <CommonButton
            text="Corporate Policies"
            onClick={() => navigate('/tenants/policies')}
            className="bg-[#0f1c3f] hover:bg-[#1b2d5b] text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm"
          />
        </div>
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fleet operators by name, code, or email..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredTenants}
        loading={loading}
      />

      {/* Edit Quotas Modal */}
      {selectedTenantForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Edit SaaS Plan & Quotas
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Configuring fleet operator: <strong className="text-gray-800">{selectedTenantForEdit.name}</strong> ({selectedTenantForEdit.code})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Plan Tier
                </label>
                <select
                  value={editPlan}
                  onChange={(e) => {
                    const plan = e.target.value as 'BASIC' | 'PRO' | 'ENTERPRISE';
                    setEditPlan(plan);
                    if (plan === 'BASIC') {
                      setEditVehicleQuota(15);
                      setEditDriverQuota(15);
                      setEditCompanyQuota(3);
                    } else if (plan === 'PRO') {
                      setEditVehicleQuota(75);
                      setEditDriverQuota(75);
                      setEditCompanyQuota(20);
                    } else {
                      setEditVehicleQuota(999999);
                      setEditDriverQuota(999999);
                      setEditCompanyQuota(999999);
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="BASIC">BASIC (15 Vehicles / 15 Drivers / 3 Companies)</option>
                  <option value="PRO">PRO (75 Vehicles / 75 Drivers / 20 Companies)</option>
                  <option value="ENTERPRISE">ENTERPRISE (Unlimited)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="CANCELED">CANCELED</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vehicle Quota
                  </label>
                  <input
                    type="number"
                    value={editVehicleQuota}
                    onChange={(e) => setEditVehicleQuota(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Driver Quota
                  </label>
                  <input
                    type="number"
                    value={editDriverQuota}
                    onChange={(e) => setEditDriverQuota(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company Quota
                  </label>
                  <input
                    type="number"
                    value={editCompanyQuota}
                    onChange={(e) => setEditCompanyQuota(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTenantForEdit(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubscription}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TenantList;
