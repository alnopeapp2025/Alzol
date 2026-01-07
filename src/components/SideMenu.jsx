import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, RotateCcw, Trash2, Settings, 
  Star, Share2, Lock, Phone, X, LogIn, LogOut, Mail
} from 'lucide-react';
import { playSound } from '../utils/soundManager';

export const SideMenu = ({ isOpen, onClose, onOpenRegistration, onNavigate, currentUser, onLogout }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteRequest = () => {
    const email = "Alnope2025delete@gmail.com";
    const subject = "طلب حذف بيانات الحساب";
    const body = `مرحباً فريق الدعم،%0D%0A%0D%0Aأرغب في حذف حسابي وكافة بياناتي من تطبيق مخزنك نهائياً.%0D%0A%0D%0Aبيانات الحساب:%0D%0Aاسم المستخدم/رقم الهاتف: ${currentUser?.username || 'غير مسجل'}%0D%0A%0D%0Aشكراً لكم.`;
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setShowDeleteModal(false);
  };

  const menuGroups = [
    {
      title: 'بيانات العضوية',
      items: [
        currentUser ? { 
          icon: LogOut, 
          label: 'تسجيل خروج', 
          color: '#d32f2f',
          action: () => { onClose(); if (onLogout) onLogout(); }
        } : { 
          icon: LogIn, 
          label: 'تسجيل الدخول / جديد', 
          color: '#1976d2',
          action: () => { onClose(); if (onOpenRegistration) onOpenRegistration(); }
        }
      ]
    },
    {
      title: 'بيانات النظام',
      items: [
        { 
          icon: Trash2, 
          label: 'إدارة البيانات (الحذف)', 
          color: '#d32f2f',
          action: () => { onClose(); onNavigate('system-data'); }
        }
      ]
    },
    {
      title: 'الإعدادات',
      items: [
        { icon: Settings, label: 'إعدادات النظام', color: '#616161', action: () => { onClose(); onNavigate('settings'); } },
      ]
    },
    {
      title: 'حول التطبيق',
      items: [
        { icon: Star, label: 'قيم التطبيق', color: '#fbc02d' },
        { icon: Share2, label: 'مشاركة التطبيق', color: '#7b1fa2' },
        { icon: Lock, label: 'سياسة الخصوصية', color: '#512da8', action: () => { onClose(); onNavigate('privacy-policy'); } },
        { 
          icon: Trash2, 
          label: 'حذف بياناتي', 
          color: '#c2185b',
          action: () => {
            if (!currentUser) { alert('يرجى تسجيل الدخول أولاً'); return; }
            setShowDeleteModal(true);
          }
        },
        { icon: Phone, label: 'اتصل بنا', color: '#00796b' }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[70] overflow-y-auto">
            <div className="bg-[#00695c] text-white p-6 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-xl font-bold">القائمة الرئيسية</h2>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X size={24} /></button>
            </div>
            <div className="p-4 flex flex-col gap-6 pb-10">
              {menuGroups.map((group, idx) => (
                <div key={idx}>
                  <h3 className="text-[#00695c] font-bold text-sm mb-3 px-2 border-r-4 border-[#00695c]">{group.title}</h3>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item, itemIdx) => (
                      <button key={itemIdx} onClick={() => { playSound('click'); item.action && item.action(); }} className="flex flex-col p-3 hover:bg-gray-50 rounded-xl transition-colors text-right w-full group active:bg-gray-100">
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white shadow-sm transition-colors border border-gray-100" style={{ color: item.color }}>
                            <item.icon size={20} strokeWidth={2} />
                          </div>
                          <span className="text-gray-700 font-medium text-sm flex-1">{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-3xl p-6 relative z-90 shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><Trash2 size={32} /></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">حذف بياناتي</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">نأسف لرؤيتك تغادر. لحذف حسابك وكافة بياناتك نهائياً من خوادمنا، يرجى الضغط أدناه لإرسال طلب الحذف الرسمي عبر البريد الإلكتروني.</p>
                <button onClick={handleDeleteRequest} className="w-full bg-red-500 text-white h-12 rounded-xl font-bold shadow-md hover:bg-red-600 flex items-center justify-center gap-2 active:scale-95 transition-transform"><Mail size={20} /><span>إرسال طلب الحذف</span></button>
                <button onClick={() => setShowDeleteModal(false)} className="mt-4 text-gray-400 text-sm font-medium hover:text-gray-600">إلغاء</button>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};
