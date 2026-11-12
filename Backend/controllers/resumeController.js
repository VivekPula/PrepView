import Resume from '../models/Resume.js';
import { parseResumeFile } from '../utils/resumeParser.js';
import { analyzeResumeText } from '../utils/aiService.js';

// @desc    Upload & analyze resume file or text
// @route   POST /api/resumes/upload
export const uploadAndAnalyzeResume = async (req, res) => {
  try {
    let rawText = '';
    let fileName = 'Pasted Resume Text';

    if (req.file) {
      fileName = req.file.originalname;
      rawText = await parseResumeFile(req.file.buffer, req.file.mimetype);
    } else if (req.body.resumeText && req.body.resumeText.trim()) {
      rawText = req.body.resumeText.trim();
      fileName = req.body.title || 'Resume Text Entry';
    } else {
      return res.status(400).json({ message: 'Please provide a file or text content for resume analysis' });
    }

    if (rawText.length < 30) {
      return res.status(400).json({ message: 'Resume content is too short to perform AI analysis' });
    }

    // Call AI Service for extraction
    const parsedData = await analyzeResumeText(rawText);

    // Save to Database
    const resume = await Resume.create({
      user: req.user._id,
      fileName,
      rawText,
      parsedData,
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error('Upload & Analyze error:', error);
    res.status(500).json({ message: error.message || 'Failed to analyze resume' });
  }
};

// @desc    Get user's uploaded resumes
// @route   GET /api/resumes
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
