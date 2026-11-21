/**
 * SQLite Database Connection & Schema Migrations
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('./config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`Connected to persistent SQLite database at: ${dbPath}`);
  }
});

// Run queries as promises
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initDatabase() {
  // 1. Users Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'citizen',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Policy Documents Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS policy_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      pages_count INTEGER DEFAULT 1,
      chunks_count INTEGER DEFAULT 0,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users (id)
    )
  `);

  // 3. Predictions History Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      district_name TEXT,
      state_name TEXT,
      selected_algorithm TEXT NOT NULL,
      predicted_rate REAL NOT NULL,
      predicted_tier TEXT NOT NULL,
      lower_bound REAL,
      upper_bound REAL,
      input_features_json TEXT,
      contributions_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // 4. Chat Messages History Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      citations_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Seed default demo user for easy professor/reviewer access
  const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', ['demo@healthcare.org']);
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Demo@12345', salt);
    await db.runAsync(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, ['Healthcare Administrator (Demo)', 'demo@healthcare.org', hash, 'admin']);
    console.log('Seeded demo administrator user: demo@healthcare.org / Demo@12345');
  }
}

// Keep the initialization promise rejectable so the server can avoid accepting
// requests until the schema is ready and can fail clearly if SQLite setup fails.
db.initPromise = initDatabase();
module.exports = db;
