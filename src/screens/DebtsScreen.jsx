import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Plus, CreditCard, Trash2, X, Save } from 'lucide-react';
import { fetchData, insertData, deleteData } from '../lib/dataService'; 
import { Toast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const DebtsScreen = ({ onBack, currentUser }) => {
  const [debts, setDebts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [deleteDialog, setDeleteDialog] = useState({ show: false, id: null });

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'le' // 'le' (لنا) or '3le' (علينا)
  });

  // Refs for focus
  const nameRef = useRef(null);
  const amountRef = useRef(null);

  useEffect(() => {
    loadDebts();
  }, [currentUser]);

  const loadDebts = async () => {
    const data = await fetchData('debts');
    if (data) {
      const userItems = currentUser 
        ? data.filter(c => c.user_id == currentUser.id)
        : data.filter(c => !c.user_id);
      setDebts(userItems);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // 1. Validation & Focus
    if (!formData.name) {
      alert('يرجى إكمال جميع الحقول المطلوبة');
      if (nameRef.current) nameRef.current.focus();
      return;
    }
    if (!formData.amount) {
      alert('يرجى إكمال جميع الحقول المطلوبة');
      if (amountRef.current) amountRef.current.focus();
      return;
    }

    setLoading(true);
    const userId = currentUser ? currentUser.id : null;
    
    const { error, isOffline } = await insertData('debts', {
      name: formData.name,
      amount: formData.amount,
      type: formData.type,
      user_id: userId
    });

    setLoading(false);
    if (!error) {
      setToast({ show: true, message: isOffline ? 'تم الحفظ (وضع عدم الاتصال)' : 'تمت إضافة الدين بنجاح' });
      setShowModal(false);
      setFormData({ name: '', amount: '', type: 'le' });
      loadDebts();
    } else {
      alert('حدث خطأ أثناء الإضافة');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    const { error, isOffline } = await deleteData('debts', deleteDialog.id);
    if (!error) {
      setToast({ show: true, message: isOffline ? 'تم الحذف (وضع عدم الاتصال)' : 'تم الحذف بنجاح' });
      setDebts(debts.filter(d => d.id !== deleteDialog.id));
    }
    setDeleteDialog({ show: false, id: null });
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
      <ConfirmDialog 
        isOpen={deleteDialog.show}
        title="حذف السجل"
        message="هل أنت متأكد من حذف هذا السجل؟"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ show: false, id: null })}
      />

      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">الديون</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
        {debts.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 font-medium">لا توجد ديون مسجلة</div>
        ) : (
          <div className="flex flex-col gap-3">
            {debts.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between relative group">
                 <button 
                  onClick={() => setDeleteDialog({ show: true, id: item.id })}
                  className="absolute top-3 left-3 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${item.type === 'le' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {item.type === 'le' ? 'لنا' : 'علينا'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                  </div>
                </div>
                <div className="text-left pl-8">
                  <span className={`font-black text-lg dir-ltr ${item.type === 'le' ? 'text-green-700' : 'text-red-700'}`}>
                    {Number(item.amount).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-bold text-center">ج.س</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setShowModal(true)}
        className="absolute bottom-6 left-6 w-14 h-14 bg-[#c62828] text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-[#b71c1c] active:scale-90 transition-all z-20"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-200">
            <div className="bg-[#c62828] text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">إضافة دين جديد</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[#c62828] text-xs font-bold mb-1 text-right px-1">الاسم</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#c62828] focus:outline-none focus:ring-2 focus:ring-[#c62828]/50 text-right font-medium"
                  placeholder="اسم الشخص/الجهة"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[#c62828] text-xs font-bold mb-1 text-right px-1">المبلغ</label>
                <input
                  ref={amountRef}
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#c62828] focus:outline-none focus:ring-2 focus:ring-[#c62828]/50 text-right font-bold text-lg"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[#c62828] text-xs font-bold mb-1 text-right px-1">نوع الدين</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'le' })}
                    className={`flex-1 h-12 rounded-xl font-bold transition-colors ${formData.type === 'le' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                  >
                    لنا (دائن)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: '3le' })}
                    className={`flex-1 h-12 rounded-xl font-bold transition-colors ${formData.type === '3le' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                  >
                    علينا (مدين)
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#c62828] text-white h-14 rounded-xl font-bold text-lg shadow-md hover:bg-[#b71c1c] flex items-center justify-center gap-2 mt-2"
              >
                <Save size={24} />
                <span>حفظ</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
