import React, { useState } from "react";
import PublicLayout from "./PublicLayout";
import GraceCabsLogo from "../GraceCabsLogo";

export default function ContactPage() {
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
      <section className="bg-gradient-to-b from-[#FAF8F5] to-[#F5EFEB] py-16 md:py-24 border-b border-[#E0DAD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C04E24]">
            Transport Desk & Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#1C1A18] tracking-tight">
            Connect with Grace Cabs Mobility Desk
          </h1>
          <p className="text-lg text-[#5A554E] max-w-3xl mx-auto leading-relaxed">
            Have questions about fleet onboarding, corporate employee contracts, spot car rentals, or
            SaaS subscription integration? Our operations desk is available 24/7.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Details Column */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-[#E0DAD1] shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#E0DAD1]">
                  <GraceCabsLogo className="h-9 w-auto" />
                  <div>
                    <h3 className="font-bold text-[#1C1A18] text-base">Grace Cabs Central</h3>
                    <p className="text-xs text-[#7A7570]">Fleet Operations Office</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-[#2B2927]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E0DAD1] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#7A7570]">Email Inquiries</div>
                      <a href="mailto:traveldesk@gracecabs.com" className="font-semibold text-[#1C1A18] hover:text-[#C04E24]">
                        traveldesk@gracecabs.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E0DAD1] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#7A7570]">Direct Phone / WhatsApp</div>
                      <a href="tel:+919841722675" className="font-semibold text-[#1C1A18] hover:text-[#C04E24]">
                        +91 98417 22675
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E0DAD1] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#7A7570]">Head Office</div>
                      <p className="font-semibold text-[#1C1A18]">
                        Chennai, Tamil Nadu, India
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E0DAD1]">
                  <div className="text-[10px] uppercase font-bold text-[#7A7570] mb-2">Operating Hours</div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1C1A18]">
                    <span>Dispatch Operations</span>
                    <span className="text-[#C04E24]">24 Hours / 7 Days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1C1A18] mt-1">
                    <span>Corporate Billing Desk</span>
                    <span>Mon - Sat: 9 AM - 7 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E0DAD1] shadow-sm">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                      ✓
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#1C1A18]">Inquiry Received!</h3>
                    <p className="text-sm text-[#5A554E] max-w-md mx-auto">
                      Thank you for contacting Grace Cabs. Our transport desk coordinator will reach out
                      to you within 2 hours during active business shifts.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 text-xs font-bold text-[#1C1A18] border border-[#E0DAD1] rounded-xl hover:bg-[#FAF8F5] transition-all"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#1C1A18]">Send Us a Message</h2>
                      <p className="text-xs text-[#7A7570] mt-1">
                        Fill in your business transport requirements and receive a prompt consultation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1C1A18]">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl border border-[#E0DAD1] text-sm focus:border-[#C04E24] focus:ring-1 focus:ring-[#C04E24] outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1C1A18]">
                          Corporate Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@company.com"
                          className="w-full px-4 py-3 rounded-xl border border-[#E0DAD1] text-sm focus:border-[#C04E24] focus:ring-1 focus:ring-[#C04E24] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1C1A18]">
                          Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-xl border border-[#E0DAD1] text-sm focus:border-[#C04E24] focus:ring-1 focus:ring-[#C04E24] outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#1C1A18]">
                          Inquiry Type
                        </label>
                        <select
                          value={formData.inquiryType}
                          onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E0DAD1] text-sm focus:border-[#C04E24] focus:ring-1 focus:ring-[#C04E24] outline-none transition-all bg-white"
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
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1C1A18]">
                        Message / Scope of Requirements *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Detail your fleet requirements, operational city, number of vehicles, or corporate shift routes..."
                        className="w-full px-4 py-3 rounded-xl border border-[#E0DAD1] text-sm focus:border-[#C04E24] focus:ring-1 focus:ring-[#C04E24] outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 text-sm font-bold text-white bg-[#C04E24] hover:bg-[#A83F1A] rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
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
