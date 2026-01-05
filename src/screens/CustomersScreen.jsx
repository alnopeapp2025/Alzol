import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Trash2, Plus, Users } from 'lucide-react';
import { fetchData, insertData, deleteData } from '../lib/dataService'; 
import { Toast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const CustomersScreen = ({ onBack, currentUser }) => {
  const [customers, setCustomers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '' });
  const [deleteDialog, setDeleteDialog] = useState({ show: false, id: null });

  const inputRef = useRef(null);

  useEffect(() => {
    loadCustomers();
  }, [currentUser]);

  const loadCustomers = async () => {
    const data = await fetchData('customers');
    if (data) {
      const userItems = currentUser 
        ? data.filter(c => c.user_id == currentUser.id)
        : data.filter(c => !c.user_id);
      setCustomers(userItems);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    // 1. Validation & Focus
    if (!inputValue.trim()) {
      alert('يرجى إكمال جميع الحقول المطلوبة');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    // 2. Duplicate Check
    const isDuplicate = customers.some(c => c.name.trim() === inputValue.trim());
    if (isDuplicate) {
      alert('عفواً، هذا السجل موجود مسبقاً');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    setLoading(true);
    const userId = currentUser ? currentUser.id : null;
    
    const payload = { name: inputValue, user_id: userId };
    const { data, error, isOffline } = await insertData('customers', payload);

    if (error) {
      alert('حدث خطأ أثناء الإضافة');
    } else {
      showToast(isOffline ? 'تم الحفظ (وضع عدم الاتصال)' : 'تمت إضافة العميل بنجاح');
      if (data) loadCustomers();
      setInputValue('');
      if (inputRef.current) inputRef.current.focus();
    }
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    const { error, isOffline } = await deleteData('customers', deleteDialog.id);
    if (!error) {
      setCustomers(customers.filter(c => c.id !== deleteDialog.id));
      showToast(isOffline ? 'تم الحذف (وضع عدم الاتصال)' : 'تم حذف العميل بنجاح');
    }
    setDeleteDialog({ show: false, id: null });
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden relative font-sans">
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
      <ConfirmDialog 
        isOpen={deleteDialog.show}
        title="حذف العميل"
        message="هل أنت متأكد من حذف هذا العميل؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ show: false, id: null })}
      />

      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">العملاء</h1>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <form onSubmit={handleAdd} className="mb-6 shrink-0 flex flex-col gap-3">
          <div>
            <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">اسم العميل</label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب اسم العميل هنا..."
              className="w-full h-14 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right text-lg font-medium shadow-sm caret-[#00695c] placeholder-gray-400 bg-white"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00695c] text-white h-12 rounded-xl font-bold text-lg shadow-md hover:bg-[#005c4b] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Plus size={24} strokeWidth={3} />
            <span>أضف</span>
          </button>
        </form>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
          <div className="flex flex-col gap-3 pb-20">
            {customers.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow"
              >
                <button 
                  onClick={() => setDeleteDialog({ show: true, id: item.id })}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-90"
                >
                  <Trash2 size={20} strokeWidth={2} />
                </button>

                <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="font-bold text-gray-800 text-lg truncate px-2">
                    {item.name}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-[#c2185b]">
                        <Users size={20} />
                    </div>
                </div>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="text-center text-gray-400 mt-10 font-medium">
                لا يوجد عملاء مضافين حالياً
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
