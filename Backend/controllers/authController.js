import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Interview from '../models/Interview.js';
import Resume from '../models/Resume.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'prepview_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, targetRole, experienceLevel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      targetRole: targetRole || 'Software Engineer',
      experienceLevel: experienceLevel || 'Mid Level',
    });

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      targetRole: user.targetRole,
      experienceLevel: user.experienceLevel,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      targetRole: user.targetRole,
      experienceLevel: user.experienceLevel,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update profile info
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.targetRole !== undefined) user.targetRole = req.body.targetRole;
    if (req.body.experienceLevel !== undefined) user.experienceLevel = req.body.experienceLevel;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.preferredTheme !== undefined) user.preferredTheme = req.body.preferredTheme;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      targetRole: updatedUser.targetRole,
      experienceLevel: updatedUser.experienceLevel,
      bio: updatedUser.bio,
      preferredTheme: updatedUser.preferredTheme,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user progress analytics
// @route   GET /api/auth/analytics
export const getProgressAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await Interview.find({ user: userId }).sort({ createdAt: 1 });
    const resumes = await Resume.find({ user: userId });

    const completed = interviews.filter(i => i.status === 'completed');
    const totalInterviews = interviews.length;
    const completedCount = completed.length;

    let overallAvgScore = 0;
    let totalAnsweredQuestions = 0;
    const categoryTotals = { technical: 0, behavioral: 0, systemDesign: 0, situational: 0 };
    const categoryCounts = { technical: 0, behavioral: 0, systemDesign: 0, situational: 0 };

    const scoreTrend = completed.map((i, index) => {
      const score = i.overallReport?.overallScore || 0;
      const cats = i.overallReport?.categoryScores || {};

      if (cats.technical) { categoryTotals.technical += cats.technical; categoryCounts.technical++; }
      if (cats.behavioral) { categoryTotals.behavioral += cats.behavioral; categoryCounts.behavioral++; }
      if (cats.systemDesign) { categoryTotals.systemDesign += cats.systemDesign; categoryCounts.systemDesign++; }
      if (cats.situational) { categoryTotals.situational += cats.situational; categoryCounts.situational++; }

      const answeredInSession = i.questions?.filter(q => q.userAnswer)?.length || 0;
      totalAnsweredQuestions += answeredInSession;

      return {
        session: `Interview #${index + 1}`,
        date: new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        jobTitle: i.jobTitle,
        score,
      };
    });

    if (completedCount > 0) {
      overallAvgScore = Math.round(scoreTrend.reduce((acc, s) => acc + s.score, 0) / completedCount);
    }

    const categoryAverages = {
      technical: categoryCounts.technical ? Math.round(categoryTotals.technical / categoryCounts.technical) : (completedCount ? 75 : 0),
      behavioral: categoryCounts.behavioral ? Math.round(categoryTotals.behavioral / categoryCounts.behavioral) : (completedCount ? 70 : 0),
      systemDesign: categoryCounts.systemDesign ? Math.round(categoryTotals.systemDesign / categoryCounts.systemDesign) : (completedCount ? 65 : 0),
      situational: categoryCounts.situational ? Math.round(categoryTotals.situational / categoryCounts.situational) : (completedCount ? 80 : 0),
    };

    // Calculate readiness score
    const readinessScore = Math.min(100, Math.round((overallAvgScore * 0.7) + (Math.min(completedCount, 5) * 6)));

    let readinessLevel = 'Getting Started';
    if (readinessScore >= 85) readinessLevel = 'Interview Ready (Strong)';
    else if (readinessScore >= 70) readinessLevel = 'Proficient (Good Progress)';
    else if (readinessScore >= 55) readinessLevel = 'Developing';

    res.json({
      totalInterviews,
      completedCount,
      totalResumes: resumes.length,
      totalAnsweredQuestions,
      overallAvgScore,
      readinessScore,
      readinessLevel,
      scoreTrend,
      categoryAverages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
