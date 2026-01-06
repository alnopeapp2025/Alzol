import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, XCircle } from 'lucide-react';

export const Toast = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      // إغلاق التنبيه تلقائياً بعد 2.5 ثانية للقراءة بوضوح
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // تحديد الألوان والأيقونة بناءً على نوع الرسالة
  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-600' : 'bg-[#00695c]';
  const borderColor = isError ? 'border-red-800' : 'border-[#004d40]';
  const Icon = isError ? XCircle : Check;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className={`fixed top-6 left-1/2 z-[200] ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] max-w-[90%] justify-center border-2 ${borderColor}`}
        >
          <div className="bg-white/20 p-2 rounded-full shrink-0">
            <Icon size={24} strokeWidth={3} />
          </div>
          <span className="font-bold text-base leading-tight text-center">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
