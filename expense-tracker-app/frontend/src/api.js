const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.details = body.details;
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function register(username, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getExpenses({ category, sort } = {}, userId) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (sort) params.set('sort', sort);
  const qs = params.toString();
  return apiFetch(`/expenses${qs ? `?${qs}` : ''}`, {
    headers: { 'X-User-Id': userId },
  });
}

export async function createExpense(data, idempotencyKey, userId) {
  return apiFetch('/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      'X-User-Id': userId,
    },
    body: JSON.stringify(data),
  });
}

export async function getCategories(userId) {
  return apiFetch('/expenses/categories', {
    headers: { 'X-User-Id': userId },
  });
}
