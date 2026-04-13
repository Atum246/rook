const axios = require('axios');
const logger = require('../utils/logger');

const ATLAS_API = 'https://cloud.mongodb.com/api/atlas/v1.0';

/**
 * Get Atlas API client with digest auth
 */
function getClient(publicKey, privateKey) {
  return axios.create({
    baseURL: ATLAS_API,
    auth: {
      username: publicKey,
      password: privateKey
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Create a free M0 cluster for the user
 */
async function createCluster(publicKey, privateKey, projectId, clusterName) {
  try {
    const client = getClient(publicKey, privateKey);
    const payload = {
      name: clusterName,
      clusterType: 'REPLICASET',
      replicationSpecs: [{
        numShards: 1,
        regionConfigs: [{
          providerName: 'TENANT',
          backingProviderName: 'AWS',
          regionName: 'US_EAST_1',
          electableSpecs: {
            instanceSize: 'M0',
            nodeCount: 1
          }
        }]
      }],
      providerSettings: {
        providerName: 'TENANT',
        instanceSizeName: 'M0',
        regionName: 'US_EAST_1'
      }
    };

    const response = await client.post(`/groups/${projectId}/clusters`, payload);
    logger.info(`🗄️ Created Atlas cluster: ${clusterName}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to create Atlas cluster:', error.response?.data || error.message);
    throw new Error('Could not create MongoDB cluster 🗄️');
  }
}

/**
 * Get cluster status
 */
async function getCluster(publicKey, privateKey, projectId, clusterName) {
  try {
    const client = getClient(publicKey, privateKey);
    const response = await client.get(`/groups/${projectId}/clusters/${clusterName}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to get cluster ${clusterName}:`, error.message);
    throw new Error('Could not fetch cluster details 🗄️');
  }
}

/**
 * Add IP to network access (allow all for Render)
 */
async function addNetworkAccess(publicKey, privateKey, projectId) {
  try {
    const client = getClient(publicKey, privateKey);
    const response = await client.post(`/groups/${projectId}/accessList`, [{
      ipAddress: '0.0.0.0/0',
      comment: 'Rook: Allow access from anywhere (Render)'
    }]);
    logger.info('🌐 Added network access rule (0.0.0.0/0)');
    return response.data;
  } catch (error) {
    // IP might already exist
    if (error.response?.status === 409) {
      logger.info('🌐 Network access already exists');
      return { message: 'Already configured' };
    }
    logger.error('Failed to add network access:', error.response?.data || error.message);
    throw new Error('Could not configure network access 🌐');
  }
}

/**
 * Create a database user
 */
async function createDatabaseUser(publicKey, privateKey, projectId, username, password) {
  try {
    const client = getClient(publicKey, privateKey);
    const response = await client.post(`/groups/${projectId}/databaseUsers`, {
      databaseName: 'admin',
      username: username,
      password: password,
      roles: [{
        roleName: 'readWrite',
        databaseName: 'rook_agents'
      }],
      scopes: [{
        type: 'CLUSTER',
        name: `RookAgent-${username}`
      }]
    });
    logger.info(`👤 Created database user: ${username}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to create database user:', error.response?.data || error.message);
    throw new Error('Could not create database user 👤');
  }
}

/**
 * Build connection string for a cluster
 */
function buildConnectionString(clusterName, username, password, projectId) {
  return `mongodb+srv://${username}:${password}@${clusterName}.mongodb.net/rook_agents?retryWrites=true&w=majority`;
}

/**
 * Full setup: Create cluster + network access + user
 * Returns connection string when cluster is ready
 */
async function fullSetup(publicKey, privateKey, projectId, agentName) {
  const clusterName = `rook-${agentName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const username = `rook_${Date.now()}`;
  const password = generatePassword();

  // Create cluster
  const cluster = await createCluster(publicKey, privateKey, projectId, clusterName);

  // Add network access
  await addNetworkAccess(publicKey, privateKey, projectId);

  // Create database user
  await createDatabaseUser(publicKey, privateKey, projectId, username, password);

  // Build connection string
  const connectionString = buildConnectionString(clusterName, username, password, projectId);

  return {
    clusterName,
    username,
    password,
    connectionString,
    clusterId: cluster.id,
    status: 'provisioning' // M0 clusters take a few minutes
  };
}

/**
 * Generate a secure random password
 */
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * List all clusters in a project
 */
async function listClusters(publicKey, privateKey, projectId) {
  try {
    const client = getClient(publicKey, privateKey);
    const response = await client.get(`/groups/${projectId}/clusters`);
    return response.data.results || [];
  } catch (error) {
    logger.error('Failed to list clusters:', error.message);
    return [];
  }
}

/**
 * Delete a cluster
 */
async function deleteCluster(publicKey, privateKey, projectId, clusterName) {
  try {
    const client = getClient(publicKey, privateKey);
    await client.delete(`/groups/${projectId}/clusters/${clusterName}`);
    logger.info(`🗑️ Deleted Atlas cluster: ${clusterName}`);
    return true;
  } catch (error) {
    logger.error(`Failed to delete cluster ${clusterName}:`, error.message);
    throw new Error('Could not delete cluster 🗑️');
  }
}

module.exports = {
  createCluster,
  getCluster,
  addNetworkAccess,
  createDatabaseUser,
  buildConnectionString,
  fullSetup,
  listClusters,
  deleteCluster
};
