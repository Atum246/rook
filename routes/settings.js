const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/crypto');
const User = require('../models/User');

// ─── Get User Settings ───────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const user = req.user;
  res.json({
    settings: {
      name: user.name,
      email: user.email,
      plan: user.plan,
      agentLimit: user.agentLimit,
      connections: {
        openrouter: { connected: !!user.apiKeys.openrouter },
        render: { connected: user.render.connected },
        mongodb: { connected: user.mongodb.connected },
        cronjob: { connected: user.cronjob.connected }
      },
      lastLogin: user.lastLogin
    }
  });
});

// ─── Update Plan ─────────────────────────────────────────────────
router.put('/plan', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    const validPlans = ['free', 'pro', 'team'];
    const limits = { free: 1, pro: 5, team: Infinity };

    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan 📋' });
    }

    req.user.plan = plan;
    req.user.agentLimit = limits[plan];
    await req.user.save();

    res.json({
      message: `Plan updated to ${plan}! 💎`,
      plan: req.user.plan,
      agentLimit: req.user.agentLimit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Disconnect a Service ────────────────────────────────────────
router.delete('/connections/:service', authMiddleware, async (req, res) => {
  try {
    const { service } = req.params;
    const user = req.user;

    switch (service) {
      case 'openrouter':
        user.apiKeys.openrouter = null;
        break;
      case 'render':
        user.render.apiKey = null;
        user.render.connected = false;
        break;
      case 'mongodb':
        user.mongodb.publicKey = null;
        user.mongodb.privateKey = null;
        user.mongodb.connected = false;
        break;
      case 'cronjob':
        user.cronjob.apiKey = null;
        user.cronjob.connected = false;
        break;
      default:
        return res.status(400).json({ error: 'Unknown service 🤷' });
    }

    await user.save();
    res.json({ message: `${service} disconnected 🔌` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Change Password ─────────────────────────────────────────────
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required 🔒' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be 8+ characters 🔒' });
    }

    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password incorrect 🔐' });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password changed! 🔒✨' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Export User Data ────────────────────────────────────────────
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const user = req.user.toObject();
    delete user.password;
    delete user.apiKeys;
    delete user.render;
    delete user.mongodb;
    delete user.cronjob;

    res.json({
      message: 'Your data export 📦',
      exportedAt: new Date().toISOString(),
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
