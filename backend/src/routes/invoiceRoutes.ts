import { Router } from "express";
import { createInvoice,getPendingInvoices, sendInvoiceReminder,getInvoicesPayHolder,getFilteredPendingInvoices,getCompletedInvoices,
    getAllInvoices,getAllCompanyInvoices,getInvoicesByUserId,getcompanyOrderSummery,getUserOrderStats,getInvoiceStatusCount, cancelInvoice, 
    resendClosePendingInvoiceEmail} from "../services/invServices"
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePaidForModification } from '../middleware/entitlementMiddleware';
 
const router = Router();
 

router.post("/sendInvoiceReminder", authMiddleware, sendInvoiceReminder);

router.post("/createInvoice", authMiddleware, requirePaidForModification, createInvoice);
router.post(
  "/invoice/resend-closepending-email",
  authMiddleware,
  resendClosePendingInvoiceEmail
);
 router.get("/getPendingInvoices", authMiddleware, getPendingInvoices);
 router.get("/getInvoicesPayHolder", authMiddleware, getInvoicesPayHolder);
router.get("/getFilteredPendingInvoices", authMiddleware, getFilteredPendingInvoices);
router.get("/getCompletedInvoices", authMiddleware, getCompletedInvoices);
router.get("/getAllInvoices", authMiddleware, getAllInvoices);
router.get("/summary", authMiddleware, getAllCompanyInvoices);
router.get("/invoices/:userId", authMiddleware, getInvoicesByUserId);
router.get("/getcompanyOrderSummery", authMiddleware, getcompanyOrderSummery);
router.get("/user-order-stats/:userId", authMiddleware, getUserOrderStats);
router.get("/invoice/status-count", authMiddleware, getInvoiceStatusCount);

router.put("/invoice/cancelInvoice", authMiddleware, requirePaidForModification, cancelInvoice);
export default router;
 

