import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, getCurrentPrice, isFriday } from '../lib/types';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const nav = useNavigate();
  const { addItem } = useCart();
  const price = getCurrentPrice(product);
  const hasDiscount = product.discount_percent > 0;
  const outOfStock = product.stock_quantity === 0;
  const friday = isFriday();

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => nav(`/shop/${product.id}`)}
    >
      <div className="relative">
        <img
          src={product.image_url || 'https://placehold.co/300x200/E75480/white?text=🌿'}
          alt={product.name}
          className="w-full h-40 object-cover"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/E75480/white?text=🌿'; }}
        />
        {hasDiscount && !outOfStock && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
            {friday ? '🌟 FRI' : `-${product.discount_percent}%`}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{product.category}</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 mb-2">{product.name}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-extrabold text-primary text-base">Rs. {price}</span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through">Rs. {product.retail_price}</span>
          )}
        </div>
        <button
          className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
            outOfStock
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark text-white active:scale-95 transition-transform'
          }`}
          onClick={e => { e.stopPropagation(); if (!outOfStock) addItem(product); }}
          disabled={outOfStock}
        >
          {outOfStock ? 'Out of Stock' : '+ Add to Cart'}
        </button>
      </div>
    </div>
  );
}
