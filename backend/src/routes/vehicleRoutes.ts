import express from 'express';
import {
  getAllVehicles,
  getVehicleById,
  getAvailableVehicles,
  updateVehicle,
  updateVehicleStatus,
  getVehiclesByVehileTypeId,
  getAllVehiclesForWeb,
  softDeleteVehicle,
  restoreVehicle,
  deleteVehicle,
  getAssignedTrip,
  getVehiclesByVehicleType,
  getVehiclesByVehicleTypeForWeb,
  getPackagesByVehicleType,
  getVehicleModelsByTypeId,
  getCompletedTrip,
} from '../services/vehicleServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadVehicleImg } from '../middleware/uploadConfig';
import { requirePaidForModification } from '../middleware/entitlementMiddleware';

const router = express.Router();

// Protected routes (authentication required)
router.get('/getAllVehicles', authMiddleware, getAllVehicles);
router.get('/getAllVehiclesForWeb', authMiddleware, getAllVehiclesForWeb);
router.get('/getAvailableVehicle', authMiddleware, getAvailableVehicles);
router.get('/getAssignedTrip', authMiddleware, getAssignedTrip);
router.get('/getCompletedTrip', authMiddleware, getCompletedTrip);
router.get('/getPackagesByVehicleType', authMiddleware, getPackagesByVehicleType);
router.get('/vehicleType/:vehicleTypeId/vehicle-models', getVehicleModelsByTypeId);

router.get('/:vehicleId/getVehicleById', authMiddleware, getVehicleById);
router.get('/:vehicleId', authMiddleware, getVehicleById);

router.put('/:vehicleId/updateVehicle', authMiddleware, requirePaidForModification, uploadVehicleImg.array('vehicleImg', 5), updateVehicle);
router.put('/:vehicleId/updateVehicleStatus', authMiddleware, requirePaidForModification, updateVehicleStatus);
router.put('/:vehicleId/softDeleteVehicle', authMiddleware, requirePaidForModification, softDeleteVehicle);
router.put('/:vehicleId/restoreVehicle', authMiddleware, requirePaidForModification, restoreVehicle);
router.delete('/:vehicleId/deleteVehicle', authMiddleware, requirePaidForModification, deleteVehicle);
router.get('/:vehicleTypeId/getVehiclesByVehicleType', getVehiclesByVehicleType);
router.get('/:vehicleTypeId/getVehiclesByVehicleTypeForWeb', getVehiclesByVehicleTypeForWeb);

export default router;