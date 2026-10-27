import express from 'express';
import {createClosePending, createAppInvoice,getPaymentForPendingInvoice,savePaymentForInvoice,getCompletedList,clearPaymentInitialise,
     paymentInitialise, 
     createMonthlyInvoice,
     resendMonthlyInvoice,
     getAllMonthlyInvoiceDetails,
     getMonthlyInvoiceDetailsById,
     getAllMonthlyInvoice,
     filterMonthlyInvoices,
     editMonthlyInvoice, 
     deleteMonthlyInvoice,
     deleteMonthlyInvoiceItem,
     changeMonthlyInvoiceNumber}  from '../services/closependingorderServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePaidForModification } from '../middleware/entitlementMiddleware';
 
const router = express.Router();

// Protected routes (authentication required)
router.post('/createClosePending', authMiddleware, requirePaidForModification, createClosePending);
router.post('/createAppInvoice', authMiddleware, requirePaidForModification, createAppInvoice);
router.post("/monthlyInvoice/create", authMiddleware, requirePaidForModification, createMonthlyInvoice);
router.post("/monthlyInvoice/resend", authMiddleware, resendMonthlyInvoice);
router.put("/monthlyInvoice/edit-monthly-invoice", authMiddleware, requirePaidForModification, editMonthlyInvoice);
router.get("/monthlyInvoice/getAll", authMiddleware, getAllMonthlyInvoiceDetails);
router.get("/monthlyInvoice/getAllmonthly", authMiddleware, getAllMonthlyInvoice);
router.get("/monthlyInvoice/filter", authMiddleware, filterMonthlyInvoices);
router.get("/monthlyInvoice/:monthlyInvoiceId/details", authMiddleware, getMonthlyInvoiceDetailsById);
router.get('/getPaymentForPendingInvoice/:invoiceId', authMiddleware, getPaymentForPendingInvoice);
router.post('/savePaymentForInvoice', authMiddleware, savePaymentForInvoice);
router.post('/paymentInitialise', authMiddleware, paymentInitialise);
router.post('/clearPaymentInitialise', authMiddleware, clearPaymentInitialise);
router.put("/monthly-invoice/edit", authMiddleware, requirePaidForModification, editMonthlyInvoice);
router.get('/getCompletedList', authMiddleware, getCompletedList);

router.delete(
  "/monthlyInvoice/:monthlyInvoiceId",
  authMiddleware,
  requirePaidForModification,
  deleteMonthlyInvoice
);

router.delete(
  "/monthlyInvoiceItem/:monthlyInvoiceItemId",
  authMiddleware,
  requirePaidForModification,
  deleteMonthlyInvoiceItem
);

router.delete(
  "/monthlyInvoice/item/:monthlyInvoiceItemId",
  authMiddleware,
  requirePaidForModification,
  deleteMonthlyInvoiceItem
);

router.post(
  "/monthlyInvoice/delete-route-item",
  authMiddleware,
  requirePaidForModification,
  deleteMonthlyInvoiceItem
);

router.post("/monthlyInvoice/change-invoice-number", authMiddleware, requirePaidForModification, changeMonthlyInvoiceNumber);
 
export default router;