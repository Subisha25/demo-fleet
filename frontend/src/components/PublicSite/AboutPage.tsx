import React from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import FleetFlowLogo from "../FleetFlowLogo";

export default function AboutPage() {
  const navigate = useNavigate();

  const values = [
    {
      title: "Reliability & Punctuality",
      desc: "Zero-tolerance for delayed employee transit or stranded executive delegations. Every dispatch is backed by live GPS tracking.",
    },
    {
      title: "Full Regulatory & Tax Compliance",
      desc: "Complete GST conformance with automated CGST + SGST tax breakdown, compliant e-way billing, and verified vehicle permits.",
    },
    {
      title: "Safety & Driver Integrity",
      desc: "Thorough police verification, background audits, commercial badge checks, and regular vehicle fitness inspections.",
    },
    {
      title: "Multi-Tenant Data Privacy",
      desc: "Enterprise data isolation ensuring complete operational segregation between independent fleet operators and corporate accounts.",
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#F7F7FB] via-white to-[#F7F7FB] py-16 md:py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#5B3DF5]/10 text-[#5B3DF5] text-xs font-bold uppercase tracking-wider">
            About FleetFlow
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#17171D] tracking-tight">
            Pioneering Corporate Transport & Fleet SaaS Excellence
          </h1>
          <p className="text-lg text-[#686875] max-w-3xl mx-auto leading-relaxed">
            Founded with a commitment to seamless enterprise mobility and expanding nationwide,
            FleetFlow combines operational fleet management with intelligent cloud automation.
          </p>
        </div>
      </section>

      {/* Main Story & Mission */}
      <section className="py-20 bg-[#F7F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B3DF5]">
                Our Foundation
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17171D] tracking-tight">
                From Commercial Fleet Roots to Cloud-Native SaaS Infrastructure
              </h2>
              <p className="text-base text-[#686875] leading-relaxed">
                For years, corporate mobility relied on fragmented logbooks, manual odometer recordings,
                and delayed month-end billing reconciliations. FleetFlow recognized that transport
                operators needed more than spreadsheets—they needed an end-to-end operational operating system.
              </p>
              <p className="text-base text-[#686875] leading-relaxed">
                Today, our multi-tenant SaaS architecture empowers transport managers, dispatchers,
                drivers, and corporate passengers to interact seamlessly with cryptographically secure
                logins, automated odometer validations, and sequential GST tax invoicing.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate("/register-fleet")}
                  className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-xl shadow-md transition-all"
                >
                  Onboard Your Fleet
                </button>
                <button
                  onClick={() => navigate("/services")}
                  className="px-6 py-3 text-sm font-bold text-[#17171D] border border-gray-300 hover:border-[#17171D] rounded-xl bg-white hover:bg-gray-50 transition-all"
                >
                  Explore Services
                </button>
              </div>
            </div>

            {/* Core Metrics Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-md space-y-6">
              <div className="pb-6 border-b border-gray-100">
                <FleetFlowLogo variant="dark" size="md" showTagline={true} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-[#5B3DF5]">99.8%</div>
                  <div className="text-xs font-semibold text-[#686875] uppercase">On-Time Arrival</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-[#5B3DF5]">10,000+</div>
                  <div className="text-xs font-semibold text-[#686875] uppercase">Trips Dispatched</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-[#5B3DF5]">100%</div>
                  <div className="text-xs font-semibold text-[#686875] uppercase">GST Compliant</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-[#5B3DF5]">24 / 7</div>
                  <div className="text-xs font-semibold text-[#686875] uppercase">Support SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#5B3DF5]/10 text-[#5B3DF5] text-xs font-bold uppercase tracking-wider">
              Our Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17171D] tracking-tight">
              The Standards Behind Every Safe Kilometer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="bg-[#F7F7FB] p-6 rounded-2xl border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#5B3DF5]/10 text-[#5B3DF5] font-bold flex items-center justify-center">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-[#17171D] text-base">{val.title}</h3>
                <p className="text-xs text-[#686875] leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
