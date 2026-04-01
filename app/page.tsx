// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:3000/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // লগইন সফল হলে টোকেন সেভ করব
        localStorage.setItem('accessToken', data.access_token);
        // সফল লগইনের পর ইউজারকে ড্যাশবোর্ডে পাঠিয়ে দেওয়া হচ্ছে! 🚀
        router.push('/dashboard'); 
      } else {
        setErrorMsg(data.message || 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে!');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('সার্ভারের সাথে কানেক্ট করা যাচ্ছে না। দয়া করে ব্যাকএন্ড চালু আছে কি না চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        
        {/* লোগো এবং টাইটেল */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight mb-2">
            EduNex<span className="text-slate-800">BD</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-wide">কলেজ ম্যানেজমেন্ট সিস্টেম</p>
        </div>

        {/* এরর মেসেজ */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* লগইন ফর্ম */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* ইমেইল ফিল্ড */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2" htmlFor="email">
              ইমেইল অ্যাড্রেস
            </label>
            <input
              id="email"
              name="email"             // <-- Fix: name যুক্ত করা হয়েছে
              autoComplete="email"     // <-- Fix: ব্রাউজার অটোফিলের জন্য
              type="email"
              placeholder="admin@edunex.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 transition-all bg-slate-50 focus:bg-white"
              required
            />
          </div>

          {/* পাসওয়ার্ড ফিল্ড */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2" htmlFor="password">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              name="password"                    // <-- Fix: name যুক্ত করা হয়েছে
              autoComplete="current-password"    // <-- Fix: ব্রাউজার অটোফিলের জন্য
              type="password"
              placeholder="আপনার পাসওয়ার্ড দিন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 transition-all bg-slate-50 focus:bg-white"
              required
            />
          </div>

          {/* লগইন বাটন */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-4 rounded-xl text-white font-bold text-lg transition-all shadow-lg
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
          >
            {loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
          </button>

        </form>

      </div>
    </div>
  );
}