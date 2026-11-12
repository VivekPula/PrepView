import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axiosInstance from '../api/axios';
import { 
  User, Mail, Briefcase, Lock, Palette, Save, 
  CheckCircle2, Shield, Sparkles, Award, Sun, Moon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    targetRole: user?.targetRole || 'Software Engineer',
    experienceLevel: user?.experienceLevel || 'Mid Level',
    bio: user?.bio || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await axiosInstance.put('/auth/profile', {
        ...formData,
        preferredTheme: theme,
      });
      setUser(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    try {
      setUpdatingPassword(true);
      await axiosInstance.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 font-bold text-2xl text-white flex items-center justify-center shadow-xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <h1 className="text-xl font-bold text-white light:text-slate-900 flex items-center justify-center sm:justify-start gap-2">
            {user?.name}
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 light:text-indigo-600 text-xs font-medium">
              Candidate Profile
            </span>
          </h1>
          <p className="text-slate-400 light:text-slate-500 text-xs">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-400 light:text-slate-500">
            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-indigo-400" /> {user?.targetRole}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-indigo-400" /> {user?.experienceLevel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings Form */}
        <div className="md:col-span-2 glass-card p-6 space-y-6">
          <div className="border-b border-slate-800/80 light:border-slate-200 pb-4">
            <h2 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Personal Profile Details
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-500">Update target role & career info</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-slate-200 light:text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Target Job Role</label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  placeholder="e.g. Full-Stack Developer"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-slate-200 light:text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-slate-200 light:text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Lead/Manager">Lead / Manager</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 light:text-slate-700">Bio / Summary</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Short career summary..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-slate-200 light:text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{updatingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </form>
        </div>

        {/* Theme & Security Side Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="border-b border-slate-800/80 light:border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" />
                Appearance Mode
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500">Toggle website color theme</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300 font-semibold'
                    : 'bg-slate-900/40 light:bg-slate-50 border-slate-800 light:border-slate-300 text-slate-400 light:text-slate-600'
                }`}
              >
                <Moon className="w-5 h-5 mb-1.5 text-indigo-400" />
                <span>Dark Mode</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600 font-semibold'
                    : 'bg-slate-900/40 light:bg-slate-50 border-slate-800 light:border-slate-300 text-slate-400 light:text-slate-600'
                }`}
              >
                <Sun className="w-5 h-5 mb-1.5 text-amber-500" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="glass-card p-6 space-y-4">
            <div className="border-b border-slate-800/80 light:border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                Security
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500">Update account password</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-slate-200 light:text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-slate-200 light:text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-slate-200 light:text-slate-900 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2 rounded-xl bg-slate-800 light:bg-slate-200 hover:bg-slate-700 light:hover:bg-slate-300 text-white light:text-slate-800 font-medium text-xs transition-colors disabled:opacity-50"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
