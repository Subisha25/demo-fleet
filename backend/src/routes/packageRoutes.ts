import express from 'express';
import { createPackage,getvehicleTypesByPackageId, getPackageByCompanyAndType } from '../services/packageServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePackageQuota } from '../middleware/entitlementMiddleware';
const router = express.Router();

router.post('/createPackage', authMiddleware, requirePackageQuota, createPackage);
router.get('/getVehicleTypesByPackageId/:packageId',getvehicleTypesByPackageId);
// router.post('/saveVehiclesByPackageId/:packageId', saveVehiclesByPackageId)
router.get("/getPackageByCompanyAndType", getPackageByCompanyAndType);


export default router;