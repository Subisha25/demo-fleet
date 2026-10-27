import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GraceCabsLogo from "../GraceCabsLogo";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Book a Cab", path: "/book" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Portfolio", path: "/portfolio" },
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
          ? "bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm border-b border-[#E0DAD1]"
          : "bg-[#FAF8F5] border-b border-[#E0DAD1]/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <GraceCabsLogo className="h-10 w-auto" />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#1C1A18] leading-none group-hover:text-[#C04E24] transition-colors">
                FLEETFLOW
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#7A7570] uppercase mt-1">
                Mobility Cloud Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-colors py-1 relative ${
                  isActive(link.path)
                    ? "text-[#C04E24]"
                    : "text-[#2B2927] hover:text-[#C04E24]"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C04E24] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/book")}
              className="px-4 py-2 text-sm font-bold text-[#C04E24] border border-[#C04E24] rounded-lg hover:bg-[#C04E24]/10 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>🚕</span>
              <span>Book a Cab</span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-bold text-[#1C1A18] border border-[#1C1A18]/20 rounded-lg hover:border-[#1C1A18] hover:bg-[#1C1A18]/5 transition-all"
            >
              Fleet Login
            </button>
            <button
              onClick={() => navigate("/register-fleet")}
              className="px-5 py-2 text-sm font-bold text-white bg-[#C04E24] hover:bg-[#A83F1A] rounded-lg shadow-sm hover:shadow transition-all"
            >
              Register Fleet
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1C1A18] hover:bg-[#E0DAD1]/30 focus:outline-none"
              aria-label="Toggle navigation menu"
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#E0DAD1] px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? "bg-[#C04E24]/10 text-[#C04E24] font-bold"
                    : "text-[#2B2927] hover:bg-[#E0DAD1]/20 hover:text-[#C04E24]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-[#E0DAD1] space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/book");
              }}
              className="w-full text-center px-4 py-2.5 text-sm font-bold text-white bg-[#C04E24] hover:bg-[#A83F1A] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>🚕</span>
              <span>Book a Cab Online</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
              className="w-full text-center px-4 py-2.5 text-sm font-bold text-[#1C1A18] border border-[#1C1A18]/20 rounded-lg hover:bg-[#1C1A18]/5 transition-all"
            >
              Fleet Login
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/register-fleet");
              }}
              className="w-full text-center px-4 py-2.5 text-sm font-bold text-white bg-[#C04E24] hover:bg-[#A83F1A] rounded-lg shadow-sm transition-all"
            >
              Register Fleet
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
