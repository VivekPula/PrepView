import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    parsedData: {
      skills: [{ type: String }],
      experienceSummary: { type: String, default: '' },
      strengths: [{ type: String }],
      improvementAreas: [{ type: String }],
      domain: { type: String, default: 'General Tech' },
      suggestedRoles: [{ type: String }],
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
