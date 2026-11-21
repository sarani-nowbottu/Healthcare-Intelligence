const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const policyController = require('../controllers/policyController');
const { optionalAuth } = require('../middleware/authMiddleware');

const upload = multer({
  dest: path.resolve(__dirname, '../uploads/'),
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max
});

router.get('/', policyController.listPolicies);
router.post('/summary', policyController.getPolicySummary);
router.post('/upload', optionalAuth, upload.single('file'), policyController.uploadPolicy);

module.exports = router;
