import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { History, Award, ArrowUpRight, PlayCircle, Search, Calendar } from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/interviews/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) =>
    item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white light:text-slate-900 flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Interview Session History</span>
          </h1>
          <p className="text-slate-400 light:text-slate-600 text-xs sm:text-sm mt-1">Review all your previous AI mock interviews and evaluations.</p>
        </div>

        <Link
          to="/interview/setup"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs flex items-center gap-2"
        >
          <PlayCircle className="w-4 h-4" />
          <span>New Mock Session</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="glass-card p-3.5 border border-slate-800/80 light:border-slate-200 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter history by job title or difficulty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-slate-200 light:text-slate-900 placeholder-slate-500 text-xs outline-none"
        />
      </div>

      {/* History Grid */}
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHistory.map((session) => {
            const score = session.overallReport?.overallScore || 0;
            const grade = session.overallReport?.grade || (score > 0 ? 'B+' : 'Needs Practice');

            return (
              <div
                key={session._id}
                className="glass-card p-5 border border-slate-800/80 light:border-slate-200 hover:border-indigo-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/60 light:bg-slate-100 text-slate-300 light:text-slate-700 text-[10px] font-semibold border border-slate-800 light:border-slate-200">
                      {session.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-400 light:text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white light:text-slate-900 leading-snug">{session.jobTitle}</h3>
                  <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">{session.questionCount} Questions</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 light:border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {score}%
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Grade</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{grade}</span>
                    </div>
                  </div>

                  <Link
                    to={`/interview/${session._id}/report`}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 light:bg-slate-100 hover:bg-slate-800 light:hover:bg-slate-200 text-indigo-400 light:text-indigo-600 text-xs font-medium border border-slate-800 light:border-slate-300 flex items-center gap-1 transition-all"
                  >
                    <span>View Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center border border-slate-800/80 light:border-slate-200">
          <History className="w-10 h-10 text-slate-600 light:text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300 light:text-slate-800">No Interview History Found</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">You haven't completed any mock interview sessions yet.</p>
          <Link
            to="/interview/setup"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Practice Session</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
