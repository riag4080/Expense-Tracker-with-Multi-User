import React from 'react';

const CATEGORY_COLORS = {
  Food: '#ef4444',
  Transport: '#3b82f6',
  Shopping: '#a855f7',
  Entertainment: '#f59e0b',
  Health: '#10b981',
  Utilities: '#6366f1',
  Housing: '#0ea5e9',
  Education: '#14b8a6',
  Other: '#78716c',
};

function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || '#6b7280';
  return (
    <span className="badge" style={{ background: `${color}20`, color }}>
      {category}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="skeleton-row">
      {[...Array(4)].map((_, i) => (
        <td key={i}><div className="skeleton-cell" /></td>
      ))}
    </tr>
  );
}

export default function ExpenseTable({ expenses, loading }) {
  if (loading) {
    return (
      <div className="card table-card">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="align-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="card table-card empty-state">
        <div className="empty-icon">₹</div>
        <p>No expenses found.</p>
        <p className="empty-hint">Add your first expense using the form.</p>
      </div>
    );
  }

  return (
    <div className="card table-card">
      <div className="table-wrapper">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="align-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="date-cell">
                  {new Date(expense.date + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="desc-cell">{expense.description}</td>
                <td><CategoryBadge category={expense.category} /></td>
                <td className="amount-cell align-right">
                  ₹{parseFloat(expense.amount).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
