import { Router } from 'express';
import { createConfiguration, getConfiguration } from '../services/configurationService';
import { authMiddleware, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// Create or update configuration (Protected: Platform SuperAdmin / Authorized Fleet Admin)
router.post('/createConfiguration', authMiddleware, createConfiguration);

// Get configuration (Protected: sensitive SMTP password redacted)
router.get('/getConfiguration', authMiddleware, getConfiguration);

export default router;

