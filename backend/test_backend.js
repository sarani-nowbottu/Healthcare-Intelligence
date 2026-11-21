/**
 * Automated Node.js Backend Verification Tests
 * AI-Powered Healthcare Policy Intelligence & Prediction System
 */

const assert = require('assert');
const db = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./config/config');

async function runTests() {
  console.log('--- Starting Express & SQLite Backend Verification ---');
  if (db.initPromise) {
    await db.initPromise;
  }

  // Test 1: SQLite Connection & Seeded Demo User
  console.log('Test 1: Verify Seeded Demo User...');
  const user = await db.getAsync('SELECT * FROM users WHERE email = ?', ['demo@healthcare.org']);
  assert.ok(user, 'Demo user must exist in SQLite database');
  assert.strictEqual(user.role, 'admin');
  const isMatch = await bcrypt.compare('Demo@12345', user.password_hash);
  assert.ok(isMatch, 'Demo user password hash verification must succeed');
  console.log('✓ Test 1 Passed: Demo user verified in SQLite.');

  // Test 2: JWT Generation and Verification
  console.log('Test 2: Verify JWT Signing & Decoding...');
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.JWT_SECRET, { expiresIn: '1h' });
  const decoded = jwt.verify(token, config.JWT_SECRET);
  assert.strictEqual(decoded.email, 'demo@healthcare.org');
  console.log('✓ Test 2 Passed: JWT Token signed and verified.');

  // Test 3: Insert and Query Prediction Record
  console.log('Test 3: Verify Prediction Record Insertion in SQLite...');
  const insertRes = await db.runAsync(`
    INSERT INTO predictions (
      user_id, district_name, state_name, selected_algorithm,
      predicted_rate, predicted_tier, lower_bound, upper_bound,
      input_features_json, contributions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    user.id, 'Patna', 'Bihar', 'Gradient Boosting',
    86.91, 'Medium', 78.8, 95.0,
    JSON.stringify({ anc_4_visits: 42.1 }),
    JSON.stringify([{ factor: 'clean_fuel', impact: 0.8 }])
  ]);
  assert.ok(insertRes.lastID > 0, 'Prediction record should have positive ID');
  const fetched = await db.getAsync('SELECT * FROM predictions WHERE id = ?', [insertRes.lastID]);
  assert.strictEqual(fetched.district_name, 'Patna');
  assert.strictEqual(fetched.predicted_rate, 86.91);
  console.log('✓ Test 3 Passed: SQLite Prediction persistence verified.');

  // Test 4: Chat Message Logging
  console.log('Test 4: Verify Chat Message Logging in SQLite...');
  const chatRes = await db.runAsync(`
    INSERT INTO chat_messages (user_id, session_id, role, message, citations_json)
    VALUES (?, ?, ?, ?, ?)
  `, [user.id, 'test-session-1', 'user', 'What is PM-JAY?', JSON.stringify([])]);
  assert.ok(chatRes.lastID > 0);
  const chatMsg = await db.getAsync('SELECT * FROM chat_messages WHERE id = ?', [chatRes.lastID]);
  assert.strictEqual(chatMsg.message, 'What is PM-JAY?');
  console.log('✓ Test 4 Passed: Chat history persistence verified.');

  console.log('\n========================================');
  console.log('All Express & SQLite Backend Tests PASSED!');
  console.log('========================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
