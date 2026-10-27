import express from 'express';
import { uploadSignature } from '../middleware/uploadConfig';
import {
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  restoreDriver,
  getVehiclesForDriver,
  getBookingByVehicleAndDriver,
  acceptBooking,
  startBooking,
  endBooking,
  updateDriverLocation,
  getDriverLocation,
} from '../services/driverServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePaidForModification, requireActiveSubscriptionForBookings } from '../middleware/entitlementMiddleware';

const router = express.Router();

router.get('/getAllDrivers', authMiddleware, getAllDrivers);
router.get('/getDriverById/:driverId', authMiddleware, getDriverById);
router.put('/update/:driverId', authMiddleware, requirePaidForModification, updateDriver);
router.delete('/delete/:driverId', authMiddleware, requirePaidForModification, deleteDriver);
router.put('/restore/:driverId', authMiddleware, requirePaidForModification, restoreDriver);

router.get('/getVehiForDriver', authMiddleware, getVehiclesForDriver);
router.get('/getBookingByVehicleAndDriver', authMiddleware, getBookingByVehicleAndDriver);

router.put('/acceptBooking', authMiddleware, requireActiveSubscriptionForBookings, acceptBooking);
router.put('/startBooking', authMiddleware, requireActiveSubscriptionForBookings, startBooking);
router.put('/endBooking', authMiddleware, requireActiveSubscriptionForBookings, uploadSignature.single('signature'), endBooking);

router.put('/updateDriverLocation', authMiddleware, updateDriverLocation);
router.get('/getDriverLocation', authMiddleware, getDriverLocation);

export default router;