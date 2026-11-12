import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  Sparkles,
  PlayCircle,
  FileText,
  Award,
  TrendingUp,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Brain,
  Zap,
} from 'lucide-react';

const DashBoard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, resumesRes] = await Promise.all([
          API.get('/interviews/analytics'),
          API.get('/resumes'),
        ]);
        setAnalytics(analyticsRes.data);
        setResumes(resumesRes.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalInterviews = analytics?.totalInterviews || 0;
  const averageScore = analytics?.averageScore || 0;
  const categoryAverages = analytics?.categoryAverages || {
    technical: 75,
    behavioral: 80,
    systemDesign: 70,
    situational: 82,
  };
  const activeResume = resumes.length > 0 ? resumes[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 lg:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Practice Studio</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Target Role: <strong className="text-indigo-700 dark:text-indigo-400 font-bold">{user?.targetRole || 'Software Engineer'}</strong> ({user?.experienceLevel || 'Mid Level'})
              {activeResume ? ` • Active Profile: ${activeResume.fileName}` : ' • No resume uploaded yet.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/interview/setup"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs flex items-center gap-2 transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start AI Interview</span>
            </Link>
            {!activeResume && (
              <Link
                to="/resumes"
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-medium text-xs flex items-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Upload Resume</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Mock Sessions</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalInterviews}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Completed interviews</p>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Average Score</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{averageScore}%</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Overall answer quality</p>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Resumes</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{resumes.length}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Profiles parsed</p>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Target Domain</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {activeResume?.parsedData?.domain || 'Software Engineering'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Extracted by AI</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Competency & Quick Start */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Competency Chart */}
        <div className="lg:col-span-8 glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Performance Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Average score by evaluation dimension</p>
            </div>
            <Link to="/progress" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>View Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Technical Depth', score: categoryAverages.technical, color: 'bg-indigo-600' },
              { label: 'Behavioral & STAR', score: categoryAverages.behavioral, color: 'bg-emerald-600' },
              { label: 'System Design', score: categoryAverages.systemDesign, color: 'bg-purple-600' },
              { label: 'Situational Judgment', score: categoryAverages.situational, color: 'bg-amber-600' },
            ].map((cat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="category-label text-xs">{cat.label}</span>
                  <span className="font-medium category-score dark:text-white">{cat.score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${cat.score}%` }} className={`h-full ${cat.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Quick Card */}
        <div className="lg:col-span-4 glass-card p-6 space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Resume Profile</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Connected resume context</p>
          </div>

          {activeResume ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{activeResume.fileName}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeResume.parsedData?.skills?.slice(0, 5).map((sk, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to="/resumes"
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-all border border-slate-300 dark:border-slate-700/80"
              >
                <span>Manage Resumes & ATS Feedback</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload your resume to extract skills and enable targeted AI questions.
              </p>
              <Link
                to="/resumes"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Upload Resume</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
