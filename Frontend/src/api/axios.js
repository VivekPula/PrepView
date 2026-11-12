import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Interceptor to attach Bearer token to all outgoing requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('prepview_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
