import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts } from '../lib/store';
import { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import Spinner from '../components/Spinner';

export default function Products() {
  const nav = useNavigate();
  const { search } = useLocation();
  const queryCategory = new URLSearchParams(search).get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState(queryCategory);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => setSelectedCat(queryCategory), [queryCategory]);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    const matchCat = !selectedCat || p.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">

      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-black text-2xl">Shop 🛍️</h1>
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl pl-9 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <button
          onClick={() => setSelectedCat('')}
          className={`flex-shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition-colors ${
            !selectedCat ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >All</button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat === selectedCat ? '' : cat)}
            className={`flex-shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
              selectedCat === cat ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >{cat}</button>
        ))}
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">😔</p>
            <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">No products found</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Try a different search or category</p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 dark:text-gray-500 text-xs mb-3">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
