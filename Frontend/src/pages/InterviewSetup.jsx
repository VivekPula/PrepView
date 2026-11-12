import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Briefcase,
  FileText,
  Sliders,
  PlayCircle,
  HelpCircle,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const InterviewSetup = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState(user?.targetRole || 'Software Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [difficulty, setDifficulty] = useState(user?.experienceLevel || 'Mid Level');
  const [questionCount, setQuestionCount] = useState(5);
  const [resumeId, setResumeId] = useState(location.state?.resumeId || '');
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await API.get('/resumes');
        setResumes(res.data);
        if (!resumeId && res.data.length > 0) {
          setResumeId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load resumes:', err);
      }
    };
    fetchResumes();
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      toast.error('Please enter a target job title');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/interviews/start', {
        jobTitle,
        jobDescription,
        difficulty,
        questionCount,
        resumeId: resumeId || null,
      });

      toast.success('Mock interview initialized!');
      navigate(`/interview/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize interview session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 light:text-indigo-600 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tailored AI Questions</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white light:text-slate-900 tracking-tight">
          Configure Your Mock Interview
        </h1>
        <p className="text-slate-400 light:text-slate-600 text-xs sm:text-sm mt-1">
          Customize the job role, context, and difficulty level. AI will generate targeted questions.
        </p>
      </div>

      <form onSubmit={handleStart} className="glass-card p-6 lg:p-8 border border-slate-800/80 light:border-slate-200 space-y-6">
        {/* Job Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Target Job Title *</span>
          </label>
          <input
            type="text"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior React Developer, Full Stack Engineer, DevOps"
            className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 rounded-xl py-2.5 px-3.5 text-slate-200 light:text-slate-900 text-xs outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Resume Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Connect Resume Profile</span>
          </label>

          {resumes.length > 0 ? (
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 rounded-xl py-2.5 px-3.5 text-slate-200 light:text-slate-900 text-xs outline-none focus:border-indigo-500"
            >
              <option value="">No Resume (General Tech Questions)</option>
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.fileName} ({r.parsedData?.skills?.length || 0} skills detected)
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-900/40 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-xs text-slate-400 light:text-slate-600 flex items-center justify-between">
              <span>No uploaded resumes found. General questions will be used.</span>
              <button
                type="button"
                onClick={() => navigate('/resumes')}
                className="text-indigo-400 light:text-indigo-600 font-semibold hover:underline"
              >
                Upload Resume
              </button>
            </div>
          )}
        </div>

        {/* Experience / Difficulty Level */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Difficulty Level</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['Entry Level', 'Mid Level', 'Senior Level'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                  difficulty === level
                    ? 'bg-indigo-600/15 light:bg-indigo-50 border-indigo-500 text-indigo-300 light:text-indigo-700 font-semibold'
                    : 'bg-slate-900/40 light:bg-slate-50 border-slate-800 light:border-slate-200 text-slate-400 light:text-slate-600 hover:border-slate-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Number of Questions</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[3, 5, 8].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                  questionCount === count
                    ? 'bg-indigo-600/15 light:bg-indigo-50 border-indigo-500 text-indigo-300 light:text-indigo-700 font-semibold'
                    : 'bg-slate-900/40 light:bg-slate-50 border-slate-800 light:border-slate-200 text-slate-400 light:text-slate-600 hover:border-slate-700'
                }`}
              >
                {count} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Optional Job Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
            Job Description Context (Optional)
          </label>
          <textarea
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job description or requirements to customize questions further..."
            className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 rounded-xl p-3 text-xs text-slate-200 light:text-slate-900 outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Generating AI Questions...</span>
            </span>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>Start Mock Interview Session</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InterviewSetup;
