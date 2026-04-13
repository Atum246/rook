const axios = require('axios');
const logger = require('../utils/logger');

const CRONJOB_API = 'https://api.cron-job.org';

/**
 * Get Cron-job API client
 */
function getClient(apiKey) {
  return axios.create({
    baseURL: CRONJOB_API,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Create a keep-alive cron job
 */
async function createKeepAlive(apiKey, url, title) {
  try {
    const client = getClient(apiKey);
    const payload = {
      job: {
        title: title || `Rook: Keep Alive - ${url}`,
        enabled: true,
        url: url,
        requestTimeout: 30,
        schedule: {
          timezone: 'UTC',
          expiresAt: 0, // never expires
          hours: [-1], // every hour
          mdays: [-1],
          minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], // every 5 minutes
          months: [-1],
          wdays: [-1]
        },
        requestMethod: 1, // GET
        auth: null,
        notification: {
          onFailure: false,
          onSuccess: false,
          onDisable: false
        },
        extendedData: {
          headers: {},
          body: ''
        }
      }
    };

    const response = await client.put('/jobs', payload);
    logger.info(`⏰ Created keep-alive job: ${title}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to create cron job:', error.response?.data || error.message);
    throw new Error('Could not create keep-alive job ⏰');
  }
}

/**
 * List all cron jobs
 */
async function listJobs(apiKey) {
  try {
    const client = getClient(apiKey);
    const response = await client.get('/jobs');
    return response.data.jobs || [];
  } catch (error) {
    logger.error('Failed to list cron jobs:', error.message);
    return [];
  }
}

/**
 * Get cron job details
 */
async function getJob(apiKey, jobId) {
  try {
    const client = getClient(apiKey);
    const response = await client.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to get cron job ${jobId}:`, error.message);
    throw new Error('Could not fetch cron job details ⏰');
  }
}

/**
 * Update a cron job
 */
async function updateJob(apiKey, jobId, updates) {
  try {
    const client = getClient(apiKey);
    const response = await client.patch(`/jobs/${jobId}`, updates);
    logger.info(`⏰ Updated cron job ${jobId}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to update cron job ${jobId}:`, error.message);
    throw new Error('Could not update cron job ⏰');
  }
}

/**
 * Enable/disable a cron job
 */
async function setJobEnabled(apiKey, jobId, enabled) {
  try {
    const client = getClient(apiKey);
    const response = await client.patch(`/jobs/${jobId}`, {
      job: { enabled }
    });
    logger.info(`⏰ ${enabled ? 'Enabled' : 'Disabled'} cron job ${jobId}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to ${enabled ? 'enable' : 'disable'} job ${jobId}:`, error.message);
    throw new Error(`Could not ${enabled ? 'enable' : 'disable'} cron job ⏰`);
  }
}

/**
 * Delete a cron job
 */
async function deleteJob(apiKey, jobId) {
  try {
    const client = getClient(apiKey);
    await client.delete(`/jobs/${jobId}`);
    logger.info(`🗑️ Deleted cron job ${jobId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to delete cron job ${jobId}:`, error.message);
    throw new Error('Could not delete cron job 🗑️');
  }
}

/**
 * Get job execution history
 */
async function getJobHistory(apiKey, jobId) {
  try {
    const client = getClient(apiKey);
    const response = await client.get(`/jobs/${jobId}/history`);
    return response.data.history || [];
  } catch (error) {
    logger.error(`Failed to get history for job ${jobId}:`, error.message);
    return [];
  }
}

module.exports = {
  createKeepAlive,
  listJobs,
  getJob,
  updateJob,
  setJobEnabled,
  deleteJob,
  getJobHistory
};
