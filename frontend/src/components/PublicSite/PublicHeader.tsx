import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FleetFlowLogo from "../FleetFlowLogo";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Fleet Showcase", path: "/portfolio" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && (location.pathname === path || location.pathname.startsWith(`${path}/`))) return true;
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/80"
          : "bg-white border-b border-gray-200/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Canonical FleetFlow Brand Logo */}
          <Link to="/" className="flex items-center shrink-0 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]/30 rounded-xl p-1 transition-transform hover:scale-[1.02]">
            <FleetFlowLogo variant="dark" size="md" showTagline={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="public-navbar hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`nav-link px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative whitespace-nowrap flex items-center ${
                    active
                      ? "active text-[#5B3DF5] font-bold bg-[#F3F0FF]"
                      : "text-[#303044] hover:text-[#5B3DF5] hover:bg-[#F3F0FF]"
                  }`}
                >
                  <span>{link.name}</span>
                  {active && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#5B3DF5] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Distinct, Polished Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Book a Cab */}
            <button
              id="header-book-cab-btn"
              type="button"
              onClick={() => navigate("/book")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#5B3DF5] bg-[#5B3DF5]/5 hover:bg-[#F3F0FF] hover:text-[#4326C6] border border-[#5B3DF5]/30 hover:border-[#5B3DF5] rounded-xl transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]/30 shadow-xs"
            >
              <svg className="w-4 h-4 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Book a Cab</span>
            </button>

            {/* Fleet Operator Login */}
            <button
              id="header-fleet-login-btn"
              type="button"
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-semibold text-[#303044] hover:text-[#5B3DF5] bg-gray-50 hover:bg-[#F3F0FF] border border-gray-200 hover:border-[#5B3DF5]/30 rounded-xl transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-purple-200 shadow-xs"
            >
              Fleet Login
            </button>

            {/* Register Fleet (Primary CTA) */}
            <button
              id="header-register-fleet-btn"
              type="button"
              onClick={() => navigate("/register-fleet")}
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
            >
              Register Fleet
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#303044] hover:text-[#5B3DF5] hover:bg-[#F3F0FF] focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]/40 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-5 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="public-navbar flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-link flex items-center justify-between px-4 py-3 rounded-xl text-base transition-all duration-200 ${
                    active
                      ? "active bg-[#F3F0FF] text-[#5B3DF5] font-bold"
                      : "text-[#303044] hover:bg-[#F3F0FF] hover:text-[#5B3DF5]"
                  }`}
                >
                  <span>{link.name}</span>
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-[#5B3DF5]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-gray-200 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/book");
              }}
              className="w-full text-center px-4 py-3 text-sm font-bold text-[#5B3DF5] bg-[#5B3DF5]/10 hover:bg-[#F3F0FF] border border-[#5B3DF5]/30 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Book a Cab Online</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
              className="w-full text-center px-4 py-3 text-sm font-semibold text-[#303044] hover:text-[#5B3DF5] bg-gray-50 hover:bg-[#F3F0FF] border border-gray-200 rounded-xl transition-all"
            >
              Fleet Operator Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/register-fleet");
              }}
              className="w-full text-center px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-xl shadow-md transition-all"
            >
              Register Your Fleet
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
