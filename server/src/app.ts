import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth';
import tripsRoutes from './routes/trips';
import communityRoutes from './routes/community';
import sosRoutes from './routes/sos';
import adminRoutes from './routes/admin';

// Utils
import { startAllSchedulers, getSchedulerHealth } from './utils/scheduler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint with API documentation
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to SafeTrails API!',
    status: 'Server is running successfully',
    version: '1.0.0',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      authentication: '/api/auth',
      trips: '/api/trips',
      community: '/api/community',
      sos: '/api/sos',
      admin: '/api/admin',
      health: '/health',
      scheduler: '/scheduler-health'
    },
    features: [
      '🔐 JWT Authentication & KYC Verification',
      '🗺️ Trip Planning & Real-time Tracking',
      '👥 Community Safety Reporting',
      '🚨 Emergency SOS System',
      '📊 Admin Dashboard & Analytics',
      '📸 File Upload Support',
      '⏰ Automated Location Tracking'
    ]
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Scheduler health check
app.get('/scheduler-health', (req: Request, res: Response) => {
  res.json({
    message: 'Scheduler Status',
    ...getSchedulerHealth()
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start schedulers
if (process.env.NODE_ENV !== 'test') {
  startAllSchedulers();
}

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 SafeTrails API Server Started Successfully!');
  console.log('='.repeat(60));
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`⏰ Scheduler Status: http://localhost:${PORT}/scheduler-health`);
  console.log('='.repeat(60));
  console.log('📚 Available Endpoints:');
  console.log('   🔐 Authentication: /api/auth');
  console.log('   🗺️  Trip Management: /api/trips');
  console.log('   👥 Community Reports: /api/community');
  console.log('   🚨 Emergency SOS: /api/sos');
  console.log('   📊 Admin Dashboard: /api/admin');
  console.log('='.repeat(60));
});

export default app;
