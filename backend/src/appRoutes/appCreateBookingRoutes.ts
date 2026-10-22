import express from 'express';
import { createBooking } from '../appServices/appCreateBookingServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireActiveSubscription } from '../services/subscriptionLifecycleService';

const router = express.Router();

router.post('/createBooking', authMiddleware, requireActiveSubscription, createBooking);

export default router;