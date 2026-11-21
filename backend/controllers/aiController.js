/**
 * AI Healthcare Assistant Controller (MVC)
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const flaskService = require('../services/flaskService');
const db = require('../config/db');

exports.chat = async (req, res, next) => {
  try {
    const { query, session_id, chat_history } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const flaskResp = await flaskService.queryRAG(query, chat_history || []);

    const userId = req.user ? req.user.id : null;
    const sessId = session_id || 'default-session';

    // Log user query in SQLite
    await db.runAsync(`
      INSERT INTO chat_messages (user_id, session_id, role, message, citations_json)
      VALUES (?, ?, 'user', ?, ?)
    `, [userId, sessId, query, JSON.stringify([])]);

    // Log assistant response in SQLite
    await db.runAsync(`
      INSERT INTO chat_messages (user_id, session_id, role, message, citations_json)
      VALUES (?, ?, 'assistant', ?, ?)
    `, [userId, sessId, flaskResp.answer, JSON.stringify(flaskResp.citations || [])]);

    return res.status(200).json(flaskResp);
  } catch (err) {
    next(err);
  }
};

exports.getChatHistory = async (req, res, next) => {
  try {
    const sessionId = req.query.session_id || 'default-session';
    const rows = await db.allAsync(
      'SELECT id, role, message, citations_json, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );

    const history = rows.map(r => ({
      ...r,
      citations: JSON.parse(r.citations_json || '[]')
    }));

    return res.status(200).json({ session_id: sessionId, messages: history });
  } catch (err) {
    next(err);
  }
};
