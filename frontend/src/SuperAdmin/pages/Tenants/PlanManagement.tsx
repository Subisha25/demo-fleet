import React, { useState, useEffect } from 'react';
import PageLayout from '../../../components/PageLayout';
import CommonButton from '../../../components/CommonButton';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faPlus,
  faEdit,
  faCheck,
  faTimes,
  faUsers,
  faCar,
  faBuilding,
  faFilePdf,
  faCheckCircle,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';

interface SaaSPlanItem {
  planId: string;
  planTier: string;
  name: string;
  description: string;
  priceMonthlyINR: number;
  priceAnnualINR: number;
  currency: string;
  billingFrequency: string;
  billingCycles: string[];
  maxVehicles: number;
  maxDrivers: number;
  maxCompanies: number;
  maxUsers: number;
  monthlyTripQuota: number;
  isUnlimitedVehicles: boolean;
  isUnlimitedDrivers: boolean;
  isUnlimitedCompanies: boolean;
  isUnlimitedUsers: boolean;
  isUnlimitedTrips: boolean;
  features: string[];
  featureEntitlements: {
    customBranding?: boolean;
    advancedReports?: boolean;
    customDomain?: boolean;
    multiBranch?: boolean;
    dedicatedPolicyEngine?: boolean;
    pdfCustomizationTier?: 'STANDARD' | 'BRANDED' | 'ADVANCED';
  };
  isActive: boolean;
  subscribersCount?: number;
}

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<SaaSPlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<SaaSPlanItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form fields for Add/Edit
  const [formTier, setFormTier] = useState<string>('CUSTOM');
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formMonthlyPrice, setFormMonthlyPrice] = useState<number>(399);
  const [formAnnualPrice, setFormAnnualPrice] = useState<number>(4000);
  const [formMaxVehicles, setFormMaxVehicles] = useState<number>(20);
  const [formMaxDrivers, setFormMaxDrivers] = useState<number>(20);
  const [formMaxCompanies, setFormMaxCompanies] = useState<number>(5);
  const [formMaxUsers, setFormMaxUsers] = useState<number>(10);
  const [formMonthlyTrips, setFormMonthlyTrips] = useState<number>(2500);
  const [formUnlimitedVehicles, setFormUnlimitedVehicles] = useState<boolean>(false);
  const [formUnlimitedDrivers, setFormUnlimitedDrivers] = useState<boolean>(false);
  const [formUnlimitedCompanies, setFormUnlimitedCompanies] = useState<boolean>(false);
  const [formUnlimitedUsers, setFormUnlimitedUsers] = useState<boolean>(false);
  const [formUnlimitedTrips, setFormUnlimitedTrips] = useState<boolean>(false);
  const [formCustomBranding, setFormCustomBranding] = useState<boolean>(true);
  const [formAdvancedReports, setFormAdvancedReports] = useState<boolean>(true);
  const [formPdfTier, setFormPdfTier] = useState<'STANDARD' | 'BRANDED' | 'ADVANCED'>('BRANDED');
  const [formFeaturesText, setFormFeaturesText] = useState<string>('');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/tenants/admin/plans');
      if (res.data && Array.isArray(res.data.plans)) {
        setPlans(res.data.plans);
      }
    } catch (err: any) {
      console.error('Error fetching SaaS plans:', err);
      showToast(err?.response?.data?.message || 'Failed to fetch SaaS plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setSelectedPlanForEdit(null);
    setFormTier('');
    setFormName('');
    setFormDescription('');
    setFormMonthlyPrice(399);
    setFormAnnualPrice(4000);
    setFormMaxVehicles(20);
    setFormMaxDrivers(20);
    setFormMaxCompanies(5);
    setFormMaxUsers(10);
    setFormMonthlyTrips(2500);
    setFormUnlimitedVehicles(false);
    setFormUnlimitedDrivers(false);
    setFormUnlimitedCompanies(false);
    setFormUnlimitedUsers(false);
    setFormUnlimitedTrips(false);
    setFormCustomBranding(true);
    setFormAdvancedReports(false);
    setFormPdfTier('BRANDED');
    setFormFeaturesText('Standard Fleet Operations\nCorporate Billing\nEmail Notifications');
    setShowAddModal(true);
  };

  const openEditModal = (p: SaaSPlanItem) => {
    setSelectedPlanForEdit(p);
    setFormTier(p.planTier);
    setFormName(p.name);
    setFormDescription(p.description || '');
    setFormMonthlyPrice(p.priceMonthlyINR);
    setFormAnnualPrice(p.priceAnnualINR);
    setFormMaxVehicles(p.maxVehicles);
    setFormMaxDrivers(p.maxDrivers);
    setFormMaxCompanies(p.maxCompanies);
    setFormMaxUsers(p.maxUsers);
    setFormMonthlyTrips(p.monthlyTripQuota);
    setFormUnlimitedVehicles(p.isUnlimitedVehicles);
    setFormUnlimitedDrivers(p.isUnlimitedDrivers);
    setFormUnlimitedCompanies(p.isUnlimitedCompanies);
    setFormUnlimitedUsers(p.isUnlimitedUsers);
    setFormUnlimitedTrips(p.isUnlimitedTrips);
    setFormCustomBranding(Boolean(p.featureEntitlements?.customBranding));
    setFormAdvancedReports(Boolean(p.featureEntitlements?.advancedReports));
    setFormPdfTier(p.featureEntitlements?.pdfCustomizationTier || 'STANDARD');
    setFormFeaturesText((p.features || []).join('\n'));
    setShowAddModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Plan name is required', 'error');
      return;
    }

    const featuresList = formFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      planTier: formTier.toUpperCase().trim(),
      name: formName.trim(),
      description: formDescription,
      priceMonthlyINR: Number(formMonthlyPrice),
      priceAnnualINR: Number(formAnnualPrice),
      currency: 'INR',
      billingCycles: ['MONTHLY', 'ANNUAL'],
      maxVehicles: Number(formMaxVehicles),
      maxDrivers: Number(formMaxDrivers),
      maxCompanies: Number(formMaxCompanies),
      maxUsers: Number(formMaxUsers),
      monthlyTripQuota: Number(formMonthlyTrips),
      isUnlimitedVehicles: formUnlimitedVehicles,
      isUnlimitedDrivers: formUnlimitedDrivers,
      isUnlimitedCompanies: formUnlimitedCompanies,
      isUnlimitedUsers: formUnlimitedUsers,
      isUnlimitedTrips: formUnlimitedTrips,
      features: featuresList,
      featureEntitlements: {
        customBranding: formCustomBranding,
        advancedReports: formAdvancedReports,
        pdfCustomizationTier: formPdfTier,
      },
    };

    try {
      if (selectedPlanForEdit) {
        await axiosInstance.put(`/tenants/admin/plans/${selectedPlanForEdit.planId}`, payload);
        showToast(`Plan '${formName}' updated successfully`, 'success');
      } else {
        await axiosInstance.post('/tenants/admin/plans', payload);
        showToast(`Plan '${formName}' created successfully`, 'success');
      }
      setShowAddModal(false);
      fetchPlans();
    } catch (err: any) {
      console.error('Error saving plan:', err);
      showToast(err?.response?.data?.message || 'Failed to save plan', 'error');
    }
  };

  const handleToggleActive = async (plan: SaaSPlanItem) => {
    try {
      await axiosInstance.put(`/tenants/admin/plans/${plan.planId}/toggle-active`);
      showToast(`Plan '${plan.name}' active state updated`, 'success');
      fetchPlans();
    } catch (err: any) {
      console.error('Error toggling active state:', err);
      showToast(err?.response?.data?.message || 'Failed to toggle plan status', 'error');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <PageLayout breadcrumbName="SaaS Subscription Plans">
      <AlertContainer />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FontAwesomeIcon icon={faCrown} className="text-amber-500" />
            <span>SaaS Subscription Plans & Quotas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-tenant pricing, quota limits, unlimited resource flags, and PDF branding entitlements.
          </p>
        </div>
        <div>
          <CommonButton
            text="+ Add New Plan"
            onClick={openAddModal}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mr-3"></div>
          Loading plan catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.planId}
              className={`bg-white rounded-xl border shadow-sm flex flex-col transition hover:shadow-md ${
                p.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        p.planTier === 'ENTERPRISE'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : p.planTier === 'PRO'
                          ? 'bg-teal-100 text-teal-800 border border-teal-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {p.planTier}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">{p.name}</h2>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description || 'No description provided.'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Subscribers</span>
                  <span className="text-sm font-extrabold text-slate-800">{p.subscribersCount || 0} fleets</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="p-5 bg-slate-50/70 border-b border-slate-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(p.priceMonthlyINR)}</span>
                  <span className="text-xs text-slate-500 font-semibold">/ month</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Annual Billing: <strong>{formatCurrency(p.priceAnnualINR)}</strong> / year
                </div>
              </div>

              {/* Resource Quotas */}
              <div className="p-5 border-b border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCar} className="text-slate-400 w-3.5" />
                    Vehicles:
                  </span>
                  <strong className="text-slate-900">{p.isUnlimitedVehicles ? 'Unlimited' : p.maxVehicles}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-slate-400 w-3.5" />
                    Drivers:
                  </span>
                  <strong className="text-slate-900">{p.isUnlimitedDrivers ? 'Unlimited' : p.maxDrivers}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} className="text-slate-400 w-3.5" />
                    Corporate Companies:
                  </span>
                  <strong className="text-slate-900">{p.isUnlimitedCompanies ? 'Unlimited' : p.maxCompanies}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilePdf} className="text-slate-400 w-3.5" />
                    PDF Customization:
                  </span>
                  <strong className="text-slate-900">{p.featureEntitlements?.pdfCustomizationTier || 'STANDARD'}</strong>
                </div>
              </div>

              {/* Features bullets */}
              <div className="p-5 flex-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Entitlements</div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {(p.features || []).slice(0, 5).map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-teal-600 text-xs mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(p)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded border transition ${
                    p.isActive
                      ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {p.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openEditModal(p)}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded shadow-sm transition flex items-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedPlanForEdit ? `Edit Plan: ${selectedPlanForEdit.name}` : 'Create New SaaS Plan'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plan Tier Code (e.g. BASIC, PRO)</label>
                  <input
                    type="text"
                    disabled={Boolean(selectedPlanForEdit)}
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono uppercase"
                    placeholder="TIER_CODE"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                    placeholder="Plan Display Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 h-16"
                  placeholder="Plan description and target audience..."
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Price (₹ INR)</label>
                  <input
                    type="number"
                    value={formMonthlyPrice}
                    onChange={(e) => setFormMonthlyPrice(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Annual Price (₹ INR)</label>
                  <input
                    type="number"
                    value={formAnnualPrice}
                    onChange={(e) => setFormAnnualPrice(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Quotas & Unlimited Toggles */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-3">
                <div className="font-bold text-slate-800">Resource Quota Configuration</div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Max Vehicles</label>
                    <input
                      type="number"
                      disabled={formUnlimitedVehicles}
                      value={formMaxVehicles}
                      onChange={(e) => setFormMaxVehicles(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5"
                    />
                    <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={formUnlimitedVehicles}
                        onChange={(e) => setFormUnlimitedVehicles(e.target.checked)}
                      />
                      Unlimited
                    </label>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Max Drivers</label>
                    <input
                      type="number"
                      disabled={formUnlimitedDrivers}
                      value={formMaxDrivers}
                      onChange={(e) => setFormMaxDrivers(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5"
                    />
                    <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={formUnlimitedDrivers}
                        onChange={(e) => setFormUnlimitedDrivers(e.target.checked)}
                      />
                      Unlimited
                    </label>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Max Companies</label>
                    <input
                      type="number"
                      disabled={formUnlimitedCompanies}
                      value={formMaxCompanies}
                      onChange={(e) => setFormMaxCompanies(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5"
                    />
                    <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={formUnlimitedCompanies}
                        onChange={(e) => setFormUnlimitedCompanies(e.target.checked)}
                      />
                      Unlimited
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-slate-600 block mb-1">Max Corporate Users</label>
                    <input
                      type="number"
                      disabled={formUnlimitedUsers}
                      value={formMaxUsers}
                      onChange={(e) => setFormMaxUsers(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5"
                    />
                    <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={formUnlimitedUsers}
                        onChange={(e) => setFormUnlimitedUsers(e.target.checked)}
                      />
                      Unlimited
                    </label>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Monthly Trips Quota</label>
                    <input
                      type="number"
                      disabled={formUnlimitedTrips}
                      value={formMonthlyTrips}
                      onChange={(e) => setFormMonthlyTrips(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5"
                    />
                    <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={formUnlimitedTrips}
                        onChange={(e) => setFormUnlimitedTrips(e.target.checked)}
                      />
                      Unlimited
                    </label>
                  </div>
                </div>
              </div>

              {/* Entitlements */}
              <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-lg p-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PDF Branding Customization Tier</label>
                  <select
                    value={formPdfTier}
                    onChange={(e: any) => setFormPdfTier(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs"
                  >
                    <option value="STANDARD">STANDARD (Fixed system theme)</option>
                    <option value="BRANDED">BRANDED (Custom logo & header color)</option>
                    <option value="ADVANCED">ADVANCED (Full font, color & placement customization)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-center space-y-2 pt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formCustomBranding}
                      onChange={(e) => setFormCustomBranding(e.target.checked)}
                    />
                    <span>Tenant Portal Theming Allowed</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formAdvancedReports}
                      onChange={(e) => setFormAdvancedReports(e.target.checked)}
                    />
                    <span>Advanced Route & Revenue Reports</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Plan Features (One per line)</label>
                <textarea
                  value={formFeaturesText}
                  onChange={(e) => setFormFeaturesText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 h-20"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Save Plan Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default PlanManagement;
