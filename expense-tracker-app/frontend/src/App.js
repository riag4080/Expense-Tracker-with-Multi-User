import React, { useState, useEffect, useCallback } from 'react';
import { getExpenses, getCategories, createExpense } from './api';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import FilterBar from './components/FilterBar';
import Summary from './components/Summary';
import LoginPage from './components/LoginPage';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('expense_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState('0.00');
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: 'all', sort: 'date_desc' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleLogin = (user) => {
    localStorage.setItem('expense_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('expense_user');
    setCurrentUser(null);
    setExpenses([]);
    setTotal('0.00');
    setCategories([]);
  };

  const fetchExpenses = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses(filters, currentUser.id);
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load expenses. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, currentUser]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    if (!currentUser) return;
    getCategories(currentUser.id)
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, [currentUser]);

  const handleAddExpense = async (formData, idempotencyKey) => {
    const expense = await createExpense(formData, idempotencyKey, currentUser.id);
    setSuccessMsg(`Expense "${expense.description}" added successfully!`);
    setTimeout(() => setSuccessMsg(null), 3000);
    await fetchExpenses();
    getCategories(currentUser.id).then((d) => setCategories(d.categories)).catch(() => {});
    return expense;
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">₹</span>
            <div>
              <h1>ExpenseTracker</h1>
              <p className="tagline">Track every rupee, every day</p>
            </div>
          </div>
          <div className="header-user">
            <span className="user-greeting">👤 {currentUser.username}</span>
            <button className="btn btn--logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="layout">
          <aside className="sidebar">
            <ExpenseForm
              categories={categories}
              onSubmit={handleAddExpense}
            />
            <Summary expenses={expenses} total={total} />
          </aside>

          <section className="content">
            {successMsg && (
              <div className="toast toast--success">{successMsg}</div>
            )}
            <FilterBar
              categories={categories}
              filters={filters}
              onChange={setFilters}
            />
            {error && (
              <div className="alert alert--error">
                {error}
                <button onClick={fetchExpenses} className="btn-retry">Retry</button>
              </div>
            )}
            <ExpenseTable
              expenses={expenses}
              loading={loading}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
