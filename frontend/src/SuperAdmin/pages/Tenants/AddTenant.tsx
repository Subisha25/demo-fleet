import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';
import { useTenant } from '../../../context/TenantContext';
import {
  formatMobileInput,
  formatPinCodeInput,
  formatPanInput,
  formatGstinInput,
  validateMobile,
  validatePinCode,
  validatePan,
  validateGstin,
  extractApiErrorMessage,
  extractFieldErrors,
} from '../../../utils/validation';

interface PlanDetail {
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  monthlyINR: number;
  annualINR: number;
  vehicles: string;
  drivers: string;
  clients: string;
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const SAC_REGEX = /^[0-9]{6}$/;

const PLANS: Record<string, PlanDetail> = {
  BASIC: {
    tier: 'BASIC',
    name: 'Starter Mobility',
    monthlyINR: 299,
    annualINR: 3050,
    vehicles: 'Up to 15 vehicles',
    drivers: 'Up to 15 drivers',
    clients: 'Up to 3 corporate accounts',
  },
  PRO: {
    tier: 'PRO',
    name: 'Growth Fleet Pro',
    monthlyINR: 349,
    annualINR: 3560,
    vehicles: 'Up to 75 vehicles',
    drivers: 'Up to 75 drivers',
    clients: 'Up to 20 corporate accounts',
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    name: 'Enterprise Mobility Suite',
    monthlyINR: 549,
    annualINR: 5600,
    vehicles: 'Up to 250 vehicles',
    drivers: 'Up to 250 drivers',
    clients: 'Up to 100 corporate accounts',
  },
};

const AddTenant: React.FC = () => {
  const navigate = useNavigate();
  const { loadAllTenants } = useTenant();

  const [formData, setFormData] = useState({
    fleetName: '',
    legalName: '',
    displayName: '',
    businessCode: '',
    ownerName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    state: '',
    pinCode: '',
    registeredAddress: '',
    gstin: '',
    panNumber: '',
    sacCode: '996609',
    website: '',
    businessEmail: '',
    businessPhone: '',
    billingFooterText: '',
    logoUrl: '',
    requestedPlanTier: 'PRO' as 'BASIC' | 'PRO' | 'ENTERPRISE',
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'ANNUAL',
    fleetSize: '16-75',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'businessCode') {
      const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      setFormData((prev) => ({ ...prev, businessCode: clean }));
    } else if (name === 'contactPhone' || name === 'businessPhone') {
      const clean = formatMobileInput(value);
      setFormData((prev) => ({ ...prev, [name]: clean }));
    } else if (name === 'pinCode') {
      const clean = formatPinCodeInput(value);
      setFormData((prev) => ({ ...prev, [name]: clean }));
    } else if (name === 'gstin') {
      const clean = formatGstinInput(value);
      setFormData((prev) => {
        const copy = { ...prev, gstin: clean };
        if (clean.length === 15 && !prev.panNumber) {
          copy.panNumber = clean.substring(2, 12);
        }
        return copy;
      });
    } else if (name === 'panNumber') {
      const clean = formatPanInput(value);
      setFormData((prev) => ({ ...prev, panNumber: clean }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrorMessage('');
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
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
      setErrorMessage('Logo must be a valid PNG, JPG, WebP, or SVG file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Logo file size must not exceed 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
  };

  const validateInputs = () => {
    const errors: Record<string, string> = {};

    if (!formData.fleetName.trim()) {
      errors.fleetName = 'Fleet display name is required.';
    }

    if (formData.businessCode.length < 2) {
      errors.businessCode = 'Business code must be at least 2 alphanumeric characters.';
    }

    if (!formData.ownerName.trim()) {
      errors.ownerName = 'Owner / Admin full name is required.';
    }

    if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
      errors.contactEmail = 'Valid official contact email is required.';
    }

    const phoneVal = validateMobile(formData.contactPhone);
    if (!phoneVal.valid) {
      errors.contactPhone = phoneVal.error || 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.city.trim()) {
      errors.city = 'Primary operating city is required.';
    }

    if (!formData.state.trim()) {
      errors.state = 'Operating state is required.';
    }

    if (formData.pinCode) {
      const pinVal = validatePinCode(formData.pinCode);
      if (!pinVal.valid) {
        errors.pinCode = pinVal.error || 'Please enter a valid 6-digit PIN code.';
      }
    }

    if (formData.gstin) {
      const gstinVal = validateGstin(formData.gstin);
      if (!gstinVal.valid) {
        errors.gstin = gstinVal.error || 'Invalid GSTIN format. Expected 15 characters (e.g., 33AAACA1111A1Z1).';
      }
    }

    if (formData.panNumber) {
      const panVal = validatePan(formData.panNumber);
      if (!panVal.valid) {
        errors.panNumber = panVal.error || 'Invalid PAN format. Expected 10 characters (e.g., AAACA1111A).';
      }
    }

    if (formData.sacCode && !SAC_REGEX.test(formData.sacCode)) {
      errors.sacCode = 'Invalid SAC code. Expected 6 digits (default: 996609).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) {
      setErrorMessage('Please fix the errors highlighted below.');
      showToast('Please fix the validation errors before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name: formData.fleetName.trim(),
        fleetName: formData.fleetName.trim(),
        displayName: formData.displayName?.trim() || formData.fleetName.trim(),
        legalName: formData.legalName?.trim() || formData.fleetName.trim(),
        code: formData.businessCode.trim().toUpperCase(),
        businessCode: formData.businessCode.trim().toUpperCase(),
        subdomain: formData.businessCode.toLowerCase().trim(),
        ownerName: formData.ownerName.trim(),
        planTier: formData.requestedPlanTier,
        requestedPlanTier: formData.requestedPlanTier,
        billingCycle: formData.billingCycle,
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim() || undefined,
        registeredAddress: formData.registeredAddress.trim() || undefined,
        gstin: formData.gstin.trim() || undefined,
        panNumber: formData.panNumber.trim() || undefined,
        sacCode: formData.sacCode.trim() || '996609',
        website: formData.website?.trim() || undefined,
        businessEmail: formData.businessEmail?.trim() || formData.contactEmail.trim() || undefined,
        businessPhone: formData.businessPhone?.trim() || formData.contactPhone.trim() || undefined,
        billingFooterText: formData.billingFooterText?.trim() || undefined,
        logoUrl: formData.logoUrl || undefined,
        brandingTokens: {
          primaryColor: '#5B3DF5',
          portalTitle: `${formData.displayName || formData.fleetName} Mobility Portal`,
          legalName: formData.legalName || formData.fleetName,
          displayName: formData.displayName || formData.fleetName,
          registeredAddress: formData.registeredAddress,
          gstin: formData.gstin,
          gstNumber: formData.gstin,
          panNumber: formData.panNumber,
          sacCode: formData.sacCode || '996609',
          website: formData.website,
          businessEmail: formData.businessEmail || formData.contactEmail,
          businessPhone: formData.businessPhone || formData.contactPhone,
          billingFooterText: formData.billingFooterText,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          logoUrl: formData.logoUrl || undefined,
        },
      };

      const res = await axiosInstance.post('/tenants', payload);
      if (res.data?.success) {
        showToast(`Fleet operator ${formData.fleetName} provisioned successfully!`, 'success');
        await loadAllTenants();
        setTimeout(() => {
          navigate('/tenants/list');
        }, 700);
      } else {
        const msg = res.data?.message || 'Failed to provision tenant.';
        setErrorMessage(msg);
        showToast(msg, 'error');
      }
    } catch (err: any) {
      console.error('Error provisioning tenant:', err);
      const msg = extractApiErrorMessage(err, 'Failed to provision tenant.');
      setErrorMessage(msg);
      showToast(msg, 'error');
      const backendFieldErrors = extractFieldErrors(err);
      if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...backendFieldErrors }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout breadcrumbName="Provision Tenant">
      <AlertContainer />
      <div className="max-w-5xl mx-auto w-full py-4 sm:py-6">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden">
          {/* Header Banner - Matching Register Fleet Style */}
          <div className="bg-[#17171D] border-b-4 border-[#5B3DF5] p-6 sm:p-8 text-white">
            <span className="px-3 py-1 bg-[#5B3DF5]/20 text-[#DE8A66] border border-[#5B3DF5]/40 text-xs font-semibold rounded-full uppercase tracking-wider inline-block mb-3">
              SuperAdmin SaaS Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Provision New Fleet Operator
            </h1>
            <p className="mt-2 text-[#E2E8F0] text-sm sm:text-base max-w-2xl">
              Directly configure and deploy an isolated SaaS tenant instance with verified legal identity, primary administrator credentials, and active subscription plan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Business Identity */}
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-[#7A7570] mb-4 pb-2 border-b border-[#F7F7FB]">
                1. Fleet & Organization Identity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Fleet Display Name *
                  </label>
                  <input
                    type="text"
                    name="fleetName"
                    required
                    placeholder="e.g. Apex Express"
                    value={formData.fleetName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.fleetName ? 'border-red-500' : 'border-[#E5E7EB]'} text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.fleetName && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.fleetName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Legal Registered Entity Name
                  </label>
                  <input
                    type="text"
                    name="legalName"
                    placeholder="e.g. Apex Mobility Solutions Pvt. Ltd."
                    value={formData.legalName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Short Business Code (2–8 Chars) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="businessCode"
                      required
                      maxLength={8}
                      placeholder="e.g. APX, BLU"
                      value={formData.businessCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.businessCode ? 'border-red-500' : 'border-[#E5E7EB]'} font-mono font-bold text-sm tracking-wider uppercase focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#7A7570] font-mono">
                      {formData.businessCode.length}/8
                    </span>
                  </div>
                  {fieldErrors.businessCode && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.businessCode}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Fleet Legal Identity (For Invoices & PDFs) */}
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-[#7A7570] mb-4 pb-2 border-b border-[#F7F7FB]">
                2. Tax & Legal Details (For Issued Invoices & Trip Sheets)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Fleet GSTIN (15 Chars)
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    maxLength={15}
                    placeholder="e.g. 33AAACA1111A1Z1"
                    value={formData.gstin}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.gstin ? 'border-red-500' : 'border-[#E5E7EB]'} font-mono uppercase text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.gstin && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.gstin}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Fleet PAN Number (10 Chars)
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    maxLength={10}
                    placeholder="e.g. AAACA1111A"
                    value={formData.panNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.panNumber ? 'border-red-500' : 'border-[#E5E7EB]'} font-mono uppercase text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.panNumber && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.panNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    SAC Code (Passenger Transport)
                  </label>
                  <input
                    type="text"
                    name="sacCode"
                    maxLength={6}
                    placeholder="996609"
                    value={formData.sacCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.sacCode ? 'border-red-500' : 'border-[#E5E7EB]'} font-mono text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.sacCode && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.sacCode}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                  Registered Office Address (Invoice Footer)
                </label>
                <textarea
                  name="registeredAddress"
                  rows={2}
                  placeholder="e.g. 101 Corporate Towers, Anna Salai, Guindy, Chennai - 600032"
                  value={formData.registeredAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white"
                />
              </div>

              {/* Fleet Logo Upload */}
              <div className="mt-4 p-4 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Upload Fleet Logo (PNG, JPG, SVG, max 2MB)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoFile}
                    className="text-xs text-[#5C5752] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#5B3DF5]/10 file:text-[#5B3DF5] hover:file:bg-[#5B3DF5]/20 cursor-pointer"
                  />
                  <p className="text-[10px] text-[#7A7570] mt-1">Logo will appear on your generated invoices, trip sheets, and portal header.</p>
                </div>
                {logoPreview && (
                  <div className="flex items-center gap-2">
                    <img src={logoPreview} alt="Logo Preview" className="h-12 w-auto max-w-[120px] object-contain border border-[#E5E7EB] rounded p-1 bg-white" />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Primary Administrator */}
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-[#7A7570] mb-4 pb-2 border-b border-[#F7F7FB]">
                3. Primary Administrator & Operations Contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Owner / Admin Full Name *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.ownerName ? 'border-red-500' : 'border-[#E5E7EB]'} text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.ownerName && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.ownerName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Official Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    placeholder="admin@yourcompany.com"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.contactEmail ? 'border-red-500' : 'border-[#E5E7EB]'} text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.contactEmail && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.contactEmail}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Official Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.contactPhone ? 'border-red-500' : 'border-[#E5E7EB]'} text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.contactPhone && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.contactPhone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Primary Operating City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Chennai"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.city ? 'border-red-500' : 'border-[#E5E7EB]'} text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.city && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Operating State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="e.g. Tamil Nadu"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.state ? 'border-red-500' : 'border-[#E5E7EB]'} text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.state && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.state}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    maxLength={6}
                    placeholder="600032"
                    value={formData.pinCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.pinCode ? 'border-red-500' : 'border-[#E5E7EB]'} text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.pinCode && <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.pinCode}</p>}
                </div>
              </div>
            </div>

