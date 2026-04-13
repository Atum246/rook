const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'team'],
    default: 'free'
  },
  // Connected API keys (encrypted)
  apiKeys: {
    openrouter: { type: String, default: null },
    groq: { type: String, default: null },
    together: { type: String, default: null }
  },
  // Render connection
  render: {
    apiKey: { type: String, default: null },
    ownerId: { type: String, default: null },
    connected: { type: Boolean, default: false }
  },
  // MongoDB Atlas connection
  mongodb: {
    publicKey: { type: String, default: null },
    privateKey: { type: String, default: null },
    projectId: { type: String, default: null },
    orgId: { type: String, default: null },
    connected: { type: Boolean, default: false }
  },
  // Cron-job.org connection
  cronjob: {
    apiKey: { type: String, default: null },
    connected: { type: Boolean, default: false }
  },
  // Agent limits based on plan
  agentLimit: {
    type: Number,
    default: 1
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
