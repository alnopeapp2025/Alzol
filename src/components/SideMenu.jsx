import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, RotateCcw, Trash2, Settings, 
  Info, Star, Share2, Lock, Phone, X, LogIn 
} from 'lucide-react';

export const SideMenu = ({ isOpen, onClose, onOpenRegistration, onNavigate }) => {
  const menuGroups = [
    {
      title: 'بيانات العضوية',
      items: [
        { 
          icon: LogIn, 
          label: 'تسجيل الدخول / جديد', 
          color: '#1976d2',
          action: () => {
            onClose();
            if (onOpenRegistration) onOpenRegistration();
          }
        }
      ]
    },
    {
      title: 'بيانات النظام',
      items: [
        { icon: Save, label: 'إنشاء نسخة احتياطية', color: '#388e3c', action: () => onClose() }, // Placeholder
        { icon: RotateCcw, label: 'استعادة نسخة احتياطية', color: '#f57c00', action: () => onClose() }, // Placeholder
        { 
          icon: Trash2, 
          label: 'حذف البيانات', 
          color: '#d32f2f',
          action: () => {
            onClose();
            onNavigate('system-data');
          }
        }
      ]
    },
    {
      title: 'الإعدادات',
      items: [
        { 
          icon: Settings, 
          label: 'إعدادات النظام', 
          color: '#616161',
          action: () => {
            onClose();
            onNavigate('settings');
          }
        }
      ]
    },
    {
      title: 'حول التطبيق',
      items: [
        { icon: Info, label: 'من نحن', color: '#0288d1' },
        { icon: Star, label: 'قيم التطبيق', color: '#fbc02d' },
        { icon: Share2, label: 'مشاركة التطبيق', color: '#7b1fa2' },
        { 
          icon: Lock, 
          label: 'سياسة الخصوصية', 
          color: '#512da8',
          action: () => {
            onClose();
            onNavigate('privacy-policy');
          }
        },
        { icon: Trash2, label: 'حذف بياناتي', color: '#c2185b' },
        { icon: Phone, label: 'اتصل بنا', color: '#00796b' }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />
          
          {/* Drawer - Slides from Right (RTL standard) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[70] overflow-y-auto"
          >
            <div className="bg-[#00695c] text-white p-6 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-xl font-bold">القائمة الرئيسية</h2>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-6 pb-10">
              {menuGroups.map((group, idx) => (
                <div key={idx}>
                  <h3 className="text-[#00695c] font-bold text-sm mb-3 px-2 border-r-4 border-[#00695c]">
                    {group.title}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item, itemIdx) => (
                      <button 
                        key={itemIdx}
                        onClick={item.action}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-right w-full group active:bg-gray-100"
                      >
                        <div 
                          className="p-2 rounded-lg bg-gray-50 group-hover:bg-white shadow-sm transition-colors border border-gray-100"
                          style={{ color: item.color }}
                        >
                          <item.icon size={20} strokeWidth={2} />
                        </div>
                        <span className="text-gray-700 font-medium text-sm flex-1">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
