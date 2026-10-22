import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PublicLayout from '../PublicSite/PublicLayout';

interface PlanDetail {
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  monthlyINR: number;
  annualINR: number;
  vehicles: string;
  drivers: string;
  clients: string;
}

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

  const [formData, setFormData] = useState({
    fleetName: '',
    businessCode: '',
    ownerName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    state: '',
    requestedPlanTier: 'PRO' as 'BASIC' | 'PRO' | 'ENTERPRISE',
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'ANNUAL',
    fleetSize: '16-75',
    termsConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{
    requestId: string;
    fleetName: string;
    businessCode: string;
  } | null>(null);

  useEffect(() => {
    // Read plan from query param if available (?plan=BASIC)
    const params = new URLSearchParams(location.search);
    const planParam = params.get('plan')?.toUpperCase();
    if (planParam && PLANS[planParam]) {
      setFormData((prev) => ({
        ...prev,
        requestedPlanTier: planParam as any,
        fleetSize: planParam === 'BASIC' ? '1-15' : planParam === 'PRO' ? '16-75' : '76+',
      }));
    }
  }, [location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'businessCode') {
      // Format as uppercase alphanumeric only
      const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      setFormData((prev) => ({ ...prev, businessCode: clean }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsConsent) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    if (formData.businessCode.length < 2) {
      setErrorMessage('Business code must be at least 2 alphanumeric characters.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axiosInstance.post('/public/register-fleet', formData);
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
      const msg = err.response?.data?.message || err.message || 'Error submitting application. Please try again.';
      setErrorMessage(msg);
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
          <div className="bg-white rounded-2xl shadow-xl border border-[#E0DAD1] p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span className="inline-block px-3 py-1 bg-[#FFF8E1] text-[#B76E00] border border-[#FFE082] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
              Application Under Review
            </span>

            <h1 className="text-3xl font-extrabold text-[#1C1A18] tracking-tight mb-2">
              Registration Received!
            </h1>
            <p className="text-[#5C5752] mb-6 text-sm md:text-base">
              Thank you for registering <strong className="text-[#1C1A18]">{successData.fleetName}</strong> (Code: <span className="font-mono text-[#C04E24] font-bold">{successData.businessCode}</span>). Our compliance team is verifying your details.
            </p>

            <div className="bg-[#FAF8F5] border border-[#E0DAD1] rounded-xl p-5 mb-8 text-left">
              <div className="text-xs uppercase font-bold text-[#7A7570] tracking-wider mb-2">Application Summary</div>
              <div className="flex justify-between py-1 text-sm border-b border-[#E0DAD1]">
                <span className="text-[#5C5752]">Application Reference</span>
                <span className="font-mono font-bold text-[#1C1A18] text-xs">{successData.requestId}</span>
              </div>
              <div className="flex justify-between py-1 text-sm border-b border-[#E0DAD1]">
                <span className="text-[#5C5752]">Requested Plan</span>
                <span className="font-semibold text-[#1C1A18]">{formData.requestedPlanTier} ({formData.billingCycle})</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-[#5C5752]">Administrator Email</span>
                <span className="font-semibold text-[#1C1A18]">{formData.contactEmail}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm mb-8 text-left flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Next Step:</strong> Once approved by SuperAdmin, you will receive an activation email with a secure 24-hour setup link to set your administrator password and start managing your fleet.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-lg font-semibold text-sm bg-[#EDE9E3] hover:bg-[#E0DAD1] text-[#1C1A18] transition-colors"
              >
                Return to Home
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-lg font-semibold text-sm bg-[#C04E24] hover:bg-[#A43D1A] text-white shadow transition-colors"
              >
                Operator Login Portal
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div className="bg-white rounded-2xl shadow-xl border border-[#E0DAD1] overflow-hidden">
            {/* Header Banner */}
            <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] p-8 text-white text-center sm:text-left">
              <span className="px-3 py-1 bg-[#C04E24]/20 text-[#DE8A66] border border-[#C04E24]/40 text-xs font-semibold rounded-full uppercase tracking-wider inline-block mb-3">
                Fleet Self-Service Onboarding
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Launch Your Transport Fleet on Grace Cabs SaaS
              </h1>
              <p className="mt-2 text-[#EDE9E3] text-sm sm:text-base max-w-2xl">
                Get full corporate billing, live vehicle tracking, dynamic route card consolidation, and enterprise compliance ready in minutes.
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
                <h2 className="text-base font-bold uppercase tracking-wider text-[#7A7570] mb-4 pb-2 border-b border-[#FAF8F5]">
                  1. Fleet & Organization Identity
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#1C1A18] mb-1">
                      Fleet / Company Legal Name *
                    </label>
                    <input
                      type="text"
                      name="fleetName"
                      required
                      placeholder="e.g. Apex Mobility Logistics Ltd"
                      value={formData.fleetName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E0DAD1] text-sm focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#1C1A18] mb-1">
                      Short Business Code (2–8 Characters) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="businessCode"
                        required
                        maxLength={8}
                        placeholder="e.g. APX, BLU, GC"
                        value={formData.businessCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#E0DAD1] font-mono font-bold text-sm tracking-wider uppercase focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] outline-none bg-white"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-[#7A7570] font-mono">
                        {formData.businessCode.length}/8
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C5752] mt-1">Used for unique vehicle codes, invoice numbers, and dispatch identifiers.</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Primary Administrator */}
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-[#7A7570] mb-4 pb-2 border-b border-[#FAF8F5]">
                  2. Primary Administrator & Operations Contact
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#1C1A18] mb-1">
                      Owner / Admin Full Name *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E0DAD1] text-sm focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#1C1A18] mb-1">
                      Official Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      required
                      placeholder="admin@yourcompany.com"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E0DAD1] text-sm focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#1C1A18] mb-1">
                      Official Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E0DAD1] text-sm focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#1C1A18] mb-1">
                      Primary Operating City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Chennai, Bengaluru, Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E0DAD1] text-sm focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#1C1A18] mb-1">
                      Operating State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="e.g. Tamil Nadu, Karnataka"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E0DAD1] text-sm focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Plan Selection & Billing Cycle */}
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-[#7A7570] mb-4 pb-2 border-b border-[#FAF8F5]">
                  3. Select SaaS Plan & Billing Cycle
                </h2>

                <div className="flex items-center justify-between mb-4 bg-[#FAF8F5] p-3 rounded-xl border border-[#E0DAD1]">
                  <span className="text-sm font-semibold text-[#1C1A18]">Choose Billing Frequency:</span>
                  <div className="flex bg-[#EDE9E3] p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, billingCycle: 'MONTHLY' }))}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                        formData.billingCycle === 'MONTHLY'
                          ? 'bg-[#C04E24] text-white shadow-sm'
                          : 'text-[#5C5752] hover:text-[#1C1A18]'
                      }`}
                    >
                      Monthly Billing
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, billingCycle: 'ANNUAL' }))}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                        formData.billingCycle === 'ANNUAL'
                          ? 'bg-[#C04E24] text-white shadow-sm'
                          : 'text-[#5C5752] hover:text-[#1C1A18]'
                      }`}
                    >
                      Annual Billing <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.5 rounded font-extrabold">Save 15%</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(Object.keys(PLANS) as Array<'BASIC' | 'PRO' | 'ENTERPRISE'>).map((tier) => {
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
                            ? 'border-[#C04E24] bg-[#FDF6F0] shadow-md ring-2 ring-[#F3D0BD]'
                            : 'border-[#E0DAD1] hover:border-[#C04E24]/50 bg-white'
                        }`}
                      >
                        {tier === 'PRO' && (
                          <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#C04E24] text-white text-[10px] font-bold uppercase rounded-full">
                            Most Popular
                          </span>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-[#1C1A18] text-base">{plan.name}</h3>
                          <input
                            type="radio"
                            name="planRadio"
                            checked={isSelected}
                            onChange={() => {}}
                            className="accent-[#C04E24] w-4 h-4"
                          />
                        </div>

                        <div className="text-2xl font-extrabold text-[#C04E24] mb-1">
                          ₹{price.toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-[#7A7570]">
                            /{formData.billingCycle === 'ANNUAL' ? 'year' : 'month'}
                          </span>
                        </div>

                        <ul className="text-xs text-[#5C5752] space-y-1.5 mt-3 pt-3 border-t border-[#E0DAD1]">
                          <li className="flex items-center gap-1.5">
                            <span className="text-[#C04E24] font-bold">✓</span> {plan.vehicles}
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-[#C04E24] font-bold">✓</span> {plan.drivers}
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-[#C04E24] font-bold">✓</span> {plan.clients}
                          </li>
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Terms Consent & Submission */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsConsent"
                    checked={formData.termsConsent}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-[#E0DAD1] text-[#C04E24] focus:ring-[#C04E24]"
                  />
                  <span className="text-xs text-[#5C5752] leading-relaxed">
                    I confirm that I am authorized to represent this fleet and agree to the{' '}
                    <a href="/terms" target="_blank" className="text-[#C04E24] underline font-medium">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy-policy" target="_blank" className="text-[#C04E24] underline font-medium">
                      Privacy Policy
                    </a>
                    . I understand that my application will be reviewed by SuperAdmin before account activation.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E0DAD1]">
                <div className="text-xs text-[#7A7570] text-center sm:text-left">
                  🔒 Enterprise grade 256-bit SSL encrypted application submission.
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-[#C04E24] hover:bg-[#A43D1A] text-white shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
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

