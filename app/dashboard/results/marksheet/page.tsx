// app/dashboard/results/marksheet/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Printer, Search, CheckCircle, XCircle, Award, Loader2, FileText, Users, ChevronRight } from 'lucide-react';

function MarksheetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentIdFromUrl = searchParams.get('studentId');

  // --- States for Filters ---
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  // ✅ FIX: Removed dummy exam data
  const [exams, setExams] = useState<any[]>([]);

  // ✅ FIX: Start with empty selected values
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // --- States for Master-Detail ---
  const [students, setStudents] = useState<any[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isResultLoading, setIsResultLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // --- URL Sync ---
  useEffect(() => {
    if (studentIdFromUrl && studentIdFromUrl !== selectedStudentId) {
      setSelectedStudentId(studentIdFromUrl);
      fetchResult(studentIdFromUrl);
    }
  }, [studentIdFromUrl]);

  // --- Fetch Initial Data ---
  useEffect(() => {
    fetchClasses();
    fetchExams(); // ✅ FIX: Fetching real exams
  }, []);

  useEffect(() => {
    if (selectedClass) fetchSections(selectedClass);
    else setSections([]);
  }, [selectedClass]);

  // ✅ FIX: Function to fetch real exams from backend
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

  // --- Fetch Student List (Left Side) ---
  const handleSearchStudents = async () => {
    if (!selectedClass || !selectedSection) {
      alert('দয়া করে শ্রেণি এবং শাখা সিলেক্ট করুন!');
      return;
    }

    setIsListLoading(true);
    setStudents([]);
    try {
      const res = await fetch('http://localhost:3000/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        const allStudents = await res.json();
        const sectionStudents = allStudents.filter((s: any) => s.sectionId === selectedSection);
        sectionStudents.sort((a: any, b: any) => a.rollNo - b.rollNo);
        setStudents(sectionStudents);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsListLoading(false);
    }
  };

  // --- Fetch Single Result (Right Side) ---
  const fetchResult = async (id: string) => {
    setIsResultLoading(true);
    setResultData(null);
    
    // Fake API Delay for Preview (Replace with actual backend call later)
    setTimeout(() => {
      const matchedStudent = students.find(s => s.id === id) || { 
        firstName: 'MD.', lastName: 'NAEEM', studentId: 'RK-2026-012', rollNo: 1 
      };
      
      const examName = exams.find(e => e.id === selectedExam)?.name || 'Exam';

      setResultData({
        school: {
          name: 'EDUNEX BD SCHOOL & COLLEGE',
          address: 'Mymensingh | Phone: 01700000000',
        },
        student: {
          name: `${matchedStudent.firstName} ${matchedStudent.lastName}`,
          id: matchedStudent.studentId,
          roll: matchedStudent.rollNo,
          class: 'Eight (8)',
          section: 'A',
          fatherName: 'Mr. Father',
          motherName: 'Mrs. Mother',
          photoUrl: 'https://i.pravatar.cc/150?img=11' 
        },
        exam: {
          name: examName // ✅ Dynamic Exam Name
        },
        summary: {
          totalMarks: 709,
          outOf: 800,
          position: 1,
          gpa: 4.71,
          grade: 'A',
          status: 'Passed'
        },
        marks: [
          { subject: 'Bangla 1st Paper', fullMark: 100, highest: 97, written: 50, omr: 20, practical: 0, obtained: 70, grade: 'A-', gpa: 3.5 },
          { subject: 'Bangla 2nd Paper', fullMark: 50, highest: 49, written: 35, omr: 15, practical: 0, obtained: 50, grade: 'A+', gpa: 5.0 },
          { subject: 'English 1st Paper', fullMark: 100, highest: 87, written: 80, omr: 0, practical: 0, obtained: 80, grade: 'A+', gpa: 5.0 },
          { subject: 'English 2nd Paper', fullMark: 100, highest: 89, written: 80, omr: 0, practical: 0, obtained: 80, grade: 'A+', gpa: 5.0 },
          { subject: 'Mathematics', fullMark: 100, highest: 94, written: 56, omr: 28, practical: 0, obtained: 84, grade: 'A+', gpa: 5.0 },
          { subject: 'Science', fullMark: 100, highest: 99, written: 66, omr: 23, practical: 0, obtained: 89, grade: 'A+', gpa: 5.0 },
          { subject: 'History & Social Science', fullMark: 100, highest: 99, written: 55, omr: 23, practical: 0, obtained: 78, grade: 'A', gpa: 4.0 },
          { subject: 'Digital Technology', fullMark: 50, highest: 47, written: 23, omr: 0, practical: 22, obtained: 45, grade: 'A+', gpa: 5.0 },
          { subject: 'Islam & Moral Education', fullMark: 100, highest: 100, written: 66, omr: 67, practical: 0, obtained: 133, grade: 'A+', gpa: 5.0 },
        ]
      });
      setIsResultLoading(false);
    }, 800);
  };

  const handleStudentClick = (id: string) => {
    // Sync URL without page reload
    router.push(`?studentId=${id}`, { scroll: false });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 pb-6">
      
      {/* ================= LEFT PANEL (30%): STUDENT LIST ================= */}
      <div className="w-full lg:w-[30%] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden print:hidden shrink-0">
        
        {/* Filters */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-slate-800">শিক্ষার্থী তালিকা</h2>
          </div>
          
          <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm">
            <option value="">পরীক্ষা সিলেক্ট করুন</option> {/* ✅ FIX: Added placeholder option */}
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          
          <div className="grid grid-cols-2 gap-3">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm">
              <option value="">শ্রেণি</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm disabled:opacity-50">
              <option value="">শাখা</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <button 
            onClick={handleSearchStudents} disabled={isListLoading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm"
          >
            {isListLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} খুঁজুন
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {students.length === 0 && !isListLoading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Users className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-bold">উপর থেকে শ্রেণি এবং শাখা সিলেক্ট করে স্টুডেন্ট খুঁজুন</p>
            </div>
          )}

          {students.map((student) => {
            const isSelected = student.id === selectedStudentId;
            return (
              <div 
                key={student.id}
                onClick={() => handleStudentClick(student.id)}
                className={`p-4 border-b border-slate-50 cursor-pointer transition-all flex items-center justify-between group ${
                  isSelected ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-500'}`}>
                    {student.rollNo}
                  </div>
                  <div>
                    <h3 className={`font-black text-sm ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wider">{student.studentId}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= RIGHT PANEL (70%): MARKSHEET PREVIEW ================= */}
      <div className="w-full lg:w-[70%] bg-slate-100/50 rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col relative print:w-full print:bg-white print:border-none print:rounded-none">
        
        {/* Empty State */}
        {!selectedStudentId && !isResultLoading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 print:hidden">
            <FileText className="w-20 h-20 mb-4 opacity-20" />
            <p className="text-xl font-black text-slate-500">মার্কশিট দেখতে বাম পাশ থেকে শিক্ষার্থী সিলেক্ট করুন</p>
          </div>
        )}

        {/* Loading State */}
        {isResultLoading && (
          <div className="h-full flex flex-col items-center justify-center text-blue-600 print:hidden">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold text-slate-500 tracking-widest uppercase text-sm">রেজাল্ট প্রসেস হচ্ছে...</p>
          </div>
        )}

        {/* Marksheet Preview */}
        {resultData && !isResultLoading && (
          <>
            {/* Action Bar (Hidden in Print) */}
            <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shrink-0 print:hidden sticky top-0 z-10 shadow-sm">
              <div>
                <h3 className="font-black text-slate-800 text-lg">মার্কশিট প্রিভিউ</h3>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5"><CheckCircle className="w-3 h-3"/> রেজাল্ট প্রস্তুত</p>
              </div>
              <button 
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট (A4)
              </button>
            </div>

            {/* A4 Wrapper for Scrolling */}
            <div className="flex-1 overflow-y-auto p-8 print:p-0 bg-slate-100/50 print:bg-white flex justify-center [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              
              {/* THE ACTUAL MARKSHEET (A4 SIZE) */}
              <div className="w-full max-w-[210mm] bg-white p-[12mm] shadow-2xl print:shadow-none print:p-0 print:m-0 min-h-[297mm] relative shrink-0">
                
                {/* Header Section */}
                <div className="text-center border-b-[3px] border-slate-800 pb-4 mb-6">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{resultData.school.name}</h1>
                  <p className="text-sm font-bold text-slate-600 mt-1">{resultData.school.address}</p>
                  <div className="mt-4 inline-block bg-slate-800 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm">
                    Academic Result - {resultData.exam.name}
                  </div>
                </div>

                {/* Student Info & Photo */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0 p-1">
                      <img src={resultData.student.photoUrl} alt="Student" className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-800">{resultData.student.name}</h2>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-1 mt-3">
                        <p className="text-sm"><span className="font-bold text-slate-500">Student ID:</span> <span className="font-black text-slate-800">{resultData.student.id}</span></p>
                        <p className="text-sm"><span className="font-bold text-slate-500">Roll No:</span> <span className="font-black text-slate-800">{resultData.student.roll}</span></p>
                        <p className="text-sm"><span className="font-bold text-slate-500">Father's Name:</span> <span className="font-black text-slate-800">{resultData.student.fatherName}</span></p>
                        <p className="text-sm"><span className="font-bold text-slate-500">Class:</span> <span className="font-black text-slate-800">{resultData.student.class}</span></p>
                        <p className="text-sm"><span className="font-bold text-slate-500">Mother's Name:</span> <span className="font-black text-slate-800">{resultData.student.motherName}</span></p>
                        <p className="text-sm"><span className="font-bold text-slate-500">Section:</span> <span className="font-black text-slate-800">{resultData.student.section}</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Cards & Grade Scale Grid */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                  
                  {/* Summary Cards (Left) */}
                  <div className="col-span-8 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Award className="w-6 h-6" /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Marks</p>
                        <p className="text-2xl font-black text-slate-800">{resultData.summary.totalMarks} <span className="text-base text-slate-400">/ {resultData.summary.outOf}</span></p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0"><span className="text-xl font-black">#</span></div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Position</p>
                        <p className="text-2xl font-black text-slate-800">{resultData.summary.position}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0"><span className="text-xl font-black">G</span></div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Final GPA</p>
                        <p className="text-2xl font-black text-slate-800">{resultData.summary.gpa.toFixed(2)} <span className="text-lg text-slate-400">({resultData.summary.grade})</span></p>
                      </div>
                    </div>

                    <div className={`border p-4 rounded-xl flex items-center gap-4 ${resultData.summary.status === 'Passed' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${resultData.summary.status === 'Passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {resultData.summary.status === 'Passed' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Result</p>
                        <p className={`text-2xl font-black ${resultData.summary.status === 'Passed' ? 'text-emerald-700' : 'text-red-700'}`}>{resultData.summary.status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grading Scale (Right) */}
                  <div className="col-span-4 border border-slate-200 rounded-xl overflow-hidden text-center text-[10px] font-bold text-slate-600 flex flex-col justify-center">
                    <div className="grid grid-cols-3 bg-slate-100 py-1.5 border-b border-slate-200 text-slate-800"><div>Range %</div><div>Grade</div><div>GPA</div></div>
                    <div className="grid grid-cols-3 py-1 border-b border-slate-100"><div>80-100</div><div className="text-emerald-600">A+</div><div>5.00</div></div>
                    <div className="grid grid-cols-3 py-1 border-b border-slate-100"><div>70-79</div><div className="text-blue-600">A</div><div>4.00</div></div>
                    <div className="grid grid-cols-3 py-1 border-b border-slate-100"><div>60-69</div><div>A-</div><div>3.50</div></div>
                    <div className="grid grid-cols-3 py-1 border-b border-slate-100"><div>50-59</div><div>B</div><div>3.00</div></div>
                    <div className="grid grid-cols-3 py-1 border-b border-slate-100"><div>40-49</div><div>C</div><div>2.00</div></div>
                    <div className="grid grid-cols-3 py-1 border-b border-slate-100"><div>33-39</div><div>D</div><div>1.00</div></div>
                    <div className="grid grid-cols-3 py-1 text-red-600"><div>0-32</div><div>F</div><div>0.00</div></div>
                  </div>
                </div>

                {/* Detailed Marks Table */}
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300">
                      <th className="py-3 px-3 border-r border-slate-300 text-xs font-black text-slate-800 uppercase text-center w-10">#</th>
                      <th className="py-3 px-3 border-r border-slate-300 text-xs font-black text-slate-800 uppercase">Subject Name</th>
                      <th className="py-3 px-2 border-r border-slate-300 text-xs font-black text-slate-800 uppercase text-center w-16">Full Mark</th>
                      <th className="py-3 px-2 border-r border-slate-300 text-[10px] font-black text-slate-500 uppercase text-center w-16">Written</th>
                      <th className="py-3 px-2 border-r border-slate-300 text-[10px] font-black text-slate-500 uppercase text-center w-16">OMR</th>
                      <th className="py-3 px-2 border-r border-slate-300 text-[10px] font-black text-slate-500 uppercase text-center w-16">Practical</th>
                      <th className="py-3 px-2 border-r border-slate-300 text-xs font-black text-slate-800 uppercase text-center w-20">Obtained</th>
                      <th className="py-3 px-2 border-r border-slate-300 text-xs font-black text-slate-800 uppercase text-center w-16">Grade</th>
                      <th className="py-3 px-2 text-xs font-black text-slate-800 uppercase text-center w-16">GPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultData.marks.map((m: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-200 even:bg-slate-50">
                        <td className="py-2.5 px-3 border-r border-slate-200 text-sm font-bold text-slate-500 text-center">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-sm font-black text-slate-800">{m.subject}</td>
                        <td className="py-2.5 px-2 border-r border-slate-200 text-sm font-bold text-slate-600 text-center">{m.fullMark}</td>
                        <td className="py-2.5 px-2 border-r border-slate-200 text-sm font-medium text-slate-500 text-center">{m.written || '-'}</td>
                        <td className="py-2.5 px-2 border-r border-slate-200 text-sm font-medium text-slate-500 text-center">{m.omr || '-'}</td>
                        <td className="py-2.5 px-2 border-r border-slate-200 text-sm font-medium text-slate-500 text-center">{m.practical || '-'}</td>
                        <td className="py-2.5 px-2 border-r border-slate-200 text-base font-black text-slate-900 text-center">{m.obtained}</td>
                        <td className={`py-2.5 px-2 border-r border-slate-200 text-sm font-black text-center ${m.grade === 'F' ? 'text-red-600' : 'text-emerald-600'}`}>{m.grade}</td>
                        <td className="py-2.5 px-2 text-sm font-black text-slate-800 text-center">{m.gpa.toFixed(2)}</td>
                      </tr>
                    ))}
                    {/* Grand Total Row */}
                    <tr className="bg-slate-100 border-t-2 border-slate-800">
                      <td colSpan={6} className="py-3 px-3 border-r border-slate-300 text-sm font-black text-slate-800 text-right uppercase tracking-widest">Grand Total</td>
                      <td className="py-3 px-2 border-r border-slate-300 text-lg font-black text-indigo-700 text-center">{resultData.summary.totalMarks}</td>
                      <td className="py-3 px-2 border-r border-slate-300 text-base font-black text-emerald-600 text-center">{resultData.summary.grade}</td>
                      <td className="py-3 px-2 text-base font-black text-slate-900 text-center">{resultData.summary.gpa.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures Area */}
                <div className="absolute bottom-10 left-12 right-12 flex justify-between items-end mt-20 pt-8">
                  <div className="text-center w-40"><div className="border-t border-slate-400 pt-2 text-sm font-black text-slate-800">Class Teacher</div></div>
                  <div className="text-center w-40"><div className="border-t border-slate-400 pt-2 text-sm font-black text-slate-800">Guardian</div></div>
                  <div className="text-center w-52"><div className="border-t border-slate-400 pt-2 text-sm font-black text-slate-800">Headmaster / Principal</div></div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MarksheetPage() {
  return (
    <Suspense fallback={<div className="h-[70vh] flex items-center justify-center text-blue-600"><Loader2 className="w-10 h-10 animate-spin" /></div>}>
      <MarksheetContent />
    </Suspense>
  );
}