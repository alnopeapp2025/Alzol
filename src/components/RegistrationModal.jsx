import React, { useState } from 'react';
import { X, Save, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const RegistrationModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    security_question: ''
  });

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Generate Text Activation Code
    const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error } = await supabase.from('app_users').insert([{
      username: formData.username,
      password: formData.password,
      security_question: formData.security_question,
      activation_code: activationCode
    }]);

    setLoading(false);

    if (!error) {
      alert(`تم التسجيل بنجاح! كود التفعيل الخاص بك هو: ${activationCode}`);
      onClose();
    } else {
      alert('حدث خطأ أثناء التسجيل');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-200">
        <div className="bg-[#00695c] text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck size={24} /> تسجيل حساب جديد
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleRegister} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">اسم المستخدم</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right"
            />
          </div>

          <div>
            <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right"
            />
          </div>

          <div>
            <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">سؤال الأمان</label>
            <input
              type="text"
              required
              placeholder="مثال: اسم صديق الطفولة؟"
              value={formData.security_question}
              onChange={(e) => setFormData({ ...formData, security_question: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#00695c] text-white h-14 rounded-xl font-bold text-lg shadow-md hover:bg-[#005c4b] flex items-center justify-center gap-2 mt-2"
          >
            <Save size={24} />
            <span>تسجيل</span>
          </button>
        </form>
      </div>
    </div>
  );
};
