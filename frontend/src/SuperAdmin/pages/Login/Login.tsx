import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { useAuth } from '../../../context/AuthContext';
import SimpleHeader from '../../../components/Homepage/simpleheader';
import Footer from '../../../components/Homepage/Footer';
import LoadingButton from '../../../components/LoadingButton';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Forgot Password Modal States
  const [showForgetModal, setShowForgetModal] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgetError, setForgetError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // ----- Login Validation -----
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || submitting) return;
    if (!validate()) return;

    isSubmittingRef.current = true;
    setSubmitting(true);
    setErrors({});

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await axiosInstance.post('/auth/emplogin', { email: cleanEmail, password });
      const { accessToken, role, id, companyId, name, tenantId } = res.data;

      if (accessToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('role', role);
        localStorage.setItem('userId', id);
        if (name) localStorage.setItem('username', name);
        if (companyId) localStorage.setItem('companyId', companyId);

        // Strict tenant scoping setup
        if (role === 'superadmin') {
          const savedScope = localStorage.getItem('selectedTenantId') || 'all';
          localStorage.setItem('selectedTenantId', savedScope);
          localStorage.setItem('tenantId', savedScope);
        } else {
          const userTenant = tenantId || 'e7b8a1c0-0000-0000-0000-000000000001';
          localStorage.setItem('tenantId', userTenant);
          localStorage.setItem('selectedTenantId', userTenant);
        }

        const userObject = {
          userId: id,
          username: name,
          email: cleanEmail,
          role: role,
          companyId: companyId,
          tenantId: tenantId,
          token: accessToken,
        };
        localStorage.setItem('user', JSON.stringify(userObject));

        login();

        if (role === 'superadmin' || role === 'fleet_admin' || role === 'admin') {
          navigate('/dashboard');
        } else if (role === 'manager' || role === 'user') {
          navigate(`/users/useraccount/${id}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrors({ server: 'Login failed. Please verify credentials and try again.' });
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrors((prev) => ({ ...prev, server: errorMsg }));
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  // ----- Forget Password Handler -----
  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setForgetError('Email address is required');
      return;
    }

    setSendingOtp(true);
    setForgetError(null);
    setSuccessMsg(null);

    try {
      await axiosInstance.post('/auth/forgot-password/send-otp', { email: cleanEmail });
      setSuccessMsg('OTP sent to your email.');
      setStep(2);
    } catch (err: any) {
      setForgetError(err?.response?.data?.message || 'Error sending OTP email.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setForgetError('Please enter the 6-digit OTP code.');
      return;
    }

    setVerifyingOtp(true);
    setForgetError(null);

    try {
      const res = await axiosInstance.post('/auth/forgot-password/verify-otp', {
        email: cleanEmail,
        otp: cleanOtp,
      });
      if (res.data.success) {
        setSuccessMsg('OTP verified successfully. Set your new password.');
        setResetToken(res.data.resetToken || '');
        setForgetError(null);
        setStep(3);
      } else {
        setForgetError(res.data.message || 'Invalid or expired OTP.');
      }
    } catch (err: any) {
      setForgetError(err?.response?.data?.message || 'Error verifying OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleForgetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !newPassword.trim()) {
      setForgetError('New password is required');
      return;
    }
    if (newPassword.length < 6) {
      setForgetError('Password must be at least 6 characters long');
      return;
    }

    setUpdatingPassword(true);
    setForgetError(null);

    try {
      const res = await axiosInstance.put('/auth/forgetPassword', {
        email: cleanEmail,
        password: newPassword,
        newPassword,
        resetToken: resetToken || undefined,
      });

      if (res.data.success) {
        setSuccessMsg('Password updated successfully! You can now sign in.');
        setTimeout(() => {
          setShowForgetModal(false);
          setStep(1);
          setPassword('');
          setNewPassword('');
          setOtp('');
          setResetToken('');
        }, 1500);
      } else {
        setForgetError(res.data.message || 'Error updating password.');
      }
    } catch (err: any) {
      setForgetError(err?.response?.data?.message || 'Error updating password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FC] flex flex-col justify-between">
      <SimpleHeader />

      {/* Main Login Viewport with calculated clearance for fixed header */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 w-full">
        <div className="w-full max-w-md my-auto">
          {/* Card with subtle clean shadow */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden transition-all">
            {/* Dark & Brand Purple Header */}
            <div className="bg-[#0B0B0F] border-b-4 border-purple-600 px-6 sm:px-8 py-7 sm:py-8 text-center relative">
              <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/40 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3.5 shadow-lg">
                <Lock className="text-purple-400" size={28} />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                Welcome Back
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-normal">
                Sign in to your enterprise fleet portal
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 sm:py-8" noValidate>
              {errors.server && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium flex items-center justify-center text-center">
                  {errors.server}
                </div>
              )}

              {/* Email Address */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all ${
                      errors.email
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-slate-300 focus:border-purple-600'
                    }`}
                    value={email}
                    placeholder="name@company.com"
                    disabled={submitting}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-rose-600 text-xs font-semibold mt-1.5 ml-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrors({});
                      setForgetError(null);
                      setSuccessMsg(null);
                      setShowForgetModal(true);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all ${
                      errors.password
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300 focus:border-purple-600'
                    }`}
                    value={password}
                    placeholder="Enter your password"
                    disabled={submitting}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 p-1 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-600 text-xs font-semibold mt-1.5 ml-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Login Button with loading state & double-click protection */}
              <LoadingButton
                type="submit"
                loading={submitting}
                loadingText="Signing In..."
                variant="primary"
                size="lg"
                className="w-full shadow-md hover:shadow-lg"
              >
                Sign In to Enterprise Fleet
              </LoadingButton>

              <div className="mt-5 text-center">
                <span className="text-xs text-slate-500">
                  Fleet operator not registered yet?{' '}
                  <a
                    href="/register-fleet"
                    className="text-purple-600 hover:text-purple-700 font-bold hover:underline"
                  >
                    Register Fleet
                  </a>
                </span>
              </div>
            </form>
          </div>

          {/* Secure indicator badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Protected by FleetFlow industry-standard SSL encryption</span>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#0B0B0F] border-b-4 border-purple-600 px-6 py-5">
              <h3 className="text-lg font-bold text-white">Reset Your Password</h3>
              <p className="text-slate-300 text-xs mt-0.5">
                Step {step} of 3 — Secure credential recovery
              </p>
            </div>

            <div className="p-6">
              {forgetError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {forgetError}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                  {successMsg}
                </div>
              )}

              {/* Step 1: Enter Email */}
              {step === 1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Registered Email Address
                  </label>
                  <div className="relative mb-5">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={sendingOtp}
                      className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                      placeholder="name@company.com"
                    />
                  </div>

                  <div className="flex gap-2.5 justify-end">
                    <LoadingButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowForgetModal(false)}
                      disabled={sendingOtp}
                    >
                      Cancel
                    </LoadingButton>
                    <LoadingButton
                      variant="primary"
                      size="sm"
                      onClick={handleSendOtp}
                      loading={sendingOtp}
                      loadingText="Sending OTP..."
                      disabled={!email.trim()}
                    >
                      Send OTP
                    </LoadingButton>
                  </div>
                </div>
              )}

              {/* Step 2: Verify OTP */}
              {step === 2 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={verifyingOtp}
                    className="w-full mb-5 px-3 py-2.5 border-2 border-slate-300 rounded-xl text-center tracking-widest text-lg font-mono font-bold focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                    placeholder="123456"
                  />

                  <div className="flex gap-2.5 justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={verifyingOtp}
                      className="text-xs text-slate-600 hover:text-purple-600 font-semibold"
                    >
                      ← Change Email
                    </button>
                    <div className="flex gap-2">
                      <LoadingButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowForgetModal(false)}
                        disabled={verifyingOtp}
                      >
                        Cancel
                      </LoadingButton>
                      <LoadingButton
                        variant="primary"
                        size="sm"
                        onClick={handleVerifyOtp}
                        loading={verifyingOtp}
                        loadingText="Verifying..."
                        disabled={otp.trim().length < 6}
                      >
                        Verify OTP
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    New Secure Password (Min 6 Characters)
                  </label>
                  <div className="relative mb-5">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={updatingPassword}
                      className="w-full pl-9 pr-10 py-2.5 border-2 border-slate-300 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="flex gap-2.5 justify-end">
                    <LoadingButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowForgetModal(false)}
                      disabled={updatingPassword}
                    >
                      Cancel
                    </LoadingButton>
                    <LoadingButton
                      variant="primary"
                      size="sm"
                      onClick={handleForgetPassword}
                      loading={updatingPassword}
                      loadingText="Updating Password..."
                      disabled={!newPassword.trim() || newPassword.length < 6}
                    >
                      Update Password
                    </LoadingButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Login;
