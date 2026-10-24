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
  month: number;
  totalBookings: number;
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
    <div className="bg-white rounded-xl border border-[#E0DAD1] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentColor}`}>
            <Icon size={20} />
          </div>
        </div>
        <p className="text-xs font-semibold text-[#7A7570] uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-[#1C1A18] mt-1">{count}</p>
      </div>

      <a
        href={viewMoreLink}
        className="mt-4 pt-3 border-t border-[#FAF8F5] flex items-center justify-between text-xs font-semibold text-[#C04E24] hover:text-[#A43D1A] transition group-hover:translate-x-0.5"
      >
        <span>View Details</span>
        <ArrowRight size={14} className="ml-1 text-[#C04E24] transition group-hover:translate-x-1" />
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

  useEffect(() => {
    const fetchCounts = async () => {
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
  }, [selectedFleet, fleetChangeVersion]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusRes = await axiosInstance.get('/invoiceRoutes/invoice/status-count');
        if (statusRes.data?.success) {
          setPendingPercentage(parseFloat(statusRes.data.data.pendingPercentage) || 0);
          setCompletedPercentage(parseFloat(statusRes.data.data.completedPercentage) || 0);
        }

        const bookingsRes = await axiosInstance.get('/order/getmonthlybookings');
        if (bookingsRes.data?.success && Array.isArray(bookingsRes.data.data)) {
          const formatted = bookingsRes.data.data.map((item: MonthlyBooking) => ({
            date: `${MONTHS[item.month - 1]}`,
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
      } catch (err) {
        showToast('Error fetching dashboard telemetry', 'error');
      }
    };

    fetchData();
  }, [selectedFleet, fleetChangeVersion]);

  const sub = fleetOverview?.subscription;
  const quotas = fleetOverview?.quotas;

  const activeTenantName = fleetOverview?.tenant?.name || currentTenant?.name || 'Active Fleet';
  const effectivePlan = fleetOverview?.subscription?.planTier || sub?.planTier || currentTenant?.planTier || 'PRO';

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
          <div className="bg-[#FAF0E6] border border-[#E8D0C0] p-4 rounded-xl flex items-center justify-between text-xs text-[#843217] shadow-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-[#C04E24]" />
              <span>
                <strong>Platform-Wide Aggregated View:</strong> Displaying cumulative totals across all authorized fleets. Use the <strong>Fleet Scope</strong> selector in the header to focus on an individual fleet.
              </span>
            </div>
            <span className="font-bold uppercase tracking-wider text-[10px] bg-[#C04E24] text-white px-2.5 py-1 rounded-full">
              All Fleets
            </span>
          </div>
        )}

        {/* Filtered Fleet Mode Badge for SuperAdmin */}
        {isSuperAdmin && !isAllFleets && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-3.5 rounded-xl flex items-center justify-between text-xs text-[#166534] shadow-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} className="text-[#16A34A]" />
              <span>
                <strong>Filtered Fleet View:</strong> Scoped strictly to <strong>{currentTenant?.name}</strong>. All cards, counts, and reports reflect only this fleet.
              </span>
            </div>
            <span className="font-bold uppercase tracking-wider text-[10px] bg-[#16A34A] text-white px-2.5 py-1 rounded-full">
              Filtered Scope
            </span>
          </div>
        )}

        {/* 1. Subscription Renewal Alert Banner (Days <= 2) */}
        {sub?.isExpiringSoon && !sub?.inGracePeriod && !sub?.isSuspended && (
          <div className="bg-[#FFF8E1] border-l-4 border-[#B76E00] p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFE082] rounded-lg text-[#B76E00]">
                <Clock size={22} />
              </div>
              <div>
                <h4 className="font-bold text-[#843217] text-sm">Subscription Renewal Alert</h4>
                <p className="text-xs text-[#5C5752]">
                  Your {sub?.plan?.toUpperCase()} subscription expires in <span className="font-bold text-[#B76E00]">{sub?.daysRemaining} day(s)</span> on {new Date(sub?.endDate || '').toLocaleDateString()}. Renew now to avoid dispatch disruption.
                </p>
              </div>
            </div>
            <a
              href="/billing/checkout"
              className="px-4 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm self-start md:self-auto transition"
            >
              Renew Plan Now
            </a>
          </div>
        )}

        {/* 2. Grace Period Banner (Day 1 - Day 3) */}
        {sub?.inGracePeriod && !sub?.isSuspended && (
          <div className="bg-[#FFF3E0] border-l-4 border-[#E65100] p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFE0B2] rounded-lg text-[#E65100]">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h4 className="font-bold text-[#BF360C] text-sm">Subscription in Grace Period</h4>
                <p className="text-xs text-[#5C5752]">
                  Your subscription expired on {new Date(sub?.endDate || '').toLocaleDateString()}. You have 3 days of grace access remaining before vehicle dispatch is suspended.
                </p>
              </div>
            </div>
            <a
              href="/billing/checkout"
              className="px-4 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm self-start md:self-auto transition"
            >
              Settle Due Payment
            </a>
          </div>
        )}

        {/* 3. Day 4+ Suspension Banner */}
        {sub?.isSuspended && (
          <div className="bg-[#FFEBEE] border-l-4 border-[#C62828] p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFCDD2] rounded-lg text-[#C62828]">
                <AlertCircle size={22} />
              </div>
              <div>
                <h4 className="font-bold text-[#B71C1C] text-sm">Operations Suspended (Unpaid Subscription)</h4>
                <p className="text-xs text-[#5C5752]">
                  Grace period ended. New booking dispatches are currently blocked. Permitted read-only access and billing renewal remain available.
                </p>
              </div>
            </div>
            <a
              href="/billing/checkout"
              className="px-4 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm self-start md:self-auto transition"
            >
              Reactivate Dispatch Now
            </a>
          </div>
        )}

        {/* Top Header Banner in Charcoal & Terracotta Accent (No Blue) */}
        <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C04E24]/20 text-[#DE8A66] border border-[#C04E24]/30 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Enterprise Dispatch v3.0
              </span>
              <span className="text-[#EDE9E3] text-xs">Isolated Tenant Telemetry</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isAllFleets ? "Platform-Wide Fleet Operations" : `${activeTenantName} Operations`}
            </h1>
            <p className="text-xs text-[#EDE9E3] mt-1">Real-time trip progression, quota telemetry, and consolidated invoice metrics.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/orders/confirmpending"
              className="px-3 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              <span>Review Bookings</span>
            </a>
            <a
              href="/tenants/list"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-[#FAF8F5] font-semibold text-xs rounded-lg border border-[#E0DAD1]/20 transition flex items-center gap-1.5"
            >
              <span>Fleet Settings</span>
            </a>
            <a
              href="/billing/checkout"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-[#FAF8F5] font-semibold text-xs rounded-lg border border-[#E0DAD1]/20 transition flex items-center gap-1.5"
            >
              <span>Subscription & Plans</span>
            </a>
          </div>
        </div>

        {/* Fleet Quota Meters (When available from tenant scope) */}
        {quotas && (
          <div className="bg-white rounded-xl border border-[#E0DAD1] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#C04E24]" />
                <h3 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider">
                  Plan Quota Utilization ({effectivePlan.toUpperCase()} Plan)
                </h3>
              </div>
              <span className="text-xs text-[#7A7570]">
                Cycle: <strong className="text-[#1C1A18] capitalize">{sub?.billingCycle || 'monthly'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Vehicles */}
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E0DAD1]">
                <div className="flex items-center justify-between text-xs text-[#5C5752] mb-1">
                  <span className="flex items-center gap-1 font-semibold"><Truck size={14} className="text-[#C04E24]" /> Vehicles</span>
                  <span className="font-bold text-[#1C1A18]">{quotas.vehicles.current} / {quotas.vehicles.limit}</span>
                </div>
                <div className="w-full bg-[#E0DAD1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C04E24] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((quotas.vehicles.current / quotas.vehicles.limit) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Drivers */}
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E0DAD1]">
                <div className="flex items-center justify-between text-xs text-[#5C5752] mb-1">
                  <span className="flex items-center gap-1 font-semibold"><Users size={14} className="text-[#C04E24]" /> Drivers</span>
                  <span className="font-bold text-[#1C1A18]">{quotas.drivers.current} / {quotas.drivers.limit}</span>
                </div>
                <div className="w-full bg-[#E0DAD1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C04E24] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((quotas.drivers.current / quotas.drivers.limit) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Employees */}
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E0DAD1]">
                <div className="flex items-center justify-between text-xs text-[#5C5752] mb-1">
                  <span className="flex items-center gap-1 font-semibold"><Users size={14} className="text-[#C04E24]" /> Employees</span>
                  <span className="font-bold text-[#1C1A18]">{quotas.employees.current} / {quotas.employees.limit}</span>
                </div>
                <div className="w-full bg-[#E0DAD1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C04E24] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((quotas.employees.current / quotas.employees.limit) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Corporate Clients */}
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E0DAD1]">
                <div className="flex items-center justify-between text-xs text-[#5C5752] mb-1">
                  <span className="flex items-center gap-1 font-semibold"><Building size={14} className="text-[#C04E24]" /> Companies</span>
                  <span className="font-bold text-[#1C1A18]">{quotas.companies.current} / {quotas.companies.limit}</span>
                </div>
                <div className="w-full bg-[#E0DAD1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C04E24] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((quotas.companies.current / quotas.companies.limit) * 100))}%` }}
                  />
                </div>
              </div>
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
          <div className="xl:col-span-2 bg-white rounded-xl border border-[#E0DAD1] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#FAF8F5] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1C1A18] uppercase tracking-wider">
                  Monthly Booking Volume
                </h3>
                <p className="text-xs text-[#7A7570] mt-0.5">Trips completed and confirmed {yearRange && `(${yearRange})`}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#FAF8F5] text-[#1C1A18] border border-[#E0DAD1] rounded-md">
                Aggregated Trends
              </span>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={290}>
                <ComposedChart data={bookingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#FAF8F5" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#7A7570', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#7A7570', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1A18',
                      borderColor: '#262320',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#DE8A66', fontWeight: 700 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="totalBookings" fill="#C04E24" radius={[4, 4, 0, 0]} name="Total Bookings" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Invoice Fulfillment Donut Chart */}
          <div className="bg-white rounded-xl border border-[#E0DAD1] shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="px-5 py-4 border-b border-[#FAF8F5]">
              <h3 className="text-sm font-bold text-[#1C1A18] uppercase tracking-wider">
                Invoice Settlement Health
              </h3>
              <p className="text-xs text-[#7A7570] mt-0.5">Ratio of completed vs pending payments</p>
            </div>

            <div className="p-6 flex flex-col items-center justify-center flex-1">
              <div className="w-40 h-40 relative my-2">
                <CircularProgressbarWithChildren
                  value={completedPercentage}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: "#C04E24", // Terracotta for Completed
                    trailColor: "#E0DAD1", // Warm Grey for Pending
                    strokeLinecap: "round",
                  })}
                >
                  <div className="text-center">
                    <p className="text-2xl font-black text-[#1C1A18]">
                      {completedPercentage.toFixed(1)}%
                    </p>
                    <p className="text-[11px] font-semibold text-[#7A7570] uppercase tracking-wider">Settled</p>
                  </div>
                </CircularProgressbarWithChildren>
              </div>

              {/* Status Breakdown Pills */}
              <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#FAF8F5]">
                <div className="p-2.5 rounded-lg bg-[#FDF6F0] border border-[#F3D0BD] text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C04E24]"></span>
                    <span className="text-[11px] font-bold text-[#843217] uppercase">Paid / Settled</span>
                  </div>
                  <p className="text-base font-extrabold text-[#C04E24]">{completedPercentage.toFixed(1)}%</p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E0DAD1] text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B76E00]"></span>
                    <span className="text-[11px] font-bold text-[#1C1A18] uppercase">Pending Due</span>
                  </div>
                  <p className="text-base font-extrabold text-[#1C1A18]">{pendingPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#E0DAD1] flex items-center justify-between text-xs text-[#5C5752]">
              <span className="font-medium">Direct billing sync</span>
              <a href="/invoice/pending" className="text-[#C04E24] hover:text-[#A43D1A] font-bold hover:underline">
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