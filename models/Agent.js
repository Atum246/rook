const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  template: {
    type: String,
    enum: ['personal-assistant', 'customer-support', 'code-helper', 'custom'],
    default: 'personal-assistant'
  },
  status: {
    type: String,
    enum: ['deploying', 'live', 'sleeping', 'error', 'stopped'],
    default: 'deploying'
  },
  // Render deployment info
  deployment: {
    renderServiceId: { type: String, default: null },
    renderUrl: { type: String, default: null },
    region: { type: String, default: 'oregon' },
    buildCommand: { type: String, default: 'npm install' },
    startCommand: { type: String, default: 'npm start' },
    deployedAt: { type: Date, default: null }
  },
  // MongoDB database for this agent
  database: {
    atlasClusterId: { type: String, default: null },
    connectionString: { type: String, default: null }, // encrypted
    dbName: { type: String, default: null }
  },
  // Cron-job keep-alive
  keepAlive: {
    cronJobId: { type: Number, default: null },
    url: { type: String, default: null },
    intervalMinutes: { type: Number, default: 5 },
    lastPing: { type: Date, default: null }
  },
  // Model configuration
  model: {
    provider: { type: String, default: 'openrouter' },
    modelId: { type: String, default: 'google/gemini-flash-1.5-free' },
    temperature: { type: Number, default: 0.7 }
  },
  // Messaging connections
  messaging: {
    telegram: {
      enabled: { type: Boolean, default: false },
      botToken: { type: String, default: null },
      chatId: { type: String, default: null }
    },
    whatsapp: {
      enabled: { type: Boolean, default: false },
      paired: { type: Boolean, default: false }
    },
    discord: {
      enabled: { type: Boolean, default: false },
      botToken: { type: String, default: null },
      guildId: { type: String, default: null }
    }
  },
  // Stats
  stats: {
    totalMessages: { type: Number, default: 0 },
    lastActive: { type: Date, default: null },
    uptimePercent: { type: Number, default: 100 },
    skillsInstalled: { type: Number, default: 0 }
  },
  // Config overrides
  config: {
    soul: { type: String, default: null },
    agentsMd: { type: String, default: null },
    heartbeatEnabled: { type: Boolean, default: true },
    heartbeatInterval: { type: Number, default: 30 }
  },
  // Logs (recent)
  recentLogs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String },
    message: { type: String }
  }],
  // Health
  lastHealthCheck: {
    type: Date,
    default: null
  },
  healthStatus: {
    type: String,
    enum: ['healthy', 'degraded', 'unhealthy', 'unknown'],
    default: 'unknown'
  }
}, {
  timestamps: true
});

// Index for quick lookups
agentSchema.index({ owner: 1, status: 1 });
agentSchema.index({ 'deployment.renderServiceId': 1 });

module.exports = mongoose.model('Agent', agentSchema);
