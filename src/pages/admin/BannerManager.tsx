import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBanners, upsertBanner, deleteBanner } from '../../lib/store';
import { AppBanner } from '../../lib/types';
import Spinner from '../../components/Spinner';

export default function BannerManager() {
  const nav = useNavigate();
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: '', title: '', subtitle: '', image_url: '', is_active: true });

  const load = () => getAllBanners().then(setBanners).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ id: '', title: '', subtitle: '', image_url: '', is_active: true });

  const handleSave = async () => {
    if (!form.title.trim()) { alert('Title is required'); return; }
    setSaving(true);
    try {
      await upsertBanner({ ...(form.id ? { id: form.id } : {}), title: form.title.trim(), subtitle: form.subtitle.trim(), image_url: form.image_url.trim(), is_active: form.is_active });
      await load();
      setShowForm(false);
      resetForm();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await deleteBanner(id);
    await load();
  };

  const handleEdit = (b: AppBanner) => {
    setForm({ id: b.id, title: b.title, subtitle: b.subtitle, image_url: b.image_url, is_active: b.is_active });
    setShowForm(true);
  };

  const inputCls = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      <div className="bg-primary px-5 pt-12 pb-5 flex items-center gap-4">
        <button onClick={() => nav(-1)} className="bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold">←</button>
        <h1 className="text-white font-black text-xl flex-1">Banners</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-white text-primary font-bold text-sm px-4 py-2 rounded-full active:scale-95">
          + New
        </button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner /></div> : (
        <div className="p-4 space-y-3">
          {banners.length === 0 && !showForm ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🏷️</p>
              <p className="text-gray-500 dark:text-gray-400">No banners yet. Create one!</p>
            </div>
          ) : banners.map(b => (
            <div key={b.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              {b.image_url && <img src={b.image_url} alt={b.title} className="w-full h-32 object-cover rounded-xl mb-3" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{b.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate">{b.subtitle}</p>
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full ${b.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    {b.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(b)} className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center text-sm">✏️</button>
                  <button onClick={() => handleDelete(b.id)} className="w-9 h-9 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-xl flex items-center justify-center text-sm">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-[430px] rounded-t-3xl p-6 pb-8 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">{form.id ? 'Edit Banner' : 'New Banner'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Title *</label>
              <input className={inputCls} placeholder="e.g., Weekend Sale!" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Subtitle</label>
              <input className={inputCls} placeholder="Short description" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Image URL</label>
              <input className={inputCls} placeholder="https://..." value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                className={`w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_active ? 'left-6' : 'left-0.5'}`} />
              </button>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {form.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold py-3.5 rounded-2xl active:scale-95">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-primary text-white font-bold py-3.5 rounded-2xl active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving</> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
