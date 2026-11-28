import React, { useEffect, useState } from 'react';
import PageLayout from '../../../components/PageLayout';
import { Customer } from '../../../components/DataTable/types';
import { showToast } from '../../../components/AlertBox';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowRight,
  LucideIcon,
  Truck,
  Users,
  ShieldAlert,
  Calendar,
  Building,
  Sparkles,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axiosInstance from '../../../utils/axiosInstance';
import { useTenant } from '../../../context/TenantContext';

interface MonthlyBooking {
  year: number;
  month?: number;
  totalBookings: number;
  date?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface StatCardProps {
  title: string;
  count: number | string;
  icon: LucideIcon;
  badgeText: string;
  badgeColor: string;
  accentColor: string;
  viewMoreLink: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  icon: Icon,
  badgeText,
  badgeColor,
  accentColor,
  viewMoreLink,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentColor}`}>
            <Icon size={20} />
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-1">{count}</p>
      </div>

      <a
        href={viewMoreLink}
        className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600 hover:text-purple-700 transition group-hover:translate-x-0.5"
      >
        <span>View Details</span>
        <ArrowRight size={14} className="ml-1 text-purple-600 transition group-hover:translate-x-1" />
      </a>
    </div>
  );
};

interface FleetOverviewData {
  tenant?: {
    tenantId?: string;
    id?: string;
    name?: string;
    companyName?: string;
    code?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    status?: string;
  };
  subscription?: {
    planTier?: string;
    plan?: string;
    billingCycle?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    daysRemaining?: number;
    isExpiringSoon?: boolean;
    inGracePeriod?: boolean;
    isSuspended?: boolean;
  };
  quotas?: {
    vehicles: { current: number; limit: number };
    drivers: { current: number; limit: number };
    employees: { current: number; limit: number };
    companies: { current: number; limit: number };
  };
  trialDetails?: {
    trialStatus: string;
    isTrialing: boolean;
    isTrialExpired: boolean;
    originalTrialDays: number;
    extendedTrialDays: number;
    totalTrialDays: number;
    trialStartDate: string;
    originalTrialExpiry: string;
    currentTrialExpiry: string;
    remainingDays: number;
    remainingMs: number;
    trialExtensionHistory?: Array<any>;
  };
}

const Dashboard: React.FC = () => {
  const [confirmPendingCount, setConfirmPendingCount] = useState<number>(0);
  const [paymentPendingCount, setPaymentPendingCount] = useState<number>(0);
  const [closedOrdersCount, setClosedOrdersCount] = useState<number>(0); 
  const [completedOrdersCount, setCompletedOrdersCount] = useState<number>(0);
  const [bookingData, setBookingData] = useState<MonthlyBooking[]>([]);
  const [yearRange, setYearRange] = useState<string>('');
  const [pendingPercentage, setPendingPercentage] = useState<number>(0);
  const [completedPercentage, setCompletedPercentage] = useState<number>(0);
  const [fleetOverview, setFleetOverview] = useState<FleetOverviewData | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<any>(null);

  const { selectedFleet, fleetChangeVersion, currentTenant } = useTenant();
  const role = localStorage.getItem('role') || 'User';
  const isSuperAdmin = role === 'superadmin';
  const isAllFleets = isSuperAdmin && selectedFleet === 'all';

  const cardData: StatCardProps[] = [
    {
      title: 'Confirm Pending Orders',
      count: confirmPendingCount,
      icon: Clock,
      badgeText: 'Action Required',
      badgeColor: 'bg-[#FFF8E1] text-[#B76E00] border border-[#FFE082]',
      accentColor: 'bg-[#FFF8E1] text-[#B76E00]',
      viewMoreLink: '/orders/confirmpending',
    },
    {
      title: 'Payment Pending Orders',
      count: paymentPendingCount,
      icon: CreditCard,
      badgeText: 'Billing Due',
      badgeColor: 'bg-[#FDF6F0] text-[#C04E24] border border-[#F3D0BD]',
      accentColor: 'bg-[#FDF6F0] text-[#C04E24]',
      viewMoreLink: '/orders/paymentpending',
    },
    {
      title: 'Close Pending Orders',
      count: closedOrdersCount,
      icon: AlertCircle,
      badgeText: 'In Progress',
      badgeColor: 'bg-[#F5F2EB] text-[#843217] border border-[#E0DAD1]',
      accentColor: 'bg-[#F5F2EB] text-[#843217]',
      viewMoreLink: '/orders/closepending',
    },
    {
      title: 'Completed Trips',
      count: completedOrdersCount,
      icon: CheckCircle,
      badgeText: 'Fulfilled',
      badgeColor: 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]',
      accentColor: 'bg-[#E8F5E9] text-[#2E7D32]',
      viewMoreLink: '/orders/completed',
    },
  ];

  const isDemo = localStorage.getItem('isDemoView') === 'true' || localStorage.getItem('isDemoMode') === 'true' || role === 'demo';

  useEffect(() => {
    const fetchCounts = async () => {
      if (isDemo) {
        setConfirmPendingCount(14);
        setPaymentPendingCount(6);
        setClosedOrdersCount(29);
        setCompletedOrdersCount(158);
        return;
      }

      try {
        const confirmRes = await axiosInstance.get('/emp/confirmPendingOrderCountWeb');
        setConfirmPendingCount(confirmRes.data.count || 0);

        const paymentRes = await axiosInstance.get('/emp/paymentPendingOrderCount');
        setPaymentPendingCount(paymentRes.data.count || 0);

        const closedRes = await axiosInstance.get('/order/status/confirmed');
        setClosedOrdersCount(closedRes.data?.data?.length || 0);

        const completedRes = await axiosInstance.get('/emp/getcompletedlist');
        setCompletedOrdersCount(completedRes.data?.data?.length || 0);
      } catch (err) {
        // Handled silently
      }
    };

    fetchCounts();
  }, [selectedFleet, fleetChangeVersion, isDemo]);

  useEffect(() => {
    const fetchData = async () => {
      if (isDemo) {
        setPendingPercentage(11.5);
        setCompletedPercentage(88.5);
        setBookingData([
          { date: 'Jan', totalBookings: 85, year: 2026 },
          { date: 'Feb', totalBookings: 110, year: 2026 },
          { date: 'Mar', totalBookings: 135, year: 2026 },
          { date: 'Apr', totalBookings: 160, year: 2026 },
          { date: 'May', totalBookings: 195, year: 2026 },
          { date: 'Jun', totalBookings: 220, year: 2026 },
        ]);
        setYearRange('2026');
        setFleetOverview({
          tenant: {
            name: 'CABZ Smart Fleet Demo',
            contactPerson: 'Fleet Operations Lead',
            contactEmail: 'demo@cabzmobility.com',
            contactPhone: '9876543210',
            status: 'ACTIVE',
          },
          subscription: {
            planTier: 'DEMO',
            plan: 'CABZ Demo Preview',
            billingCycle: 'evaluation',
            status: 'DEMO_PREVIEW',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            daysRemaining: 30,
            isExpiringSoon: false,
            inGracePeriod: false,
            isSuspended: false,
          },
          quotas: {
            vehicles: { current: 18, limit: 50 },
            drivers: { current: 24, limit: 60 },
            employees: { current: 115, limit: 300 },
            companies: { current: 12, limit: 40 },
          },
        });
        return;
      }

      try {
        const statusRes = await axiosInstance.get('/invoiceRoutes/invoice/status-count');
        if (statusRes.data?.success) {
          setPendingPercentage(parseFloat(statusRes.data.data.pendingPercentage) || 0);
          setCompletedPercentage(parseFloat(statusRes.data.data.completedPercentage) || 0);
        }

        const bookingsRes = await axiosInstance.get('/order/getmonthlybookings');
        if (bookingsRes.data?.success && Array.isArray(bookingsRes.data.data)) {
          const formatted = bookingsRes.data.data.map((item: any) => ({
            date: item.date || (item.month ? MONTHS[item.month - 1] : 'Jan'),
            totalBookings: item.totalBookings,
            year: item.year,
          }));

          const years = bookingsRes.data.data.map((item: MonthlyBooking) => item.year);
          if (years.length > 0) {
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            setYearRange(minYear === maxYear ? `${minYear}` : `${minYear} - ${maxYear}`);
          }
          setBookingData(formatted);
        }

        // Fetch Fleet Overview (tenant quotas & subscription lifecycle)
        try {
          const overviewRes = await axiosInstance.get('/tenants/dashboard/overview');
          if (overviewRes.data?.success) {
            setFleetOverview(overviewRes.data.data);
          }
        } catch (e) {
          // Fallback or SuperAdmin
        }

        // Fetch SuperAdmin SaaS Subscription Revenue Summary
        if (isSuperAdmin) {
          try {
            const revRes = await axiosInstance.get('/tenants/admin/billing/revenue-summary');
            if (revRes.data?.success) {
              setRevenueSummary(revRes.data);
            }
          } catch (revErr) {
            // Handled silently
          }
        }
      } catch (err) {
        if (!isDemo) {
          showToast('Error fetching dashboard telemetry', 'error');
        }
      }
    };

    fetchData();
  }, [selectedFleet, fleetChangeVersion, isDemo]);

  const sub = fleetOverview?.subscription;
  const quotas = fleetOverview?.quotas;
  const trialData = fleetOverview?.trialDetails || (currentTenant?.subscription as any)?.trialDetails;

  const isTrialActive = currentTenant?.status === 'TRIALING' || sub?.status === 'TRIALING' || trialData?.isTrialing || trialData?.trialStatus === 'ACTIVE';
  const isTrialExpired = trialData?.trialStatus === 'EXPIRED';
  const isTrialTenant = !isDemo && (isTrialActive || isTrialExpired);

  const [trialCountdown, setTrialCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!isTrialTenant) return;

    const targetExpiry = trialData?.currentTrialExpiry || sub?.endDate || (currentTenant?.subscription as any)?.trialEndsAt;
    if (!targetExpiry) return;

    const updateTimer = () => {
      const diff = new Date(targetExpiry).getTime() - Date.now();
      if (diff <= 0) {
        setTrialCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTrialCountdown({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [isTrialTenant, trialData, sub, currentTenant]);

  const activeTenantName = fleetOverview?.tenant?.name || currentTenant?.name || 'Active Fleet';
  const effectivePlan = fleetOverview?.subscription?.planTier || sub?.planTier || currentTenant?.planTier || (isTrialTenant ? 'FREE TRIAL' : 'BASIC');

  const dashboardTitle = isSuperAdmin
    ? (isAllFleets
        ? "Platform-Wide Operations (All Fleets)"
        : `${activeTenantName} Operations Dashboard`)
    : `${activeTenantName} Operations Dashboard`;

  const dashboardSubtitle = isSuperAdmin
    ? (isAllFleets
        ? "Real-time aggregated counts, telemetry, and bookings across all platform fleets."
        : `Operational telemetry, fleet capacity quotas, and active dispatch pipeline for ${activeTenantName}.`)
    : `Operational telemetry, fleet capacity quotas, and active dispatch pipeline for ${activeTenantName}.`;

  return (
    <PageLayout
      breadcrumbName="Operations Dashboard"
      title={dashboardTitle}
      subtitle={dashboardSubtitle}
    >
      <div className="space-y-6">

        {/* Platform-Wide Aggregated Mode Badge for SuperAdmin */}
        {isAllFleets && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between text-xs text-purple-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-purple-600" />
              <span>
                <strong>Platform-Wide Aggregated View:</strong> Displaying cumulative totals across all authorized fleets. Use the <strong>Fleet Scope</strong> selector in the header to focus on an individual fleet.
              </span>
            </div>
            <span className="font-bold uppercase tracking-wider text-[10px] bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-2.5 py-1 rounded-full">
              All Fleets
            </span>
          </div>
        )}

        {/* Filtered Fleet Mode Badge for SuperAdmin */}
        {isSuperAdmin && !isAllFleets && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} className="text-emerald-600" />
              <span>
                <strong>Filtered Fleet View:</strong> Scoped strictly to <strong>{currentTenant?.name}</strong>. All cards, counts, and reports reflect only this fleet.
              </span>
            </div>
            <span className="font-bold uppercase tracking-wider text-[10px] bg-emerald-600 text-white px-2.5 py-1 rounded-full">
              Filtered Scope
            </span>
          </div>
        )}

        {/* 1. Subscription Renewal Alert Banner (Days <= 2) */}
        {sub?.isExpiringSoon && !sub?.inGracePeriod && !sub?.isSuspended && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <Clock size={22} />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Subscription Renewal Alert</h4>
                <p className="text-xs text-slate-600">
                  Your {sub?.plan?.toUpperCase()} subscription expires in <span className="font-bold text-amber-700">{sub?.daysRemaining} day(s)</span> on {new Date(sub?.endDate || '').toLocaleDateString()}. Renew now to avoid dispatch disruption.
                </p>
              </div>
            </div>
            <a
              href="/billing/checkout"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold rounded-lg shadow-sm self-start md:self-auto transition"
            >
              Renew Plan Now
            </a>
          </div>
        )}

        {/* 2. Grace Period Banner (Day 1 - Day 3) */}
        {sub?.inGracePeriod && !sub?.isSuspended && (
          <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Subscription in Grace Period</h4>
                <p className="text-xs text-slate-600">
                  Your subscription expired on {new Date(sub?.endDate || '').toLocaleDateString()}. You have 3 days of grace access remaining before vehicle dispatch is suspended.
                </p>
              </div>
            </div>
            <a
              href="/billing/checkout"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold rounded-lg shadow-sm self-start md:self-auto transition"
            >
              Settle Due Payment
            </a>
          </div>
        )}

        {/* 3. Day 4+ Suspension Banner */}
        {sub?.isSuspended && (
          <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
                <AlertCircle size={22} />
              </div>
              <div>
                <h4 className="font-bold text-rose-900 text-sm">Operations Suspended (Unpaid Subscription)</h4>
                <p className="text-xs text-slate-600">
                  Grace period ended. New booking dispatches are currently blocked. Permitted read-only access and billing renewal remain available.
                </p>
              </div>
            </div>
            <a
              href="/billing/checkout"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold rounded-lg shadow-sm self-start md:self-auto transition"
            >
              Reactivate Dispatch Now
            </a>
          </div>
        )}

        {/* Dedicated Free Trial Operations Hub with Live Ticking Countdown */}
        {isTrialTenant && (
          <div
            className={`rounded-2xl border p-6 shadow-sm transition-all ${
              trialCountdown.isExpired
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : 'bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border-purple-200 text-slate-900'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    trialCountdown.isExpired
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  <Clock size={24} className={trialCountdown.isExpired ? '' : 'animate-pulse'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        trialCountdown.isExpired
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {trialCountdown.isExpired ? 'TRIAL EXPIRED' : 'FREE TRIAL ACTIVE'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      CABZ 7-Day All-Access Evaluation
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {trialCountdown.isExpired
                      ? 'Your 7-Day Free Trial Has Ended'
                      : 'Live Free Trial Operations Hub'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/billing/checkout"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <CreditCard size={14} />
                  <span>Choose Paid Subscription Plan &rarr;</span>
                </a>
              </div>
            </div>

            {/* Trial Details Grid: Separate Original 7 Days vs Extended Days */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Trial Started</span>
                <span className="font-bold text-slate-800 text-xs">
                  {new Date(
                    trialData?.trialStartDate || sub?.startDate || (currentTenant as any)?.createdAt || ''
                  ).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Original Free Trial</span>
                <span className="font-bold text-indigo-700 text-xs">7 Days</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Extended Days</span>
                <span className="font-bold text-purple-700 text-xs">
                  +{trialData?.extendedTrialDays || 0} Days
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Total Trial Duration</span>
                <span className="font-bold text-slate-900 text-xs">
                  {(trialData?.totalTrialDays || 7)} Days
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 col-span-2 md:col-span-1">
                <span className="text-slate-500 block text-[11px] font-medium">Trial Ends Date</span>
                <span className="font-bold text-slate-800 text-xs">
                  {new Date(
                    trialData?.currentTrialExpiry || sub?.endDate || ''
                  ).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Live Ticking Countdown Timer */}
            {!trialCountdown.isExpired ? (
              <div className="mt-4 bg-white/90 p-4 rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Live Real-Time Countdown:
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-center min-w-[58px]">
                    <span className="text-base font-extrabold">{trialCountdown.days}</span>
                    <span className="text-[9px] block text-slate-400 uppercase font-sans">Days</span>
                  </div>
                  <span className="text-slate-400 font-bold">:</span>
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-center min-w-[58px]">
                    <span className="text-base font-extrabold">
                      {String(trialCountdown.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] block text-slate-400 uppercase font-sans">Hours</span>
                  </div>
                  <span className="text-slate-400 font-bold">:</span>
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-center min-w-[58px]">
                    <span className="text-base font-extrabold">
                      {String(trialCountdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] block text-slate-400 uppercase font-sans">Mins</span>
                  </div>
                  <span className="text-slate-400 font-bold">:</span>
                  <div className="bg-purple-900 text-purple-200 px-3 py-1.5 rounded-lg text-center min-w-[58px] border border-purple-600">
                    <span className="text-base font-extrabold text-white">
                      {String(trialCountdown.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] block text-purple-300 uppercase font-sans">Secs</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 bg-rose-100/90 border border-rose-300 p-4 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-rose-900 font-semibold">
                  <AlertCircle size={18} className="text-rose-600 shrink-0" />
                  <span>
                    Your 7-day free trial has expired. Vehicle dispatch and booking actions are locked. Please select a paid subscription plan to reactivate full operations.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Header Banner in Black & Purple Accent */}
        <div className="bg-[#0B0B0F] border-b-4 border-purple-600 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-950/70 text-purple-300 border border-purple-700/50 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {isDemo
                  ? 'CABZ Demo Preview • Read-Only'
                  : isTrialActive
                  ? 'CABZ Free Trial • All-Access'
                  : isTrialExpired
                  ? 'CABZ Free Trial • Expired'
                  : isAllFleets
                  ? 'CABZ Platform-Wide'
                  : `CABZ ${effectivePlan.toUpperCase()}`}
              </span>
              <span className="text-slate-300 text-xs">
                {isDemo ? 'Interactive Sandbox Telemetry' : 'Isolated Fleet Operations'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isAllFleets ? "Platform-Wide Fleet Operations" : `${activeTenantName} Operations`}
            </h1>
            <p className="text-xs text-slate-300 mt-1">Real-time trip progression, quota telemetry, and consolidated invoice metrics.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/orders/confirmpending"
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              <span>Review Bookings</span>
            </a>
            <a
              href="/tenants/list"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/10 transition flex items-center gap-1.5"
            >
              <span>Fleet Settings</span>
            </a>
            <a
              href="/billing/checkout"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/10 transition flex items-center gap-1.5"
            >
              <span>Subscription & Plans</span>
            </a>
          </div>
        </div>

        {/* Fleet Quota Meters (When available from tenant scope) */}
        {quotas && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isDemo
                    ? 'Plan Quota Utilization (Demo Preview)'
                    : isTrialTenant
                    ? 'Plan Quota Utilization (7-Day Free Trial - Full Access)'
                    : `Plan Quota Utilization (${effectivePlan.toUpperCase()} Plan)`}
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Cycle: <strong className="text-slate-900 capitalize">{sub?.billingCycle || 'monthly'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Vehicles */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="flex items-center gap-1 font-semibold"><Truck size={14} className="text-purple-600" /> Vehicles</span>
                  <span className="font-bold text-slate-900">{quotas.vehicles.current} / {quotas.vehicles.limit}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((quotas.vehicles.current / quotas.vehicles.limit) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Drivers */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="flex items-center gap-1 font-semibold"><Users size={14} className="text-purple-600" /> Drivers</span>
                  <span className="font-bold text-slate-900">{quotas.drivers.current} / {quotas.drivers.limit}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((quotas.drivers.current / quotas.drivers.limit) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Employees */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="flex items-center gap-1 font-semibold"><Users size={14} className="text-purple-600" /> Employees</span>
                  <span className="font-bold text-slate-900">{quotas.employees.current} / {quotas.employees.limit}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((quotas.employees.current / quotas.employees.limit) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Corporate Clients */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="flex items-center gap-1 font-semibold"><Building size={14} className="text-purple-600" /> Companies</span>
                  <span className="font-bold text-slate-900">{quotas.companies.current} / {quotas.companies.limit}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((quotas.companies.current / quotas.companies.limit) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SuperAdmin SaaS Subscription Revenue Summary Cards */}
        {isSuperAdmin && revenueSummary && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    CABZ Platform SaaS Subscription Revenue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified collections from active tenant subscriptions ({revenueSummary?.data?.currency || revenueSummary?.currency || 'INR'})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                  Total Collected: ₹{(revenueSummary?.data?.totalCollected ?? revenueSummary?.totalCollected ?? 0).toLocaleString()} ({(revenueSummary?.data?.totalInvoices ?? revenueSummary?.totalInvoices ?? 0)} Paid Invoices)
                </span>
                <a
                  href="/admin/billing/reports"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition"
                >
                  <span>Full Ledger</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Monthly Collections Card */}
              {(() => {
                const monthly = revenueSummary?.data?.monthly || revenueSummary?.monthly;
                const byPlan = monthly?.byPlan || {};
                return (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-purple-600" />
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-900">Monthly Subscriptions</span>
                      </div>
                      <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                        ₹{(monthly?.totalAmount ?? 0).toLocaleString()} ({monthly?.invoiceCount ?? 0} paid)
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Basic</div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">₹{(byPlan?.BASIC?.amount ?? 0).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{byPlan?.BASIC?.count ?? 0} paid</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                        <div className="text-[10px] uppercase font-bold text-purple-700">Pro</div>
                        <div className="text-xs font-bold text-purple-700 mt-0.5">₹{(byPlan?.PRO?.amount ?? 0).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{byPlan?.PRO?.count ?? 0} paid</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Enterprise</div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">₹{(byPlan?.ENTERPRISE?.amount ?? 0).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{byPlan?.ENTERPRISE?.count ?? 0} paid</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Annual Collections Card */}
              {(() => {
                const annual = revenueSummary?.data?.annual || revenueSummary?.annual;
                const byPlan = annual?.byPlan || {};
                return (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-purple-600" />
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-900">Annual Subscriptions</span>
                      </div>
                      <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                        ₹{(annual?.totalAmount ?? 0).toLocaleString()} ({annual?.invoiceCount ?? 0} paid)
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Basic</div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">₹{(byPlan?.BASIC?.amount ?? 0).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{byPlan?.BASIC?.count ?? 0} paid</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                        <div className="text-[10px] uppercase font-bold text-purple-700">Pro</div>
                        <div className="text-xs font-bold text-purple-700 mt-0.5">₹{(byPlan?.PRO?.amount ?? 0).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{byPlan?.PRO?.count ?? 0} paid</div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Enterprise</div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">₹{(byPlan?.ENTERPRISE?.amount ?? 0).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{byPlan?.ENTERPRISE?.count ?? 0} paid</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 4 Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cardData.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              count={card.count}
              icon={card.icon}
              badgeText={card.badgeText}
              badgeColor={card.badgeColor}
              accentColor={card.accentColor}
              viewMoreLink={card.viewMoreLink}
            />
          ))}
        </div>

        {/* Visual Telemetry Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Monthly Bookings Composed Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Monthly Booking Volume
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Trips completed and confirmed {yearRange && `(${yearRange})`}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-md">
                Aggregated Trends
              </span>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={290}>
                <ComposedChart data={bookingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0B0F',
                      borderColor: '#1F1F2E',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#c084fc', fontWeight: 700 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="totalBookings" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Total Bookings" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Invoice Fulfillment Donut Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Invoice Settlement Health
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Ratio of completed vs pending payments</p>
            </div>

            <div className="p-6 flex flex-col items-center justify-center flex-1">
              <div className="w-40 h-40 relative my-2">
                <CircularProgressbarWithChildren
                  value={completedPercentage}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: "#7c3aed", // Purple for Completed
                    trailColor: "#e2e8f0", // Light Slate for Pending
                    strokeLinecap: "round",
                  })}
                >
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">
                      {completedPercentage.toFixed(1)}%
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Settled</p>
                  </div>
                </CircularProgressbarWithChildren>
              </div>

              {/* Status Breakdown Pills */}
              <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span className="text-[11px] font-bold text-purple-900 uppercase">Paid / Settled</span>
                  </div>
                  <p className="text-base font-extrabold text-purple-700">{completedPercentage.toFixed(1)}%</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-[11px] font-bold text-slate-900 uppercase">Pending Due</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900">{pendingPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Direct billing sync</span>
              <a href="/invoice/pending" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">
                Open Billing &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;