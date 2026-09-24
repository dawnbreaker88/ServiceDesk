import express from 'express';
import {
  aiChat,
  aiClassify,
  aiEscalate,
  getAiSessions,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/chat', aiChat);
router.post('/classify', aiClassify);
router.post('/escalate', aiEscalate);
router.get('/sessions', getAiSessions);

export default router;
