import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, RotateCcw, Trash2, Settings, 
  Info, Star, Share2, Lock, Phone, X, LogIn, Crown, LogOut
} from 'lucide-react';
import { playSound } from '../utils/soundManager';
import { supabase } from '../lib/supabaseClient';
import { fetchData } from '../lib/dataService';

export const SideMenu = ({ isOpen, onClose, onOpenRegistration, onNavigate, onOpenPro, currentUser, onLogout }) => {
  const [lastBackup, setLastBackup] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchLastBackup();
    }
  }, [isOpen, currentUser]);

  const fetchLastBackup = async () => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const date = new Date(data[0].created_at);
        // تنسيق التاريخ والوقت
        const formattedDate = date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric' });
        const formattedTime = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        setLastBackup(`${formattedDate} ${formattedTime}`);
      }
    } catch (e) {
      console.error("Error fetching backup", e);
    }
  };

  const handleCreateBackup = async () => {
    if (!currentUser) {
      alert('يرجى تسجيل الدخول أولاً لإنشاء نسخة احتياطية');
      return;
    }
    setBackupLoading(true);
    
    try {
      // 1. جلب كافة البيانات من جميع الجداول
      // Fetch all data from all tables
      const [products, categories, sales, expenses, treasury, workers, wholesalers, customers, purchases] = await Promise.all([
        fetchData('products'),
        fetchData('categories'),
        fetchData('sales'),
        fetchData('expenses'),
        fetchData('treasury_balances'),
        fetchData('workers'),
        fetchData('wholesalers'),
        fetchData('customers'),
        fetchData('purchases')
      ]);

      // 2. فلترة البيانات الخاصة بالمستخدم الحالي فقط
      // Filter data to ensure only current user's data is backed up
      const filterByUser = (arr) => arr ? arr.filter(item => item.user_id == currentUser.id) : [];

      const backupPayload = {
        products: filterByUser(products),
        categories: filterByUser(categories),
        sales: filterByUser(sales),
        expenses: filterByUser(expenses),
        treasury: filterByUser(treasury),
        workers: filterByUser(workers),
        wholesalers: filterByUser(wholesalers),
        customers: filterByUser(customers),
        purchases: filterByUser(purchases),
        meta: {
          username: currentUser.username,
          backup_date: new Date().toISOString(),
          app_version: '1.0.0'
        }
      };

      // 3. إرسال البيانات إلى جدول النسخ الاحتياطي
      // Insert into backups table
      const { error } = await supabase.from('backups').insert([{
        user_id: currentUser.id,
        backup_data: backupPayload
      }]);

      if (!error) {
        await fetchLastBackup(); // تحديث النص فوراً
        alert('تم إنشاء النسخة الاحتياطية وحفظها في السحابة بنجاح ✅');
      } else {
        console.error("Backup Error:", error);
        alert('حدث خطأ أثناء حفظ النسخة الاحتياطية. يرجى المحاولة لاحقاً.');
      }
    } catch (e) {
      console.error("Backup Exception:", e);
      alert('فشلت العملية. تأكد من اتصالك بالإنترنت.');
    } finally {
      setBackupLoading(false);
    }
  };

  const menuGroups = [
    {
      title: 'بيانات العضوية',
      items: [
        currentUser ? { 
          icon: LogOut, 
          label: 'تسجيل خروج', 
          color: '#d32f2f',
          action: () => {
            onClose();
            if (onLogout) onLogout();
          }
        } : { 
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
        { 
          icon: Save, 
          label: backupLoading ? 'جاري النسخ...' : 'إنشاء نسخة احتياطية', 
          color: '#388e3c', 
          action: handleCreateBackup,
          description: lastBackup ? `آخر نسخة كانت في ${lastBackup}` : 'لم يتم إنشاء نسخة احتياطية بعد'
        },
        { icon: RotateCcw, label: 'استعادة نسخة احتياطية', color: '#f57c00', action: () => onClose() }, 
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
        },
        {
          icon: Crown,
          label: 'اشتراك pro',
          color: '#FFD700',
          isPro: true,
          action: () => {
            onClose();
            if (onOpenPro) onOpenPro();
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
                        onClick={() => {
                          playSound('click');
                          item.action && item.action();
                        }}
                        className={`flex flex-col p-3 hover:bg-gray-50 rounded-xl transition-colors text-right w-full group active:bg-gray-100 ${item.isPro ? 'animate-pulse' : ''}`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div 
                            className="p-2 rounded-lg bg-gray-50 group-hover:bg-white shadow-sm transition-colors border border-gray-100"
                            style={{ color: item.color }}
                          >
                            <item.icon size={20} strokeWidth={2} />
                          </div>
                          <span className={`text-gray-700 font-medium text-sm flex-1 ${item.isPro ? 'text-yellow-600 font-bold' : ''}`}>
                            {item.label}
                          </span>
                        </div>
                        {item.description && (
                          <span className="text-[10px] text-gray-400 mr-12 mt-1 font-medium block">
                            {item.description}
                          </span>
                        )}
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
