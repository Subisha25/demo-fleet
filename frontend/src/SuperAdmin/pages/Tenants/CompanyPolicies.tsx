import React, { useState, useEffect } from 'react';
import PageLayout from '../../../components/PageLayout';
import CommonButton from '../../../components/CommonButton';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';

interface CompanyItem {
  companyId: string;
  companyName: string;
  companyCode?: string;
}

const CompanyPolicies: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [policyForm, setPolicyForm] = useState({
    allowedEmailDomains: '',
    employeeIdLabel: 'Employee ID',
    employeeIdRegex: '',
    requireCostCenter: false,
    requireDepartment: false,
    requireManagerApproval: false,
    allowSelfBookingOnBehalf: true,
    minAdvanceBookingMinutes: 60,
    allowNightTravel: true,
    billingMode: 'SINGLE_TRIP' as 'SINGLE_TRIP' | 'ON_CALL' | 'MONTHLY',
    taxExempt: false,
  });

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get('/company/listCompany');
      const list = res.data?.data || res.data?.companies || res.data || [];
      if (Array.isArray(list)) {
        setCompanies(list);
        if (list.length > 0) {
          setSelectedCompanyId(list[0].companyId);
        }
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchPolicy = async (companyId: string) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/tenants/policies/${companyId}`);
      const pol = res.data?.policy;
      if (pol) {
        setPolicyForm({
          allowedEmailDomains: (pol.identity?.allowedEmailDomains || []).join(', '),
          employeeIdLabel: pol.identity?.employeeIdLabel || 'Employee ID',
          employeeIdRegex: pol.identity?.employeeIdRegex || '',
          requireCostCenter: !!pol.identity?.requireCostCenter,
          requireDepartment: !!pol.identity?.requireDepartment,
          requireManagerApproval: !!pol.bookingRules?.requireManagerApproval,
          allowSelfBookingOnBehalf: pol.bookingRules?.allowSelfBookingOnBehalf !== false,
          minAdvanceBookingMinutes: pol.bookingRules?.minAdvanceBookingMinutes || 60,
          allowNightTravel: pol.bookingRules?.allowNightTravel !== false,
          billingMode: pol.invoicing?.billingMode || 'SINGLE_TRIP',
          taxExempt: !!pol.invoicing?.taxExempt,
        });
      }
    } catch (err) {
      console.error('Error fetching company policy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchPolicy(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      showToast('Please select a corporate company.', 'error');
      return;
    }

    setSaving(true);
    try {
      const domains = policyForm.allowedEmailDomains
        .split(',')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      const payload = {
        identity: {
          allowedEmailDomains: domains,
          employeeIdLabel: policyForm.employeeIdLabel,
          employeeIdRegex: policyForm.employeeIdRegex || undefined,
          requireCostCenter: policyForm.requireCostCenter,
          requireDepartment: policyForm.requireDepartment,
        },
        bookingRules: {
          requireManagerApproval: policyForm.requireManagerApproval,
          allowSelfBookingOnBehalf: policyForm.allowSelfBookingOnBehalf,
          minAdvanceBookingMinutes: Number(policyForm.minAdvanceBookingMinutes) || 60,
          allowNightTravel: policyForm.allowNightTravel,
        },
        invoicing: {
          billingMode: policyForm.billingMode,
          taxExempt: policyForm.taxExempt,
        },
      };

      await axiosInstance.post(`/tenants/policies/${selectedCompanyId}`, payload);
      showToast('Corporate policy saved successfully!', 'success');
    } catch (err: any) {
      console.error('Error saving company policy:', err);
      showToast(err?.response?.data?.message || 'Failed to save policy', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout breadcrumbName="Corporate Policies">
      <AlertContainer />
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Configurable Company Rules</h2>
          <p className="text-xs text-gray-500 mt-1">
            Replace hardcoded company logic (like Danfoss user ID checks) with dynamic, tenant-scoped validation rules.
          </p>
        </div>

        {/* Company Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Select Corporate Client
          </label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>
                {c.companyName} {c.companyCode ? `(${c.companyCode})` : ''}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">Loading policy rules...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Identity & Authentication Rules */}
            <div className="border border-gray-200 rounded-md p-5 bg-gray-50/50">
              <h3 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">
                1. Identity & Corporate Validation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Allowed Email Domains
                  </label>
                  <input
                    type="text"
                    value={policyForm.allowedEmailDomains}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, allowedEmailDomains: e.target.value })
                    }
                    placeholder="e.g. @danfoss.com, @corp.danfoss.com"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  />
                  <span className="text-[11px] text-gray-500">Comma-separated email domain whitelist</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Employee ID Label
                  </label>
                  <input
                    type="text"
                    value={policyForm.employeeIdLabel}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, employeeIdLabel: e.target.value })
                    }
                    placeholder="e.g. Danfoss User ID or Employee Number"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Employee ID Validation Regex
                  </label>
                  <input
                    type="text"
                    value={policyForm.employeeIdRegex}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, employeeIdRegex: e.target.value })
                    }
                    placeholder="e.g. ^\\d{6}$ (6 digits)"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono bg-white"
                  />
                  <span className="text-[11px] text-gray-500">Leave blank for any alphanumeric format</span>
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.requireCostCenter}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, requireCostCenter: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-700">Require Cost Center Code</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.requireDepartment}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, requireDepartment: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-700">Require Department Name</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: Booking Workflows */}
            <div className="border border-gray-200 rounded-md p-5 bg-gray-50/50">
              <h3 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">
                2. Booking Approval & Scheduling Rules
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.requireManagerApproval}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, requireManagerApproval: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Require Line Manager Approval for Orders
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.allowSelfBookingOnBehalf}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, allowSelfBookingOnBehalf: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Allow Employees to Book on Behalf of Visitors
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.allowNightTravel}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, allowNightTravel: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      Permit Late Night / Overnight Bookings (10PM - 6AM)
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Minimum Advance Booking Notice (Minutes)
                  </label>
                  <input
                    type="number"
                    value={policyForm.minAdvanceBookingMinutes}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, minAdvanceBookingMinutes: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  />
                  <span className="text-[11px] text-gray-500">e.g. 60 min lead time before pickup</span>
                </div>
              </div>
            </div>

            {/* Section 3: Invoicing Model */}
            <div className="border border-gray-200 rounded-md p-5 bg-gray-50/50">
              <h3 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">
                3. Billing & Invoicing Structure
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Billing Mode
                  </label>
                  <select
                    value={policyForm.billingMode}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        billingMode: e.target.value as 'SINGLE_TRIP' | 'ON_CALL' | 'MONTHLY',
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  >
                    <option value="MONTHLY">Monthly Consolidated Invoice (e.g. Danfoss)</option>
                    <option value="ON_CALL">On-Call Duty Billing</option>
                    <option value="SINGLE_TRIP">Individual Per-Trip Invoicing</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.taxExempt}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, taxExempt: e.target.checked })
                      }
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-700">Tax Exempt Corporate Client</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <CommonButton
                type="submit"
                text={saving ? 'Saving Rules...' : 'Save Corporate Policy'}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition"
              />
            </div>
          </form>
        )}
      </div>
    </PageLayout>
  );
};

export default CompanyPolicies;
