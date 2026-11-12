import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  Mic,
  MicOff,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  ChevronRight,
  Award,
  AlertCircle,
  Brain,
  Lightbulb,
  Check,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MockInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  const [seconds, setSeconds] = useState(0);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await API.get(`/interviews/${id}`);
        setInterview(res.data);

        const firstUnanswered = res.data.questions.findIndex(q => !q.userAnswer);
        const idx = firstUnanswered >= 0 ? firstUnanswered : 0;
        setCurrentIndex(idx);
        setUserAnswer(res.data.questions[idx]?.userAnswer || '');
        if (res.data.questions[idx]?.evaluation?.score > 0) {
          setCurrentEvaluation(res.data.questions[idx].evaluation);
          setShowEvaluation(true);
        }
      } catch (err) {
        toast.error('Failed to load interview session');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser. Type your response below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening... Speak clearly.');
      } catch (err) {
        console.error('Start listening error:', err);
      }
    }
  };

  const handleIndexChange = (newIdx) => {
    if (newIdx < 0 || newIdx >= (interview?.questions?.length || 0)) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setCurrentIndex(newIdx);
    const q = interview.questions[newIdx];
    setUserAnswer(q.userAnswer || '');
    if (q.evaluation && q.evaluation.score > 0) {
      setCurrentEvaluation(q.evaluation);
      setShowEvaluation(true);
    } else {
      setShowEvaluation(false);
      setCurrentEvaluation(null);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please enter or record an answer before submitting for evaluation');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setEvaluating(true);
    try {
      const res = await API.post(`/interviews/${id}/answer`, {
        questionIndex: currentIndex,
        userAnswer,
      });

      const updatedQuestions = [...interview.questions];
      updatedQuestions[currentIndex].userAnswer = userAnswer;
      updatedQuestions[currentIndex].evaluation = res.data.evaluation;
      setInterview({ ...interview, questions: updatedQuestions });

      setCurrentEvaluation(res.data.evaluation);
      setShowEvaluation(true);
      toast.success('AI Evaluation complete');
    } catch (err) {
      toast.error('Failed to evaluate answer');
    } finally {
      setEvaluating(false);
    }
  };

  const handleFinalize = async () => {
    try {
      await API.post(`/interviews/${id}/finalize`);
      toast.success('Mock interview session completed');
      navigate(`/interview/${id}/report`);
    } catch (err) {
      toast.error('Failed to finalize interview');
    }
  };

  if (loading || !interview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-slate-300 light:text-slate-700 font-medium text-xs">Preparing AI Mock Interview session...</p>
      </div>
    );
  }

  const currentQ = interview.questions[currentIndex];
  const isLastQuestion = currentIndex === interview.questions.length - 1;
  const answeredCount = interview.questions.filter(q => q.userAnswer).length;

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200">
        <div>
          <span className="text-[11px] font-semibold text-indigo-400 light:text-indigo-600 uppercase tracking-wider">
            Mock Interview • {interview.difficulty}
          </span>
          <h1 className="text-lg font-bold text-white light:text-slate-900 mt-0.5">{interview.jobTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-xs font-semibold text-slate-300 light:text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(seconds)}</span>
          </div>

          <button
            onClick={handleFinalize}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalize & View Report</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Question Selector */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 light:text-slate-500 mb-2">
          <span>Question {currentIndex + 1} of {interview.questions.length}</span>
          <span>{answeredCount} of {interview.questions.length} answered</span>
        </div>
        <div className="w-full bg-slate-900 light:bg-slate-200 rounded-full h-2 overflow-hidden flex">
          {interview.questions.map((q, idx) => (
            <div
              key={idx}
              onClick={() => handleIndexChange(idx)}
              className={`h-full border-r border-slate-950 light:border-white transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'bg-indigo-500'
                  : q.userAnswer
                  ? 'bg-emerald-500'
                  : 'bg-slate-800 light:bg-slate-300'
              }`}
              style={{ width: `${100 / interview.questions.length}%` }}
              title={`Question ${idx + 1}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Question Presentation Card */}
      <div className="glass-card p-6 lg:p-8 border border-slate-800/80 light:border-slate-200 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/60 light:bg-indigo-50 border border-indigo-800/30 light:border-indigo-200 text-indigo-300 light:text-indigo-700 text-xs font-medium uppercase tracking-wider">
            Category: {currentQ.category}
          </span>
          <div className="flex items-center gap-1.5">
            {interview.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleIndexChange(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  idx === currentIndex
                    ? 'bg-indigo-600 text-white'
                    : interview.questions[idx].userAnswer
                    ? 'bg-emerald-950/60 light:bg-emerald-50 text-emerald-300 light:text-emerald-700 border border-emerald-800/40 light:border-emerald-200'
                    : 'bg-slate-900/60 light:bg-slate-100 text-slate-400 light:text-slate-600 border border-slate-800 light:border-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-bold text-white light:text-slate-900 leading-snug">
          "{currentQ.questionText}"
        </h2>

        {/* Expected Aspects Tips */}
        {currentQ.expectedAspects && currentQ.expectedAspects.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-900/40 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Aspects to Cover</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentQ.expectedAspects.map((aspect, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-900 light:bg-white text-slate-300 light:text-slate-700 text-xs border border-slate-800 light:border-slate-200">
                  ✓ {aspect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Candidate Answer Box with Mic Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider">
              Your Response
            </label>
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isListening
                  ? 'bg-rose-600 text-white recording-pulse'
                  : 'bg-slate-800 light:bg-slate-100 hover:bg-slate-700 light:hover:bg-slate-200 text-slate-200 light:text-slate-800 border border-slate-700 light:border-slate-300'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
              <span>{isListening ? 'Stop Recording' : 'Record Voice Answer'}</span>
            </button>
          </div>

          <textarea
            rows={5}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={
              isListening
                ? 'Listening... Speak clearly to convert speech to text live...'
                : 'Type your response or use voice recording above...'
            }
            className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 rounded-xl p-3.5 text-slate-200 light:text-slate-900 text-xs placeholder-slate-500 outline-none resize-none leading-relaxed transition-all focus:border-indigo-500"
          ></textarea>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setUserAnswer('')}
              className="text-xs text-slate-500 hover:text-slate-300 light:hover:text-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Answer</span>
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={evaluating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {evaluating ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Evaluating Answer...</span>
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{currentQ.evaluation?.score ? 'Re-Evaluate Answer' : 'Evaluate with AI'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Evaluation Output Panel */}
        {showEvaluation && currentEvaluation && (
          <div className="p-6 rounded-2xl bg-slate-900/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 light:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 font-extrabold text-xl text-white flex items-center justify-center">
                  {currentEvaluation.score}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>AI Evaluation Feedback</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 light:text-slate-500">
                    STAR Method: {currentEvaluation.starMethodUsed ? '✓ Detected' : '✕ Not detected'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200">
                  <span className="text-slate-400 light:text-slate-500 block text-[10px]">Clarity</span>
                  <span className="font-bold text-slate-200 light:text-slate-900">{currentEvaluation.clarityScore}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200">
                  <span className="text-slate-400 light:text-slate-500 block text-[10px]">Tech Depth</span>
                  <span className="font-bold text-slate-200 light:text-slate-900">{currentEvaluation.technicalDepthScore}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200">
                  <span className="text-slate-400 light:text-slate-500 block text-[10px]">Relevance</span>
                  <span className="font-bold text-slate-200 light:text-slate-900">{currentEvaluation.relevanceScore}%</span>
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 text-xs space-y-1">
                <h4 className="font-bold text-emerald-400 light:text-emerald-600">✓ Strengths</h4>
                <ul className="space-y-1 text-slate-300 light:text-slate-700">
                  {currentEvaluation.strengths?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 text-xs space-y-1">
                <h4 className="font-bold text-indigo-400 light:text-indigo-600">⚡ Improvements</h4>
                <ul className="space-y-1 text-slate-300 light:text-slate-700">
                  {currentEvaluation.improvements?.map((imp, i) => (
                    <li key={i}>• {imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sample Answer */}
            {currentEvaluation.sampleAnswer && (
              <div className="p-3.5 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 space-y-1">
                <h4 className="text-[11px] font-bold text-indigo-400 light:text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Model Answer</span>
                </h4>
                <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed italic">
                  "{currentEvaluation.sampleAnswer}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Question Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 light:border-slate-200">
          <button
            onClick={() => handleIndexChange(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-900 light:bg-slate-100 hover:bg-slate-800 light:hover:bg-slate-200 text-slate-300 light:text-slate-700 text-xs font-medium border border-slate-800 light:border-slate-300 disabled:opacity-30"
          >
            ← Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={() => handleIndexChange(currentIndex + 1)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize & View Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockInterviewPage;
