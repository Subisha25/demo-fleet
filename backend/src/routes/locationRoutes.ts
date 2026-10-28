import express from 'express';
import { addPickupCity, getCountries, getStates,addPickUpArea} from '../services/locationServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePickupCityQuota, requirePickupAreaQuota } from '../middleware/entitlementMiddleware';
const router = express.Router();

router.get('/countries', authMiddleware, getCountries);
router.post('/states', authMiddleware, getStates);

router.post('/addPickupCity', authMiddleware, requirePickupCityQuota, addPickupCity);

router.post('/addPickUpArea', authMiddleware, requirePickupAreaQuota, addPickUpArea);
// router.get('/listPickUpArea',authMiddleware, listPickUpArea);

//router.post('/cities',authMiddleware, getCities);


export default router;
