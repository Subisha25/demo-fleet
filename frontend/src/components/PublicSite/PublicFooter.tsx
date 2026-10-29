import React from "react";
import { Link } from "react-router-dom";
import FleetFlowLogo from "../FleetFlowLogo";
import { usePublicContact } from "../../services/contactConfig";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const { contact } = usePublicContact();

  return (
    <footer className="bg-[#0B0B0F] text-gray-300 border-t border-[#1E1E26]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-[#5B3DF5] rounded-xl">
              <FleetFlowLogo variant="light" size="md" showTagline={true} />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Enterprise fleet operations and corporate mobility cloud platform. Providing multi-tenant
              fleet isolation, live GPS dispatching, driver rosters, trip sheets, and automated GST billing.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16161F] border border-[#262636] text-gray-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Cloud Services Operational
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16161F] border border-[#262636] text-gray-200">
                SOC2 & ISO 27001 Compliant
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About FleetFlow
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                  Mobility Services
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-gray-400 hover:text-white transition-colors">
                  Fleet Showcase
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  SaaS Plans & Pricing
                </Link>
              </li>
              <li>
                <Link to="/register-fleet" className="text-[#A855F7] font-semibold hover:text-[#C4B5FD] transition-colors inline-flex items-center gap-1">
                  <span>Register Fleet</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Solutions</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-gray-400">Corporate Employee Transit</span>
              </li>
              <li>
                <span className="text-gray-400">Executive Chauffeur Rental</span>
              </li>
              <li>
                <span className="text-gray-400">Airport Transfer Dispatch</span>
              </li>
              <li>
                <span className="text-gray-400">Digital Trip Sheet Vault</span>
              </li>
              <li>
                <span className="text-gray-400">Monthly Tax Invoicing</span>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Fleet Operator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Contact & Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#5B3DF5] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${contact.email}`} className="text-gray-400 hover:text-white transition-colors break-all">
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#5B3DF5] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="text-gray-400 hover:text-white transition-colors">
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#5B3DF5] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">{contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-8 border-t border-[#1E1E26] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} FleetFlow Technologies Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/terms" className="hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cancel-reservation" className="hover:text-gray-300 transition-colors">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
