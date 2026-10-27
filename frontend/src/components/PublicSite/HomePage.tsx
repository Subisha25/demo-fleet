import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import GraceCabsLogo from "../GraceCabsLogo";

// Real existing vehicle assets
import sedanImg from "../../assets/vehicles/img1.png";
import suvImg from "../../assets/vehicles/img2.png";
import tempoImg from "../../assets/vehicles/img3.png";
import urbanImg from "../../assets/vehicles/img4.png";

export default function HomePage() {
  const navigate = useNavigate();

  const kpis = [
    { value: "10,000+", label: "Monthly Trips Closed" },
    { value: "99.8%", label: "On-Time Dispatch Rate" },
    { value: "100%", label: "GST & Tax Compliant" },
    { value: "24 / 7", label: "Fleet Telemetry & Support" },
  ];

  const features = [
    {
      title: "Intelligent Dispatch Desk",
      desc: "Assign drivers and vehicles with automated proximity checks, instant trip sheets, and real-time status transitions.",
      icon: (
        <svg className="w-6 h-6 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Digital Odometer & Trip Closure",
      desc: "Capture start/end kilometer readings, driver batta, toll slips, and parking receipts with zero manual arithmetic.",
      icon: (
        <svg className="w-6 h-6 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Consolidated Monthly Invoicing",
      desc: "Group hundreds of daily corporate employee trips into unified monthly tax invoices with CGST + SGST breakdowns.",
      icon: (
        <svg className="w-6 h-6 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Multi-Tenant Fleet Isolation",
      desc: "Every operator enjoys complete data privacy. Vehicles, drivers, bookings, and customer accounts stay strictly isolated.",
      icon: (
        <svg className="w-6 h-6 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: "Corporate Client Self-Service",
      desc: "Offer corporate clients dedicated portals to schedule rides, approve manager budgets, and download digital invoices.",
      icon: (
        <svg className="w-6 h-6 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "Driver Compliance & Document Vault",
      desc: "Track driving licenses, police verifications, badge expirations, and vehicle fitness certificates with automated alerts.",
      icon: (
        <svg className="w-6 h-6 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
    },
  ];

  const fleetTypes = [
    {
      name: "Executive Sedans",
      desc: "Premium sedans for corporate executive commutes, airport pickups, and VIP client transfers.",
      capacity: "4 Passengers + 2 Bags",
      image: sedanImg,
      badge: "Corporate Choice",
    },
    {
      name: "Premium SUVs",
      desc: "Spacious SUVs built for outstation tours, high-comfort regional travel, and managerial site inspections.",
      capacity: "6-7 Passengers + 4 Bags",
      image: suvImg,
      badge: "High Comfort",
    },
    {
      name: "Staff Shuttles & Vans",
      desc: "Reliable vans and tempo travellers for corporate employee shift transport and group shuttles.",
      capacity: "12-20 Passengers",
      image: tempoImg,
      badge: "Employee Transit",
    },
    {
      name: "Urban City Cabs",
      desc: "Efficient hatchbacks for intra-city spot duties, quick client errands, and point-to-point urban mobility.",
      capacity: "4 Passengers + 1 Bag",
      image: urbanImg,
      badge: "Rapid Dispatch",
    },
  ];

  return (
    <PublicLayout>
      {/* ========================================================================= */}
      {/* HERO SECTION                                                             */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F5EFEB] to-[#FAF8F5] border-b border-[#E0DAD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C04E24]/10 border border-[#C04E24]/20 text-[#C04E24] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#C04E24] animate-pulse"></span>
              Enterprise Multi-Tenant Fleet Operations SaaS
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1C1A18] tracking-tight leading-[1.15]">
              Intelligent Fleet Management & Corporate Mobility Platform
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-[#5A554E] max-w-2xl mx-auto leading-relaxed">
              Empower your fleet business with automated trip dispatching, digital odometer closures,
              monthly consolidated route card invoicing, and secure multi-tenant isolation.
            </p>

            {/* Action CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/book")}
                className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-white bg-[#C04E24] hover:bg-[#A83F1A] rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>🚕</span>
                <span>Book a Cab Online</span>
              </button>
              <button
                onClick={() => navigate("/register-fleet")}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-[#1C1A18] bg-[#FFFFFF] hover:bg-[#FAF8F5] border border-[#E0DAD1] hover:border-[#1C1A18]/40 rounded-xl shadow-sm transition-all duration-200"
              >
                Register Your Fleet
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-6 py-4 text-base font-bold text-[#5A554E] hover:text-[#1C1A18] rounded-xl hover:bg-[#E0DAD1]/20 transition-all"
              >
                Operator Login →
              </button>
            </div>

            {/* Trust Micro-Copy */}
            <p className="text-xs text-[#7A7570] pt-2">
              🔒 Instant registration request • Zero setup fees • Full isolated tenant dashboard
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="bg-[#FFFFFF] border-y border-[#E0DAD1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#C04E24] tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#5A554E] uppercase tracking-wider">
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CORE PLATFORM CAPABILITIES                                               */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C04E24]">
              Comprehensive Fleet Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight">
              Engineered for Transport Operators, Dispatchers & Corporate Clients
            </h2>
            <p className="text-[#5A554E] text-base leading-relaxed">
              Every workflow from public booking intake to driver settlement is governed by strict
              database-level tenant boundaries and automated tax calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E0DAD1] shadow-sm hover:shadow-md hover:border-[#C04E24]/30 transition-all duration-300 space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E0DAD1] flex items-center justify-center group-hover:bg-[#C04E24]/10 transition-colors">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1C1A18] tracking-tight">{feat.title}</h3>
                <p className="text-sm text-[#5A554E] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FLEET SHOWCASE SECTION                                                   */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FFFFFF] border-y border-[#E0DAD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C04E24]">
                Fleet Vehicles
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight">
                Modern, Fully Maintained Commercial Fleet
              </h2>
              <p className="text-[#5A554E] text-base">
                From luxury executive sedans to high-capacity staff shuttles, manage your vehicle categories
                with real-time quota tracking and maintenance schedules.
              </p>
            </div>
            <div>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#C04E24] hover:text-[#A83F1A] transition-colors"
              >
                View Full Fleet Showcase →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {fleetTypes.map((fleet, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] rounded-2xl overflow-hidden border border-[#E0DAD1] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative p-6 flex items-center justify-center h-48 bg-[#F4EFEA]">
                  <img
                    src={fleet.image}
                    alt={fleet.name}
                    className="max-h-36 max-w-full object-contain filter drop-shadow-md transform hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1C1A18] text-white">
                    {fleet.badge}
                  </span>
                </div>
                <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1C1A18]">{fleet.name}</h3>
                    <p className="text-xs text-[#5A554E] mt-1 line-clamp-2">{fleet.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-[#E0DAD1] flex items-center justify-between text-xs font-semibold text-[#1C1A18]">
                    <span>{fleet.capacity}</span>
                    <span className="text-[#C04E24]">AC • GPS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PRICING PREVIEW BANNER                                                   */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1C1A18] rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-[#C04E24] text-white text-xs font-bold uppercase tracking-wider">
                Transparent Canonical Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Simple, Honest SaaS Plans Built for Scalable Fleet Growth
              </h2>
              <p className="text-base sm:text-lg text-[#D0C9C0] leading-relaxed">
                Choose the plan that fits your current operational scale. Upgrade or renew seamlessly
                with verified GST tax invoicing and 15% annual billing discounts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 pb-4">
                <div className="bg-[#2B2724] border border-[#3E3834] rounded-xl p-5 space-y-2">
                  <div className="text-xs uppercase font-bold text-[#C04E24]">Starter Mobility</div>
                  <div className="text-2xl font-black text-white">₹299 <span className="text-xs font-normal text-[#A8A199]">/mo</span></div>
                  <div className="text-xs text-[#A8A199]">Up to 15 Vehicles & Drivers</div>
                </div>
                <div className="bg-[#332C27] border-2 border-[#C04E24] rounded-xl p-5 space-y-2 relative">
                  <span className="absolute -top-2.5 right-3 bg-[#C04E24] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">Popular</span>
                  <div className="text-xs uppercase font-bold text-[#C04E24]">Growth Fleet Pro</div>
                  <div className="text-2xl font-black text-white">₹349 <span className="text-xs font-normal text-[#A8A199]">/mo</span></div>
                  <div className="text-xs text-[#A8A199]">Up to 75 Vehicles & Drivers</div>
                </div>
                <div className="bg-[#2B2724] border border-[#3E3834] rounded-xl p-5 space-y-2">
                  <div className="text-xs uppercase font-bold text-[#C04E24]">Enterprise Suite</div>
                  <div className="text-2xl font-black text-white">₹549 <span className="text-xs font-normal text-[#A8A199]">/mo</span></div>
                  <div className="text-xs text-[#A8A199]">Up to 250 Vehicles & Drivers</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-[#C04E24] hover:bg-[#A83F1A] rounded-xl shadow transition-all"
                >
                  View Full Feature Matrix & Discounts →
                </button>
                <button
                  onClick={() => navigate("/register-fleet")}
                  className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white border border-white/20 hover:bg-white/10 rounded-xl transition-all"
                >
                  Register Your Fleet
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CALL TO ACTION                                                     */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FAF8F5] border-t border-[#E0DAD1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <GraceCabsLogo className="h-14 w-auto mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight">
            Ready to Modernize Your Fleet Operations?
          </h2>
          <p className="text-base sm:text-lg text-[#5A554E] max-w-2xl mx-auto">
            Submit a public fleet registration request in under 2 minutes. Our SuperAdmin desk will review
            your credentials and issue your cryptographically secure single-use activation invitation.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/register-fleet")}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-[#C04E24] hover:bg-[#A83F1A] rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Get Started with FleetFlow
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-[#1C1A18] bg-white border border-[#E0DAD1] hover:border-[#1C1A18] rounded-xl transition-all"
            >
              Contact Our Transport Desk
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
