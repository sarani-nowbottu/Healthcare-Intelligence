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

module.exports = {
  checkHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  getDistricts: async () => {
    const res = await client.get('/api/ml/districts');
    return res.data;
  },

  getDistrictProfile: async (districtName, stateName) => {
    const url = `/api/ml/district/${encodeURIComponent(districtName)}${stateName ? `?state=${encodeURIComponent(stateName)}` : ''}`;
    const res = await client.get(url);
    return res.data;
  },

  predictOutcome: async (payload) => {
    const res = await client.post('/api/ml/predict', payload);
    return res.data;
  },

  getModelPerformance: async () => {
    const res = await client.get('/api/ml/model-performance');
    return res.data;
  },

  getFeatureImportance: async () => {
    const res = await client.get('/api/ml/feature-importance');
    return res.data;
  },

  getAnalyticsOverview: async () => {
    const res = await client.get('/api/analytics/overview');
    return res.data;
  },

  getRegionalData: async () => {
    const res = await client.get('/api/analytics/regions');
    return res.data;
  },

  queryRAG: async (query, chatHistory = []) => {
    const res = await client.post('/api/rag/query', { query, chat_history: chatHistory });
    return res.data;
  },

  summarizePolicy: async (documentName) => {
    const res = await client.post('/api/rag/summarize', { document_name: documentName });
    return res.data;
  },

  listPolicies: async () => {
    const res = await client.get('/api/policies');
    return res.data;
  },

  generateRecommendations: async (payload) => {
    const res = await client.post('/api/recommendations/generate', payload);
    return res.data;
  }
};
