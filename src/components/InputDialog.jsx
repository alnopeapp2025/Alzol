import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const InputDialog = ({ isOpen, title, initialValue, onConfirm, onCancel }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) setValue(initialValue || '');
  }, [isOpen, initialValue]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative z-10 border-t-4 border-[#00695c]"
      >
        <h3 className="text-xl font-bold text-[#00695c] mb-4 text-center">{title}</h3>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] mb-6 text-right focus:outline-none focus:ring-2 focus:ring-[#00695c]/30 font-bold text-gray-700"
          autoFocus
          placeholder="اكتب هنا..."
        />
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button 
            onClick={() => onConfirm(value)}
            className="flex-1 py-3 rounded-xl bg-[#00695c] text-white font-bold shadow-md hover:bg-[#005c4b]"
          >
            حفظ
          </button>
        </div>
      </motion.div>
    </div>
  );
};
