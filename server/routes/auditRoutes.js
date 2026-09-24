import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/auth.js';
import { isAdminOrManager } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);
router.get('/', isAdminOrManager, getAuditLogs);

export default router;
