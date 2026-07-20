import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderSuccess() {
  const nav = useNavigate();
  const [count, setCount] = useState(5);

  useEffect(() => {
    const t = setInterval(() => setCount(c => {
      if (c <= 1) { clearInterval(t); nav('/'); return 0; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-8 text-center">
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <span className="text-5xl">✅</span>
      </div>
      <h1 className="font-black text-gray-900 dark:text-white text-2xl mb-3">Order Placed!</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">
        Thank you for your order! We'll contact you on WhatsApp to confirm delivery.
      </p>
      <p className="text-gray-400 dark:text-gray-500 text-xs mb-10">
        Redirecting in {count}s...
      </p>
      <button
        onClick={() => nav('/')}
        className="w-full max-w-xs bg-primary text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/30 active:scale-95 transition-transform mb-3"
      >
        Back to Home
      </button>
      <button
        onClick={() => nav('/shop')}
        className="w-full max-w-xs border-2 border-primary text-primary font-extrabold py-4 rounded-2xl text-base active:scale-95 transition-transform"
      >
        Continue Shopping
      </button>
    </div>
  );
}
