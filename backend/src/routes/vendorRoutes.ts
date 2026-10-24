import express from 'express';


import {getAllVendors,getVendorById,updateVendor,deleteVendor,createVehicle,createDriver,confirmBooking,confirmBookingforWeb,
    createVehicleType,createVehicleMaster,updateBookingVehicleDriver} from '../services/vendorServices';

import { authMiddleware } from '../middleware/authMiddleware';
import { uploadVehicleImg } from "../middleware/uploadConfig";


const router = express.Router();

// Protected routes (authentication required)

import { requireVehicleQuota, requireDriverQuota } from '../middleware/entitlementMiddleware';

router.get('/getAllVendors',authMiddleware, getAllVendors);
router.get('/:vendorId',authMiddleware, getVendorById);
router.put('/:vendorId/update',authMiddleware,updateVendor);
router.delete('/:vendorId/delete',authMiddleware,deleteVendor)

router.post('/createVehicleType', authMiddleware, uploadVehicleImg.array("vehicleImg", 5), createVehicleType);
router.post('/createVehicle', authMiddleware, requireVehicleQuota, uploadVehicleImg.array("vehicleImg", 5), createVehicle);
router.post('/createVehicleMaster', authMiddleware, requireVehicleQuota, createVehicleMaster);
router.post('/createDriver', authMiddleware, requireDriverQuota, createDriver);

router.patch('/confirmBooking',authMiddleware, confirmBooking);
router.patch('/confirmBookingforWeb',authMiddleware, confirmBookingforWeb);
router.patch("/updateBookingVehicleDriver", authMiddleware, updateBookingVehicleDriver);

export default router;