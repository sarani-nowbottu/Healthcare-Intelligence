/**
 * Frontend API Service Client
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('hc_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function readResponse(res, endpoint) {
  const body = await res.text();
  let data = null;

  if (body.trim()) {
    try {
      data = JSON.parse(body);
    } catch {
      // Some proxy and server failures return HTML or plain text instead of JSON.
    }
  }

  if (!res.ok) {
    if (data?.error) throw new Error(data.error);

    const service = endpoint === '/auth/register' ? 'Registration service' : 'API server';
    if (!body.trim()) {
      if (res.status === 500) {
        throw new Error(`${service} failed while processing the request (HTTP 500) and returned no error details. Restart the backend and wait for its SQLite database initialization to finish. If this continues, check the backend terminal for the underlying error.`);
      }
      throw new Error(`${service} returned an empty response (HTTP ${res.status}). Make sure the backend is running, then try again.`);
    }

    throw new Error(`${service} returned an unreadable error response (HTTP ${res.status}). Check the backend and try again.`);
  }

  if (data === null) {
    const service = endpoint === '/auth/register' ? 'Registration service' : 'API server';
    const detail = body.trim() ? 'a response the app could not read' : 'an empty response';
    throw new Error(`${service} returned ${detail} (HTTP ${res.status}). The request could not be completed. Check that the backend is running, then try again.`);
  }

  return data;
}

async function request(endpoint, options = {}) {
  const headers = options.headers || getAuthHeaders();
  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    return await readResponse(res, endpoint);
  } catch (err) {
    if (err instanceof TypeError) {
      const service = endpoint === '/auth/register' ? 'registration service' : 'API server';
      throw new Error(`Could not connect to the ${service}. Make sure the Express backend is running on port 5000, then try again.`);
    }
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (name, email, password, role) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role })
  }),
  getProfile: () => request('/auth/profile'),

  // ML & Predictions
  getDistricts: () => request('/ml/districts'),
  getDistrictProfile: (name, state) => request(`/ml/district/${encodeURIComponent(name)}${state ? `?state=${encodeURIComponent(state)}` : ''}`),
  predict: (payload) => request('/ml/predict', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getModelPerformance: () => request('/ml/model-performance'),
  getFeatureImportance: () => request('/ml/feature-importance'),
  getPredictionHistory: () => request('/ml/history'),

  // Analytics
  getAnalyticsOverview: () => request('/analytics/overview'),
  getRegionalData: () => request('/analytics/regions'),

  // RAG & Policies
  queryAI: (query, session_id, chat_history) => request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query, session_id, chat_history })
  }),
  getChatHistory: (session_id) => request(`/ai/history?session_id=${encodeURIComponent(session_id)}`),
  listPolicies: () => request('/policies'),
  getPolicySummary: (documentName) => request('/policies/summary', {
    method: 'POST',
    body: JSON.stringify({ documentName })
  }),
  uploadPolicy: async (file) => {
    const token = localStorage.getItem('hc_token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/policies/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    return await readResponse(res, '/policies/upload');
  },

  // Recommendations
  generateRecommendations: (payload) => request('/recommendations/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};
