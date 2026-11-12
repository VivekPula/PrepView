import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'PrepView API is running successfully' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

export default app;