const cron = require('node-cron');
const logger = require('../utils/logger');
const Agent = require('../models/Agent');
const axios = require('axios');

const CHECK_INTERVAL = '*/2 * * * *'; // Every 2 minutes

/**
 * Health Monitor — watches all agents and auto-fixes issues
 */
class HealthMonitor {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the health monitoring loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    logger.info('💓 Health Monitor started — checking every 2 minutes');

    cron.schedule(CHECK_INTERVAL, async () => {
      await this.checkAllAgents();
    });
  }

  /**
   * Stop the health monitor
   */
  stop() {
    this.isRunning = false;
    logger.info('💓 Health Monitor stopped');
  }

  /**
   * Check health of all live agents
   */
  async checkAllAgents() {
    try {
      const agents = await Agent.find({
        status: { $in: ['live', 'deploying'] }
      });

      if (agents.length === 0) return;

      logger.info(`💓 Checking health of ${agents.length} agent(s)...`);

      for (const agent of agents) {
        await this.checkAgent(agent);
      }
    } catch (error) {
      logger.error('Health check failed:', error.message);
    }
  }

  /**
   * Check health of a single agent
   */
  async checkAgent(agent) {
    try {
      if (!agent.deployment.renderUrl) {
        agent.healthStatus = 'unknown';
        await agent.save();
        return;
      }

      // Ping the agent
      const startTime = Date.now();
      const response = await axios.get(`${agent.deployment.renderUrl}/api/health`, {
        timeout: 10000
      });
      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        agent.healthStatus = 'healthy';
        agent.status = 'live';
        agent.lastHealthCheck = new Date();
        agent.recentLogs.push({
          timestamp: new Date(),
          level: 'info',
          message: `Health OK — ${responseTime}ms response time 💚`
        });

        // Keep only last 50 logs
        if (agent.recentLogs.length > 50) {
          agent.recentLogs = agent.recentLogs.slice(-50);
        }

        await agent.save();
        logger.debug(`💚 ${agent.name}: Healthy (${responseTime}ms)`);
      }
    } catch (error) {
      // Agent is down!
      logger.warn(`❤️‍🔥 ${agent.name}: Unhealthy — ${error.message}`);

      agent.healthStatus = 'unhealthy';
      agent.recentLogs.push({
        timestamp: new Date(),
        level: 'warn',
        message: `Health check failed: ${error.message} ❤️‍🔥`
      });

      // Auto-restart logic (in production, use user's Render API key)
      if (agent.status === 'live') {
        agent.status = 'error';
        logger.info(`⚠️ ${agent.name}: Marked as error — will attempt auto-restart`);
      }

      await agent.save();
    }
  }

  /**
   * Get health summary of all agents
   */
  async getHealthSummary() {
    const agents = await Agent.find({});

    const summary = {
      total: agents.length,
      healthy: agents.filter(a => a.healthStatus === 'healthy').length,
      degraded: agents.filter(a => a.healthStatus === 'degraded').length,
      unhealthy: agents.filter(a => a.healthStatus === 'unhealthy').length,
      unknown: agents.filter(a => a.healthStatus === 'unknown').length,
      agents: agents.map(a => ({
        id: a._id,
        name: a.name,
        status: a.status,
        health: a.healthStatus,
        lastCheck: a.lastHealthCheck,
        uptime: a.stats.uptimePercent
      }))
    };

    return summary;
  }
}

module.exports = new HealthMonitor();
