import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import DashBoard from './pages/DashBoard';
import ResumesPage from './pages/ResumesPage';
import InterviewSetup from './pages/InterviewSetup';
import MockInterviewPage from './pages/MockInterviewPage';
import InterviewReportPage from './pages/InterviewReportPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-cyan-400 font-semibold">
        Loading PrepView...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#f3f4f6',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashBoard />} />
              <Route path="resumes" element={<ResumesPage />} />
              <Route path="interview/setup" element={<InterviewSetup />} />
              <Route path="interview/:id" element={<MockInterviewPage />} />
              <Route path="interview/:id/report" element={<InterviewReportPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
