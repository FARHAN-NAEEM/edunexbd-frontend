// app/dashboard/teachers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Mail, BookOpen, Briefcase, AlertCircle, X, BookPlus, Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // ----- Modal States -----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(''); 
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', employeeId: '', designation: '', department: '',
  });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  // 💡 টোকেন এক্সপায়ার চেক করার একটি হেল্পার ফাংশন
  const handleAuthError = (status: number) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('accessToken');
      router.push('/');
      return true;
    }
    return false;
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return router.push('/');

      const response = await fetch('http://localhost:3000/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (handleAuthError(response.status)) return; // 401 হলে লগইন পেজে পাঠাবে
      if (!response.ok) throw new Error('ডাটা লোড করতে সমস্যা হচ্ছে!');
      
      const data = await response.json();
      setTeachers(data);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/academic/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (handleAuthError(response.status)) return;
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Subjects fetch error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/auth/signup/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData) 
      });

      if (handleAuthError(response.status)) return;

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'শিক্ষক যোগ করতে সমস্যা হয়েছে!');

      alert('সফলভাবে নতুন শিক্ষক যোগ করা হয়েছে! 🎉');
      setIsModalOpen(false); 
      setFormData({ firstName: '', lastName: '', email: '', password: '', employeeId: '', designation: '', department: '' }); 
      setIsLoading(true);
      fetchTeachers(); 
    } catch (error: any) {
      setModalError(error.message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignModal = (teacher: any) => {
    setSelectedTeacher(teacher);
    setAssignError('');
    setSelectedSubjectId('');
    setIsAssignModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return setAssignError('দয়া করে একটি সাবজেক্ট নির্বাচন করুন!');

    setIsAssigning(true);
    setAssignError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/teachers/${selectedTeacher.id}/assign-subject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ subjectId: selectedSubjectId }) 
      });

      if (handleAuthError(response.status)) return;

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'সাবজেক্ট অ্যাসাইন করতে সমস্যা হয়েছে!');

      alert('সফলভাবে সাবজেক্ট অ্যাসাইন করা হয়েছে! 📚');
      setIsAssignModalOpen(false);
      setSelectedSubjectId('');
      fetchTeachers(); 
    } catch (error: any) {
      setAssignError(error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই শিক্ষককে রিমুভ করতে চান? এই কাজ বাতিল করা যাবে না!')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/teachers/${teacherId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (handleAuthError(response.status)) return;
      if (!response.ok) throw new Error('শিক্ষক ডিলিট করতে সমস্যা হচ্ছে!');
      
      alert('শিক্ষক সফলভাবে ডিলিট করা হয়েছে!');
      setOpenDropdownId(null);
      fetchTeachers(); 
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">শিক্ষক তালিকা</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">আপনার কলেজের সকল শিক্ষকদের তথ্য পরিচালনা করুন</p>
        </div>
        <button 
          onClick={() => { setModalError(''); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          নতুন শিক্ষক যোগ করুন
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="শিক্ষকের নাম বা আইডি দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]"> 
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-5 pl-6">আইডি</th>
                <th className="p-5">শিক্ষকের নাম</th>
                <th className="p-5">বিষয়সমূহ</th>
                <th className="p-5">পদবি</th>
                <th className="p-5">স্ট্যাটাস</th>
                <th className="p-5 text-right pr-6">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[15px]">
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-500 font-medium">ডাটা লোড হচ্ছে...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-500 font-medium">কোনো শিক্ষকের তথ্য পাওয়া যায়নি।</td></tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-5 pl-6 font-semibold text-slate-600">{teacher.employeeId}</td>
                    <td className="p-5">
                      <div className="font-bold text-slate-800">{teacher.firstName} {teacher.lastName}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5" /> {teacher.user.email}
                      </div>
                    </td>
                    <td className="p-5">
                      {teacher.assignments && teacher.assignments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {teacher.assignments.map((assignment: any) => (
                            <span key={assignment.subjectId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                              <BookOpen className="w-3.5 h-3.5" />
                              {assignment.subject.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">অ্যাসাইন করা হয়নি</span>
                      )}
                    </td>
                    <td className="p-5 text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        {teacher.designation}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        teacher.user.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {teacher.user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    
                    <td className="p-5 text-right pr-6 relative">
                      <div className="flex justify-end items-center gap-4">
                        
                        <button 
                          onClick={() => openAssignModal(teacher)}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-indigo-100 shadow-sm"
                        >
                          <BookPlus className="w-4 h-4" /> সাবজেক্ট দিন
                        </button>

                        <div className="relative">
                          <button 
                            onClick={() => setOpenDropdownId(openDropdownId === teacher.id ? null : teacher.id)}
                            className={`p-2 rounded-lg transition-colors border ${
                              openDropdownId === teacher.id ? 'bg-slate-100 border-slate-200 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {openDropdownId === teacher.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                              <button 
                                onClick={() => { alert('প্রোফাইল দেখার পেজটি পরে তৈরি করা হবে।'); setOpenDropdownId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                              >
                                <Eye className="w-4 h-4" /> প্রোফাইল দেখুন
                              </button>
                              
                              <button 
                                onClick={() => { alert('এডিট অপশনটি পরে তৈরি করা হবে।'); setOpenDropdownId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                              >
                                <Edit className="w-4 h-4" /> এডিট করুন
                              </button>

                              <div className="h-px bg-slate-100 my-1"></div>
                              
                              <button 
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" /> ডিলিট করুন
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- ১. NEW TEACHER MODAL ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">নতুন শিক্ষক যোগ করুন</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="p-6">
              {modalError && (
                <div className="mb-5 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />{modalError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">ফার্স্ট নেম</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="যেমন: Arif" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">লাস্ট নেম</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="যেমন: Rahman" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">ইমেইল অ্যাড্রেস</label>
                  <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="teacher@edunex.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">পাসওয়ার্ড</label>
                  <input required name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">এমপ্লয়ী আইডি (Employee ID)</label>
                  <input required name="employeeId" value={formData.employeeId} onChange={handleInputChange} type="text" placeholder="T-2026-..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">পদবি (Designation)</label>
                  <input required name="designation" value={formData.designation} onChange={handleInputChange} type="text" placeholder="Lecturer / Senior Teacher" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">ডিপার্টমেন্ট (ঐচ্ছিক)</label>
                  <input name="department" value={formData.department} onChange={handleInputChange} type="text" placeholder="Science / Arts / Commerce" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">বাতিল করুন</button>
                <button type="submit" disabled={isSubmitting} className={`px-6 py-2.5 rounded-xl font-semibold text-white transition-all shadow-sm ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}>
                  {isSubmitting ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- ২. ASSIGN SUBJECT MODAL ---------------- */}
      {isAssignModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">সাবজেক্ট অ্যাসাইন করুন</h2>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAssignSubject} className="p-6">
              {assignError && (
                <div className="mb-5 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />{assignError}
                </div>
              )}

              <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <p className="text-sm text-slate-500 mb-1">নির্বাচিত শিক্ষক</p>
                <h3 className="text-lg font-bold text-slate-800">{selectedTeacher.firstName} {selectedTeacher.lastName}</h3>
                <p className="text-xs text-slate-400">{selectedTeacher.designation}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">বিষয় (Subject) নির্বাচন করুন</label>
                
                {subjects.length === 0 ? (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    ⚠️ ডাটাবেসে কোনো সাবজেক্ট পাওয়া যায়নি। দয়া করে আগে সাবজেক্ট তৈরি করুন।
                  </div>
                ) : (
                  <select 
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700"
                  >
                    <option value="" disabled>-- একটি বিষয় সিলেক্ট করুন --</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code}) {subject.class ? `- ${subject.class.name}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  বাতিল করুন
                </button>
                <button 
                  type="submit" 
                  disabled={isAssigning || subjects.length === 0} 
                  className={`px-6 py-2.5 rounded-xl font-semibold text-white transition-all shadow-sm ${
                    isAssigning || subjects.length === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
                  }`}
                >
                  {isAssigning ? 'অ্যাসাইন হচ্ছে...' : 'অ্যাসাইন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}