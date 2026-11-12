import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import confetti from 'canvas-confetti';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Printer,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const InterviewReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  useEffect(() => {
    const fetchInterviewReport = async () => {
      try {
        const res = await API.get(`/interviews/${id}`);
        setInterview(res.data);

        const score = res.data.overallReport?.overallScore || 0;
        if (score >= 70) {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        toast.error('Failed to load interview report');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviewReport();
  }, [id]);

  if (loading || !interview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-slate-300 light:text-slate-700 font-medium text-xs">Generating report...</p>
      </div>
    );
  }

  const report = interview.overallReport || {};
  const overallScore = report.overallScore || 0;
  const grade = report.grade || (overallScore > 0 ? 'B+' : 'Needs Practice');
  const categoryScores = report.categoryScores || { technical: 0, behavioral: 0, systemDesign: 0, situational: 0 };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-indigo-400 light:text-indigo-600 uppercase tracking-wider">
            Completed Mock Interview Report
          </span>
          <h1 className="text-2xl font-bold text-white light:text-slate-900 mt-0.5">{interview.jobTitle}</h1>
          <p className="text-xs text-slate-400 light:text-slate-500">
            Difficulty: {interview.difficulty} • Completed on {new Date(interview.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-900 light:bg-slate-100 hover:bg-slate-800 light:hover:bg-slate-200 text-slate-300 light:text-slate-700 text-xs font-medium border border-slate-800 light:border-slate-300 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <Link
            to="/interview/setup"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Session</span>
          </Link>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className="glass-card p-6 md:p-8 border border-slate-800/80 light:border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 font-extrabold text-3xl text-white flex items-center justify-center shadow-xs">
            {overallScore}%
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider">Performance Grade</span>
            <h2 className="text-2xl font-bold text-white light:text-slate-900 mt-0.5">{grade}</h2>
            <p className="text-xs text-slate-400 light:text-slate-500 mt-1">
              {overallScore >= 80 ? 'Exceptional response quality across competencies' : overallScore >= 60 ? 'Solid performance with clear improvement opportunities' : 'Interview attempted. Answer more questions for higher scores.'}
            </p>
          </div>
        </div>

        {/* Category Breakdown Badges */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto text-center">
          <div className="p-3 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
            <span className="text-[10px] text-slate-400 light:text-slate-500 block">Technical</span>
            <span className="text-xs font-bold text-slate-200 light:text-slate-900">{categoryScores.technical}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
            <span className="text-[10px] text-slate-400 light:text-slate-500 block">Behavioral</span>
            <span className="text-xs font-bold text-slate-200 light:text-slate-900">{categoryScores.behavioral}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
            <span className="text-[10px] text-slate-400 light:text-slate-500 block">System Design</span>
            <span className="text-xs font-bold text-slate-200 light:text-slate-900">{categoryScores.systemDesign}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
            <span className="text-[10px] text-slate-400 light:text-slate-500 block">Situational</span>
            <span className="text-xs font-bold text-slate-200 light:text-slate-900">{categoryScores.situational}%</span>
          </div>
        </div>
      </div>

      {/* Summary Analysis */}
      <div className="glass-card p-6 border border-slate-800/80 light:border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-white light:text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span>Executive Performance Summary</span>
        </h3>
        <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed bg-slate-900/40 light:bg-slate-50 p-4 rounded-xl border border-slate-800/60 light:border-slate-200">
          {report.summary}
        </p>
      </div>

      {/* Strengths & Action Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border border-slate-800/80 light:border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 light:text-emerald-600 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Demonstrated Strengths</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 light:text-slate-700">
            {report.keyStrengths?.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-900/40 light:bg-slate-50 p-2.5 rounded-lg border border-slate-800/60 light:border-slate-200">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6 border border-slate-800/80 light:border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-indigo-400 light:text-indigo-600 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Actionable Growth Plan</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 light:text-slate-700">
            {report.actionPlan?.map((plan, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-900/40 light:bg-slate-50 p-2.5 rounded-lg border border-slate-800/60 light:border-slate-200">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{plan}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Question Evaluations */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white light:text-slate-900 uppercase tracking-wider">
          Individual Question Breakdown ({interview.questions.length})
        </h3>

        {interview.questions.map((q, idx) => {
          const isExpanded = expandedQuestion === idx;
          const evalData = q.evaluation || {};
          const score = evalData.score || 0;

          return (
            <div
              key={idx}
              className="glass-card border border-slate-800/80 light:border-slate-200 overflow-hidden transition-all"
            >
              <div
                onClick={() => setExpandedQuestion(isExpanded ? -1 : idx)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/40 light:hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 font-bold text-white text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-400 light:text-indigo-600 uppercase">
                      {q.category}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 light:text-slate-900 truncate max-w-md lg:max-w-xl">
                      {q.questionText}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-200 light:text-slate-900 bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-300 px-2.5 py-1 rounded-lg">
                    Score: {score}%
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 border-t border-slate-800/80 light:border-slate-200 space-y-4 bg-slate-950/40 light:bg-slate-50/50 text-xs">
                  {/* Candidate Answer */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 light:text-slate-500 uppercase">
                      Candidate Answer Response
                    </span>
                    <p className="p-3 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 text-slate-300 light:text-slate-700 leading-relaxed italic">
                      {q.userAnswer ? `"${q.userAnswer}"` : 'No answer provided for this question.'}
                    </p>
                  </div>

                  {/* AI Feedback */}
                  {evalData.score !== undefined && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 space-y-1">
                        <span className="font-bold text-emerald-400 light:text-emerald-600">✓ Key Strengths</span>
                        <ul className="space-y-1 text-slate-300 light:text-slate-700">
                          {evalData.strengths?.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 space-y-1">
                        <span className="font-bold text-indigo-400 light:text-indigo-600">⚡ Improvements</span>
                        <ul className="space-y-1 text-slate-300 light:text-slate-700">
                          {evalData.improvements?.map((imp, i) => (
                            <li key={i}>• {imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Model Solution */}
                  {evalData.sampleAnswer && (
                    <div className="p-3.5 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 space-y-1">
                      <span className="font-bold text-indigo-400 light:text-indigo-600 uppercase text-[10px]">
                        Exemplary Model Answer
                      </span>
                      <p className="text-slate-300 light:text-slate-700 leading-relaxed italic">
                        "{evalData.sampleAnswer}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewReportPage;
