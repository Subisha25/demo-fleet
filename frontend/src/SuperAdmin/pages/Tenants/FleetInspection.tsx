import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCar,
  faBuilding,
  faUsers,
  faUserTie,
  faUserSecret,
  faFileInvoice,
  faChartLine,
  faLock,
  faCalendarAlt,
  faSearch,
  faReceipt,
  faCrown,
  faCity,
  faMapMarkerAlt,
  faCreditCard,
  faTag,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faCopy,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';

interface InspectionData {
  tenantId: string;
  name: string;
  code: string;
  subdomain?: string;
  customDomain?: string;
  status: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string | null;
  headerColor: string;
  primaryColor: string;
  gstNumber?: string;
  registeredAddress?: string;
  legalName?: string;
  displayName?: string;
  gstin?: string;
  panNumber?: string;
  sacCode?: string;
  website?: string;
  businessEmail?: string;
  businessPhone?: string;
  billingFooterText?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  createdAt: string;
  subscription: {
    subscriptionId?: string;
    planTier: string;
    status: string;
    billingCycle: string;
    agreedPrice: number;
    currency: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEndsAt?: string | null;
    quotas: {
      vehicles: number;
      drivers: number;
      companies: number;
      trips: number;
    };
  };
  counts: {
    vehicles: number;
    drivers: number;
    companies: number;
    users: number;
    owners: number;
    totalBookings: number;
    completedTrips: number;
    pendingBookings: number;
    taxes: number;
    pickupCities: number;
    pickupAreas: number;
    paymentModes: number;
    vehicleTypes: number;
    vehicleMasters: number;
  };
  recentBookings: any[];
  recentCompanies: any[];
}

type TabKey =
  | 'overview'
  | 'companies'
  | 'users'
  | 'vehicles'
  | 'drivers'
  | 'owners'
  | 'bookings'
  | 'masters'
  | 'billing';

