import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Key, ArrowLeft, ShieldCheck } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import SimpleHeader from "../../../components/Homepage/simpleheader";
import Footer from "../../../components/Homepage/Footer";
import LoadingButton from "../../../components/LoadingButton";

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSendOtp = async (isResend = false) => {
    if (isSubmittingRef.current || loading) return;

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setErrorMessage("Please enter your registered email address.");
      setSuccessMessage("");
      return;
    }
    if (!validateEmail(trimmed)) {
      setErrorMessage("Please enter a valid email address.");
      setSuccessMessage("");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setErrorMessage("");
    if (!isResend) setSuccessMessage("");

    try {
      const res = await axiosInstance.post("/auth/forgot-password/send-otp", { email: trimmed });
      setSuccessMessage(res.data.message || "OTP sent to your email.");
      setErrorMessage("");
      setCooldown(60);
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send OTP email. Please try again.";
      setErrorMessage(msg);
      setSuccessMessage("");
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (isSubmittingRef.current || loading) return;

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length < 6) {
      setErrorMessage("Please enter the 6-digit OTP received in your email.");
      setSuccessMessage("");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await axiosInstance.post("/auth/forgot-password/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: trimmedOtp,
      });

      if (res.data.success) {
        setSuccessMessage("OTP verified successfully. Please enter your new password.");
        setResetToken(res.data.resetToken || "");
        setStep(3);
      } else {
        setErrorMessage(res.data.message || "Invalid or expired OTP.");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Invalid OTP code.");
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (isSubmittingRef.current || loading) return;

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      setSuccessMessage("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setSuccessMessage("");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await axiosInstance.post("/auth/forgot-password/reset-password", {
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword,
      });

      if (res.data.success) {
        setSuccessMessage("Password reset successfully! You can now sign in.");
      } else {
        setErrorMessage(res.data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to reset password.");
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FC] flex flex-col justify-between">
      <SimpleHeader />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 w-full">
        <div className="w-full max-w-md my-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header in Black & Brand Purple Accent */}
            <div className="bg-[#0B0B0F] border-b-4 border-purple-600 px-6 sm:px-8 py-7 sm:py-8 text-center">
              <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/40 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3.5 shadow-lg">
                <Key className="text-purple-400" size={28} />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                Forgot Password
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-normal">
                Recover your enterprise account credentials
              </p>
            </div>

            <div className="px-6 sm:px-8 py-7 sm:py-8">
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium">
                  {successMessage}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        placeholder="your-account@company.com"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <LoadingButton
                    type="button"
                    onClick={() => handleSendOtp()}
                    loading={loading}
                    loadingText="Sending OTP..."
                    disabled={!email.trim()}
                    variant="primary"
                    size="lg"
                    className="w-full shadow-md"
                  >
                    Send Verification OTP
                  </LoadingButton>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      className="w-full py-3 px-4 border-2 border-slate-300 rounded-xl text-slate-900 text-center tracking-widest text-xl font-mono font-bold focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                      disabled={loading}
                    />
                  </div>

                  <LoadingButton
                    type="button"
                    onClick={handleVerifyOtp}
                    loading={loading}
                    loadingText="Verifying..."
                    disabled={otp.trim().length < 6}
                    variant="primary"
                    size="lg"
                    className="w-full shadow-md"
                  >
                    Verify OTP
                  </LoadingButton>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setErrorMessage("");
                      }}
                      className="text-slate-600 hover:text-purple-600 font-semibold"
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendOtp(true)}
                      disabled={cooldown > 0 || loading}
                      className="text-purple-600 hover:text-purple-700 hover:underline font-bold disabled:text-slate-400 disabled:no-underline"
                    >
                      {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      New Password (Min 6 Characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <LoadingButton
                    type="button"
                    onClick={handleResetPassword}
                    loading={loading}
                    loadingText="Resetting Password..."
                    disabled={!newPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                    variant="primary"
                    size="lg"
                    className="w-full shadow-md"
                  >
                    Reset Password
                  </LoadingButton>
                </div>
              )}

              <div className="mt-6 text-center text-xs text-slate-500">
                Remember your password?{" "}
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">
                  Return to Sign In
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Protected by FleetFlow industry-standard SSL encryption</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
