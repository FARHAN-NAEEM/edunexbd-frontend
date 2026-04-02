// app/dashboard/subjects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, BookOpen, Hash, AlertCircle, X, Trash2, 
  Layers, CalendarDays, LayoutGrid, Info, Calculator, CheckCircle2, Edit
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AcademicSetupPage() {
  const [activeTab, setActiveTab] = useState<'years' | 'classes' | 'sections' | 'subjects'>('years');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // ----- Data States -----
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // ----- Modal States -----
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(''); 
  
  // ----- Edit Mode States (All Modules) -----
  const [isYearEditMode, setIsYearEditMode] = useState(false);
  const [yearEditId, setYearEditId] = useState<string | null>(null);

  const [isClassEditMode, setIsClassEditMode] = useState(false);
  const [classEditId, setClassEditId] = useState<string | null>(null);

  const [isSectionEditMode, setIsSectionEditMode] = useState(false);
  const [sectionEditId, setSectionEditId] = useState<string | null>(null);

  const [isSubjectEditMode, setIsSubjectEditMode] = useState(false);
  const [subjectEditId, setSubjectEditId] = useState<string | null>(null);

  // ----- Form States -----
  const [yearFormData, setYearFormData] = useState({ year: '', startDate: '', endDate: '' });
  const [classFormData, setClassFormData] = useState({ name: '', academicYearId: '' });
  const [sectionFormData, setSectionFormData] = useState({ name: '', classId: '' });
  
  // ✅ DYNAMIC SUBJECT FORM STATE
  const [subjectFormData, setSubjectFormData] = useState({ 
    name: '', code: '', classId: '',
    hasPractical: false, writtenMarks: 100, mcqMarks: 0, practicalMarks: 0, fullMarks: 100, passMarks: 33
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchAcademicYears(), fetchClasses(), fetchSections(), fetchSubjects()]);
    setIsLoading(false);
  };

  // Helper: Format Date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleAuthError = (status: number) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('accessToken');
      router.push('/');
      return true;
    }
    return false;
  };

  // ----- API Fetch Functions -----
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

  const fetchSubjects = async () => {
    const res = await fetch('http://localhost:3000/academic/subjects', { 
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } 
    });
    if (handleAuthError(res.status)) return;
    if (res.ok) setSubjects(await res.json());
  };

  // ==========================================
  // ACTIONS: ACADEMIC YEARS
  // ==========================================
  const openYearModalForCreate = () => {
    setIsYearEditMode(false); setYearEditId(null);
    setYearFormData({ year: '', startDate: '', endDate: '' });
    setModalError(''); setIsYearModalOpen(true);
  };

  const openYearModalForEdit = (year: any) => {
    setIsYearEditMode(true); setYearEditId(year.id);
    setYearFormData({
      year: year.year,
      startDate: year.startDate ? year.startDate.substring(0, 10) : '',
      endDate: year.endDate ? year.endDate.substring(0, 10) : ''
    });
    setModalError(''); setIsYearModalOpen(true);
  };

  const handleDeleteYear = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}" শিক্ষাবর্ষটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/academic/years/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } });
      if (!res.ok) throw new Error('শিক্ষাবর্ষটি ডিলেট করা সম্ভব হয়নি!');
      fetchAcademicYears();
    } catch (error: any) { alert(error.message); }
  };

  const handleYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setModalError('');
    try {
      const sanitizedData = { ...yearFormData, year: yearFormData.year.trim() };
      const url = isYearEditMode ? `http://localhost:3000/academic/years/${yearEditId}` : 'http://localhost:3000/academic/years';
      const method = isYearEditMode ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(sanitizedData) 
      });
      if (!res.ok) throw new Error(isYearEditMode ? 'শিক্ষাবর্ষ আপডেট করতে সমস্যা হয়েছে!' : 'শিক্ষাবর্ষ যোগ করতে সমস্যা হয়েছে!');
      setIsYearModalOpen(false); fetchAcademicYears();
    } catch (error: any) { setModalError(error.message); } finally { setIsSubmitting(false); }
  };

  // ==========================================
  // ACTIONS: CLASSES
  // ==========================================
  const openClassModalForCreate = () => {
    setIsClassEditMode(false); setClassEditId(null);
    setClassFormData({ name: '', academicYearId: '' });
    setModalError(''); setIsClassModalOpen(true);
  };

  const openClassModalForEdit = (cls: any) => {
    setIsClassEditMode(true); setClassEditId(cls.id);
    setClassFormData({ name: cls.name, academicYearId: cls.academicYearId });
    setModalError(''); setIsClassModalOpen(true);
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}" ক্লাসটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/academic/classes/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } });
      if (!res.ok) throw new Error('ক্লাসটি ডিলেট করা সম্ভব হয়নি!');
      fetchClasses();
    } catch (error: any) { alert(error.message); }
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setModalError('');
    try {
      const sanitizedData = { ...classFormData, name: classFormData.name.trim() };
      const url = isClassEditMode ? `http://localhost:3000/academic/classes/${classEditId}` : 'http://localhost:3000/academic/classes';
      const method = isClassEditMode ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(sanitizedData) 
      });
      if (!res.ok) throw new Error(isClassEditMode ? 'ক্লাস আপডেট করতে সমস্যা হয়েছে!' : 'ক্লাস যোগ করতে সমস্যা হয়েছে!');
      setIsClassModalOpen(false); fetchClasses();
    } catch (error: any) { setModalError(error.message); } finally { setIsSubmitting(false); }
  };

  // ==========================================
  // ACTIONS: SECTIONS
  // ==========================================
  const openSectionModalForCreate = () => {
    setIsSectionEditMode(false); setSectionEditId(null);
    setSectionFormData({ name: '', classId: '' });
    setModalError(''); setIsSectionModalOpen(true);
  };

  const openSectionModalForEdit = (sec: any) => {
    setIsSectionEditMode(true); setSectionEditId(sec.id);
    setSectionFormData({ name: sec.name, classId: sec.classId });
    setModalError(''); setIsSectionModalOpen(true);
  };

  const handleDeleteSection = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}" শাখাটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/academic/sections/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } });
      if (!res.ok) throw new Error('শাখাটি ডিলেট করা সম্ভব হয়নি!');
      fetchSections();
    } catch (error: any) { alert(error.message); }
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setModalError('');
    try {
      const sanitizedData = { ...sectionFormData, name: sectionFormData.name.trim() };
      const url = isSectionEditMode ? `http://localhost:3000/academic/sections/${sectionEditId}` : 'http://localhost:3000/academic/sections';
      const method = isSectionEditMode ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(sanitizedData) 
      });
      if (!res.ok) throw new Error(isSectionEditMode ? 'সেকশন আপডেট করতে সমস্যা হয়েছে!' : 'সেকশন যোগ করতে সমস্যা হয়েছে!');
      setIsSectionModalOpen(false); fetchSections();
    } catch (error: any) { setModalError(error.message); } finally { setIsSubmitting(false); }
  };

  // ==========================================
  // ACTIONS: SUBJECTS
  // ==========================================
  const handleMarksChange = (field: string, value: string) => {
    const numVal = value === '' ? 0 : Number(value);
    setSubjectFormData(prev => {
      const newData = { ...prev, [field]: numVal };
      const total = (newData.writtenMarks || 0) + (newData.mcqMarks || 0) + (newData.hasPractical ? (newData.practicalMarks || 0) : 0);
      return { ...newData, fullMarks: total };
    });
  };

  const handleHasPracticalToggle = (checked: boolean) => {
    setSubjectFormData(prev => {
      const total = prev.writtenMarks + prev.mcqMarks + (checked ? prev.practicalMarks : 0);
      return { ...prev, hasPractical: checked, fullMarks: total };
    });
  };

  const openSubjectModalForCreate = () => {
    setIsSubjectEditMode(false); setSubjectEditId(null);
    setSubjectFormData({ name: '', code: '', classId: '', hasPractical: false, writtenMarks: 100, mcqMarks: 0, practicalMarks: 0, fullMarks: 100, passMarks: 33 });
    setModalError(''); setIsSubjectModalOpen(true);
  };

  const openSubjectModalForEdit = (sub: any) => {
    setIsSubjectEditMode(true); setSubjectEditId(sub.id);
    setSubjectFormData({
      name: sub.name, code: sub.code, classId: sub.classId,
      hasPractical: sub.hasPractical, writtenMarks: sub.writtenMarks, mcqMarks: sub.mcqMarks,
      practicalMarks: sub.practicalMarks, fullMarks: sub.fullMarks, passMarks: sub.passMarks
    });
    setModalError(''); setIsSubjectModalOpen(true);
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}" সাবজেক্টটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/academic/subjects/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } });
      if (!res.ok) throw new Error('সাবজেক্টটি ডিলেট করা সম্ভব হয়নি!');
      fetchSubjects();
    } catch (error: any) { alert(error.message); }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setModalError('');
    try {
      const sanitizedData = { ...subjectFormData, name: subjectFormData.name.trim(), code: subjectFormData.code.trim().toUpperCase() };
      const url = isSubjectEditMode ? `http://localhost:3000/academic/subjects/${subjectEditId}` : 'http://localhost:3000/academic/subjects';
      const method = isSubjectEditMode ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(sanitizedData) 
      });
      if (!res.ok) throw new Error(isSubjectEditMode ? 'বিষয় আপডেট করতে সমস্যা হয়েছে!' : 'বিষয় যোগ করতে সমস্যা হয়েছে!');
      setIsSubjectModalOpen(false); fetchSubjects();
    } catch (error: any) { setModalError(error.message); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-10">
      
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">একাডেমিক সেটআপ</h1>
          <p className="text-slate-500 text-[15px] mt-1 font-medium">প্রতিষ্ঠান পরিচালনার প্রাথমিক ধাপগুলো এখান থেকে সম্পন্ন করুন</p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === 'years' && (
            <button onClick={openYearModalForCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> নতুন শিক্ষাবর্ষ
            </button>
          )}
          {activeTab === 'classes' && (
            <button onClick={openClassModalForCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> নতুন ক্লাস
            </button>
          )}
          {activeTab === 'sections' && (
            <button onClick={openSectionModalForCreate} className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> নতুন সেকশন
            </button>
          )}
          {activeTab === 'subjects' && (
            <button onClick={openSubjectModalForCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> নতুন বিষয়
            </button>
          )}
        </div>
      </div>

      {/* ট্যাব নেভিগেশন */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar bg-slate-100/50 p-1 rounded-2xl w-fit">
        {[
          { id: 'years', label: 'শিক্ষাবর্ষ', icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { id: 'classes', label: 'ক্লাসসমূহ', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { id: 'sections', label: 'শাখা/সেকশন', icon: LayoutGrid, color: 'text-violet-600', bg: 'bg-violet-50' },
          { id: 'subjects', label: 'বিষয়সমূহ', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((tab: any) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`px-5 py-2.5 rounded-xl text-[15px] font-bold flex items-center gap-2.5 transition-all ${
              activeTab === tab.id 
                ? `bg-white shadow-sm ${tab.color}` 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* টেবিল এরিয়া */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium italic">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              
              {/* TAB: YEARS */}
              {activeTab === 'years' && (
                <>
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="p-6 pl-8">শিক্ষাবর্ষ (YEAR)</th>
                      <th className="p-6">শুরুর তারিখ</th>
                      <th className="p-6">শেষের তারিখ</th>
                      <th className="p-6 text-right pr-8">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {academicYears.map(y => (
                      <tr key={y.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6 pl-8 font-bold text-emerald-600 text-lg tracking-tight">{y.year}</td>
                        <td className="p-6 text-slate-600 font-medium">{formatDate(y.startDate)}</td>
                        <td className="p-6 text-slate-600 font-medium">{formatDate(y.endDate)}</td>
                        <td className="p-6 text-right pr-8 text-slate-300">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openYearModalForEdit(y)} className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteYear(y.id, y.year)} className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* TAB: CLASSES */}
              {activeTab === 'classes' && (
                <>
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="p-6 pl-8">ক্লাসের নাম</th>
                      <th className="p-6">শিক্ষাবর্ষ</th>
                      <th className="p-6 text-right pr-8">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classes.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 pl-8 font-bold text-slate-800 text-lg">{c.name}</td>
                        <td className="p-6">
                          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-100">
                            {c.academicYear?.year || 'N/A'}
                          </span>
                        </td>
                        <td className="p-6 text-right pr-8 text-slate-300">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openClassModalForEdit(c)} className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteClass(c.id, c.name)} className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* TAB: SECTIONS */}
              {activeTab === 'sections' && (
                <>
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="p-6 pl-8">সেকশনের নাম</th>
                      <th className="p-6">নির্ধারিত ক্লাস</th>
                      <th className="p-6 text-right pr-8">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sections.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 pl-8 font-bold text-violet-700 text-lg">{s.name}</td>
                        <td className="p-6">
                          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold border border-indigo-100">
                            {s.class?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="p-6 text-right pr-8 text-slate-300">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openSectionModalForEdit(s)} className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteSection(s.id, s.name)} className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* TAB: SUBJECTS */}
              {activeTab === 'subjects' && (
                <>
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="p-6 pl-8">কোড</th>
                      <th className="p-6">বিষয়ের নাম</th>
                      <th className="p-6">ক্লাস</th>
                      <th className="p-6 text-center">পূর্ণমান</th>
                      <th className="p-6">মার্কস ডিস্ট্রিবিউশন (Type)</th>
                      <th className="p-6 text-right pr-8">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 pl-8 font-mono text-slate-500 font-bold">{sub.code}</td>
                        <td className="p-6 font-bold text-slate-800 text-lg">{sub.name}</td>
                        <td className="p-6">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">
                            {sub.class?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="p-6 font-black text-indigo-700 text-center text-lg">{sub.fullMarks || 100}</td>
                        
                        <td className="p-6">
                          <div className="flex flex-wrap gap-2">
                            {sub.writtenMarks > 0 && <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded text-xs font-bold">W: {sub.writtenMarks}</span>}
                            {sub.mcqMarks > 0 && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-xs font-bold">M: {sub.mcqMarks}</span>}
                            {sub.hasPractical && sub.practicalMarks > 0 && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs font-bold">P: {sub.practicalMarks}</span>}
                          </div>
                        </td>

                        <td className="p-6 text-right pr-8 text-slate-300">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openSubjectModalForEdit(sub)} className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteSubject(sub.id, sub.name)} className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* 1. MODAL: ADD/EDIT YEAR */}
      {isYearModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{isYearEditMode ? 'শিক্ষাবর্ষ আপডেট করুন' : 'নতুন শিক্ষাবর্ষ'}</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Academic Year</p>
              </div>
              <button onClick={() => setIsYearModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full shadow-sm border border-slate-100 transition-all hover:rotate-90"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleYearSubmit} className="p-8 space-y-6">
              {modalError && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-center gap-2 border border-red-100"><AlertCircle className="w-4 h-4" />{modalError}</div>}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">শিক্ষাবর্ষের নাম</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all font-bold" value={yearFormData.year} onChange={e => setYearFormData({...yearFormData, year: e.target.value})} placeholder="যেমন: 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">শুরুর তারিখ</label>
                  <input type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none" value={yearFormData.startDate} onChange={e => setYearFormData({...yearFormData, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">শেষের তারিখ</label>
                  <input type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none" value={yearFormData.endDate} onChange={e => setYearFormData({...yearFormData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <button type="button" onClick={() => setIsYearModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">বাতিল</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95">{isSubmitting ? 'সেভ হচ্ছে...' : isYearEditMode ? 'আপডেট করুন' : 'সেভ করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: ADD/EDIT CLASS */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{isClassEditMode ? 'ক্লাস আপডেট করুন' : 'নতুন ক্লাস যোগ করুন'}</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Class Setup</p>
              </div>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleClassSubmit} className="p-8 space-y-6">
              {modalError && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-center gap-2 border border-red-100"><AlertCircle className="w-4 h-4" />{modalError}</div>}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">ক্লাসের নাম</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-bold" value={classFormData.name} onChange={e => setClassFormData({...classFormData, name: e.target.value})} placeholder="যেমন: Class 10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">শিক্ষাবর্ষ নির্বাচন করুন</label>
                <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold" value={classFormData.academicYearId} onChange={e => setClassFormData({...classFormData, academicYearId: e.target.value})}>
                  <option value="">সিলেক্ট করুন</option>
                  {academicYears.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
                </select>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold">বাতিল</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95">{isSubmitting ? 'সেভ হচ্ছে...' : isClassEditMode ? 'আপডেট করুন' : 'সেভ করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: ADD/EDIT SECTION */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{isSectionEditMode ? 'শাখা আপডেট করুন' : 'নতুন শাখা (Section)'}</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Section Creation</p>
              </div>
              <button onClick={() => setIsSectionModalOpen(false)} className="text-slate-400 p-2 bg-white rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSectionSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">সেকশনের নাম</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:outline-none transition-all font-bold" value={sectionFormData.name} onChange={e => setSectionFormData({...sectionFormData, name: e.target.value})} placeholder="যেমন: Section A" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">ক্লাস নির্বাচন করুন</label>
                <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-slate-700" value={sectionFormData.classId} onChange={e => setSectionFormData({...sectionFormData, classId: e.target.value})}>
                  <option value="">ক্লাস সিলেক্ট করুন</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <button type="button" onClick={() => setIsSectionModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold">বাতিল</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-bold active:scale-95 shadow-lg shadow-violet-600/20">{isSubmitting ? 'সেভ হচ্ছে...' : isSectionEditMode ? 'আপডেট করুন' : 'সেভ করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: ADD/EDIT SUBJECT */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{isSubjectEditMode ? 'বিষয় আপডেট করুন' : 'নতুন বিষয় ও মার্কস সেটআপ'}</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Subject Entry & Grading</p>
              </div>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 p-2 bg-white hover:text-red-500 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200">
              {modalError && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-center gap-2 border border-red-100"><AlertCircle className="w-4 h-4" />{modalError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">বিষয়ের নাম</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all font-bold" value={subjectFormData.name} onChange={e => setSubjectFormData({...subjectFormData, name: e.target.value})} placeholder="যেমন: Physics" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">সাবজেক্ট কোড</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none uppercase font-mono font-bold" value={subjectFormData.code} onChange={e => setSubjectFormData({...subjectFormData, code: e.target.value})} placeholder="PHY-101" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">নির্ধারিত ক্লাস</label>
                <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold" value={subjectFormData.classId} onChange={e => setSubjectFormData({...subjectFormData, classId: e.target.value})}>
                  <option value="">ক্লাস সিলেক্ট করুন</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2"><Calculator className="w-4 h-4 text-blue-600"/> মার্কস ডিস্ট্রিবিউশন</label>
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-5">
                  
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" checked={subjectFormData.hasPractical} onChange={e => handleHasPracticalToggle(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">প্র্যাকটিক্যাল পরীক্ষা আছে</span>
                  </label>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Written Marks</label>
                      <input type="number" required className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-black text-slate-700 text-center focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={subjectFormData.writtenMarks || ''} onChange={(e) => handleMarksChange('writtenMarks', e.target.value)} placeholder="0" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">MCQ Marks</label>
                      <input type="number" required className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-black text-slate-700 text-center focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={subjectFormData.mcqMarks || ''} onChange={(e) => handleMarksChange('mcqMarks', e.target.value)} placeholder="0" />
                    </div>
                    
                    {subjectFormData.hasPractical ? (
                      <div className="space-y-1.5 animate-in slide-in-from-right-4 fade-in duration-300">
                        <label className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Practical Marks</label>
                        <input type="number" required className="w-full p-3.5 bg-blue-50 border border-blue-200 rounded-xl font-black text-blue-800 text-center focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all" value={subjectFormData.practicalMarks || ''} onChange={(e) => handleMarksChange('practicalMarks', e.target.value)} placeholder="0" />
                      </div>
                    ) : (
                      <div className="space-y-1.5 opacity-50 grayscale pointer-events-none">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Practical Marks</label>
                        <div className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl font-black text-slate-400 text-center">N/A</div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/50">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Total Marks (Auto)</label>
                      <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl font-black text-emerald-700 text-center text-lg">{subjectFormData.fullMarks}</div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-amber-600 uppercase tracking-wider">Pass Marks (Total)</label>
                      <input type="number" required className="w-full p-3.5 bg-white border border-amber-200 rounded-xl font-black text-slate-700 text-center focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all" value={subjectFormData.passMarks || ''} onChange={(e) => setSubjectFormData({...subjectFormData, passMarks: Number(e.target.value)})} placeholder="33" />
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-6 flex items-center gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">বাতিল</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">{isSubmitting ? 'সেভ হচ্ছে...' : isSubjectEditMode ? 'আপডেট করুন' : 'সাবজেক্ট তৈরি করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}