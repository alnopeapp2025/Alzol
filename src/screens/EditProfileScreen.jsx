import React, { useState } from 'react';
import { ArrowRight, User, Lock, CreditCard, ChevronDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Toast } from '../components/Toast';

export const EditProfileScreen = ({ onBack, currentUser, onUpdateUser }) => {
  const [view, setView] = useState('main'); // main, verify-security, new-password
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Verification Data
  const [phone, setPhone] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  // New Password Data
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const securityQuestions = [
    'أين ولدت والدتك؟',
    'ما فريقك المفضل؟',
    'ماهي أول دولة أجنبية زرتها؟',
    'ما وجبتك المفضلة؟',
    'متى تزوجت؟'
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleVerifySecurity = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (phone !== currentUser.username) {
        showToast('رقم الهاتف غير مطابق للحساب الحالي', 'error');
        setLoading(false);
        return;
    }

    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', currentUser.id)
      .eq('username', phone)
      .eq('security_question', securityQuestion)
      .eq('security_answer', securityAnswer)
      .single();

    setLoading(false);

    if (data) {
      setView('new-password');
    } else {
      showToast('البيانات المدخلة غير صحيحة', 'error');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('كلمات المرور غير متطابقة', 'error');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('app_users')
      .update({ password: newPassword })
      .eq('id', currentUser.id);

    setLoading(false);

    if (!error) {
      showToast('تم تحديث كلمة المرور بنجاح');
      setTimeout(() => {
        setView('main');
        setNewPassword('');
        setConfirmNewPassword('');
        setPhone('');
        setSecurityAnswer('');
      }, 1500);
    } else {
      showToast('حدث خطأ أثناء التحديث', 'error');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />

      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button 
          onClick={() => {
            if (view === 'main') onBack();
            else setView('main');
          }}
          className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">
            {view === 'main' ? 'حسابي' : 'تغيير كلمة المرور'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col pt-6 overflow-y-auto">
        
        {view === 'main' && (
            <>
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-[#00695c]/10 rounded-full flex items-center justify-center mb-4 text-[#00695c] border-4 border-white shadow-md">
                        <User size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                        {currentUser ? currentUser.username : 'مستخدم'}
                    </h2>
                    <p className="text-gray-500 font-medium text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                        {currentUser ? 'عضو مسجل' : 'زائر'}
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <button 
                        onClick={() => setView('verify-security')}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Lock size={24} />
                            </div>
                            <span className="font-bold text-gray-800 text-lg">تغيير كلمة المرور</span>
                        </div>
                        <ArrowRight size={20} className="text-gray-300 rotate-180" />
                    </button>

                    <button 
                        onClick={() => showToast('قريباً: سيتم تفعيل الدفع الإلكتروني', 'info')}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <CreditCard size={24} />
                            </div>
                            <span className="font-bold text-gray-800 text-lg">تحديث وسائل الدفع</span>
                        </div>
                        <ArrowRight size={20} className="text-gray-300 rotate-180" />
                    </button>
                </div>
            </>
        )}

        {view === 'verify-security' && (
            <form onSubmit={handleVerifySecurity} className="flex flex-col gap-4 w-full">
                {/* Red Warning Text */}
                <div className="bg-red-50 border-2 border-red-100 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-200 mb-2">
                  <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                    <AlertTriangle size={20} strokeWidth={2.5} />
                  </div>
                  <p className="text-red-600 font-bold text-base leading-tight text-right flex-1">
                    للأمان يرجى تأكيد هويتك أولاً
                  </p>
                </div>

                <div>
                    <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">رقم الهاتف</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium"
                        placeholder="أدخل رقم هاتفك"
                    />
                </div>

                <div>
                    <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">سؤال الأمان</label>
                    <div className="relative">
                        <select
                            value={securityQuestion}
                            onChange={(e) => setSecurityQuestion(e.target.value)}
                            className="w-full h-12 px-4 pl-10 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium bg-white appearance-none"
                        >
                            <option value="">اختر سؤالاً...</option>
                            {securityQuestions.map((q, idx) => <option key={idx} value={q}>{q}</option>)}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <ChevronDown size={20} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">إجابة السؤال</label>
                    <input
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium"
                        placeholder="أدخل الإجابة"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#00695c] text-white h-14 rounded-xl font-bold text-lg shadow-md hover:bg-[#005c4b] flex items-center justify-center gap-2 mt-4"
                >
                    <ShieldCheck size={24} />
                    <span>تحقق ومتابعة</span>
                </button>
            </form>
        )}

        {view === 'new-password' && (
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 w-full">
                <div className="bg-green-50 text-green-800 p-3 rounded-xl text-sm font-bold text-center mb-2">
                    تم التحقق بنجاح. قم بتعيين كلمة المرور الجديدة.
                </div>

                <div>
                    <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">كلمة المرور الجديدة</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium"
                    />
                </div>

                <div>
                    <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">تأكيد كلمة المرور الجديدة</label>
                    <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#00695c] text-white h-14 rounded-xl font-bold text-lg shadow-md hover:bg-[#005c4b] flex items-center justify-center gap-2 mt-4"
                >
                    <Lock size={24} />
                    <span>تحديث كلمة المرور</span>
                </button>
            </form>
        )}

      </div>
    </div>
  );
};
