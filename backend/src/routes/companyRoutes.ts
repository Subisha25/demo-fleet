import express from 'express';
import {
  getAllCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  restoreCompany,
  getCompanyBySeoUrl,
  getCompanyByFleetAndCompanySlug,
  getCompanyTaxes,
} from '../services/companyServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadCompanyLogo } from '../middleware/uploadConfig';
import { requirePaidForModification } from '../middleware/entitlementMiddleware';

const router = express.Router();

router.get('/getAllCompany', authMiddleware, getAllCompany);
router.get('/company/:companyId/taxes', authMiddleware, getCompanyTaxes);
router.get('/getCompanyById/:id', authMiddleware, getCompanyById);
router.get('/:fleetSlug/:companySlug', getCompanyByFleetAndCompanySlug);
router.get('/:seoUrl', getCompanyBySeoUrl);

router.put(
  '/companyUpdate/:id',
  authMiddleware,
  requirePaidForModification,
  uploadCompanyLogo.single('companyLogo'),
  updateCompany
);
router.delete('/companyDelete/:id', authMiddleware, requirePaidForModification, deleteCompany);
router.put('/companyRestore/:id', authMiddleware, requirePaidForModification, restoreCompany);

export default router;