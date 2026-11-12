import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('prepview_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          localStorage.removeItem('prepview_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('prepview_token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    localStorage.setItem('prepview_token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('prepview_token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await API.put('/auth/profile', data);
    setUser(prev => ({ ...prev, ...res.data }));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
