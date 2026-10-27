import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import CommonButton from '../../../components/CommonButton';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faReceipt,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faDownload,
  faBuilding,
  faCreditCard,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';

interface BillingHistoryData {
  tenantId: string;
  fleetName: string;
  code: string;
  subscription: {
    subscriptionId: string;
    planTier: string;
    status: string;
    billingCycle: string;
    agreedPrice: number;
    currency: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEndsAt: string | null;
    lastPaymentDate: string | null;
    lastPaymentAmount: number | null;
    quotas: {
      vehicles: number;
      drivers: number;
      companies: number;
      trips: number;
    };
  };
  invoices: Array<{
    subscriptionInvoiceId: string;
    invoiceNumber: string;
    planTier: string;
    billingCycle: string;
    baseAmount: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    paymentStatus: string;
    paymentMethod: string | null;
    transactionReference: string | null;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    paidAt: string | null;
    createdAt: string;
    metadata: any;
  }>;
}

const TenantBillingHistory: React.FC<{ tenantIdProp?: string; onBack?: () => void }> = ({
  tenantIdProp,
  onBack,
}) => {
  const { tenantId: routeTenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const effectiveTenantId = tenantIdProp || routeTenantId;

  const [data, setData] = useState<BillingHistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/tenants/${effectiveTenantId}/billing-history`);
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching billing history:', err);
      showToast(err?.response?.data?.message || 'Failed to load billing history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [effectiveTenantId]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount?: number | null, currency = 'INR') => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/tenants/list');
    }
  };

  if (loading) {
    return (
      <PageLayout breadcrumbName="Subscription & Billing History">
        <div className="flex items-center justify-center p-12 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mr-3"></div>
          Loading subscription & payment history...
        </div>
      </PageLayout>
    );
  }

  if (!data) {
    return (
      <PageLayout breadcrumbName="Subscription & Billing History">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-lg font-bold text-slate-800">Fleet Record Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">Could not retrieve billing history for the specified tenant.</p>
          <div className="mt-4">
            <CommonButton text="← Back to SaaS Tenants" onClick={handleBack} className="bg-slate-700 text-white" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout breadcrumbName={`Billing History - ${data.fleetName}`}>
      <AlertContainer />
      {/* Header bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to SaaS Tenants
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>{data.fleetName}</span>
            <span className="text-xs font-mono font-normal text-slate-500 px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
              {data.code}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Authoritative subscription lifecycle, agreed rate, and payment receipts.</p>
        </div>
      </div>

      {/* Subscription Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Plan</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <span>{data.subscription.planTier}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                data.subscription.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {data.subscription.status}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Billing Cycle: <strong className="text-slate-700">{data.subscription.billingCycle}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agreed Subscription Price</div>
          <div className="text-xl font-extrabold text-teal-700 mt-1">
            {formatCurrency(data.subscription.agreedPrice, data.subscription.currency)}
            <span className="text-xs text-slate-500 font-normal"> / {data.subscription.billingCycle.toLowerCase()}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Taxes applicable as per standard GST</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billing Period</div>
          <div className="text-sm font-bold text-slate-800 mt-1">
            {formatDate(data.subscription.currentPeriodStart)} — {formatDate(data.subscription.currentPeriodEnd)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Renewal: <strong className="text-slate-700">{formatDate(data.subscription.currentPeriodEnd)}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Payment</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {data.subscription.lastPaymentAmount ? formatCurrency(data.subscription.lastPaymentAmount) : 'None'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Date: <strong className="text-slate-700">{formatDate(data.subscription.lastPaymentDate)}</strong>
          </div>
        </div>
      </div>

      {/* Quotas overview */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <FontAwesomeIcon icon={faShieldAlt} className="text-teal-600" />
          <span>Configured Quotas:</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-600">
          <div>Vehicles: <strong className="text-slate-900">{data.subscription.quotas.vehicles >= 999999 ? 'Unlimited' : data.subscription.quotas.vehicles}</strong></div>
          <div>Drivers: <strong className="text-slate-900">{data.subscription.quotas.drivers >= 999999 ? 'Unlimited' : data.subscription.quotas.drivers}</strong></div>
          <div>Companies: <strong className="text-slate-900">{data.subscription.quotas.companies >= 999999 ? 'Unlimited' : data.subscription.quotas.companies}</strong></div>
          <div>Monthly Trips: <strong className="text-slate-900">{data.subscription.quotas.trips >= 999999 ? 'Unlimited' : data.subscription.quotas.trips}</strong></div>
        </div>
      </div>

      {/* Historical Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <FontAwesomeIcon icon={faReceipt} className="text-slate-500" />
            <span>Subscription Invoices & Payment Receipts</span>
          </div>
          <span className="text-xs text-slate-500">
            Total records: {data.invoices.length}
          </span>
        </div>

        {data.invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No subscription invoices recorded for this fleet yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Plan / Cycle</th>
                  <th className="px-4 py-3">Period Dates</th>
                  <th className="px-4 py-3">Base Amount</th>
                  <th className="px-4 py-3">GST (18%)</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Paid Date</th>
                  <th className="px-4 py-3">Transaction Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.invoices.map((inv) => (
                  <tr key={inv.subscriptionInvoiceId} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{inv.planTier}</span>
                      <span className="text-[10px] text-slate-400 block">{inv.billingCycle}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(inv.billingPeriodStart)} — {formatDate(inv.billingPeriodEnd)}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(inv.baseAmount, inv.currency)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatCurrency(inv.taxAmount, inv.currency)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(inv.totalAmount, inv.currency)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : inv.paymentStatus === 'FAILED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            inv.paymentStatus === 'PAID'
                              ? faCheckCircle
                              : inv.paymentStatus === 'FAILED'
                              ? faTimesCircle
                              : faClock
                          }
                          className="text-[9px]"
                        />
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(inv.paidAt)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {inv.transactionReference || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TenantBillingHistory;
