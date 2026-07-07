import { useState } from 'react';

const categories = [
  { value: 'all', label: 'Semua' },
  { value: 'device', label: 'Device' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'pod', label: 'Pod System' },
  { value: 'coil', label: 'Coil' },
  { value: 'accessories', label: 'Aksesoris' },
];

const sortOptions = [
  { value: '-created_date', label: 'Terbaru' },
  { value: 'base_price', label: 'Harga Terendah' },
  { value: '-base_price', label: 'Harga Tertinggi' },
  { value: '-total_sold', label: 'Terlaris' },
];

export default function CategoryFilter({ activeCategory, onCategoryChange, sortBy, onSortChange, searchQuery, onSearchChange }) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Cari produk, brand..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ghost placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.value
                ? 'gradient-violet text-white glow-violet-sm'
                : 'border border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-ghost'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-sm whitespace-nowrap">Urutkan:</span>
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400 text-sm focus:outline-none focus:border-violet-500/40 cursor-pointer"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-gray-900">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}