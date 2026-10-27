import express from 'express';
import {
  createSmsTemplate,
  getAllSmsTemplates,
  getSmsTemplateById,
  updateSmsTemplate
} from '../services/smsTemplateServices';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/createSmsTemplate', authMiddleware, createSmsTemplate);
router.get('/getAllSmsTemplates', authMiddleware, getAllSmsTemplates);
router.get('/getSmsTemplateById/:id', authMiddleware, getSmsTemplateById);
router.put('/updateSmsTemplate/:id', authMiddleware, updateSmsTemplate);

export default router;
