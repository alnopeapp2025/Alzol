import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Trash2, Edit, Plus } from 'lucide-react';
import { fetchData, insertData, deleteData, updateData } from '../lib/dataService'; 
import { Toast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputDialog } from '../components/InputDialog';

export const AddCategoryScreen = ({ onBack, currentUser }) => {
  const [categories, setCategories] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '' });
  const [deleteDialog, setDeleteDialog] = useState({ show: false, id: null });
  const [editDialog, setEditDialog] = useState({ show: false, id: null, name: '' });

  const inputRef = useRef(null);

  useEffect(() => {
    loadCategories();
  }, [currentUser]);

  const loadCategories = async () => {
    const data = await fetchData('categories');
    if (data) {
      const userCats = currentUser 
        ? data.filter(c => c.user_id == currentUser.id)
        : data.filter(c => !c.user_id);
      setCategories(userCats);
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
    const isDuplicate = categories.some(c => c.name.trim() === inputValue.trim());
    if (isDuplicate) {
      alert('عفواً، هذا السجل موجود مسبقاً');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    setLoading(true);
    const userId = currentUser ? currentUser.id : null;
    
    const payload = { name: inputValue, user_id: userId };
    const { data, error, isOffline } = await insertData('categories', payload);

    if (error) {
      alert('حدث خطأ أثناء الإضافة');
    } else {
      showToast(isOffline ? 'تم الحفظ (وضع عدم الاتصال)' : 'تمت إضافة الصنف بنجاح');
      if (data) {
         loadCategories();
      }
      setInputValue('');
      if (inputRef.current) inputRef.current.focus();
    }
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    const { error, isOffline } = await deleteData('categories', deleteDialog.id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== deleteDialog.id));
      showToast(isOffline ? 'تم الحذف (وضع عدم الاتصال)' : 'تم حذف الصنف بنجاح');
    }
    setDeleteDialog({ show: false, id: null });
  };

  const confirmEdit = async (newName) => {
    if (newName && newName !== editDialog.name) {
      const { error, isOffline } = await updateData('categories', editDialog.id, { name: newName });
      if (!error) {
        setCategories(categories.map(c => c.id === editDialog.id ? { ...c, name: newName } : c));
        showToast(isOffline ? 'تم التحديث (وضع عدم الاتصال)' : 'تم تحديث الصنف بنجاح');
      }
    }
    setEditDialog({ show: false, id: null, name: '' });
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden relative font-sans">
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
      <ConfirmDialog 
        isOpen={deleteDialog.show}
        title="حذف الصنف"
        message="هل أنت متأكد من حذف الصنف؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ show: false, id: null })}
      />
      <InputDialog
        isOpen={editDialog.show}
        title="تعديل اسم الصنف"
        initialValue={editDialog.name}
        onConfirm={confirmEdit}
        onCancel={() => setEditDialog({ show: false, id: null, name: '' })}
      />

      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">إضافة صنف</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <form onSubmit={handleAdd} className="mb-6 shrink-0 flex flex-col gap-3">
          <div>
            <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">اسم الصنف</label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب اسم الصنف هنا..."
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
            {categories.map((item) => (
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

                <span className="flex-1 text-center font-bold text-gray-800 text-lg truncate px-2">
                  {item.name}
                </span>

                <button 
                  onClick={() => setEditDialog({ show: true, id: item.id, name: item.name })}
                  className="p-2 text-[#00695c] hover:bg-[#e0f2f1] rounded-lg transition-colors active:scale-90"
                >
                  <Edit size={20} strokeWidth={2} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="text-center text-gray-400 mt-10 font-medium">
                لا توجد أصناف مضافة حالياً
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
