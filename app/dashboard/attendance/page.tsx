// app/dashboard/attendance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, CheckCircle2, XCircle, Clock, Coffee, Save, AlertCircle, Info, Loader2, Users, FileText 
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'; // ✅ useSearchParams যোগ করা হয়েছে

export default function AttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  // URL থেকে ডাটা নিয়ে স্টেট আপডেট করা
  const [selectedClass, setSelectedClass] = useState(searchParams.get('classId') || '');
  const [selectedSection, setSelectedSection] = useState(searchParams.get('sectionId') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchFilters();
  }, []);

  // ✅ যদি URL-এ ডাটা থাকে তবে অটো-লোড
  useEffect(() => {
    if (selectedClass && selectedSection && selectedDate) {
      loadAttendanceData();
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

  const loadAttendanceData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `http://localhost:3000/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        const initialMap: any = {};
        data.forEach((s: any) => { initialMap[s.id] = s.status || 'PRESENT'; });
        setAttendanceMap(initialMap);
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const updateStatus = (studentId: string, status: string) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({ studentId, status }));
      const res = await fetch('http://localhost:3000/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ classId: selectedClass, sectionId: selectedSection, date: selectedDate, records })
      });

      if (res.ok) {
        // ✅ সেভ হওয়ার পর স্মার্ট চয়েস
        if (confirm("হাজিরা সেভ হয়েছে! আপনি কি এই ক্লাসের রিপোর্ট দেখতে চান?")) {
          router.push(`/dashboard/attendance/report?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`);
        }
      }
    } catch (error: any) { alert(error.message); } finally { setIsSubmitting(false); }
  };

  const stats = {
    total: students.length,
    present: Object.values(attendanceMap).filter(v => v === 'PRESENT' || v === 'LATE').length,
    lateOnly: Object.values(attendanceMap).filter(v => v === 'LATE').length,
    absent: Object.values(attendanceMap).filter(v => v === 'ABSENT' || v === 'LEAVE').length,
    leaveOnly: Object.values(attendanceMap).filter(v => v === 'LEAVE').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">হাজিরা পরিচালনা</h1>
        <button onClick={() => router.push(`/dashboard/attendance/report?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-slate-200 transition-all">
          <FileText className="w-5 h-5 text-blue-600" /> রিপোর্ট দেখুন
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">শ্রেণি</label>
          <select value={selectedClass} onChange={(e) => {setSelectedClass(e.target.value); setSelectedSection('');}} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-slate-700 transition-all focus:ring-4 focus:ring-blue-500/10">
            <option value="">সিলেক্ট করুন</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">শাখা/সেকশন</label>
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-slate-700 transition-all focus:ring-4 focus:ring-blue-500/10">
            <option value="">সিলেক্ট করুন</option>
            {sections.filter(s => s.classId === selectedClass).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">তারিখ</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-slate-700" />
        </div>
        <div className="text-xs text-slate-400 font-medium italic pb-4">ফিল্টার সিলেক্ট করলে শিক্ষার্থী লোড হবে</div>
      </div>

      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex items-center justify-between">
            <div><p className="text-emerald-600 font-bold text-sm uppercase tracking-widest">উপস্থিত</p><h3 className="text-4xl font-black text-emerald-700 mt-1">{stats.present}</h3></div>
            <CheckCircle2 className="w-12 h-12 text-emerald-200" />
          </div>
          <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] flex items-center justify-between">
            <div><p className="text-red-600 font-bold text-sm uppercase tracking-widest">অনুপস্থিত</p><h3 className="text-4xl font-black text-red-700 mt-1">{stats.absent}</h3></div>
            <XCircle className="w-12 h-12 text-red-200" />
          </div>
          <div className="bg-slate-100 border border-slate-200 p-8 rounded-[2rem] flex items-center justify-between">
            <div><p className="text-slate-500 font-bold text-sm uppercase tracking-widest">মোট শিক্ষার্থী</p><h3 className="text-4xl font-black text-slate-700 mt-1">{stats.total}</h3></div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      )}

      {students.length > 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
                <tr><th className="p-8 pl-10">রোল</th><th className="p-8">শিক্ষার্থীর নাম</th><th className="p-8 text-center">উপস্থিতি স্থিতি</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-8 pl-10"><span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-black text-sm group-hover:bg-blue-600 transition-colors">#{student.rollNo}</span></td>
                    <td className="p-8"><div className="font-bold text-slate-800 text-lg tracking-tight">{student.firstName} {student.lastName}</div></td>
                    <td className="p-8">
                      <div className="flex justify-center gap-3">
                        {['PRESENT', 'LATE', 'ABSENT', 'LEAVE'].map((st) => (
                          <button key={st} onClick={() => updateStatus(student.id, st)} className={`px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${attendanceMap[student.id] === st ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                            {st}
                          </button>
                        ))}
                      </div>
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
           <p className="text-slate-400 font-bold text-lg">উপরে ফিল্টার সিলেক্ট করলেই শিক্ষার্থী লোড হবে</p>
        </div>
      )}

      {students.length > 0 && (
        <div className="flex justify-end sticky bottom-8 pr-4">
          <button onClick={handleSaveAttendance} disabled={isSubmitting} className="bg-slate-900 hover:bg-black text-white px-12 py-6 rounded-[2.5rem] font-black flex items-center gap-4 shadow-2xl transition-all active:scale-95">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            <span className="text-lg">আজকের হাজিরা সেভ করুন</span>
          </button>
        </div>
      )}
    </div>
  );
}