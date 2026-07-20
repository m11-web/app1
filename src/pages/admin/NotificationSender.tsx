import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

async function sendPushNotification(title: string, body: string, tokens: string[]) {
  const messages = tokens.map(to => ({ to, sound: 'default', title, body }));
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!res.ok) throw new Error('Failed to send notifications');
}

export default function NotificationSender() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const templates = [
    { label: '🔥 New Arrival', title: 'New Products Just Added! 🌿', body: 'Check out our latest Rena Henna collection now!' },
    { label: '🎉 Weekend Sale', title: '🎉 Weekend Sale is Live!', body: 'Grab amazing deals on all products. Limited time only!' },
    { label: '📦 Order Update', title: 'Order Status Update', body: 'Your order has been confirmed and is being processed.' },
  ];

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) { setResult({ success: false, message: 'Please fill title and message.' }); return; }
    setSending(true); setResult(null);
    try {
      const { data: tokens } = await supabase.from('push_tokens').select('token');
      const tokenList = (tokens ?? []).map((t: any) => t.token).filter(Boolean);
      if (tokenList.length === 0) {
        setResult({ success: false, message: 'No users have enabled push notifications yet.' });
        setSending(false); return;
      }
      await sendPushNotification(title.trim(), body.trim(), tokenList);
      setResult({ success: true, message: `Notification sent to ${tokenList.length} user(s)! ✅` });
      setTitle(''); setBody('');
    } catch (e: any) {
      setResult({ success: false, message: e.message || 'Failed to send.' });
    } finally { setSending(false); }
  };

  const inputCls = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10">
      <div className="bg-primary px-5 pt-12 pb-5 flex items-center gap-4">
        <button onClick={() => nav(-1)} className="bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold">←</button>
        <h1 className="text-white font-black text-xl">Send Notification</h1>
      </div>

      <div className="p-5 space-y-5">
        {/* Templates */}
        <div>
          <h2 className="font-extrabold text-gray-900 dark:text-white text-base mb-3">Quick Templates</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {templates.map((t, i) => (
              <button key={i} onClick={() => { setTitle(t.title); setBody(t.body); }}
                className="flex-shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap active:scale-95 transition-transform">
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">
              Notification Title * <span className="text-gray-400 font-normal">({title.length}/60)</span>
            </label>
            <input className={inputCls} placeholder="e.g., New Products Available! 🌿" value={title}
              onChange={e => setTitle(e.target.value.slice(0, 60))} maxLength={60} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">
              Message * <span className="text-gray-400 font-normal">({body.length}/200)</span>
            </label>
            <textarea className={`${inputCls} resize-none`} placeholder="Write your message here..." value={body}
              onChange={e => setBody(e.target.value.slice(0, 200))} rows={4} maxLength={200} />
          </div>
        </div>

        {/* Preview */}
        {(title || body) && (
          <div className="bg-gray-900 dark:bg-gray-700 rounded-2xl p-4">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Preview</p>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white font-bold text-sm">{title || 'Notification Title'}</p>
              <p className="text-white/70 text-xs mt-1">{body || 'Message body...'}</p>
            </div>
          </div>
        )}

        {result && (
          <div className={`rounded-2xl px-4 py-3.5 ${result.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'}`}>
            <p className={`text-sm font-semibold ${result.success ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{result.message}</p>
          </div>
        )}

        <button onClick={handleSend} disabled={sending}
          className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
          {sending ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</> : '🔔 Send to All Users'}
        </button>
      </div>
    </div>
  );
}
