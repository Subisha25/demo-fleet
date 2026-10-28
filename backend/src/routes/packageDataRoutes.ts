import express from 'express';
import {createPackageData,getAllPackageData,getPackageDataById,updatePackageData,deletePackageData,copyPackageData } from '../services/packageDataServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePackageQuota, requirePaidForModification } from '../middleware/entitlementMiddleware';
const router = express.Router();

router.post('/createPackageData', authMiddleware, requirePackageQuota, createPackageData);
router.get('/getAllPackageData', authMiddleware, getAllPackageData);
router.get('/getPackageDataById/:id', authMiddleware, getPackageDataById);
router.put('/updatePackageData/:id', authMiddleware, requirePaidForModification, updatePackageData);
router.delete('/deletePackageData/:id', authMiddleware, requirePaidForModification, deletePackageData);

router.post('/copyPackageData', authMiddleware, requirePackageQuota, copyPackageData);





export default router;