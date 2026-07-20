import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signUp } from '../lib/auth';

export default function Signup() {
  const nav = useNavigate();
  const { setProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!fullName || !email || !password) { setError('Please fill all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setProfile(result.profile);
    nav('/');
  };

  const inputCls = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary transition-colors";

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
