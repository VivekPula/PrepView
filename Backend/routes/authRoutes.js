import express from 'express';
import { registerUser, loginUser, getMe, updateProfile, updatePassword, getProgressAnalytics } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.get('/analytics', protect, getProgressAnalytics);

export default router;