            {/* Section 4: Subscription Plan Selection */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-[#F7F7FB]">
                <h2 className="text-base font-bold uppercase tracking-wider text-[#7A7570]">
                  4. Choose Your Mobility Plan
                </h2>

                {/* Billing Frequency Toggle */}
                <div className="inline-flex items-center p-1 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, billingCycle: 'MONTHLY' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.billingCycle === 'MONTHLY'
                        ? 'bg-[#17171D] text-white shadow-sm'
                        : 'text-[#5C5752] hover:text-[#17171D]'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, billingCycle: 'ANNUAL' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      formData.billingCycle === 'ANNUAL'
                        ? 'bg-[#17171D] text-white shadow-sm'
                        : 'text-[#5C5752] hover:text-[#17171D]'
                    }`}
                  >
                    <span>Annual</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#5B3DF5] text-white rounded-full">Save ~15%</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(['BASIC', 'PRO', 'ENTERPRISE'] as const).map((tier) => {
                  const plan = PLANS[tier];
                  const isSelected = formData.requestedPlanTier === tier;
                  const price = formData.billingCycle === 'ANNUAL' ? plan.annualINR : plan.monthlyINR;

                  return (
                    <div
                      key={tier}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          requestedPlanTier: tier,
                          fleetSize: tier === 'BASIC' ? '1-15' : tier === 'PRO' ? '16-75' : '76+',
                        }))
                      }
                      className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative ${
                        isSelected
                          ? 'border-[#5B3DF5] bg-[#FDF6F0] shadow-md ring-2 ring-[#F3D0BD]'
                          : 'border-[#E5E7EB] hover:border-[#5B3DF5]/50 bg-white'
                      }`}
                    >
                      {tier === 'PRO' && (
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#5B3DF5] text-white text-[10px] font-bold uppercase rounded-full">
                          Most Popular
                        </span>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-[#17171D] text-base">{plan.name}</h3>
                        <input
                          type="radio"
                          name="planRadio"
                          checked={isSelected}
                          onChange={() => {}}
                          className="accent-[#5B3DF5] w-4 h-4"
                        />
                      </div>

                      <div className="text-2xl font-extrabold text-[#5B3DF5] mb-1">
                        ₹{price.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-[#7A7570]">
                          /{formData.billingCycle === 'ANNUAL' ? 'year' : 'month'}
                        </span>
                      </div>

                      <ul className="text-xs text-[#5C5752] space-y-1.5 mt-3 pt-3 border-t border-[#E5E7EB]">
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#5B3DF5] font-bold">✓</span> {plan.vehicles}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#5B3DF5] font-bold">✓</span> {plan.drivers}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#5B3DF5] font-bold">✓</span> {plan.clients}
                        </li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 5: SuperAdmin Direct Provisioning Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs sm:text-sm flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>SuperAdmin Direct Provisioning:</strong> This action immediately creates the isolated SaaS tenant, initializes the active subscription quotas, and dispatches a secure 24-hour setup activation link to <strong className="text-amber-900">{formData.contactEmail || 'the administrator email'}</strong>.
              </span>
            </div>

            {/* Actions: Cancel & Provision Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => navigate('/tenants/list')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs text-[#5C5752] border border-[#E5E7EB] hover:bg-[#F7F7FB] transition"
              >
                Cancel & Return to Tenants
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-[#5B3DF5] hover:bg-[#A43D1A] text-white shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Provisioning Fleet Operator...' : 'Provision Fleet Operator →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default AddTenant;
