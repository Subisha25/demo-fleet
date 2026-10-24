import express from 'express';
import { createEmailConf, getAllEmailConf, getEmailConfById, updateEmailConf } from '../services/emailConfServices';
import { authMiddleware, requireSuperAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/createEmailConf', authMiddleware, requireSuperAdmin, createEmailConf);
router.get('/getAllEmailConf', authMiddleware, requireSuperAdmin, getAllEmailConf);
router.get('/getEmailConfById/:id', authMiddleware, requireSuperAdmin, getEmailConfById);
router.put('/updateEmailConf/:id', authMiddleware, requireSuperAdmin, updateEmailConf);

export default router;