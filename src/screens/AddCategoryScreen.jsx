import React, { useState, useRef } from 'react';
import { Save } from 'lucide-react';
import { insertData, fetchData } from '../lib/dataService';
import { Toast } from '../components/Toast';

export const AddCategoryScreen = () => {
  const [name, setName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const inputRef = useRef(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setToastMessage('يرجى إكمال جميع الحقول المطلوبة');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      inputRef.current?.focus();
      return;
    }

    // Check duplicate
    const categories = await fetchData('categories');
    const isDuplicate = categories?.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());

    if (isDuplicate) {
      setToastMessage('عفواً هذا السجل موجود مسبقاً');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      inputRef.current?.focus();
      return;
    }

    const saved = await insertData('categories', { name });
    if (saved) {
      setToastMessage('تم إضافة الصنف بنجاح');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 800); // Faster success toast
      setName('');
    } else {
      setToastMessage('حدث خطأ أثناء الحفظ');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">إضافة قسم جديد</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="مثال: مشروبات"
            autoFocus
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          حفظ
        </button>
      </div>
      {showToast &amp;&amp; (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
};
