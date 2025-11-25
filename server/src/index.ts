import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';
import warrantyRoutes from './routes/warrantyRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import membershipRoutes from './routes/membershipRoutes';
import categoryRoutes from './routes/categoryRoutes';
import { syncDatabase } from './models';
import path from 'path';
import fs from 'fs';
import emailService from './services/emailService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const clientBuildPath = path.join(__dirname, '../../client/dist');
const hasClientBuild = fs.existsSync(clientBuildPath);

if (hasClientBuild) {
  console.log('✅ Client build detected. Serving static files from:', clientBuildPath);
  app.use(express.static(clientBuildPath));
}

// Root endpoint
app.get('/', (req, res) => {
  if (hasClientBuild) {
    return res.sendFile(path.join(clientBuildPath, 'index.html'));
  }

  return res.json({
    message: 'E-commerce API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// API routes (wrapped in try-catch to prevent startup crashes)
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/warranties', warrantyRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/memberships', membershipRoutes);
  app.use('/api/categories', categoryRoutes);
  console.log('✅ API routes registered successfully');
} catch (error: any) {
  console.error('❌ Failed to register API routes:', error.message);
  // Server will still start, but API routes won't work
}

// Serve static files from uploads directory
try {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET');
    }
  }));
} catch (error: any) {
  console.log('⚠️  Could not set up uploads directory:', error.message);
}

// SPA fallback for non-API routes when client build exists
if (hasClientBuild) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health')) {
      return next();
    }

    return res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Global error handlers (must be before server starts)
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit - let the server continue running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let the server continue running
});

// Start server - Railway requires listening on 0.0.0.0
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Sync database (non-blocking - server will start even if DB fails)
  syncDatabase().catch((error) => {
    console.error('⚠️  Database sync failed, but server is running:', error.message);
  });
  
  // Initialize email service
  emailService.verifyConnection().then((connected) => {
    if (connected) {
      console.log('📧 Email service connected successfully');
    } else {
      console.log('⚠️  Email service connection failed - check SMTP configuration');
    }
  }).catch((error) => {
    console.log('⚠️  Email service verification failed:', error.message);
  });
  
  // Initialize cron job scheduler (lazy load to avoid startup errors)
  try {
    const cronJobScheduler = require('./services/cronJobScheduler').default;
    console.log('🕒 Cron job scheduler initialized');
    console.log('📊 Job status:', cronJobScheduler.getJobStatus());
  } catch (error: any) {
    console.log('⚠️  Cron job scheduler initialization failed:', error.message);
  }
  
  // Initialize warranty cron service (lazy load to avoid startup errors)
  try {
    require('./services/warrantyCronService');
    console.log('🛡️  Warranty cron service initialized');
  } catch (error: any) {
    console.log('⚠️  Warranty cron service initialization failed:', error.message);
  }
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  
  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
  
  switch (error.code) {
    case 'EACCES':
      console.error(`❌ ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      console.error('❌ Server error:', error);
      throw error;
  }
});

export default app;
