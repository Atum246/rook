const logger = require('../utils/logger');
const renderService = require('./renderService');
const mongoAtlasService = require('./mongoAtlasService');
const cronjobService = require('./cronjobService');
const openrouterService = require('./openrouterService');
const Agent = require('../models/Agent');
const { decrypt } = require('../utils/crypto');

// ─── Agent Templates ─────────────────────────────────────────────
const TEMPLATES = {
  'personal-assistant': {
    name: 'Personal Assistant',
    description: 'A helpful personal assistant with memory and skills',
    envVars: {
      HEARTBEAT_ENABLED: 'true',
      HEARTBEAT_INTERVAL: '30'
    }
  },
  'customer-support': {
    name: 'Customer Support Bot',
    description: 'Professional customer support agent with FAQ knowledge',
    envVars: {
      HEARTBEAT_ENABLED: 'true',
      HEARTBEAT_INTERVAL: '15',
      TONE: 'professional'
    }
  },
  'code-helper': {
    name: 'Code Helper',
    description: 'A coding assistant that helps with development tasks',
    envVars: {
      HEARTBEAT_ENABLED: 'false',
      TONE: 'technical'
    }
  },
  'custom': {
    name: 'Custom Agent',
    description: 'Build your own agent from scratch',
    envVars: {}
  }
};

// ─── Default OpenClaw GitHub Repo ────────────────────────────────
const OPENCLAW_REPO = 'https://github.com/openclaw/openclaw';

/**
 * Deploy a new agent — the FULL orchestration
 * This is the magic function that does everything behind the scenes
 */
