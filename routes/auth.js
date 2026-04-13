const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authMiddleware } = require('../middleware/auth');
const { encrypt } = require('../utils/crypto');
const openrouterService = require('../services/openrouterService');

// ─── Register ────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required 📝' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters 🔒' });
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered 📧' });
    }

    const user = await User.create({ email, password, name });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Welcome to Rook! ♜🎉',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Login ───────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required 🔑' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials 🔐' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Welcome back! ♜✨',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Current User ────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

// ─── Update Profile ──────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    await user.save();

    res.json({ message: 'Profile updated! ✨', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Connect OpenRouter Key ──────────────────────────────────────
router.post('/connect/openrouter', authMiddleware, async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key required 🔑' });
    }

    // Validate the key
    const validation = await openrouterService.validateKey(apiKey);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid OpenRouter API key ❌' });
    }

    // Encrypt and save
    req.user.apiKeys.openrouter = encrypt(apiKey);
    await req.user.save();

    res.json({
      message: 'OpenRouter connected! 🤖✨',
      credits: validation.credits,
      usage: validation.usage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Connect Render ──────────────────────────────────────────────
router.post('/connect/render', authMiddleware, async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'Render API key required 🔑' });
    }

    req.user.render.apiKey = encrypt(apiKey);
    req.user.render.connected = true;
    await req.user.save();

    res.json({ message: 'Render connected! 🚀✨' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Connect MongoDB Atlas ───────────────────────────────────────
router.post('/connect/mongodb', authMiddleware, async (req, res) => {
  try {
    const { publicKey, privateKey, projectId, orgId } = req.body;

    if (!publicKey || !privateKey || !projectId) {
      return res.status(400).json({ error: 'All MongoDB Atlas credentials required 🗄️' });
    }

    req.user.mongodb.publicKey = encrypt(publicKey);
    req.user.mongodb.privateKey = encrypt(privateKey);
    req.user.mongodb.projectId = projectId;
    req.user.mongodb.orgId = orgId || null;
    req.user.mongodb.connected = true;
    await req.user.save();

    res.json({ message: 'MongoDB Atlas connected! 🗄️✨' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Connect Cron-job.org ────────────────────────────────────────
router.post('/connect/cronjob', authMiddleware, async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'Cron-job API key required 🔑' });
    }

    req.user.cronjob.apiKey = encrypt(apiKey);
    req.user.cronjob.connected = true;
    await req.user.save();

    res.json({ message: 'Cron-job.org connected! ⏰✨' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Connection Status ───────────────────────────────────────
router.get('/connections', authMiddleware, async (req, res) => {
  const user = req.user;
  res.json({
    connections: {
      openrouter: {
        connected: !!user.apiKeys.openrouter,
        icon: '🤖'
      },
      render: {
        connected: user.render.connected,
        icon: '🚀'
      },
      mongodb: {
        connected: user.mongodb.connected,
        icon: '🗄️'
      },
      cronjob: {
        connected: user.cronjob.connected,
        icon: '⏰'
      }
    }
  });
});

module.exports = router;
