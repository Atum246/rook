const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const { authMiddleware, checkPlanLimit } = require('../middleware/auth');
const deployService = require('../services/deployService');
const renderService = require('../services/renderService');
const { decrypt } = require('../utils/crypto');

// ─── List User's Agents ──────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const agents = await Agent.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .select('-database.connectionString');

    res.json({
      agents,
      total: agents.length,
      limit: req.user.agentLimit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Single Agent ────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).select('-database.connectionString');

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found 🔍' });
    }

    res.json({ agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Create New Agent ────────────────────────────────────────────
router.post('/', authMiddleware, checkPlanLimit, async (req, res) => {
  try {
    const { name, description, template, modelId, region } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Agent name required 📝' });
    }

    // Check agent limit
    const currentCount = await Agent.countDocuments({ owner: req.user._id });
    if (currentCount >= req.agentLimit) {
      return res.status(403).json({
        error: `Agent limit reached (${req.agentLimit}). Upgrade your plan! 💎`
      });
    }

    // Check required connections
    if (!req.user.apiKeys.openrouter) {
      return res.status(400).json({ error: 'Connect OpenRouter first 🤖' });
    }
    if (!req.user.render.connected) {
      return res.status(400).json({ error: 'Connect Render first 🚀' });
    }

    // Create agent record
    const agent = await Agent.create({
      owner: req.user._id,
      name,
      description: description || '',
      template: template || 'personal-assistant',
      model: {
        provider: 'openrouter',
        modelId: modelId || 'google/gemini-flash-1.5-free',
        temperature: 0.7
      },
      deployment: {
        region: region || 'oregon'
      }
    });

    // Start deployment (async)
    deployService.deployAgent(req.user, {
      agentId: agent._id,
      template: template || 'personal-assistant',
      name,
      modelId: modelId || 'google/gemini-flash-1.5-free',
      region: region || 'oregon'
    }).catch(err => {
      console.error('Deploy failed:', err);
    });

    res.status(201).json({
      message: `🚀 Deploying "${name}"...`,
      agent: agent.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Restart Agent ───────────────────────────────────────────────
router.post('/:id/restart', authMiddleware, async (req, res) => {
  try {
    const result = await deployService.restartAgent(req.user, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Delete Agent ────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await deployService.deleteAgent(req.user, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Agent Logs ──────────────────────────────────────────────
router.get('/:id/logs', authMiddleware, async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found 🔍' });
    }

    // Get Render deploy logs
    const renderLogs = await deployService.getDeployLogs(req.user, req.params.id);

    res.json({
      agentLogs: agent.recentLogs || [],
      deployLogs: renderLogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update Agent Config ─────────────────────────────────────────
router.put('/:id/config', authMiddleware, async (req, res) => {
  try {
    const { name, description, modelId, temperature, soul, heartbeatEnabled, heartbeatInterval } = req.body;
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found 🔍' });
    }

    if (name) agent.name = name;
    if (description !== undefined) agent.description = description;
    if (modelId) agent.model.modelId = modelId;
    if (temperature !== undefined) agent.model.temperature = temperature;
    if (soul !== undefined) agent.config.soul = soul;
    if (heartbeatEnabled !== undefined) agent.config.heartbeatEnabled = heartbeatEnabled;
    if (heartbeatInterval) agent.config.heartbeatInterval = heartbeatInterval;

    await agent.save();

    res.json({ message: 'Config updated! ⚙️✨', agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Agent Stats ─────────────────────────────────────────────
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found 🔍' });
    }

    res.json({
      stats: agent.stats,
      health: {
        status: agent.healthStatus,
        lastCheck: agent.lastHealthCheck
      },
      keepAlive: {
        active: !!agent.keepAlive.cronJobId,
        lastPing: agent.keepAlive.lastPing,
        interval: agent.keepAlive.intervalMinutes
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Available Templates ─────────────────────────────────────
router.get('/meta/templates', (req, res) => {
  res.json({ templates: deployService.TEMPLATES });
});

module.exports = router;
