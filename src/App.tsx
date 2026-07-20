import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import BannerManager from './pages/admin/BannerManager';
import NotificationSender from './pages/admin/NotificationSender';
import EmployeeDashboard from './pages/employee/Dashboard';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-pink-100 dark:bg-gray-950 flex justify-center">
              <div className="w-full max-w-[430px] min-h-screen bg-white dark:bg-gray-900 relative shadow-2xl">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Products />} />
                  <Route path="/shop/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/banners" element={<BannerManager />} />
                  <Route path="/admin/notifications" element={<NotificationSender />} />
                  <Route path="/employee" element={<EmployeeDashboard />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
