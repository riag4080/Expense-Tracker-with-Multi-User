import React from 'react';

export default function FilterBar({ categories, filters, onChange }) {
  const handleChange = (key, value) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="filter-category">Filter by Category</label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-sort">Sort by Date</label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => handleChange('sort', e.target.value)}
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
