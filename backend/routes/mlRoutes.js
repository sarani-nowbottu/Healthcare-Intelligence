const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/districts', mlController.getDistricts);
router.get('/district/:districtName', mlController.getDistrictProfile);
router.post('/predict', optionalAuth, mlController.predict);
router.get('/model-performance', mlController.getModelPerformance);
router.get('/feature-importance', mlController.getFeatureImportance);
router.get('/history', optionalAuth, mlController.getPredictionHistory);

module.exports = router;
