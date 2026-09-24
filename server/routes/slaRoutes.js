import express from 'express';
import {
  getSlaPolicies,
  getSlaPolicyById,
  createSlaPolicy,
  updateSlaPolicy,
  deleteSlaPolicy,
} from '../controllers/slaController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router.get('/', getSlaPolicies);
router.get('/:id', getSlaPolicyById);
router.post('/', authorize('ADMIN', 'MANAGER'), createSlaPolicy);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), updateSlaPolicy);
router.delete('/:id', authorize('ADMIN'), deleteSlaPolicy);

export default router;
