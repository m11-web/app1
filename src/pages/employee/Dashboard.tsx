import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, recordSale } from '../../lib/store';
import { Product, SaleType, getCurrentPrice } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';

export default function EmployeeDashboard() {
  const nav = useNavigate();
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [saleType, setSaleType] = useState<SaleType>('retail');
  const [qty, setQty] = useState(1);
  const [customPrice, setCustomPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || (p.category || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  const getPrice = () => {
    if (!selected) return 0;
    if (customPrice) return parseFloat(customPrice) || 0;
    return saleType === 'wholesale' ? selected.wholesale_price : getCurrentPrice(selected);
  };

  const handleRecord = async () => {
    if (!selected) return;
    const price = getPrice();
    if (!price || price <= 0) { alert('Invalid price'); return; }
    setSaving(true);
    try {
      await recordSale({
        product_id: selected.id,
        product_name: selected.name,
        quantity: qty,
        unit_price: price,
        manufacturing_price: selected.manufacturing_price,
        profit: (price - selected.manufacturing_price) * qty,
        sale_type: saleType,
        sold_by: profile?.id || null,
      });
      setSuccess(`✅ Sale recorded! ${selected.name} × ${qty} @ Rs. ${price}`);
      setSelected(null);
      setQty(1);
      setCustomPrice('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e: any) {
      alert(e.message || 'Failed to record sale');
    } finally { setSaving(false); }
  };

  const inputCls = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      <div className="bg-primary px-5 pt-12 pb-5 flex items-center gap-4">
        <button onClick={() => nav(-1)} className="bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold">←</button>
        <div className="flex-1">
          <h1 className="text-white font-black text-xl">Employee Dashboard</h1>
          <p className="text-white/70 text-xs">Hi, {profile?.full_name || 'Employee'} 👋</p>
        </div>
      </div>

      {success && (
        <div className="mx-4 mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl px-4 py-3.5">
          <p className="text-green-700 dark:text-green-400 text-sm font-semibold">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input className={`${inputCls} pl-9`} placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>

          <h2 className="font-extrabold text-gray-900 dark:text-white text-base">Select Product to Record Sale</h2>

          <div className="space-y-2">
            {filtered.map(p => (
              <button key={p.id} onClick={() => { setSelected(p); setQty(1); setCustomPrice(''); setSaleType('retail'); }}
                className={`w-full text-left rounded-2xl p-4 shadow-sm transition-all active:scale-[0.98] flex items-center gap-3 ${selected?.id === p.id ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800'}`}>
                <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                  onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${selected?.id === p.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{p.name}</p>
                  <p className={`text-xs ${selected?.id === p.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>{p.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-extrabold text-sm ${selected?.id === p.id ? 'text-white' : 'text-primary'}`}>Rs. {getCurrentPrice(p)}</p>
                  <p className={`text-[10px] ${selected?.id === p.id ? 'text-white/60' : 'text-gray-400'}`}>Stock: {p.stock_quantity}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sale modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-[430px] rounded-t-3xl p-6 pb-8 animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">Record Sale</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{selected.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl">✕</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Sale Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['retail', 'wholesale'] as const).map(type => (
                  <button key={type} onClick={() => setSaleType(type)}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-colors capitalize ${saleType === type ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {type === 'retail' ? '🏪 Retail' : '📦 Wholesale'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Quantity</label>
              <div className="flex items-center gap-4">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 font-bold text-xl flex items-center justify-center active:scale-90">−</button>
                <span className="font-extrabold text-gray-900 dark:text-white text-xl w-10 text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 font-bold text-xl flex items-center justify-center active:scale-90">+</button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">
                Price per unit (leave empty for default: Rs. {saleType === 'wholesale' ? selected.wholesale_price : getCurrentPrice(selected)})
              </label>
              <input className={inputCls} type="number" placeholder={`Default: Rs. ${saleType === 'wholesale' ? selected.wholesale_price : getCurrentPrice(selected)}`}
                value={customPrice} onChange={e => setCustomPrice(e.target.value)} />
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Price</span>
                <span className="font-semibold text-gray-900 dark:text-white">Rs. {getPrice()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Qty</span>
                <span className="font-semibold text-gray-900 dark:text-white">× {qty}</span>
              </div>
              <div className="flex justify-between font-extrabold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-purple-600 dark:text-purple-400">Rs. {(getPrice() * qty).toFixed(0)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold py-3.5 rounded-2xl active:scale-95">Cancel</button>
              <button onClick={handleRecord} disabled={saving}
                className="flex-1 bg-purple-500 text-white font-bold py-3.5 rounded-2xl active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Recording...</> : 'Record Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
