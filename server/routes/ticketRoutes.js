import express from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  startTicket,
  addComment,
  addWorkLog,
  resolveTicket,
  reopenTicket,
  closeTicket,
  addAttachment,
} from '../controllers/ticketController.js';
import { protect } from '../middleware/auth.js';
import { authorize, isAdminOrManager, isItStaff } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

// Base ticket routes
router.get('/', getTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicket);

// Action subroutes
router.post('/:id/assign', isAdminOrManager, assignTicket);
router.post('/:id/start', isItStaff, startTicket);
router.post('/:id/comments', addComment);
router.post('/:id/attachments', addAttachment);
router.post('/:id/worklogs', isItStaff, addWorkLog);
router.post('/:id/resolve', isItStaff, resolveTicket);
router.post('/:id/reopen', reopenTicket);
router.post('/:id/close', closeTicket);

export default router;
