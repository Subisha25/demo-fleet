import React, { useState } from "react";
import PublicLayout from "./PublicLayout";
import FleetFlowLogo from "../FleetFlowLogo";
import { usePublicContact } from "../../services/contactConfig";

export default function ContactPage() {
  const { contact } = usePublicContact();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    inquiryType: "CORPORATE_MOBILITY",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate safe client feedback
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F7F7FB] via-white to-[#F7F7FB] py-16 md:py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#5B3DF5]/10 text-[#5B3DF5] text-xs font-bold uppercase tracking-wider">
            Transport Desk & Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#17171D] tracking-tight">
            Connect with FleetFlow Mobility Desk
          </h1>
          <p className="text-lg text-[#686875] max-w-3xl mx-auto leading-relaxed">
            Have questions about fleet onboarding, corporate employee contracts, spot car rentals, or
            SaaS subscription integration? Our operations desk is available 24/7.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 bg-[#F7F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Details Column */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm space-y-6">
                <div className="pb-4 border-b border-gray-100">
                  <FleetFlowLogo variant="dark" size="sm" showTagline={true} />
                </div>

                <div className="space-y-4 text-sm text-[#17171D]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#5B3DF5]/10 border border-[#5B3DF5]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#686875]">Email Inquiries</div>
                      <a href={`mailto:${contact.email}`} className="font-semibold text-[#17171D] hover:text-[#5B3DF5] transition-colors">
                        {contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#5B3DF5]/10 border border-[#5B3DF5]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#686875]">Direct Phone / WhatsApp</div>
                      <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="font-semibold text-[#17171D] hover:text-[#5B3DF5] transition-colors">
                        {contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#5B3DF5]/10 border border-[#5B3DF5]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#686875]">Head Office</div>
                      <p className="font-semibold text-[#17171D]">
                        {contact.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="text-[10px] uppercase font-bold text-[#686875] mb-2">Operating Hours</div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#17171D]">
                    <span>Dispatch Operations</span>
                    <span className="text-[#5B3DF5]">24 Hours / 7 Days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#17171D] mt-1">
                    <span>Corporate Billing Desk</span>
                    <span>Mon - Sat: 9 AM - 7 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                      ✓
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#17171D]">Inquiry Received!</h3>
                    <p className="text-sm text-[#686875] max-w-md mx-auto">
                      Thank you for contacting FleetFlow. Our transport desk coordinator will reach out
                      to you within 2 hours during active business shifts.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 text-xs font-bold text-[#17171D] border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#17171D]">Send Us a Message</h2>
                      <p className="text-xs text-[#686875] mt-1">
                        Fill in your business transport requirements and receive a prompt consultation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#17171D]">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#5B3DF5] focus:ring-1 focus:ring-[#5B3DF5] outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#17171D]">
                          Corporate Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@company.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#5B3DF5] focus:ring-1 focus:ring-[#5B3DF5] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#17171D]">
                          Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#5B3DF5] focus:ring-1 focus:ring-[#5B3DF5] outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#17171D]">
                          Inquiry Type
                        </label>
                        <select
                          value={formData.inquiryType}
                          onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#5B3DF5] focus:ring-1 focus:ring-[#5B3DF5] outline-none transition-all bg-white"
                        >
                          <option value="CORPORATE_MOBILITY">Corporate Employee Transport</option>
                          <option value="SPOT_RENTAL">Executive Spot Rental</option>
                          <option value="FLEET_ONBOARDING">Fleet SaaS Onboarding (₹299-₹549)</option>
                          <option value="VEHICLE_ATTACHMENT">Attach Commercial Cab</option>
                          <option value="OTHER">General Inquiries</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#17171D]">
                        Message / Scope of Requirements *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Detail your fleet requirements, operational city, number of vehicles, or corporate shift routes..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#5B3DF5] focus:ring-1 focus:ring-[#5B3DF5] outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {loading ? "Transmitting Inquiry..." : "Submit Inquiry to Transport Desk"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
