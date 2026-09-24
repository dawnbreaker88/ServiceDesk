import express from 'express';
import {
  getGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
} from '../controllers/guideController.js';
import { protect } from '../middleware/auth.js';
import { isAdminOrManager } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router.get('/', getGuides);
router.get('/:id', getGuideById);
router.post('/', isAdminOrManager, createGuide);
router.patch('/:id', isAdminOrManager, updateGuide);
router.delete('/:id', isAdminOrManager, deleteGuide);

export default router;
