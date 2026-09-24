import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authorize('ADMIN', 'MANAGER'), createCategory);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), updateCategory);
router.delete('/:id', authorize('ADMIN'), deleteCategory);

export default router;
