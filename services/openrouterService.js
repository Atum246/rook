const axios = require('axios');
const logger = require('../utils/logger');

const OPENROUTER_API = 'https://openrouter.ai/api/v1';

/**
 * Validate an OpenRouter API key
 */
async function validateKey(apiKey) {
  try {
    const response = await axios.get(`${OPENROUTER_API}/auth/key`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return {
      valid: true,
      credits: response.data.data?.limit || null,
      usage: response.data.data?.usage || 0
    };
  } catch (error) {
    logger.error('Failed to validate OpenRouter key:', error.message);
    return { valid: false };
  }
}

/**
 * List available free models
 */
async function listFreeModels() {
  try {
    const response = await axios.get(`${OPENROUTER_API}/models`);
    const models = response.data.data || [];
    // Filter for free models
    return models
      .filter(m => m.id.includes('free') || m.pricing?.prompt === '0')
      .map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        contextLength: m.context_length,
        pricing: m.pricing
      }));
  } catch (error) {
    logger.error('Failed to list models:', error.message);
    return [];
  }
}

/**
 * Test a model with a simple prompt
 */
async function testModel(apiKey, modelId) {
  try {
    const response = await axios.post(`${OPENROUTER_API}/chat/completions`, {
      model: modelId,
      messages: [{ role: 'user', content: 'Say "hello" in one word.' }],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return {
      success: true,
      response: response.data.choices?.[0]?.message?.content || 'OK'
    };
  } catch (error) {
    logger.error(`Failed to test model ${modelId}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  validateKey,
  listFreeModels,
  testModel
};
