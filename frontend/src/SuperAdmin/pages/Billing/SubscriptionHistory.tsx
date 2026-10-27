import React, { useState, useEffect } from 'react';
import PageLayout from '../../../components/PageLayout';
import axiosInstance from '../../../utils/axiosInstance';
import SearchBar from '../../../components/SearchBar';
import {
  FileText,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Filter,
  ArrowRight,
  Download,
  Info,
} from 'lucide-react';

interface SubscriptionInvoiceItem {
  subscriptionInvoiceId: string;
  invoiceNumber: string;
  planTier: string;
  billingCycle: string;
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  transactionReference: string | null;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  paidAt: string | null;
  createdAt: string;
  metadata?: any;
}

const SubscriptionHistory: React.FC = () => {
  const [invoices, setInvoices] = useState<SubscriptionInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [cycleFilter, setCycleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/tenants/subscription/invoices');
      if (res.data && res.data.success) {
        setInvoices(res.data.data || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load subscription invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      inv.transactionReference?.toLowerCase().includes(searchText.toLowerCase()) ||
      inv.planTier?.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;
    if (planFilter !== 'ALL' && inv.planTier !== planFilter) return false;
    if (cycleFilter !== 'ALL' && inv.billingCycle !== cycleFilter) return false;
    if (statusFilter !== 'ALL' && inv.paymentStatus !== statusFilter) return false;

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle size={11} /> PAID
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={11} /> PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle size={11} /> {status}
          </span>
        );
    }
  };

  return (
    <PageLayout>
      <div className="py-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C04E24]/20 text-[#DE8A66] border border-[#C04E24]/30 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Financial Audit Trail
              </span>
              <span className="text-[#EDE9E3] text-xs">Immutable Invoices</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Subscription History & Invoices</h1>
            <p className="text-xs text-[#EDE9E3] mt-1">
              Complete historical record of SaaS subscription periods, invoice breakdowns, and verified payment transactions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchInvoices}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-bold rounded-lg border border-white/10 transition flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <a
              href="/subscription/current"
              className="px-4 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              &larr; Current Plan
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Plan filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E0DAD1] text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C04E24]"
            >
              <option value="ALL">All Plan Tiers</option>
              <option value="BASIC">BASIC</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>

            {/* Cycle filter */}
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E0DAD1] text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C04E24]"
            >
              <option value="ALL">All Billing Cycles</option>
              <option value="MONTHLY">Monthly</option>
              <option value="ANNUAL">Annual</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E0DAD1] text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C04E24]"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="w-full lg:w-80">
            <SearchBar
              placeholder="Search invoice number, txn ref..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => {}}
            />
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <RefreshCw className="animate-spin inline-block mr-2" size={16} />
              Loading subscription history...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-600 text-sm font-semibold">{error}</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No subscription invoices found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E0DAD1] text-[11px] font-bold text-[#7A7570] uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Plan & Cycle</th>
                    <th className="py-3 px-4">Period Dates</th>
                    <th className="py-3 px-4">Total Amount (INR)</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Txn Reference</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F5] text-xs text-[#1C1A18]">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.subscriptionInvoiceId} className="hover:bg-[#FAF8F5]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#843217]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#1C1A18] block">{inv.planTier}</span>
                        <span className="text-[10px] text-[#7A7570] uppercase tracking-wider">
                          {inv.billingCycle}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span>{new Date(inv.billingPeriodStart).toLocaleDateString()}</span>
                        <span className="text-slate-400 mx-1">&rarr;</span>
                        <span>{new Date(inv.billingPeriodEnd).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#1C1A18] text-sm">
                          ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] text-[#7A7570]">
                          (Base: ₹{inv.baseAmount} + GST: ₹{inv.taxAmount})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(inv.paymentStatus)}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {inv.transactionReference || <span className="text-slate-400">&mdash;</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SubscriptionHistory;
