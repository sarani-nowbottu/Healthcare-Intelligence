/**
 * Flask AI/ML & RAG Microservice HTTP Client
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const axios = require('axios');
const config = require('../config/config');

const client = axios.create({
  baseURL: config.FLASK_SERVICE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    ...(config.FLASK_SERVICE_TOKEN ? { 'X-Service-Token': config.FLASK_SERVICE_TOKEN } : {})
  }
});

// Flask's free Render instance may need longer than the platform's typical
// wake-up window because it loads the ML models and indexes policy PDFs.
const RETRY_DELAYS_MS = [1000, 3000, 7000, 12000, 18000, 25000, 30000, 30000];

function isTransientUpstreamError(error) {
  const status = error.response?.status;
  return [502, 503, 504].includes(status) ||
    ['ECONNABORTED', 'ECONNREFUSED', 'ECONNRESET', 'EAI_AGAIN', 'ETIMEDOUT'].includes(error.code);
}

async function requestWithRetry(requestConfig) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await client.request(requestConfig);
    } catch (error) {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined || !isTransientUpstreamError(error)) throw error;

      const method = (requestConfig.method || 'GET').toUpperCase();
      console.warn(`Flask service ${method} ${requestConfig.url} failed transiently (${error.response?.status || error.code}); retrying in ${delay}ms.`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

const getWithRetry = (url) => requestWithRetry({ method: 'GET', url });
const postWithRetry = (url, data) => requestWithRetry({ method: 'POST', url, data });

module.exports = {
  checkHealth: async () => {
    const res = await getWithRetry('/health');
    return res.data;
  },

  getDistricts: async () => {
    const res = await getWithRetry('/api/ml/districts');
    return res.data;
  },

  getDistrictProfile: async (districtName, stateName) => {
    const url = `/api/ml/district/${encodeURIComponent(districtName)}${stateName ? `?state=${encodeURIComponent(stateName)}` : ''}`;
    const res = await getWithRetry(url);
    return res.data;
  },

  predictOutcome: async (payload) => {
    const res = await postWithRetry('/api/ml/predict', payload);
    return res.data;
  },

  getModelPerformance: async () => {
    const res = await getWithRetry('/api/ml/model-performance');
    return res.data;
  },

  getFeatureImportance: async () => {
    const res = await getWithRetry('/api/ml/feature-importance');
    return res.data;
  },

  getAnalyticsOverview: async () => {
    const res = await getWithRetry('/api/analytics/overview');
    return res.data;
  },

  getRegionalData: async () => {
    const res = await getWithRetry('/api/analytics/regions');
    return res.data;
  },

  queryRAG: async (query, chatHistory = []) => {
    const res = await postWithRetry('/api/rag/query', { query, chat_history: chatHistory });
    return res.data;
  },

  summarizePolicy: async (documentName) => {
    const res = await postWithRetry('/api/rag/summarize', { document_name: documentName });
    return res.data;
  },

  listPolicies: async () => {
    const res = await getWithRetry('/api/policies');
    return res.data;
  },

  generateRecommendations: async (payload) => {
    const res = await postWithRetry('/api/recommendations/generate', payload);
    return res.data;
  }
};
