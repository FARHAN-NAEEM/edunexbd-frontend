// app/dashboard/attendance/report/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, CheckCircle2, XCircle, Clock, Coffee, Edit3, Info, Loader2, Printer, ArrowLeft
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'; // ✅ useSearchParams যোগ করা হয়েছে

export default function AttendanceReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ URL থেকে প্যারামিটার পড়ার জন্য
  
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  
  // URL-এ যদি তথ্য থাকে তবে তা সেট করবে, না থাকলে আজকের তারিখ নিবে
  const [selectedClass, setSelectedClass] = useState(searchParams.get('classId') || '');
  const [selectedSection, setSelectedSection] = useState(searchParams.get('sectionId') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFilters();
  }, []);

  // ✅ URL-এ ডাটা থাকলে অটোমেটিক রিপোর্ট লোড করার লজিক
  useEffect(() => {
    if (selectedClass && selectedSection && selectedDate) {
      loadReport();
    }
  }, [selectedClass, selectedSection, selectedDate]); 

  const fetchFilters = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [classRes, sectionRes] = await Promise.all([
        fetch('http://localhost:3000/academic/classes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/academic/sections', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (classRes.ok) setClasses(await classRes.json());
      if (sectionRes.ok) setSections(await sectionRes.json());
    } catch (error) { console.error(error); }
  };

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `http://localhost:3000/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.ok) setAttendanceData(await res.json());
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handlePrint = () => window.print();

  // ✅ এডিট মোডে ফিরে যাওয়ার সময় ডাটা URL-এ পাঠিয়ে দেওয়া
  const handleEditJump = () => {
    router.push(`/dashboard/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`);
  };

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(s => s.status === 'PRESENT' || s.status === 'LATE').length,
    absent: attendanceData.filter(s => s.status === 'ABSENT' || s.status === 'LEAVE').length,
    late: attendanceData.filter(s => s.status === 'LATE').length,
    leave: attendanceData.filter(s => s.status === 'LEAVE').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 font-bold mb-2 hover:underline">
            <ArrowLeft className="w-4 h-4"/> ফিরে যান
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">হাজিরা রিপোর্ট</h1>
        </div>
        
        {attendanceData.length > 0 && (
          <div className="flex gap-3">
            <button onClick={handleEditJump} className="bg-amber-50 text-amber-600 hover:bg-amber-100 px-5 py-3 rounded-xl font-bold flex items-center gap-2 border border-amber-200 transition-all">
              <Edit3 className="w-5 h-5" /> এই হাজিরা এডিট করুন
            </button>
            <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95">
              <Printer className="w-5 h-5" /> রিপোর্ট প্রিন্ট/PDF
            </button>
          </div>
        )}
      </div>

      {/* ফিল্টার কার্ড */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6 items-end print:hidden">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">শ্রেণি</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-slate-700">
            <option value="">সিলেক্ট করুন</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">শাখা/সেকশন</label>
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-slate-700">
            <option value="">সিলেক্ট করুন</option>
            {sections.filter(s => s.classId === selectedClass).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">তারিখ</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-slate-700" />
        </div>
        <div className="text-xs text-slate-400 font-medium italic pb-4">
          ফিল্টার সিলেক্ট করলে অটোমেটিক রিপোর্ট লোড হবে।
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-400 font-bold">রিপোর্ট লোড হচ্ছে...</p>
        </div>
      ) : attendanceData.length > 0 ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="hidden print:block text-center border-b-2 border-slate-800 pb-6 mb-8">
            <h1 className="text-4xl font-black">EduNex BD Management System</h1>
            <p className="text-lg font-bold mt-2">হাজিরা রিপোর্ট: {selectedDate}</p>
            <p className="text-md mt-1">শ্রেণি: {classes.find(c => c.id === selectedClass)?.name} | শাখা: {sections.find(s => s.id === selectedSection)?.name}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5">
            {[
              { label: 'মোট', val: stats.total, color: 'text-slate-600', bg: 'bg-slate-50' },
              { label: 'উপস্থিত', val: stats.present, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'অনুপস্থিত', val: stats.absent, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'লেট', val: stats.late, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'লিভ', val: stats.leave, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.label}</p>
                <h3 className={`text-3xl font-black mt-1 ${s.color}`}>{s.val}</h3>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-6 pl-10">রোল</th>
                  <th className="p-6">শিক্ষার্থীর নাম</th>
                  <th className="p-6 text-center">উপস্থিতি স্থিতি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attendanceData.map((student) => (
                  <tr key={student.id}>
                    <td className="p-6 pl-10"><span className="font-black text-slate-400">#{student.rollNo}</span></td>
                    <td className="p-6">
                      <div className="font-bold text-slate-800 text-lg">{student.firstName} {student.lastName}</div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{student.studentId}</div>
                    </td>
                    <td className="p-6 text-center">
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest border ${
                          student.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          student.status === 'ABSENT' ? 'bg-red-50 text-red-600 border-red-100' :
                          student.status === 'LATE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {student.status}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-32 text-center flex flex-col items-center gap-4">
          <div className="bg-slate-50 p-6 rounded-full"><Info className="w-10 h-10 text-slate-300" /></div>
          <p className="text-slate-400 font-bold text-lg">উপরে তথ্য সিলেক্ট করলেই রিপোর্ট লোড হবে</p>
        </div>
      )}
    </div>
  );
}