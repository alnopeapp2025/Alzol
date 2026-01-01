import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Search, Plus, Save, ScanBarcode, X, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Helper for Beep Sound
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.value = 1500; // Frequency in Hz
    gainNode.gain.value = 0.1; // Volume

    oscillator.start();
    setTimeout(() => oscillator.stop(), 150); // Duration
  } catch (e) {
    console.error("Audio Context not supported", e);
  }
};

export const AddProductScreen = ({ onBack }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    fetchProducts();
  };

  // Filter products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      
      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center justify-between px-4 shadow-lg shrink-0 rounded-b-2xl z-20">
        {/* Right: Back Button */}
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>

        {/* Center: Title */}
        <h1 className="text-xl font-bold text-center mx-2">المنتجات</h1>

        {/* Left: Actions (Search & Plus) */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-xl transition-colors active:scale-95 ${showSearch ? 'bg-[#005c4b]' : 'hover:bg-[#005c4b]'}`}
          >
            <Search size={24} strokeWidth={2.5} />
          </button>
          <button 
            onClick={handleAddNew}
            className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Search Bar (Collapsible) */}
      <div className={`bg-[#FFF9C4] px-4 overflow-hidden transition-all duration-300 ease-in-out ${showSearch ? 'max-h-20 py-4' : 'max-h-0 py-0'}`}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="بحث عن منتج..."
          className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right text-base font-medium shadow-sm caret-[#00695c] placeholder-gray-400 bg-white"
        />
      </div>

      {/* List Header - Reordered for RTL: Product (Right) -> Qty -> Price -> Update (Left) */}
      <div className="px-4 py-2 flex items-center gap-2 text-[#00695c] font-bold text-sm border-b border-[#00695c]/10 shrink-0">
        <div className="flex-1 text-right pr-2">المنتج</div>
        <div className="w-16 text-center">الكمية</div>
        <div className="w-20 text-center">السعر</div>
        <div className="w-10 text-center">تحديث</div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 pt-2 custom-scrollbar">
        <div className="flex flex-col gap-3">
          {filteredProducts.map((item) => {
            // Low Stock Logic
            const isLowStock = (item.quantity || 0) <= (item.low_stock_alert || 0);
            
            return (
              <div key={item.id} className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex items-center gap-2 h-14">
                
                {/* Product Name (Rightmost in RTL) */}
                <div className={`flex-1 text-right truncate font-bold pr-2 text-sm flex items-center justify-end gap-1 ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                  {isLowStock && <ArrowDown size={18} strokeWidth={3} className="text-red-600 animate-bounce" />}
                  <span className="truncate">{item.name}</span>
                </div>

                {/* Quantity (Middle) */}
                <div className={`w-16 h-10 rounded-lg border flex items-center justify-center font-bold text-sm ${isLowStock ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  {item.quantity}
                </div>

                {/* Price (Left) */}
                <div className="w-20 h-10 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-gray-700 bg-gray-50 text-sm">
                  {item.selling_price}
                </div>

                {/* Update Button (Leftmost in RTL) */}
                <button 
                  onClick={() => handleEditClick(item)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-[#00695c] hover:text-white hover:shadow-md transition-all active:scale-95"
                >
                  <Save size={20} />
                </button>
              </div>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-400 mt-10 font-medium">
              لا توجد منتجات
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <ProductModal 
          product={editingProduct}
          onClose={handleModalClose} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};

// Combined Add/Edit Modal
const ProductModal = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    name: '', quantity: '', purchase_price: '', selling_price: '', barcode: '', low_stock_alert: '', category: 'عام'
  });

  useEffect(() => {
    // Fetch categories
    const fetchCats = async () => {
      const { data } = await supabase.from('categories').select('name');
      if (data) setCategories(data);
    };
    fetchCats();

    // If editing, fill data
    if (product) {
      setFormData({
        name: product.name || '',
        quantity: product.quantity || '',
        purchase_price: product.purchase_price || '',
        selling_price: product.selling_price || '',
        barcode: product.barcode || '',
        low_stock_alert: product.low_stock_alert || '',
        category: product.category || 'عام'
      });
    }
  }, [product]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('يرجى إدخال اسم المنتج');
    
    setLoading(true);
    let error;

    if (product) {
      // Update existing
      const { error: updateError } = await supabase
        .from('products')
        .update(formData)
        .eq('id', product.id);
      error = updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('products')
        .insert([formData]);
      error = insertError;
    }

    setLoading(false);
    if (!error) {
      alert(product ? 'تم تحديث المنتج' : 'تم حفظ المنتج');
      onSuccess();
    } else {
      alert('حدث خطأ في العملية');
    }
  };

  const handleScanSuccess = (decodedText) => {
    playBeep();
    setFormData(prev => ({ ...prev, barcode: decodedText }));
    setShowScanner(false);
  };

  const inputStyles = "w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right text-base font-medium shadow-sm caret-[#00695c] placeholder-gray-400 bg-white";
  const labelStyles = "block text-[#00695c] text-xs font-bold mb-1 text-right px-1";

  return (
    <div className="absolute inset-0 bg-[#FFF9C4] z-50 flex flex-col h-full animate-in slide-in-from-bottom duration-300">
      {/* Modal Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl">
        <button onClick={onClose} className="p-2 hover:bg-[#005c4b] rounded-xl"><X size={24} /></button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">
          {product ? 'تحديث بيانات المنتج' : 'إضافة منتج جديد'}
        </h1>
      </div>

      {/* Scanner Overlay */}
      {showScanner && (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center">
           <div className="w-full max-w-sm p-4">
             <div id="reader" className="bg-white rounded-xl overflow-hidden"></div>
             <ScannerComponent onScanSuccess={handleScanSuccess} />
           </div>
           <button 
             onClick={() => setShowScanner(false)}
             className="mt-8 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg"
           >
             إلغاء المسح
           </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
        <div><label className={labelStyles}>اسم المنتج</label><input name="name" value={formData.name} onChange={handleChange} className={inputStyles} placeholder="اسم المنتج..." /></div>
        <div><label className={labelStyles}>الكمية</label><input name="quantity" value={formData.quantity} onChange={handleChange} type="number" className={inputStyles} placeholder="0" /></div>
        <div className="flex gap-3">
          <div className="flex-1"><label className={labelStyles}>سعر البيع</label><input name="selling_price" value={formData.selling_price} onChange={handleChange} type="number" className={inputStyles} placeholder="0.00" /></div>
          <div className="flex-1"><label className={labelStyles}>سعر الشراء</label><input name="purchase_price" value={formData.purchase_price} onChange={handleChange} type="number" className={inputStyles} placeholder="0.00" /></div>
        </div>
        <div>
          <label className={labelStyles}>الباركود</label>
          <div className="relative">
            <input name="barcode" value={formData.barcode} onChange={handleChange} className={`${inputStyles} pl-12`} placeholder="scan..." />
            <button 
              type="button" 
              onClick={() => setShowScanner(true)}
              className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center text-[#00695c] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ScanBarcode size={24} />
            </button>
          </div>
        </div>
        <div><label className={labelStyles}>تنبيه المخزون</label><input name="low_stock_alert" value={formData.low_stock_alert} onChange={handleChange} type="number" className={inputStyles} placeholder="5" /></div>
        <div><label className={labelStyles}>الصنف</label><select name="category" value={formData.category} onChange={handleChange} className={`${inputStyles} appearance-none`}><option value="عام">عام</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
        <div className="flex-1"></div>
        <button type="submit" disabled={loading} className="w-full bg-[#00695c] text-white h-14 rounded-xl font-bold text-lg shadow-md hover:bg-[#005c4b] flex items-center justify-center gap-2 mt-2 shrink-0">
          <Save size={24} />
          <span>{product ? 'تحديث البيانات' : 'حفظ المنتج'}</span>
        </button>
      </form>
    </div>
  );
};

// Scanner Wrapper Component
const ScannerComponent = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    scanner.render((decodedText) => {
      onScanSuccess(decodedText);
      scanner.clear();
    }, (error) => {
      // ignore errors during scanning
    });

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [onScanSuccess]);

  return null;
};
