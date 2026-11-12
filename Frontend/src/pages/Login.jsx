import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back to PrepView!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-[#090d16] light:bg-[#f8fafc] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md glass-card p-8 shadow-xl relative z-10 border border-slate-800/80 light:border-slate-200">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 text-white">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white light:text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1">Sign in to access your AI interview practice dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/40 light:bg-rose-50 border border-rose-800/50 light:border-rose-200 flex items-center gap-2.5 text-rose-300 light:text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 light:text-slate-900 placeholder-slate-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 light:text-slate-900 placeholder-slate-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 light:text-slate-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 light:text-indigo-600 hover:underline font-semibold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
