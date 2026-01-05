import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, User, KeyRound, X, AlertTriangle } from 'lucide-react';
import { getAdminSettings, checkLockout, registerFailedAttempt, resetAttempts } from '../lib/adminSettings';

export const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ username: '', password: '', securityAnswer: '' });
  const [error, setError] = useState('');
  const [lockout, setLockout] = useState({ locked: false, remaining: 0 });
  const [settings, setSettings] = useState(getAdminSettings());

  useEffect(() => {
    if (isOpen) {
      const status = checkLockout();
      setLockout(status);
      setSettings(getAdminSettings());
      setFormData({ username: '', password: '', securityAnswer: '' });
      setError('');
    }
  }, [isOpen]);

  // Timer for lockout countdown
  useEffect(() => {
    let timer;
    if (lockout.locked && lockout.remaining > 0) {
      timer = setInterval(() => {
        setLockout(prev => {
          if (prev.remaining <= 1) return { locked: false, remaining: 0 };
          return { ...prev, remaining: prev.remaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockout.locked]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (lockout.locked) return;

    const { credentials } = settings;

    if (
      formData.username === credentials.username &&
      formData.password === credentials.password &&
      formData.securityAnswer === credentials.securityAnswer
    ) {
      resetAttempts();
      onSuccess();
    } else {
      const attempts = registerFailedAttempt();
      const status = checkLockout();
      setLockout(status);
      
      if (status.locked) {
        setError(`تم قفل النظام مؤقتاً لمحاولات الدخول الخاطئة.`);
      } else {
        setError(`بيانات الدخول غير صحيحة. المحاولة ${attempts} من 3`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 border-t-4 border-red-600 animate-in zoom-in duration-200">
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <ShieldAlert size={24} />
            <h2>لوحة تحكم المدير</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {lockout.locked ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 animate-pulse">
                <Lock size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">النظام مقفل أمنياً</h3>
              <p className="text-red-600 font-bold text-lg dir-ltr">
                {Math.floor(lockout.remaining / 60)}:{String(lockout.remaining % 60).padStart(2, '0')}
              </p>
              <p className="text-gray-500 text-sm mt-2">يرجى الانتظار قبل المحاولة مرة أخرى</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              <div>
                <label className="block text-gray-600 text-xs font-bold mb-1 text-right px-1">اسم المستخدم</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full h-12 px-4 pl-10 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none text-right font-bold"
                    placeholder="Admin Username"
                  />
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 text-xs font-bold mb-1 text-right px-1">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full h-12 px-4 pl-10 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none text-right font-bold"
                    placeholder="••••••"
                  />
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <label className="block text-blue-800 text-xs font-bold mb-1 text-right">سؤال الأمان: {settings.credentials.securityQuestion}</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={formData.securityAnswer}
                    onChange={e => setFormData({...formData, securityAnswer: e.target.value})}
                    className="w-full h-10 px-3 pl-8 rounded-lg border border-blue-200 focus:border-blue-500 focus:outline-none text-right text-sm"
                    placeholder="الإجابة الأمنية"
                  />
                  <KeyRound size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-12 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 active:scale-95 transition-all mt-2"
              >
                دخول آمن
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
