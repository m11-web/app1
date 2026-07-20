import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signUp, signInWithGoogle } from '../lib/auth';

export default function Signup() {
  const nav = useNavigate();
  const { setProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) { setError('Please fill all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    if ((result as any).needsConfirmation) { setConfirmed(true); return; }
    if (result.profile) { setProfile(result.profile); nav('/'); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { setError(error); setGoogleLoading(false); }
    // On success, browser redirects to Google — no need to do anything
  };

  const inputCls = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary transition-colors";

  // ── Email Confirmation Screen ──
  if (confirmed) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">📧</span>
        </div>
        <h1 className="font-black text-gray-900 dark:text-white text-2xl mb-3">Email Check Karo!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span> pe confirmation link bheja gaya hai.
        </p>
        <p className="text-gray-400 text-sm mb-8">Link pe click karo — phir login ho jaoge.</p>
        <button onClick={() => nav('/login')}
          className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/30">
          Sign In Page
        </button>
        <button onClick={() => { setConfirmed(false); setEmail(''); setPassword(''); setFullName(''); }}
          className="mt-3 text-sm text-gray-400 py-2">
          Dobara try karo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="bg-primary px-6 pt-16 pb-10 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full" />
        <div className="relative">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-white font-black text-2xl mb-1">Create Account</h1>
          <p className="text-white/70 text-sm">Join the Rena Henna family</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">

        {/* Google Sign Up */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl py-3.5 font-bold text-gray-700 dark:text-gray-200 text-sm active:scale-95 transition-transform disabled:opacity-60 shadow-sm"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          )}
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">Ya Email se</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Full Name</label>
          <input className={inputCls} placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Email Address</label>
          <input className={inputCls} type="email" placeholder="your@email.com" value={email}
            onChange={e => setEmail(e.target.value)} autoCapitalize="none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">Password</label>
          <div className="relative">
            <input className={`${inputCls} pr-12`} type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-primary text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</> : 'Create Account'}
        </button>

        <button onClick={() => nav('/login')} className="w-full text-center text-sm py-2">
          <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
          <span className="text-primary font-bold">Sign In</span>
        </button>
      </div>
    </div>
  );
}
