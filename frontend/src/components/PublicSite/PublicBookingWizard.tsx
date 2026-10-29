import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import axios from "axios";

// Environment backend URL
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

interface PackageCard {
  packageDataId: string;
  packageName: string;
  packageType: string;
  amountPerKm: number;
  currency: string;
  fleetName: string;
  fleetSlug: string;
  fleetLogo: string;
  companyId: string;
  companyName: string;
  tenantId: string;
  seatCapacity: number;
  vehicleTypeId: string;
  vehicleType: string;
  vehicleModelName: string;
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

  // Wizard Step: 1 = Phone & OTP, 2 = Seat Capacity, 3 = Select Package, 4 = Customer Details & Book, 5 = Success
  const [step, setStep] = useState<number>(1);

  // Step 1: Phone & OTP State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  // Step 2: Seat Capacity
  const [seatCapacity, setSeatCapacity] = useState<number>(4);

  // Step 3: Packages
  const [packages, setPackages] = useState<PackageCard[]>([]);
  const [fleetInfo, setFleetInfo] = useState<FleetDetails | null>(null);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageCard | null>(null);

  // Step 4: Customer Details Form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [dropPoint, setDropPoint] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Step 5: Success Result
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Notification / Alert
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showAlert = (type: "success" | "error" | "info", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 8000);
  };

  // Helper to load packages
  const loadPackages = async (seats: number) => {
    setPackagesLoading(true);
    setAlert(null);
    try {
      const url = `${API_BASE}/api/public/booking/packages`;
      const res = await axios.get(url, {
        params: {
          seatCapacity: seats,
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
      console.error("Error loading packages:", err);
      showAlert("error", err.response?.data?.message || "Failed to load eligible packages for selected capacity.");
      setPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  };

  // Step 1: Send OTP
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
      const res = await axios.post(`${API_BASE}/api/public/booking/send-otp`, { phone: cleanPhone });
      if (res.data && res.data.success) {
        setSessionId(res.data.sessionId);
        setOtpSent(true);
        if (res.data.mockOtp) {
          setMockOtpHint(res.data.mockOtp);
          setOtp(res.data.mockOtp); // Auto-fill in dev/mock for instant convenience
          showAlert("info", `Verification code sent! (Mock Mode OTP: ${res.data.mockOtp})`);
        } else {
          showAlert("success", "OTP sent successfully to your mobile number.");
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

  // Step 1: Verify OTP
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
      });

      if (res.data && res.data.success) {
        setVerificationToken(res.data.verificationToken);
        setOtpVerified(true);
        showAlert("success", "Phone number verified successfully!");
        // Move automatically to Step 2
        setStep(2);
      } else {
        showAlert("error", res.data?.message || "Invalid verification code.");
      }
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2 -> Step 3: Capacity Chosen
  const handleSelectCapacity = (seats: number) => {
    setSeatCapacity(seats);
    setStep(3);
    loadPackages(seats);
  };

  // Step 3 -> Step 4: Package Chosen
  const handleChoosePackage = (pkg: PackageCard) => {
    setSelectedPackage(pkg);
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 4: Submit Final Booking
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || customerName.trim().length < 2) {
      showAlert("error", "Please provide your full name (minimum 2 characters).");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!customerEmail.trim() || !emailRegex.test(customerEmail.trim())) {
      showAlert("error", "Please provide a valid email address for booking updates.");
      return;
    }

    if (!pickupPoint.trim()) {
      showAlert("error", "Please enter a pickup location.");
      return;
    }

    if (!dropPoint.trim()) {
      showAlert("error", "Please enter a drop location.");
      return;
    }

    if (!selectedPackage) {
      showAlert("error", "No package selected. Please return to Step 3.");
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        phone: phone.trim().replace(/\D/g, ""),
        verificationToken,
        pickupPoint: pickupPoint.trim(),
        dropPoint: dropPoint.trim(),
        packageDataId: selectedPackage.packageDataId,
        pickupDate: pickupDate || new Date().toISOString().split("T")[0],
        pickupTime: pickupTime || undefined,
        travellersCount: seatCapacity,
        notes: notes.trim() || undefined,
      };

      const res = await axios.post(`${API_BASE}/api/public/booking/create`, payload);

      if (res.data && res.data.success) {
        setBookingSuccess(res.data);
        setStep(5);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showAlert("error", res.data?.message || "Booking failed to complete.");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      showAlert("error", err.response?.data?.message || "Failed to confirm booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Fleet / Platform Branded Banner */}
        <div className="mb-8 text-center sm:text-left bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5B3DF5]/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
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
                    {slug && fleetInfo?.name ? `${fleetInfo.name} Rides` : "Book a Cab Online"}
                  </h1>
                  {slug && (
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-[#5B3DF5]/10 text-[#5B3DF5] rounded-full border border-[#5B3DF5]/20">
                      Fleet Direct
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#686875] mt-1">
                  {slug && fleetInfo?.name
                    ? `Official booking portal for ${fleetInfo.name} — Powered by FleetFlow Platform`
                    : "Transparent Per-KM Commercial Cabs — Instant Fleet Dispatch"}
                </p>
              </div>
            </div>

            {/* Quick Step Indicator */}
            {step < 5 && (
              <div className="flex items-center gap-2 bg-[#F7F7FB] px-4 py-2 rounded-xl border border-[#E5E7EB]">
                <span className="text-xs font-bold text-[#686875] uppercase tracking-wider">Step</span>
                <span className="text-sm font-extrabold text-[#5B3DF5]">{step} of 4</span>
              </div>
            )}
          </div>

          {/* Stepper Dots */}
          {step < 5 && (
            <div className="grid grid-cols-4 gap-2 mt-6 pt-6 border-t border-[#E5E7EB]/60 text-center">
              {[
                { s: 1, label: "1. Phone OTP" },
                { s: 2, label: "2. Seats" },
                { s: 3, label: "3. Package" },
                { s: 4, label: "4. Details" },
              ].map((item) => (
                <div key={item.s} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all ${
                      step >= item.s ? "bg-[#5B3DF5]" : "bg-[#E5E7EB]"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold ${
                      step >= item.s ? "text-[#5B3DF5]" : "text-[#686875]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
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

        {/* ================= STEP 1: PHONE & OTP ================= */}
        {step === 1 && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-sm max-w-xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#5B3DF5]/10 text-[#5B3DF5] rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
                📱
              </div>
              <h2 className="text-xl font-extrabold text-[#17171D]">Verify Mobile Number</h2>
              <p className="text-sm text-[#686875] mt-1">
                We protect your booking against unauthorized spam. Enter your 10-digit mobile number to verify.
              </p>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#686875]">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-14 pr-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-base font-medium text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all tracking-wider"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || phone.length < 10}
                  className="w-full py-3.5 bg-[#5B3DF5] hover:bg-[#4326C6] text-white font-bold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <span>Send Verification OTP</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-[#F7F7FB] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-[#686875]">Sending to: </span>
                    <span className="font-bold text-[#17171D]">+91 {phone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="text-xs font-bold text-[#5B3DF5] hover:underline"
                  >
                    Change Number
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                    Enter 6-Digit OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-center text-xl font-bold tracking-[0.5em] text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all"
                    required
                  />
                  {mockOtpHint && (
                    <p className="text-xs text-[#686875] mt-1.5 text-center">
                      Mock code auto-detected: <span className="font-mono font-bold text-[#5B3DF5]">{mockOtpHint}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full py-3.5 bg-[#5B3DF5] hover:bg-[#4326C6] text-white font-bold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <span>Verify & Continue</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="text-xs font-semibold text-[#686875] hover:text-[#5B3DF5]"
                  >
                    Didn't receive code? Resend OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= STEP 2: REQUIRED SEAT CAPACITY ================= */}
        {step === 2 && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-sm max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-[#5B3DF5]/10 text-[#5B3DF5] rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
                👥
              </div>
              <h2 className="text-xl font-extrabold text-[#17171D]">How many seats do you need?</h2>
              <p className="text-sm text-[#686875] mt-1">
                Select your passenger count. We will show vehicles configured to accommodate your party comfortably.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { seats: 4, title: "4 Seater", subtitle: "Sedan / Hatchback", icon: "🚗" },
                { seats: 6, title: "6 Seater", subtitle: "Comfort MPV", icon: "🚙" },
                { seats: 7, title: "7 Seater", subtitle: "SUV / Innova", icon: "🚐" },
                { seats: 12, title: "12+ Seater", subtitle: "Tempo Traveller", icon: "🚌" },
              ].map((opt) => (
                <button
                  key={opt.seats}
                  type="button"
                  onClick={() => handleSelectCapacity(opt.seats)}
                  className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-3 group hover:border-[#5B3DF5] hover:shadow-md ${
                    seatCapacity === opt.seats
                      ? "border-[#5B3DF5] bg-[#5B3DF5]/5 ring-2 ring-[#5B3DF5]/20"
                      : "border-[#E5E7EB] bg-[#F7F7FB]"
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <div className="text-base font-extrabold text-[#17171D] group-hover:text-[#5B3DF5]">
                      {opt.title}
                    </div>
                    <div className="text-xs text-[#686875] mt-0.5">{opt.subtitle}</div>
                  </div>
                  <span className="text-xs font-bold text-[#5B3DF5] opacity-0 group-hover:opacity-100 transition-opacity">
                    Select &rarr;
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#686875] hover:text-[#17171D]"
              >
                &larr; Back to Phone Verification
              </button>
              <div className="text-xs text-[#686875]">
                Verified mobile: <span className="font-bold text-[#17171D]">+91 {phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PACKAGE CARDS ================= */}
        {step === 3 && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#17171D]">
                  Available {seatCapacity}+ Seater Packages
                </h2>
                <p className="text-sm text-[#686875]">
                  {packages.length} eligible option(s) found. Transparent per-kilometre billing with verified fleet operators.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#17171D] bg-white border border-[#E5E7EB] rounded-xl hover:border-[#17171D]"
                >
                  Change Capacity ({seatCapacity} Seats)
                </button>
              </div>
            </div>

            {packagesLoading ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center shadow-sm">
                <div className="w-8 h-8 border-3 border-[#5B3DF5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-[#17171D]">Loading available vehicles & rates...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto">
                <div className="text-4xl mb-3">🚗💨</div>
                <h3 className="text-lg font-bold text-[#17171D]">No Packages Available for {seatCapacity} Seats</h3>
                <p className="text-sm text-[#686875] mt-1 mb-6">
                  {slug
                    ? `This fleet currently has no active Per-KM packages configured for ${seatCapacity} seats.`
                    : `No active fleets currently offer ${seatCapacity}-seater public Per-KM packages.`}
                </p>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-[#5B3DF5] text-white font-bold text-sm rounded-xl hover:bg-[#4326C6]"
                >
                  Choose Different Seat Capacity
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.packageDataId}
                    className="bg-white border border-[#E5E7EB] hover:border-[#5B3DF5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Vehicle Image Header */}
                      <div className="h-44 bg-[#F7F7FB] relative flex items-center justify-center p-4 border-b border-[#E5E7EB]/60">
                        <img
                          src={pkg.vehicleImg}
                          alt={pkg.vehicleModelName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/default_car.png";
                          }}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-black bg-white/95 backdrop-blur-sm text-[#17171D] rounded-lg border border-[#E5E7EB] shadow-xs">
                          {pkg.seatCapacity} Seats
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Fleet / Company attribution */}
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={pkg.fleetLogo}
                            alt={pkg.fleetName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                            className="w-5 h-5 object-contain rounded"
                          />
                          <span className="text-xs font-bold text-[#686875] truncate">
                            {pkg.fleetName} &bull; {pkg.companyName}
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-[#17171D] group-hover:text-[#5B3DF5] transition-colors leading-snug">
                          {pkg.vehicleModelName}
                        </h3>
                        <p className="text-xs font-semibold text-[#686875] mt-0.5 mb-4">
                          {pkg.packageName} ({pkg.vehicleType})
                        </p>

                        <div className="bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl p-3 flex items-baseline justify-between mb-3">
                          <div>
                            <span className="text-xs text-[#686875] font-semibold">Rate</span>
                            <div className="text-2xl font-black text-[#5B3DF5] tracking-tight">
                              ₹{pkg.amountPerKm}
                              <span className="text-xs font-bold text-[#686875]"> / km</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            Per-KM Base
                          </span>
                        </div>

                        <p className="text-xs text-[#686875] line-clamp-2">{pkg.description}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        type="button"
                        onClick={() => handleChoosePackage(pkg)}
                        className="w-full py-3 bg-[#17171D] hover:bg-[#5B3DF5] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group-hover:shadow"
                      >
                        <span>Select Ride</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: CUSTOMER DETAILS FORM ================= */}
        {step === 4 && selectedPackage && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-sm">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E5E7EB]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17171D]">Trip & Passenger Details</h2>
                  <p className="text-sm text-[#686875] mt-0.5">
                    Review your chosen vehicle and specify pickup & drop coordinates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-bold text-[#5B3DF5] hover:underline"
                >
                  Change Package
                </button>
              </div>

              {/* Selected Package Snapshot Summary Card */}
              <div className="bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPackage.vehicleImg}
                    alt={selectedPackage.vehicleModelName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/default_car.png";
                    }}
                    className="w-16 h-12 object-contain bg-white rounded-lg border border-[#E5E7EB] p-1"
                  />
                  <div>
                    <div className="text-sm font-extrabold text-[#17171D]">
                      {selectedPackage.vehicleModelName}
                    </div>
                    <div className="text-xs text-[#686875]">
                      {selectedPackage.fleetName} &bull; {selectedPackage.seatCapacity} Seats
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#686875]">Agreed Rate Snapshot</div>
                  <div className="text-xl font-black text-[#5B3DF5]">
                    ₹{selectedPackage.amountPerKm} <span className="text-xs font-bold text-[#686875]">/ km</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitBooking} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all"
                      required
                    />
                  </div>

                  {/* Customer Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Verified Mobile Number (read-only) */}
                <div>
                  <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                    Verified Mobile Number
                  </label>
                  <div className="flex items-center justify-between px-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                    <span className="text-sm font-bold text-emerald-950 font-mono">+91 {phone}</span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <span>✓</span> {otpVerified ? 'Verified by OTP' : 'Verified'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pickup Point */}
                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pickupPoint}
                      onChange={(e) => setPickupPoint(e.target.value)}
                      placeholder="e.g. T. Nagar, Chennai"
                      className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all"
                      required
                    />
                  </div>

                  {/* Drop Point */}
                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Drop Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dropPoint}
                      onChange={(e) => setDropPoint(e.target.value)}
                      placeholder="e.g. Chennai International Airport (MAA)"
                      className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pickup Date */}
                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all"
                    />
                  </div>

                  {/* Pickup Time */}
                  <div>
                    <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#17171D] uppercase tracking-wider mb-2">
                    Special Instructions / Luggage Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 2 large suitcases, flight arriving at Terminal 2"
                    className="w-full px-4 py-3 bg-[#F7F7FB] border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#17171D] focus:outline-none focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-[#E5E7EB]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#686875] text-center sm:text-left">
                    By clicking Confirm, your ride is dispatched directly to{" "}
                    <span className="font-bold text-[#17171D]">{selectedPackage.fleetName}</span>.
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
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

        {/* ================= STEP 5: SUCCESS CONFIRMATION ================= */}
        {step === 5 && bookingSuccess && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-12 shadow-sm max-w-xl mx-auto text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl font-black mb-4">
              ✓
            </div>

            <h2 className="text-2xl font-black text-[#17171D]">Ride Request Placed!</h2>
            <p className="text-sm text-[#686875] mt-1 mb-6">
              Your ride has been registered with {bookingSuccess.fleetName || "the fleet operator"}.
            </p>

            <div className="bg-[#F7F7FB] border border-[#E5E7EB] rounded-2xl p-6 text-left space-y-3 mb-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs text-[#686875] font-bold uppercase tracking-wider">Booking ID</span>
                <span className="text-lg font-mono font-black text-[#5B3DF5]">
                  {bookingSuccess.bookingCode}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Customer</span>
                <span className="text-xs font-bold text-[#17171D]">{customerName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Contact Phone</span>
                <span className="text-xs font-bold text-[#17171D]">+91 {phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Agreed Rate</span>
                <span className="text-xs font-bold text-[#5B3DF5]">
                  ₹{bookingSuccess.agreedRate} / km
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#686875]">Status</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Pending Fleet Confirmation
                </span>
              </div>
            </div>

            <p className="text-xs text-[#686875] mb-6">
              A confirmation email has been logged to <span className="font-semibold text-[#17171D]">{customerEmail}</span>. The fleet dispatch team will assign a vehicle and driver shortly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpSent(false);
                  setOtp("");
                  setSelectedPackage(null);
                  setBookingSuccess(null);
                }}
                className="px-6 py-2.5 bg-[#F7F7FB] border border-[#E5E7EB] hover:border-[#17171D] text-[#17171D] text-sm font-bold rounded-xl transition-all"
              >
                Book Another Ride
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2.5 bg-[#5B3DF5] hover:bg-[#4326C6] text-white text-sm font-bold rounded-xl transition-all"
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
