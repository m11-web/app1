import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getProducts, getBanners } from '../lib/store';
import { Product, AppBanner, isFriday } from '../lib/types';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import Spinner from '../components/Spinner';

export default function Home() {
  const { profile } = useAuth();
  const nav = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [banner, setBanner] = useState<AppBanner | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const friday = isFriday();

  useEffect(() => {
    Promise.all([getProducts(), getBanners()])
      .then(([prods, banners]) => {
        setProducts(prods);
        if (banners.length > 0) { setBanner(banners[0]); setShowPopup(true); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 6);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">

      {/* Hero header */}
      <div className="bg-primary px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-8 right-16 w-20 h-20 bg-white/10 rounded-full" />
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-white/80 text-sm mb-1">
              {profile ? `Salam, ${profile.full_name.split(' ')[0]}! 👋` : 'Welcome to'}
            </p>
            <h1 className="text-white font-black text-3xl italic mb-2">Rena Henna 🌿</h1>
            <p className="text-white/70 text-xs tracking-wide">Natural Beauty • Pure Henna Products</p>
          </div>
          <button onClick={toggleTheme} className="text-white/80 text-2xl mt-1 p-1">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <button
          onClick={() => nav('/shop')}
          className="mt-5 bg-white text-primary font-extrabold px-7 py-3 rounded-full text-sm shadow-lg active:scale-95 transition-transform"
        >
          Shop Now →
        </button>
        {friday && (
          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2">
            <p className="text-white text-xs font-bold">🌟 Friday Special — Rs. 10 off on every product!</p>
          </div>
        )}
      </div>

      <div className="px-4 py-5 space-y-6">

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h2 className="font-extrabold text-gray-900 dark:text-white text-lg mb-3">Categories</h2>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => nav('/shop')}
                className="flex-shrink-0 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-transform"
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => nav(`/shop?category=${encodeURIComponent(cat)}`)}
                  className="flex-shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap active:scale-95 transition-transform"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">Featured Products</h2>
            <button onClick={() => nav('/shop')} className="text-primary text-sm font-bold active:opacity-70">
              See All
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : featured.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🌿</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No products yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>

        {/* Bottom banner */}
        <button
          onClick={() => nav('/shop')}
          className="w-full bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 text-center active:scale-[0.98] transition-transform"
        >
          <p className="text-yellow-400 font-extrabold text-base mb-1">🌟 Natural Henna • Premium Quality</p>
          <p className="text-white/60 text-sm">Explore all products →</p>
        </button>
      </div>

      <BottomNav />

      {/* Sales popup */}
      {showPopup && banner && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowPopup(false)} />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-[430px] rounded-t-3xl overflow-hidden pb-8 animate-slide-up">
            {banner.image_url ? (
              <img src={banner.image_url} alt={banner.title} className="w-full h-52 object-cover" />
            ) : (
              <div className="w-full h-48 bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <span className="text-7xl">🎉</span>
              </div>
            )}
            <div className="absolute top-4 left-0 bg-primary text-white text-[11px] font-black px-5 py-1.5 rounded-r-full shadow">
              🔥 SPECIAL OFFER
            </div>
            <div className="px-6 pt-5">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-xl mb-2">{banner.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">{banner.subtitle}</p>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl text-base mb-3 active:scale-95 transition-transform shadow-lg shadow-primary/30"
              >
                Shop Now →
              </button>
              <button onClick={() => setShowPopup(false)} className="w-full text-gray-400 text-sm py-2">
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
