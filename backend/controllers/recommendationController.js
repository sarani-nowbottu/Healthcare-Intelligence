/**
 * Policy Recommendation Controller (MVC)
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const flaskService = require('../services/flaskService');

exports.generateRecommendations = async (req, res, next) => {
  try {
    const { district_name, state_name, features } = req.body;
    const data = await flaskService.generateRecommendations({
      district_name,
      state_name,
      features
    });
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
