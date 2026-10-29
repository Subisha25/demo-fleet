import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, MapPin, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { useAuth } from '../../../context/AuthContext';

interface FleetPublicProfile {
  tenantId: string;
  name: string;
  displayName: string;
  legalName: string;
  logoUrl?: string | null;
  registeredAddress?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  slug: string;
  portalTitle: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function FleetLogin() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fleet, setFleet] = useState<FleetPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchFleetProfile = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await axiosInstance.get(`/tenants/public/slug/${encodeURIComponent(slug)}`);
        if (res.data?.success && res.data?.fleet) {
          setFleet(res.data.fleet);
          // Set dynamic browser title to fleet's branded portal
          document.title = `${res.data.fleet.displayName || res.data.fleet.name} — Fleet Login | FleetFlow`;
        } else {
          setNotFound(true);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setErrorMessage('Unable to load fleet portal. Please check the URL or try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFleetProfile();
  }, [slug]);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password.trim()) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !fleet) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await axiosInstance.post(`/tenants/public/login/${encodeURIComponent(fleet.slug)}`, {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data?.success && res.data?.accessToken) {
        const { accessToken, role, id, companyId, tenantId, email: userEmail, fleet: tenantData } = res.data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('role', role);
        localStorage.setItem('userId', id);
        if (companyId) localStorage.setItem('companyId', companyId);

        localStorage.setItem('tenantId', tenantId);
        localStorage.setItem('selectedTenantId', tenantId);

        const userObject = {
          userId: id,
          username: fleet.displayName || fleet.name,
          email: userEmail || email,
          role,
          companyId,
          tenantId,
          token: accessToken,
        };
        localStorage.setItem('user', JSON.stringify(userObject));

        login();

        // Role-based redirect
        if (role === 'superadmin') {
          navigate('/dashboard');
        } else if (role === 'manager' || role === 'user') {
          navigate(`/users/useraccount/${id}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage(res.data?.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify your email and password.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Safe Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#C04E24]/20 border-t-[#C04E24] rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-[#5C5752] uppercase tracking-wider">Loading Fleet Portal...</p>
      </div>
    );
  }

  // Safe 404 Not Found State
  if (notFound || !fleet) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between p-6">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#5C5752] hover:text-[#C04E24] transition">
            <ArrowLeft size={14} /> Back to FleetFlow Platform
          </Link>
          <span className="text-[11px] font-bold text-[#7A7570] uppercase tracking-wider">FleetFlow SaaS</span>
        </header>

        <main className="max-w-md mx-auto w-full bg-white rounded-2xl border border-[#E0DAD1] p-8 shadow-xl text-center my-8">
          <div className="w-16 h-16 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-bold text-[#1C1A18] mb-2">Fleet Operator Not Found</h1>
          <p className="text-xs text-[#5C5752] leading-relaxed mb-6">
            The unique fleet login address <span className="font-mono text-[#C04E24] font-semibold">/{slug}</span> does not match any active fleet operator on the FleetFlow Mobility Platform.
          </p>
          <div className="space-y-2">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold shadow-md transition"
            >
              Go to Standard Platform Login
            </Link>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-[#E0DAD1] hover:bg-[#FAF8F5] text-xs font-bold text-[#5C5752] transition"
            >
              Return to FleetFlow Homepage
            </Link>
          </div>
        </main>

        <footer className="text-center text-[11px] text-[#7A7570] max-w-4xl mx-auto w-full">
          Powered by FleetFlow Mobility Platform &bull; Enterprise Cloud Tenant Isolation
        </footer>
      </div>
    );
  }

  // Active Fleet-Branded Login Screen
  const primaryBrandColor = fleet.primaryColor || '#0f1c3f';
  const fullAddress = [fleet.registeredAddress, fleet.city, fleet.state, fleet.pinCode].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-[#F8F8FC] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header with Back Link & attribution */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-600 transition"
        >
          <ArrowLeft size={14} /> FleetFlow Platform
        </Link>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
          Dedicated Fleet Portal
        </span>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md mx-auto w-full my-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-7 sm:p-9 relative overflow-hidden">
          {/* Subtle Top Color Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 to-purple-700"
            style={{
              background: fleet.primaryColor
                ? `linear-gradient(90deg, ${fleet.primaryColor}, ${fleet.secondaryColor || '#7c3aed'})`
                : undefined,
            }}
          />

          {/* Fleet Identity Header */}
          <div className="text-center mb-6 pt-2">
            {fleet.logoUrl ? (
              <img
                src={fleet.logoUrl}
                alt={`${fleet.displayName || fleet.name} Logo`}
                className="h-16 max-w-[200px] w-auto mx-auto object-contain mb-3 p-1 rounded-lg border border-[#E0DAD1]/50 bg-white shadow-sm"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-md"
                style={{ backgroundColor: primaryBrandColor }}
              >
                {(fleet.displayName || fleet.name).charAt(0).toUpperCase()}
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {fleet.displayName || fleet.name}
            </h1>
            <p className="text-xs font-semibold text-purple-700 mt-0.5">
              {fleet.portalTitle || `${fleet.displayName || fleet.name} Dispatch Portal`}
            </p>

            {fullAddress && (
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mt-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-200 max-w-sm mx-auto truncate">
                <MapPin size={11} className="text-purple-600 flex-shrink-0" />
                <span className="truncate">{fullAddress}</span>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Account Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="admin@yourfleet.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                    fieldErrors.email
                      ? 'border-red-400 focus:ring-2 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 bg-white'
                  }`}
                  disabled={submitting}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgetpasword"
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition ${
                    fieldErrors.password
                      ? 'border-red-400 focus:ring-2 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 bg-white'
                  }`}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
              style={{
                background: fleet.primaryColor
                  ? `linear-gradient(90deg, ${fleet.primaryColor}, ${fleet.secondaryColor || '#7c3aed'})`
                  : undefined,
              }}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Shield size={16} />
                  <span>Sign In to {fleet.displayName || fleet.name}</span>
                </>
              )}
            </button>
          </form>

          {/* Fleet Security Note */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-500">
            <p>
              Authorized personnel only. Sessions are encrypted and tenant-isolated.
            </p>
          </div>
        </div>
      </main>

      {/* Secondary FleetFlow Platform Attribution */}
      <footer className="text-center py-4 text-xs text-slate-500 max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 tracking-tight">FleetFlow</span>
          <span>&bull;</span>
          <span>Approved Mobility Platform</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Powered by FleetFlow &bull; All Rights Reserved
        </div>
      </footer>
    </div>
  );
}
