import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    targetRole: 'Software Engineer',
    experienceLevel: 'Mid Level',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-[#090d16] light:bg-[#f8fafc] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md glass-card p-8 shadow-xl relative z-10 border border-slate-800/80 light:border-slate-200 my-8">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 text-white">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white light:text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">Start practicing tailored interview questions today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/40 light:bg-rose-50 border border-rose-800/50 light:border-rose-200 flex items-center gap-2.5 text-rose-300 light:text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 light:text-slate-900 placeholder-slate-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 light:text-slate-900 placeholder-slate-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 light:text-slate-900 placeholder-slate-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
                placeholder="Frontend Developer"
                className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-slate-200 light:text-slate-900 placeholder-slate-500 text-xs outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-1.5">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-slate-200 light:text-slate-900 text-xs outline-none transition-all"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Lead/Manager">Lead/Manager</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 light:text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 light:text-indigo-600 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
