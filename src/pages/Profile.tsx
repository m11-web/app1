import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const nav = useNavigate();
  const { profile, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    if (confirm('Sign out?')) { await signOut(); nav('/'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col pb-24">
      <div className="bg-primary px-5 pt-12 pb-6">
        <h1 className="text-white font-black text-2xl">Profile 👤</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-6xl mb-4">👤</p>
        <h2 className="font-extrabold text-gray-900 dark:text-white text-xl mb-2">Sign In to Continue</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">View your orders and manage your account</p>
        <button onClick={() => nav('/login')}
          className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/30 active:scale-95 mb-3">
          Sign In
        </button>
        <button onClick={() => nav('/signup')}
          className="w-full border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl text-base active:scale-95">
          Create Account
        </button>
      </div>
      <BottomNav />
    </div>
  );

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    employee: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    customer: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  };

  const menuItems = [
    ...(profile.role === 'admin' ? [
      { emoji: '📊', label: 'Admin Dashboard', action: () => nav('/admin') },
      { emoji: '🏷️', label: 'Manage Banners', action: () => nav('/admin/banners') },
      { emoji: '🔔', label: 'Send Notification', action: () => nav('/admin/notifications') },
    ] : []),
    ...(profile.role === 'employee' ? [
      { emoji: '📦', label: 'Employee Dashboard', action: () => nav('/employee') },
    ] : []),
    { emoji: theme === 'dark' ? '☀️' : '🌙', label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', action: toggleTheme },
    { emoji: '🛍️', label: 'Continue Shopping', action: () => nav('/shop') },
    { emoji: '🚪', label: 'Sign Out', action: handleSignOut, danger: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-6">
        <h1 className="text-white font-black text-2xl">Profile 👤</h1>
      </div>

      {/* Profile card */}
      <div className="mx-4 -mt-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm text-center">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-white font-black text-3xl">
          {profile.full_name.charAt(0).toUpperCase()}
        </div>
        <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">{profile.full_name}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{profile.email}</p>
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${roleColors[profile.role] || roleColors.customer}`}>
          {profile.role}
        </span>
      </div>

      {/* Menu */}
      <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-gray-50 dark:active:bg-gray-700 ${
              i < menuItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
            }`}
          >
            <span className="text-xl w-7 text-center">{item.emoji}</span>
            <span className={`flex-1 font-semibold text-sm ${item.danger ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
              {item.label}
            </span>
            <span className="text-gray-300 dark:text-gray-600">›</span>
          </button>
        ))}
      </div>

      <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-6">
        Rena Henna v1.0 • Natural Beauty
      </p>

      <BottomNav />
    </div>
  );
}