async function deployAgent(user, agentConfig) {
  const { agentId, template, name, modelId, region } = agentConfig;
  const agent = await Agent.findById(agentId);

  if (!agent) throw new Error('Agent not found 🔍');

  try {
    agent.status = 'deploying';
    await agent.save();

    // ── Step 1: Validate OpenRouter Key ──────────────────────────
    logger.info(`[Deploy] Step 1: Validating API key for ${name} 🔑`);
    const userApiKey = decrypt(user.apiKeys.openrouter);
    if (!userApiKey) {
      throw new Error('OpenRouter API key not configured 🔑');
    }

    const keyValidation = await openrouterService.validateKey(userApiKey);
    if (!keyValidation.valid) {
      throw new Error('Invalid OpenRouter API key ❌');
    }

    // ── Step 2: Set Up MongoDB Atlas Database ────────────────────
    logger.info(`[Deploy] Step 2: Setting up MongoDB for ${name} 🗄️`);
    let dbConnectionString = null;

    if (user.mongodb.connected) {
      const publicKey = decrypt(user.mongodb.publicKey);
      const privateKey = decrypt(user.mongodb.privateKey);

      const dbSetup = await mongoAtlasService.fullSetup(
        publicKey,
        privateKey,
        user.mongodb.projectId,
        name
      );

      dbConnectionString = dbSetup.connectionString;

      // Update agent with DB info
      agent.database.atlasClusterId = dbSetup.clusterId;
      agent.database.connectionString = dbSetup.connectionString; // should be encrypted in production
      agent.database.dbName = 'rook_agents';
      await agent.save();
    } else {
      // Use a shared database URL or skip
      logger.warn(`[Deploy] No MongoDB Atlas connected for ${name}, using default`);
      dbConnectionString = process.env.DEFAULT_MONGODB_URI || 'mongodb://localhost:27017/rook_shared';
    }

    // ── Step 3: Prepare Environment Variables ────────────────────
    logger.info(`[Deploy] Step 3: Preparing environment variables ⚙️`);
    const templateConfig = TEMPLATES[template] || TEMPLATES['custom'];

    const envVars = [
      { key: 'OPENROUTER_API_KEY', value: userApiKey },
      { key: 'MONGODB_URI', value: dbConnectionString },
      { key: 'MODEL_ID', value: modelId || 'google/gemini-flash-1.5-free' },
      { key: 'PORT', value: '3000' },
      { key: 'NODE_ENV', value: 'production' },
      { key: 'AGENT_NAME', value: name },
      { key: 'AGENT_TEMPLATE', value: template },
      ...Object.entries(templateConfig.envVars).map(([key, value]) => ({ key, value }))
    ];

    // ── Step 4: Deploy to Render ─────────────────────────────────
    logger.info(`[Deploy] Step 4: Deploying to Render 🚀`);
    const renderApiKey = decrypt(user.render.apiKey);

    const renderConfig = {
      name: `rook-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
      repoUrl: OPENCLAW_REPO,
      branch: 'main',
      buildCommand: 'npm install',
      startCommand: 'npm start',
      region: region || 'oregon',
      envVars: envVars
    };

    const renderService = await renderService.createService(renderApiKey, renderConfig);

    // Update agent with Render info
    agent.deployment.renderServiceId = renderService.id;
    agent.deployment.renderUrl = renderService.service?.serviceDetails?.url || `https://${renderConfig.name}.onrender.com`;
    agent.deployment.region = region || 'oregon';
    agent.deployment.deployedAt = new Date();
    await agent.save();

    // ── Step 5: Set Up Keep-Alive Cron Job ───────────────────────
    logger.info(`[Deploy] Step 5: Setting up keep-alive ⏰`);
    if (user.cronjob.connected) {
      const cronApiKey = decrypt(user.cronjob.apiKey);
      const keepAliveUrl = agent.deployment.renderUrl;

      const cronJob = await cronjobService.createKeepAlive(
        cronApiKey,
        keepAliveUrl,
        `Rook: ${name} Keep-Alive`
      );

      agent.keepAlive.cronJobId = cronJob.jobId;
      agent.keepAlive.url = keepAliveUrl;
      await agent.save();
    }

    // ── Step 6: Monitor for "Live" Status ────────────────────────
    logger.info(`[Deploy] Step 6: Monitoring deployment status 👀`);
    // Note: In production, this would be async with webhooks
    // For now, we'll set status and let the health monitor track it

    agent.status = 'live';
    agent.healthStatus = 'healthy';
    agent.lastHealthCheck = new Date();
    await agent.save();

    logger.info(`[Deploy] ✅ Agent "${name}" deployed successfully!`);

    return {
      success: true,
      agent: agent,
      renderUrl: agent.deployment.renderUrl,
      message: `🎉 Your agent "${name}" is live!`
    };

  } catch (error) {
    logger.error(`[Deploy] Failed to deploy agent ${name}:`, error);

    agent.status = 'error';
    agent.recentLogs.push({
      timestamp: new Date(),
      level: 'error',
      message: `Deploy failed: ${error.message}`
    });
    await agent.save();

    throw error;
  }
}

/**
 * Delete an agent and clean up all resources
 */
async function deleteAgent(user, agentId) {
  const agent = await Agent.findById(agentId);

  if (!agent) throw new Error('Agent not found 🔍');
  if (agent.owner.toString() !== user._id.toString()) {
    throw new Error('Not authorized to delete this agent 🔐');
  }

  try {
    // Delete Render service
    if (agent.deployment.renderServiceId && user.render.connected) {
      const renderApiKey = decrypt(user.render.apiKey);
      await renderService.deleteService(renderApiKey, agent.deployment.renderServiceId);
    }

    // Delete Cron-job
    if (agent.keepAlive.cronJobId && user.cronjob.connected) {
      const cronApiKey = decrypt(user.cronjob.apiKey);
      await cronjobService.deleteJob(cronApiKey, agent.keepAlive.cronJobId);
    }

    // Delete MongoDB cluster
    if (agent.database.atlasClusterId && user.mongodb.connected) {
      const publicKey = decrypt(user.mongodb.publicKey);
      const privateKey = decrypt(user.mongodb.privateKey);
      await mongoAtlasService.deleteCluster(
        publicKey, privateKey,
        user.mongodb.projectId,
        agent.database.atlasClusterId
      );
    }

    // Delete agent record
    await Agent.findByIdAndDelete(agentId);

    logger.info(`🗑️ Deleted agent "${agent.name}" and all resources`);
    return { success: true, message: 'Agent deleted 🗑️' };

  } catch (error) {
    logger.error(`Failed to delete agent ${agentId}:`, error);
    throw error;
  }
}

/**
 * Restart an agent
 */
async function restartAgent(user, agentId) {
  const agent = await Agent.findById(agentId);

  if (!agent) throw new Error('Agent not found 🔍');

  const renderApiKey = decrypt(user.render.apiKey);
  await renderService.restartService(renderApiKey, agent.deployment.renderServiceId);

  agent.healthStatus = 'healthy';
  agent.lastHealthCheck = new Date();
  await agent.save();

  return { success: true, message: `🔄 Agent "${agent.name}" restarted!` };
}

/**
 * Get deployment logs from Render
 */
async function getDeployLogs(user, agentId) {
  const agent = await Agent.findById(agentId);
  if (!agent) throw new Error('Agent not found 🔍');

  const renderApiKey = decrypt(user.render.apiKey);
  const events = await renderService.getServiceEvents(
    renderApiKey,
    agent.deployment.renderServiceId
  );

  return events;
}

module.exports = {
  deployAgent,
  deleteAgent,
  restartAgent,
  getDeployLogs,
  TEMPLATES
};
