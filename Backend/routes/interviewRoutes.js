import express from 'express';
import {
  startInterview,
  submitQuestionAnswer,
  finalizeInterview,
  getInterviewById,
  getInterviewHistory,
  getDashboardAnalytics,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/start', startInterview);
router.get('/history', getInterviewHistory);
router.get('/analytics', getDashboardAnalytics);
router.get('/:id', getInterviewById);
router.post('/:id/answer', submitQuestionAnswer);
router.post('/:id/finalize', finalizeInterview);

export default router;
