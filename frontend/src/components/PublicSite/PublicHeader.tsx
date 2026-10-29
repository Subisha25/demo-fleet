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
    if (path !== "/" && location.pathname.startsWith(path)) return true;
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
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Canonical FleetFlow Brand Logo */}
          <Link to="/" className="flex items-center shrink-0 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]/30 rounded-xl p-1 transition-transform hover:scale-[1.02]">
            <FleetFlowLogo variant="dark" size="md" showTagline={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-colors py-1.5 relative whitespace-nowrap ${
                  isActive(link.path)
                    ? "text-[#5B3DF5]"
                    : "text-[#686875] hover:text-[#17171D]"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B3DF5] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Distinct, Polished Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Book a Cab */}
            <button
              id="header-book-cab-btn"
              onClick={() => navigate("/book")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#5B3DF5] bg-[#5B3DF5]/5 hover:bg-[#5B3DF5]/15 border border-[#5B3DF5]/30 hover:border-[#5B3DF5] rounded-xl transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]/30"
            >
              <svg className="w-4 h-4 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Book a Cab</span>
            </button>

            {/* Fleet Operator Login */}
            <button
              id="header-fleet-login-btn"
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-semibold text-[#17171D] hover:text-[#5B3DF5] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Fleet Login
            </button>

            {/* Register Fleet (Primary CTA) */}
            <button
              id="header-register-fleet-btn"
              onClick={() => navigate("/register-fleet")}
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
            >
              Register Fleet
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#17171D] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]/40"
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
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-[#5B3DF5]/10 text-[#5B3DF5] font-bold"
                    : "text-[#17171D] hover:bg-gray-100 hover:text-[#5B3DF5]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/book");
              }}
              className="w-full text-center px-4 py-3 text-sm font-bold text-[#5B3DF5] bg-[#5B3DF5]/10 hover:bg-[#5B3DF5]/20 border border-[#5B3DF5]/30 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-[#5B3DF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Book a Cab Online</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
              className="w-full text-center px-4 py-3 text-sm font-semibold text-[#17171D] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
            >
              Fleet Operator Login
            </button>
            <button
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
