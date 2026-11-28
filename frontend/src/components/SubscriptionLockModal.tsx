import React, { useState, useEffect } from 'react';
import {
  Lock,
  AlertTriangle,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  LogOut,
  Loader2,
  Sparkles,
  Clock,
  Send,
  Calendar,
  Check,
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from './AlertBox';

export interface SubscriptionLockModalProps {
  isOpen: boolean;
  lockReason?: 'PAYMENT_PENDING' | 'EXPIRED' | 'SUSPENDED' | 'TRIAL_EXPIRED' | 'NONE';
  subscriptionStatus?: string;
  planTier?: string | null;
  billingCycle?: string;
  payableAmount?: number;
  baseAmount?: number;
  taxAmount?: number;
  periodEnd?: string | null;
  message?: string;
  trialDetails?: {
    trialStatus?: string;
    originalTrialDays?: number;
    extendedTrialDays?: number;
    totalTrialDays?: number;
    trialStartDate?: string | null;
    originalTrialExpiry?: string | null;
    currentTrialExpiry?: string | null;
    remainingDays?: number;
    remainingMs?: number;
    trialExtensionHistory?: any[];
    latestExtensionRequest?: {
      requestId?: string;
      requestedDays?: number;
      approvedDays?: number | null;
      status?: 'PENDING' | 'APPROVED' | 'REJECTED';
      reason?: string;
      adminNotes?: string | null;
      requestedAt?: string;
      reviewedAt?: string | null;
    } | null;
    pendingExtensionRequest?: {
      requestId?: string;
      requestedDays?: number;
      requestedAt?: string;
    } | null;
  };
  onPaymentSuccess?: () => void;
}

interface PlanDefinition {
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  tagline: string;
  monthlyBase: number;
  annualBase: number;
  features: string[];
  popular?: boolean;
}

const AVAILABLE_PLANS: PlanDefinition[] = [
  {
    tier: 'BASIC',
    name: 'Starter Mobility',
    tagline: 'Ideal for small local fleet operators',
    monthlyBase: 299,
    annualBase: 2990,
    features: ['Up to 15 Active Vehicles', 'Driver Management & Scheduling', 'Trip Dispatching', 'GST Invoicing & Receipts'],
  },
  {
    tier: 'PRO',
    name: 'Growth Fleet Pro',
    tagline: 'Best for growing multi-city fleets',
    monthlyBase: 349,
    annualBase: 3490,
    features: ['Up to 50 Active Vehicles', 'Live Tracking & Route Dispatch', 'GST Invoicing & SMS Alerts', 'Corporate Accounts Management'],
    popular: true,
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise Mobility Suite',
    tagline: 'Unlimited power & corporate workflows',
    monthlyBase: 549,
    annualBase: 5490,
    features: ['Unlimited Vehicles & Drivers', 'Priority Dispatch & VIP Queues', 'Custom Reports & Audit Logs', '24/7 Dedicated Support SLA'],
  },
];

export const SubscriptionLockModal: React.FC<SubscriptionLockModalProps> = ({
  isOpen,
  lockReason = 'PAYMENT_PENDING',
  subscriptionStatus = 'PENDING_PAYMENT',
  planTier = null,
  billingCycle = 'MONTHLY',
  payableAmount: initialPayableAmount,
  baseAmount: initialBaseAmount,
  taxAmount: initialTaxAmount,
  periodEnd,
  message,
  trialDetails,
  onPaymentSuccess,
}) => {
  const isTrialExpired =
    subscriptionStatus === 'TRIAL_EXPIRED' ||
    lockReason === 'TRIAL_EXPIRED' ||
    trialDetails?.trialStatus === 'TRIAL_EXPIRED';
  const isExpired = lockReason === 'EXPIRED' && !isTrialExpired;
  const isSuspended = lockReason === 'SUSPENDED';

  // Core Rule 2: Expired trial MUST NOT default to PRO or ₹411.82 before customer chooses a plan!
  // Initialize selected plan: only pre-select if caller provided an explicit paid tier AND it is not a trial expiry
  const initialPlanTier: 'BASIC' | 'PRO' | 'ENTERPRISE' | null =
    !isTrialExpired && planTier && ['BASIC', 'PRO', 'ENTERPRISE'].includes(planTier)
      ? (planTier as 'BASIC' | 'PRO' | 'ENTERPRISE')
      : null;

  const [selectedPlanTier, setSelectedPlanTier] = useState<'BASIC' | 'PRO' | 'ENTERPRISE' | null>(initialPlanTier);
  const [selectedCycle, setSelectedCycle] = useState<'MONTHLY' | 'ANNUAL'>(
    billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY'
  );
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Trial Extension Request State
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [requestedDays, setRequestedDays] = useState<number>(7);
  const [extensionReason, setExtensionReason] = useState<string>('');
  const [submittingExtension, setSubmittingExtension] = useState(false);
  const [submittedPending, setSubmittedPending] = useState<any>(null);

  // Check pending request from props or local submission
  const activePending =
    submittedPending ||
    trialDetails?.pendingExtensionRequest ||
    (trialDetails?.latestExtensionRequest?.status === 'PENDING'
      ? trialDetails.latestExtensionRequest
      : null);

  // Strictly non-dismissible: Prevent Esc key closing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamic calculation based strictly on customer selection
  const selectedPlan = AVAILABLE_PLANS.find((p) => p.tier === selectedPlanTier) || null;
  const computedBase = selectedPlan
    ? selectedCycle === 'ANNUAL'
      ? selectedPlan.annualBase
      : selectedPlan.monthlyBase
    : 0;
  const computedTax = selectedPlan ? Math.round(computedBase * 0.18 * 100) / 100 : 0;
  const computedTotal = selectedPlan ? Math.round((computedBase + computedTax) * 100) / 100 : 0;

  const title = isTrialExpired
    ? '7-Day Free Trial Expired'
    : isExpired
    ? 'Subscription Expired'
    : isSuspended
    ? 'Subscription Suspended'
    : 'Subscription Required';

  const defaultExplanation = isTrialExpired
    ? 'Your 7-day Free Trial period has ended. Operational access (dispatch, vehicle tracking, driver allocation, and invoicing) is paused. Please select an eligible paid plan below to continue operating or request additional trial days.'
    : isExpired
    ? 'Your subscription period has ended. Access to dashboard management, vehicle tracking, dispatching, and invoicing is locked until renewal.'
    : isSuspended
    ? 'Your fleet subscription is currently suspended or canceled. Please renew your plan to reactivate full operational access.'
    : 'Your fleet registration application has been approved! Select your subscription plan to unlock and activate your fleet dashboard.';

  const handlePayNow = async () => {
    if (!selectedPlanTier) {
      showToast('Please select a subscription plan tier before proceeding.', 'error');
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      // 1. Create checkout invoice with selected tier and cycle
      const checkoutRes = await axiosInstance.post('/tenants/subscription/checkout', {
        planTier: selectedPlanTier,
        billingCycle: selectedCycle,
        paymentMethod: 'GATEWAY',
      });

      const invData =
        checkoutRes.data?.data?.invoice || checkoutRes.data?.invoice || checkoutRes.data?.data;
      const invoiceId = invData?.subscriptionInvoiceId || invData?.id;

      if (!invoiceId) {
        throw new Error('Failed to initiate subscription checkout invoice.');
      }

      // 2. Complete payment verification with server
      const verifyRes = await axiosInstance.post('/tenants/subscription/verify-payment', {
        subscriptionInvoiceId: invoiceId,
        isSimulated: true,
        isTestMode: true,
        transactionReference: `TXN_CABZ_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)
          .toUpperCase()}`,
      });

      if (verifyRes.data?.success) {
        showToast(
          `Payment verified successfully for ${selectedPlan?.name}! Official receipt with PDF has been sent to your registered email.`,
          'success'
        );
        if (onPaymentSuccess) {
          onPaymentSuccess();
        } else {
          window.location.reload();
        }
      } else {
        throw new Error(verifyRes.data?.message || 'Payment verification failed.');
      }
    } catch (err: any) {
      console.error('Subscription payment error:', err);
      const errMsg =
        err.response?.data?.message || err.message || 'Payment processing failed. Please try again.';
      setPaymentError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitExtensionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extensionReason.trim() || extensionReason.trim().length < 5) {
      showToast(
        'Please provide a reason / justification for the trial extension (min 5 characters).',
        'error'
      );
      return;
    }

    setSubmittingExtension(true);
    try {
      const res = await axiosInstance.post('/subscriptions/trial-extension/request', {
        requestedDays,
        reason: extensionReason.trim(),
      });

      if (res.data?.success) {
        showToast(
          `Request for ${requestedDays} additional free trial days submitted to SuperAdmin!`,
          'success'
        );
        setSubmittedPending({
          requestedDays,
          requestedAt: new Date().toISOString(),
          status: 'PENDING',
        });
        setShowExtensionForm(false);
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || 'Failed to submit trial extension request.';
      showToast(errMsg, 'error');
    } finally {
      setSubmittingExtension(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all my-8 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-[#17171D] via-[#241F3A] to-[#17171D] p-6 text-white border-b-4 border-[#5B3DF5]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5B3DF5] text-white flex items-center justify-center shadow-lg shrink-0">
              {isTrialExpired ? (
                <Clock size={28} />
              ) : isExpired ? (
                <AlertTriangle size={28} />
              ) : isSuspended ? (
                <ShieldAlert size={28} />
              ) : (
                <Lock size={28} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#5B3DF5]/30 text-[#DE8A66] border border-[#5B3DF5]/50 uppercase tracking-wider">
                  CABZ SaaS Entitlement
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isTrialExpired || isExpired
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isSuspended
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isTrialExpired ? 'FREE TRIAL EXPIRED' : subscriptionStatus.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">{title}</h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <p className="text-sm text-[#5C5752] leading-relaxed">
            {message || defaultExplanation}
          </p>

          {/* Pending Extension Request Banner */}
          {activePending && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
              <Clock size={20} className="shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-amber-950 flex items-center gap-2">
                  <span>Extension Request Pending Review</span>
                  <span className="px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase">
                    Under Review
                  </span>
                </div>
                <p className="text-amber-800">
                  You requested <strong>{activePending.requestedDays} additional free trial days</strong>.
                  Platform administrator has been alerted. Your operational access will restore automatically once approved.
                </p>
                <div className="text-[11px] text-amber-700">
                  Submitted:{' '}
                  {activePending.requestedAt
                    ? new Date(activePending.requestedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recently'}
                </div>
              </div>
            </div>
          )}

          {/* Request Extension Inline Form */}
          {showExtensionForm ? (
            <form
              onSubmit={handleSubmitExtensionRequest}
              className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
                  <Calendar size={18} className="text-indigo-600" />
                  <span>Request Additional Free Trial Days</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExtensionForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Additional Days Needed:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 7, 14].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setRequestedDays(d)}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        requestedDays === d
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      +{d} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason / Business Justification:
                </label>
                <textarea
                  rows={2}
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="e.g. Need a few more days to test multi-city dispatch with our fleet drivers..."
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingExtension}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submittingExtension ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Request to SuperAdmin...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Request for +{requestedDays} Days</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            isTrialExpired &&
            !activePending && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">Need more time to evaluate CABZ?</h4>
                  <p className="text-[11px] text-indigo-700">
                    Submit a request to SuperAdmin for extra trial days.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExtensionForm(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-white border border-indigo-300 hover:bg-indigo-50 shadow-sm transition shrink-0"
                >
                  Request Extra Days &rarr;
                </button>
              </div>
            )
          )}

          {/* Plan Selection Header & Billing Frequency Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#17171D] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#5B3DF5]" />
                  Select Your Subscription Plan
                </h3>
                <p className="text-xs text-[#7A7570]">
                  {selectedPlanTier
                    ? `Selected: ${selectedPlan?.name}`
                    : 'Choose an eligible plan below to calculate payable amount'}
                </p>
              </div>

              {/* Monthly / Annual Toggle */}
              <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedCycle('MONTHLY')}
                  className={`px-3 py-1 rounded-lg transition ${
                    selectedCycle === 'MONTHLY'
                      ? 'bg-white text-[#17171D] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle('ANNUAL')}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                    selectedCycle === 'ANNUAL'
                      ? 'bg-[#5B3DF5] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span>Annual</span>
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-500 text-white rounded-full font-black">
                    -17%
                  </span>
                </button>
              </div>
            </div>

            {/* Interactive 3-Plan Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AVAILABLE_PLANS.map((plan) => {
                const isSelected = selectedPlanTier === plan.tier;
                const price =
                  selectedCycle === 'ANNUAL' ? plan.annualBase : plan.monthlyBase;
                const cycleText = selectedCycle === 'ANNUAL' ? '/yr' : '/mo';

                return (
                  <div
                    key={plan.tier}
                    data-testid={`plan-card-${plan.tier.toLowerCase()}`}
                    onClick={() => setSelectedPlanTier(plan.tier)}
                    className={`relative rounded-2xl p-4 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#5B3DF5] bg-[#5B3DF5]/5 shadow-md shadow-[#5B3DF5]/15 ring-2 ring-[#5B3DF5]/20'
                        : 'border-[#E5E7EB] bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#17171D] uppercase">
                          {plan.tier}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#5B3DF5] bg-[#5B3DF5] text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#17171D] mt-0.5">
                        {plan.name}
                      </h4>
                      <p className="text-[11px] text-[#7A7570] line-clamp-1 mt-0.5">
                        {plan.tagline}
                      </p>

                      <div className="mt-3">
                        <span className="text-xl font-black text-[#17171D]">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-[#7A7570] font-semibold">
                          {cycleText}
                        </span>
                        <span className="block text-[9px] text-[#7A7570]">
                          + 18% GST
                        </span>
                      </div>
                    </div>

                    <ul className="mt-3 pt-2 border-t border-gray-100 space-y-1 text-[10px] text-[#5C5752]">
                      {plan.features.slice(0, 2).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & GST Calculation Breakdown */}
          <div className="bg-[#F7F7FB] border border-[#E5E7EB] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#7A7570] tracking-wider">
                  Selected Plan
                </span>
                <h4 className="text-base font-extrabold text-[#17171D] flex items-center gap-1.5 mt-0.5">
                  <Sparkles size={16} className="text-[#5B3DF5]" />
                  {selectedPlan ? selectedPlan.name : 'No Plan Selected'}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase text-[#7A7570] tracking-wider">
                  Billing Frequency
                </span>
                <p className="text-sm font-bold text-[#17171D] capitalize mt-0.5">
                  {selectedCycle.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#5C5752]">
              <div className="flex justify-between py-1">
                <span>Base Plan Price:</span>
                <span className="font-semibold text-[#17171D]">
                  {selectedPlan
                    ? `₹${computedBase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : '₹0.00 (Select a plan)'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Goods & Services Tax (GST 18%):</span>
                <span className="font-semibold text-[#17171D]">
                  {selectedPlan
                    ? `₹${computedTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : '₹0.00'}
                </span>
              </div>
              {periodEnd && (
                <div className="flex justify-between py-1 text-rose-600 font-semibold">
                  <span>Expired On:</span>
                  <span>
                    {new Date(periodEnd).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-[#17171D] tracking-wider">
                  Total Amount Payable
                </span>
                <p className="text-[11px] text-[#7A7570]">
                  {selectedPlan ? 'Inclusive of 18% GST' : 'Choose plan above'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-[#5B3DF5] tracking-tight">
                  ₹{computedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Value Checklist */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs text-emerald-900">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 size={16} /> Paid Subscription Activation Includes:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-emerald-800 pl-5 list-disc">
              <li>Full Fleet & Driver Management</li>
              <li>Live Trip Tracking & Dispatch</li>
              <li>GST Invoicing & Official PDF Receipt</li>
              <li>24/7 Automated Customer SMS</li>
            </ul>
          </div>

          {paymentError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-red-500" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              data-testid="activate-paid-plan-btn"
              onClick={handlePayNow}
              disabled={!selectedPlanTier || processing}
              className={`w-full py-4 rounded-xl font-extrabold text-sm sm:text-base text-white transition-all flex items-center justify-center gap-2 ${
                !selectedPlanTier || processing
                  ? 'bg-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-[#5B3DF5] hover:bg-[#4326C6] active:scale-[0.99] shadow-xl shadow-[#5B3DF5]/30 cursor-pointer'
              }`}
            >
              {processing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing Secure Payment...</span>
                </>
              ) : !selectedPlanTier ? (
                <>
                  <CreditCard size={20} />
                  <span>Please Select a Plan Above to Continue</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>
                    Activate {selectedPlan?.name} — ₹
                    {computedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={processing}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-[#7A7570] hover:text-[#17171D] hover:bg-gray-100 transition flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Sign Out of Operator Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionLockModal;
