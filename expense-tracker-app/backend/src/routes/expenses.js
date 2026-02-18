const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, dbAll } = require('../db');

const router = express.Router();

const toStoredAmount = (amount) => Math.round(parseFloat(amount) * 100);
const toDisplayAmount = (stored) => (stored / 100).toFixed(2);

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Housing', 'Education', 'Other'
];

function validateExpenseInput({ amount, category, description, date }) {
  const errors = [];
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) errors.push('amount must be a positive number');
  if (parsedAmount > 10_000_000) errors.push('amount seems unreasonably large');
  if (!category || typeof category !== 'string' || !category.trim()) errors.push('category is required');
  if (!description || typeof description !== 'string' || !description.trim()) errors.push('description is required');
  if (description && description.length > 500) errors.push('description must be 500 characters or less');
  if (!date) {
    errors.push('date is required');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
    errors.push('date must be a valid YYYY-MM-DD');
  }
  return errors;
}

// Middleware to extract user_id from header
function requireUser(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  req.userId = userId;
  next();
}

router.post('/', requireUser, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    const errors = validateExpenseInput({ amount, category, description, date });
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    if (idempotencyKey) {
      const existing = await dbGet('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [idempotencyKey, req.userId]);
      if (existing) {
        return res.status(200).json({ ...existing, amount: toDisplayAmount(existing.amount), _idempotent: true });
      }
    }

    const id = idempotencyKey || uuidv4();
    const storedAmount = toStoredAmount(amount);
    const createdAt = new Date().toISOString();

    try {
      await dbRun(
        'INSERT INTO expenses (id, user_id, amount, category, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, req.userId, storedAmount, category.trim(), description.trim(), date, createdAt]
      );
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        const existing = await dbGet('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, req.userId]);
        if (existing) return res.status(200).json({ ...existing, amount: toDisplayAmount(existing.amount), _idempotent: true });
      }
      throw err;
    }

    return res.status(201).json({
      id, amount: toDisplayAmount(storedAmount),
      category: category.trim(), description: description.trim(), date, created_at: createdAt,
    });
  } catch (err) {
    console.error('[POST /expenses]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', requireUser, async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [req.userId];

    if (category && category !== 'all') {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }

    const sortOrder = sort === 'date_asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY date ${sortOrder}, created_at ${sortOrder}`;

    const rows = await dbAll(query, params);
    const expenses = rows.map((row) => ({ ...row, amount: toDisplayAmount(row.amount) }));
    const totalPaise = rows.reduce((sum, r) => sum + r.amount, 0);

    return res.json({ expenses, total: toDisplayAmount(totalPaise), count: expenses.length });
  } catch (err) {
    console.error('[GET /expenses]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/categories', requireUser, async (req, res) => {
  try {
    const rows = await dbAll('SELECT DISTINCT category FROM expenses WHERE user_id = ? ORDER BY category', [req.userId]);
    const used = rows.map((r) => r.category);
    const merged = [...new Set([...DEFAULT_CATEGORIES, ...used])].sort();
    return res.json({ categories: merged });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
