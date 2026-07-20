import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Product } from '../../lib/types';
import BackHeader from '../../components/BackHeader';
import Spinner from '../../components/Spinner';

const EMPTY: Omit<Product, 'id' | 'created_at'> = {
  name: '',
  description: '',
  category: '',
  retail_price: 0,
  wholesale_price: 0,
  manufacturing_price: 0,
  stock_quantity: 0,
  image_url: '',
  is_active: true,
  sale_percentage: 0,
};

export default function ProductManager() {
  const nav = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...EMPTY });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category || '',
      retail_price: p.retail_price,
      wholesale_price: p.wholesale_price,
      manufacturing_price: p.manufacturing_price,
      stock_quantity: p.stock_quantity,
      image_url: p.image_url || '',
      is_active: p.is_active,
      sale_percentage: p.sale_percentage ?? 0,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Product name required.'); return; }
    if (form.retail_price <= 0) { setError('Retail price must be greater than 0.'); return; }
    setSaving(true); setError('');
    try {
      if (editProduct) {
        const { error } = await supabase.from('products').update(form).eq('id', editProduct.id);
        if (error) throw error;
        setSuccess('Product updated!');
      } else {
        const { error } = await supabase.from('products').insert(form);
        if (error) throw error;
        setSuccess('Product added!');
      }
      setShowModal(false);
      await fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('products').delete().eq('id', id);
    setSaving(false);
    setDeleteConfirm(null);
    if (!error) { setSuccess('Product deleted.'); fetchProducts(); setTimeout(() => setSuccess(''), 3000); }
    else setError(error.message);
  };

  const toggleActive = async (p: Product) => {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    fetchProducts();
  };

  const inp = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      <div className="bg-primary px-5 pt-12 pb-5 flex items-center gap-4">
        <button onClick={() => nav('/admin')} className="bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg">←</button>
        <h1 className="text-white font-black text-xl flex-1">Manage Products</h1>
        <button onClick={openAdd} className="bg-white text-primary font-bold text-sm px-4 py-2 rounded-full shadow">+ Add</button>
      </div>

      {success && (
        <div className="mx-4 mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-4 py-3">
          <p className="text-green-700 dark:text-green-400 text-sm font-semibold">✅ {success}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="p-4 space-y-3">
          {products.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-400 text-sm">No products yet. Add one!</p>
            </div>
          )}
          {products.map(p => (
            <div key={p.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden ${!p.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 p-4">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{p.name}</p>
                    {!p.is_active && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Hidden</span>}
                    {(p.sale_percentage ?? 0) > 0 && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">-{p.sale_percentage}% Sale</span>}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{p.category || 'No category'}</p>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-primary font-bold">Rs. {p.retail_price}</span>
                    <span className="text-gray-400">Stock: {p.stock_quantity}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 flex">
                <button onClick={() => toggleActive(p)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {p.is_active ? '👁️ Hide' : '👁️ Show'}
                </button>
                <div className="w-px bg-gray-100 dark:bg-gray-700" />
                <button onClick={() => openEdit(p)}
                  className="flex-1 py-2.5 text-xs font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  ✏️ Edit
                </button>
                <div className="w-px bg-gray-100 dark:bg-gray-700" />
                <button onClick={() => setDeleteConfirm(p.id)}
                  className="flex-1 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 w-full max-w-[430px] rounded-t-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-black text-gray-900 dark:text-white text-lg">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl w-8 h-8 flex items-center justify-center">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Product Name *</label>
                <input className={inp} placeholder="e.g. Rena Henna Stencil W11" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category</label>
                <input className={inp} placeholder="e.g. Stencils, Heavy Stencil" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Description</label>
                <textarea className={`${inp} resize-none`} rows={2} placeholder="Product description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Image URL</label>
                <input className={inp} placeholder="https://res.cloudinary.com/..." value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Retail Price (Rs.) *</label>
                  <input className={inp} type="number" min="0" value={form.retail_price} onChange={e => setForm(f => ({ ...f, retail_price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Wholesale Price (Rs.)</label>
                  <input className={inp} type="number" min="0" value={form.wholesale_price} onChange={e => setForm(f => ({ ...f, wholesale_price: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Mfg. Price (Rs.)</label>
                  <input className={inp} type="number" min="0" value={form.manufacturing_price} onChange={e => setForm(f => ({ ...f, manufacturing_price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Stock Quantity</label>
                  <input className={inp} type="number" min="0" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Sale % (0 = no sale)</label>
                  <input className={inp} type="number" min="0" max="99" value={form.sale_percentage} onChange={e => setForm(f => ({ ...f, sale_percentage: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Status</label>
                  <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    className={`w-full py-3 rounded-xl text-sm font-bold border-2 transition-colors ${form.is_active ? 'border-green-400 text-green-600 bg-green-50' : 'border-gray-300 text-gray-400 bg-gray-50'}`}>
                    {form.is_active ? '✅ Active' : '❌ Hidden'}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{error}</p>}

              <button onClick={handleSave} disabled={saving}
                className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/30 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : (editProduct ? 'Save Changes' : 'Add Product')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className="text-3xl text-center mb-3">⚠️</p>
            <h3 className="font-black text-gray-900 dark:text-white text-center text-lg mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">Yeh action undo nahi ho sakti.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold disabled:opacity-60">
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
