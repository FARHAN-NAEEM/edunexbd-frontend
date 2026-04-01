// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/'); 
    }
  }, [router]);

  if (!isClient) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full min-h-[calc(100vh-10rem)]">
      <div className="bg-white p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 text-center max-w-lg w-full">
        
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">স্বাগতম, অ্যাডমিন! 🎉</h1>
        <p className="text-slate-500 text-[15px] mb-10 font-medium leading-relaxed">
          আপনি সফলভাবে EduNex BD এর সুরক্ষিত ড্যাশবোর্ডে প্রবেশ করেছেন।
        </p>
        
        <button
          onClick={() => {
            localStorage.removeItem('accessToken');
            router.push('/');
          }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-md hover:shadow-red-500/20 w-full text-[16px]"
        >
          লগআউট করুন
        </button>
      </div>
    </div>
  );
}