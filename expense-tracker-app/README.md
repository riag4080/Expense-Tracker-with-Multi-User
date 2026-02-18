ExpenseTracker — Multi-User Personal Finance Tool
A full-stack personal finance application built with Node.js/Express (backend) and React (frontend) that allows multiple users to securely track their daily expenses.

Live Demo
Frontend:
https://expense-tracker-pink-sigma.vercel.app/

Backend API:
https://expense-tracker-8drj.onrender.com/

Backend is hosted on Render free tier — first request may take ~50 seconds to wake up.

🚀 Features
Multi-user support

Secure authentication (JWT-based)

User-specific expense tracking

Category filtering & sorting

Idempotent expense creation

Persistent storage using SQLite

Input validation at both API & DB level

🔐 Authentication
Authentication is implemented using JWT (JSON Web Tokens).

Auth Endpoints
POST /auth/register
Create a new user account.

json
कोड कॉपी करें
{
  "email": "user@example.com",
  "password": "securePassword123"
}
POST /auth/login
json
कोड कॉपी करें
{
  "email": "user@example.com",
  "password": "securePassword123"
}
Response:

json
कोड कॉपी करें
{
  "token": "jwt_token_here"
}
The token must be sent in all protected routes:

makefile
कोड कॉपी करें
Authorization: Bearer <jwt_token>
💰 Expense Handling
All expenses are user-scoped.
A logged-in user can only see and manage their own expenses.

💵 Money Handling — Integer Storage (Paise)
Amounts are stored as integers in paise (1 INR = 100 paise).

Example:

₹123.45 → stored as 12345

Why?

Prevents floating-point precision issues

Ensures financial accuracy

Conversion happens only at API response level

🔁 Idempotency for Safe Retries
POST /expenses accepts an optional:

makefile
कोड कॉपी करें
Idempotency-Key: <uuid>
If the same request is retried:

The API returns the original response

No duplicate expense is created

Now idempotency is enforced per user, preventing cross-user conflicts.

🗄 Persistence — SQLite via better-sqlite3
SQLite was chosen because:

Data survives server restarts

No external DB server required

Runs as a file alongside the app

WAL mode enabled for better read performance

Perfect for small-to-medium multi-user apps

If scaling further:

PostgreSQL would be a better choice

🧱 Database Design (Updated)
Users Table
id (UUID)

email (unique)

password_hash

created_at

Expenses Table
id (UUID)

user_id (foreign key)

amount (INTEGER in paise)

category

description

date

created_at

All expense queries are filtered by user_id.

📡 API Reference
(All routes below require authentication unless specified.)

POST /expenses
Headers:

vbnet
कोड कॉपी करें
Authorization: Bearer <token>
Idempotency-Key: <uuid> (optional)
Request:

json
कोड कॉपी करें
{
  "amount": 150.50,
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15"
}
Response — 201 Created

json
कोड कॉपी करें
{
  "id": "uuid",
  "amount": "150.50",
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15",
  "created_at": "2024-02-15T08:30:00.000Z"
}
GET /expenses
bash
कोड कॉपी करें
GET /expenses?category=Food&sort=date_desc
Response:

json
कोड कॉपी करें
{
  "expenses": [...],
  "total": "1234.50",
  "count": 12
}
GET /expenses/categories
Returns:

Default categories

User-created categories (if implemented)

🧪 Automated Tests
bash
कोड कॉपी करें
cd backend
npm test
Tests cover:

User registration & login

JWT validation

Creating a valid expense

Rejecting negative amounts

Idempotency (same key returns same result)

Filtering by category

Sorting by date

User isolation (one user cannot see another’s data)

⚖️ Trade-offs
Skipped	Reason
Password reset	Out of scope
Email verification	Not required for MVP
Pagination	Dataset small enough
Rate limiting	Would add in production
OAuth login	Simple JWT auth sufficient
PostgreSQL	SQLite adequate for current scale

❌ What I Intentionally Did Not Do
No currency conversion (INR only)

No real-time sync (refresh on action sufficient)

No Docker Compose (SQLite requires no external DB)

No role-based permissions (all users equal access to their own data only)

🛠 Quick Start (Local)
bash
कोड कॉपी करें
# 1. Clone the repo
git clone https://github.com/riag4080/Expense-Tracker-with-Multi-User.git
cd Expense-Tracker-with-Multi-User

# 2. Start backend
cd backend
npm install
npm start

# 3. Start frontend (new terminal)
cd frontend
npm install
npm start
Backend runs on:

arduino
कोड कॉपी करें
http://localhost:3001
Frontend runs on:

arduino
कोड कॉपी करें
http://localhost:3000
