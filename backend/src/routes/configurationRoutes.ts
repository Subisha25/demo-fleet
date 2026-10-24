import { Router } from 'express';
import { createConfiguration, getConfiguration } from '../services/configurationService';
import { authMiddleware, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// Create or update configuration (Protected: Platform SuperAdmin only)
router.post('/createConfiguration', authMiddleware, requireSuperAdmin, createConfiguration);

// Get configuration (Protected: Platform SuperAdmin only, sensitive SMTP password redacted)
router.get('/getConfiguration', authMiddleware, requireSuperAdmin, getConfiguration);

export default router;

