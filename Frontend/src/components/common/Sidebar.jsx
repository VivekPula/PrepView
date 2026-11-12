import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PlayCircle, History, Sparkles, TrendingUp, User } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Analyzer', path: '/resumes', icon: FileText },
    { label: 'Mock Interview', path: '/interview/setup', icon: PlayCircle },
    { label: 'Progress Analytics', path: '/progress', icon: TrendingUp },
    { label: 'Interview History', path: '/history', icon: History },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 p-4 min-h-[calc(100vh-65px)] transition-colors">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/25 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/50 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PrepView Tip</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Upload your resume first! AI uses your specific skills to personalize every interview question.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
