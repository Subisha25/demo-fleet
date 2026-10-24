import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import GraceCabsLogo from "../GraceCabsLogo";
import PublicLayout from "../PublicSite/PublicLayout";

interface TokenVerificationData {
  fleetName: string;
  businessCode: string;
  adminName: string;
  email: string;
  plan: string;
  billingCycle: string;
}

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<TokenVerificationData | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setVerificationError("No activation token was provided. Please use the exact link sent to your email.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axiosInstance.get(`/public/verify-activation-token?token=${encodeURIComponent(token)}`);
        if (res.data && res.data.success) {
          setTenantInfo(res.data.data);
          if (res.data.data?.email) {
            setEmail(res.data.data.email);
          }
        } else {
          setVerificationError(
            res.data?.message || "This activation link is invalid, expired, or has already been redeemed."
          );
        }
      } catch (err: any) {
        setVerificationError(err.response?.data?.message || "Network error while verifying activation token. Please ensure the server is reachable.");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!email || !email.includes("@")) {
      setSubmitError("A valid registered administrator email is required.");
      return;
    }

    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match. Please re-enter.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/public/activate-account", {
        token,
        email,
        password,
        confirmPassword,
      });

      if (res.data && res.data.success) {
        setActivationSuccess(true);
      } else {
        setSubmitError(res.data?.message || "Failed to complete account activation. The link may have expired.");
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "A network error occurred while activating your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="bg-white rounded-3xl shadow-xl border border-[#E0DAD1] max-w-lg w-full overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] text-white p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-[#C04E24]/20 border border-[#C04E24]/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#DE8A66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Activate Operator Account</h1>
            <p className="text-xs sm:text-sm text-[#EDE9E3] mt-1">
              Secure single-use onboarding for verified Grace Cabs fleet operators.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Loading / Verifying State */}
            {verifying && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#C04E24] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#5C5752] font-medium text-sm">Verifying cryptographic activation token...</p>
              </div>
            )}

            {/* Error State */}
            {!verifying && verificationError && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1C1A18] mb-2">Activation Link Invalid</h3>
                <p className="text-sm text-[#5C5752] mb-6 bg-rose-50 p-4 rounded-xl border border-rose-200 text-left">
                  {verificationError}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/register-fleet")}
                    className="w-full py-3 bg-[#C04E24] hover:bg-[#A43D1A] text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
                  >
                    Submit New Registration
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full py-2.5 text-[#5C5752] text-sm font-medium hover:text-[#1C1A18]"
                  >
                    Return to Homepage
                  </button>
                </div>
              </div>
            )}

            {/* Success State */}
            {!verifying && activationSuccess && (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#1C1A18] mb-2">Account Ready!</h3>
                <p className="text-sm text-[#5C5752] mb-6">
                  Your administrator password has been set securely. Your tenant workspace is provisioned and ready for your first operational dispatch.
                </p>
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E0DAD1] text-left text-xs text-[#1C1A18] space-y-1 mb-6">
                  <div><strong>Fleet Name:</strong> {tenantInfo?.fleetName}</div>
                  <div><strong>Business Code:</strong> {tenantInfo?.businessCode}</div>
                  <div><strong>Login Email:</strong> {tenantInfo?.email}</div>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3.5 bg-[#C04E24] hover:bg-[#A43D1A] text-white rounded-xl text-sm font-bold shadow-lg transition-all"
                >
                  Proceed to Operator Login
                </button>
              </div>
            )}

            {/* Form State (Token Valid & Not Activated Yet) */}
            {!verifying && !verificationError && !activationSuccess && tenantInfo && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Operator Profile Preview */}
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E0DAD1]">
                  <div className="text-xs font-bold text-[#7A7570] uppercase tracking-wider mb-2">
                    Verified Fleet Application
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#5C5752]">Fleet Name:</span>
                      <p className="font-semibold text-[#1C1A18]">{tenantInfo.fleetName}</p>
                    </div>
                    <div>
                      <span className="text-[#5C5752]">Business Code:</span>
                      <p className="font-mono font-bold text-[#C04E24]">{tenantInfo.businessCode}</p>
                    </div>
                    <div>
                      <span className="text-[#5C5752]">Administrator:</span>
                      <p className="font-semibold text-[#1C1A18]">{tenantInfo.adminName}</p>
                    </div>
                    <div>
                      <span className="text-[#5C5752]">Selected Plan:</span>
                      <p className="font-semibold uppercase text-emerald-700">{tenantInfo.plan}</p>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Registered Administrator Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter registered applicant email"
                    className="w-full px-4 py-3 rounded-xl border border-[#E0DAD1] focus:outline-none focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Create Master Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-3 rounded-xl border border-[#E0DAD1] focus:outline-none focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-3 rounded-xl border border-[#E0DAD1] focus:outline-none focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24] text-sm bg-white"
                  />
                </div>

                <div className="text-[11px] text-[#5C5752] leading-relaxed bg-[#FAF8F5] p-3 rounded-lg border border-[#E0DAD1]">
                  <span className="font-semibold text-[#C04E24]">Security Notice:</span> This single-use activation token expires in 24 hours. Your password will be salted and hashed with bcrypt.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#C04E24] hover:bg-[#A43D1A] text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Activating Workspace...</span>
                    </>
                  ) : (
                    "Complete Activation & Set Password"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

