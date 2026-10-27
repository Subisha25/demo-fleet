import React, { useState, useEffect } from 'react';
import PageLayout from '../../../components/PageLayout';
import axiosInstance from '../../../utils/axiosInstance';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import {
  Crown,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Truck,
  Users,
  Building,
  RefreshCw,
  X,
  CreditCard,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface QuotaMeter {
  current: number;
  limit: number;
}

interface CurrentPlanData {
  planTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  planName: string;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  agreedPrice: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextRenewalDate: string;
  daysTotal: number;
  daysElapsed: number;
  daysRemaining: number;
  progressPercent: number;
  quotas: {
    vehicles: QuotaMeter;
    drivers: QuotaMeter;
    companies: QuotaMeter;
    trips: QuotaMeter;
  };
  features: string[];
  allPlanCatalog: any[];
}

const CurrentPlan: React.FC = () => {
  const [data, setData] = useState<CurrentPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upgrade / Renew Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTier, setModalTier] = useState<'BASIC' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [modalCycle, setModalCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<any>(null);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      // Fetch overview data for current fleet
      const res = await axiosInstance.get('/tenants/dashboard/stats');
      if (res.data && res.data.success) {
        const stats = res.data;
        const sub = stats.subscription || {};
        const quotas = stats.quotas || {
          vehicles: { current: 0, limit: 15 },
          drivers: { current: 0, limit: 15 },
          companies: { current: 0, limit: 3 },
          trips: { current: 0, limit: 1000 },
        };

        const now = new Date();
        const start = sub.startDate ? new Date(sub.startDate) : new Date(now.getTime() - 15 * 86400000);
        const end = sub.endDate ? new Date(sub.endDate) : new Date(now.getTime() + 15 * 86400000);

        const totalMs = Math.max(1, end.getTime() - start.getTime());
        const elapsedMs = Math.max(0, now.getTime() - start.getTime());
        const daysTotal = Math.max(1, Math.round(totalMs / 86400000));
        const daysElapsed = Math.min(daysTotal, Math.max(0, Math.round(elapsedMs / 86400000)));
        const daysRemaining = Math.max(0, Math.round((end.getTime() - now.getTime()) / 86400000));
        const progressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / daysTotal) * 100)));

        const planTier = (sub.plan || 'PRO').toUpperCase() as 'BASIC' | 'PRO' | 'ENTERPRISE';
        const billingCycle = (sub.billingCycle || 'MONTHLY').toUpperCase() as 'MONTHLY' | 'ANNUAL';

        const tierNames: Record<string, string> = {
          BASIC: 'Starter Mobility',
          PRO: 'Growth Fleet Pro',
          ENTERPRISE: 'Enterprise Mobility Suite',
        };

        const tierPrices: Record<string, { monthly: number; annual: number }> = {
          BASIC: { monthly: 299, annual: 3050 },
          PRO: { monthly: 349, annual: 3560 },
          ENTERPRISE: { monthly: 549, annual: 5600 },
        };

        const agreedPrice = billingCycle === 'ANNUAL'
          ? tierPrices[planTier]?.annual || 3560
          : tierPrices[planTier]?.monthly || 349;

        const defaultFeatures: Record<string, string[]> = {
          BASIC: [
            'Up to 15 Vehicles & 15 Drivers',
            'Up to 3 Corporate Client Accounts',
            'Trip Dispatch & Route Invoicing',
            'Automated Tax Calculation & PDF Invoices',
            'Email Notifications Support',
          ],
          PRO: [
            'Up to 75 Vehicles & 75 Drivers',
            'Up to 20 Corporate Client Accounts',
            'Dynamic Corporate Domain Validation',
            'Advanced Fleet Document Branding & SAC 996609',
            'On-Call, Monthly Consolidated & Spot Trip Invoicing',
            'Custom Email/SMS Alerts & Payment Telemetry',
          ],
          ENTERPRISE: [
            'Up to 250 Vehicles & 250 Drivers',
            'Up to 100 Corporate Client Accounts',
            'Full Multi-Tenant SaaS Isolation & Custom Domains',
            'Multi-Role Authorization (SuperAdmin, Manager, Operator)',
            'Automated Route Card Consolidation & Telemetry Metering',
            'Dedicated Priority Support SLA',
          ],
        };

        setData({
          planTier,
          planName: tierNames[planTier] || `${planTier} Plan`,
          status: sub.isSuspended ? 'SUSPENDED' : sub.inGracePeriod ? 'PAST_DUE' : (sub.status || 'ACTIVE'),
          billingCycle,
          agreedPrice,
          currency: 'INR',
          currentPeriodStart: start.toDateString(),
          currentPeriodEnd: end.toDateString(),
          nextRenewalDate: end.toDateString(),
          daysTotal,
          daysElapsed,
          daysRemaining,
          progressPercent,
          quotas,
          features: defaultFeatures[planTier] || [],
          allPlanCatalog: [
            { tier: 'BASIC', name: 'Starter Mobility', monthly: 299, annual: 3050 },
            { tier: 'PRO', name: 'Growth Fleet Pro', monthly: 349, annual: 3560 },
            { tier: 'ENTERPRISE', name: 'Enterprise Mobility Suite', monthly: 549, annual: 5600 },
          ],
        });

        setModalTier(planTier);
        setModalCycle(billingCycle);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load current subscription plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetails();
  }, []);

  const handleOpenModal = (tier?: 'BASIC' | 'PRO' | 'ENTERPRISE') => {
    if (tier) setModalTier(tier);
    setCheckoutOrder(null);
    setIsModalOpen(true);
  };

  const handleCreateCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const res = await axiosInstance.post('/tenants/subscription/checkout', {
        planTier: modalTier,
        billingCycle: modalCycle,
        paymentMethod: 'GATEWAY',
      });

      if (res.data && res.data.success) {
        setCheckoutOrder(res.data.data);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to initialize checkout.', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleConfirmMockPayment = async () => {
    if (!checkoutOrder?.invoice?.subscriptionInvoiceId) return;

    try {
      setCheckoutLoading(true);
      const res = await axiosInstance.post('/tenants/subscription/verify-payment', {
        subscriptionInvoiceId: checkoutOrder.invoice.subscriptionInvoiceId,
        isSimulated: true,
        transactionReference: `SIM_TXN_${Date.now()}`,
      });

      if (res.data && res.data.success) {
        showToast('Payment verified successfully! Subscription activated.', 'success');
        setIsModalOpen(false);
        fetchPlanDetails();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Payment verification failed.', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            <CheckCircle size={13} /> Active Subscription
          </span>
        );
      case 'TRIALING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
            <Sparkles size={13} /> Free Trial Setup (1-Record Allowance)
          </span>
        );
      case 'PAST_DUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
            <Clock size={13} /> Past Due (3-Day Grace Period)
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider">
            <AlertTriangle size={13} /> Suspended (Renewal Unpaid)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full bg-slate-100 text-slate-800 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="p-12 text-center text-slate-500 text-sm">
          <RefreshCw className="animate-spin inline-block mr-2" size={16} />
          Loading plan details...
        </div>
      </PageLayout>
    );
  }

  if (error || !data) {
    return (
      <PageLayout>
        <div className="p-8 text-center text-rose-600 text-sm font-semibold">{error || 'Plan not found.'}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <AlertContainer />
      <div className="py-6 max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C04E24]/20 text-[#DE8A66] border border-[#C04E24]/30 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                SaaS Subscription & Entitlements
              </span>
              <span className="text-[#EDE9E3] text-xs">Authoritative Entitlement Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Current Fleet Subscription</h1>
            <p className="text-xs text-[#EDE9E3] mt-1">
              Review current plan quotas, duration elapsed, renewal anniversary, and upgrade options.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleOpenModal()}
              className="px-5 py-2.5 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Upgrade / Renew Plan</span>
            </button>
            <a
              href="/subscription/history"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-bold rounded-lg border border-white/10 transition"
            >
              Billing History &rarr;
            </a>
          </div>
        </div>

        {/* Plan Overview Card */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#FAF8F5]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C04E24]/10 border border-[#C04E24]/20 flex items-center justify-center text-[#C04E24]">
                <Crown size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-[#1C1A18]">{data.planName}</h2>
                  {getStatusBadge(data.status)}
                </div>
                <p className="text-xs text-[#7A7570] mt-1">
                  Billing Cycle: <strong className="text-[#1C1A18]">{data.billingCycle}</strong> &bull; Agreed Price:{' '}
                  <strong className="text-[#1C1A18]">
                    ₹{data.agreedPrice.toLocaleString('en-IN')} {data.currency}
                  </strong>{' '}
                  / {data.billingCycle === 'ANNUAL' ? 'year' : 'month'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-[#7A7570] uppercase tracking-wider block">
                Next Renewal Date
              </span>
              <p className="text-lg font-extrabold text-[#C04E24] mt-0.5">{data.nextRenewalDate}</p>
              <span className="text-xs text-[#5C5752]">{data.daysRemaining} calendar day(s) remaining</span>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="pt-6 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-[#5C5752]">
              <span>Period Start: {data.currentPeriodStart}</span>
              <span className="font-bold text-[#1C1A18]">{data.daysElapsed} of {data.daysTotal} days elapsed ({data.progressPercent}%)</span>
              <span>Period End: {data.currentPeriodEnd}</span>
            </div>
            <div className="w-full bg-[#FAF8F5] border border-[#E0DAD1] h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#C04E24] h-full rounded-full transition-all duration-500"
                style={{ width: `${data.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quota Telemetry Meters Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={14} className="text-[#C04E24]" />
            <span>Resource Usage vs Plan Entitlements</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Vehicles */}
            <div className="bg-white rounded-xl border border-[#E0DAD1] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5C5752] uppercase flex items-center gap-1.5">
                  <Truck size={15} className="text-[#C04E24]" /> Vehicles
                </span>
                <span className="text-xs font-extrabold text-[#1C1A18]">
                  {data.quotas.vehicles.current} / {data.quotas.vehicles.limit}
                </span>
              </div>
              <div className="w-full bg-[#FAF8F5] border border-[#E0DAD1] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#C04E24] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((data.quotas.vehicles.current / Math.max(1, data.quotas.vehicles.limit)) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#7A7570]">
                {Math.max(0, data.quotas.vehicles.limit - data.quotas.vehicles.current)} vehicles available to add
              </p>
            </div>

            {/* Drivers */}
            <div className="bg-white rounded-xl border border-[#E0DAD1] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5C5752] uppercase flex items-center gap-1.5">
                  <Users size={15} className="text-[#C04E24]" /> Drivers
                </span>
                <span className="text-xs font-extrabold text-[#1C1A18]">
                  {data.quotas.drivers.current} / {data.quotas.drivers.limit}
                </span>
              </div>
              <div className="w-full bg-[#FAF8F5] border border-[#E0DAD1] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#C04E24] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((data.quotas.drivers.current / Math.max(1, data.quotas.drivers.limit)) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#7A7570]">
                {Math.max(0, data.quotas.drivers.limit - data.quotas.drivers.current)} driver slots available
              </p>
            </div>

            {/* Companies */}
            <div className="bg-white rounded-xl border border-[#E0DAD1] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5C5752] uppercase flex items-center gap-1.5">
                  <Building size={15} className="text-[#C04E24]" /> Companies
                </span>
                <span className="text-xs font-extrabold text-[#1C1A18]">
                  {data.quotas.companies.current} / {data.quotas.companies.limit}
                </span>
              </div>
              <div className="w-full bg-[#FAF8F5] border border-[#E0DAD1] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#C04E24] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((data.quotas.companies.current / Math.max(1, data.quotas.companies.limit)) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#7A7570]">
                {Math.max(0, data.quotas.companies.limit - data.quotas.companies.current)} corporate clients remaining
              </p>
            </div>

            {/* Monthly Trips */}
            <div className="bg-white rounded-xl border border-[#E0DAD1] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5C5752] uppercase flex items-center gap-1.5">
                  <Calendar size={15} className="text-[#C04E24]" /> Monthly Trips
                </span>
                <span className="text-xs font-extrabold text-[#1C1A18]">
                  {data.quotas.trips.current} / {data.quotas.trips.limit}
                </span>
              </div>
              <div className="w-full bg-[#FAF8F5] border border-[#E0DAD1] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#C04E24] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((data.quotas.trips.current / Math.max(1, data.quotas.trips.limit)) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#7A7570]">
                {Math.max(0, data.quotas.trips.limit - data.quotas.trips.current)} trips in current cycle
              </p>
            </div>
          </div>
        </div>

        {/* Features Included List */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] p-6 shadow-sm">
          <h3 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-4 pb-2 border-b border-[#FAF8F5]">
            Features Included in your {data.planName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#3D3833]">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe / Renew / Upgrade Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn border border-[#E0DAD1]">
              <div className="p-5 bg-[#1C1A18] text-white flex items-center justify-between border-b border-[#2E2A26]">
                <div className="flex items-center gap-2">
                  <Crown size={18} className="text-[#DE8A66]" />
                  <span className="text-base font-bold">Manage Subscription & Plans</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#1C1A18]">
                {/* Billing Cycle Toggle */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-2">
                    Choose Billing Frequency
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setModalCycle('MONTHLY');
                        setCheckoutOrder(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition ${
                        modalCycle === 'MONTHLY'
                          ? 'border-[#C04E24] bg-[#FAF8F5] ring-2 ring-[#C04E24]'
                          : 'border-[#E0DAD1] hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-sm block">Monthly Billing</span>
                      <span className="text-[11px] text-[#7A7570]">Standard flexible month-to-month access</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setModalCycle('ANNUAL');
                        setCheckoutOrder(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition relative ${
                        modalCycle === 'ANNUAL'
                          ? 'border-[#C04E24] bg-[#FAF8F5] ring-2 ring-[#C04E24]'
                          : 'border-[#E0DAD1] hover:bg-slate-50'
                      }`}
                    >
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase">
                        Save 15%
                      </span>
                      <span className="font-bold text-sm block">Annual Billing</span>
                      <span className="text-[11px] text-[#7A7570]">365-day upfront plan with 15% discount</span>
                    </button>
                  </div>
                </div>

                {/* Plan Tier Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-2">
                    Select Plan Tier
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {data.allPlanCatalog.map((p) => {
                      const price = modalCycle === 'ANNUAL' ? p.annual : p.monthly;
                      const isSelected = modalTier === p.tier;
                      return (
                        <div
                          key={p.tier}
                          onClick={() => {
                            setModalTier(p.tier);
                            setCheckoutOrder(null);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? 'border-[#C04E24] bg-[#FAF8F5] ring-2 ring-[#C04E24]'
                              : 'border-[#E0DAD1] hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-bold text-sm block text-[#1C1A18]">{p.tier}</span>
                          <span className="text-[11px] text-[#7A7570] block truncate">{p.name}</span>
                          <div className="mt-2 text-base font-extrabold text-[#C04E24]">
                            ₹{price.toLocaleString('en-IN')}{' '}
                            <span className="text-[10px] font-normal text-slate-500">
                              / {modalCycle === 'ANNUAL' ? 'yr' : 'mo'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary & GST Breakdown */}
                {checkoutOrder ? (
                  <div className="bg-[#FAF8F5] border border-[#E0DAD1] rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#E0DAD1]">
                      <span className="font-bold text-sm text-[#1C1A18]">Order Invoice: {checkoutOrder.invoice.invoiceNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                        Payment Pending
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#5C5752]">
                      <div className="flex justify-between">
                        <span>Plan Base Amount ({modalTier} &bull; {modalCycle}):</span>
                        <span className="font-semibold text-[#1C1A18]">₹{checkoutOrder.orderSummary.baseAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CGST (9%):</span>
                        <span>₹{checkoutOrder.orderSummary.cgstAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (9%):</span>
                        <span>₹{checkoutOrder.orderSummary.sgstAmount}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-[#E0DAD1] font-bold text-sm text-[#1C1A18]">
                        <span>Total Payable (incl 18% GST):</span>
                        <span className="text-[#C04E24]">₹{checkoutOrder.orderSummary.totalAmount} INR</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Ready to proceed?</p>
                      <p>Generate draft invoice with statutory 18% GST breakdown.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateCheckout}
                      disabled={checkoutLoading}
                      className="px-4 py-2 bg-[#1C1A18] hover:bg-black text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                    >
                      {checkoutLoading ? 'Calculating...' : 'Review Invoice'}
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#FAF8F5] border-t border-[#E0DAD1] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-[#E0DAD1] rounded-lg hover:bg-slate-100 transition"
                >
                  Close
                </button>

                {checkoutOrder && (
                  <button
                    type="button"
                    onClick={handleConfirmMockPayment}
                    disabled={checkoutLoading}
                    className="px-6 py-2.5 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CreditCard size={14} />
                    <span>{checkoutLoading ? 'Processing...' : 'Confirm Test Sandbox Payment'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CurrentPlan;
