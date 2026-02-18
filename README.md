# 💰 ExpenseTracker — Full-Stack Multi-User Personal Finance Tool

A personal finance tool built with **Node.js/Express (backend)** and **React (frontend)** that allows **multiple users** to securely manage their own expenses using authentication.

---

## 🚀 Live Demo

| | Link |
|---|---|
| **Frontend** | https://expense-tracker-with-multi-user.vercel.app/ |
| **Backend API** | https://expense-tracker-with-multi-user.onrender.com/ |

> Backend is hosted on Render’s free tier — first request may take ~50 seconds to wake up.

---

## ⚡ Quick Start (Local)

```bash
# 1. Clone the repo
git clone https://github.com/riag4080/Expense-Tracker-with-Multi-User.git
cd expense-tracker

# 2. Start backend
cd backend
npm install
npm start          # http://localhost:3001

# 3. Start frontend (new terminal)
cd frontend
npm install
npm start          # http://localhost:3000


## 🧠 Key Design Decisions

### 🔐 Authentication & Multi-User Support

The app now supports **multiple users** with secure authentication.

#### Tech Stack

- JWT (JSON Web Token) for stateless authentication  
- bcrypt for password hashing  
- Auth middleware to protect private routes  

#### Authentication Flow

1. User registers (`/auth/register`)
2. Password is hashed before storing
3. User logs in → JWT token is generated
4. Client stores token and sends:

Authorization: Bearer <token>


5. Backend verifies token and extracts `user_id`
6. All expense operations are scoped to that user

---

### 🗄️ Data Isolation (Core Change)

Every expense belongs to a specific user.

#### Expenses Table (Conceptual)

```sql
expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK(amount > 0),
  category TEXT,
  description TEXT,
  date TEXT,
  created_at TEXT
)
All queries are automatically filtered:

WHERE user_id = ?
➡️ Users cannot view or modify other users’ expenses.

💰 Money Handling — Integer Storage (Paise)
Amounts are stored as integers in paise:

₹123.45 → 12345
Benefits
Avoids floating-point errors

Safe arithmetic operations

Conversion happens only at API response level

🔁 Idempotency for Safe Retries
POST /expenses supports:

Idempotency-Key: <uuid>
Behavior
Same user + key → returns original response

Prevents duplicate entries from retries / double clicks

Different users → independent records

💾 Persistence — SQLite via better-sqlite3
SQLite is retained because:

Data survives restarts

No external DB service required

WAL mode improves read performance

Great fit for small-to-medium apps

PostgreSQL can be used later for scaling.

✅ Validation Strategy
Validation happens at multiple layers:

Frontend validation for UX

Backend validation for safety

Database constraints as final guard

Example DB constraint:

CHECK(amount > 0)
🔐 Authentication API
POST /auth/register
Request Body
{
  "name": "Jitin",
  "email": "jitin@example.com",
  "password": "securePassword"
}
Response
{
  "user": {
    "id": "uuid",
    "name": "Jitin",
    "email": "jitin@example.com"
  },
  "token": "jwt-token"
}
POST /auth/login
Request Body
{
  "email": "jitin@example.com",
  "password": "securePassword"
}
Response
{
  "user": {
    "id": "uuid",
    "name": "Jitin",
    "email": "jitin@example.com"
  },
  "token": "jwt-token"
}
GET /auth/me
Returns currently logged-in user details.

Headers
Authorization: Bearer <token>
📦 Expense API (Protected Routes)
All routes require authentication.

POST /expenses
Headers
Authorization: Bearer <token>
Idempotency-Key: <uuid>   // optional
Request Body
{
  "amount": 150.50,
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15"
}
Response — 201 Created
{
  "id": "uuid",
  "amount": "150.50",
  "category": "Food",
  "description": "Lunch at office",
  "date": "2024-02-15",
  "created_at": "2024-02-15T08:30:00.000Z"
}
GET /expenses
Example:

GET /expenses?category=Food&sort=date_desc
Response
{
  "expenses": [...],
  "total": "1234.50",
  "count": 12
}
GET /expenses/categories
Returns categories used by the logged-in user.

🎨 Frontend Changes for Multi-User
Added Features
Login & Register pages

Protected routes

Auth Context (React Context API)

Auto token storage (localStorage)

Logout support

Redirect to login if token missing

⚖️ Trade-offs (Due to Timebox)
Skipped	Reason
Email verification	Out of scope
Password reset flow	Not required initially
Refresh tokens	Added complexity
Pagination	Dataset expected to be small
Rate limiting	Add for production
OAuth login	Optional future enhancement
🚫 What I Intentionally Did Not Do
No real-time sync (refresh after actions is sufficient)

No currency conversion (INR only)

No microservices (kept architecture simple)

No Docker Compose (SQLite works locally)

🧪 Automated Tests
cd backend
npm test
Tests Cover
User registration & login

JWT-protected routes

Creating expenses

Rejecting invalid amounts

Idempotency behavior

User-level data isolation

Filtering & sorting

🔮 Future Improvements
Edit / Delete expense

Monthly analytics dashboard

Charts (category breakdown)

Export CSV / PDF

Budget limits & alerts

Migration to PostgreSQL

Refresh-token authentication

🏗️ Architecture Summary
React Frontend
     |
     | JWT Auth
     |
Node.js + Express API
     |
SQLite (better-sqlite3)
