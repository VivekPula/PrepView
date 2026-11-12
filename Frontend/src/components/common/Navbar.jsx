import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, User, LogOut, Briefcase, ChevronDown, Sun, Moon, TrendingUp, PlayCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight nav-text-primary">
              Prep<span className="text-indigo-600 dark:text-indigo-400">View</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider -mt-1">
              AI INTERVIEW PLATFORM
            </span>
          </div>
        </Link>

        {/* User Info & Actions */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <Link
              to="/interview/setup"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs transition-all hover:-translate-y-0.5"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Mock Interview</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-300 dark:hover:border-slate-800 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold nav-text-primary leading-tight">{user.name}</span>
                  <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold leading-tight">{user.targetRole || 'Software Engineer'}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800/80">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Signed in as</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/30 w-fit">
                      <Briefcase className="w-3 h-3" />
                      <span>{user.experienceLevel || 'Mid Level'}</span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/progress"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left border-b border-slate-200 dark:border-slate-800/60"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Progress Analytics</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800"
              title="Toggle Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <Link
              to="/login"
              className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-xs transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
