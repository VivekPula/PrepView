import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  category: {
    type: String,
    enum: ['Technical', 'Behavioral', 'System Design', 'Situational', 'General'],
    default: 'Technical',
  },
  expectedAspects: [{ type: String }],
  userAnswer: { type: String, default: '' },
  evaluation: {
    score: { type: Number, default: 0 },
    clarityScore: { type: Number, default: 0 },
    technicalDepthScore: { type: Number, default: 0 },
    relevanceScore: { type: Number, default: 0 },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    sampleAnswer: { type: String, default: '' },
    starMethodUsed: { type: Boolean, default: false },
    evaluatedAt: { type: Date },
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level'],
      default: 'Mid Level',
    },
    questionCount: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    questions: [questionSchema],
    overallReport: {
      overallScore: { type: Number, default: 0 },
      grade: { type: String, default: '' },
      summary: { type: String, default: '' },
      keyStrengths: [{ type: String }],
      keyAreasToImprove: [{ type: String }],
      actionPlan: [{ type: String }],
      categoryScores: {
        technical: { type: Number, default: 0 },
        behavioral: { type: Number, default: 0 },
        systemDesign: { type: Number, default: 0 },
        situational: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
