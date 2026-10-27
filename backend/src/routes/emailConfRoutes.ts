import express from 'express';
import {
  createEmailConf,
  getAllEmailConf,
  getEmailConfById,
  updateEmailConf,
  previewEmailConf,
  resetEmailConf,
} from '../services/emailConfServices';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/createEmailConf', authMiddleware, createEmailConf);
router.get('/getAllEmailConf', authMiddleware, getAllEmailConf);
router.get('/getEmailConfById/:id', authMiddleware, getEmailConfById);
router.put('/updateEmailConf/:id', authMiddleware, updateEmailConf);
router.post('/preview', authMiddleware, previewEmailConf);
router.post('/reset/:id', authMiddleware, resetEmailConf);

export default router;