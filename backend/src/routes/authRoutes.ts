import express from 'express';
import {
  empRegister,
  empLogin,
  registerUser,
  userLogin,
  vendorLogin,
  ownerRegister,
  sendOTP,
  verifyOTPLogin,
  resendOTP,
  forgetPassword,
  forgetPasswordSendOtp,
  verifyOtpPassword,
  CompanyLogin,
  changePassword,
} from '../services/authServices';
import { fleetLoginBySlug } from '../services/tenantService';
import { requireUserQuota } from '../middleware/entitlementMiddleware';

const router = express.Router();

router.post('/empRegister', empRegister);
router.post('/empLogin', empLogin);
router.post('/login', empLogin);
router.post('/fleet-login/:slug', fleetLoginBySlug);
router.post('/createUser', requireUserQuota, registerUser);
router.post('/userLogin', userLogin);
router.post('/companyLogin', CompanyLogin);

router.post('/vendorLogin', vendorLogin);

// App OTP & recovery routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPLogin);
router.post('/resend-otp', resendOTP);

// Forgot Password Flow (CamelCase & Kebab-case REST Aliases)
router.post('/forgetPasswordSendOtp', forgetPasswordSendOtp);
router.post('/forgot-password/send-otp', forgetPasswordSendOtp);

router.post('/verifyOtpPassword', verifyOtpPassword);
router.post('/forgot-password/verify-otp', verifyOtpPassword);

router.put('/forgetPassword', forgetPassword);
router.post('/forgetPassword', forgetPassword);
router.put('/forgot-password/reset', forgetPassword);
router.post('/forgot-password/reset', forgetPassword);

router.put('/changePassword', changePassword);

export default router;
