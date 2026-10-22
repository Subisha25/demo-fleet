import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { useAuth } from '../../../context/AuthContext';
import SimpleHeader from '../../../components/Homepage/simpleheader';
import Footer from '../../../components/Homepage/Footer';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});
  const [showForgetModal, setShowForgetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [forgetError, setForgetError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
const [step, setStep] = useState(1);
const [otp, setOtp] = useState('');

  // ----- Login Validation -----
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';

    if (!password.trim()) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axiosInstance.post('/auth/emplogin', { email, password });
      const { accessToken, role, id, companyId, name } = res.data;

      if (accessToken) {
        // ✅ Store individual items
        localStorage.setItem('token', accessToken);
        localStorage.setItem('role', role);
        localStorage.setItem('userId', id);
        localStorage.setItem('username', name);
        localStorage.setItem('companyId', companyId);

        // ✅ CRITICAL FIX: Store complete user object
        const userObject = {
          userId: id,
          username: name,
          email: email,
          role: role,
          companyId: companyId,
          token: accessToken
        };
        localStorage.setItem('user', JSON.stringify(userObject));

        console.log('✅ User object stored:', userObject);

        login();

        // Navigate based on role
        if (role === "superadmin") {
          navigate('/dashboard');
        } 
        else if (role === "admin") {
          navigate('/dashboard');
        }
        else if (role === "manager") {
          navigate(`/users/useraccount/${id}`);
        } 
        else if (role === "user") {
          navigate(`/users/useraccount/${id}`);
        }
      } else {
        setErrors({ server: 'Login failed. Please try again.' });
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Login failed. Please check credentials.';
      setErrors((prev) => ({ ...prev, server: errorMsg }));
    }
  };

  // ----- Forget Password Handler -----
// Step 1: Send OTP
const handleSendOtp = async () => {
  if (!email.trim()) {
    setForgetError('Email is required');
    return;
  }

  try {
    const res = await axiosInstance.post('/auth/forgetPasswordSendOtp', { email });
    setForgetError(null);
    setSuccessMsg('OTP sent to your email.');
    setStep(2);
  } catch (err: any) {
    setForgetError(err?.response?.data?.message || 'Error sending OTP');
  }
};

// Step 2: Verify OTP
const handleVerifyOtp = async () => {
  try {
    const res = await axiosInstance.post('/auth/verifyOtpPassword', { email, otp });
    if (res.data.success) {
      setSuccessMsg('OTP verified successfully.');
      setForgetError(null);
      setStep(3);
    } else {
      setForgetError(res.data.message || 'Invalid OTP');
    }
  } catch (err: any) {
    setForgetError(err?.response?.data?.message || 'Error verifying OTP');
  }
};

// Step 3: Update Password (already in your code but slightly tweaked)
const handleForgetPassword = async () => {
  if (!email.trim() || !newPassword.trim()) {
    setForgetError('All fields are required');
    return;
  }

  try {
    const res = await axiosInstance.put('/auth/forgetPassword', { email, password: newPassword });
    if (res.data.success) {
      setSuccessMsg('Password updated successfully. You can now login.');
      setTimeout(() => {
        setShowForgetModal(false);
        setStep(1);
        setEmail('');
        setNewPassword('');
        setOtp('');
      }, 2000);
    } else {
      setForgetError(res.data.message || 'Error updating password');
    }
  } catch (err: any) {
    setForgetError(err?.response?.data?.message || 'Error updating password');
  }
};


  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
     <SimpleHeader/>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card with subtle warm shadow */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#E0DAD1] overflow-hidden">
            {/* Charcoal & Terracotta Header */}
            <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] px-8 py-8 text-center">
              <div className="w-16 h-16 bg-[#C04E24]/20 border border-[#C04E24]/40 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="text-[#DE8A66]" size={30} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-[#EDE9E3] text-sm">Sign in to your enterprise fleet portal</p>
            </div>


            <form onSubmit={handleSubmit} className="px-8 py-8" noValidate>
              {errors.server && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{errors.server}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#1C1A18] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7570]" size={20} />
                  <input
                    type="email"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C04E24]/20 transition-all ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-[#E0DAD1] bg-white focus:border-[#C04E24]'
                    }`}
                    value={email}
                    placeholder='Enter your email'
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-2 ml-1">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1C1A18] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7570]" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C04E24]/20 transition-all ${
                      errors.password ? 'border-rose-400 bg-rose-50' : 'border-[#E0DAD1] bg-white focus:border-[#C04E24]'
                    }`}
                    value={password}
                    placeholder='Enter your password'
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7570] hover:text-[#C04E24] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-xs mt-2 ml-1">{errors.password}</p>}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-[#C04E24] hover:bg-[#A43D1A] text-white py-3.5 px-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                Sign In to Enterprise Fleet
              </button>

              {/* Forgot Password */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (!email.trim()) {
                      setErrors({ email: 'Email is required' });
                      return;
                    } else if (!/\S+@\S+\.\S+/.test(email)) {
                      setErrors({ email: 'Enter a valid email address' });
                      return;
                    }
                    setErrors({});
                    setShowForgetModal(true);
                  }}
                  className="text-sm text-[#C04E24] hover:text-[#A43D1A] font-semibold hover:underline transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </div>

          {/* Footer text */}
          <p className="text-center text-sm text-[#7A7570] mt-6">
            Protected by Grace Cabs industry-standard encryption
          </p>
        </div>
      </div>

      {/* Forget Password Modal */}
   {showForgetModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#E0DAD1] animate-in fade-in zoom-in duration-200">
      {/* Modal Header */}
      <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] px-6 py-6">
        <h3 className="text-xl font-bold text-white">Reset Your Password</h3>
        <p className="text-[#EDE9E3] text-xs mt-1">Follow the steps to reset your password securely</p>
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

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <label className="block text-sm font-semibold text-[#1C1A18] mb-2">Email Address</label>
            <div className="relative mb-6">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7570]" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-[#E0DAD1] rounded-lg focus:outline-none focus:border-[#C04E24] focus:ring-2 focus:ring-[#C04E24]/20"
                placeholder="your@email.com"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForgetModal(false)}
                className="flex-1 px-4 py-2.5 bg-[#EDE9E3] text-[#1C1A18] rounded-lg hover:bg-[#E0DAD1] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOtp}
                disabled={!email}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  !email
                    ? 'bg-[#EDE9E3] text-[#7A7570] cursor-not-allowed'
                    : 'bg-[#C04E24] hover:bg-[#A43D1A] text-white shadow hover:shadow-md'
                }`}
              >
                Send OTP
              </button>
            </div>
          </>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <>
            <label className="block text-sm font-semibold text-[#1C1A18] mb-2">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-6 pl-3 pr-4 py-2.5 border-2 border-[#E0DAD1] rounded-lg focus:outline-none focus:border-[#C04E24] focus:ring-2 focus:ring-[#C04E24]/20"
              placeholder="Enter 6-digit OTP"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2.5 bg-[#EDE9E3] text-[#1C1A18] rounded-lg hover:bg-[#E0DAD1] font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={!otp}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  !otp
                    ? 'bg-[#EDE9E3] text-[#7A7570] cursor-not-allowed'
                    : 'bg-[#C04E24] hover:bg-[#A43D1A] text-white shadow hover:shadow-md'
                }`}
              >
                Verify OTP
              </button>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <label className="block text-sm font-semibold text-[#1C1A18] mb-2">New Password</label>
            <div className="relative mb-6">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7570]" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 border-2 border-[#E0DAD1] rounded-lg focus:outline-none focus:border-[#C04E24] focus:ring-2 focus:ring-[#C04E24]/20"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7570] hover:text-[#C04E24]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2.5 bg-[#EDE9E3] text-[#1C1A18] rounded-lg hover:bg-[#E0DAD1] font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleForgetPassword}
                disabled={!newPassword}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  !newPassword
                    ? 'bg-[#EDE9E3] text-[#7A7570] cursor-not-allowed'
                    : 'bg-[#C04E24] hover:bg-[#A43D1A] text-white shadow hover:shadow-md'
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
   <Footer/>
    </div>
  );
};

export default Login;