const axios = require('axios');
const logger = require('../utils/logger');

const RENDER_API = 'https://api.render.com/v1';

/**
 * Get Render API client for a user
 */
function getClient(apiKey) {
  return axios.create({
    baseURL: RENDER_API,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

/**
 * List all services for the user
 */
async function listServices(apiKey) {
  try {
    const client = getClient(apiKey);
    const response = await client.get('/services');
    return response.data;
  } catch (error) {
    logger.error('Failed to list Render services:', error.message);
    throw new Error('Could not fetch Render services 🚀');
  }
}

/**
 * Create a new web service on Render
 */
async function createService(apiKey, config) {
  try {
    const client = getClient(apiKey);
    const payload = {
      type: 'web_service',
      name: config.name,
      repo: config.repoUrl,
      branch: config.branch || 'main',
      autoDeploy: 'yes',
      serviceDetails: {
        env: 'node',
        buildCommand: config.buildCommand || 'npm install',
        startCommand: config.startCommand || 'npm start',
        plan: 'free',
        region: config.region || 'oregon',
        envVars: config.envVars || []
      }
    };

    const response = await client.post('/services', payload);
    logger.info(`🚀 Created Render service: ${config.name}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to create Render service:', error.response?.data || error.message);
    throw new Error('Could not create Render service 🚀');
  }
}

/**
 * Get service details
 */
async function getService(apiKey, serviceId) {
  try {
    const client = getClient(apiKey);
    const response = await client.get(`/services/${serviceId}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to get Render service ${serviceId}:`, error.message);
    throw new Error('Could not fetch service details 🔍');
  }
}

/**
 * Get service events (build logs)
 */
async function getServiceEvents(apiKey, serviceId) {
  try {
    const client = getClient(apiKey);
    const response = await client.get(`/services/${serviceId}/events`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to get events for ${serviceId}:`, error.message);
    return [];
  }
}

/**
 * Trigger a manual deploy
 */
async function triggerDeploy(apiKey, serviceId) {
  try {
    const client = getClient(apiKey);
    const response = await client.post(`/services/${serviceId}/deploys`, {
      clearCache: false
    });
    logger.info(`🔄 Triggered deploy for service ${serviceId}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to trigger deploy for ${serviceId}:`, error.message);
    throw new Error('Could not trigger deploy 🔄');
  }
}

/**
 * Restart a service
 */
async function restartService(apiKey, serviceId) {
  try {
    const client = getClient(apiKey);
    const response = await client.post(`/services/${serviceId}/restart`);
    logger.info(`🔄 Restarted service ${serviceId}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to restart service ${serviceId}:`, error.message);
    throw new Error('Could not restart service 🔄');
  }
}

/**
 * Suspend a service
 */
async function suspendService(apiKey, serviceId) {
  try {
    const client = getClient(apiKey);
    const response = await client.post(`/services/${serviceId}/suspend`);
    logger.info(`⏸️ Suspended service ${serviceId}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to suspend service ${serviceId}:`, error.message);
    throw new Error('Could not suspend service ⏸️');
  }
}

/**
 * Resume a suspended service
 */
async function resumeService(apiKey, serviceId) {
  try {
    const client = getClient(apiKey);
    const response = await client.post(`/services/${serviceId}/resume`);
    logger.info(`▶️ Resumed service ${serviceId}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to resume service ${serviceId}:`, error.message);
    throw new Error('Could not resume service ▶️');
  }
}

/**
 * Delete a service
 */
async function deleteService(apiKey, serviceId) {
  try {
    const client = getClient(apiKey);
    await client.delete(`/services/${serviceId}`);
    logger.info(`🗑️ Deleted Render service ${serviceId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to delete service ${serviceId}:`, error.message);
    throw new Error('Could not delete service 🗑️');
  }
}

/**
 * Get available regions
 */
async function getRegions(apiKey) {
  try {
    const client = getClient(apiKey);
    const response = await client.get('/regions');
    return response.data;
  } catch (error) {
    logger.error('Failed to get regions:', error.message);
    return [];
  }
}

module.exports = {
  listServices,
  createService,
  getService,
  getServiceEvents,
  triggerDeploy,
  restartService,
  suspendService,
  resumeService,
  deleteService,
  getRegions
};
