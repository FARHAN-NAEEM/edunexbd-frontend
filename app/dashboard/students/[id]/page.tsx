// app/dashboard/students/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, BookOpen, Users, FileText, Phone, MapPin, Calendar, 
  Droplet, Edit3, Save, ArrowLeft, Loader2, CheckCircle, ShieldCheck, Mail, Info, Camera 
} from 'lucide-react';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'academic' | 'guardian'>('basic');

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (studentId) fetchStudentProfile();
  }, [studentId]);

  const fetchStudentProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:3000/students/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('accessToken');
        router.push('/');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStudent(data);
        setFormData(data); 
      } else {
        alert('শিক্ষার্থীর তথ্য পাওয়া যায়নি!');
        router.push('/dashboard/students');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert('ছবির সাইজ ২ মেগাবাইটের কম হতে হবে!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullNameBn: formData.fullNameBn,
        rollNo: formData.rollNo,
        gender: formData.gender,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        religion: formData.religion,
        mobile: formData.mobile,
        presentAddress: formData.presentAddress,
        fatherName: formData.fatherName,
        fatherMobile: formData.fatherMobile,
        motherName: formData.motherName,
        motherMobile: formData.motherMobile,
        photoUrl: formData.photoUrl, 
      };

      const res = await fetch(`http://localhost:3000/students/${studentId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatePayload)
      });

      if (res.ok) {
        alert('প্রোফাইল সফলভাবে আপডেট করা হয়েছে! 🎉');
        setIsEditing(false);
        fetchStudentProfile(); 
      } else {
        throw new Error('আপডেট করতে সমস্যা হয়েছে!');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return '';
    return new Date(isoDate).toISOString().split('T')[0];
  };

  const getMissingFieldsText = () => {
    if (!student) return '';
    const required = [
      { key: 'fullNameBn', label: 'পূর্ণ নাম (বাংলায়)' },
      { key: 'dob', label: 'জন্ম তারিখ' },
      { key: 'bloodGroup', label: 'রক্তের গ্রুপ' },
      { key: 'mobile', label: 'মোবাইল নাম্বার' },
      { key: 'fatherName', label: 'পিতার নাম' },
      { key: 'presentAddress', label: 'বর্তমান ঠিকানা' },
      { key: 'photoUrl', label: 'প্রোফাইল ছবি' }
    ];
    const missing = required.filter(f => !student[f.key]).map(f => f.label);
    if (missing.length === 0) return '';
    return `বাকি থাকা তথ্য: ${missing.join(', ')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 font-bold text-slate-500">প্রোফাইল লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
        <button onClick={() => router.push('/dashboard/students')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-4 py-2 transition-all">
          <ArrowLeft className="w-5 h-5" /> শিক্ষার্থী তালিকায় ফিরুন
        </button>
        <div className="flex gap-3 pr-2">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
              <Edit3 className="w-4 h-4" /> প্রোফাইল এডিট করুন
            </button>
          ) : (
            <>
              <button onClick={() => {setIsEditing(false); setFormData(student);}} className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-xl font-bold transition-all">
                বাতিল
              </button>
              <button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} সেভ করুন
              </button>
            </>
          )}
        </div>
      </div>

      {/* ✅ FIX: Removed 'items-start' from grid so columns can act independently without collapsing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Snapshot */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500 to-indigo-600"></div>
            
            <div className="relative z-10">
              <div className="w-32 h-32 mx-auto bg-white rounded-[2rem] p-2 shadow-xl mb-6 relative group">
                <div className="w-full h-full bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-4xl font-black text-slate-300 overflow-hidden relative">
                  {(formData.photoUrl || student?.photoUrl) ? (
                    <img src={formData.photoUrl || student?.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    student?.firstName?.charAt(0) || 'U'
                  )}

                  {isEditing && (
                    <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">ছবি আপলোড</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-slate-800">{student?.firstName} {student?.lastName}</h2>
              <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-sm">{student?.studentId}</p>
              
              <div className="mt-6 flex justify-center gap-2">
                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-xs font-black tracking-widest">{student?.class?.name}</span>
                <span className="bg-violet-50 text-violet-700 px-4 py-1.5 rounded-xl text-xs font-black tracking-widest">{student?.section?.name}</span>
              </div>

              {/* Profile Completion Meter */}
              <div className="mt-10 text-left">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">প্রোফাইল স্ট্যাটাস</span>
                  <span className="text-sm font-black text-emerald-600">{student?.profileCompletionScore || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${student?.profileCompletionScore || 0}%` }}></div>
                </div>
                
                {(student?.profileCompletionScore || 0) < 100 && (
                  <div className="mt-3 bg-amber-50 p-3.5 rounded-xl border border-amber-100 flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                      {getMissingFieldsText()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-5">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-4">কুইক কন্টাক্ট</h3>
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Mail className="w-5 h-5 text-slate-400"/></div>
              <span className="text-sm">{student?.user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><Phone className="w-5 h-5 text-slate-400"/></div>
              <span className="text-sm">{student?.mobile || 'নাম্বার দেওয়া হয়নি'}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-emerald-500"/></div>
              <span className="text-sm font-bold text-emerald-600">অ্যাকাউন্ট অ্যাক্টিভ</span>
            </div>
          </div>
        </div>

        {/* ✅ ULTIMATE FIX FOR THE RIGHT PANEL: 
          1. style={{ minHeight: '750px', height: '750px' }} guarantees the card NEVER shrinks or expands.
          2. flex & flex-col makes sure the inner content respects this fixed height.
        */}
        <div 
          className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden"
          style={{ minHeight: '750px', height: '750px' }}
        >
          
          {/* ✅ TAB HEADER: shrink-0 so it stays perfectly at the top without getting squeezed */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 shrink-0">
            {[
              { id: 'basic', label: 'ব্যক্তিগত তথ্য', icon: User },
              { id: 'academic', label: 'একাডেমিক তথ্য', icon: BookOpen },
              { id: 'guardian', label: 'পিতা-মাতা ও অভিভাবক', icon: Users },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-sm font-black flex items-center justify-center gap-2 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* ✅ TAB BODY: flex-1 makes it fill the rest of the 750px. overflow-y-auto enables inner scrolling. */}
          <div className="flex-1 overflow-y-auto p-8 pr-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            
            {/* --- TAB: BASIC INFO --- */}
            {activeTab === 'basic' && (
              <div className="h-full space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="ফার্স্ট নেম (English)" name="firstName" value={formData.firstName} isEditing={isEditing} onChange={handleInputChange} />
                  <InputField label="লাস্ট নেম (English)" name="lastName" value={formData.lastName} isEditing={isEditing} onChange={handleInputChange} />
                  <InputField label="পূর্ণ নাম (বাংলায়)" name="fullNameBn" value={formData.fullNameBn || ''} isEditing={isEditing} onChange={handleInputChange} placeholder="যেমন: মো: ফারহান" />
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">জেন্ডার</label>
                      <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                        <option value="">সিলেক্ট করুন</option>
                        <option value="MALE">ছাত্র (Male)</option>
                        <option value="FEMALE">ছাত্রী (Female)</option>
                      </select>
                    </div>
                  ) : (
                    <DisplayField label="জেন্ডার" value={formData.gender === 'MALE' ? 'ছাত্র (Male)' : formData.gender === 'FEMALE' ? 'ছাত্রী (Female)' : 'দেওয়া হয়নি'} />
                  )}

                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">জন্ম তারিখ</label>
                      <input type="date" name="dob" value={formatDateForInput(formData.dob)} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                    </div>
                  ) : (
                    <DisplayField label="জন্ম তারিখ" value={formData.dob ? new Date(formData.dob).toLocaleDateString('bn-BD') : 'দেওয়া হয়নি'} />
                  )}

                  <InputField label="রক্তের গ্রুপ" name="bloodGroup" value={formData.bloodGroup || ''} isEditing={isEditing} onChange={handleInputChange} placeholder="যেমন: O+" />
                  <InputField label="ধর্ম" name="religion" value={formData.religion || ''} isEditing={isEditing} onChange={handleInputChange} placeholder="যেমন: ইসলাম" />
                  <InputField label="নিজস্ব মোবাইল নাম্বার" name="mobile" value={formData.mobile || ''} isEditing={isEditing} onChange={handleInputChange} />
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <InputField label="বর্তমান ঠিকানা" name="presentAddress" value={formData.presentAddress || ''} isEditing={isEditing} onChange={handleInputChange} fullWidth />
                </div>
              </div>
            )}

            {/* --- TAB: ACADEMIC INFO --- */}
            {activeTab === 'academic' && (
              <div className="h-full space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-4">
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex gap-4 items-start mb-8">
                  <Info className="w-6 h-6 text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-indigo-800">একাডেমিক তথ্য পরিবর্তন</h4>
                    <p className="text-sm text-indigo-600/80 mt-1">শ্রেণি বা শাখা পরিবর্তন করতে চাইলে অ্যাডমিন প্যানেলের "Promotion" বা "Transfer" মডিউল ব্যবহার করার পরামর্শ দেওয়া হচ্ছে। এখানে শুধু বেসিক ফিল্ড এডিট করা যাবে।</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DisplayField label="শিক্ষার্থী আইডি" value={student?.studentId} highlight />
                  <DisplayField label="বর্তমান শ্রেণি" value={student?.class?.name} highlight />
                  <DisplayField label="বর্তমান শাখা" value={student?.section?.name} highlight />
                  <InputField label="রোল নাম্বার" name="rollNo" value={formData.rollNo} isEditing={isEditing} onChange={handleInputChange} type="number" />
                </div>
              </div>
            )}

            {/* --- TAB: GUARDIAN INFO --- */}
            {activeTab === 'guardian' && (
              <div className="h-full space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div className="col-span-1 md:col-span-2"><h3 className="font-black text-slate-800 border-b border-slate-100 pb-2">পিতার তথ্য</h3></div>
                  <InputField label="পিতার নাম" name="fatherName" value={formData.fatherName || ''} isEditing={isEditing} onChange={handleInputChange} />
                  <InputField label="পিতার মোবাইল নাম্বার" name="fatherMobile" value={formData.fatherMobile || ''} isEditing={isEditing} onChange={handleInputChange} />

                  <div className="col-span-1 md:col-span-2 pt-4"><h3 className="font-black text-slate-800 border-b border-slate-100 pb-2">মাতার তথ্য</h3></div>
                  <InputField label="মাতার নাম" name="motherName" value={formData.motherName || ''} isEditing={isEditing} onChange={handleInputChange} />
                  <InputField label="মাতার মোবাইল নাম্বার" name="motherMobile" value={formData.motherMobile || ''} isEditing={isEditing} onChange={handleInputChange} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components for clean UI ---
const AlertCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const InputField = ({ label, name, value, isEditing, onChange, type = "text", placeholder = "", fullWidth = false }: any) => {
  if (!isEditing) {
    return <DisplayField label={label} value={value} fullWidth={fullWidth} />;
  }
  return (
    <div className={`space-y-2 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder}
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
      />
    </div>
  );
};

const DisplayField = ({ label, value, fullWidth = false, highlight = false }: any) => (
  <div className={`space-y-1 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</p>
    <div className={`p-4 rounded-2xl font-bold text-[15px] ${highlight ? 'bg-indigo-50/50 text-indigo-700 border border-indigo-100' : 'bg-slate-50/50 text-slate-700 border border-slate-100'}`}>
      {value || <span className="text-slate-400 font-medium italic">তথ্য দেওয়া নেই</span>}
    </div>
  </div>
);