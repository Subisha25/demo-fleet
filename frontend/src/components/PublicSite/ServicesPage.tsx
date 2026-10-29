import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";

import srv1 from "../../assets/services/1.png";
import srv2 from "../../assets/services/2.png";
import srv3 from "../../assets/services/3.png";
import srv4 from "../../assets/services/4.png";

export default function ServicesPage() {
  const navigate = useNavigate();

  const services = [
    {
      title: "Corporate Employee Transport (ETS)",
      desc: "Scheduled shift pick-and-drop operations for corporate teams, BPOs, and tech facilities with automated route sheets and roster verification.",
      image: srv1,
      badge: "Enterprise Mobility",
      features: [
        "Automated route grouping & distance calculation",
        "Driver assignment with real-time OTP confirmation",
        "Consolidated monthly tax invoicing with CGST + SGST",
        "Corporate manager approval dashboards",
      ],
    },
    {
      title: "Executive Spot Rental & Chauffeur Services",
      desc: "On-demand luxury chauffeur services for visiting corporate executives, client delegations, board meetings, and inter-city business travel.",
      image: srv2,
      badge: "Executive Class",
      features: [
        "Premium sedans and luxury SUVs (Innova Crysta, Camry, Mercedes)",
        "Trained, uniformed, and verified commercial chauffeurs",
        "Digital odometer start/end recording with automated batta calculation",
        "Instant digital receipt generation with PDF download",
      ],
    },
    {
      title: "Airport & Railway Hub Transfers",
      desc: "Guaranteed on-time airport pickup and drop-offs with flight tracking integration, personalized name-board meet-and-greet, and priority dispatch.",
      image: srv3,
      badge: "24/7 Guaranteed Dispatch",
      features: [
        "Flight delay & schedule adjustment tracking",
        "Designated terminal meeting points",
        "Fixed transparent tariff with toll and parking inclusions",
        "Automated passenger SMS and email dispatch confirmation",
      ],
    },
    {
      title: "Fleet Attachment & Long-Term Leasing",
      desc: "Partner cab attachment programs and dedicated long-term lease vehicles for corporate campuses, industrial units, and logistics hubs.",
      image: srv4,
      badge: "Operator Growth",
      features: [
        "Dedicated vehicle attachment contracts with weekly settlements",
        "Comprehensive vehicle maintenance & fitness tracking",
        "Driver compliance, insurance, and tax document vault",
        "Seamless SaaS telemetry and performance monitoring",
      ],
    },
  ];

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F7F7FB] via-white to-[#F7F7FB] py-16 md:py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#5B3DF5]/10 text-[#5B3DF5] text-xs font-bold uppercase tracking-wider">
            Mobility Services
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#17171D] tracking-tight">
            Comprehensive Corporate Transport & Fleet Solutions
          </h1>
          <p className="text-lg text-[#686875] max-w-3xl mx-auto leading-relaxed">
            Delivering punctual, safe, and fully audited commercial transportation services backed by
            intelligent digital trip sheets and real-time operational telemetry.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 bg-[#F7F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-2 ${
                idx % 2 === 1 ? "lg:grid-flow-dense" : ""
              }`}
            >
              <div
                className={`p-8 sm:p-12 flex flex-col justify-between space-y-6 ${
                  idx % 2 === 1 ? "lg:col-start-2" : ""
                }`}
              >
                <div className="space-y-4">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#5B3DF5]/10 text-[#5B3DF5]">
                    {srv.badge}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17171D] tracking-tight">
                    {srv.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#686875] leading-relaxed">
                    {srv.desc}
                  </p>
                  <div className="pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#17171D] mb-3">
                      Key Capabilities Included:
                    </h3>
                    <ul className="space-y-2">
                      {srv.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#17171D]">
                          <svg className="w-4 h-4 text-[#5B3DF5] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => navigate("/register-fleet")}
                    className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-xl shadow-sm transition-all"
                  >
                    Onboard Fleet for this Service
                  </button>
                  <Link
                    to="/contact"
                    className="text-xs sm:text-sm font-bold text-[#17171D] hover:text-[#5B3DF5] transition-colors"
                  >
                    Inquire Transport Desk →
                  </Link>
                </div>
              </div>

              <div
                className={`bg-[#F7F7FB] flex items-center justify-center p-8 overflow-hidden border-t lg:border-t-0 ${
                  idx % 2 === 1 ? "lg:col-start-1 lg:border-r border-gray-100" : "lg:border-l border-gray-100"
                }`}
              >
                <img
                  src={srv.image}
                  alt={srv.title}
                  className="max-h-72 w-auto object-contain filter drop-shadow-md transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
