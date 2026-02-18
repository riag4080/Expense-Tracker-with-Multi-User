# 💰 ExpenseTracker — Full-Stack Multi-User Personal Finance Tool

A production-ready personal finance tool built with **Node.js/Express** (backend) and **React** (frontend), supporting **multiple users** with secure JWT-based authentication.

---

## 🚀 Live Demo

| | Link |
|---|---|
| **Frontend** | https://expense-tracker-with-multi-user.vercel.app/ |
| **Backend API** | https://expense-tracker-with-multi-user.onrender.com/ |

> ⚠️ Backend is hosted on Render's free tier — the first request may take ~50 seconds to wake up.

---

## ⚡ Quick Start (Local)

```bash
# 1. Clone the repo
git clone https://github.com/riag4080/Expense-Tracker-with-Multi-User.git
cd expense-tracker

# 2. Start backend
cd backend
npm install
npm start          # Runs at http://localhost:3001

# 3. Start frontend (new terminal)
cd frontend
npm install
npm start          # Runs at http://localhost:3000
```

---

## ✅ Acceptance Criteria Coverage

| # | Feature | Status |
|---|---------|--------|
| 1 | Create expense with amount, category, description, date | ✅ Done |
| 2 | View list of expenses | ✅ Done |
| 3 | Filter expenses by category | ✅ Done |
| 4 | Sort expenses by date (newest first) | ✅ Done |
| 5 | Show total of currently visible expenses | ✅ Done |
| + | Multi-user support with authentication | ✅ Bonus |
| + | Idempotency for safe retries | ✅ Bonus |
| + | Automated tests | ✅ Bonus |
| + | Input validation (frontend + backend + DB) | ✅ Bonus |

---

## 🧠 Key Design Decisions

### 🔐 Authentication & Multi-User Support

The app supports multiple users with secure, stateless authentication.

**Tech used:** JWT (JSON Web Token), bcrypt for password hashing, auth middleware for protected routes.

**Authentication flow:**
1. User registers at `/auth/register`
2. Password is hashed with bcrypt before storing
3. User logs in → JWT token is generated and returned
4. Client stores token and sends it as `Authorization: Bearer <token>` on every request
5. Backend middleware verifies token and extracts `user_id`
6. All expense operations are automatically scoped to that user

---

### 🗄️ Data Isolation

Every expense is tied to a specific user via a `user_id` foreign key. All queries are filtered:

```sql
WHERE user_id = ?
```

This means users can never view or modify each other's data — even if they share the same category names or dates.

**Expenses table (conceptual schema):**
```sql
expenses (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  amount      INTEGER NOT NULL CHECK(amount > 0),
  category    TEXT,
  description TEXT,
  date        TEXT,
  created_at  TEXT
)
```

---

### 💰 Money Handling — Integer Storage (Paise)

Amounts are stored as integers in **paise** (smallest INR unit) to avoid floating-point errors:

```
₹123.45  →  stored as  12345
```

Conversion back to rupees happens only at the API response level. This ensures all arithmetic is safe and lossless.

---

### 🔁 Idempotency for Safe Retries

`POST /expenses` supports an optional `Idempotency-Key` header:

```
Idempotency-Key: <uuid>
```

- Same user + same key → returns the original response (no duplicate created)
- Prevents duplicate entries from accidental double-clicks or network retries
- Different users with the same key → treated as independent records

This directly addresses the real-world condition mentioned in the assignment: *"users may click submit multiple times or refresh the page after submitting."*

---

### 💾 Persistence — SQLite via `better-sqlite3`

SQLite was chosen because:
- Data survives server restarts (unlike in-memory stores)
- No external database service needed — zero infrastructure overhead
- WAL (Write-Ahead Logging) mode improves concurrent read performance
- Well-suited for small-to-medium scale apps like this one

PostgreSQL would be a straightforward migration path if scaling becomes necessary.

---

### ✅ Validation Strategy

Validation is applied at multiple layers for defense-in-depth:

- **Frontend** — validates inputs before submission for a smooth UX
- **Backend** — validates all incoming data regardless of frontend state
- **Database** — enforces constraints as the final guard (e.g., `CHECK(amount > 0)`)

---

## 📡 API Reference

### Authentication

#### `POST /auth/register`
```json
Request:  { "name": "Jitin", "email": "jitin@example.com", "password": "securePassword" }
Response: { "user": { "id": "uuid", "name": "Jitin", "email": "jitin@example.com" }, "token": "jwt-token" }
```

#### `POST /auth/login`
```json
Request:  { "email": "jitin@example.com", "password": "securePassword" }
Response: { "user": { "id": "uuid", "name": "Jitin", "email": "jitin@example.com" }, "token": "jwt-token" }
```

#### `GET /auth/me`
Returns the currently logged-in user.
```
Headers: Authorization: Bearer <token>
```

---

### Expenses (All routes require authentication)

#### `POST /expenses`
```
Headers: Authorization: Bearer <token>
         Idempotency-Key: <uuid>   (optional)

Request body:
{
  "amount": 150.50,
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15"
}

Response 201:
{
  "id": "uuid",
  "amount": "150.50",
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15",
  "created_at": "2024-02-15T08:30:00.000Z"
}
```

#### `GET /expenses`
```
Query params:
  category=Food         → filter by category
  sort=date_desc        → sort newest first

Response:
{
  "expenses": [...],
  "total": "1234.50",
  "count": 12
}
```

#### `GET /expenses/categories`
Returns all distinct categories used by the logged-in user.

---

## 🎨 Frontend Features

- **Login & Register** pages with form validation
- **Protected routes** — redirects to login if token is missing
- **Auth Context** (React Context API) for global auth state
- Token stored in `localStorage` and auto-attached to requests
- **Logout** support
- Filter, sort, and total update in real-time

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

**Tests cover:**
- User registration and login
- JWT-protected routes
- Creating expenses
- Rejecting invalid amounts
- Idempotency behavior
- User-level data isolation
- Filtering and sorting

---

## ⚖️ Trade-offs (Due to Timebox)

| Skipped | Reason |
|--------|--------|
| Email verification | Out of scope for this exercise |
| Password reset flow | Not required initially |
| Refresh tokens | Adds complexity without immediate need |
| Pagination | Dataset expected to remain small |
| Rate limiting | Should be added before production use |
| OAuth login | Optional future enhancement |

---

## 🚫 Intentional Omissions

- **No real-time sync** — a refresh after actions is sufficient for this use case
- **No currency conversion** — scoped to INR only
- **No microservices** — monolithic architecture is simpler and easier to maintain at this scale
- **No Docker Compose** — SQLite works locally without containerization

---

## 🔮 Future Improvements

- Edit / Delete expense
- Monthly analytics dashboard with charts
- Per-category spending breakdown
- Export to CSV / PDF
- Budget limits and alerts
- Migration to PostgreSQL
- Refresh token support
- Rate limiting middleware

---

## 🏗️ Architecture Overview

```
React Frontend (Vercel)
        │
        │  JWT in Authorization header
        ▼
Node.js + Express API (Render)
        │
        ▼
SQLite via better-sqlite3
```
