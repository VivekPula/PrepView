import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import {
  TrendingUp, Award, CheckCircle2, Target, BarChart2,
  Sparkles, PlayCircle, ShieldCheck, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProgressPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/auth/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load progress analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Analyzing practice history & performance...</p>
        </div>
      </div>
    );
  }

  const {
    totalInterviews = 0,
    completedCount = 0,
    totalResumes = 0,
    totalAnsweredQuestions = 0,
    overallAvgScore = 0,
    readinessScore = 0,
    readinessLevel = 'Getting Started',
    scoreTrend = [],
    categoryAverages = { technical: 70, behavioral: 75, systemDesign: 65, situational: 80 }
  } = analytics || {};

  // Helper to render SVG Line Graph
  const renderLineGraph = () => {
    if (scoreTrend.length === 0) return null;

    const width = 500;
    const height = 180;
    const paddingX = 40;
    const paddingY = 30;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    const points = scoreTrend.map((item, idx) => {
      const x = scoreTrend.length === 1
        ? width / 2
        : paddingX + (idx / (scoreTrend.length - 1)) * chartWidth;
      const y = height - paddingY - (item.score / 100) * chartHeight;
      return { x, y, score: item.score, label: item.date, title: item.jobTitle };
    });

    const pathString = points.reduce((acc, point, idx) => {
      return idx === 0 ? `M ${point.x},${point.y}` : `${acc} L ${point.x},${point.y}`;
    }, '');

    const areaString = points.length > 0
      ? `${pathString} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`
      : '';

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const yVal = height - paddingY - ratio * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={yVal}
                  x2={width - paddingX}
                  y2={yVal}
                  stroke="#94a3b8"
                  strokeOpacity="0.2"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={yVal + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-medium"
                >
                  {ratio * 100}%
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {points.length > 1 && (
            <path d={areaString} fill="url(#lineGradient)" />
          )}

          {/* Line Path */}
          {points.length > 1 && (
            <path
              d={pathString}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                className="fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-2 group-hover:r-7 transition-all"
              />
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                className="fill-indigo-700 dark:fill-indigo-400 text-[10px] font-extrabold opacity-90 group-hover:opacity-100"
              >
                {pt.score}%
              </text>
              <text
                x={pt.x}
                y={height - paddingY + 16}
                textAnchor="middle"
                className="fill-slate-500 text-[9px] font-medium"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Performance Tracker</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Progress & Job Readiness
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              Monitor your mock interview score trajectory, category breakdown, and hiring readiness.
            </p>
          </div>

          {/* High-Visibility Hiring Readiness Badge */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 font-black text-xl text-white shadow-xs">
              {readinessScore}%
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hiring Readiness</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{readinessLevel}</p>
              <p className="text-[11px] text-slate-500">{completedCount} mock interviews completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Sessions</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold stat-number">{completedCount} <span className="text-xs text-slate-500 font-normal">/ {totalInterviews}</span></div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Mock interviews</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Score</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold stat-number">{overallAvgScore}%</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Overall performance</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Answered Questions</span>
            <Target className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold stat-number">{totalAnsweredQuestions}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Practice responses</p>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resumes</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold stat-number">{totalResumes}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Analyzed profiles</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend Line Chart */}
        <div className="lg:col-span-2 glass-card p-6 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Performance Trajectory (Line Graph)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Continuous score progress across interview sessions</p>
          </div>

          {scoreTrend.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <BarChart2 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No completed mock interviews yet to map score trajectory.</p>
              <Link
                to="/interview/setup"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Start Mock Interview
              </Link>
            </div>
          ) : (
            renderLineGraph()
          )}
        </div>

        {/* Category Skill Breakdown */}
        <div className="glass-card p-6 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Category Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average score by category</p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Technical Depth', score: categoryAverages.technical, color: 'bg-indigo-500' },
              { label: 'Behavioral & STAR', score: categoryAverages.behavioral, color: 'bg-emerald-500' },
              { label: 'System Design', score: categoryAverages.systemDesign, color: 'bg-purple-500' },
              { label: 'Situational Judgment', score: categoryAverages.situational, color: 'bg-amber-500' },
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="category-label text-xs">{cat.label}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{cat.score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${cat.score}%` }} className={`h-full ${cat.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <p className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              AI Recommendation:
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {categoryAverages.systemDesign < 70
                ? 'Practice more System Design questions to boost your overall hiring readiness.'
                : 'Good overall performance! Maintain STAR story practice to keep answers structured.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
