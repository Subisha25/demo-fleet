import React from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import GraceCabsLogo from "../GraceCabsLogo";

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
      <section className="bg-gradient-to-b from-[#FAF8F5] to-[#F5EFEB] py-16 md:py-24 border-b border-[#E0DAD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C04E24]">
            About Grace Cabs
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#1C1A18] tracking-tight">
            Pioneering Corporate Transport & Fleet SaaS Excellence
          </h1>
          <p className="text-lg text-[#5A554E] max-w-3xl mx-auto leading-relaxed">
            Founded with a commitment to seamless mobility in Chennai and expanding nationwide,
            Grace Cabs combines on-the-ground operational mastery with intelligent cloud fleet automation.
          </p>
        </div>
      </section>

      {/* Main Story & Mission */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C04E24]">
                Our Foundation
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight">
                From Commercial Fleet Roots to Cloud-Native SaaS Infrastructure
              </h2>
              <p className="text-base text-[#5A554E] leading-relaxed">
                For years, corporate mobility relied on fragmented logbooks, manual odometer recordings,
                and delayed month-end billing reconciliations. Grace Cabs recognized that transport
                operators needed more than spreadsheets—they needed an end-to-end operational operating system.
              </p>
              <p className="text-base text-[#5A554E] leading-relaxed">
                Today, our multi-tenant SaaS architecture empowers transport managers, dispatchers,
                drivers, and corporate passengers to interact seamlessly with cryptographically secure
                logins, automated odometer validations, and sequential GST tax invoicing.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => navigate("/register-fleet")}
                  className="px-6 py-3 text-sm font-bold text-white bg-[#C04E24] hover:bg-[#A83F1A] rounded-xl shadow-sm transition-all"
                >
                  Onboard Your Fleet
                </button>
                <button
                  onClick={() => navigate("/services")}
                  className="px-6 py-3 text-sm font-bold text-[#1C1A18] border border-[#E0DAD1] hover:border-[#1C1A18] rounded-xl bg-white transition-all"
                >
                  Explore Services
                </button>
              </div>
            </div>

            {/* Core Metrics Card */}
            <div className="bg-[#FFFFFF] rounded-3xl p-8 border border-[#E0DAD1] shadow-md space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-[#E0DAD1]">
                <GraceCabsLogo className="h-10 w-auto" />
                <div>
                  <h3 className="font-extrabold text-[#1C1A18] text-lg">Grace Cabs Mobility</h3>
                  <p className="text-xs text-[#7A7570]">Chennai Headquarters • Tamil Nadu, India</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-[#C04E24]">99.8%</div>
                  <div className="text-xs font-semibold text-[#5A554E] uppercase">On-Time Arrival</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-[#C04E24]">10,000+</div>
                  <div className="text-xs font-semibold text-[#5A554E] uppercase">Trips Dispatched</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-[#C04E24]">100%</div>
                  <div className="text-xs font-semibold text-[#5A554E] uppercase">GST Compliant</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-[#C04E24]">24 / 7</div>
                  <div className="text-xs font-semibold text-[#5A554E] uppercase">Support SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-[#FFFFFF] border-t border-[#E0DAD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C04E24]">Our Principles</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1A18] tracking-tight">
              The Standards Behind Every Safe Kilometer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E0DAD1] space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#C04E24]/10 text-[#C04E24] font-bold flex items-center justify-center">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-[#1C1A18] text-base">{val.title}</h3>
                <p className="text-xs text-[#5A554E] leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
