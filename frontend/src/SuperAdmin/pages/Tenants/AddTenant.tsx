import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import CommonButton from '../../../components/CommonButton';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';
import { useTenant } from '../../../context/TenantContext';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const SAC_REGEX = /^[0-9]{6}$/;

const AddTenant: React.FC = () => {
  const navigate = useNavigate();
  const { loadAllTenants } = useTenant();

  const [form, setForm] = useState({
    name: '',
    legalName: '',
    displayName: '',
    code: '',
    subdomain: '',
    planTier: 'PRO' as 'BASIC' | 'PRO' | 'ENTERPRISE',
    contactEmail: '',
    contactPhone: '',
    registeredAddress: '',
    city: '',
    state: '',
    pinCode: '',
    gstin: '',
    panNumber: '',
    sacCode: '996609',
    website: '',
    businessEmail: '',
    businessPhone: '',
    billingFooterText: '',
    primaryColor: '#0f1c3f',
    secondaryColor: '#0d9488',
    portalTitle: '',
    logoUrl: '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let cleanVal = value;

    if (name === 'code') {
      cleanVal = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (name === 'gstin' || name === 'panNumber') {
      cleanVal = value.toUpperCase().trim();
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: cleanVal };
      // Auto-extract PAN from GSTIN if 15 chars
      if (name === 'gstin' && cleanVal.length === 15 && !prev.panNumber) {
        updated.panNumber = cleanVal.substring(2, 12);
      }
      return updated;
    });

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      showToast('Logo must be a PNG, JPG, WebP, or SVG image.', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo file size must not exceed 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setForm((prev) => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setForm((prev) => ({ ...prev, logoUrl: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = 'Fleet Operator Name is required.';
    if (!form.code.trim()) errors.code = 'Tenant Code is required (2-10 alphanumeric characters).';

    if (form.gstin && !GSTIN_REGEX.test(form.gstin)) {
      errors.gstin = 'Invalid GSTIN (e.g., 33AAACA1111A1Z1). Must be 15 alphanumeric characters.';
    }

    if (form.panNumber && !PAN_REGEX.test(form.panNumber)) {
      errors.panNumber = 'Invalid PAN (e.g., AAACA1111A). Must be 10 alphanumeric characters.';
    }

    if (form.sacCode && !SAC_REGEX.test(form.sacCode)) {
      errors.sacCode = 'Invalid SAC Code. Must be 6 digits (default 996609).';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the validation errors before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/tenants', {
        name: form.name.trim(),
        legalName: form.legalName.trim() || form.name.trim(),
        displayName: form.displayName.trim() || form.name.trim(),
        code: form.code.trim(),
        subdomain: form.subdomain.trim() || form.code.toLowerCase(),
        planTier: form.planTier,
        contactEmail: form.contactEmail.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        registeredAddress: form.registeredAddress.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pinCode: form.pinCode.trim() || undefined,
        gstin: form.gstin.trim() || undefined,
        panNumber: form.panNumber.trim() || undefined,
        sacCode: form.sacCode.trim() || '996609',
        website: form.website.trim() || undefined,
        businessEmail: form.businessEmail.trim() || form.contactEmail.trim() || undefined,
        businessPhone: form.businessPhone.trim() || form.contactPhone.trim() || undefined,
        billingFooterText: form.billingFooterText.trim() || undefined,
        logoUrl: form.logoUrl || undefined,
        brandingTokens: {
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor,
          portalTitle: form.portalTitle || form.displayName || form.name,
          legalName: form.legalName || form.name,
          displayName: form.displayName || form.name,
          registeredAddress: form.registeredAddress,
          gstin: form.gstin,
          gstNumber: form.gstin,
          panNumber: form.panNumber,
          sacCode: form.sacCode,
          website: form.website,
          businessEmail: form.businessEmail || form.contactEmail,
          businessPhone: form.businessPhone || form.contactPhone,
          billingFooterText: form.billingFooterText,
          logoUrl: form.logoUrl || undefined,
        },
      });

      showToast(`Fleet operator ${form.displayName || form.name} provisioned successfully!`, 'success');
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
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Provision New Fleet Operator</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure an isolated SaaS fleet tenant with customized plan tier, verified legal business identity, and document branding.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Fleet Identity */}
          <div>
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-3">1. Fleet Information & SaaS Plan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fleet Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Apex Express Cabs"
                  required
                  className={`w-full border ${validationErrors.name ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                />
                {validationErrors.name && <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                  className={`w-full border ${validationErrors.code ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2 text-sm uppercase font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                />
                <span className="text-[10px] text-slate-400">Prefix for invoice & booking codes</span>
                {validationErrors.code && <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.code}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SaaS Subscription Tier *
                </label>
                <select
                  name="planTier"
                  value={form.planTier}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="BASIC">BASIC (15 Vehicles, 15 Drivers)</option>
                  <option value="PRO">PRO (75 Vehicles, 75 Drivers)</option>
                  <option value="ENTERPRISE">ENTERPRISE (Unlimited Scale)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subdomain Prefix
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="subdomain"
                    value={form.subdomain}
                    onChange={handleChange}
                    placeholder="e.g. apex"
                    className="w-full border border-slate-300 rounded-l-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 text-xs text-slate-500 rounded-r-lg font-mono">
                    .fleetflow.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Name (Customer Facing)
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Express"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Fleet Business Legal Identity (for Invoices, PDFs, Trip Sheets) */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
              2. Business Legal Identity (Invoices, PDFs & Trip Sheets)
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              These verified details appear on all invoices, monthly billing, and trip sheets issued by this fleet operator.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Legal Business Name *
                </label>
                <input
                  type="text"
                  name="legalName"
                  value={form.legalName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Mobility Solutions Pvt. Ltd."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Formal legal entity name printed as invoice issuer</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SAC Code (Passenger Transport)
                </label>
                <input
                  type="text"
                  name="sacCode"
                  value={form.sacCode}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="996609"
                  className={`w-full border ${validationErrors.sacCode ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                />
                {validationErrors.sacCode && <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.sacCode}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fleet GSTIN (15 characters)
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={form.gstin}
                  onChange={handleChange}
                  maxLength={15}
                  placeholder="e.g. 33AAACA1111A1Z1"
                  className={`w-full border ${validationErrors.gstin ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2 text-sm font-mono uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                />
                {validationErrors.gstin && <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.gstin}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fleet PAN Number (10 characters)
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={form.panNumber}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="e.g. AAACA1111A"
                  className={`w-full border ${validationErrors.panNumber ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3 py-2 text-sm font-mono uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                />
                {validationErrors.panNumber && <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.panNumber}</p>}
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Office Address (Printed on Invoice Footer)
              </label>
              <textarea
                name="registeredAddress"
                rows={2}
                value={form.registeredAddress}
                onChange={handleChange}
                placeholder="e.g. 101 Corporate Towers, Anna Salai, Guindy, Chennai - 600032"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  name="pinCode"
                  value={form.pinCode}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="600032"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>



            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Invoice Footer / Disclaimer Note (Optional)
              </label>
              <input
                type="text"
                name="billingFooterText"
                value={form.billingFooterText}
                onChange={handleChange}
                placeholder="e.g. Computer generated invoice. Subject to Chennai jurisdiction."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Fleet Logo Upload & Brand Visuals */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
              3. Fleet Brand Logo & Visual Theme
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Upload this fleet's dedicated logo for invoice headers and portal branding.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Fleet Logo (PNG, JPG, SVG, max 2MB)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoFile}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  />
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  If left empty, a neutral SVG monogram badge will be dynamically generated using the fleet's initials.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Invoice Header Preview</p>
                <div className="h-16 flex items-center justify-center bg-white border border-dashed border-slate-300 rounded p-1">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="max-h-14 max-w-full object-contain" />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded bg-teal-800 text-white font-bold text-sm flex items-center justify-center">
                        {form.code.substring(0, 2) || 'FL'}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{form.displayName || form.name || 'Fleet Logo'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Portal Header Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={form.primaryColor}
                    onChange={handleChange}
                    className="w-10 h-9 p-0.5 border border-slate-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={form.primaryColor}
                    onChange={handleChange}
                    className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Custom Portal Title
                </label>
                <input
                  type="text"
                  name="portalTitle"
                  value={form.portalTitle}
                  onChange={handleChange}
                  placeholder="e.g. Apex Cab Manager"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Operator Admin Credentials */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-3">
              4. Fleet Primary Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  placeholder="admin@apexcabs.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
