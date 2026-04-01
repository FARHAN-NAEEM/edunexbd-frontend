// app/dashboard/students/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, MoreVertical, Mail, UserPlus, 
  AlertCircle, X, Trash2, Layers, LayoutGrid, User, GraduationCap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // ----- Modal States -----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(''); 

  // ----- Form State -----
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    studentId: '',
    rollNo: '',
    gender: '',
    classId: '',
    sectionId: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    await Promise.all([fetchStudents(), fetchClasses(), fetchSections()]);
    setIsLoading(false);
  };

  const handleAuthError = (status: number) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('accessToken');
      router.push('/');
      return true;
    }
    return false;
  };

  // ----- API Calls -----
  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:3000/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (handleAuthError(res.status)) return;
      if (res.ok) setStudents(await res.json());
    } catch (error) { console.error('Students fetch error:', error); }
  };

  // ✅ Fix: fetchClasses এ accessToken পাঠানো হয়েছে
  const fetchClasses = async () => {
    const res = await fetch('http://localhost:3000/academic/classes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) setClasses(await res.json());
  };

  // ✅ Fix: fetchSections এ accessToken পাঠানো হয়েছে
  const fetchSections = async () => {
    const res = await fetch('http://localhost:3000/academic/sections', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });
    if (res.ok) setSections(await res.json());
  };

  // ----- Event Handlers -----
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');

    try {
      const submitData = {
        ...formData,
        rollNo: parseInt(formData.rollNo),
      };

      const res = await fetch('http://localhost:3000/auth/signup/student', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'শিক্ষার্থী ভর্তি করতে সমস্যা হয়েছে!');

      alert('সফলভাবে নতুন শিক্ষার্থী ভর্তি করা হয়েছে! 🎉');
      setIsModalOpen(false);
      setFormData({
        firstName: '', lastName: '', email: '', password: '', 
        studentId: '', rollNo: '', gender: '', classId: '', sectionId: ''
      });
      fetchStudents();
    } catch (error: any) {
      setModalError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-10">
      
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">শিক্ষার্থী তালিকা</h1>
          <p className="text-slate-500 text-[15px] mt-1 font-medium">আপনার কলেজের সকল শিক্ষার্থীদের প্রোফাইল পরিচালনা করুন</p>
        </div>
        
        <button 
          onClick={() => { setModalError(''); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> নতুন শিক্ষার্থী ভর্তি
        </button>
      </div>

      {/* ফিল্টার এবং টেবিল এরিয়া */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        
        {/* সার্চ বার */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="শিক্ষার্থীর নাম বা আইডি দিয়ে খুঁজুন..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="p-6 pl-8">শিক্ষার্থী আইডি</th>
                <th className="p-6">নাম ও ইমেইল</th>
                <th className="p-6">শ্রেণি ও শাখা</th>
                <th className="p-6">রোল</th>
                <th className="p-6">স্ট্যাটাস</th>
                <th className="p-6 text-right pr-8">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[15px]">
              {isLoading ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-medium italic">ডাটা লোড হচ্ছে...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-medium italic">কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি</td></tr>
              ) : (
                students.filter(s => 
                  `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6 pl-8 font-bold text-slate-600">{student.studentId}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {student.firstName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {student.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                          <Layers className="w-3.5 h-3.5" /> {student.class?.name}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-500 uppercase">
                          <LayoutGrid className="w-3 h-3" /> {student.section?.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 font-black text-slate-700">#{student.rollNo}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter ${
                        student.user?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {student.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* ✅ Fix: নতুন স্টাইলিশ বাটন যোগ করা হয়েছে */}
                    <td className="p-6 text-right pr-8">
                      <button 
                        onClick={() => router.push(`/dashboard/students/${student.id}`)} 
                        className="bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        প্রোফাইল দেখুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- STUDENT ENROLLMENT MODAL ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
            
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <GraduationCap className="text-blue-600" /> নতুন শিক্ষার্থী ভর্তি
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Student Enrollment Form</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full shadow-sm border border-slate-100 transition-all hover:rotate-90">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-8">
              {modalError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4" /> {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ফার্স্ট নেম</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all font-medium" placeholder="যেমন: Farhan" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ইমেইল অ্যাড্রেস</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-medium" placeholder="student@example.com" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">জেন্ডার</label>
                    <select required name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold text-slate-700">
                      <option value="">সিলেক্ট করুন</option>
                      <option value="MALE">ছাত্র (Male)</option>
                      <option value="FEMALE">ছাত্রী (Female)</option>
                      <option value="OTHER">অন্যান্য</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">লাস্ট নেম</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-medium" placeholder="যেমন: Naeem" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">পাসওয়ার্ড</label>
                    <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-medium" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">শিক্ষার্থী আইডি (Unique ID)</label>
                    <input required name="studentId" value={formData.studentId} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-bold" placeholder="যেমন: S-2026-001" />
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">শ্রেণি (Class)</label>
                    <select required name="classId" value={formData.classId} onChange={handleInputChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:outline-none font-bold text-indigo-600">
                      <option value="">ক্লাস সিলেক্ট করুন</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">শাখা (Section)</label>
                    <select required name="sectionId" value={formData.sectionId} onChange={handleInputChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:outline-none font-bold text-violet-600">
                      <option value="">শাখা সিলেক্ট করুন</option>
                      {sections.filter(s => s.classId === formData.classId).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">রোল নাম্বার</label>
                    <input required type="number" name="rollNo" value={formData.rollNo} onChange={handleInputChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:outline-none font-black text-slate-800" placeholder="যেমন: 101" />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">বাতিল করুন</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:bg-slate-300">
                  {isSubmitting ? 'ভর্তি চলছে...' : 'ভর্তি সম্পন্ন করুন'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}