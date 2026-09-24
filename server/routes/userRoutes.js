import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize, isAdminOrManager } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.post('/', authorize('ADMIN'), createUser);
router.get('/:id', getUserById);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
