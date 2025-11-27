const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { createTables } = require('./utils/database');
const plakalarRoutes = require('./routes/plakalar');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CSP için domain'i environment variable'dan al
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", corsOrigin, ...(isProduction ? [] : ["http://localhost:5000", "http://localhost:5173"])],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - CORS headers ekle
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Plaka API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/plakalar', plakalarRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'Plaka Bulma Platformu API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      plakalar: '/api/plakalar',
      'plakalar-search': '/api/plakalar/search'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} does not exist`
  });
});

// Start server
const startServer = async () => {
  try {
    // Try to create database tables (optional for now)
    try {
      await createTables();
    } catch (dbError) {
      console.log('⚠️ Database connection failed, running without database');
      console.log('💡 Install PostgreSQL to enable full functionality');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
