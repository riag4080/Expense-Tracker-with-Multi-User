import React, { useState } from 'react';
import { login, register } from '../api';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(username.trim(), password);
      } else {
        user = await register(username.trim(), password);
      }
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-icon">₹</span>
          <div>
            <h1>ExpenseTracker</h1>
            <p className="tagline">Track every rupee, every day</p>
          </div>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Login
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label className="field-label">Username</label>
            <input
              className="field-input"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              placeholder={mode === 'register' ? 'Min 4 characters' : 'Enter password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="alert alert--error" style={{ marginBottom: 0 }}>{error}</div>}

          <button type="submit" className="btn btn--primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? (mode === 'login' ? 'Logging in...' : 'Creating account...') : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>

        <p className="login-footer">
          {mode === 'login' ? (
            <>Don't have an account? <button className="link-btn" onClick={() => { setMode('register'); setError(null); }}>Register</button></>
          ) : (
            <>Already have an account? <button className="link-btn" onClick={() => { setMode('login'); setError(null); }}>Login</button></>
          )}
        </p>
      </div>
    </div>
  );
}
