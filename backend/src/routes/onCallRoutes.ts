import express from 'express';
import { createOncallInvoice, downloadOncallInvoicePDF, editOnCallInvoice, getAllOnCallInvoices, getOnCallInvoiceById, updateOnCallInvoice,removeOnCallInvoiceItem, deleteOnCallInvoice, changeOnCallInvoiceNumber } from '../services/onCallServices';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/createOncallInvoice', authMiddleware, createOncallInvoice);
router.get('/getAll', authMiddleware, getAllOnCallInvoices);
router.get('/getById/:onCallBillId', authMiddleware, getOnCallInvoiceById);
router.put('/edit/:onCallBillId', authMiddleware, editOnCallInvoice);
router.post('/generatePdf', authMiddleware, downloadOncallInvoicePDF); 
router.put(
  "/update-oncall-invoice/:onCallBillId",
  authMiddleware,
  updateOnCallInvoice
);
router.delete('/remove-item/:onCallInvoiceItemId', authMiddleware, removeOnCallInvoiceItem);

router.delete(
  "/onCallInvoice/:onCallBillId",
  authMiddleware,
  deleteOnCallInvoice
);

router.post('/change-invoice-number', authMiddleware, changeOnCallInvoiceNumber);

export default router;