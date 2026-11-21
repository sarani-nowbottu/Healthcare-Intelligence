/**
 * Database adapter: SQLite for local development, PostgreSQL when DATABASE_URL
 * is provided by the deployment environment.
 */

const bcrypt = require('bcryptjs');
const config = require('./config');

const isPostgres = Boolean(config.DATABASE_URL);
let db;

if (isPostgres) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: config.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
    max: 10
  });
  pool.on('error', (err) => console.error('Unexpected PostgreSQL pool error:', err));

  const postgresSql = (sql) => {
    let parameterIndex = 0;
    return sql.replace(/\?/g, () => `$${++parameterIndex}`);
  };

  db = {
    runAsync: async (sql, params = []) => {
      let query = postgresSql(sql);
      if (/^\s*INSERT\s+INTO\b/i.test(query) && !/\bRETURNING\b/i.test(query)) {
        query += ' RETURNING id';
      }
      const result = await pool.query(query, params);
      return { lastID: result.rows[0]?.id, changes: result.rowCount };
    },
    getAsync: async (sql, params = []) => {
      const result = await pool.query(postgresSql(sql), params);
      return result.rows[0];
    },
    allAsync: async (sql, params = []) => {
      const result = await pool.query(postgresSql(sql), params);
      return result.rows;
    }
  };
} else {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
  const sqlite = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Failed to connect to SQLite database:', err.message);
    else console.log(`Connected to local SQLite database at: ${dbPath}`);
  });

  db = sqlite;
  db.runAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  };
  db.getAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  };
  db.allAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };
}

async function initDatabase() {
  const idType = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id ${idType},
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'citizen',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS policy_documents (
      id ${idType},
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      pages_count INTEGER DEFAULT 1,
      chunks_count INTEGER DEFAULT 0,
      uploaded_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users (id)
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS predictions (
      id ${idType},
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id ${idType},
      user_id INTEGER,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      citations_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

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

  console.log(`Database initialized (${isPostgres ? 'PostgreSQL' : 'SQLite'}).`);
}

db.initPromise = initDatabase();
module.exports = db;
