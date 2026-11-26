import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle, ShieldAlert, CreditCard, CheckCircle2, LogOut, Loader2, Sparkles } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from './AlertBox';

export interface SubscriptionLockModalProps {
  isOpen: boolean;
  lockReason?: 'PAYMENT_PENDING' | 'EXPIRED' | 'SUSPENDED' | 'NONE';
  subscriptionStatus?: string;
  planTier?: string;
  billingCycle?: string;
  payableAmount?: number;
  baseAmount?: number;
  taxAmount?: number;
  periodEnd?: string | null;
  message?: string;
  onPaymentSuccess?: () => void;
}

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  BASIC: 'Starter Mobility',
  PRO: 'Growth Fleet Pro',
  ENTERPRISE: 'Enterprise Mobility Suite',
};

export const SubscriptionLockModal: React.FC<SubscriptionLockModalProps> = ({
  isOpen,
  lockReason = 'PAYMENT_PENDING',
  subscriptionStatus = 'PENDING_PAYMENT',
  planTier = 'PRO',
  billingCycle = 'MONTHLY',
  payableAmount = 411.82,
  baseAmount = 349.00,
  taxAmount = 62.82,
  periodEnd,
  message,
  onPaymentSuccess,
}) => {
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const planName = PLAN_DISPLAY_NAMES[planTier] || `${planTier} Plan`;
  const isExpired = lockReason === 'EXPIRED';
  const isSuspended = lockReason === 'SUSPENDED';

  const title = isExpired
    ? 'Subscription Expired'
    : isSuspended
    ? 'Subscription Suspended'
    : 'Payment Required to Activate Fleet';

  const defaultExplanation = isExpired
    ? 'Your subscription period has ended. Access to dashboard management, vehicle tracking, dispatching, and invoicing is locked until renewal.'
    : isSuspended
    ? 'Your fleet subscription is currently suspended or canceled. Please renew your plan to reactivate full operational access.'
    : 'Your fleet registration application has been approved by SuperAdmin! Complete your subscription payment to unlock and activate your fleet dashboard.';

  const handlePayNow = async () => {
    setProcessing(true);
    setPaymentError(null);

    try {
      // 1. Create or retrieve checkout invoice
      const checkoutRes = await axiosInstance.post('/tenants/subscription/checkout', {
        planTier,
        billingCycle,
        paymentMethod: 'GATEWAY',
      });

      const invData = checkoutRes.data?.data?.invoice || checkoutRes.data?.invoice || checkoutRes.data?.data;
      const invoiceId = invData?.subscriptionInvoiceId || invData?.id;

      if (!invoiceId) {
        throw new Error('Failed to initiate subscription checkout invoice.');
      }

      // 2. Complete payment verification with server
      const verifyRes = await axiosInstance.post('/tenants/subscription/verify-payment', {
        subscriptionInvoiceId: invoiceId,
        isSimulated: true,
        isTestMode: true,
        transactionReference: `TXN_CABZ_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`,
      });

      if (verifyRes.data?.success) {
        showToast('Payment verified successfully! Official receipt with PDF has been sent to your registered email.', 'success');
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
      const errMsg = err.response?.data?.message || err.message || 'Payment processing failed. Please try again.';
      setPaymentError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setProcessing(false);
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
        className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-xl w-full overflow-hidden transform transition-all my-8 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-[#17171D] via-[#241F3A] to-[#17171D] p-6 text-white border-b-4 border-[#5B3DF5]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5B3DF5] text-white flex items-center justify-center shadow-lg shrink-0">
              {isExpired ? <AlertTriangle size={28} /> : isSuspended ? <ShieldAlert size={28} /> : <Lock size={28} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#5B3DF5]/30 text-[#DE8A66] border border-[#5B3DF5]/50 uppercase tracking-wider">
                  CABZ SaaS Entitlement
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isExpired
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : isSuspended
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {subscriptionStatus.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                {title}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm text-[#5C5752] leading-relaxed">
            {message || defaultExplanation}
          </p>

          {/* Pricing & Plan Details Card */}
          <div className="bg-[#F7F7FB] border border-[#E5E7EB] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#7A7570] tracking-wider">Assigned Plan</span>
                <h4 className="text-base font-extrabold text-[#17171D] flex items-center gap-1.5 mt-0.5">
                  <Sparkles size={16} className="text-[#5B3DF5]" />
                  {planName}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase text-[#7A7570] tracking-wider">Billing Frequency</span>
                <p className="text-sm font-bold text-[#17171D] capitalize mt-0.5">
                  {billingCycle.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#5C5752]">
              <div className="flex justify-between py-1">
                <span>Base Plan Price:</span>
                <span className="font-semibold text-[#17171D]">₹{baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Goods & Services Tax (GST 18%):</span>
                <span className="font-semibold text-[#17171D]">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {periodEnd && isExpired && (
                <div className="flex justify-between py-1 text-rose-600 font-semibold">
                  <span>Expired On:</span>
                  <span>{new Date(periodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-[#17171D] tracking-wider">Total Amount Payable</span>
                <p className="text-[11px] text-[#7A7570]">Inclusive of all applicable taxes</p>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-[#5B3DF5] tracking-tight">
                  ₹{payableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Value Checklist */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs text-emerald-900">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 size={16} /> Instant Activation Includes:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-emerald-800 pl-5 list-disc">
              <li>Full Fleet & Driver Management</li>
              <li>Live Trip Tracking & Dispatch</li>
              <li>GST Invoicing & PDF Generation</li>
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
              onClick={handlePayNow}
              disabled={processing}
              className="w-full py-4 rounded-xl font-extrabold text-sm sm:text-base text-white bg-[#5B3DF5] hover:bg-[#4326C6] active:scale-[0.99] shadow-xl shadow-[#5B3DF5]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing Secure Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Pay Now — ₹{payableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
