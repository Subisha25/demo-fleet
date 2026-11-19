import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import axios from "axios";

// Environment backend URL
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const resolveImageUrl = (img?: string): string => {
  if (!img) return "/images/default_car.svg";
  const clean = img.trim();
  if (!clean || clean === "null" || clean === "undefined") return "/images/default_car.svg";
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
    return clean;
  }
  const base = API_BASE.replace(/\/+$/, "");
  const stripped = clean.replace(/^\/+/, "");
  if (stripped.startsWith("uploads/")) return `${base}/${stripped}`;
  if (stripped.startsWith("images/")) return `/${stripped}`;
  return `${base}/uploads/vehicleImg/${stripped}`;
};

export interface PackageCard {
  packageDataId: string;
  packageName: string;
  packageType: string;
  amountPerKm: number;
  currency: string;
  estimatedDistance?: number | null;
  estimatedFare?: number | null;
  fleetName: string;
  fleetSlug: string;
  fleetLogo: string;
  companyId: string;
  companyName: string;
  tenantId: string;
  seatCapacity: number;
  vehicleMasterId?: string | null;
  vehicleId?: string | null;
  vehicleTypeId: string;
  vehicleType: string;
  vehicleModelName: string;
  vehicleNumber?: string | null;
  vehicleImg: string;
  advanceBookingHours: number;
  description: string;
}

interface FleetDetails {
  name: string;
  slug: string;
  logoUrl?: string;
  customDomain?: string;
}