const FleetInspection: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [data, setData] = useState<InspectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab-specific scoped lists
  const [tabData, setTabData] = useState<any>(null);
  const [tabLoading, setTabLoading] = useState<boolean>(false);
  const [tabSearch, setTabSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const fetchInspectionProfile = async () => {
    if (!tenantId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      let res: any;
      try {
        res = await axiosInstance.get(`/tenants/${tenantId}/overview`, {
          headers: { 'X-Tenant-ID': tenantId, 'X-Inspection-Mode': 'true' },
        });
      } catch (firstErr) {
        // Fallback to inspection-profile route
        res = await axiosInstance.get(`/tenants/${tenantId}/inspection-profile`, {
          headers: { 'X-Tenant-ID': tenantId, 'X-Inspection-Mode': 'true' },
        });
      }

      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        throw new Error('Inspection telemetry data missing from response');
      }
    } catch (err: any) {
      console.error('Error loading inspection profile:', err);
      const msg = err?.response?.data?.message || err.message || 'Failed to load fleet inspection profile';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab: TabKey) => {
    if (!tenantId || tab === 'overview') return;
    setTabLoading(true);
    setTabData(null);
    try {
      const res = await axiosInstance.get(`/tenants/${tenantId}/inspection-data?module=${tab}`, {
        headers: { 'X-Tenant-ID': tenantId, 'X-Inspection-Mode': 'true' },
      });
      setTabData(res.data?.data || []);
    } catch (err: any) {
      console.warn(`Tab ${tab} fetch note:`, err);
      setTabData([]);
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectionProfile();
  }, [tenantId]);

  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchTabData(activeTab);
    }
  }, [activeTab, tenantId]);

  const handleCopyId = () => {
    if (!tenantId) return;
    navigator.clipboard.writeText(tenantId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <PageLayout breadcrumbName="Fleet Inspection">
        <div className="flex flex-col items-center justify-center p-20 text-slate-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <div className="font-bold text-sm text-slate-700">Loading Authoritative Fleet Overview Telemetry...</div>
          <div className="text-xs text-slate-400 mt-1 font-mono">Tenant ID: {tenantId}</div>
        </div>
      </PageLayout>
    );
  }

  if (errorMsg || !data) {
    return (
      <PageLayout breadcrumbName="Fleet Inspection">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto my-12">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 text-xl">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Fleet Not Found or Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-2">
            Could not retrieve inspection telemetry for tenant <span className="font-mono font-bold text-slate-700">{tenantId}</span>.
          </p>
          {errorMsg && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-mono">
              {errorMsg}
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={fetchInspectionProfile}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faRedo} />
              Retry Inspection
            </button>
            <button
              onClick={() => navigate('/tenants/list')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              ← Back to Fleet List
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout breadcrumbName={`Overview: ${data.name}`}>
      <AlertContainer />

      {/* Prominent Read-Only Inspection Banner */}
      <div className="mb-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-950 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-900 font-bold shadow-inner flex-shrink-0">
            <FontAwesomeIcon icon={faLock} className="text-base" />
          </div>
          <div>
            <div className="font-black text-sm flex items-center gap-2 text-amber-950">
              <span>SuperAdmin Read-Only Fleet Overview</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-amber-300">
                Audited Inspection Mode
              </span>
            </div>
            <div className="text-xs text-amber-900/90 mt-0.5">
              Inspecting fleet <strong>{data.name}</strong> ({data.code}). All operational additions, edits, and deletions are strictly disabled.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate(`/tenants/billing-history/${data.tenantId}`)}
            className="px-3.5 py-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-950 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faReceipt} />
            Billing & Invoices
          </button>
          <button
            onClick={() => navigate('/tenants/list')}
            className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Fleet List
          </button>
        </div>
      </div>

      {/* Authoritative Fleet Inspection Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            {data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt={data.name}
                className="w-16 h-16 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1.5 shadow-sm flex-shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-sm flex-shrink-0"
                style={{ backgroundColor: data.headerColor || '#1A365D' }}
              >
                {data.code.substring(0, 3)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{data.name}</h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                  {data.code}
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    data.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : data.status === 'TRIALING'
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {data.status}
                </span>
                <button
                  onClick={handleCopyId}
                  className="text-[11px] font-mono text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1 transition"
                  title="Copy Tenant ID"
                >
                  <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
                  <span>{copiedId ? 'Copied!' : data.tenantId.substring(0, 8) + '...'}</span>
                </button>
              </div>
              <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap gap-x-5 gap-y-1">
                <span>Admin: <strong className="text-slate-700">{data.contactEmail || 'N/A'}</strong></span>
                <span>Phone: <strong className="text-slate-700">{data.contactPhone || 'N/A'}</strong></span>
                {data.gstNumber && <span>GSTIN: <strong className="text-slate-700 font-mono">{data.gstNumber}</strong></span>}
                {data.registeredAddress && <span>Address: <strong className="text-slate-700">{data.registeredAddress}</strong></span>}
                {data.subdomain && <span>Domain: <strong className="text-slate-700 font-mono">{data.subdomain}.fleetflow.com</strong></span>}
                <span>Created: <strong className="text-slate-700">{formatDate(data.createdAt)}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-shrink-0">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscribed Plan</div>
              <div className="text-base font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCrown} className="text-amber-500 text-xs" />
                {data.subscription.planTier}
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                {formatCurrency(data.subscription.agreedPrice)} / {data.subscription.billingCycle.toLowerCase()}
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">License Period</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {formatDate(data.subscription.currentPeriodStart)} - {formatDate(data.subscription.currentPeriodEnd)}
              </div>
              <div className="text-[11px] text-teal-700 font-semibold mt-0.5 flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                Active Subscription
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
        {/* Vehicles */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center hover:border-teal-300 transition">
          <div className="text-slate-400 text-xs mb-1">
            <FontAwesomeIcon icon={faCar} className="mr-1 text-teal-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Vehicles</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{data.counts.vehicles}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Quota: <strong>{data.subscription.quotas.vehicles >= 999999 ? '∞' : data.subscription.quotas.vehicles}</strong>
          </div>
        </div>

        {/* Owners */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center hover:border-purple-300 transition">
          <div className="text-slate-400 text-xs mb-1">
            <FontAwesomeIcon icon={faUserTie} className="mr-1 text-purple-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Owners</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{data.counts.owners}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Registered Vendors</div>
        </div>

        {/* Drivers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center hover:border-indigo-300 transition">
          <div className="text-slate-400 text-xs mb-1">
            <FontAwesomeIcon icon={faUserSecret} className="mr-1 text-indigo-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Drivers</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{data.counts.drivers}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Quota: <strong>{data.subscription.quotas.drivers >= 999999 ? '∞' : data.subscription.quotas.drivers}</strong>
          </div>
        </div>

        {/* Companies */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center hover:border-blue-300 transition">
          <div className="text-slate-400 text-xs mb-1">
            <FontAwesomeIcon icon={faBuilding} className="mr-1 text-blue-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Companies</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{data.counts.companies}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Quota: <strong>{data.subscription.quotas.companies >= 999999 ? '∞' : data.subscription.quotas.companies}</strong>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center hover:border-emerald-300 transition">
          <div className="text-slate-400 text-xs mb-1">
            <FontAwesomeIcon icon={faUsers} className="mr-1 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Corporate Users</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{data.counts.users}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active Staff</div>
        </div>

        {/* Bookings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center hover:border-amber-300 transition">
          <div className="text-slate-400 text-xs mb-1">
            <FontAwesomeIcon icon={faFileInvoice} className="mr-1 text-amber-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Bookings</span>
          </div>
          <div className="text-2xl font-black text-teal-800 mt-0.5">{data.counts.totalBookings}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Done: <strong>{data.counts.completedTrips}</strong> | Open: <strong>{data.counts.pendingBookings}</strong>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-2xl px-4 pt-2 shadow-sm gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FontAwesomeIcon icon={faChartLine} className="mr-1.5" />
          Fleet Overview
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'companies'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FontAwesomeIcon icon={faBuilding} className="mr-1.5" />
          Companies ({data.counts.companies})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FontAwesomeIcon icon={faUsers} className="mr-1.5" />
          Users ({data.counts.users})
        </button>

        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'vehicles'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FontAwesomeIcon icon={faCar} className="mr-1.5" />
          Vehicles ({data.counts.vehicles})
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'drivers'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FontAwesomeIcon icon={faUserSecret} className="mr-1.5" />
          Drivers ({data.counts.drivers})
        </button>

        <button
          onClick={() => setActiveTab('owners')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'owners'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FontAwesomeIcon icon={faUserTie} className="mr-1.5" />
          Owners ({data.counts.owners})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FontAwesomeIcon icon={faFileInvoice} className="mr-1.5" />
          Bookings ({data.counts.totalBookings})
        </button>

        <button
          onClick={() => setActiveTab('masters')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'masters'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FontAwesomeIcon icon={faTag} className="mr-1.5" />
          Master Data
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'billing'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FontAwesomeIcon icon={faReceipt} className="mr-1.5" />
          Subscription & Billing
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Fleet Verified Business Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                Fleet Business Identity & Invoice Issuer Profile
              </h3>
              <span className="text-[10px] bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-bold border border-teal-200">
                Authoritative Issuer Data
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Legal Business Name</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{data.legalName || data.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Display Name</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{data.displayName || data.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fleet GSTIN</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{data.gstin || data.gstNumber || 'Not Specified'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PAN & SAC Code</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                  PAN: {data.panNumber || 'N/A'} | SAC: {data.sacCode || '996609'}
                </span>
              </div>
              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registered Office Address</span>
                <span className="text-slate-800 mt-0.5 block">{data.registeredAddress || 'No registered office address configured'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Website & Contact</span>
                <span className="text-slate-800 mt-0.5 block">
                  {data.website ? <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">{data.website}</a> : 'No website'}
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">{data.businessEmail || data.contactEmail || ''}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Invoice Disclaimer / Footer</span>
                <span className="text-slate-700 italic mt-0.5 block text-[11px]">{data.billingFooterText || 'Standard system generated invoice disclaimer'}</span>
              </div>
            </div>
          </div>

          {/* Master Data Quick Summary Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3">
              Fleet Master Data Inventory
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Tax Rates</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{data.counts.taxes}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Pickup Cities</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{data.counts.pickupCities}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Pickup Areas</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{data.counts.pickupAreas}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Payment Modes</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{data.counts.paymentModes}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Vehicle Types</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{data.counts.vehicleTypes}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Vehicle Masters</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{data.counts.vehicleMasters}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Corporate Clients */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-sm">Corporate Client Accounts</h3>
                <span className="text-xs text-slate-500">{data.counts.companies} Total</span>
              </div>
              {data.recentCompanies.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No corporate clients registered for this fleet.</div>
              ) : (
                <ul className="divide-y divide-slate-100 mt-2">
                  {data.recentCompanies.map((c: any) => (
                    <li key={c.companyId} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{c.companyName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Code: {c.companyCode || '—'} | Slug: {c.seoUrlSlug || '—'}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Read-Only</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-sm">Recent Booking Orders</h3>
                <span className="text-xs text-slate-500">{data.counts.totalBookings} Total</span>
              </div>
              {data.recentBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No booking records found for this fleet.</div>
              ) : (
                <ul className="divide-y divide-slate-100 mt-2">
                  {data.recentBookings.map((b: any) => (
                    <li key={b.bookingId} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{b.bookingCode || `#${b.bookingId}`}</div>
                        <div className="text-[11px] text-slate-400">{b.pickupPoint || 'Pickup Location N/A'} • {formatDate(b.bookingDate || b.createdAt)}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Status: {b.confirmStatus === '3' ? 'Completed' : b.confirmStatus === '1' ? 'Assigned' : 'Open'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2+: DEDICATED MODULE ROSTERS */}
      {activeTab !== 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-800 capitalize">{activeTab} Details</span>
              <span className="text-xs text-slate-500 font-medium">
                ({Array.isArray(tabData) ? tabData.length : activeTab === 'masters' ? 'Masters Configured' : activeTab === 'billing' ? 'Subscription Record' : 0} records)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {activeTab !== 'billing' && activeTab !== 'masters' && (
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-xs text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={tabSearch}
                    onChange={(e) => setTabSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-48 sm:w-64"
                  />
                </div>
              )}
              <span className="text-[10px] font-black px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 flex-shrink-0 uppercase tracking-wider">
                Read-Only Scope
              </span>
            </div>
          </div>

          {tabLoading ? (
            <div className="py-20 text-center text-xs text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              Loading scoped {activeTab} data...
            </div>
          ) : activeTab === 'masters' && tabData ? (
            <div className="space-y-6">
              {/* Taxes */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">Taxes ({tabData.taxes?.length || 0})</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2">Tax Name</th>
                        <th className="px-3.5 py-2">Percentage</th>
                        <th className="px-3.5 py-2">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tabData.taxes?.map((t: any) => (
                        <tr key={t.taxId}>
                          <td className="px-3.5 py-2 font-semibold text-slate-800">{t.taxName}</td>
                          <td className="px-3.5 py-2 font-mono">{t.taxPercent}%</td>
                          <td className="px-3.5 py-2">{t.taxType || 'GST'}</td>
                        </tr>
                      ))}
                      {!tabData.taxes?.length && (
                        <tr><td colSpan={3} className="px-3 py-4 text-center text-slate-400">No custom taxes configured for this fleet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pickup Cities & Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">Pickup Cities ({tabData.cities?.length || 0})</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-3.5 py-2">City Name</th>
                          <th className="px-3.5 py-2">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tabData.cities?.map((c: any) => (
                          <tr key={c.cityId}>
                            <td className="px-3.5 py-2 font-semibold text-slate-800">{c.cityName}</td>
                            <td className="px-3.5 py-2">{c.state || '—'}</td>
                          </tr>
                        ))}
                        {!tabData.cities?.length && (
                          <tr><td colSpan={2} className="px-3 py-4 text-center text-slate-400">No pickup cities configured.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">Payment Modes ({tabData.paymentModes?.length || 0})</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-3.5 py-2">Mode Name</th>
                          <th className="px-3.5 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tabData.paymentModes?.map((pm: any) => (
                          <tr key={pm.paymentmodeId}>
                            <td className="px-3.5 py-2 font-semibold text-slate-800">{pm.paymentModeName}</td>
                            <td className="px-3.5 py-2">{pm.status || 'ACTIVE'}</td>
                          </tr>
                        ))}
                        {!tabData.paymentModes?.length && (
                          <tr><td colSpan={2} className="px-3 py-4 text-center text-slate-400">No payment modes configured.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'billing' && tabData ? (
            <div className="space-y-6">
              {/* Subscription Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Plan Tier</span>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{tabData.subscription?.planTier || data.subscription.planTier}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">{tabData.subscription?.status || 'ACTIVE'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Agreed Price</span>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{formatCurrency(data.subscription.agreedPrice)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Billing Cycle</span>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{data.subscription.billingCycle}</div>
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">Subscription Invoices ({tabData.invoices?.length || 0})</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5">Invoice #</th>
                        <th className="px-3.5 py-2.5">Total Amount</th>
                        <th className="px-3.5 py-2.5">Status</th>
                        <th className="px-3.5 py-2.5">Method</th>
                        <th className="px-3.5 py-2.5">Reference</th>
                        <th className="px-3.5 py-2.5">Invoice Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tabData.invoices?.map((inv: any) => (
                        <tr key={inv.subscriptionInvoiceId}>
                          <td className="px-3.5 py-2 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                          <td className="px-3.5 py-2 font-black text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                          <td className="px-3.5 py-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {inv.paymentStatus || 'PAID'}
                            </span>
                          </td>
                          <td className="px-3.5 py-2">{inv.paymentMethod || 'HDFC SmartGateway'}</td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">{inv.transactionReference || '—'}</td>
                          <td className="px-3.5 py-2 text-slate-600">{formatDate(inv.createdAt)}</td>
                        </tr>
                      ))}
                      {!tabData.invoices?.length && (
                        <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No subscription invoices recorded for this fleet yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : Array.isArray(tabData) && tabData.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400">
              No records found for this fleet in {activeTab}.
            </div>
          ) : Array.isArray(tabData) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Name / Identifier</th>
                    <th className="px-4 py-2.5">Key Attributes</th>
                    <th className="px-4 py-2.5">Contact / Reference</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tabData
                    .filter((item: any) => {
                      if (!tabSearch) return true;
                      const s = tabSearch.toLowerCase();
                      const str = JSON.stringify(item).toLowerCase();
                      return str.includes(s);
                    })
                    .map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {item.companyName ||
                            item.username ||
                            item.vehicleNumber ||
                            item.driverName ||
                            item.vendorName ||
                            item.bookingCode ||
                            `Record #${idx + 1}`}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.companyCode
                            ? `Code: ${item.companyCode} | Slug: ${item.seoUrlSlug || '—'}`
                            : item.company?.companyName
                            ? `Company: ${item.company.companyName} | Role: ${item.role || 'User'}`
                            : item.vehicleType?.vehicleTypeName || item.vehicleModelName || item.licExpDate
                            ? `Model: ${item.vehicleModelName || 'Standard'} | Type: ${item.vehicleType?.vehicleTypeName || 'Fleet'}`
                            : item.pickupPoint
                            ? `${item.pickupPoint} → ${item.dropPoint || 'Drop'}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          {item.email || item.phno || item.mobile || item.mobileNumber || item.phone || formatDate(item.bookingDate || item.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.status || (item.confirmStatus === '3' ? 'Completed' : 'Active')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            title="Modifications disabled in read-only inspection"
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-400 border border-slate-200"
                          >
                            Read-Only
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </PageLayout>
  );
};

export default FleetInspection;
