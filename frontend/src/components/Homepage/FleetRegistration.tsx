import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PublicLayout from '../PublicSite/PublicLayout';
import { showToast, AlertContainer } from '../AlertBox';
import {
  formatMobileInput,
  formatPinCodeInput,
  formatPanInput,
  formatGstinInput,
  validateMobile,
  validatePinCode,
  validatePan,
  validateGstin,
  validateEmail,
  scrollToFirstError,
  extractApiErrorMessage,
  extractFieldErrors,
} from '../../utils/validation';

const FIELD_ORDER = [
  'fleetName',
  'legalName',
  'businessCode',
  'gstin',
  'panNumber',
  'sacCode',
  'registeredAddress',
  'ownerName',
  'contactEmail',
  'contactPhone',
  'city',
  'state',
  'pinCode',
  'demoCallDate',
  'demoCallTime',
  'termsConsent',
];

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

export default function FleetRegistration() {
  const navigate = useNavigate();
  const location = useLocation();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

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
    demoCallDate: todayStr,
    demoCallTime: '11:00 AM',
    termsConsent: false,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<{
    requestId: string;
    fleetName: string;
    businessCode: string;
  } | null>(null);

  useEffect(() => {
    // Proactively clear any stale demo session artifacts from localStorage on mounting,
    // ensuring self-service public fleet registration is treated completely cleanly.
    const isDemo =
      localStorage.getItem('isDemoMode') === 'true' ||
      localStorage.getItem('isDemoView') === 'true' ||
      localStorage.getItem('role') === 'demo';

    if (isDemo) {
      localStorage.removeItem('isDemoMode');
      localStorage.removeItem('isDemoView');
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload?.isDemo || payload?.role === 'demo' || payload?.tenantId === 'demo-tenant') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            localStorage.removeItem('tenantId');
          }
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    // Read plan and billing from query params if available (?plan=BASIC&billing=annual)
    const params = new URLSearchParams(location.search);
    const planParam = params.get('plan')?.toUpperCase();
    const billingParam = params.get('billing')?.toUpperCase();
    const validBilling =
      billingParam === 'ANNUAL' ? 'ANNUAL' : billingParam === 'MONTHLY' ? 'MONTHLY' : undefined;

    setFormData((prev) => {
      let updated = { ...prev };
      if (planParam && PLANS[planParam]) {
        updated.requestedPlanTier = planParam as any;
        updated.fleetSize = planParam === 'BASIC' ? '1-15' : planParam === 'PRO' ? '16-75' : '76+';
      }
      if (validBilling) {
        updated.billingCycle = validBilling;
      }
      return updated;
    });
  }, [location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'businessCode') {
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
      errors.fleetName = 'Please enter the fleet name.';
    }

    if (!formData.businessCode.trim()) {
      errors.businessCode = 'Please enter the business code.';
    } else if (formData.businessCode.length < 2) {
      errors.businessCode = 'Business code must be at least 2 alphanumeric characters.';
    }

    if (formData.gstin.trim()) {
      const gstinVal = validateGstin(formData.gstin);
      if (!gstinVal.valid) {
        errors.gstin = gstinVal.error || 'Please enter a valid 15-character GST number.';
      }
    }

    if (formData.panNumber.trim()) {
      const panVal = validatePan(formData.panNumber);
      if (!panVal.valid) {
        errors.panNumber = panVal.error || 'Please enter a valid 10-character PAN number.';
      }
    }

    if (formData.sacCode && !SAC_REGEX.test(formData.sacCode)) {
      errors.sacCode = 'Invalid SAC code. Expected 6 digits (default: 996609).';
    }

    if (!formData.ownerName.trim()) {
      errors.ownerName = 'Please enter the contact person name.';
    }

    const emailVal = validateEmail(formData.contactEmail);
    if (!emailVal.valid) {
      errors.contactEmail = emailVal.error || 'Please enter a valid email address.';
    }

    const phoneVal = validateMobile(formData.contactPhone);
    if (!phoneVal.valid) {
      errors.contactPhone = phoneVal.error || 'Phone number must be exactly 10 digits.';
    }

    if (!formData.city.trim()) {
      errors.city = 'Please enter the city.';
    }

    if (!formData.state.trim()) {
      errors.state = 'Please enter the state.';
    }

    if (formData.pinCode.trim()) {
      const pinVal = validatePinCode(formData.pinCode);
      if (!pinVal.valid) {
        errors.pinCode = pinVal.error || 'Please enter a valid 6-digit pincode.';
      }
    }

    if (!formData.demoCallDate || !formData.demoCallDate.trim() || !formData.demoCallTime || !formData.demoCallTime.trim()) {
      errors.demoCallDate = 'Please select your preferred demo call date and time.';
    } else if (formData.demoCallDate < todayStr) {
      errors.demoCallDate = 'Demo call date cannot be in the past.';
    } else if (formData.demoCallDate > maxDateStr) {
      errors.demoCallDate = 'Please select a demo call time within the next 7 days.';
    }

    if (!formData.termsConsent) {
      errors.termsConsent = 'You must agree to the Terms of Service and Privacy Policy to proceed.';
    }

    setFieldErrors(errors);

    const errorKeys = FIELD_ORDER.filter((key) => errors[key]);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const firstMsg = errors[firstKey];
      setErrorMessage(firstMsg);
      showToast(firstMsg, 'error');
      scrollToFirstError(errorKeys);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        legalName: formData.legalName.trim() || formData.fleetName.trim(),
        displayName: formData.displayName.trim() || formData.fleetName.trim(),
        businessEmail: formData.businessEmail.trim() || formData.contactEmail.trim(),
        businessPhone: formData.businessPhone.trim() || formData.contactPhone.trim(),
        sacCode: formData.sacCode.trim() || '996609',
      };

      const response = await axiosInstance.post('/public/register-fleet', payload);
      if (response.data?.success) {
        setSuccessData({
          requestId: response.data.data.requestId,
          fleetName: response.data.data.fleetName,
          businessCode: response.data.data.businessCode,
        });
      } else {
        setErrorMessage(response.data?.message || 'Failed to submit registration application.');
      }
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, 'Failed to submit registration application.');
      setErrorMessage(msg);
      showToast(msg, 'error');
      const backendFieldErrors = extractFieldErrors(err);
      if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...backendFieldErrors }));
        const backendErrorKeys = FIELD_ORDER.filter((key) => backendFieldErrors[key]);
        if (backendErrorKeys.length > 0) {
          scrollToFirstError(backendErrorKeys);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PLANS[formData.requestedPlanTier] || PLANS.PRO;
  const currentPrice = formData.billingCycle === 'ANNUAL' ? selectedPlan.annualINR : selectedPlan.monthlyINR;

  return (
    <PublicLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {successData ? (
          /* SUCCESS SCREEN */
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span className="inline-block px-3 py-1 bg-[#FFF8E1] text-[#B76E00] border border-[#FFE082] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
              Application Under Review
            </span>

            <h1 className="text-3xl font-extrabold text-[#17171D] tracking-tight mb-2">
              Registration Received!
            </h1>
            <p className="text-[#5C5752] mb-6 text-sm md:text-base">
              Thank you for registering <strong className="text-[#17171D]">{successData.fleetName}</strong> (Code: <span className="font-mono text-[#5B3DF5] font-bold">{successData.businessCode}</span>). Our compliance team is verifying your details.
            </p>

            <div className="bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl p-5 mb-8 text-left">
              <div className="text-xs uppercase font-bold text-[#7A7570] tracking-wider mb-2">Application Summary</div>
              <div className="flex justify-between py-1 text-sm border-b border-[#E5E7EB]">
                <span className="text-[#5C5752]">Application Reference</span>
                <span className="font-mono font-bold text-[#17171D] text-xs">{successData.requestId}</span>
              </div>
              <div className="flex justify-between py-1 text-sm border-b border-[#E5E7EB]">
                <span className="text-[#5C5752]">Preferred Demo Call</span>
                <span className="font-semibold text-[#17171D]">{formData.demoCallDate} at {formData.demoCallTime}</span>
              </div>
              <div className="flex justify-between py-1 text-sm border-b border-[#E5E7EB]">
                <span className="text-[#5C5752]">Free Trial Duration</span>
                <span className="font-semibold text-emerald-600">7 Days (Starts Upon Approval)</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-[#5C5752]">Administrator Email</span>
                <span className="font-semibold text-[#17171D]">{formData.contactEmail}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm mb-8 text-left flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Next Step:</strong> Once reviewed and approved by SuperAdmin, your <strong>7-day free trial will automatically activate with full operational access</strong>. You will receive an activation email with a secure setup link to set your password and access your fleet.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-lg font-semibold text-sm bg-[#E2E8F0] hover:bg-[#E5E7EB] text-[#17171D] transition-colors"
              >
                Return to Home
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-lg font-semibold text-sm bg-[#5B3DF5] hover:bg-[#A43D1A] text-white shadow transition-colors"
              >
                Operator Login Portal
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden">
            {/* Header Banner */}
            <div className="bg-[#17171D] border-b-4 border-[#5B3DF5] p-8 text-white text-center sm:text-left">
              <span className="px-3 py-1 bg-[#5B3DF5]/20 text-[#DE8A66] border border-[#5B3DF5]/40 text-xs font-semibold rounded-full uppercase tracking-wider inline-block mb-3">
                Fleet Self-Service Onboarding
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Launch Your Transport Fleet on CABZ SaaS
              </h1>
              <p className="mt-2 text-[#E2E8F0] text-sm sm:text-base max-w-2xl">
                Get full corporate billing, live vehicle tracking, dynamic route card consolidation, and enterprise compliance ready in minutes.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-10 space-y-8">
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
                    <label htmlFor="fleetName" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Fleet Display Name *
                    </label>
                    <input
                      type="text"
                      id="fleetName"
                      name="fleetName"
                      placeholder="e.g. Apex Express"
                      value={formData.fleetName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.fleetName ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.fleetName && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.fleetName}</p>}
                  </div>

                  <div>
                    <label htmlFor="legalName" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Legal Registered Entity Name
                    </label>
                    <input
                      type="text"
                      id="legalName"
                      name="legalName"
                      placeholder="e.g. Apex Mobility Solutions Pvt. Ltd."
                      value={formData.legalName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.legalName ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.legalName && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.legalName}</p>}
                  </div>

                  <div>
                    <label htmlFor="businessCode" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Short Business Code (2–8 Chars) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="businessCode"
                        name="businessCode"
                        maxLength={8}
                        placeholder="e.g. APX, BLU"
                        value={formData.businessCode}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          fieldErrors.businessCode ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                        } font-mono font-bold text-sm tracking-wider uppercase focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-[#7A7570] font-mono">
                        {formData.businessCode.length}/8
                      </span>
                    </div>
                    {fieldErrors.businessCode && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.businessCode}</p>}
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
                    <label htmlFor="gstin" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Fleet GSTIN (15 Chars)
                    </label>
                    <input
                      type="text"
                      id="gstin"
                      name="gstin"
                      maxLength={15}
                      placeholder="e.g. 33AAACA1111A1Z1"
                      value={formData.gstin}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.gstin ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } font-mono uppercase text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.gstin && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.gstin}</p>}
                  </div>

                  <div>
                    <label htmlFor="panNumber" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Fleet PAN Number (10 Chars)
                    </label>
                    <input
                      type="text"
                      id="panNumber"
                      name="panNumber"
                      maxLength={10}
                      placeholder="e.g. AAACA1111A"
                      value={formData.panNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.panNumber ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } font-mono uppercase text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.panNumber && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.panNumber}</p>}
                  </div>

                  <div>
                    <label htmlFor="sacCode" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      SAC Code (Passenger Transport)
                    </label>
                    <input
                      type="text"
                      id="sacCode"
                      name="sacCode"
                      maxLength={6}
                      placeholder="996609"
                      value={formData.sacCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.sacCode ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } font-mono text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.sacCode && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.sacCode}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="registeredAddress" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                    Registered Office Address (Invoice Footer)
                  </label>
                  <textarea
                    id="registeredAddress"
                    name="registeredAddress"
                    rows={2}
                    placeholder="e.g. 101 Corporate Towers, Anna Salai, Guindy, Chennai - 600032"
                    value={formData.registeredAddress}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      fieldErrors.registeredAddress ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                    } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                  />
                  {fieldErrors.registeredAddress && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.registeredAddress}</p>}
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
                    <label htmlFor="ownerName" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Owner / Admin Full Name *
                    </label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.ownerName ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.ownerName && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.ownerName}</p>}
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Official Contact Email *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      placeholder="admin@yourcompany.com"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.contactEmail ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.contactEmail && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.contactEmail}</p>}
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Official Contact Phone *
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      placeholder="+91 98765 43210"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.contactPhone ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.contactPhone && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.contactPhone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                  <div>
                    <label htmlFor="city" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Primary Operating City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="e.g. Chennai"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.city ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.city && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      Operating State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      placeholder="e.g. Tamil Nadu"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.state ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.state && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.state}</p>}
                  </div>

                  <div>
                    <label htmlFor="pinCode" className="block text-xs font-bold uppercase text-[#17171D] mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      id="pinCode"
                      name="pinCode"
                      maxLength={6}
                      placeholder="600032"
                      value={formData.pinCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        fieldErrors.pinCode ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    {fieldErrors.pinCode && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.pinCode}</p>}
                  </div>
                </div>
              </div>

              {/* Section 4: Dedicated Read-Only Free Trial Information */}
              <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 p-6 rounded-2xl border-2 border-emerald-300 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      4
                    </span>
                    <h2 className="text-base font-extrabold uppercase tracking-wider text-[#17171D]">
                      Free Trial – 7 Days
                    </h2>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black rounded-full uppercase tracking-wider shadow-sm">
                    Full Operational Access
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                    <div className="text-[11px] font-bold uppercase text-[#7A7570] tracking-wider">Duration</div>
                    <div className="text-base font-black text-[#17171D] mt-1">7 Calendar Days</div>
                    <div className="text-[11px] text-[#5C5752] mt-0.5">Comprehensive evaluation period</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                    <div className="text-[11px] font-bold uppercase text-[#7A7570] tracking-wider">Start Date</div>
                    <div className="text-base font-black text-emerald-700 mt-1">Upon Approval</div>
                    <div className="text-[11px] text-[#5C5752] mt-0.5">Activates when SuperAdmin approves</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                    <div className="text-[11px] font-bold uppercase text-[#7A7570] tracking-wider">Projected End Date</div>
                    <div className="text-base font-black text-emerald-700 mt-1">
                      {`${String(maxDate.getDate()).padStart(2, '0')}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${maxDate.getFullYear()}`}
                    </div>
                    <div className="text-[11px] text-[#5C5752] mt-0.5">If approved today (informational preview)</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                    <div className="text-[11px] font-bold uppercase text-[#7A7570] tracking-wider">Payment Required Now</div>
                    <div className="text-base font-black text-emerald-700 mt-1">₹0 Upfront</div>
                    <div className="text-[11px] text-[#5C5752] mt-0.5">No credit card required to start</div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div className="text-xs text-emerald-900 leading-relaxed">
                    <span className="font-bold">Access Scope:</span> Full operational access across all core modules — Vehicles, Drivers, Corporate Accounts, Bookings, Invoices, Billing, and Tracking. Zero setup limits or record restrictions during your entire 7-day period.
                  </div>
                </div>
              </div>

              {/* Section 5: Preferred Demo Call Date & Time */}
              <div className="bg-gradient-to-br from-[#F8F9FE] to-white p-6 rounded-2xl border border-[#E0E7FF] shadow-sm">
                <div className="mb-4 pb-3 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#5B3DF5] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      5
                    </span>
                    <h2 className="text-base font-bold uppercase tracking-wider text-[#17171D]">
                      Preferred Demo Call Date & Time
                    </h2>
                  </div>
                  <p className="text-xs text-[#5C5752] mt-1.5 leading-relaxed">
                    Schedule a live 1-on-1 product demonstration of CABZ Smart Fleet Mobility with our platform specialists.
                    Your 7-day free trial will automatically activate upon SuperAdmin review and approval.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Demo Call Date */}
                  <div>
                    <label htmlFor="demoCallDate" className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-1.5">
                      Demo Call Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="demoCallDate"
                      name="demoCallDate"
                      min={todayStr}
                      max={maxDateStr}
                      value={formData.demoCallDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        fieldErrors.demoCallDate ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    />
                    <p className="text-[11px] text-[#7A7570] mt-1">Select any date within the next 7 calendar days.</p>
                    {fieldErrors.demoCallDate && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.demoCallDate}</p>
                    )}
                  </div>

                  {/* Demo Call Time */}
                  <div>
                    <label htmlFor="demoCallTime" className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-1.5">
                      Preferred Time Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="demoCallTime"
                      name="demoCallTime"
                      value={formData.demoCallTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        fieldErrors.demoCallTime ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                      } text-sm focus:ring-2 focus:ring-[#5B3DF5]/20 focus:border-[#5B3DF5] outline-none bg-white`}
                    >
                      <option value="10:00 AM">10:00 AM - 10:45 AM (Morning)</option>
                      <option value="11:00 AM">11:00 AM - 11:45 AM (Morning)</option>
                      <option value="12:00 PM">12:00 PM - 12:45 PM (Afternoon)</option>
                      <option value="02:00 PM">02:00 PM - 02:45 PM (Afternoon)</option>
                      <option value="03:30 PM">03:30 PM - 04:15 PM (Evening)</option>
                      <option value="05:00 PM">05:00 PM - 05:45 PM (Evening)</option>
                      <option value="06:30 PM">06:30 PM - 07:15 PM (Late Evening)</option>
                    </select>
                    <p className="text-[11px] text-[#7A7570] mt-1">45-minute interactive video demo & onboarding session.</p>
                    {fieldErrors.demoCallTime && (
                      <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.demoCallTime}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#5B3DF5] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    i
                  </div>
                  <div className="text-xs text-[#4338CA] leading-relaxed">
                    <span className="font-bold">No upfront payment required.</span> All approved fleet operators receive an automatic{' '}
                    <span className="font-bold">7-day free trial with complete operational access</span> across vehicles, drivers, bookings, invoices, and reports.
                  </div>
                </div>
              </div>

              {/* Section 5: Terms Consent & Submission */}
              <div className="pt-2">
                <label htmlFor="termsConsent" className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="termsConsent"
                    name="termsConsent"
                    checked={formData.termsConsent}
                    onChange={handleChange}
                    className={`mt-1 w-4 h-4 rounded ${
                      fieldErrors.termsConsent ? 'ring-2 ring-red-500 border-red-500' : 'border-[#E5E7EB]'
                    } text-[#5B3DF5] focus:ring-[#5B3DF5]`}
                  />
                  <span className="text-xs text-[#5C5752] leading-relaxed">
                    I confirm that I am authorized to represent this fleet and agree to the{' '}
                    <a href="/terms" target="_blank" className="text-[#5B3DF5] underline font-medium">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy-policy" target="_blank" className="text-[#5B3DF5] underline font-medium">
                      Privacy Policy
                    </a>
                    . I understand that my application will be reviewed by SuperAdmin before account activation.
                  </span>
                </label>
                {fieldErrors.termsConsent && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.termsConsent}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E7EB]">
                <div className="text-xs text-[#7A7570] text-center sm:text-left">
                  🔒 Enterprise grade 256-bit SSL encrypted application submission.
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-[#5B3DF5] hover:bg-[#A43D1A] text-white shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Submitting Application...' : 'Submit Fleet Application →'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
