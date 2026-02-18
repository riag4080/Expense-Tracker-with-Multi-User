import React, { useState, useRef } from 'react';

function generateIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Housing', 'Education', 'Other'
];

const today = new Date().toISOString().split('T')[0];

export default function ExpenseForm({ categories, onSubmit }) {
  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: today,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const idempotencyKeyRef = useRef(generateIdempotencyKey());

  const validate = () => {
    const e = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      e.amount = 'Enter a valid positive amount';
    }
    if (!form.category) e.category = 'Select a category';
    if (!form.description.trim()) e.description = 'Enter a description';
    if (!form.date) e.date = 'Select a date';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      await onSubmit(
        {
          amount: parseFloat(form.amount),
          category: form.category,
          description: form.description.trim(),
          date: form.date ? new Date(form.date).toISOString().split('T')[0] : '',
        },
        idempotencyKeyRef.current
      );

      setForm({ amount: '', category: '', description: '', date: today });
      setErrors({});
      idempotencyKeyRef.current = generateIdempotencyKey();
    } catch (err) {
      const detail = err.details ? err.details.join(', ') : err.message;
      setApiError(`Failed to save expense: ${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])].sort();

  return (
    <div className="card form-card">
      <h2 className="card-title">
        <span className="icon">+</span> Add Expense
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className={`field ${errors.amount ? 'field--error' : ''}`}>
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            name="amount"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>

        <div className={`field ${errors.category ? 'field--error' : ''}`}>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="">Select category…</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>

        <div className={`field ${errors.description ? 'field--error' : ''}`}>
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            name="description"
            placeholder="What did you spend on?"
            maxLength={500}
            value={form.description}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className={`field ${errors.date ? 'field--error' : ''}`}>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            disabled={submitting}
          />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </div>

        {apiError && <div className="alert alert--error">{apiError}</div>}

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? (
            <><span className="spinner" /> Saving…</>
          ) : (
            'Add Expense'
          )}
        </button>
      </form>
    </div>
  );
}