import express from 'express';
import {
  sendPublicBookingOtp,
  verifyPublicBookingOtp,
  getPublicPackages,
  createPublicBooking,
} from '../services/publicBookingServices';

const router = express.Router();

/**
 * Public Booking API Endpoints
 * All endpoints are unauthenticated / public customer entry points.
 * Tenant isolation and customer data safety are enforced at service level.
 */

// Step 1: Mobile verification
router.post('/send-otp', sendPublicBookingOtp);
router.post('/verify-otp', verifyPublicBookingOtp);

// Step 2 & 3: Filter eligible public packages by seat capacity
router.get('/packages', getPublicPackages);

// Step 4: Submit customer booking
router.post('/create', createPublicBooking);

export default router;
