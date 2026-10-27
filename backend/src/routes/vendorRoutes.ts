import express from 'express';


import {getAllVendors,getVendorById,updateVendor,deleteVendor,createVehicle,createDriver,confirmBooking,confirmBookingforWeb,
    createVehicleType,createVehicleMaster,updateBookingVehicleDriver} from '../services/vendorServices';

import { authMiddleware } from '../middleware/authMiddleware';
import { uploadVehicleImg } from "../middleware/uploadConfig";


const router = express.Router();

// Protected routes (authentication required)

import { requireVehicleQuota, requireDriverQuota, requirePaidForModification, requireActiveSubscriptionForBookings } from '../middleware/entitlementMiddleware';

router.get('/getAllVendors',authMiddleware, getAllVendors);
router.get('/:vendorId',authMiddleware, getVendorById);
router.put('/:vendorId/update',authMiddleware, requirePaidForModification, updateVendor);
router.delete('/:vendorId/delete',authMiddleware, requirePaidForModification, deleteVendor);

import { createUnifiedVehicle, getUnifiedVehicleOptions } from '../services/vehicleMasterServices';

router.post('/createVehicleType', authMiddleware, requirePaidForModification, uploadVehicleImg.array("vehicleImg", 5), createVehicleType);
router.post('/createVehicle', authMiddleware, requireVehicleQuota, uploadVehicleImg.array("vehicleImg", 5), createVehicle);
router.post('/createVehicleMaster', authMiddleware, requireVehicleQuota, createVehicleMaster);
router.post('/createUnifiedVehicle', authMiddleware, requireVehicleQuota, uploadVehicleImg.array("vehicleImg", 5), createUnifiedVehicle);
router.get('/unifiedVehicleOptions', authMiddleware, getUnifiedVehicleOptions);
router.post('/createDriver', authMiddleware, requireDriverQuota, createDriver);

router.patch('/confirmBooking',authMiddleware, requireActiveSubscriptionForBookings, confirmBooking);
router.patch('/confirmBookingforWeb',authMiddleware, requireActiveSubscriptionForBookings, confirmBookingforWeb);
router.patch("/updateBookingVehicleDriver", authMiddleware, requireActiveSubscriptionForBookings, updateBookingVehicleDriver);

export default router;