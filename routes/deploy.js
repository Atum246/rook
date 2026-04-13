const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const renderService = require('../services/renderService');
const openrouterService = require('../services/openrouterService');
const { decrypt } = require('../utils/crypto');

// ─── One-Click Deploy (Full Orchestration) ───────────────────────
router.post('/one-click', authMiddleware, async (req, res) => {
  try {
    const { name, template, modelId, region } = req.body;
    const user = req.user;

    // Pre-flight checks
    const checks = {
      openrouter: !!user.apiKeys.openrouter,
      render: user.render.connected,
      mongodb: user.mongodb.connected,
      cronjob: user.cronjob.connected
    };

    if (!checks.openrouter || !checks.render) {
      return res.status(400).json({
        error: 'Missing required connections ⚠️',
        checks,
        required: ['openrouter', 'render'],
        optional: ['mongodb', 'cronjob']
      });
    }

    // This delegates to the agents route
    // Forward to agent creation
    res.status(200).json({
      message: 'All checks passed! Ready to deploy ✅',
      checks,
      nextStep: `POST /api/agents with name="${name}" template="${template}"`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Check Deploy Prerequisites ──────────────────────────────────
router.get('/prerequisites', authMiddleware, async (req, res) => {
  const user = req.user;

  const prereqs = {
    openrouter: {
      connected: !!user.apiKeys.openrouter,
      required: true,
      label: 'AI Model (OpenRouter)',
      icon: '🤖'
    },
    render: {
      connected: user.render.connected,
      required: true,
      label: 'Hosting (Render)',
      icon: '🚀'
    },
    mongodb: {
      connected: user.mongodb.connected,
      required: false,
      label: 'Database (MongoDB Atlas)',
      icon: '🗄️'
    },
    cronjob: {
      connected: user.cronjob.connected,
      required: false,
      label: 'Keep-Alive (Cron-job.org)',
      icon: '⏰'
    }
  };

  const allRequired = Object.entries(prereqs)
    .filter(([, v]) => v.required)
    .every(([, v]) => v.connected);

  const connectedCount = Object.values(prereqs).filter(v => v.connected).length;
  const totalCount = Object.keys(prereqs).length;

  res.json({
    prereqs,
    readyToDeploy: allRequired,
    progress: `${connectedCount}/${totalCount}`,
    message: allRequired
      ? '🎉 All set! Ready to deploy!'
      : '⚠️ Connect required services to deploy'
  });
});

// ─── Get Available Regions ───────────────────────────────────────
router.get('/regions', authMiddleware, async (req, res) => {
  try {
    if (!req.user.render.connected) {
      return res.status(400).json({ error: 'Connect Render first 🚀' });
    }

    const apiKey = decrypt(req.user.render.apiKey);
    const regions = await renderService.getRegions(apiKey);
    res.json({ regions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Available Models ────────────────────────────────────────
router.get('/models', async (req, res) => {
  try {
    const models = await openrouterService.listFreeModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
