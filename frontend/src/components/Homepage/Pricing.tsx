import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../PublicSite/PublicLayout";

interface PlanConfig {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  vehicleQuota: string;
  driverQuota: string;
  corporateQuota: string;
  features: string[];
}

const plans: PlanConfig[] = [
  {
    id: "basic",
    name: "Starter Mobility",
    tagline: "Essential fleet operations for emerging operators and local providers.",
    monthlyPrice: 299,
    annualPrice: 3050,
    vehicleQuota: "Up to 15 Vehicles",
    driverQuota: "Up to 15 Drivers",
    corporateQuota: "Up to 3 Corporate Clients",
    features: [
      "Standard Booking & Dispatch Desk",
      "Real-time Trip Logging & Status Tracking",
      "Driver & Vehicle Document Management",
      "Single-trip GST Invoice Generation",
      "Standard Email & SMS Trip Alerts",
      "Self-service Passenger Web Portal",
    ],
  },
  {
    id: "pro",
    name: "Growth Fleet Pro",
    tagline: "High-performance operational engine for expanding corporate fleet services.",
    monthlyPrice: 349,
    annualPrice: 3560,
    popular: true,
    vehicleQuota: "Up to 75 Vehicles",
    driverQuota: "Up to 75 Drivers",
    corporateQuota: "Up to 20 Corporate Clients",
    features: [
      "Everything in Starter Mobility",
      "Automated Monthly & On-Call Invoicing",
      "Corporate Policy & Expense Limits Engine",
      "Multi-dispatcher Role Access Control",
      "Live Revenue & Trip Utilization Analytics",
      "Customer PDF Invoices with Digital Signatures",
      "Dedicated 2Factor DLT Sender ID Gateway",
      "Automatic Payment Reminders & Ledgers",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Mobility Suite",
    tagline: "Turnkey enterprise multi-branch fleet infrastructure with bespoke controls.",
    monthlyPrice: 549,
    annualPrice: 5600,
    vehicleQuota: "Up to 250 Vehicles",
    driverQuota: "Up to 250 Drivers",
    corporateQuota: "Up to 100 Corporate Clients",
    features: [
      "Everything in Growth Fleet Pro",
      "Multi-Branch & Regional Fleet Segregation",
      "Custom Corporate Approval Hierarchies",
      "Dedicated High-Capacity Dispatch Queue",
      "Tamper-Evident Audit & Security Logs",
      "Direct API Access for ERP Integration",
      "SLA-Backed 99.9% Uptime Guarantee",
      "Dedicated Technical Account Manager",
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-[#0B0B0F] border-b border-[#1E1E28] text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5B3DF5]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-block px-3.5 py-1.5 bg-[#5B3DF5]/20 text-indigo-300 border border-[#5B3DF5]/40 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Transparent, Value-Driven Fleet Plans
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Scale Your Fleet Management with Confidence
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            From single-city operators to enterprise transport providers, choose the tier that matches your operational scale. All plans include full multi-tenant isolation and verified GST invoicing.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center bg-[#161622] p-1.5 rounded-2xl border border-[#2B2B3D] shadow-xl">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-[#5B3DF5] text-white shadow-md"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                billingCycle === "annual"
                  ? "bg-[#5B3DF5] text-white shadow-md"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Save 15%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const displayPrice =
              billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
            const periodLabel = billingCycle === "annual" ? "/year" : "/month";

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#111118] text-white border-2 border-[#5B3DF5] shadow-2xl relative md:-translate-y-3"
                    : "bg-white text-[#17171D] border border-gray-200/90 shadow-lg hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3 className={`text-2xl font-black ${plan.popular ? "text-white" : "text-[#17171D]"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mt-2 min-h-[40px] leading-relaxed ${plan.popular ? "text-gray-300" : "text-[#686875]"}`}>
                      {plan.tagline}
                    </p>
                  </div>

                  <div className={`mb-6 pb-6 border-b ${plan.popular ? "border-[#252535]" : "border-gray-100"}`}>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${plan.popular ? "text-white" : "text-[#5B3DF5]"}`}>
                        {formatCurrency(displayPrice)}
                      </span>
                      <span className={`text-sm font-medium ${plan.popular ? "text-gray-400" : "text-[#686875]"}`}>
                        {periodLabel}
                      </span>
                    </div>
                    {billingCycle === "annual" ? (
                      <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <span>✓ Includes 15% annual prepayment discount</span>
                      </div>
                    ) : (
                      <div className={`mt-2 text-xs ${plan.popular ? "text-gray-400" : "text-[#686875]"}`}>
                        Billed monthly. Standard 18% GST applicable.
                      </div>
                    )}
                  </div>

                  {/* Quota Highlights */}
                  <div className={`rounded-2xl p-4 mb-6 space-y-2 border ${
                    plan.popular
                      ? "bg-[#1B1B26] border-[#2A2A3D]"
                      : "bg-[#F7F7FB] border-gray-200"
                  }`}>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${plan.popular ? "text-indigo-300" : "text-[#686875]"}`}>
                      Included Quotas
                    </div>
                    <div className={`flex items-center text-sm font-bold ${plan.popular ? "text-white" : "text-[#17171D]"}`}>
                      <span className="w-2 h-2 rounded-full bg-[#5B3DF5] mr-2"></span>
                      {plan.vehicleQuota}
                    </div>
                    <div className={`flex items-center text-sm font-bold ${plan.popular ? "text-white" : "text-[#17171D]"}`}>
                      <span className="w-2 h-2 rounded-full bg-[#5B3DF5] mr-2"></span>
                      {plan.driverQuota}
                    </div>
                    <div className={`flex items-center text-sm font-bold ${plan.popular ? "text-white" : "text-[#17171D]"}`}>
                      <span className="w-2 h-2 rounded-full bg-[#5B3DF5] mr-2"></span>
                      {plan.corporateQuota}
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3 mb-8">
                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${plan.popular ? "text-gray-400" : "text-[#686875]"}`}>
                      Key Capabilities
                    </div>
                    {plan.features.map((feature, i) => (
                      <div key={i} className={`flex items-start gap-3 text-sm ${plan.popular ? "text-gray-200" : "text-[#17171D]"}`}>
                        <svg
                          className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/register-fleet?plan=${plan.id}&billing=${billingCycle}`
                    )
                  }
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md ${
                    plan.popular
                      ? "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-indigo-500/25 hover:shadow-xl"
                      : "bg-[#17171D] text-white hover:bg-[#5B3DF5] hover:shadow-lg"
                  }`}
                >
                  Register Your Fleet — {plan.name}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Enterprise SLA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 w-full">
        <div className="bg-[#111118] border-l-4 border-[#5B3DF5] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-[#252535]">
          <div>
            <span className="px-3 py-1 bg-[#5B3DF5] text-white font-bold text-xs uppercase tracking-wider rounded-md">
              Need Custom Fleet Scale?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 text-white">
              Managing 250+ Cabs or Interstate Operations?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              We offer bespoke enterprise onboarding with dedicated database clustering, customized corporate booking portals, and white-glove migration of your legacy trip history.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-3 bg-white text-[#17171D] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-md border border-gray-200"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-[#17171D]">Frequently Asked Questions</h2>
          <p className="text-[#686875] mt-2 text-sm">
            Everything you need to know about FleetFlow SaaS billing and provisioning.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <h4 className="text-base font-bold text-[#17171D]">
              How does the fleet registration and approval process work?
            </h4>
            <p className="text-sm text-[#686875] mt-2 leading-relaxed">
              Submit your company details and requested plan on the registration page. Our SuperAdmin team reviews your business code and verification details within 24 hours. Upon approval, you will receive a secure activation link via email to set your master password and activate your isolated fleet workspace.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <h4 className="text-base font-bold text-[#17171D]">
              What happens if my subscription expires?
            </h4>
            <p className="text-sm text-[#686875] mt-2 leading-relaxed">
              We send automatic renewal notifications 2 days prior to expiration. If payment is not completed by expiry, a 3-day grace period is granted where operations continue uninterrupted. Starting Day 4 unpaid, new dispatch operations are restricted while billing, historical reports, and invoice downloads remain accessible.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <h4 className="text-base font-bold text-[#17171D]">
              Are GST invoices provided for subscription fees?
            </h4>
            <p className="text-sm text-[#686875] mt-2 leading-relaxed">
              Yes. Every subscription checkout automatically calculates CGST (9%) and SGST (9%), generating an official tax invoice with a sequential number (e.g. SUB-202610-0001) that can be downloaded for your corporate tax filings.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
