import express from 'express';
import {
  getDashboardSummary,
  getTicketReports,
  getSlaReports,
  getTechnicianReports,
  getAssetReports,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { isAdminOrManager } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/tickets', isAdminOrManager, getTicketReports);
router.get('/sla', isAdminOrManager, getSlaReports);
router.get('/technicians', isAdminOrManager, getTechnicianReports);
router.get('/assets', getAssetReports);

export default router;
