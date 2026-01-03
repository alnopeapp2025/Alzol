import React, { useState } from 'react';
import { ArrowRight, Trash2, Database, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';

export const SystemDataScreen = ({ onBack }) => {
  const [confirmDialog, setConfirmDialog] = useState({ show: false, action: null, title: '', message: '' });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [loading, setLoading] = useState(false);

  const handleDelete = async (table, successMessage) => {
    setLoading(true);
    let error = null;

    if (table === 'treasury') {
      // Zero out treasury (except 'كاش نقدا' maybe, or all? Prompt says "Zero Treasury (Banks 0)")
      // Assuming reset all to 0
      const { error: updateError } = await supabase
        .from('treasury_balances')
        .update({ amount: 0 })
        .neq('id', 0); // Update all rows
      error = updateError;
    } else if (table === 'all') {
      // Delete all data sequentially
      await supabase.from('sales').delete().neq('id', 0);
      await supabase.from('expenses').delete().neq('id', 0);
      await supabase.from('products').delete().neq('id', 0);
      await supabase.from('categories').delete().neq('id', 0);
      await supabase.from('treasury_balances').update({ amount: 0 }).neq('id', 0);
    } else {
      const { error: delError } = await supabase.from(table).delete().neq('id', 0);
      error = delError;
    }

    setLoading(false);
    setConfirmDialog({ show: false });

    if (!error) {
      setToast({ show: true, message: successMessage });
    } else {
      alert('حدث خطأ أثناء العملية');
    }
  };

  const ActionButton = ({ title, icon: Icon, color, onClick }) => (
    <button 
      onClick={onClick}
      disabled={loading}
      className="bg-white w-full p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all mb-3"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-gray-800 text-lg">{title}</span>
      </div>
      <Trash2 size={20} className="text-gray-300 group-hover:text-red-500 transition-colors" />
    </button>
  );

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans">
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
      
      <ConfirmDialog 
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => handleDelete(confirmDialog.action, confirmDialog.successMsg)}
        onCancel={() => setConfirmDialog({ show: false })}
      />

      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">إدارة البيانات</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3 items-start">
          <AlertTriangle className="text-red-500 shrink-0" />
          <p className="text-red-700 text-sm font-bold leading-relaxed">
            تنبيه: هذه الإجراءات نهائية ولا يمكن التراجع عنها. يرجى التأكد قبل الحذف.
          </p>
        </div>

        <ActionButton 
          title="حذف المنتجات" 
          icon={Database} 
          color="#d32f2f" 
          onClick={() => setConfirmDialog({
            show: true, 
            action: 'products', 
            title: 'حذف المنتجات', 
            message: 'هل أنت متأكد من حذف جميع المنتجات؟',
            successMsg: 'تم حذف المنتجات بنجاح'
          })} 
        />

        <ActionButton 
          title="حذف الأصناف" 
          icon={Database} 
          color="#f57c00" 
          onClick={() => setConfirmDialog({
            show: true, 
            action: 'categories', 
            title: 'حذف الأصناف', 
            message: 'هل أنت متأكد من حذف جميع الأصناف؟',
            successMsg: 'تم حذف الأصناف بنجاح'
          })} 
        />

        <ActionButton 
          title="حذف المبيعات" 
          icon={Database} 
          color="#1976d2" 
          onClick={() => setConfirmDialog({
            show: true, 
            action: 'sales', 
            title: 'حذف المبيعات', 
            message: 'هل أنت متأكد من حذف سجل المبيعات بالكامل؟',
            successMsg: 'تم حذف المبيعات بنجاح'
          })} 
        />

        <ActionButton 
          title="تصفير الخزينة (البنوك)" 
          icon={Database} 
          color="#7b1fa2" 
          onClick={() => setConfirmDialog({
            show: true, 
            action: 'treasury', 
            title: 'تصفير الخزينة', 
            message: 'هل أنت متأكد من تصفير جميع أرصدة البنوك؟',
            successMsg: 'تم تصفير الخزينة بنجاح'
          })} 
        />

        <div className="my-4 border-t border-gray-300/50"></div>

        <button 
          onClick={() => setConfirmDialog({
            show: true, 
            action: 'all', 
            title: 'حذف الكل (تهيئة النظام)', 
            message: 'تحذير خطير: سيتم حذف جميع البيانات (منتجات، مبيعات، مصروفات، خزينة) والعودة لنقطة الصفر. هل أنت متأكد تماماً؟',
            successMsg: 'تمت تهيئة النظام بنجاح'
          })}
          className="bg-red-600 text-white w-full p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          <Trash2 size={24} />
          <span className="font-bold text-lg">حذف جميع البيانات</span>
        </button>

      </div>
    </div>
  );
};
