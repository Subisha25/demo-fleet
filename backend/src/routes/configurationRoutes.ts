import { Router } from 'express';
import { createConfiguration, getConfiguration } from '../services/configurationService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Create or update configuration (Protected: Admin / Superadmin only)
router.post('/createConfiguration', authMiddleware, createConfiguration);

// Get configuration (Protected: Authenticated only, sensitive SMTP password redacted)
router.get('/getConfiguration', authMiddleware, getConfiguration);

export default router;
