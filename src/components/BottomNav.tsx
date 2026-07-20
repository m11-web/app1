import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { totalItems } = useCart();

  const tabs = [
    { path: '/', emoji: '🏠', label: 'Home' },
    { path: '/shop', emoji: '🛍️', label: 'Shop' },
    { path: '/cart', emoji: '🛒', label: 'Cart', badge: totalItems },
    { path: '/profile', emoji: '👤', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex z-40">
      {tabs.map(tab => {
        const active = pathname === tab.path || (tab.path === '/shop' && pathname.startsWith('/shop'));
        return (
          <button
            key={tab.path}
            onClick={() => nav(tab.path)}
            className="flex-1 flex flex-col items-center pt-3 pb-5 gap-0.5 relative cursor-pointer"
          >
            <span className="text-xl leading-none">{tab.emoji}</span>
            <span className={`text-[10px] font-semibold mt-0.5 ${active ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
              {tab.label}
            </span>
            {!!tab.badge && (
              <span className="absolute top-2 left-1/2 translate-x-1 bg-primary text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
            {active && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
