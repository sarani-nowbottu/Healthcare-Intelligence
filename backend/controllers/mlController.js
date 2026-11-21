/**
 * Machine Learning Controller (MVC)
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const flaskService = require('../services/flaskService');
const db = require('../config/db');

exports.getDistricts = async (req, res, next) => {
  try {
    const data = await flaskService.getDistricts();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.getDistrictProfile = async (req, res, next) => {
  try {
    const { districtName } = req.params;
    const { state } = req.query;
    const profile = await flaskService.getDistrictProfile(districtName, state);
    return res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

exports.predict = async (req, res, next) => {
  try {
    const { features, selected_model, district_name, state_name } = req.body;
    const flaskResp = await flaskService.predictOutcome({
      features,
      selected_model,
      district_name,
      state_name
    });

    // Save prediction in SQLite audit history
    const userId = req.user ? req.user.id : null;
    const pred = flaskResp.prediction;
    if (pred) {
      await db.runAsync(`
        INSERT INTO predictions (
          user_id, district_name, state_name, selected_algorithm,
          predicted_rate, predicted_tier, lower_bound, upper_bound,
          input_features_json, contributions_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        district_name || 'Custom Scenario',
        state_name || 'National Input',
        pred.selected_algorithm,
        pred.predicted_institutional_delivery_rate,
        pred.predicted_performance_tier,
        pred.prediction_interval ? pred.prediction_interval.lower_bound_95 : null,
        pred.prediction_interval ? pred.prediction_interval.upper_bound_95 : null,
        JSON.stringify(features || {}),
        JSON.stringify(pred.all_factor_contributions || [])
      ]);
    }

    return res.status(200).json(flaskResp);
  } catch (err) {
    next(err);
  }
};

exports.getModelPerformance = async (req, res, next) => {
  try {
    const data = await flaskService.getModelPerformance();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.getFeatureImportance = async (req, res, next) => {
  try {
    const data = await flaskService.getFeatureImportance();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.getPredictionHistory = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    let query = 'SELECT * FROM predictions ORDER BY created_at DESC LIMIT 50';
    let params = [];

    if (userId) {
      query = 'SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
      params = [userId];
    }

    const rows = await db.allAsync(query, params);
    const parsed = rows.map(r => ({
      ...r,
      input_features: JSON.parse(r.input_features_json || '{}'),
      contributions: JSON.parse(r.contributions_json || '[]')
    }));

    return res.status(200).json({ history: parsed });
  } catch (err) {
    next(err);
  }
};
