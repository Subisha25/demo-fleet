import React, { useState, useEffect } from 'react';
import PageLayout from '../../../components/PageLayout';
import axiosInstance from '../../../utils/axiosInstance';
import SearchBar from '../../../components/SearchBar';
import {
  Bell,
  Mail,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Filter,
  Eye,
  Info,
  Calendar,
} from 'lucide-react';

interface NotificationLogItem {
  logId: string;
  channel: 'EMAIL' | 'SMS';
  maskedRecipient: string;
  templateCode: string;
  referenceEntity: string | null;
  referenceId: string | null;
  tenantId: string | null;
  fleetName: string;
  providerStatus: string;
  attemptCount: number;
  maxRetries: number;
  errorDetails: string | null;
  createdAt: string;
  updatedAt: string;
}

const NotificationAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'EMAIL' | 'SMS'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected item modal
  const [selectedLog, setSelectedLog] = useState<NotificationLogItem | null>(null);

  const fetchLogs = async (targetPage = 1) => {
    try {
      setLoading(true);
      const params: any = { page: targetPage, limit: 15 };
      if (channelFilter !== 'ALL') params.channel = channelFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchText) params.search = searchText;

      const res = await axiosInstance.get('/tenants/admin/notifications/audit-logs', { params });
      if (res.data && res.data.success) {
        setLogs(res.data.logs || []);
        setPage(res.data.page || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load notification audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [channelFilter, statusFilter]);

  const handleSearch = () => {
    fetchLogs(1);
  };

  const getStatusBadge = (status: string) => {
    const s = String(status).toUpperCase();
    if (s === 'SENT' || s === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle size={11} /> {s}
        </span>
      );
    }
    if (s === 'MOCK' || s === 'MOCK_DISPATCHED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          <Info size={11} /> MOCK (SAFE)
        </span>
      );
    }
    if (s === 'QUEUED' || s === 'RETRYING') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          <Clock size={11} /> {s}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
        <XCircle size={11} /> {s}
      </span>
    );
  };

  return (
    <PageLayout>
      <div className="py-6 max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-[#0B0B0F] border-b-4 border-purple-600 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-950/70 text-purple-300 border border-purple-700/50 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Notification Telemetry & Delivery Audit
              </span>
              <span className="text-slate-300 text-xs">Safe Bounded Lifecycle</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notification Monitoring Logs</h1>
            <p className="text-xs text-slate-300 mt-1">
              Real-time delivery status, attempt counters, masked recipient confidentiality, and audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(page)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/10 transition flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-purple-400' : ''} />
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>

        {/* Security / Safe Delivery Disclosure Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
          <Info size={18} className="text-purple-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900">Audit Safeguards & Idempotency</p>
            <p>
              Recipients are masked to protect PII. Synthetic test addresses are suppressed automatically to prevent external MTA delivery-incomplete loops.
              A provider accepting a message indicates transmission to relay, not confirmed inbox receipt.
            </p>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Channel filter */}
            <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setChannelFilter('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  channelFilter === 'ALL' ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                All Channels
              </button>
              <button
                onClick={() => setChannelFilter('EMAIL')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${
                  channelFilter === 'EMAIL' ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                <Mail size={12} /> Email
              </button>
              <button
                onClick={() => setChannelFilter('SMS')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${
                  channelFilter === 'SMS' ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                <MessageSquare size={12} /> SMS
              </button>
            </div>

            {/* Status select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="SENT">SENT / DELIVERED</option>
              <option value="MOCK">MOCK (Simulated)</option>
              <option value="QUEUED">QUEUED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="w-full md:w-80 flex items-center gap-2">
            <SearchBar
              placeholder="Search template, recipient, ref..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <RefreshCw className="animate-spin inline-block mr-2 text-purple-600" size={16} />
              Loading notification audit logs...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-600 text-sm font-semibold">{error}</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No notification logs matched the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Channel & Code</th>
                    <th className="py-3 px-4">Tenant / Fleet</th>
                    <th className="py-3 px-4">Masked Recipient</th>
                    <th className="py-3 px-4">Reference Entity</th>
                    <th className="py-3 px-4">Attempts</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F5] text-xs text-[#1C1A18]">
                  {logs.map((log) => (
                    <tr key={log.logId} className="hover:bg-[#FAF8F5]/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg ${
                              log.channel === 'EMAIL'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.channel === 'EMAIL' ? <Mail size={13} /> : <MessageSquare size={13} />}
                          </span>
                          <div>
                            <span className="font-bold text-[#1C1A18] block">{log.templateCode}</span>
                            <span className="text-[10px] text-[#7A7570] font-mono">{log.channel}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block truncate max-w-[160px]">
                          {log.fleetName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{log.maskedRecipient}</td>
                      <td className="py-3 px-4">
                        {log.referenceEntity ? (
                          <div>
                            <span className="font-semibold text-slate-700">{log.referenceEntity}</span>
                            {log.referenceId && (
                              <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[140px]">
                                {log.referenceId}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">&mdash;</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {log.attemptCount} / {log.maxRetries}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(log.providerStatus)}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#FAF8F5] hover:bg-slate-200 text-slate-700 rounded transition inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total entries)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => fetchLogs(page - 1)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-50 hover:bg-slate-50 transition"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => fetchLogs(page + 1)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-50 hover:bg-slate-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inspection Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn border border-slate-200">
              <div className="p-4 bg-[#0B0B0F] border-b-2 border-purple-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-purple-400" />
                  <span className="text-sm font-bold">Notification Audit Record</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-900">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Log ID</span>
                    <p className="font-mono text-slate-800 break-all">{selectedLog.logId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Channel</span>
                    <p className="font-semibold text-slate-800">{selectedLog.channel}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Template Code</span>
                    <p className="font-mono font-bold text-purple-700">{selectedLog.templateCode}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Status</span>
                    <div className="mt-0.5">{getStatusBadge(selectedLog.providerStatus)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Fleet Tenant:</span>
                    <span className="font-semibold">{selectedLog.fleetName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Masked Recipient:</span>
                    <span className="font-mono font-bold">{selectedLog.maskedRecipient}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Reference:</span>
                    <span className="font-mono">{selectedLog.referenceEntity || 'None'} ({selectedLog.referenceId || '—'})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Attempts:</span>
                    <span>{selectedLog.attemptCount} / {selectedLog.maxRetries}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Created:</span>
                    <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {selectedLog.errorDetails && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-800">
                    <span className="font-bold block mb-1">Sanitized Provider Error Details:</span>
                    <p className="font-mono text-[11px] break-all">{selectedLog.errorDetails}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default NotificationAuditLogs;
