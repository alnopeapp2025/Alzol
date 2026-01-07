import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLoginModal = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded credentials as per previous version
    if (username === 'admin' && password === 'password123' && securityCode === '2025') {
      onLogin();
      onClose();
      setUsername('');
      setPassword('');
      setSecurityCode('');
      setError('');
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-700"
      >
        <div className="bg-red-900/30 text-red-500 p-4 flex justify-between items-center border-b border-red-900/50">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck size={24} /> دخول المدير
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1 text-right px-1">اسم المستخدم</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 pl-10 rounded-xl bg-gray-800 border-2 border-gray-700 focus:border-red-500 focus:outline-none text-white text-right"
              />
              <User className="absolute left-3 top-3 text-gray-500" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1 text-right px-1">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pl-10 rounded-xl bg-gray-800 border-2 border-gray-700 focus:border-red-500 focus:outline-none text-white text-right"
              />
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1 text-right px-1">رمز الأمان</label>
            <input
              type="password"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-gray-800 border-2 border-gray-700 focus:border-red-500 focus:outline-none text-white text-center tracking-widest font-mono text-lg"
              placeholder="****"
              maxLength={4}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-red-600 text-white h-14 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 flex items-center justify-center gap-2 mt-2 transition-colors"
          >
            دخول للوحة التحكم
          </button>
        </form>
      </motion.div>
    </div>
  );
};
