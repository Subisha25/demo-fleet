import express from 'express';
import { createOncallInvoice, downloadOncallInvoicePDF, editOnCallInvoice, getAllOnCallInvoices, getOnCallInvoiceById, updateOnCallInvoice,removeOnCallInvoiceItem, deleteOnCallInvoice, changeOnCallInvoiceNumber } from '../services/onCallServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePaidForModification } from '../middleware/entitlementMiddleware';

const router = express.Router();

router.post('/createOncallInvoice', authMiddleware, requirePaidForModification, createOncallInvoice);
router.get('/getAll', authMiddleware, getAllOnCallInvoices);
router.get('/getById/:onCallBillId', authMiddleware, getOnCallInvoiceById);
router.put('/edit/:onCallBillId', authMiddleware, requirePaidForModification, editOnCallInvoice);
router.post('/generatePdf', authMiddleware, downloadOncallInvoicePDF); 
router.put(
  "/update-oncall-invoice/:onCallBillId",
  authMiddleware,
  requirePaidForModification,
  updateOnCallInvoice
);
router.delete('/remove-item/:onCallInvoiceItemId', authMiddleware, requirePaidForModification, removeOnCallInvoiceItem);

router.delete(
  "/onCallInvoice/:onCallBillId",
  authMiddleware,
  requirePaidForModification,
  deleteOnCallInvoice
);

router.post('/change-invoice-number', authMiddleware, requirePaidForModification, changeOnCallInvoiceNumber);

export default router;