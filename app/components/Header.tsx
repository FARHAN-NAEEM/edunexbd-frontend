// app/components/Header.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, LogOut, Menu } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') return null;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-6 sm:px-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden sm:flex items-center bg-slate-100 px-4 py-2.5 rounded-xl border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all w-64 md:w-96">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="সার্চ করুন..." 
            className="bg-transparent border-none focus:outline-none w-full text-slate-700 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">লগআউট</span>
        </button>
      </div>
    </header>
  );
}