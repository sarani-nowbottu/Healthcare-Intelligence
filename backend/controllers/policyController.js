/**
 * Policy Document Controller (MVC)
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const path = require('path');
const fs = require('fs');
const flaskService = require('../services/flaskService');
const db = require('../config/db');

exports.listPolicies = async (req, res, next) => {
  try {
    const data = await flaskService.listPolicies();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.getPolicySummary = async (req, res, next) => {
  try {
    const { documentName } = req.body;
    if (!documentName) {
      return res.status(400).json({ error: 'documentName is required.' });
    }
    const data = await flaskService.summarizePolicy(documentName);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.uploadPolicy = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { originalname, filename, size, path: tempPath } = req.file;
    const destDir = path.resolve(__dirname, '../../flask_service/policies_storage');
    const finalDest = path.join(destDir, filename);

    // Copy to Flask policy storage
    fs.copyFileSync(tempPath, finalDest);
    fs.unlinkSync(tempPath);

    // Record in SQLite
    const userId = req.user ? req.user.id : null;
    const title = path.basename(originalname, path.extname(originalname)).replace(/[_-]/g, ' ');
    
    await db.runAsync(`
      INSERT INTO policy_documents (title, filename, original_name, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?)
    `, [title, filename, originalname, size, userId]);

    // Trigger re-indexing
    const policiesList = await flaskService.listPolicies();

    return res.status(201).json({
      message: `Policy '${originalname}' successfully uploaded and indexed.`,
      filename,
      policies: policiesList
    });
  } catch (err) {
    next(err);
  }
};
