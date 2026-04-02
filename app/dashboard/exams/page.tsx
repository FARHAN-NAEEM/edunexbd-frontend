// app/dashboard/exams/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Plus, X, AlertCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formData, setFormData] = useState({
    name: '', academicYearId: '', classId: '', sectionId: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchExams(), fetchAcademicYears(), fetchClasses(), fetchSections()]);
    setIsLoading(false);
  };

  const fetchExams = async () => {
    const res = await fetch('http://localhost:3000/results/exams', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) setExams(await res.json());
  };

  const fetchAcademicYears = async () => {
    const res = await fetch('http://localhost:3000/academic/years', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) setAcademicYears(await res.json());
  };

  const fetchClasses = async () => {
    const res = await fetch('http://localhost:3000/academic/classes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) setClasses(await res.json());
  };

  const fetchSections = async () => {
    const res = await fetch('http://localhost:3000/academic/sections', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) setSections(await res.json());
  };

  // Filter sections based on selected class
  const filteredSections = sections.filter(s => s.classId === formData.classId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');

    try {
      // Clean up empty optional fields
      const payload: any = { 
        name: formData.name.trim(), 
        academicYearId: formData.academicYearId 
      };
      if (formData.classId) payload.classId = formData.classId;
      if (formData.sectionId) payload.sectionId = formData.sectionId;

      const res = await fetch('http://localhost:3000/results/exam', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('পরীক্ষা তৈরি করতে সমস্যা হয়েছে!');
      
      setIsModalOpen(false);
      setFormData({ name: '', academicYearId: '', classId: '', sectionId: '' });
      fetchExams();
    } catch (error: any) {
      setModalError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600" /> পরীক্ষা (Exams)
          </h1>
          <p className="text-slate-500 text-[15px] mt-1 font-medium ml-11">প্রতিষ্ঠানের সকল পরীক্ষার রুটিন ও সেটআপ পরিচালনা করুন</p>
        </div>
        
        <button onClick={() => { setModalError(''); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> নতুন পরীক্ষা তৈরি করুন
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium italic">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <tr>
                  <th className="p-6 pl-8">পরীক্ষার নাম</th>
                  <th className="p-6">শিক্ষাবর্ষ</th>
                  <th className="p-6">নির্ধারিত ক্লাস</th>
                  <th className="p-6">শাখা (যদি থাকে)</th>
                  <th className="p-6 text-right pr-8">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400 font-bold">কোনো পরীক্ষার তথ্য পাওয়া যায়নি</td>
                  </tr>
                ) : (
                  exams.map(exam => (
                    <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 pl-8 font-black text-slate-800 text-lg">{exam.name}</td>
                      <td className="p-6">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-100">
                          {exam.academicYear?.year || 'N/A'}
                        </span>
                      </td>
                      <td className="p-6 font-bold text-slate-600">{exam.class?.name || 'All Classes'}</td>
                      <td className="p-6 font-bold text-slate-600">{exam.section?.name || 'All Sections'}</td>
                      <td className="p-6 text-right pr-8 text-slate-300 hover:text-red-500 cursor-pointer transition-colors">
                        <Trash2 className="w-5 h-5 ml-auto" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Exam */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">নতুন পরীক্ষা তৈরি</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Exam Setup</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-2 bg-white hover:text-red-500 rounded-full transition-colors border border-slate-100"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {modalError && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-center gap-2 border border-red-100"><AlertCircle className="w-4 h-4" />{modalError}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">পরীক্ষার নাম</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="যেমন: Mid Term Exam 2026" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">শিক্ষাবর্ষ</label>
                <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold" value={formData.academicYearId} onChange={e => setFormData({...formData, academicYearId: e.target.value})}>
                  <option value="">সিলেক্ট করুন</option>
                  {academicYears.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">ক্লাস (ঐচ্ছিক)</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-sm" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value, sectionId: ''})}>
                    <option value="">সকল ক্লাস</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">শাখা (ঐচ্ছিক)</label>
                  <select disabled={!formData.classId} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-sm disabled:opacity-50" value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value})}>
                    <option value="">সকল শাখা</option>
                    {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">বাতিল</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">{isSubmitting ? 'সেভ হচ্ছে...' : 'পরীক্ষা তৈরি করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}