import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import CommonButton from '../../../components/CommonButton';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';
import { useTenant } from '../../../context/TenantContext';

const AddTenant: React.FC = () => {
  const navigate = useNavigate();
  const { loadAllTenants } = useTenant();

  const [form, setForm] = useState({
    name: '',
    code: '',
    subdomain: '',
    planTier: 'PRO' as 'BASIC' | 'PRO' | 'ENTERPRISE',
    contactEmail: '',
    contactPhone: '',
    primaryColor: '#0f1c3f',
    secondaryColor: '#0d9488',
    portalTitle: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase().replace(/[^A-Z0-9]/g, '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      showToast('Tenant Name and Code are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/tenants', {
        name: form.name,
        code: form.code,
        subdomain: form.subdomain || form.code.toLowerCase(),
        planTier: form.planTier,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        brandingTokens: {
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor,
          portalTitle: form.portalTitle || form.name,
        },
      });

      showToast(`Fleet operator ${form.name} provisioned successfully!`, 'success');
      await loadAllTenants();
      setTimeout(() => {
        navigate('/tenants/list');
      }, 700);
    } catch (err: any) {
      console.error('Error provisioning tenant:', err);
      showToast(err?.response?.data?.message || 'Failed to provision tenant.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout breadcrumbName="Provision Tenant">
      <AlertContainer />
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Operator Setup & Entitlement</h2>
          <p className="text-xs text-gray-500 mt-1">
            Provision an isolated SaaS fleet tenant with customized plan tier, operational quotas, and brand tokens.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Fleet Operator Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Apex Express Cabs"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tenant Code (Unique) *
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                maxLength={10}
                placeholder="e.g. APX"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm uppercase font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-gray-400">Short prefix used for invoice and booking sequences</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Subdomain Prefix
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="subdomain"
                  value={form.subdomain}
                  onChange={handleChange}
                  placeholder="e.g. apex"
                  className="w-full border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 text-xs text-gray-500 rounded-r-md">
                  .gracecabs.in
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                SaaS Subscription Tier *
              </label>
              <select
                name="planTier"
                value={form.planTier}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="BASIC">BASIC (15 Vehicles, 15 Drivers, 3 Corporate Clients)</option>
                <option value="PRO">PRO (75 Vehicles, 75 Drivers, 20 Corporate Clients)</option>
                <option value="ENTERPRISE">ENTERPRISE (Unlimited Fleet Scale)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="ops@apexcabs.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Branding Section */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Operator Brand Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Portal Header Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={form.primaryColor}
                    onChange={handleChange}
                    className="w-10 h-9 p-0.5 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={form.primaryColor}
                    onChange={handleChange}
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Custom Portal Title
                </label>
                <input
                  type="text"
                  name="portalTitle"
                  value={form.portalTitle}
                  onChange={handleChange}
                  placeholder="e.g. Apex Cab Manager"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/tenants/list')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <CommonButton
              type="submit"
              text={submitting ? 'Provisioning...' : 'Provision Fleet Operator'}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition"
            />
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default AddTenant;
