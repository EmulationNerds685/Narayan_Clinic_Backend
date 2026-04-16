import express from 'express';
import {
    submitFeedback,
    getApprovedFeedback,
    getAllFeedback,
    updateFeedbackStatus,
    deleteFeedback,
    submitContactMessage,
    getAllMessages,
    updateMessageReadStatus,
    deleteMessage
} from '../controllers/feedbackController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/feedback', submitFeedback);
router.get('/feedback/approved', getApprovedFeedback);
router.post('/contact', submitContactMessage);

// Admin routes
router.get('/feedback', requireAdmin, getAllFeedback);
router.patch('/feedback/:id/status', requireAdmin, updateFeedbackStatus);
router.delete('/feedback/:id', requireAdmin, deleteFeedback);

router.get('/messages', requireAdmin, getAllMessages);
router.patch('/messages/:id/status', requireAdmin, updateMessageReadStatus);
router.delete('/messages/:id', requireAdmin, deleteMessage);

export default router;
