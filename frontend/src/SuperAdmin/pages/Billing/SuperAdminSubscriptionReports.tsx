import React, { useState, useEffect } from 'react';
import PageLayout from '../../../components/PageLayout';
import axiosInstance from '../../../utils/axiosInstance';
import SearchBar from '../../../components/SearchBar';
import {
  Receipt,
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Filter,
  DollarSign,
  Calendar,
  Layers,
  Download,
} from 'lucide-react';

interface SuperAdminInvoiceRecord {
  subscriptionInvoiceId: string;
  invoiceNumber: string;
  tenantId: string;
  fleetName: string;
  businessCode: string;
  contactEmail: string;
  planTier: string;
  billingCycle: string;
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  transactionReference: string | null;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  paidAt: string | null;
  createdAt: string;
}

const SuperAdminSubscriptionReports: React.FC = () => {
  const [invoices, setInvoices] = useState<SuperAdminInvoiceRecord[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeCycleTab, setActiveCycleTab] = useState<'ALL' | 'MONTHLY' | 'ANNUAL'>('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PAID');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchReports = async (targetPage = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page: targetPage,
        limit: 15,
      };

      if (activeCycleTab !== 'ALL') params.billingCycle = activeCycleTab;
      if (planFilter !== 'ALL') params.planTier = planFilter;
      if (statusFilter !== 'ALL') params.paymentStatus = statusFilter;
      if (searchText) params.search = searchText;

      const res = await axiosInstance.get('/tenants/admin/billing/reports', { params });
      if (res.data && res.data.success) {
        setInvoices(res.data.data || []);
        setTotalCollected(res.data.totalCollected || 0);
        setCurrency(res.data.currency || 'INR');
        setPage(res.data.pagination?.page || 1);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalRecords(res.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch subscription reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [activeCycleTab, planFilter, statusFilter]);

  const handleSearch = () => {
    fetchReports(1);
  };

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
        {/* Top Header Card */}
        <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C04E24]/20 text-[#DE8A66] border border-[#C04E24]/30 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Platform SaaS Revenue Reporting
              </span>
              <span className="text-[#EDE9E3] text-xs">SuperAdmin Financial Oversight</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Subscription Revenue & Tenant Billing</h1>
            <p className="text-xs text-[#EDE9E3] mt-1">
              Server-side multi-tenant subscription audit, filterable collections by plan and cycle, and immutable payment records.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchReports(page)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-bold rounded-lg border border-white/10 transition flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Reports</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filtered Revenue Banner */}
        <div className="bg-gradient-to-r from-[#1C1A18] to-[#262320] border border-[#3D3833] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C04E24]/20 border border-[#C04E24]/40 flex items-center justify-center text-[#DE8A66]">
              <Receipt size={24} />
            </div>
            <div>
              <span className="text-xs text-[#EDE9E3] uppercase tracking-wider font-semibold">
                Total Verified Collections (Matching Active Filter)
              </span>
              <div className="text-3xl font-extrabold text-[#DE8A66] mt-0.5">
                ₹{totalCollected.toLocaleString('en-IN')}{' '}
                <span className="text-sm font-semibold text-slate-300">{currency}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#EDE9E3] space-y-1 text-right">
            <div>Total Invoices Filtered: <strong className="text-white">{totalRecords}</strong></div>
            <div>Filter: <span className="font-semibold text-white">{activeCycleTab} Cycle &bull; {planFilter} Plan &bull; {statusFilter} Status</span></div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Cycle Tabs */}
            <div className="flex items-center bg-[#FAF8F5] p-1 rounded-lg border border-[#E0DAD1]">
              <button
                type="button"
                onClick={() => setActiveCycleTab('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  activeCycleTab === 'ALL' ? 'bg-[#C04E24] text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                All Cycles
              </button>
              <button
                type="button"
                onClick={() => setActiveCycleTab('MONTHLY')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  activeCycleTab === 'MONTHLY' ? 'bg-[#C04E24] text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                Monthly Views
              </button>
              <button
                type="button"
                onClick={() => setActiveCycleTab('ANNUAL')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  activeCycleTab === 'ANNUAL' ? 'bg-[#C04E24] text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                Annual Views
              </button>
            </div>

            {/* Plan Tier filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E0DAD1] text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C04E24]"
            >
              <option value="ALL">All SaaS Plans</option>
              <option value="BASIC">BASIC (Starter)</option>
              <option value="PRO">PRO (Growth)</option>
              <option value="ENTERPRISE">ENTERPRISE (Mobility)</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E0DAD1] text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C04E24]"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">PAID (Verified Only)</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="w-full lg:w-80">
            <SearchBar
              placeholder="Search fleet, invoice #, txn ref..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Invoices Report Table */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <RefreshCw className="animate-spin inline-block mr-2" size={16} />
              Loading subscription reports...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-600 text-sm font-semibold">{error}</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No subscription invoices match the selected filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E0DAD1] text-[11px] font-bold text-[#7A7570] uppercase tracking-wider">
                    <th className="py-3 px-4">Fleet / Tenant</th>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Plan & Cycle</th>
                    <th className="py-3 px-4">Amount (INR)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Period Dates</th>
                    <th className="py-3 px-4">Txn Reference</th>
                    <th className="py-3 px-4">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F5] text-xs text-[#1C1A18]">
                  {invoices.map((inv) => (
                    <tr key={inv.subscriptionInvoiceId} className="hover:bg-[#FAF8F5]/60 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#1C1A18] block">{inv.fleetName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {inv.businessCode} &bull; {inv.contactEmail}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#843217]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#1C1A18] block">{inv.planTier}</span>
                        <span className="text-[10px] text-[#7A7570] uppercase tracking-wider">
                          {inv.billingCycle}
                        </span>
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
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <span>{new Date(inv.billingPeriodStart).toLocaleDateString()}</span>
                        <span className="text-slate-400 mx-1">&rarr;</span>
                        <span>{new Date(inv.billingPeriodEnd).toLocaleDateString()}</span>
                      </td>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E0DAD1] flex items-center justify-between text-xs text-slate-600">
              <span>
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} total entries)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => fetchReports(page - 1)}
                  className="px-3 py-1.5 bg-white border border-[#E0DAD1] rounded-lg font-bold disabled:opacity-50 hover:bg-slate-50 transition"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => fetchReports(page + 1)}
                  className="px-3 py-1.5 bg-white border border-[#E0DAD1] rounded-lg font-bold disabled:opacity-50 hover:bg-slate-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SuperAdminSubscriptionReports;
