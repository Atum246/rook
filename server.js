require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const logger = require('./utils/logger');
const healthMonitor = require('./services/healthMonitor');

// ─── Import Routes ───────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const deployRoutes = require('./routes/deploy');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const chatRoutes = require('./routes/chat');

const app = express();

// ─── Security & Middleware ───────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: 'Too many requests, slow down! 🐌' }
});
app.use('/api/', limiter);

// ─── API Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chat', chatRoutes);

// ─── Health Check Endpoint ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Rook ♜',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── Serve Frontend (Production) ─────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/out')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
  });
}

// ─── Error Handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong! 🔧'
  });
});

// ─── Start Server ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rook');
    logger.info('🗄️  MongoDB connected');

    // Start health monitoring
    healthMonitor.start();
    logger.info('💓 Health monitor started');

    // Start server
    app.listen(PORT, () => {
      logger.info(`♜ Rook is live on port ${PORT}`);
      logger.info(`🔗 http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Rook:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
