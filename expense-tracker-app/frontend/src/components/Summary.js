import React, { useMemo } from 'react';

export default function Summary({ expenses, total }) {
  const byCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const amt = parseFloat(e.amount);
      map[e.category] = (map[e.category] || 0) + amt;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({ category: cat, amount: amt }));
  }, [expenses]);

  const totalNum = parseFloat(total) || 0;

  return (
    <div className="card summary-card">
      <h2 className="card-title">
        <span className="icon">📊</span> Summary
      </h2>

      <div className="total-display">
        <span className="total-label">Total</span>
        <span className="total-amount">
          ₹{totalNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {byCategory.length > 0 && (
        <div className="category-breakdown">
          <p className="breakdown-title">By Category</p>
          {byCategory.map(({ category, amount }) => {
            const pct = totalNum > 0 ? (amount / totalNum) * 100 : 0;
            return (
              <div key={category} className="breakdown-row">
                <div className="breakdown-header">
                  <span className="breakdown-cat">{category}</span>
                  <span className="breakdown-amt">
                    ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-bar"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
