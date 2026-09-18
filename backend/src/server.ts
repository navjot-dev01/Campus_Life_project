import express from 'express';
import { CONFIG } from './config/index.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/journey', journeyRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CampusLife API',
    timestamp: new Date().toISOString()
  });
});

export default app;
