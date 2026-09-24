import express from 'express';
import {
  aiChat,
  aiClassify,
  aiEscalate,
  getAiSessions,
  getAiConfig,
  testAiConnection,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router.post('/chat', aiChat);
router.post('/classify', aiClassify);
router.post('/escalate', aiEscalate);
router.get('/sessions', getAiSessions);
router.get('/config', authorize('ADMIN', 'MANAGER'), getAiConfig);
router.post('/test', authorize('ADMIN'), testAiConnection);

export default router;

