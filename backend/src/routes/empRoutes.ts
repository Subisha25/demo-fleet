import express from 'express';
import { createVendor,createBooking,createCompany,confirmPendingOrderCount,paymentPendingOrderCount, confirmPendingOrderCountWeb,
    getAllBooking,getAllPendingBooking, addTax , taxList, editTax, deleteTax,paymentCompletedOrderCount, confirmPendingOrderForManager,confirmBookingByManager,
    getCompletedList, createBookingForWeb,
    cnfrmBookingByManagerEmail,
    rejectBookingByManager,
    createBookingForWebOnCall} from '../services/empServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadCompanyLogo } from "../middleware/uploadConfig";
import { requireCompanyQuota, requireActiveSubscriptionForBookings, requirePaidForModification } from '../middleware/entitlementMiddleware';

const router = express.Router();


router.post('/createVendor',authMiddleware, requirePaidForModification, createVendor);

router.post('/createBooking', authMiddleware, requireActiveSubscriptionForBookings, createBooking);
router.post('/createBookingForWeb', authMiddleware, requireActiveSubscriptionForBookings, createBookingForWeb);
router.post('/createBookingForWebOnCall', authMiddleware, requireActiveSubscriptionForBookings, createBookingForWebOnCall);
router.post('/createCompany', authMiddleware, requireCompanyQuota, uploadCompanyLogo.single("companyLogo"), createCompany);

// router.get('/getAllCompany',authMiddleware, getAllCompany);

router.get('/getAllBooking',authMiddleware, getAllBooking);

router.get('/getAllPendingBooking',authMiddleware, getAllPendingBooking);

// router.get('/getAllVendor',authMiddleware, getAllVendor);

router.post('/addTax',authMiddleware, addTax);

router.get('/getTaxList',authMiddleware, taxList);



router.get('/confirmPendingOrderCount',authMiddleware, confirmPendingOrderCount);
router.get('/confirmPendingOrderCountWeb',authMiddleware, confirmPendingOrderCountWeb);


router.get('/confirmPendingOrderForManager',authMiddleware, confirmPendingOrderForManager);

router.get('/paymentPendingOrderCount',authMiddleware, paymentPendingOrderCount);

router.get('/paymentCompletedOrderCount',authMiddleware, paymentCompletedOrderCount);
router.get('/getcompletedlist',authMiddleware, getCompletedList);  // get completed list

router.put('/confirmBookingByManager',authMiddleware, requireActiveSubscriptionForBookings, confirmBookingByManager);

router.get('/cnfrmBookingByManagerEmail', cnfrmBookingByManagerEmail);
router.get('/rejectBookingByManagerEmail', rejectBookingByManager);

router.put('/editTax/:taxId', authMiddleware, requirePaidForModification, editTax);  
router.delete('/deleteTax/:taxId', authMiddleware, requirePaidForModification, deleteTax);
export default router;
