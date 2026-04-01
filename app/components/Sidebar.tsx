// app/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap, BookOpen, CalendarCheck, Settings, FileSpreadsheet } from 'lucide-react';

const navItems = [
  { name: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard },
  { name: 'শিক্ষক', href: '/dashboard/teachers', icon: GraduationCap },
  { name: 'শিক্ষার্থী', href: '/dashboard/students', icon: Users },
  { name: 'বিষয়সমূহ', href: '/dashboard/subjects', icon: BookOpen },
  { name: 'উপস্থিতি (হাজিরা)', href: '/dashboard/attendance', icon: CalendarCheck },
  { name: 'রেজাল্ট (মার্কস)', href: '/dashboard/results/marks-entry', icon: FileSpreadsheet }, // 👈 নতুন রেজাল্ট মডিউল অ্যাড করা হয়েছে
  { name: 'সেটিংস', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <aside className="w-[260px] bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm z-10">
      <div className="h-20 flex items-center justify-center border-b border-slate-100">
        <Link href="/dashboard" className="text-3xl font-extrabold text-blue-600 tracking-tight">
          EduNex<span className="text-slate-800">BD</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          // বাগ ফিক্স: ড্যাশবোর্ডের জন্য শুধু এক্সাক্ট ম্যাচ চেক করবে, অন্যথায় সাব-ফোল্ডার চেক করবে
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
            
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 font-semibold text-[15px] ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 text-center text-xs font-medium text-slate-400">
        <p>EduNex BD Version 1.0</p>
      </div>
    </aside>
  );
}