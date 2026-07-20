import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getOrders } from '../../lib/store';
import { Product, Order } from '../../lib/types';
import BackHeader from '../../components/BackHeader';
import Spinner from '../../components/Spinner';

export default function AdminDashboard() {
  const nav = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getOrders()])
      .then(([p, o]) => { setProducts(p); setOrders(o); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const lowStock = products.filter(p => p.stock_quantity <= 5).length;

  const stats = [
    { emoji: '📦', label: 'Products', value: products.length, color: 'text-primary' },
    { emoji: '🛒', label: 'Orders', value: orders.length, color: 'text-purple-500' },
    { emoji: '⏳', label: 'Pending', value: pending, color: 'text-yellow-500' },
    { emoji: '💰', label: 'Revenue', value: `Rs.${(totalRevenue/1000).toFixed(1)}k`, color: 'text-green-500' },
    { emoji: '⚠️', label: 'Low Stock', value: lowStock, color: 'text-red-500' },
    { emoji: '✅', label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600' },
  ];

  const quickActions = [
    { emoji: '🏷️', label: 'Manage Banners', path: '/admin/banners' },
    { emoji: '🔔', label: 'Send Notification', path: '/admin/notifications' },
  ];

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      <div className="bg-primary px-5 pt-12 pb-5 flex items-center gap-4">
        <button onClick={() => nav(-1)} className="bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold">←</button>
        <h1 className="text-white font-black text-xl flex-1">Admin Dashboard</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="p-4 space-y-5">

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-xl mb-1">{s.emoji}</p>
                <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-[11px]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="font-extrabold text-gray-900 dark:text-white text-base mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map(a => (
                <button key={a.path} onClick={() => nav(a.path)}
                  className="w-full bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform">
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="flex-1 font-bold text-gray-900 dark:text-white text-sm text-left">{a.label}</span>
                  <span className="text-gray-400">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div>
            <h2 className="font-extrabold text-gray-900 dark:text-white text-base mb-3">Recent Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-gray-400 text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 8).map(order => (
                  <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{order.customer_name}</p>
                      <p className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('en-PK')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-extrabold text-primary text-sm">Rs. {order.total.toFixed(0)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[order.status] || statusColor.pending}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
