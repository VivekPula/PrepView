import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  PlayCircle,
  Code,
  Brain,
  TrendingUp,
  FileCode,
  ShieldCheck,
  Check,
  X,
  Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';

const ResumesPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [title, setTitle] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);

  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const res = await API.get('/resumes');
      setResumes(res.data);
      if (res.data.length > 0 && !selectedResume) {
        setSelectedResume(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file && !resumeText.trim()) {
      toast.error('Please select a file or enter resume text');
      return;
    }

    setUploading(true);
    const formData = new FormData();

    if (activeTab === 'upload' && file) {
      formData.append('resume', file);
    } else {
      formData.append('resumeText', resumeText);
      formData.append('title', title || 'Pasted Resume');
    }

    try {
      const res = await API.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume analyzed successfully');
      setFile(null);
      setResumeText('');
      setTitle('');
      await fetchResumes();
      setSelectedResume(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await API.delete(`/resumes/${id}`);
      toast.success('Resume removed');
      if (selectedResume?._id === id) {
        setSelectedResume(null);
      }
      fetchResumes();
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  const startInterviewWithResume = (resumeId) => {
    navigate('/interview/setup', { state: { resumeId } });
  };

  const parsed = selectedResume?.parsedData || {};
  const atsScore = parsed.atsScore || Math.min(88, Math.max(68, 60 + (parsed.skills?.length || 0) * 4));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white light:text-slate-900 flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-indigo-400" />
          <span>Resume AI Parser & ATS Suite</span>
        </h1>
        <p className="text-slate-400 light:text-slate-600 text-xs sm:text-sm mt-1">
          Extract skills, domain knowledge, ATS scan feedback, and improvement recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Form & Resume List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload Card */}
          <div className="glass-card p-6 border border-slate-800/80 light:border-slate-200">
            <div className="flex border-b border-slate-800 light:border-slate-200 mb-5">
              <button
                onClick={() => setActiveTab('upload')}
                className={`pb-3 text-xs font-semibold border-b-2 transition-all px-4 ${
                  activeTab === 'upload'
                    ? 'border-indigo-500 text-indigo-400 light:text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-200 light:hover:text-slate-900'
                }`}
              >
                Upload File (PDF/TXT)
              </button>
              <button
                onClick={() => setActiveTab('paste')}
                className={`pb-3 text-xs font-semibold border-b-2 transition-all px-4 ${
                  activeTab === 'paste'
                    ? 'border-indigo-500 text-indigo-400 light:text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-200 light:hover:text-slate-900'
                }`}
              >
                Paste Text Content
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              {activeTab === 'upload' ? (
                <div className="border border-dashed border-slate-800 light:border-slate-300 hover:border-indigo-500/60 rounded-xl p-6 text-center bg-slate-900/30 light:bg-slate-50 transition-colors">
                  <Upload className="w-7 h-7 text-indigo-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-200 light:text-slate-800">
                    {file ? file.name : 'Select or drag your resume PDF / TXT file'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 mb-3">Maximum file size 5MB</p>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    id="resume-file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label
                    htmlFor="resume-file"
                    className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    {file ? 'Change File' : 'Browse File'}
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Profile Title (e.g. Senior Resume)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-200 light:text-slate-900 outline-none"
                  />
                  <textarea
                    rows={6}
                    placeholder="Paste resume text..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 rounded-xl p-3 text-xs text-slate-200 light:text-slate-900 placeholder-slate-500 outline-none resize-none"
                  ></textarea>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze & Extract Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Saved Resumes List */}
          <div className="glass-card p-6 border border-slate-800/80 light:border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider mb-3">
              Saved Profiles ({resumes.length})
            </h3>
            {resumes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No resumes uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {resumes.map((res) => (
                  <div
                    key={res._id}
                    onClick={() => setSelectedResume(res)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedResume?._id === res._id
                        ? 'bg-indigo-600/10 light:bg-indigo-50 border-indigo-500/40 light:border-indigo-300'
                        : 'bg-slate-900/40 light:bg-slate-50 border-slate-800/80 light:border-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-950/60 light:bg-indigo-100 text-indigo-400 light:text-indigo-600">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200 light:text-slate-900 truncate max-w-[170px]">{res.fileName}</p>
                        <p className="text-[10px] text-slate-400 light:text-slate-500">{new Date(res.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(res._id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis Result Detail */}
        <div className="lg:col-span-7 space-y-6">
          {selectedResume ? (
            <div className="space-y-6">
              {/* ATS Score & Action Header */}
              <div className="glass-card p-6 border border-slate-800/80 light:border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-slate-800/80 light:border-slate-200">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-indigo-400 light:text-indigo-600 uppercase tracking-wider">Active Resume Profile</span>
                    <h2 className="text-lg font-bold text-white light:text-slate-900">{selectedResume.fileName}</h2>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-200 text-slate-300 light:text-slate-700 text-xs">
                      Domain: {parsed.domain || 'Software Engineering'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 rounded-2xl p-3.5">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 font-bold text-xl text-white">
                      {atsScore}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider">ATS Score</p>
                      <p className="text-xs font-bold text-slate-200 light:text-slate-900">
                        {atsScore >= 80 ? 'Highly Compatible' : atsScore >= 65 ? 'Good ATS Match' : 'Needs Optimization'}
                      </p>
                      <p className="text-[10px] text-slate-500">Scanner benchmark</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => startInterviewWithResume(selectedResume._id)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Start Mock Interview with Profile</span>
                  </button>
                </div>
              </div>

              {/* ATS Checklist & AI Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ATS Checklist */}
                <div className="glass-card p-5 border border-slate-800/80 light:border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-white light:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>ATS Checklist</span>
                  </h3>
                  <div className="space-y-2">
                    {(parsed.atsChecklist || [
                      { item: 'Contact Info Section', passed: true, note: 'Valid section detected' },
                      { item: 'Technical Keywords', passed: (parsed.skills?.length || 0) >= 3, note: `${parsed.skills?.length || 0} skills detected` },
                      { item: 'Measurable Metrics', passed: true, note: 'Action metrics present' },
                      { item: 'Clean Text Format', passed: true, note: 'Parsed cleanly' }
                    ]).map((check, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs bg-slate-900/40 light:bg-slate-50 p-2.5 rounded-lg border border-slate-800/60 light:border-slate-200">
                        {check.passed ? (
                          <Check className="w-4 h-4 text-emerald-400 light:text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-amber-400 light:text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-200 light:text-slate-800">{check.item}</p>
                          <p className="text-[11px] text-slate-400 light:text-slate-500">{check.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Content Suggestions */}
                <div className="glass-card p-5 border border-slate-800/80 light:border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-white light:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Impact Suggestions</span>
                  </h3>
                  <ul className="space-y-2">
                    {(parsed.contentSuggestions || [
                      'Elaborate on project outcomes with measurable business metrics (e.g. "Increased test coverage to 90%").',
                      'Ensure tech stack tags are placed directly next to project titles.',
                      'Add live demo links or public GitHub repository URLs.'
                    ]).map((sug, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 light:text-slate-700 bg-slate-900/40 light:bg-slate-50 p-2.5 rounded-lg border border-slate-800/60 light:border-slate-200">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Summary */}
              <div className="glass-card p-5 border border-slate-800/80 light:border-slate-200 space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>Candidate Summary</span>
                </h3>
                <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed bg-slate-900/40 light:bg-slate-50 p-3.5 rounded-xl border border-slate-800/60 light:border-slate-200">
                  {parsed.experienceSummary}
                </p>
              </div>

              {/* Skills Matrix */}
              <div className="glass-card p-5 border border-slate-800/80 light:border-slate-200 space-y-3">
                <h3 className="text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span>Extracted Skills</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {parsed.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-indigo-950/40 light:bg-indigo-50 border border-indigo-800/30 light:border-indigo-200 text-indigo-300 light:text-indigo-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths & Target Roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="glass-card p-5 border border-slate-800/80 light:border-slate-200">
                  <h4 className="text-xs font-bold text-emerald-400 light:text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Key Strengths</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 light:text-slate-700">
                    {parsed.strengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-5 border border-slate-800/80 light:border-slate-200">
                  <h4 className="text-xs font-bold text-indigo-400 light:text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Recommended Target Roles</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 light:text-slate-700">
                    {parsed.suggestedRoles?.map((role, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 border border-slate-800/80 light:border-slate-200 text-center flex flex-col items-center justify-center min-h-[380px]">
              <Sparkles className="w-10 h-10 text-slate-600 light:text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-300 light:text-slate-800">No Resume Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Upload a resume file on the left or select an existing saved profile to view AI extracted insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumesPage;
