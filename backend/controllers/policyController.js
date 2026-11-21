/**
 * Policy Document Controller (MVC)
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const path = require('path');
const fs = require('fs');
const flaskService = require('../services/flaskService');
const config = require('../config/config');
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

    const { originalname, size, path: tempPath, mimetype } = req.file;

    // Forward the upload to Flask. The services may run on separate hosts, so
    // their local filesystems are not shared in production.
    let flaskResponse;
    try {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob([fs.readFileSync(tempPath)], { type: mimetype || 'application/pdf' }),
        originalname
      );
      flaskResponse = await fetch(`${config.FLASK_SERVICE_URL}/api/policies/upload`, {
        method: 'POST',
        body: formData
      });
    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }

    const responseText = await flaskResponse.text();
    let uploadResult;
    try {
      uploadResult = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error(`The policy service returned an unreadable response (HTTP ${flaskResponse.status}).`);
    }
    if (!flaskResponse.ok) {
      throw new Error(uploadResult.error || `The policy service rejected the upload (HTTP ${flaskResponse.status}).`);
    }

    const filename = uploadResult.filename || originalname;

    // Record in SQLite
    const userId = req.user ? req.user.id : null;
    const title = path.basename(originalname, path.extname(originalname)).replace(/[_-]/g, ' ');
    
    await db.runAsync(`
      INSERT INTO policy_documents (title, filename, original_name, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?)
    `, [title, filename, originalname, size, userId]);

    // Trigger re-indexing
    return res.status(201).json({
      ...uploadResult,
      message: uploadResult.message || `Policy '${originalname}' successfully uploaded and indexed.`,
      filename
    });
  } catch (err) {
    next(err);
  }
};