export default function PublicBookingWizard() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  // 4-Step OTP-First Sequence:
  // Step 1: Mobile & OTP Verification
  // Step 2: Dynamic Fleet, Company & Vehicle Cards Discovery
  // Step 3: Trip & Passenger Details Form
  // Step 4: Booking Confirmation Success
  const [step, setStep] = useState<number>(1);

  // Phone & OTP State (Step 1)
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Discovery Filter State (Step 2)
  const [seatCapacityFilter, setSeatCapacityFilter] = useState<number>(0); // 0 = All
  const [distanceEstimate, setDistanceEstimate] = useState<string>("");
  const [packages, setPackages] = useState<PackageCard[]>([]);
  const [fleetInfo, setFleetInfo] = useState<FleetDetails | null>(null);
  const [packagesLoading, setPackagesLoading] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageCard | null>(null);

  // Passenger & Booking Form State (Step 3)
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [dropPoint, setDropPoint] = useState("");
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [pickupTime, setPickupTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return `${String(d.getHours()).padStart(2, "0")}:00`;
  });
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  // Success Result (Step 4)
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Notification / Alert
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 8000);
  };

  // 30s Resend Cooldown Countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Load packages across all fleets (or scoped to slug if specified)
  const fetchPackages = async (seats: number, dist: number) => {
    setPackagesLoading(true);
    try {
      const url = `${API_BASE}/api/public/booking/packages`;
      const res = await axios.get(url, {
        params: {
          ...(seats > 0 ? { seatCapacity: seats } : {}),
          ...(dist > 0 ? { distance: dist } : {}),
          ...(slug ? { slug } : {}),
        },
      });

      if (res.data && res.data.success) {
        setPackages(res.data.packages || []);
        if (res.data.fleet) {
          setFleetInfo(res.data.fleet);
        }
      } else {
        setPackages([]);
      }
    } catch (err: any) {
      console.error("Error loading public packages:", err);
      showAlert("error", err.response?.data?.message || "Failed to load public booking packages.");
      setPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  };

  // Fetch packages when step 2 is active or filters change
  useEffect(() => {
    if (step === 2) {
      const distNum = parseFloat(distanceEstimate) || 0;
      fetchPackages(seatCapacityFilter, distNum);
    }
  }, [step, seatCapacityFilter, distanceEstimate, slug]);

  // Live estimated fare for selected vehicle
  const calculatedEstimatedFare = useMemo(() => {
    if (!selectedPackage) return 0;
    const dist = parseFloat(distanceEstimate) || 0;
    return dist > 0 ? Math.round(dist * selectedPackage.amountPerKm * 100) / 100 : 0;
  }, [selectedPackage, distanceEstimate]);

  // STEP 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      showAlert("error", "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      return;
    }

    setOtpLoading(true);
    setAlert(null);
    try {
      const res = await axios.post(`${API_BASE}/api/public/booking/send-otp`, {
        phone: cleanPhone,
        ...(slug ? { slug } : {}),
      });
      if (res.data && res.data.success) {
        setSessionId(res.data.sessionId);
        setOtpSent(true);
        setResendCooldown(30);
        if (res.data.mockOtp) {
          setMockOtpHint(res.data.mockOtp);
          setOtp(res.data.mockOtp);
          showAlert("info", `Verification code dispatched! (Mock Mode OTP: ${res.data.mockOtp})`);
        } else {
          showAlert("success", "Verification OTP sent successfully to your mobile number.");
        }
      } else {
        showAlert("error", res.data?.message || "Failed to dispatch verification code.");
      }
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Failed to send OTP. Please check your number.");
    } finally {
      setOtpLoading(false);
    }
  };

  // STEP 1: Verify OTP -> Advance to Step 2
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      showAlert("error", "Please enter the 6-digit verification code received.");
      return;
    }

    setOtpLoading(true);
    setAlert(null);
    try {
      const res = await axios.post(`${API_BASE}/api/public/booking/verify-otp`, {
        phone: phone.trim().replace(/\D/g, ""),
        otp: cleanOtp,
        sessionId,
        ...(slug ? { slug } : {}),
      });

      if (res.data && res.data.success) {
        setVerificationToken(res.data.verificationToken);
        setOtpVerified(true);
        showAlert("success", "Mobile number verified successfully! Please choose an available vehicle.");
        setStep(2); // ✅ Advance to Step 2 (Cards Discovery)
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showAlert("error", res.data?.message || "Invalid verification code.");
      }
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // STEP 2: Select Vehicle -> Advance to Step 3
  const handleSelectVehicle = (pkg: PackageCard) => {
    setSelectedPackage(pkg);
    setPassengerCount(Math.min(passengerCount || 1, pkg.seatCapacity));
    setStep(3); // ✅ Advance to Step 3 (Trip Details)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // STEP 3: Submit Booking Form -> Advance to Step 4
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) {
      showAlert("error", "Please choose a vehicle to book.");
      setStep(2);
      return;
    }

    if (!otpVerified || !verificationToken) {
      showAlert("error", "Please verify your mobile number with OTP first.");
      setStep(1);
      return;
    }

    const errors: Record<string, string> = {};

    // 1. Passenger Name
    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.customerName = "Please enter passenger full name (minimum 2 characters).";
    }

    // 2. Email Address (Optional — if entered, validate format)
    const cleanEmail = customerEmail.trim();
    if (cleanEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail)) {
        errors.customerEmail = "Please enter a valid email address (e.g. name@domain.com) or leave empty.";
      }
    }

    // 3. Pickup Point
    if (!pickupPoint.trim()) {
      errors.pickupPoint = "Pickup location is required.";
    }

    // 4. Drop Point
    if (!dropPoint.trim()) {
      errors.dropPoint = "Drop location is required.";
    }

    // 5. Pickup Date
    const todayStr = new Date().toISOString().split("T")[0];
    if (!pickupDate || pickupDate < todayStr) {
      errors.pickupDate = "Please choose today or a future pickup date.";
    }

    // 6. Pickup Time
    if (!pickupTime || !pickupTime.trim()) {
      errors.pickupTime = "Pickup time is required.";
    }

    // 7. Passenger Count
    const maxCapacity = selectedPackage.seatCapacity || 4;
    if (!passengerCount || passengerCount < 1) {
      errors.passengerCount = "At least 1 passenger is required.";
    } else if (passengerCount > maxCapacity) {
      errors.passengerCount = `Selected vehicle accommodates at most ${maxCapacity} passengers.`;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      showAlert("error", errors[firstKey]);
      const el = document.getElementById(`input-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setAlert(null);

    try {
      const distNum = parseFloat(distanceEstimate) || 0;
      const payload = {
        customerName: customerName.trim(),
        customerEmail: cleanEmail ? cleanEmail.toLowerCase() : undefined,
        phone: phone.trim().replace(/\D/g, ""),
        verificationToken,
        pickupPoint: pickupPoint.trim(),
        dropPoint: dropPoint.trim(),
        packageDataId: selectedPackage.packageDataId,
        vehicleMasterId: selectedPackage.vehicleMasterId || undefined,
        vehicleId: selectedPackage.vehicleId || undefined,
        vehicleTypeId: selectedPackage.vehicleTypeId || undefined,
        vehicleType: selectedPackage.vehicleType || undefined,
        vehicleModelName: selectedPackage.vehicleModelName || undefined,
        pickupDate: pickupDate || todayStr,
        pickupTime: pickupTime || undefined,
        travellersCount: passengerCount,
        distance: distNum > 0 ? distNum : undefined,
        notes: notes.trim() || undefined,
      };

      const res = await axios.post(`${API_BASE}/api/public/booking/create`, payload);

      if (res.data && res.data.success) {
        setBookingSuccess(res.data);
        setStep(4); // ✅ Advance to Step 4 (Success Confirmation)
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showAlert("error", res.data?.message || "Booking failed to complete.");
      }
    } catch (err: any) {
      console.error("Booking submission error:", err);
      const backendMsg = err.response?.data?.message || "Failed to confirm booking. Please try again.";
      const backendField = err.response?.data?.field;
      if (backendField) {
        setFieldErrors({ [backendField]: backendMsg });
        const el = document.getElementById(`input-${backendField}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }
      showAlert("error", backendMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fleet / Platform Banner */}
        <div className="mb-8 bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#5B3DF5]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              {slug && fleetInfo?.logoUrl ? (
                <img
                  src={fleetInfo.logoUrl}
                  alt={fleetInfo.name}
                  className="w-16 h-16 object-contain rounded-xl border border-[#E5E7EB] bg-[#F7F7FB] p-1"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#5B3DF5] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                  🚖
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17171D] tracking-tight">
                    {slug && fleetInfo?.name ? `${fleetInfo.name} Fleet Cabs` : "Book a Cab Online"}
                  </h1>
                  {slug && (
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-[#5B3DF5]/10 text-[#5B3DF5] rounded-full border border-[#5B3DF5]/20">
                      Fleet Direct
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#686875] mt-1">
                  {slug && fleetInfo?.name
                    ? `Direct booking with ${fleetInfo.name} — Transparent Per-KM rates and verified commercial cabs.`
                    : "Direct Per-KM commercial cab booking from verified fleet operators — No surge, no hidden fees."}
                </p>
              </div>
            </div>

            {/* Stepper Status */}
            {step < 4 && (
              <div className="flex items-center gap-2 bg-[#F7F7FB] px-4 py-2 rounded-xl border border-[#E5E7EB]">
                <span className="text-xs font-bold text-[#686875] uppercase tracking-wider">Step</span>
                <span className="text-sm font-extrabold text-[#5B3DF5]">
                  {step === 1
                    ? "1. Mobile Verification"
                    : step === 2
                    ? "2. Select Vehicle"
                    : "3. Trip Details"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Global Inline Alert */}
        {alert && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
              alert.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : alert.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <span className="text-lg">
              {alert.type === "error" ? "⚠️" : alert.type === "success" ? "✅" : "ℹ️"}
            </span>
            <div className="text-sm font-medium flex-1">{alert.message}</div>
          </div>
        )}

        {/* ================= STEP 1: MOBILE NUMBER AND OTP VERIFICATION (OTP FIRST) ================= */}
        {step === 1 && (
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-sm text-center">
              <div className="w-14 h-14 bg-[#5B3DF5]/10 text-[#5B3DF5] rounded-2xl flex items-center justify-center mx-auto text-2xl font-black mb-4">
                📱
              </div>

              <h2 className="text-2xl font-black text-[#17171D] mb-1">Verify Mobile Number</h2>
              <p className="text-xs text-[#686875] mb-6">
                Enter your 10-digit mobile number to verify and browse available commercial cabs across verified fleets.
              </p>

              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#686875]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      disabled={otpSent || otpLoading}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 disabled:bg-gray-100 transition-all"
                      required
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    type="submit"
                    disabled={otpLoading || phone.trim().length < 10}
                    className="w-full py-3.5 bg-[#5B3DF5] hover:bg-[#4326C6] text-white font-extrabold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {otpLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <span>Send OTP & Continue &rarr;</span>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider">
                          Enter 6-Digit OTP <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                            setMockOtpHint(null);
                          }}
                          className="text-xs font-bold text-[#5B3DF5] hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-center text-xl font-black tracking-widest text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all"
                        required
                      />
                    </div>

                    {mockOtpHint && (
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 text-center">
                        <span className="font-semibold">Test Mode Active:</span> OTP is{" "}
                        <span className="font-mono font-black text-blue-900">{mockOtpHint}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={otpLoading || otp.trim().length !== 6}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {otpLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying OTP...</span>
                        </>
                      ) : (
                        <span>Verify & Browse Cabs &rarr;</span>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs text-[#686875] pt-1">
                      <span>Didn&apos;t receive code?</span>
                      {resendCooldown > 0 ? (
                        <span className="font-semibold text-gray-400">Resend in {resendCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="font-bold text-[#5B3DF5] hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DYNAMIC FLEET, COMPANY AND PACKAGE CARDS ================= */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Verified Phone Badge & Change Option */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span className="text-xs font-bold text-emerald-900">
                  Verified Contact: <span className="font-mono">+91 {phone}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpSent(false);
                  setOtpVerified(false);
                }}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Change Number
              </button>
            </div>

            {/* Filter & Live Distance Calculator Bar */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Seat Capacity Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-[#686875] uppercase tracking-wider mr-1">
                  Passengers / Seats:
                </span>
                {[
                  { value: 0, label: "All Vehicles" },
                  { value: 4, label: "4+ Seats (Sedan)" },
                  { value: 6, label: "6+ Seats (MPV)" },
                  { value: 7, label: "7+ Seats (SUV)" },
                  { value: 8, label: "8+ Seats (Van)" },
                ].map((pill) => (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => setSeatCapacityFilter(pill.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      seatCapacityFilter === pill.value
                        ? "bg-[#5B3DF5] text-white shadow-xs"
                        : "bg-[#F7F7FB] text-[#686875] hover:text-[#17171D] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB]"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Trip Distance (km) Live Fare Preview */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <label className="text-xs font-bold text-[#686875] whitespace-nowrap">
                  Est. Trip Distance:
                </label>
                <div className="relative w-32">
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={distanceEstimate}
                    onChange={(e) => setDistanceEstimate(e.target.value)}
                    className="w-full px-3 py-1.5 pr-8 bg-[#F7F7FB] border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#17171D] focus:outline-none focus:border-[#5B3DF5]"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#686875]">
                    km
                  </span>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-extrabold text-[#17171D]">
                Available Public Vehicles {seatCapacityFilter > 0 ? `(${seatCapacityFilter}+ Seats)` : "Across All Fleets"}
              </h2>
              <span className="text-xs font-semibold text-[#686875]">
                {packages.length} option(s) found
              </span>
            </div>

            {/* Loading / Empty / Vehicle Cards Grid */}
            {packagesLoading ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center shadow-xs">
                <div className="w-8 h-8 border-3 border-[#5B3DF5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-[#17171D]">Searching available fleet vehicles & live rates...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center shadow-xs max-w-xl mx-auto">
                <div className="text-4xl mb-3">🚗💨</div>
                <h3 className="text-lg font-bold text-[#17171D]">No Vehicles Available for This Filter</h3>
                <p className="text-sm text-[#686875] mt-1 mb-6">
                  {seatCapacityFilter > 0
                    ? `No active fleet currently offers ${seatCapacityFilter}-seater public Per-KM packages.`
                    : "No fleets currently have active Public Booking Per-KM packages configured."}
                </p>
                {seatCapacityFilter > 0 && (
                  <button
                    type="button"
                    onClick={() => setSeatCapacityFilter(0)}
                    className="px-6 py-2.5 bg-[#5B3DF5] text-white font-bold text-sm rounded-xl hover:bg-[#4326C6]"
                  >
                    View All Vehicles
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => {
                  const dist = parseFloat(distanceEstimate) || 0;
                  const cardEstFare = dist > 0 ? Math.round(dist * pkg.amountPerKm * 100) / 100 : null;

                  return (
                    <div
                      key={pkg.packageDataId + (pkg.vehicleMasterId || pkg.vehicleId || pkg.vehicleModelName)}
                      className="bg-white border border-[#E5E7EB] hover:border-[#5B3DF5] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Vehicle Image Header */}
                        <div className="h-44 bg-[#F7F7FB] relative flex items-center justify-center p-4 border-b border-[#E5E7EB]/60">
                          <img
                            src={resolveImageUrl(pkg.vehicleImg)}
                            alt={pkg.vehicleModelName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/default_car.svg";
                            }}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                          />
                          {/* READ-ONLY AUTHORITATIVE SEAT CAPACITY BADGE */}
                          <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-black bg-white/95 backdrop-blur-sm text-[#17171D] rounded-lg border border-[#E5E7EB] shadow-xs">
                            {pkg.seatCapacity} Seats
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          {/* Fleet & Company separated badges */}
                          <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                              <img
                                src={pkg.fleetLogo}
                                alt={pkg.fleetName}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                                className="w-3.5 h-3.5 object-contain rounded"
                              />
                              <span className="truncate max-w-[130px]">{pkg.fleetName}</span>
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[130px]">
                              {pkg.companyName}
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold text-[#17171D] group-hover:text-[#5B3DF5] transition-colors leading-snug">
                            {pkg.vehicleModelName}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 mb-3">
                            <span className="text-xs font-semibold text-[#5B3DF5] bg-[#5B3DF5]/10 px-2 py-0.5 rounded">
                              {pkg.vehicleType}
                            </span>
                            {pkg.vehicleNumber && (
                              <span className="text-xs font-mono font-medium text-[#686875]">
                                {pkg.vehicleNumber}
                              </span>
                            )}
                          </div>

                          {/* Rate & Optional Calculated Fare */}
                          <div className="bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl p-3.5 space-y-2 mb-3">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs text-[#686875] font-semibold">Per-KM Rate</span>
                              <div className="text-2xl font-black text-[#5B3DF5] tracking-tight">
                                ₹{pkg.amountPerKm}
                                <span className="text-xs font-bold text-[#686875]"> / km</span>
                              </div>
                            </div>

                            {cardEstFare && (
                              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#686875]">
                                  Est. Fare ({dist} km):
                                </span>
                                <span className="text-sm font-extrabold text-emerald-700">
                                  ₹{cardEstFare.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-[#686875] line-clamp-2">{pkg.description}</p>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <button
                          type="button"
                          onClick={() => handleSelectVehicle(pkg)}
                          className="w-full py-3 bg-[#17171D] hover:bg-[#5B3DF5] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group-hover:shadow"
                        >
                          <span>Select Vehicle</span>
                          <span>&rarr;</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: PASSENGER & BOOKING FORM ================= */}
        {step === 3 && selectedPackage && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-sm">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E5E7EB]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17171D]">Trip & Passenger Details</h2>
                  <p className="text-sm text-[#686875] mt-0.5">
                    Complete your booking with {selectedPackage.fleetName}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-[#5B3DF5] hover:underline"
                >
                  &larr; Choose Different Vehicle
                </button>
              </div>

              {/* Selected Vehicle Snapshot */}
              <div className="bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={resolveImageUrl(selectedPackage.vehicleImg)}
                    alt={selectedPackage.vehicleModelName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/default_car.svg";
                    }}
                    className="w-16 h-12 object-contain bg-white rounded-lg border border-[#E5E7EB] p-1 drop-shadow-xs"
                  />
                  <div>
                    <div className="text-sm font-extrabold text-[#17171D]">
                      {selectedPackage.vehicleModelName}
                    </div>
                    <div className="text-xs text-[#686875]">
                      {selectedPackage.fleetName} &bull; Max {selectedPackage.seatCapacity} Seats
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#686875]">Agreed Rate</div>
                  <div className="text-xl font-black text-[#5B3DF5]">
                    ₹{selectedPackage.amountPerKm} <span className="text-xs font-bold text-[#686875]">/ km</span>
                  </div>
                  {calculatedEstimatedFare > 0 && (
                    <div className="text-xs font-bold text-emerald-700 mt-0.5">
                      Est. Total: ₹{calculatedEstimatedFare.toLocaleString()} ({distanceEstimate} km)
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmitBooking} noValidate className="space-y-5">
                {/* Passenger Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Passenger Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        clearFieldError("customerName");
                      }}
                      placeholder="e.g. Ramesh Kumar"
                      className={`w-full px-4 py-3 bg-[#F7F7FB] border rounded-xl text-sm font-medium text-[#17171D] focus:outline-none transition-all ${
                        fieldErrors.customerName
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-[#E5E7EB] focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20"
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.customerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Email Address <span className="text-[11px] font-normal text-[#686875] lowercase">(optional — for trip invoice)</span>
                    </label>
                    <input
                      id="input-customerEmail"
                      type="text"
                      inputMode="email"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        clearFieldError("customerEmail");
                      }}
                      placeholder="e.g. ramesh@example.com (optional)"
                      className={`w-full px-4 py-3 bg-[#F7F7FB] border rounded-xl text-sm font-medium text-[#17171D] focus:outline-none transition-all ${
                        fieldErrors.customerEmail
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-[#E5E7EB] focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20"
                      }`}
                    />
                    {fieldErrors.customerEmail && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.customerEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Verified Mobile Number (Locked / Read-Only with verified badge) */}
                <div className="p-4 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider">
                      Verified Contact Number
                    </label>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span>✓</span> Verified by OTP
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold text-[#17171D]">
                    +91 {phone}
                  </div>
                </div>

                {/* Pickup & Drop Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-pickupPoint"
                      type="text"
                      value={pickupPoint}
                      onChange={(e) => {
                        setPickupPoint(e.target.value);
                        clearFieldError("pickupPoint");
                      }}
                      placeholder="e.g. T. Nagar, Chennai"
                      className={`w-full px-4 py-3 bg-[#F7F7FB] border rounded-xl text-sm font-medium text-[#17171D] focus:outline-none transition-all ${
                        fieldErrors.pickupPoint
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-[#E5E7EB] focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20"
                      }`}
                    />
                    {fieldErrors.pickupPoint && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.pickupPoint}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Drop Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-dropPoint"
                      type="text"
                      value={dropPoint}
                      onChange={(e) => {
                        setDropPoint(e.target.value);
                        clearFieldError("dropPoint");
                      }}
                      placeholder="e.g. Chennai International Airport (MAA)"
                      className={`w-full px-4 py-3 bg-[#F7F7FB] border rounded-xl text-sm font-medium text-[#17171D] focus:outline-none transition-all ${
                        fieldErrors.dropPoint
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-[#E5E7EB] focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20"
                      }`}
                    />
                    {fieldErrors.dropPoint && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.dropPoint}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date, Time & Passenger Count */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-pickupDate"
                      type="date"
                      value={pickupDate}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        clearFieldError("pickupDate");
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full px-4 py-3 bg-[#F7F7FB] border rounded-xl text-sm font-medium text-[#17171D] focus:outline-none transition-all ${
                        fieldErrors.pickupDate
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-[#E5E7EB] focus:border-[#5B3DF5]"
                      }`}
                    />
                    {fieldErrors.pickupDate && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.pickupDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Pickup Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-pickupTime"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => {
                        setPickupTime(e.target.value);
                        clearFieldError("pickupTime");
                      }}
                      className={`w-full px-4 py-3 bg-[#F7F7FB] border rounded-xl text-sm font-medium text-[#17171D] focus:outline-none transition-all ${
                        fieldErrors.pickupTime
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-[#E5E7EB] focus:border-[#5B3DF5]"
                      }`}
                    />
                    {fieldErrors.pickupTime && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.pickupTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Passengers (Max {selectedPackage.seatCapacity})
                    </label>
                    <input
                      id="input-passengerCount"
                      type="number"
                      min={1}
                      max={selectedPackage.seatCapacity}
                      value={passengerCount}
                      onChange={(e) => {
                        setPassengerCount(parseInt(e.target.value) || 1);
                        clearFieldError("passengerCount");
                      }}
                      className={`w-full px-4 py-3 bg-[#F7F7FB] border rounded-xl text-sm font-medium text-[#17171D] focus:outline-none transition-all ${
                        fieldErrors.passengerCount
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-[#E5E7EB] focus:border-[#5B3DF5]"
                      }`}
                    />
                    {fieldErrors.passengerCount && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {fieldErrors.passengerCount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                    Luggage / Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 2 large bags, require child seat"
                    className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#17171D] focus:outline-none focus:border-[#5B3DF5]"
                  />
                </div>

                {/* In-view Inline Error Alert right above Submit Button */}
                {alert && alert.type === "error" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
                    <span className="text-base flex-shrink-0">⚠️</span>
                    <div className="flex-1">
                      <div className="font-bold text-red-900 mb-0.5">Please check the form inputs:</div>
                      <div>{alert.message}</div>
                    </div>
                  </div>
                )}

                {/* Submit Bar */}
                <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#686875] text-center sm:text-left">
                    Your ride enters <span className="font-bold text-[#17171D]">{selectedPackage.fleetName}</span>&apos;s pending dispatch queue.
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !otpVerified}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#5B3DF5] hover:bg-[#4326C6] text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirming Booking...</span>
                      </>
                    ) : (
                      <span>Confirm & Book Ride &rarr;</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= STEP 4: SUCCESS CONFIRMATION ================= */}
        {step === 4 && bookingSuccess && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-12 shadow-sm max-w-xl mx-auto text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl font-black mb-4">
              ✓
            </div>

            <h2 className="text-2xl font-black text-[#17171D]">Ride Request Placed!</h2>
            <p className="text-sm text-[#686875] mt-1 mb-6">
              Your ride request has been dispatched to {bookingSuccess.fleetName || "the fleet operator"}.
            </p>

            <div className="bg-[#F7F7FB] border border-[#E5E7EB] rounded-2xl p-6 text-left space-y-3 mb-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold text-[#686875] uppercase tracking-wider">
                  Booking Reference
                </span>
                <span className="text-sm font-mono font-black text-[#5B3DF5]">
                  {bookingSuccess.bookingCode}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Passenger</span>
                <span className="text-xs font-bold text-[#17171D]">{customerName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Phone</span>
                <span className="text-xs font-bold text-[#17171D]">+91 {phone}</span>
              </div>

              {customerEmail.trim() && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#686875]">Email</span>
                  <span className="text-xs font-bold text-[#17171D]">{customerEmail.trim()}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Fleet / Company</span>
                <span className="text-xs font-bold text-[#17171D]">
                  {bookingSuccess.fleetName || selectedPackage?.fleetName} — {bookingSuccess.companyName || selectedPackage?.companyName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Vehicle</span>
                <span className="text-xs font-bold text-[#17171D]">
                  {selectedPackage?.vehicleModelName} ({selectedPackage?.seatCapacity} Seats)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Pickup Route</span>
                <span className="text-xs font-bold text-[#17171D] text-right truncate max-w-[260px]">
                  {pickupPoint} &rarr; {dropPoint}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Schedule</span>
                <span className="text-xs font-bold text-[#17171D]">
                  {pickupDate} at {pickupTime}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Agreed Rate</span>
                <span className="text-xs font-bold text-[#17171D]">
                  ₹{bookingSuccess.agreedRate} / km
                </span>
              </div>

              {bookingSuccess.estimatedFare && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#686875]">Estimated Fare</span>
                  <span className="text-xs font-bold text-emerald-700">
                    ₹{bookingSuccess.estimatedFare.toLocaleString()} ({bookingSuccess.estimatedDistance} km)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Status</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Pending Fleet Confirmation
                </span>
              </div>
            </div>

            <p className="text-xs text-[#686875] mb-6">
              The fleet dispatch team has received your order in their Confirm Pending queue.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpSent(false);
                  setOtp("");
                  setOtpVerified(false);
                  setSelectedPackage(null);
                  setBookingSuccess(null);
                }}
                className="px-6 py-3 bg-[#5B3DF5] hover:bg-[#4326C6] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Book Another Cab
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-white border border-[#E5E7EB] hover:bg-[#F7F7FB] text-[#17171D] font-bold text-xs rounded-xl transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
