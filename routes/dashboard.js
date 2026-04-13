const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const { authMiddleware } = require('../middleware/auth');
const healthMonitor = require('../services/healthMonitor');

// ─── Dashboard Overview ──────────────────────────────────────────
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const agents = await Agent.find({ owner: req.user._id });

    const overview = {
      totalAgents: agents.length,
      online: agents.filter(a => a.status === 'live').length,
      deploying: agents.filter(a => a.status === 'deploying').length,
      error: agents.filter(a => a.status === 'error').length,
      sleeping: agents.filter(a => a.status === 'sleeping').length,
      totalMessages: agents.reduce((sum, a) => sum + (a.stats?.totalMessages || 0), 0),
      avgUptime: agents.length > 0
        ? agents.reduce((sum, a) => sum + (a.stats?.uptimePercent || 0), 0) / agents.length
        : 100,
      plan: req.user.plan,
      agentLimit: req.user.agentLimit
    };

    res.json({ overview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Agent Cards (for dashboard list) ────────────────────────────
router.get('/agents', authMiddleware, async (req, res) => {
  try {
    const agents = await Agent.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .select('-database.connectionString');

    const cards = agents.map(agent => ({
      id: agent._id,
      name: agent.name,
      status: agent.status,
      health: agent.healthStatus,
      template: agent.template,
      model: agent.model.modelId,
      url: agent.deployment.renderUrl,
      messages: agent.stats.totalMessages,
      uptime: agent.stats.uptimePercent,
      lastActive: agent.stats.lastActive,
      createdAt: agent.createdAt,
      messaging: {
        telegram: agent.messaging.telegram.enabled,
        whatsapp: agent.messaging.whatsapp.enabled,
        discord: agent.messaging.discord.enabled
      },
      keepAlive: !!agent.keepAlive.cronJobId
    }));

    res.json({ agents: cards });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Activity Feed ───────────────────────────────────────────────
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const agents = await Agent.find({ owner: req.user._id })
      .select('name recentLogs')
      .sort({ updatedAt: -1 });

    const activities = [];
    for (const agent of agents) {
      for (const log of (agent.recentLogs || []).slice(-10)) {
        activities.push({
          agent: agent.name,
          level: log.level,
          message: log.message,
          timestamp: log.timestamp
        });
      }
    }

    // Sort by timestamp descending, limit to 50
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ activities: activities.slice(0, 50) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Health Overview (global) ────────────────────────────────────
router.get('/health', authMiddleware, async (req, res) => {
  try {
    const summary = await healthMonitor.getHealthSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
