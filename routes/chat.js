const express = require('express');
const router = express.Router();
const axios = require('axios');
const Agent = require('../models/Agent');
const { authMiddleware } = require('../middleware/auth');

// ─── Chat with Agent (via its live URL) ──────────────────────────
router.post('/:agentId/message', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const agent = await Agent.findOne({
      _id: req.params.agentId,
      owner: req.user._id
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found 🔍' });
    }

    if (agent.status !== 'live') {
      return res.status(400).json({ error: 'Agent is not live right now 💤' });
    }

    if (!agent.deployment.renderUrl) {
      return res.status(400).json({ error: 'Agent URL not configured 🔗' });
    }

    // Forward the message to the live agent
    try {
      const response = await axios.post(
        `${agent.deployment.renderUrl}/api/chat`,
        { message },
        { timeout: 30000 }
      );

      // Update stats
      agent.stats.totalMessages += 1;
      agent.stats.lastActive = new Date();
      await agent.save();

      res.json({
        reply: response.data.reply || response.data.message || response.data,
        agent: agent.name,
        timestamp: new Date().toISOString()
      });
    } catch (proxyError) {
      // If the agent is unreachable
      res.status(502).json({
        error: 'Agent is not responding 😔',
        detail: proxyError.message,
        suggestion: 'Try restarting the agent from the dashboard'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Chat History (from agent's DB) ──────────────────────────
router.get('/:agentId/history', authMiddleware, async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.agentId,
      owner: req.user._id
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found 🔍' });
    }

    if (agent.status !== 'live' || !agent.deployment.renderUrl) {
      return res.json({ messages: [], note: 'Agent not available' });
    }

    try {
      const response = await axios.get(
        `${agent.deployment.renderUrl}/api/chat/history`,
        { timeout: 10000 }
      );
      res.json({ messages: response.data.messages || response.data || [] });
    } catch {
      res.json({ messages: [], note: 'Could not fetch history' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── WebSocket Info (for live chat) ──────────────────────────────
router.get('/:agentId/ws-info', authMiddleware, async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.agentId,
      owner: req.user._id
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found 🔍' });
    }

    res.json({
      wsUrl: agent.deployment.renderUrl
        ? agent.deployment.renderUrl.replace('https://', 'wss://').replace('http://', 'ws://')
        : null,
      httpUrl: agent.deployment.renderUrl,
      status: agent.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
