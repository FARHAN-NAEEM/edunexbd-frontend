// app/dashboard/results/tabulation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Search, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function TabulationSheetPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [tabulationData, setTabulationData] = useState<any>(null);

  // --- Fetch Initial Data ---
  useEffect(() => {
    fetchClasses();
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchSections(selectedClass);
    else setSections([]);
  }, [selectedClass]);

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

  // ✅ REAL API CALL FOR TABULATION DATA
  const handleSearchTabulation = async () => {
    if (!selectedClass || !selectedSection || !selectedExam) {
      alert('দয়া করে পরীক্ষা, শ্রেণি এবং শাখা সিলেক্ট করুন!');
      return;
    }

    setIsLoading(true);
    setTabulationData(null);
    
    try {
      const className = classes.find(c => c.id === selectedClass)?.name || '';
      const sectionName = sections.find(s => s.id === selectedSection)?.name || '';
      const examName = exams.find(e => e.id === selectedExam)?.name || '';

      const res = await fetch(`http://localhost:3000/results/tabulation/${selectedExam}/${selectedClass}/${selectedSection}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'ডাটা ফেচ করতে সমস্যা হয়েছে!');
      }

      const data = await res.json();
      
      setTabulationData({
        schoolInfo: {
          name: 'EDUNEX BD SCHOOL & COLLEGE',
          address: 'Mymensingh, Bangladesh | Phone: 01700000000',
          academicInfo: `Educational Year - ${className} - ${sectionName} - ${examName}`
        },
        subjects: data.subjects,
        students: data.students
      });
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
        }
      `}</style>

      {/* HEADER & FILTERS */}
      <div className="print-hidden">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-blue-600" /> ট্যাবুলেশন শিট (Tabulation)
          </h1>
          <p className="text-slate-500 text-[15px] mt-1 font-medium ml-11">পুরো ক্লাসের সকল বিষয়ের রেজাল্ট একসাথে দেখুন</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="flex-1 flex gap-4 w-full">
            <div className="space-y-2 w-full md:w-1/4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">পরীক্ষা</label>
              <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                <option value="">সিলেক্ট করুন</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="space-y-2 w-full md:w-1/4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">শ্রেণি</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                <option value="">সিলেক্ট করুন</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2 w-full md:w-1/4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">শাখা</label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-50">
                <option value="">সিলেক্ট করুন</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex items-end w-full md:w-1/4">
              <button 
                onClick={handleSearchTabulation} disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 h-[52px]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} জেনারেট করুন
              </button>
            </div>
          </div>
          {tabulationData && (
            <button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all shrink-0 h-[52px]"
            >
              <Printer className="w-5 h-5" /> প্রিন্ট (Landscape)
            </button>
          )}
        </div>
      </div>

      {/* TABULATION SHEET */}
      {tabulationData && (
        <div className="bg-white rounded-xl shadow-xl print:shadow-none print:m-0 overflow-hidden border border-slate-200 print:border-none">
          <div className="text-center p-6 border-b-2 border-slate-800">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wide">{tabulationData.schoolInfo.name}</h1>
            <p className="text-sm font-bold text-slate-600 mt-1">{tabulationData.schoolInfo.address}</p>
            <div className="mt-3 inline-block bg-slate-800 text-white px-6 py-1.5 rounded-full font-black tracking-widest text-sm uppercase">
              TABULATION SHEET
            </div>
            <p className="text-sm font-bold text-slate-800 mt-3 bg-slate-100 inline-block px-4 py-1 rounded-lg border border-slate-200">
              {tabulationData.schoolInfo.academicInfo}
            </p>
          </div>

          <div className="overflow-x-auto max-h-[65vh] print:max-h-none print:overflow-visible [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full relative">
            <table className="w-full text-left border-collapse border border-slate-300 min-w-max">
              <thead className="sticky top-0 bg-slate-200 z-10 print:static shadow-sm">
                <tr>
                  <th rowSpan={2} className="p-3 border border-slate-300 text-xs font-black text-slate-800 uppercase text-center bg-slate-200 sticky left-0 z-20">Roll</th>
                  <th rowSpan={2} className="p-3 border border-slate-300 text-xs font-black text-slate-800 uppercase bg-slate-200 sticky left-[60px] z-20 min-w-[200px]">Student Name</th>
                  {/* ✅ DYNAMIC HEADERS BASED ON PRACTICAL */}
                  {tabulationData.subjects.map((sub: any) => (
                    <th key={sub.id} colSpan={sub.hasPractical ? 4 : 3} className="p-2 border border-slate-300 text-xs font-black text-slate-800 uppercase text-center bg-slate-200">
                      {sub.name}
                    </th>
                  ))}
                  <th rowSpan={2} className="p-3 border border-slate-300 text-xs font-black text-indigo-800 uppercase text-center bg-indigo-100 min-w-[80px]">Total</th>
                  <th rowSpan={2} className="p-3 border border-slate-300 text-xs font-black text-indigo-800 uppercase text-center bg-indigo-100 min-w-[60px]">GPA</th>
                  <th rowSpan={2} className="p-3 border border-slate-300 text-xs font-black text-emerald-800 uppercase text-center bg-emerald-100 min-w-[60px]">Grade</th>
                </tr>
                <tr>
                  {/* ✅ DYNAMIC SUB-HEADERS BASED ON PRACTICAL */}
                  {tabulationData.subjects.map((sub: any, idx: number) => (
                    <React.Fragment key={idx}>
                      <th className="p-1.5 border border-slate-300 text-[10px] font-black text-slate-600 text-center bg-slate-100 w-8" title="Written">W</th>
                      <th className="p-1.5 border border-slate-300 text-[10px] font-black text-slate-600 text-center bg-slate-100 w-8" title="MCQ">M</th>
                      {sub.hasPractical && (
                        <th className="p-1.5 border border-slate-300 text-[10px] font-black text-blue-600 text-center bg-blue-50 w-8" title="Practical">P</th>
                      )}
                      <th className="p-1.5 border border-slate-300 text-[10px] font-black text-slate-800 text-center bg-slate-200 w-10 shadow-inner" title="Total">T</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-300">
                {/* ✅ DYNAMIC DATA ROWS */}
                {tabulationData.students.map((student: any, index: number) => (
                  <tr key={index} className="hover:bg-blue-50/50 transition-colors bg-white print:bg-white">
                    <td className="p-2 border border-slate-300 text-sm font-black text-slate-700 text-center bg-white sticky left-0 z-10 group-hover:bg-blue-50/50">{student.roll}</td>
                    <td className="p-2 border border-slate-300 text-sm font-bold text-slate-800 bg-white sticky left-[60px] z-10 group-hover:bg-blue-50/50 whitespace-nowrap">{student.name}</td>
                    
                    {tabulationData.subjects.map((sub: any) => {
                      const marks = student.marks[sub.id];
                      return (
                        <React.Fragment key={sub.id}>
                          <td className="p-1.5 border border-slate-300 text-xs font-medium text-slate-600 text-center bg-white">{marks && marks.w !== null ? marks.w : '-'}</td>
                          <td className="p-1.5 border border-slate-300 text-xs font-medium text-slate-600 text-center bg-white">{marks && marks.m !== null ? marks.m : '-'}</td>
                          {sub.hasPractical && (
                            <td className="p-1.5 border border-slate-300 text-xs font-medium text-blue-600 text-center bg-blue-50/30">{marks && marks.p !== null ? marks.p : '-'}</td>
                          )}
                          <td className="p-1.5 border border-slate-300 text-sm font-black text-slate-800 text-center bg-slate-50">{marks && marks.t !== null ? marks.t : '-'}</td>
                        </React.Fragment>
                      );
                    })}
                    
                    <td className="p-2 border border-slate-300 text-base font-black text-indigo-700 text-center bg-indigo-50/30">{student.total}</td>
                    <td className="p-2 border border-slate-300 text-sm font-black text-indigo-700 text-center bg-indigo-50/30">{student.gpa}</td>
                    <td className={`p-2 border border-slate-300 text-sm font-black text-center bg-emerald-50/30 ${student.grade === 'F' ? 'text-red-600' : 'text-emerald-700'}`}>{student.grade}</td>
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