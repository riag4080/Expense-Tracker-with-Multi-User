const request = require('supertest');

// Use in-memory SQLite for tests
jest.mock('../src/db', () => {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(':memory:');

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount INTEGER NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
  });

  const dbRun = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function(err) { err ? rej(err) : res(this); }));
  const dbGet = (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (err, row) => err ? rej(err) : res(row)));
  const dbAll = (sql, params = []) => new Promise((res, rej) => db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));

  return { getDb: () => db, dbRun, dbGet, dbAll };
});

const app = require('../src/app');

describe('POST /expenses', () => {
  test('creates a valid expense', async () => {
    const res = await request(app).post('/expenses').send({
      amount: 150.5, category: 'Food', description: 'Lunch', date: '2024-02-15',
    });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe('150.50');
    expect(res.body.id).toBeDefined();
  });

  test('rejects negative amount', async () => {
    const res = await request(app).post('/expenses').send({
      amount: -50, category: 'Food', description: 'Test', date: '2024-02-15',
    });
    expect(res.status).toBe(400);
  });

  test('rejects missing date', async () => {
    const res = await request(app).post('/expenses').send({
      amount: 100, category: 'Food', description: 'Test',
    });
    expect(res.status).toBe(400);
  });

  test('idempotency: same key returns same result without duplicate', async () => {
    const key = 'idem-key-abc-123';
    const payload = { amount: 200, category: 'Transport', description: 'Auto', date: '2024-02-15' };

    const res1 = await request(app).post('/expenses').set('Idempotency-Key', key).send(payload);
    const res2 = await request(app).post('/expenses').set('Idempotency-Key', key).send(payload);

    expect(res1.body.id).toBe(res2.body.id);
    expect(res2.body._idempotent).toBe(true);
  });
});

describe('GET /expenses', () => {
  test('returns list with total', async () => {
    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.expenses)).toBe(true);
    expect(res.body.total).toBeDefined();
  });

  test('filters by category', async () => {
    await request(app).post('/expenses').send({
      amount: 500, category: 'Health', description: 'Doctor', date: '2024-02-16',
    });
    const res = await request(app).get('/expenses?category=Health');
    expect(res.status).toBe(200);
    res.body.expenses.forEach((e) => expect(e.category).toBe('Health'));
  });

  test('sorts newest first by default', async () => {
    const res = await request(app).get('/expenses?sort=date_desc');
    const dates = res.body.expenses.map((e) => e.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });
});
