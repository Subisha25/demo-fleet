import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import { DataTable, Column } from '../../../components/DataTable';
import axiosInstance from '../../../utils/axiosInstance';
import SearchBar from '../../../components/SearchBar';
import { Mail, Shield, Filter, Eye, RefreshCw, Layers } from 'lucide-react';

interface EmailConfig {
  emailConfigId: string;
  title: string;
  emailCode: string;
  subject: string;
  message: string;
  fromName: string;
  fromAddress: string;
  emailBcc: string;
  scope?: 'FLEET' | 'PLATFORM';
  category?: string;
  tenantId?: string | null;
  isActive?: boolean;
  createdAt: string;
}

const EmailConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = (localStorage.getItem('role') || '').toLowerCase();
  const isSuperAdmin = role === 'superadmin' || role === 'platform_admin';
  const isSuperAdminRoute = location.pathname.startsWith('/admin') && isSuperAdmin;

  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'FLEET' | 'PLATFORM' | 'BILLING' | 'AUTH'>(
    isSuperAdminRoute ? 'PLATFORM' : 'ALL'
  );
  const [configs, setConfigs] = useState<EmailConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/emailConfRoutes/getAllEmailConf');
      setConfigs(res.data.emailConfs || []);
    } catch (err: any) {
      setError('Failed to load email configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // Filter by tab + search
  const filteredConfigs = configs.filter((row) => {
    const matchesSearch =
      row.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.emailCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.fromName?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.fromAddress?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.category?.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'FLEET') return (row.scope || 'FLEET') === 'FLEET';
    if (activeTab === 'PLATFORM') return row.scope === 'PLATFORM';
    if (activeTab === 'BILLING') return row.category === 'BILLING';
    if (activeTab === 'AUTH') return row.category === 'AUTH';
    return true;
  });

  const handleEdit = (row: EmailConfig) => {
    navigate(`/email/configurations/edit/${row.emailConfigId}`);
  };

  const handleEditMainTemplate = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate('/email/configurations/edit-main-template');
  };

  const columns: Column<EmailConfig>[] = [
    {
      header: 'Template Title & Subject',
      accessor: 'title',
      render: (row: EmailConfig) => (
        <div>
          <div className="font-bold text-[#1C1A18] text-sm flex items-center gap-2">
            <span>{row.title}</span>
            {row.tenantId && row.tenantId !== 'e7b8a1c0-0000-0000-0000-000000000001' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Fleet Custom Override
              </span>
            )}
          </div>
          <div className="text-xs text-[#7A7570] truncate max-w-md mt-0.5">
            Subject: <span className="text-[#3D3833]">{row.subject}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Code',
      accessor: 'emailCode',
      render: (row: EmailConfig) => (
        <span className="font-mono text-xs px-2 py-1 rounded bg-[#FAF8F5] border border-[#E0DAD1] text-[#843217] font-semibold">
          {row.emailCode}
        </span>
      ),
    },
    {
      header: 'Scope',
      accessor: 'scope',
      render: (row: EmailConfig) => {
        const isPlatform = row.scope === 'PLATFORM';
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              isPlatform
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {isPlatform ? <Shield size={11} /> : <Mail size={11} />}
            {row.scope || 'FLEET'}
          </span>
        );
      },
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row: EmailConfig) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#5C5752] border border-[#E0DAD1]/60">
          {row.category || 'OPERATIONAL'}
        </span>
      ),
    },
    {
      header: 'From Sender',
      accessor: 'fromName',
      render: (row: EmailConfig) => (
        <div className="text-xs">
          <span className="font-semibold text-[#1C1A18]">{row.fromName || 'FleetFlow'}</span>
          <span className="block text-[#7A7570] text-[11px]">{row.fromAddress || 'support@fleetflow.com'}</span>
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      <div className="py-6 max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C04E24]/20 text-[#DE8A66] border border-[#C04E24]/30 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Notification Engine v3.0
              </span>
              <span className="text-[#EDE9E3] text-xs">Separate Fleet & Platform Scopes</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Email Template Management</h1>
            <p className="text-xs text-[#EDE9E3] mt-1">
              Configure event-driven operational notification templates and platform SaaS lifecycle emails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchConfigs}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-bold rounded-lg border border-white/10 transition flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
            <a
              href="#"
              onClick={handleEditMainTemplate}
              className="px-4 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white font-bold text-xs rounded-lg transition shadow-sm"
            >
              Edit Global Master Layout
            </a>
          </div>
        </div>

        {/* Scope Explanation Banner */}
        <div className="bg-[#FAF8F5] border border-[#E0DAD1] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#5C5752]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C04E24]/10 text-[#C04E24] flex items-center justify-center font-bold">
              <Layers size={16} />
            </div>
            <div>
              <p className="font-bold text-[#1C1A18]">Two Separate Template Scopes</p>
              <p>
                <strong>FLEET Scope:</strong> Operational trip, booking, invoice, driver, and company emails branded with each fleet's unique identity.
                {isSuperAdmin && (
                  <span> &bull; <strong>PLATFORM Scope:</strong> Platform-level SaaS lifecycle notifications (applications, approvals, renewals, payment receipts).</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs & Search Filter */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'ALL'
                  ? 'bg-[#C04E24] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5C5752] hover:bg-[#E0DAD1]/50'
              }`}
            >
              All Templates ({configs.length})
            </button>
            <button
              onClick={() => setActiveTab('FLEET')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'FLEET'
                  ? 'bg-[#C04E24] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5C5752] hover:bg-[#E0DAD1]/50'
              }`}
            >
              Fleet Operational ({configs.filter((c) => (c.scope || 'FLEET') === 'FLEET').length})
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('PLATFORM')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === 'PLATFORM'
                    ? 'bg-[#C04E24] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#5C5752] hover:bg-[#E0DAD1]/50'
                }`}
              >
                Platform SaaS Lifecycle ({configs.filter((c) => c.scope === 'PLATFORM').length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('BILLING')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'BILLING'
                  ? 'bg-[#C04E24] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5C5752] hover:bg-[#E0DAD1]/50'
              }`}
            >
              Billing ({configs.filter((c) => c.category === 'BILLING').length})
            </button>
            <button
              onClick={() => setActiveTab('AUTH')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'AUTH'
                  ? 'bg-[#C04E24] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5C5752] hover:bg-[#E0DAD1]/50'
              }`}
            >
              Auth & Account ({configs.filter((c) => c.category === 'AUTH').length})
            </button>
          </div>

          <div className="w-full sm:w-72">
            <SearchBar
              placeholder="Search by title, code, subject..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => {}}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] shadow-sm overflow-hidden p-4">
          {loading ? (
            <div className="p-8 text-center text-[#7A7570] text-sm">
              <RefreshCw className="animate-spin inline-block mr-2" size={16} />
              Loading email templates...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-600 text-sm font-semibold">{error}</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredConfigs}
              onEdit={handleEdit}
              rowsPerPage={10}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default EmailConfiguration;
