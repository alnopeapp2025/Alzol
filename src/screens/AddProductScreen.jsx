import React, { useState, useEffect, useRef } from 'react';
import { Save, Barcode, Image as ImageIcon, X, Camera } from 'lucide-react';
import { fetchData, insertData } from '../lib/dataService';
import { Toast } from '../components/Toast';
import { Html5Qrcode } from "html5-qrcode";

export const AddProductScreen = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Refs for focus
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const costRef = useRef(null);
  const stockRef = useRef(null);
  const categoryRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchData('categories');
      setCategories(data || []);
    };
    loadCategories();
  }, []);

  const handleSave = async () => {
    // Validation with Focus
    if (!name) {
      showErrorToast('يرجى إكمال جميع الحقول المطلوبة');
      nameRef.current?.focus();
      return;
    }
    if (!price) {
      showErrorToast('يرجى إكمال جميع الحقول المطلوبة');
      priceRef.current?.focus();
      return;
    }
    if (!cost) {
      showErrorToast('يرجى إكمال جميع الحقول المطلوبة');
      costRef.current?.focus();
      return;
    }
    if (!stock) {
      showErrorToast('يرجى إكمال جميع الحقول المطلوبة');
      stockRef.current?.focus();
      return;
    }
    if (!categoryId) {
      showErrorToast('يرجى إكمال جميع الحقول المطلوبة');
      categoryRef.current?.focus();
      return;
    }

    // Check duplicate name
    const existingProducts = await fetchData('products');
    const isDuplicate = existingProducts?.some(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
    
    if (isDuplicate) {
      showErrorToast('عفواً هذا السجل موجود مسبقاً');
      nameRef.current?.focus();
      return;
    }

    try {
      const newProduct = {
        name,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock),
        category_id: categoryId,
        barcode: barcode || Math.floor(Math.random() * 1000000000).toString(),
      };

      const saved = await insertData('products', newProduct);
      if (saved) {
        setToastMessage('تم إضافة المنتج بنجاح');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 800); // Faster success toast
        
        // Reset form
        setName('');
        setPrice('');
        setCost('');
        setStock('');
        setBarcode('');
      }
    } catch (error) {
      showErrorToast('حدث خطأ أثناء الحفظ');
    }
  };

  const showErrorToast = (msg) => {
    setToastMessage(msg);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="pb-20 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        {/* Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع</label>
            <input
              ref={priceRef}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-left"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">سعر التكلفة</label>
            <input
              ref={costRef}
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-left"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
            <input
              ref={stockRef}
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-left"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
            <select
              ref={categoryRef}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">اختر القسم</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Barcode Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-left"
              placeholder="scan or enter"
            />
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-gray-100 p-3 rounded-xl text-gray-600 hover:bg-gray-200"
            >
              <Barcode size={24} />
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          حفظ المنتج
        </button>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
           <div className="p-4 flex justify-between items-center text-white">
             <h3>مسح الباركود</h3>
             <button onClick={() => setShowScanner(false)}><X /></button>
           </div>
           <div id="reader" className="flex-1 bg-black"></div>
        </div>
      )}

      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
};
