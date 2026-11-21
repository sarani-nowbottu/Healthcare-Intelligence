/**
 * Healthcare Analytics Controller (MVC)
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const flaskService = require('../services/flaskService');

exports.getOverview = async (req, res, next) => {
  try {
    const data = await flaskService.getAnalyticsOverview();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.getRegions = async (req, res, next) => {
  try {
    const data = await flaskService.getRegionalData();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
