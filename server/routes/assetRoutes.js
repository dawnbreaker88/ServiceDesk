import express from 'express';
import {
  getAssets,
  getAssetById,
  getMyAssets,
  createAsset,
  updateAsset,
  assignAsset,
  returnAsset,
  repairAsset,
  retireAsset,
} from '../controllers/assetController.js';
import { protect } from '../middleware/auth.js';
import { isAssetStaff } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router.get('/my-assets', getMyAssets);
router.get('/', getAssets);
router.get('/:id', getAssetById);

// Asset Management Staff only actions
router.post('/', isAssetStaff, createAsset);
router.patch('/:id', isAssetStaff, updateAsset);
router.post('/:id/assign', isAssetStaff, assignAsset);
router.post('/:id/return', isAssetStaff, returnAsset);
router.post('/:id/repair', isAssetStaff, repairAsset);
router.post('/:id/retire', isAssetStaff, retireAsset);

export default router;
