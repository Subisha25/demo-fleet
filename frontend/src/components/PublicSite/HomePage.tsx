import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import FleetFlowLogo from "../FleetFlowLogo";

// Real existing vehicle assets
import sedanImg from "../../assets/vehicles/img1.png";
import suvImg from "../../assets/vehicles/img2.png";
import tempoImg from "../../assets/vehicles/img3.png";
import urbanImg from "../../assets/vehicles/img4.png";

export default function HomePage() {
  const navigate = useNavigate();

  const kpis = [
    { value: "10,000+", label: "Monthly Trips Closed", sub: "Dispatched without delay" },
    { value: "99.8%", label: "On-Time Dispatch Rate", sub: "Automated route optimization" },
    { value: "100%", label: "GST & Tax Compliant", sub: "Integrated CGST & SGST" },
    { value: "24 / 7", label: "Fleet Telemetry", sub: "Live GPS & driver updates" },
  ];

  const features = [
    {
      title: "Intelligent Dispatch Desk",
      desc: "Assign drivers and vehicles with automated proximity checks, instant trip sheets, and real-time status transitions.",
      icon: (
        <svg className="w-6 h-6 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Digital Odometer & Trip Closure",
      desc: "Capture start/end kilometer readings, driver batta, toll slips, and parking receipts with zero manual arithmetic.",
      icon: (
        <svg className="w-6 h-6 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Consolidated Monthly Invoicing",
      desc: "Group hundreds of daily corporate employee trips into unified monthly tax invoices with itemized SAC codes and breakdowns.",
      icon: (
        <svg className="w-6 h-6 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Multi-Tenant Fleet Isolation",
      desc: "Every operator enjoys complete data privacy. Vehicles, drivers, bookings, and customer accounts stay strictly isolated.",
      icon: (
        <svg className="w-6 h-6 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: "Corporate Client Self-Service",
      desc: "Offer corporate clients dedicated portals to schedule rides, approve manager budgets, and download digital invoices.",
      icon: (
        <svg className="w-6 h-6 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "Driver Compliance & Document Vault",
      desc: "Track driving licenses, police verifications, badge expirations, and vehicle fitness certificates with automated alerts.",
      icon: (
        <svg className="w-6 h-6 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
    },
  ];

  const fleetTypes = [
    {
      name: "Executive Sedans",
      desc: "Premium sedans for corporate executive commutes, airport pickups, and VIP client transfers.",
      capacity: "4 Passengers • 2 Bags",
      image: sedanImg,
      badge: "Corporate Choice",
      features: "Dual AC • Leather Seats • GPS",
    },
    {
      name: "Premium SUVs",
      desc: "Spacious SUVs built for outstation tours, high-comfort regional travel, and managerial site inspections.",
      capacity: "6-7 Passengers • 4 Bags",
      image: suvImg,
      badge: "High Comfort",
      features: "Spacious Luggage • Captain Seats",
    },
    {
      name: "Staff Shuttles & Vans",
      desc: "Reliable vans and tempo travellers for corporate employee shift transport and group shuttles.",
      capacity: "12-20 Passengers",
      image: tempoImg,
      badge: "Employee Transit",
      features: "High Ceiling • Pushback Seats",
    },
    {
      name: "Urban City Cabs",
      desc: "Efficient hatchbacks for intra-city spot duties, quick client errands, and point-to-point urban mobility.",
      capacity: "4 Passengers • 1 Bag",
      image: urbanImg,
      badge: "Rapid Dispatch",
      features: "High Fuel Economy • Compact",
    },
  ];

  return (
    <PublicLayout>
      {/* ========================================================================= */}
      {/* HERO SECTION — 2-COLUMN PREMIUM SAAS LAYOUT                              */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F7FB] via-white to-[#F7F7FB] border-b border-gray-200/80">
        {/* Subtle Purple Ambient Lighting Accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5B3DF5]/5 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none -z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Copy & Distinct CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#5B3DF5]/10 border border-[#5B3DF5]/20 text-[#5B3DF5] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#5B3DF5] animate-pulse"></span>
                <span>Enterprise Multi-Tenant Fleet Operations SaaS</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-[#17171D] tracking-tight leading-[1.12]">
                The Modern Operating System for <span className="text-[#5B3DF5]">Scalable Fleets</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-lg sm:text-xl text-[#686875] max-w-2xl leading-relaxed">
                Empower your transport enterprise with automated driver dispatching, GPS digital trip sheets,
                corporate monthly route card billing, and cryptographically secure tenant isolation.
              </p>

              {/* Action Buttons — Distinct, Readable, High-Contrast */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {/* Primary CTA */}
                <button
                  id="hero-register-fleet-btn"
                  onClick={() => navigate("/register-fleet")}
                  className="px-7 py-3.5 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>Register Your Fleet</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                {/* Secondary CTA */}
                <button
                  id="hero-book-cab-btn"
                  onClick={() => navigate("/book")}
                  className="px-6 py-3.5 text-base font-bold text-[#5B3DF5] bg-white hover:bg-[#5B3DF5]/5 border border-[#5B3DF5]/30 hover:border-[#5B3DF5] rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Book a Cab Online</span>
                </button>

                {/* Operator Login Link */}
                <button
                  id="hero-operator-login-btn"
                  onClick={() => navigate("/login")}
                  className="px-5 py-3.5 text-sm font-semibold text-[#686875] hover:text-[#17171D] hover:bg-gray-100 rounded-xl transition-all"
                >
                  Fleet Login →
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#686875]">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Instant 2-Minute Onboarding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Zero Hardware Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Multi-Tenant Encrypted</span>
                </div>
              </div>
            </div>

            {/* Right Column: Fleet Telemetry & Live Operations Showcase (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Card: Dispatch Command Center Preview */}
                <div className="bg-[#111118] text-white rounded-2xl p-6 shadow-2xl border border-[#252535] space-y-5">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-[#252535] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 -ml-4"></div>
                      <span className="text-xs font-bold tracking-wider text-gray-200 uppercase">Live Fleet Operations</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#5B3DF5]/30 text-indigo-300 border border-[#5B3DF5]/40 font-semibold">
                      TENANT: ACTIVE
                    </span>
                  </div>

                  {/* Active Trip Telemetry Row */}
                  <div className="bg-[#1B1B26] p-4 rounded-xl border border-[#2B2B3D] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium">Duty Slip #TRIP-8492</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        DISPATCHED
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">Toyota Innova Crysta</div>
                        <div className="text-xs text-gray-400">KA-05-MQ-9021 • Driver: Ramesh K.</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-indigo-400">₹1,850.00</div>
                        <div className="text-[10px] text-gray-400">GST 5% Included</div>
                      </div>
                    </div>
                    <div className="w-full bg-[#111118] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-3/4 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                      <span>Pickup: Embassy GolfLinks</span>
                      <span>ETA: 14 mins</span>
                    </div>
                  </div>

                  {/* Operational Metrics Subgrid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1B1B26] p-3.5 rounded-xl border border-[#2B2B3D]">
                      <div className="text-xs text-gray-400">Active Duty Slips</div>
                      <div className="text-xl font-black text-white mt-1">48 Vehicles</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5 font-semibold">↑ 12% vs last week</div>
                    </div>
                    <div className="bg-[#1B1B26] p-3.5 rounded-xl border border-[#2B2B3D]">
                      <div className="text-xs text-gray-400">Monthly Invoiced</div>
                      <div className="text-xl font-black text-white mt-1">₹8.42 Lakh</div>
                      <div className="text-[10px] text-indigo-300 mt-0.5 font-semibold">Auto CGST+SGST</div>
                    </div>
                  </div>

                  {/* Floating Notification Pill */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#5B3DF5]/15 border border-[#5B3DF5]/30">
                    <div className="w-8 h-8 rounded-lg bg-[#5B3DF5] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white">2Factor DLT SMS Dispatched</div>
                      <div className="text-indigo-200 text-[11px]">Passenger & driver OTP notifications delivered</div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>

        {/* High-Impact Platform KPI Strip */}
        <div className="bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#5B3DF5] tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#17171D] uppercase tracking-wider">
                    {kpi.label}
                  </div>
                  <div className="text-xs text-[#686875] hidden sm:block">
                    {kpi.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CORE CAPABILITIES GRID                                                   */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#F7F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#5B3DF5]/10 text-[#5B3DF5] text-xs font-bold uppercase tracking-wider">
              Comprehensive Fleet Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17171D] tracking-tight">
              Engineered for Transport Operators, Dispatchers & Corporate Clients
            </h2>
            <p className="text-[#686875] text-base leading-relaxed">
              Every workflow from public booking intake to driver settlement is governed by strict
              database-level tenant boundaries and automated tax calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-gray-200/80 shadow-sm hover:shadow-md hover:border-[#5B3DF5]/30 transition-all duration-300 space-y-4 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#5B3DF5]/10 border border-[#5B3DF5]/20 flex items-center justify-center group-hover:bg-[#5B3DF5] group-hover:text-white transition-colors">
                    {React.cloneElement(feat.icon, {
                      className: "w-6 h-6 text-[#5B3DF5] group-hover:text-white transition-colors",
                    })}
                  </div>
                  <h3 className="text-lg font-bold text-[#17171D] tracking-tight">{feat.title}</h3>
                  <p className="text-sm text-[#686875] leading-relaxed">{feat.desc}</p>
                </div>
                <div className="pt-2 flex items-center text-xs font-semibold text-[#5B3DF5] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <span className="ml-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FLEET SHOWCASE SECTION                                                   */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-[#5B3DF5]/10 text-[#5B3DF5] text-xs font-bold uppercase tracking-wider">
                Fleet Vehicles
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17171D] tracking-tight">
                Modern, Fully Maintained Commercial Fleet
              </h2>
              <p className="text-[#686875] text-base">
                From luxury executive sedans to high-capacity staff shuttles, manage your vehicle categories
                with real-time quota tracking and maintenance schedules.
              </p>
            </div>
            <div>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#5B3DF5] hover:text-[#4326C6] transition-colors"
              >
                <span>View Full Fleet Showcase</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {fleetTypes.map((fleet, idx) => (
              <div
                key={idx}
                className="bg-[#F7F7FB] rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative p-6 flex items-center justify-center h-48 bg-white border-b border-gray-100">
                  <img
                    src={fleet.image}
                    alt={fleet.name}
                    className="max-h-36 max-w-full object-contain filter drop-shadow-md transform hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#17171D] text-white">
                    {fleet.badge}
                  </span>
                </div>
                <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#17171D]">{fleet.name}</h3>
                    <p className="text-xs text-[#686875] mt-1 line-clamp-2">{fleet.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-semibold text-[#17171D]">
                    <span>{fleet.capacity}</span>
                    <span className="text-[#5B3DF5] font-bold">AC • GPS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PRICING SECTION — NEAR-BLACK SAAS CARD CONTAINER WITH PURPLE ACCENTS     */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#F7F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Dark Pricing Container: #111118 */}
          <div className="bg-[#111118] rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-[#252535]">
            
            {/* Ambient Purple Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#5B3DF5]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto space-y-10">
              
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#5B3DF5]/20 border border-[#5B3DF5]/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  Transparent Canonical Pricing
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                  Simple, Honest SaaS Plans Built for Scalable Fleet Growth
                </h2>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  Choose the plan that fits your current operational scale. Upgrade or renew seamlessly
                  with verified GST tax invoicing and 15% annual billing discounts.
                </p>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                
                {/* 1. Starter Mobility */}
                <div className="bg-[#161622] border border-[#2A2A3D] rounded-2xl p-7 space-y-5 flex flex-col justify-between hover:border-gray-500 transition-colors">
                  <div className="space-y-4">
                    <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                      Starter Mobility
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white">₹299</span>
                      <span className="text-sm font-medium text-gray-400">/ month</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Essential fleet operations for emerging local operators and regional cab desks.
                    </p>
                    <ul className="space-y-2.5 pt-2 text-xs text-gray-200">
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Up to <strong>15 Vehicles</strong> & <strong>15 Drivers</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Up to 10 Corporate Client Accounts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>5,000 Monthly Trip Duty Slips</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Standard 2Factor SMS Dispatch</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => navigate("/register-fleet")}
                    className="w-full py-3 px-4 text-sm font-bold text-white bg-[#222233] hover:bg-[#2C2C40] border border-gray-600 rounded-xl transition-all"
                  >
                    Select Starter
                  </button>
                </div>

                {/* 2. Growth Fleet Pro (Recommended Plan) */}
                <div className="bg-[#1C1738] border-2 border-[#5B3DF5] rounded-2xl p-7 space-y-5 flex flex-col justify-between relative shadow-xl shadow-indigo-500/10">
                  <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    Recommended Plan
                  </span>
                  <div className="space-y-4">
                    <div className="text-xs uppercase font-extrabold tracking-wider text-[#A855F7]">
                      Growth Fleet Pro
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white">₹349</span>
                      <span className="text-sm font-medium text-indigo-200">/ month</span>
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed">
                      Complete automation suite for expanding corporate fleets and airport shuttle operators.
                    </p>
                    <ul className="space-y-2.5 pt-2 text-xs text-white">
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Up to <strong>75 Vehicles</strong> & <strong>75 Drivers</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Up to 35 Corporate Client Accounts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>15,000 Monthly Trip Duty Slips</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Automated GST Monthly Invoicing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Dedicated 2Factor DLT Sender ID</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => navigate("/register-fleet")}
                    className="w-full py-3.5 px-4 text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-xl shadow-md shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    Get Started with Pro
                  </button>
                </div>

                {/* 3. Enterprise Suite */}
                <div className="bg-[#161622] border border-[#2A2A3D] rounded-2xl p-7 space-y-5 flex flex-col justify-between hover:border-gray-500 transition-colors">
                  <div className="space-y-4">
                    <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                      Enterprise Suite
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white">₹549</span>
                      <span className="text-sm font-medium text-gray-400">/ month</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      High-throughput enterprise capacity with custom domain branding and unlimited support.
                    </p>
                    <ul className="space-y-2.5 pt-2 text-xs text-gray-200">
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Up to <strong>250 Vehicles</strong> & <strong>250 Drivers</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Up to 100 Corporate Accounts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>50,000 Monthly Trips + Overage Allowed</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Custom Tenant Branding & Subdomain</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>24/7 Dedicated Account Manager</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => navigate("/register-fleet")}
                    className="w-full py-3 px-4 text-sm font-bold text-white bg-[#222233] hover:bg-[#2C2C40] border border-gray-600 rounded-xl transition-all"
                  >
                    Select Enterprise
                  </button>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#252535] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>15% discount automatically applied on Annual Billing Cycles.</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/pricing")}
                    className="text-white hover:text-indigo-300 font-bold underline transition-colors"
                  >
                    View Full Feature Matrix & Comparison →
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CALL TO ACTION                                                     */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex justify-center">
            <FleetFlowLogo variant="dark" size="lg" showTagline={false} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17171D] tracking-tight">
            Ready to Modernize Your Fleet Operations?
          </h2>
          <p className="text-base sm:text-lg text-[#686875] max-w-2xl mx-auto leading-relaxed">
            Submit a public fleet registration request in under 2 minutes. Our platform desk will review
            your credentials and issue your cryptographically secure single-use activation invitation.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="cta-register-fleet-btn"
              onClick={() => navigate("/register-fleet")}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
            >
              Get Started with FleetFlow
            </button>
            <button
              id="cta-contact-btn"
              onClick={() => navigate("/contact")}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-[#17171D] bg-white border border-gray-300 hover:border-[#17171D] hover:bg-gray-50 rounded-xl transition-all"
            >
              Contact Our Transport Desk
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
