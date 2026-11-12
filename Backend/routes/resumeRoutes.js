import express from 'express';
import { uploadAndAnalyzeResume, getUserResumes, getResumeById, deleteResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/upload', uploadResume.single('resume'), uploadAndAnalyzeResume);
router.get('/', getUserResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

export default router;
