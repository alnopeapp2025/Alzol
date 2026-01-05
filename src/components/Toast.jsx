import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

export const Toast = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      // تم تعديل الوقت إلى 1000 مللي ثانية (ثانية واحدة) حسب الطلب
      const timer = setTimeout(onClose, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-6 left-1/2 z-[200] bg-[#00695c] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 min-w-[300px] justify-center border border-[#004d40]"
        >
          <div className="bg-white/20 p-1 rounded-full">
            {type === 'error' ? <AlertCircle size={18} strokeWidth={3} /> : <Check size={18} strokeWidth={3} />}
          </div>
          <span className="font-bold text-sm">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
