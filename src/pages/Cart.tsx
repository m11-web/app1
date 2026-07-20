import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCurrentPrice } from '../lib/types';
import BottomNav from '../components/BottomNav';

export default function Cart() {
  const nav = useNavigate();
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const shipping = totalPrice >= 2000 ? 0 : 150;
  const total = totalPrice + shipping;

  if (items.length === 0) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-8 pb-24">
      <p className="text-7xl mb-4">🛒</p>
      <h2 className="font-extrabold text-gray-900 dark:text-white text-xl mb-2">Your cart is empty</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">Add products to get started</p>
      <button
        onClick={() => nav('/shop')}
        className="bg-primary text-white font-extrabold px-8 py-3.5 rounded-2xl active:scale-95 transition-transform"
      >
        Browse Products
      </button>
      <BottomNav />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
        <h1 className="font-extrabold text-gray-900 dark:text-white text-2xl">My Cart 🛒</h1>
        <button
          onClick={() => { if (confirm('Remove all items?')) clearCart(); }}
          className="text-red-400 text-sm font-semibold active:opacity-70"
        >
          Clear
        </button>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {items.map(item => {
          const price = getCurrentPrice(item.product);
          return (
            <div key={item.product.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex gap-3 shadow-sm">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/E75480/white?text=🌿'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">{item.product.name}</p>
                <p className="text-primary font-extrabold text-base mt-1">Rs. {price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQty(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 font-bold flex items-center justify-center text-gray-700 dark:text-gray-300 active:scale-90 transition-transform"
                  >−</button>
                  <span className="font-bold text-gray-900 dark:text-white text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 font-bold flex items-center justify-center text-gray-700 dark:text-gray-300 active:scale-90 transition-transform"
                  >+</button>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="ml-auto text-red-400 text-lg active:scale-90 transition-transform"
                  >🗑️</button>
                </div>
              </div>
              <p className="font-extrabold text-gray-900 dark:text-white text-sm flex-shrink-0">
                Rs. {(price * item.quantity).toFixed(0)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <h3 className="font-extrabold text-gray-900 dark:text-white mb-4">Order Summary</h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span className="font-semibold text-gray-900 dark:text-white">Rs. {totalPrice.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Shipping</span>
            <span className={`font-semibold ${shipping === 0 ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
              {shipping === 0 ? 'FREE 🎉' : `Rs. ${shipping}`}
            </span>
          </div>
          {shipping > 0 && (
            <p className="text-xs text-gray-400">Free shipping on orders over Rs. 2000</p>
          )}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
            <span className="font-extrabold text-gray-900 dark:text-white">Total</span>
            <span className="font-extrabold text-primary text-lg">Rs. {total.toFixed(0)}</span>
          </div>
        </div>

        <button
          onClick={() => nav('/checkout')}
          className="w-full mt-5 bg-primary text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        >
          Proceed to Checkout →
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
