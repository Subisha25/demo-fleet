import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { showToast, AlertContainer } from "../../../components/AlertBox";
import UserLoginHeader from "./userloginheader";
import Footer from "../../../components/Homepage/Footer";
import { Eye, EyeOff, Mail, Lock, Building2 } from "lucide-react";
import LoadingButton from "../../../components/LoadingButton";
import config from "../../../config/config";

interface CompanyData {
  companyId: string;
  companyName: string;
  companyLogo: string;
  seoUrl: string;
  tenantId?: string;
  fleetSlug?: string;
  fleetName?: string;
  fleetLogo?: string;
}

const UserLogin: React.FC = () => {
  const { fleetSlug, companySlug, seoUrl } = useParams<{ fleetSlug?: string; companySlug?: string; seoUrl?: string }>();
  const activeFleetSlug = (fleetSlug || "").trim();
  const activeCompanySlug = (companySlug || seoUrl || "").trim();

  const navigate = useNavigate();
  const { login } = useAuth();

  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [companyNotFound, setCompanyNotFound] = useState(false);
  const [companyLogoError, setCompanyLogoError] = useState(false);
  const [fleetLogoError, setFleetLogoError] = useState(false);

  const BASE_URL = (config?.baseurl?.apibaseurl || '').replace(/\/+$/, '');

  const companyLogoUrl = companyData?.companyLogo
    ? (companyData.companyLogo.startsWith('http') || companyData.companyLogo.startsWith('data:')
        ? companyData.companyLogo
        : `${BASE_URL}/uploads/companyLogo/${companyData.companyLogo}`)
    : null;

  const fleetLogoUrl = companyData?.fleetLogo
    ? (companyData.fleetLogo.startsWith('http') || companyData.fleetLogo.startsWith('data:')
        ? companyData.fleetLogo
        : companyData.fleetLogo.startsWith('/')
          ? `${BASE_URL}${companyData.fleetLogo}`
          : `${BASE_URL}/uploads/fleetLogo/${companyData.fleetLogo}`)
    : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isSubmittingRef = useRef(false);

  /* ===== Forgot Password States ===== */
  const [showForgetModal, setShowForgetModal] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgetError, setForgetError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /* ===== Load Company ===== */
  useEffect(() => {
    const fetchCompany = async () => {
      if (!activeCompanySlug) {
        setLoadingCompany(false);
        setCompanyNotFound(true);
        return;
      }
      try {
        setLoadingCompany(true);
        setCompanyNotFound(false);
        const url = activeFleetSlug
          ? `/company/${activeFleetSlug}/${activeCompanySlug}`
          : `/company/${activeCompanySlug}`;
        const res = await axiosInstance.get(url);
        const data = res.data?.data || res.data;
        if (data && (data.companyName || data.companyId)) {
          setCompanyData(data);
        } else {
          setCompanyNotFound(true);
        }
      } catch (err: any) {
        console.error("Unable to load company details:", err);
        setCompanyNotFound(true);
      } finally {
        setLoadingCompany(false);
      }
    };
    fetchCompany();
  }, [activeFleetSlug, activeCompanySlug]);

  /* ===== Login Validation ===== */
  const validate = () => {
    const err: any = {};
    if (!email.trim()) err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) err.email = "Enter valid email";
    if (!password.trim()) err.password = "Password is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ===== Login Submit ===== */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || submitting) return;
    if (!validate()) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    setErrors({});

  try {
    const res = await axiosInstance.post(`/auth/companyLogin`, {
      email,
      password,
      fleetSlug: activeFleetSlug || undefined,
      companySlug: activeCompanySlug,
      seoUrl: activeCompanySlug,
    });

    const { success, User, accessToken } = res.data;

    if (!success || !User || !accessToken) {
      throw new Error("Invalid login response");
    }

    // ✅ SAME AS FIRST WORKING CODE
    const userObject = {
      userId: User.userId,
      username: User.username,
      email: User.email,
      role: User.role,
      companyId: User.companyId,
      token: accessToken,
    };

    localStorage.setItem("user", JSON.stringify(userObject));

    // ✅ CRITICAL KEYS (missing before)
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("role", User.role);
    localStorage.setItem("userId", User.userId);
    localStorage.setItem("username", User.username);
    localStorage.setItem("companyId", User.companyId);

    if (companyData) {
      localStorage.setItem("companySeoUrl", companyData.seoUrl);
      localStorage.setItem("companyName", companyData.companyName);
      if (companyData.companyLogo) {
        localStorage.setItem("companyLogo", companyData.companyLogo);
      }
      if (companyData.fleetSlug || activeFleetSlug) {
        localStorage.setItem("fleetSlug", companyData.fleetSlug || activeFleetSlug);
      }
    }

    await login();

  // Navigate to company booking page or dashboard
  const companyId = User.companyId;
  if (companyId) {
    navigate(`/users/userinvoice/${User.userId}?companyId=${companyId}`, { replace: true });
  } else {
    navigate(`/dashboard`, { replace: true });
  }

    showToast("Login successful", "success");
  } catch (err: any) {
    setErrors({
      server: err?.response?.data?.message || "Login failed",
    });
  } finally {
    isSubmittingRef.current = false;
    setSubmitting(false);
  }
};


  /* ===== Forgot Password APIs ===== */

  // Step 1 – Send OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setForgetError("Email is required");
      return;
    }
    try {
      await axiosInstance.post("/auth/forgetPasswordSendOtp", { email });
      setForgetError(null);
      setSuccessMsg("OTP sent to your email");
      setStep(2);
    } catch (err: any) {
      setForgetError(err?.response?.data?.message || "Error sending OTP");
    }
  };

  // Step 2 – Verify OTP
  const handleVerifyOtp = async () => {
    try {
      const res = await axiosInstance.post("/auth/verifyOtpPassword", { email, otp });
      if (res.data.success) {
        setSuccessMsg("OTP verified");
        setForgetError(null);
        setStep(3);
      } else {
        setForgetError(res.data.message || "Invalid OTP");
      }
    } catch (err: any) {
      setForgetError(err?.response?.data?.message || "OTP verification failed");
    }
  };

  // Step 3 – Update Password
  const handleForgetPassword = async () => {
    if (!newPassword.trim()) {
      setForgetError("New password required");
      return;
    }
    try {
      const res = await axiosInstance.put("/auth/forgetPassword", {
        email,
        password: newPassword,
      });
      if (res.data.success) {
        setSuccessMsg("Password updated successfully");
        setTimeout(() => {
          setShowForgetModal(false);
          setStep(1);
          setOtp("");
          setNewPassword("");
        }, 1500);
      } else {
        setForgetError(res.data.message || "Password update failed");
      }
    } catch (err: any) {
      setForgetError(err?.response?.data?.message || "Error updating password");
    }
  };

  if (companyNotFound && !loadingCompany) {
    return (
      <>
        <AlertContainer />
        <UserLoginHeader companyData={null} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Company Portal Not Found</h2>
            <p className="text-gray-600 text-sm mb-6">
              The requested corporate portal URL could not be found. Please check the link or contact your fleet administrator.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 px-4 bg-[#274782] hover:bg-[#1f3764] text-white font-medium rounded-xl transition text-center shadow-md"
            >
              Go to Login
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const registerUrl = activeFleetSlug && activeCompanySlug
    ? `/company/${activeFleetSlug}/${activeCompanySlug}/managerAddUser`
    : `/company/${activeCompanySlug}/managerAddUser`;

  return (
    <>
      <AlertContainer />
      <UserLoginHeader companyData={companyData} />
      <div className="min-h-screen bg-[#F8F8FC] flex flex-col justify-between">
        <div className="max-w-md mx-auto w-full px-4 py-8 sm:py-12 my-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative">
            {/* Top Brand Accent Bar */}
            <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800" />

            {/* Header */}
            <div className="p-7 sm:p-8 text-center pb-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                {companyLogoUrl && !companyLogoError ? (
                  <img
                    src={companyLogoUrl}
                    alt={companyData?.companyName || "Company Logo"}
                    onError={() => setCompanyLogoError(true)}
                    className="h-14 max-w-[160px] object-contain p-1 rounded-xl border border-slate-200 bg-white shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                    {(companyData?.companyName || "C").trim().slice(0, 2).toUpperCase()}
                  </div>
                )}

                {fleetLogoUrl && !fleetLogoError && (
                  <img
                    src={fleetLogoUrl}
                    alt={companyData?.fleetName || "Fleet"}
                    onError={() => setFleetLogoError(true)}
                    className="h-10 max-w-[120px] object-contain p-1 rounded-lg border border-slate-200 bg-white shadow-2xs opacity-85"
                  />
                )}
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {companyData?.companyName || "Corporate"}
              </h1>

              <div className="mt-1.5 flex items-center justify-center gap-2">
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-0.5 rounded-full border border-purple-200">
                  {companyData?.fleetName ? `Powered by ${companyData.fleetName}` : "Corporate Mobility Portal"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Sign in to your corporate employee account</p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="px-7 sm:px-8 pb-8 space-y-4">
              {errors.server && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                  {errors.server}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm outline-none transition"
                    placeholder="name@company.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgetModal(true)}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-800 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm outline-none transition"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{errors.password}</p>
                )}
              </div>

              <LoadingButton
                type="submit"
                loading={submitting}
                loadingText="Signing In..."
                variant="primary"
                size="lg"
                className="w-full shadow-md rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
              >
                Sign In
              </LoadingButton>

              <div className="pt-2 text-center">
                <Link
                  to={registerUrl}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 transition underline underline-offset-2"
                >
                  Register new corporate employee account &rarr;
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ===== Forgot Password Modal ===== */}
      {showForgetModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#274782] to-[#352E6B] px-6 py-6">
        <h3 className="text-xl font-bold text-white">Reset Your Password</h3>
        <p className="text-blue-100 text-sm mt-1">
          Follow the steps to reset your password
        </p>
      </div>

      <div className="p-6">
        {forgetError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{forgetError}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMsg}</p>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>

            <div className="relative mb-6">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#275981] focus:ring-2 focus:ring-[#275981]/20"
                placeholder="your@email.com"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForgetModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSendOtp}
                disabled={!email}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  !email
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#274782] to-[#352E6B] text-white hover:shadow-lg hover:scale-[1.02]"
                }`}
              >
                Send OTP
              </button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter OTP
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-6 pl-3 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#275981] focus:ring-2 focus:ring-[#275981]/20"
              placeholder="Enter 6 digit OTP"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Back
              </button>

              <button
                onClick={handleVerifyOtp}
                disabled={!otp}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium ${
                  !otp
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#274782] to-[#352E6B] text-white hover:shadow-lg"
                }`}
              >
                Verify OTP
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>

            <div className="relative mb-6">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#275981] focus:ring-2 focus:ring-[#275981]/20"
                placeholder="Enter new password"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Back
              </button>

              <button
                onClick={handleForgetPassword}
                disabled={!newPassword}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium ${
                  !newPassword
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#274782] to-[#352E6B] text-white hover:shadow-lg"
                }`}
              >
                Update Password
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}

      <Footer />
    </>
  );
};

export default UserLogin;