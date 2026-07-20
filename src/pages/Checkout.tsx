import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../lib/store';
import { getCurrentPrice } from '../lib/types';
import BackHeader from '../components/BackHeader';
import Spinner from '../components/Spinner';

export default function Checkout() {
  const nav = useNavigate();
  const { items, clearCart, totalPrice } = useCart();
  const { profile } = useAuth();

  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payMethod, setPayMethod] = useState<'cod' | 'bank'>('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = totalPrice >= 2000 ? 0 : 150;
  const total = totalPrice + shipping;

  if (items.length === 0) { nav('/cart'); return null; }

  const handleOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill all required fields.'); return;
    }
    setError('');
    setLoading(true);
    try {
      await placeOrder(
        {
          customer_name: name.trim(),
          customer_email: profile?.email || email.trim() || 'guest',
          whatsapp_number: phone.trim(),
          address: address.trim(),
          payment_method: payMethod,
          shipping_type: 'Standard',
          shipping_fee: shipping,
          subtotal: totalPrice,
          total,
          status: 'pending',
        },
        items.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: getCurrentPrice(i.product),
          manufacturing_price: i.product.manufacturing_price,
        }))
      );
      clearCart();
      nav('/order-success');
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <BackHeader title="Checkout" />

      <div className="p-5 space-y-6 pb-32">

        {/* Guest notice */}
        {!profile && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              💡 <button onClick={() => nav('/login')} className="underline font-semibold">Sign in</button> to save your order history.
            </p>
          </div>
        )}

        {/* Delivery details */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-extrabold text-gray-900 dark:text-white text-base">Delivery Details</h2>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Full Name *</label>
            <input className={inputCls} placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          {!profile && (
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Email Address</label>
              <input className={inputCls} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} autoCapitalize="none" />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">WhatsApp Number *</label>
            <input className={inputCls} placeholder="03XX-XXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Full Address *</label>
            <textarea className={`${inputCls} resize-none`} placeholder="Street, city, province" value={address} onChange={e => setAddress(e.target.value)} rows={3} />
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
          <h2 className="font-extrabold text-gray-900 dark:text-white text-base mb-4">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['cod', 'bank'] as const).map(method => (
              <button
                key={method}
                onClick={() => setPayMethod(method)}
                className={`py-4 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 ${
                  payMethod === method
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {method === 'cod' ? '💵 Cash on Delivery' : '🏦 Bank Transfer'}
              </button>
            ))}
          </div>
          {payMethod === 'bank' && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-400">
              <p className="font-bold mb-1">Bank Details</p>
              <p>Account: Rena Henna</p>
              <p>Please send screenshot on WhatsApp after transfer.</p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
          <h2 className="font-extrabold text-gray-900 dark:text-white text-base mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex-1 mr-4 truncate">{item.product.name} × {item.quantity}</span>
                <span className="font-semibold text-gray-900 dark:text-white">Rs. {(getCurrentPrice(item.product) * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">Rs. {totalPrice.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-extrabold text-gray-900 dark:text-white text-base">Total</span>
              <span className="font-extrabold text-primary text-base">Rs. {total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-5 py-4 z-30">
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <><Spinner className="w-5 h-5 border-2" /> Placing Order...</> : `Place Order • Rs. ${total.toFixed(0)}`}
        </button>
      </div>
    </div>
  );
}
