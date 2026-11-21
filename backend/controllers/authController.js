/**
 * Authentication Controller (MVC)
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config/config');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const assignedRole = role === 'admin' ? 'admin' : (role === 'researcher' ? 'researcher' : 'citizen');

    const result = await db.runAsync(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [name.trim(), email.toLowerCase().trim(), password_hash, assignedRole]);

    const newUser = { id: result.lastID, name: name.trim(), email: email.toLowerCase().trim(), role: assignedRole };
    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: newUser
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = generateToken(safeUser);

    return res.status(200).json({
      message: 'Authentication successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const predCount = await db.getAsync('SELECT COUNT(*) as count FROM predictions WHERE user_id = ?', [user.id]);
    return res.status(200).json({
      user,
      total_predictions: predCount ? predCount.count : 0
    });
  } catch (err) {
    next(err);
  }
};
