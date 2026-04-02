// app/dashboard/results/marks-entry/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Search, AlertCircle, FileSpreadsheet, Loader2, Users } from 'lucide-react';

export default function MarksEntryPage() {
  const router = useRouter();
  
  // --- States for Filters ---
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // --- States for Data ---
  const [students, setStudents] = useState<any[]>([]);
  const [activeSubjectConfig, setActiveSubjectConfig] = useState<any>(null); // ✅ Store subject limits
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Fetch Initial Data ---
  useEffect(() => {
    fetchClasses();
    fetchExams();
  }, []);

  // --- Fetch Sections & Subjects when Class changes ---
  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      fetchSubjects(selectedClass);
    } else {
      setSections([]);
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedClass]);

  // ✅ Update active subject config when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find(s => s.id === selectedSubject);
      setActiveSubjectConfig(subject);
    } else {
      setActiveSubjectConfig(null);
    }
  }, [selectedSubject, subjects]);

  const fetchExams = async () => {
    const res = await fetch('http://localhost:3000/results/exams', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) setExams(await res.json());
  };

  const fetchClasses = async () => {
    const res = await fetch('http://localhost:3000/academic/classes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) setClasses(await res.json());
  };

  const fetchSections = async (classId: string) => {
    const res = await fetch('http://localhost:3000/academic/sections', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSections(data.filter((s: any) => s.classId === classId));
    }
  };

  const fetchSubjects = async (classId: string) => {
    const res = await fetch('http://localhost:3000/academic/subjects', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSubjects(data.filter((s: any) => s.classId === classId));
    }
  };

  // --- Fetch Students for Grid ---
  const handleSearchStudents = async () => {
    if (!selectedExam || !selectedClass || !selectedSection || !selectedSubject) {
      alert('দয়া করে পরীক্ষার নাম, শ্রেণি, শাখা এবং বিষয় সিলেক্ট করুন!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        const allStudents = await res.json();
        const sectionStudents = allStudents.filter((s: any) => s.sectionId === selectedSection);
        
        const gridData = sectionStudents.map((student: any) => ({
          id: student.id,
          rollNo: student.rollNo,
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          written: '',
          mcq: '',
          practical: '',
          total: 0,
          errors: { written: false, mcq: false, practical: false } // Validation state
        }));
        
        gridData.sort((a: any, b: any) => a.rollNo - b.rollNo);
        setStudents(gridData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handle Grid Input Changes with Validation ---
  const handleMarkChange = (index: number, field: 'written' | 'mcq' | 'practical', value: string) => {
    const numericValue = value === '' ? '' : Number(value);
    
    const updatedStudents = [...students];
    updatedStudents[index][field] = numericValue;
    
    // ✅ VALIDATION LOGIC (চেক করবে দেওয়া মার্কস সর্বোচ্চ মার্কসের চেয়ে বেশি কি না)
    if (activeSubjectConfig && typeof numericValue === 'number') {
      const maxMarks = activeSubjectConfig[`${field}Marks`];
      updatedStudents[index].errors[field] = numericValue > maxMarks;
    } else {
      updatedStudents[index].errors[field] = false;
    }
    
    // Auto Calculate Total
    const w = Number(updatedStudents[index].written) || 0;
    const m = Number(updatedStudents[index].mcq) || 0;
    const p = Number(updatedStudents[index].practical) || 0;
    updatedStudents[index].total = w + m + p;

    setStudents(updatedStudents);
  };

  // --- Save Marks to Backend ---
  const handleSaveMarks = async () => {
    if (students.length === 0) return;
    
    // ✅ PREVENT SAVING IF ANY ERROR EXISTS
    const hasErrors = students.some(s => s.errors.written || s.errors.mcq || s.errors.practical);
    if (hasErrors) {
      alert('সতর্কতা: কিছু স্টুডেন্টের নম্বর নির্ধারিত সর্বোচ্চ নম্বরের চেয়ে বেশি দেওয়া হয়েছে। লাল দাগ দেওয়া বক্সগুলো ঠিক করুন।');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const promises = students.map((student) => {
        const payload = {
          studentId: student.id,
          subjectId: selectedSubject,
          examId: selectedExam, 
          written: Number(student.written) || 0,
          mcq: Number(student.mcq) || 0,
          practical: activeSubjectConfig?.hasPractical ? (Number(student.practical) || 0) : 0,
        };

        return fetch('http://localhost:3000/results/mark', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      });

      await Promise.all(promises);
      alert('সব স্টুডেন্টের মার্কস সফলভাবে ডাটাবেসে সেভ হয়েছে! 🎉');
    } catch (error) {
      console.error(error);
      alert('মার্কস সেভ করতে সমস্যা হয়েছে!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" /> মার্কস এন্ট্রি (Marks Entry)
        </h1>
        <p className="text-slate-500 text-[15px] mt-1 font-medium ml-11">পরীক্ষার মার্কস ইনপুট দিন এবং সেভ করুন</p>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">পরীক্ষা</label>
            <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
              <option value="">সিলেক্ট করুন</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">শ্রেণি (Class)</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
              <option value="">সিলেক্ট করুন</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">শাখা (Section)</label>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-50">
              <option value="">সিলেক্ট করুন</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">বিষয় (Subject)</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedClass} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-50">
              <option value="">সিলেক্ট করুন</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleSearchStudents}
              disabled={isLoading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} 
              স্টুডেন্ট খুঁজুন
            </button>
          </div>

        </div>

        {/* ✅ DYNAMIC MARKS INFO BAR */}
        {activeSubjectConfig && students.length > 0 && (
          <div className="mt-4 flex items-center justify-between p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-bold text-slate-700">
                <span className="text-blue-700">{activeSubjectConfig.name}</span> বিষয়ের পূর্ণমান: <span className="font-black text-slate-900">{activeSubjectConfig.fullMarks}</span>
              </p>
            </div>
            <div className="flex gap-4 text-xs font-bold text-slate-600">
              <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">Written: <span className="font-black text-slate-800">{activeSubjectConfig.writtenMarks}</span></span>
              <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">MCQ: <span className="font-black text-slate-800">{activeSubjectConfig.mcqMarks}</span></span>
              {activeSubjectConfig.hasPractical && (
                <span className="bg-blue-100/50 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-800 shadow-sm">Practical: <span className="font-black">{activeSubjectConfig.practicalMarks}</span></span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* EXCEL-LIKE GRID SECTION */}
      {students.length > 0 && (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col relative">
          
          <div className="p-6 border-b border-slate-100 bg-indigo-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> স্টুডেন্ট লিস্ট
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">মোট স্টুডেন্ট: {students.length} জন</p>
            </div>
            <button 
              onClick={handleSaveMarks}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />} 
              মার্কস সেভ করুন
            </button>
          </div>

          <div className="overflow-x-auto p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-4 bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-widest rounded-l-xl">রোল</th>
                  <th className="py-4 px-4 bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[200px]">স্টুডেন্ট আইডি ও নাম</th>
                  <th className="py-4 px-4 bg-slate-50 text-xs font-black text-blue-600 uppercase tracking-widest text-center">Written</th>
                  <th className="py-4 px-4 bg-slate-50 text-xs font-black text-blue-600 uppercase tracking-widest text-center">MCQ</th>
                  {/* ✅ CONDITIONAL PRACTICAL HEADER */}
                  {activeSubjectConfig?.hasPractical && (
                    <th className="py-4 px-4 bg-slate-50 text-xs font-black text-blue-600 uppercase tracking-widest text-center animate-in fade-in duration-300">Practical</th>
                  )}
                  <th className="py-4 px-4 bg-slate-50 text-xs font-black text-emerald-600 uppercase tracking-widest text-center rounded-r-xl">Total (Auto)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    <td className="py-4 px-4 font-black text-slate-700 text-lg">
                      {student.rollNo}
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{student.name}</div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{student.studentId}</div>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <input 
                        type="number" 
                        value={student.written}
                        onChange={(e) => handleMarkChange(index, 'written', e.target.value)}
                        className={`w-24 p-3 bg-white border rounded-xl font-bold text-center transition-all hover:bg-slate-50 focus:outline-none focus:ring-4 ${
                          student.errors.written 
                            ? 'border-red-500 text-red-600 focus:ring-red-500/20 bg-red-50' 
                            : 'border-slate-200 text-slate-700 focus:ring-blue-500/10 focus:border-blue-500'
                        }`}
                        placeholder="0"
                      />
                    </td>
                    
                    <td className="py-3 px-2 text-center">
                      <input 
                        type="number" 
                        value={student.mcq}
                        onChange={(e) => handleMarkChange(index, 'mcq', e.target.value)}
                        className={`w-24 p-3 bg-white border rounded-xl font-bold text-center transition-all hover:bg-slate-50 focus:outline-none focus:ring-4 ${
                          student.errors.mcq 
                            ? 'border-red-500 text-red-600 focus:ring-red-500/20 bg-red-50' 
                            : 'border-slate-200 text-slate-700 focus:ring-blue-500/10 focus:border-blue-500'
                        }`}
                        placeholder="0"
                      />
                    </td>

                    {/* ✅ CONDITIONAL PRACTICAL INPUT */}
                    {activeSubjectConfig?.hasPractical && (
                      <td className="py-3 px-2 text-center animate-in fade-in duration-300">
                        <input 
                          type="number" 
                          value={student.practical}
                          onChange={(e) => handleMarkChange(index, 'practical', e.target.value)}
                          className={`w-24 p-3 bg-white border rounded-xl font-bold text-center transition-all hover:bg-slate-50 focus:outline-none focus:ring-4 ${
                            student.errors.practical 
                              ? 'border-red-500 text-red-600 focus:ring-red-500/20 bg-red-50' 
                              : 'border-slate-200 text-slate-700 focus:ring-blue-500/10 focus:border-blue-500'
                          }`}
                          placeholder="0"
                        />
                      </td>
                    )}

                    <td className="py-4 px-4 text-center">
                      <div className={`inline-flex items-center justify-center min-w-[3rem] px-3 py-2 font-black rounded-xl border text-lg ${
                        (student.errors.written || student.errors.mcq || student.errors.practical)
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {student.total}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}