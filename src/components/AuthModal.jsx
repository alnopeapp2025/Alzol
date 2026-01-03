import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, KeyRound, ShieldCheck, ChevronDown, Phone, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Toast } from './Toast';
import { motion } from 'framer-motion';

// InputField remains outside to prevent focus loss issues
const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder }) => (
  <div>
    <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 px-4 pl-10 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon size={20} />
      </div>
    </div>
  </div>
);

export const AuthModal = ({ isOpen, onClose, onLogin, triggerMessage }) => {
  const [view, setView] = useState('login'); // login, register, register-success, forgot-check, forgot-reset
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loginError, setLoginError] = useState(''); // Persistent Login Error State
  const [registerError, setRegisterError] = useState(''); // Persistent Register Error State
  const [activationCode, setActivationCode] = useState(''); // Store code for success screen
  
  // Form States
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: ''
  });

  // Switch to register view if triggered by limit
  useEffect(() => {
    if (isOpen && triggerMessage) {
      setView('register');
    }
  }, [isOpen, triggerMessage]);

  const securityQuestions = [
    'أين ولدت والدتك؟',
    'ما فريقك المفضل؟',
    'ماهي أول دولة أجنبية زرتها؟',
    'ما وجبتك المفضلة؟',
    'متى تزوجت؟'
  ];

  if (!isOpen) return null;

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const resetForm = () => {
    setFormData({ phone: '', password: '', confirmPassword: '', securityQuestion: '', securityAnswer: '' });
    setLoginError('');
    setRegisterError('');
    setLoading(false);
    setActivationCode('');
  };

  const handleClose = () => {
    resetForm();
    setView('login');
    onClose();
  };

  // --- Actions ---

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', formData.phone) 
      .eq('password', formData.password)
      .single();

    setLoading(false);

    if (data) {
      showToast('تم تسجيل الدخول بنجاح');
      if (onLogin) onLogin(data); // Update parent state
    } else {
      // Persistent Red Error Window
      setLoginError('رقم الهاتف أو كلمة المرور غير صحيحة');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError(''); // Clear previous errors

    if (!formData.phone || !formData.password || !formData.securityQuestion || !formData.securityAnswer) {
      showToast('يرجى تعبئة جميع الحقول بشكل صحيح', 'error');
      return;
    }
    setLoading(true);

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase.from('app_users').insert([{
      username: formData.phone,
      password: formData.password,
      security_question: formData.securityQuestion,
      security_answer: formData.securityAnswer,
      activation_code: code
    }]).select().single();

    setLoading(false);

    if (!error && data) {
      setActivationCode(code);
      setView('register-success');
      
      // Removed Data Migration (Rollback)

    } else {
      console.error(error);
      // Fixed Error Message as requested
      setRegisterError('رقم الهاتف مسجل مسبقاً، يرجى اختيار رقم هاتف جديد أو استعادة الحساب من (نسيت كلمة المرور)');
    }
  };

  const handleForgotCheck = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', formData.phone)
      .eq('security_question', formData.securityQuestion)
      .eq('security_answer', formData.securityAnswer)
      .single();

    setLoading(false);

    if (data) {
      setView('forgot-reset');
    } else {
      showToast('البيانات المدخلة غير صحيحة', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('كلمات المرور غير متطابقة', 'error');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('app_users')
      .update({ password: formData.password })
      .eq('username', formData.phone);

    setLoading(false);

    if (!error) {
      showToast('تم تغيير كلمة المرور بنجاح');
      setTimeout(() => setView('login'), 1500);
    } else {
      showToast('حدث خطأ أثناء التحديث', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      <Toast 
        message={toast.message} 
        isVisible={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
        type={toast.type}
      />

      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#00695c] text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {view === 'login' && <><LogIn size={24} /> تسجيل الدخول</>}
            {view === 'register' && <><UserPlus size={24} /> حساب جديد</>}
            {view === 'register-success' && <><CheckCircle size={24} /> تم التسجيل</>}
            {(view === 'forgot-check' || view === 'forgot-reset') && <><KeyRound size={24} /> استعادة كلمة المرور</>}
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          
          {/* Trigger Message (For Guest Limit) */}
          {triggerMessage && view === 'register' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-center">
              <p className="text-yellow-800 text-sm font-bold leading-relaxed">
                {triggerMessage}
              </p>
            </div>
          )}

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              
              {/* Persistent Error Window */}
              {loginError && (
                <div className="bg-red-50 border-2 border-red-100 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-200">
                  <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                    <AlertTriangle size={20} strokeWidth={2.5} />
                  </div>
                  <p className="text-red-600 font-bold text-sm leading-tight text-right">
                    {loginError}
                  </p>
                </div>
              )}

              <InputField 
                label="رقم الهاتف" 
                icon={Phone} 
                value={formData.phone} 
                onChange={e => {
                  setFormData({...formData, phone: e.target.value});
                  setLoginError('');
                }}
              />
              <InputField 
                label="كلمة المرور" 
                icon={Lock} 
                type="password"
                value={formData.password} 
                onChange={e => {
                  setFormData({...formData, password: e.target.value});
                  setLoginError('');
                }}
              />
              <button disabled={loading} className="w-full bg-[#00695c] text-white h-12 rounded-xl font-bold shadow-md hover:bg-[#005c4b] mt-2 active:scale-95 transition-transform">
                دخول
              </button>
              <div className="flex justify-between text-xs font-bold text-[#00695c] mt-2 px-1">
                <button type="button" onClick={() => { resetForm(); setView('register'); }}>تسجيل حساب جديد</button>
                <button type="button" onClick={() => { resetForm(); setView('forgot-check'); }}>نسيت كلمة المرور؟</button>
              </div>
            </form>
          )}

          {/* REGISTER VIEW */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              
              {/* Persistent Register Error Window */}
              {registerError && (
                <div className="bg-red-50 border-2 border-red-100 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-200">
                  <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                    <AlertTriangle size={20} strokeWidth={2.5} />
                  </div>
                  <p className="text-red-600 font-bold text-sm leading-tight text-right">
                    {registerError}
                  </p>
                </div>
              )}

              <InputField 
                label="رقم الهاتف" 
                icon={Phone} 
                value={formData.phone} 
                onChange={e => {
                   setFormData({...formData, phone: e.target.value});
                   setRegisterError('');
                }}
              />
              <InputField 
                label="كلمة المرور" 
                icon={Lock} 
                type="password"
                value={formData.password} 
                onChange={e => {
                   setFormData({...formData, password: e.target.value});
                   setRegisterError('');
                }}
              />
              
              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">سؤال الأمان</label>
                <div className="relative">
                  <select
                    value={formData.securityQuestion}
                    onChange={e => setFormData({...formData, securityQuestion: e.target.value})}
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

              <InputField 
                label="إجابة السؤال" 
                icon={ShieldCheck} 
                value={formData.securityAnswer} 
                onChange={e => setFormData({...formData, securityAnswer: e.target.value})}
              />

              <button disabled={loading} className="w-full bg-[#00695c] text-white h-12 rounded-xl font-bold shadow-md hover:bg-[#005c4b] mt-2 active:scale-95 transition-transform">
                تسجيل
              </button>
              <button type="button" onClick={() => setView('login')} className="text-xs font-bold text-gray-500 text-center mt-2">
                العودة لتسجيل الدخول
              </button>
            </form>
          )}

          {/* REGISTER SUCCESS VIEW */}
          {view === 'register-success' && (
            <div className="flex flex-col items-center text-center py-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle size={64} className="text-green-600" strokeWidth={3} />
              </motion.div>
              
              <h3 className="text-xl font-bold text-[#00695c] mb-4">تم التسجيل بنجاح!</h3>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 w-full mb-4">
                <p className="text-gray-600 text-sm mb-2">كود التفعيل الخاص بك هو:</p>
                <div className="text-3xl font-black text-gray-800 tracking-widest select-all">
                  {activationCode}
                </div>
              </div>
              
              <p className="text-red-500 text-xs font-bold mb-6">
                يرجى الاحتفاظ به لاستعادة الحساب.
              </p>
              
              <button 
                onClick={() => setView('login')}
                className="w-full bg-[#00695c] text-white h-12 rounded-xl font-bold shadow-md hover:bg-[#005c4b] active:scale-95 transition-transform"
              >
                تسجيل الدخول الآن
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD - CHECK */}
          {view === 'forgot-check' && (
            <form onSubmit={handleForgotCheck} className="flex flex-col gap-4">
              <InputField 
                label="رقم الهاتف" 
                icon={Phone} 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              
              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">سؤال الأمان</label>
                <div className="relative">
                  <select
                    value={formData.securityQuestion}
                    onChange={e => setFormData({...formData, securityQuestion: e.target.value})}
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

              <InputField 
                label="إجابة السؤال" 
                icon={ShieldCheck} 
                value={formData.securityAnswer} 
                onChange={e => setFormData({...formData, securityAnswer: e.target.value})}
              />

              <button disabled={loading} className="w-full bg-[#00695c] text-white h-12 rounded-xl font-bold shadow-md hover:bg-[#005c4b] mt-2 active:scale-95 transition-transform">
                تحقق
              </button>
              <button type="button" onClick={() => setView('login')} className="text-xs font-bold text-gray-500 text-center mt-2">
                إلغاء
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD - RESET */}
          {view === 'forgot-reset' && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="bg-green-50 text-green-700 p-2 rounded-lg text-xs font-bold text-center mb-2">
                تم التحقق بنجاح. أدخل كلمة المرور الجديدة.
              </div>
              <InputField 
                label="كلمة السر الجديدة" 
                icon={Lock} 
                type="password"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <InputField 
                label="تأكيد كلمة السر" 
                icon={Lock} 
                type="password"
                value={formData.confirmPassword} 
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />

              <button disabled={loading} className="w-full bg-[#00695c] text-white h-12 rounded-xl font-bold shadow-md hover:bg-[#005c4b] mt-2 active:scale-95 transition-transform">
                دخول
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
