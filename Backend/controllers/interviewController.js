import Interview from '../models/Interview.js';
import Resume from '../models/Resume.js';
import { generateInterviewQuestions, evaluateAnswer, generateOverallInterviewReport } from '../utils/aiService.js';

// @desc    Start a new AI Mock Interview session
// @route   POST /api/interviews/start
export const startInterview = async (req, res) => {
  try {
    const { jobTitle, jobDescription, difficulty = 'Mid Level', questionCount = 5, resumeId } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ message: 'Job title is required to generate tailored interview questions' });
    }

    let resumeSkills = [];
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
      if (resume && resume.parsedData && resume.parsedData.skills) {
        resumeSkills = resume.parsedData.skills;
      }
    }

    // Generate questions using AI Service
    const questionsData = await generateInterviewQuestions({
      jobTitle,
      jobDescription,
      difficulty,
      count: Number(questionCount),
      resumeSkills,
    });

    const interview = await Interview.create({
      user: req.user._id,
      resume: resumeId || null,
      jobTitle,
      jobDescription,
      difficulty,
      questionCount: questionsData.length,
      status: 'in-progress',
      questions: questionsData.map(q => ({
        questionText: q.questionText,
        category: q.category || 'Technical',
        expectedAspects: q.expectedAspects || [],
        userAnswer: '',
        evaluation: {
          score: 0,
          clarityScore: 0,
          technicalDepthScore: 0,
          relevanceScore: 0,
          strengths: [],
          improvements: [],
          sampleAnswer: '',
          starMethodUsed: false,
        },
      })),
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: error.message || 'Failed to initialize interview session' });
  }
};

// @desc    Submit answer for a specific question & get real-time AI evaluation
// @route   POST /api/interviews/:id/answer
export const submitQuestionAnswer = async (req, res) => {
  try {
    const { questionIndex, userAnswer } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    if (questionIndex === undefined || questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    const questionItem = interview.questions[questionIndex];

    // Evaluate answer via AI Service
    const evaluation = await evaluateAnswer({
      questionText: questionItem.questionText,
      category: questionItem.category,
      userAnswer: userAnswer || '',
      jobTitle: interview.jobTitle,
      difficulty: interview.difficulty,
    });

    // Update question state
    interview.questions[questionIndex].userAnswer = userAnswer || '';
    interview.questions[questionIndex].evaluation = {
      ...evaluation,
      evaluatedAt: new Date(),
    };

    await interview.save();

    res.json({
      questionIndex,
      userAnswer,
      evaluation: interview.questions[questionIndex].evaluation,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: error.message || 'Failed to evaluate answer' });
  }
};

// @desc    Finalize interview & generate overall performance feedback report
// @route   POST /api/interviews/:id/finalize
export const finalizeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Generate overall report from all questions & evaluations
    const overallReport = await generateOverallInterviewReport(interview.questions, interview.jobTitle);

    interview.overallReport = overallReport;
    interview.status = 'completed';
    await interview.save();

    res.json(interview);
  } catch (error) {
    console.error('Finalize interview error:', error);
    res.status(500).json({ message: error.message || 'Failed to finalize interview report' });
  }
};

// @desc    Get interview session by ID
// @route   GET /api/interviews/:id
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate('resume', 'fileName parsedData');
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user interview history
// @route   GET /api/interviews/history
export const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('jobTitle difficulty questionCount status overallReport createdAt');
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user dashboard analytics summary
// @route   GET /api/interviews/analytics
export const getDashboardAnalytics = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id, status: 'completed' });
    const totalInterviews = interviews.length;

    let totalScoreSum = 0;
    const scoreHistory = [];
    const categoryTotals = { technical: 0, behavioral: 0, systemDesign: 0, situational: 0 };
    const categoryCounts = { technical: 0, behavioral: 0, systemDesign: 0, situational: 0 };

    interviews.forEach(item => {
      const score = item.overallReport?.overallScore || 0;
      totalScoreSum += score;
      scoreHistory.push({
        date: item.createdAt,
        jobTitle: item.jobTitle,
        score,
      });

      if (item.overallReport?.categoryScores) {
        const cat = item.overallReport.categoryScores;
        if (cat.technical) { categoryTotals.technical += cat.technical; categoryCounts.technical++; }
        if (cat.behavioral) { categoryTotals.behavioral += cat.behavioral; categoryCounts.behavioral++; }
        if (cat.systemDesign) { categoryTotals.systemDesign += cat.systemDesign; categoryCounts.systemDesign++; }
        if (cat.situational) { categoryTotals.situational += cat.situational; categoryCounts.situational++; }
      }
    });

    const averageScore = totalInterviews > 0 ? Math.round(totalScoreSum / totalInterviews) : 0;

    const categoryAverages = {
      technical: categoryCounts.technical ? Math.round(categoryTotals.technical / categoryCounts.technical) : 75,
      behavioral: categoryCounts.behavioral ? Math.round(categoryTotals.behavioral / categoryCounts.behavioral) : 80,
      systemDesign: categoryCounts.systemDesign ? Math.round(categoryTotals.systemDesign / categoryCounts.systemDesign) : 70,
      situational: categoryCounts.situational ? Math.round(categoryTotals.situational / categoryCounts.situational) : 82,
    };

    res.json({
      totalInterviews,
      averageScore,
      scoreHistory,
      categoryAverages,
      recentSessions: interviews.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
