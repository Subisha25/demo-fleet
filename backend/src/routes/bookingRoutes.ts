import express from 'express';
import { getAllOrders, editBooking, cancelBooking, declineBooking, getOrderById, getCancelledBooking ,
  getOrderByEmployeeId,getBookingDetails, getOrderPaymentListById,getOverallInvoiceReport,companyBookingReport,
  getMonthlyBookings,getAllOrdersByUser,getCancelledOrdersByUser,getClosedOrdersByUser,getConfirmedOrdersByUser,
  getOrdersByStatus,getPaymentCompletedOrdersByUser,getPendingOrdersByUser,getPendingInvoicesByUser,getPaymentPendingOrdersByUser,downloadUserInvoicePdf,
  createPartner,editCloseBooking } from '../services/bookingServices';

import { authMiddleware } from '../middleware/authMiddleware';
import { requirePaidForModification } from '../middleware/entitlementMiddleware';
import {
  getConfirmedOrders,
  getPendingOrders,
  getClosedOrders,
  getCompletedOrders,
  getPaymentCompletedOrders
} from '../controllers/bookingControllers';
const router = express.Router();

router.post("/partners",  createPartner);

router.get("/getAllOrders", authMiddleware,getAllOrders);
router.post("/getOrdersById", authMiddleware,getOrderById);
router.post("/getOrderPaymentListById", authMiddleware,getOrderPaymentListById);
router.post("/getOrderByEmployeeId", authMiddleware,getOrderByEmployeeId);

router.get('/status/confirmed', authMiddleware, getConfirmedOrders);
router.get('/status/pending', authMiddleware, getPendingOrders);
router.get('/status/closed', authMiddleware, getClosedOrders);
router.get('/status/completed', authMiddleware, getCompletedOrders);
router.get('/status/paymentcompleted', authMiddleware, getPaymentCompletedOrders);
router.get('/status/cancelled', authMiddleware, getCancelledBooking);

router.put('/editBooking/:bookingId', authMiddleware, requirePaidForModification, editBooking);
router.put('/editCloseBooking/:bookingId', authMiddleware, requirePaidForModification, editCloseBooking);
router.put("/cancelBooking", authMiddleware, requirePaidForModification, cancelBooking);
router.put("/declineBooking", authMiddleware, requirePaidForModification, declineBooking);
router.get('/status/cancelled', authMiddleware, getCancelledBooking);

router.get("/details/:bookingCode", authMiddleware, getBookingDetails);
router.get("/getallinvoicereport", authMiddleware, getOverallInvoiceReport);
router.get("/companyBookingReport", authMiddleware, companyBookingReport);
router.get('/getmonthlybookings', authMiddleware, getMonthlyBookings);

router.get("/user/:userId/all", authMiddleware, getAllOrdersByUser);    //my order details
router.get("/user/:userId/pending", authMiddleware, getPendingOrdersByUser);
router.get("/user/:userId/pending-invoices", authMiddleware, getPendingInvoicesByUser); //pending invoices
router.get("/user/:userId/confirmed", authMiddleware, getConfirmedOrdersByUser);
router.get("/user/:userId/payment-completed", authMiddleware, getPaymentCompletedOrdersByUser);
router.get("/user/:userId/closed", authMiddleware, getClosedOrdersByUser);
router.get("/user/:userId/cancelled", authMiddleware, getCancelledOrdersByUser);
router.get("/user/:userId/payment-pending", authMiddleware, getPaymentPendingOrdersByUser);
router.get("/user/invoices/:bookingId/:invoiceId/pdf",  authMiddleware, downloadUserInvoicePdf);

export default router;
