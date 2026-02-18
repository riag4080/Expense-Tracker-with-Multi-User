const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet } = require('../db');

const router = express.Router();

// Simple password "hashing" - in production use bcrypt, but keeping it simple here
function hashPassword(password) {
  // Basic hash using built-in crypto
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password + 'expense_tracker_salt').digest('hex');
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim()) return res.status(400).json({ error: 'Username is required' });
    if (!password || password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

    const existing = await dbGet('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);
    if (existing) return res.status(409).json({ error: 'Username already taken' });

    const id = uuidv4();
    const hashed = hashPassword(password);
    await dbRun('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', [id, username.trim(), hashed]);

    return res.status(201).json({ id, username: username.trim() });
  } catch (err) {
    console.error('[POST /auth/register]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = await dbGet('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const hashed = hashPassword(password);
    if (hashed !== user.password) return res.status(401).json({ error: 'Invalid username or password' });

    return res.json({ id: user.id, username: user.username });
  } catch (err) {
    console.error('[POST /auth/login]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
