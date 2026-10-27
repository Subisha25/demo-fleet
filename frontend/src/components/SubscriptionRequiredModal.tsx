import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, ArrowRight, X, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  isExpired?: boolean;
  resource?: string;
  current?: number;
  limit?: number;
  planTier?: string;
}

export const SubscriptionRequiredModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  isExpired = false,
  resource,
  current,
  limit,
  planTier = 'PRO',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const defaultTitle = isExpired ? 'Subscription Expired' : 'Subscription Required';
  const defaultMessage = isExpired
    ? 'Your fleet subscription has expired. Creating, editing, deleting records, and dispatching bookings are locked until your plan is renewed.'
    : 'Your initial one-record free setup allowance has been consumed. To continue adding vehicles, drivers, client companies, or booking dispatches, please activate a paid subscription plan.';

  const handleChoosePlan = () => {
    onClose();
    navigate('/billing/current');
  };

  const handleViewPlanDetails = () => {
    onClose();
    navigate('/subscription/history');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#E0DAD1] shadow-2xl max-w-lg w-full overflow-hidden transform transition-all animate-scaleUp">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1C1A18] to-[#2E2A26] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#A8A29E] hover:text-white p-1 rounded-full transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C04E24] text-white flex items-center justify-center shadow-lg flex-shrink-0">
              {isExpired ? <Lock size={24} /> : <Crown size={24} />}
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C04E24]/30 text-[#DE8A66] border border-[#C04E24]/40 uppercase tracking-wider">
                FleetFlow SaaS Entitlement
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {title || defaultTitle}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
            {message || defaultMessage}
          </p>

          {resource && limit !== undefined && (
            <div className="bg-[#FAF8F5] border border-[#E0DAD1] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#7A7570] uppercase">Module Quota</span>
                <p className="text-sm font-extrabold text-[#1C1A18]">{resource}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-[#7A7570] uppercase">Usage</span>
                <p className="text-sm font-extrabold text-[#C04E24]">
                  {current !== undefined ? current : 1} / {limit}
                </p>
              </div>
            </div>
          )}

          {/* Value Checklist */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs text-emerald-900">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 size={15} /> What you unlock with an active paid plan:
            </div>
            <ul className="space-y-1 pl-5 list-disc text-[11px] text-emerald-800/90">
              <li>Up to 15 (Basic), 75 (Pro), or 250 (Enterprise) vehicles & drivers</li>
              <li>Unlimited booking dispatches and automated invoicing</li>
              <li>Consolidated corporate client billing and custom PDF templates</li>
              <li>Instant plan activation upon verified payment</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF8F5] border-t border-[#E0DAD1] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E0DAD1] hover:bg-white text-xs font-bold text-[#5C5752] transition cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleViewPlanDetails}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#C04E24]/30 bg-[#C04E24]/10 hover:bg-[#C04E24]/20 text-xs font-bold text-[#C04E24] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText size={14} />
            <span>View Plan Details</span>
          </button>

          <button
            type="button"
            onClick={handleChoosePlan}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{isExpired ? 'Renew Subscription' : 'Subscribe / Choose Plan'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequiredModal;
