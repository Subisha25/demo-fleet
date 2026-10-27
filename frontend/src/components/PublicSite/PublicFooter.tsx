import React from "react";
import { Link } from "react-router-dom";
import GraceCabsLogo from "../GraceCabsLogo";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1C1A18] text-[#E0DAD1] border-t border-[#332F2C]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <GraceCabsLogo className="h-10 w-auto" />
              <div>
                <span className="text-xl font-black tracking-tight text-white">FLEETFLOW</span>
                <span className="block text-[10px] font-bold tracking-widest text-[#C04E24] uppercase">
                  Multi-Tenant Fleet Platform
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#A8A199] leading-relaxed max-w-sm">
              Enterprise fleet operations and corporate mobility SaaS platform. Streamlining bookings,
              real-time dispatches, driver rosters, dynamic route cards, and automated GST billing.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-[#A8A199]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2B2724] border border-[#3D3834] text-[#E0DAD1]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2B2724] border border-[#3D3834] text-[#E0DAD1]">
                ISO 9001:2015 Compliant
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#C04E24] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C04E24] transition-colors">
                  About FleetFlow
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#C04E24] transition-colors">
                  Mobility Services
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-[#C04E24] transition-colors">
                  Fleet Showcase
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[#C04E24] transition-colors">
                  SaaS Plans & Pricing
                </Link>
              </li>
              <li>
                <Link to="/register-fleet" className="text-[#C04E24] font-bold hover:underline">
                  Register Your Fleet →
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Solutions</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-[#C5BFB8]">Corporate Employee Transport</span>
              </li>
              <li>
                <span className="text-[#C5BFB8]">Executive Spot Rental</span>
              </li>
              <li>
                <span className="text-[#C5BFB8]">Airport Transfer Dispatch</span>
              </li>
              <li>
                <span className="text-[#C5BFB8]">Monthly Route Card Billing</span>
              </li>
              <li>
                <span className="text-[#C5BFB8]">Driver Document Vault</span>
              </li>
              <li>
                <Link to="/login" className="text-[#E0DAD1] hover:text-[#C04E24] transition-colors">
                  Fleet Operator Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Contact & Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#C04E24] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@fleetflow.com" className="hover:text-[#C04E24] transition-colors break-all">
                  support@fleetflow.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#C04E24] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+919841722675" className="hover:text-[#C04E24] transition-colors">
                  +91 98417 22675
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#C04E24] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[#A8A199]">Chennai, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-8 border-t border-[#332F2C] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8C847B]">
          <p>© {currentYear} FleetFlow SaaS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-[#E0DAD1] transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy-policy" className="hover:text-[#E0DAD1] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cancel-reservation" className="hover:text-[#E0DAD1] transition-colors">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
