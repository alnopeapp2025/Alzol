import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Search, Plus, Save, ScanBarcode, X, ArrowDown, Trash2, CameraOff, Settings } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Html5Qrcode } from 'html5-qrcode'; 
import { Toast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = 1500;
    gainNode.gain.value = 0.1;
    oscillator.start();
    setTimeout(() => oscillator.stop(), 150);
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
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Optimization: Simple fetch, already efficient for small datasets
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

  const handleSuccess = (message) => {
    handleModalClose();
    fetchProducts();
    setToast({ show: true, message });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      <Toast 
        message={toast.message} 
        isVisible={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
      />

      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center justify-between px-4 shadow-lg shrink-0 rounded-b-2xl z-20">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold text-center mx-2">المنتجات</h1>
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

      {/* Search Bar */}
      <div className={`bg-[#FFF9C4] px-4 overflow-hidden transition-all duration-300 ease-in-out ${showSearch ? 'max-h-20 py-4' : 'max-h-0 py-0'}`}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="بحث عن منتج..."
          className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right text-base font-medium shadow-sm caret-[#00695c] placeholder-gray-400 bg-white"
        />
      </div>

      {/* List Header */}
      <div className="px-4 py-2 flex items-center gap-2 text-[#00695c] font-bold text-sm border-b border-[#00695c]/10 shrink-0">
        <div className="flex-1 text-center pr-2">المنتج</div>
        <div className="w-16 text-center">الكمية</div>
        <div className="w-20 text-center">السعر</div>
        <div className="w-10 text-center">تحديث</div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 pt-2 custom-scrollbar">
        <div className="flex flex-col gap-3">
          {filteredProducts.map((item) => {
            const isLowStock = (item.quantity || 0) <= (item.low_stock_alert || 0);
            return (
              <div key={item.id} className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex items-center gap-2 h-14">
                <div className={`flex-1 text-center truncate font-bold pr-2 text-sm flex items-center justify-center gap-1 ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                  {isLowStock && <ArrowDown size={18} strokeWidth={3} className="text-red-600 animate-bounce" />}
                  <span className="truncate">{item.name}</span>
                </div>
                <div className={`w-16 h-10 rounded-lg border flex items-center justify-center font-bold text-sm ${isLowStock ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  {item.quantity}
                </div>
                <div className="w-20 h-10 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-gray-700 bg-gray-50 text-sm">
                  {item.selling_price}
                </div>
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

      {/* Modal */}
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

const ProductModal = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', quantity: '', purchase_price: '', selling_price: '', barcode: '', low_stock_alert: '', category: 'عام'
  });

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('categories').select('id, name');
      if (data) setCategories(data);
    };
    fetchCats();

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
    if (!formData.name) return;
    
    setLoading(true);
    let error;

    if (product) {
      const { error: updateError } = await supabase
        .from('products')
        .update(formData)
        .eq('id', product.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([formData]);
      error = insertError;
    }

    setLoading(false);
    if (!error) {
      onSuccess(product ? 'تم تحديث البيانات بنجاح' : 'تمت إضافة المنتج بنجاح');
    } else {
      alert('حدث خطأ في العملية');
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setLoading(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);
    
    setLoading(false);
    if (!error) {
      onSuccess('تم حذف المنتج بنجاح');
    } else {
      alert('حدث خطأ أثناء الحذف');
    }
    setShowDeleteConfirm(false);
  };

  // Memoized handlers to prevent re-renders and scanner loops
  const handleScanSuccess = useCallback((decodedText) => {
    playBeep();
    setFormData(prev => ({ ...prev, barcode: decodedText }));
    setShowScanner(false);
    setPermissionDenied(false);
  }, []);

  const handlePermissionError = useCallback(() => {
    setPermissionDenied(true);
  }, []);

  const isPriceInvalid = Number(formData.selling_price) < Number(formData.purchase_price) && formData.selling_price && formData.purchase_price;

  const inputStyles = "w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right text-base font-medium shadow-sm caret-[#00695c] placeholder-gray-400 bg-white";
  const labelStyles = "block text-[#00695c] text-xs font-bold mb-1 text-right px-1";

  return (
    <div className="absolute inset-0 bg-[#FFF9C4] z-50 flex flex-col h-full animate-in slide-in-from-bottom duration-300">
      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        title="حذف المنتج"
        message="هل أنت متأكد من حذف هذا المنتج؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl">
        <button onClick={onClose} className="p-2 hover:bg-[#005c4b] rounded-xl"><X size={24} /></button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">
          {product ? 'تحديث بيانات المنتج' : 'إضافة منتج جديد'}
        </h1>
      </div>

      {showScanner && (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center p-4">
           <div className="w-full max-w-sm relative">
             <button 
               onClick={() => { setShowScanner(false); setPermissionDenied(false); }}
               className="absolute -top-12 right-0 z-20 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"
             >
               <X size={24} />
             </button>
             
             <div className="bg-black rounded-3xl overflow-hidden relative min-h-[350px] border-4 border-[#00695c] shadow-2xl">
                {!permissionDenied ? (
                  <>
                    <div id="reader" className="w-full h-full"></div>
                    <ScannerComponent 
                      onScanSuccess={handleScanSuccess} 
                      onPermissionError={handlePermissionError} 
                    />
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <p className="text-white/80 text-sm font-bold animate-pulse">جاري البحث عن باركود...</p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-center text-white">
                    <div className="w-20 h-20 bg-[#00695c] rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
                      <Settings size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">إعدادات الكاميرا</h3>
                    <p className="text-gray-300 text-base mb-8 leading-relaxed max-w-xs">
                      للمتابعة، يرجى السماح بالوصول للكاميرا من إعدادات المتصفح.
                    </p>
                    
                    <button 
                      onClick={() => {
                        // Attempt to open settings (best effort for mobile wrappers)
                        try {
                          window.open("chrome://settings/content/camera");
                        } catch (e) {
                          console.log(e);
                        }
                        // Reload as the primary action to re-trigger permission prompt
                        window.location.reload();
                      }}
                      className="bg-white text-[#00695c] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors w-full shadow-md"
                    >
                      فتح الإعدادات
                    </button>
                  </div>
                )}
             </div>
           </div>
        </div>
      )}

      <form onSubmit={handleSave} className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
        <div>
          <label className={labelStyles}>اسم المنتج</label>
          <div className="relative">
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className={`${inputStyles} ${product ? 'pl-12' : ''}`} 
              placeholder="اسم المنتج..." 
            />
            {product && (
              <button 
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div><label className={labelStyles}>الكمية</label><input name="quantity" value={formData.quantity} onChange={handleChange} type="number" className={inputStyles} placeholder="0" /></div>
        
        <div className="flex flex-col">
          {/* Reordered: Selling Price First (Right), Purchase Price Second (Left) */}
          <div className="flex gap-3">
            <div className="flex-1"><label className={labelStyles}>سعر البيع</label><input name="selling_price" value={formData.selling_price} onChange={handleChange} type="number" className={inputStyles} placeholder="0.00" /></div>
            <div className="flex-1"><label className={labelStyles}>سعر الشراء</label><input name="purchase_price" value={formData.purchase_price} onChange={handleChange} type="number" className={inputStyles} placeholder="0.00" /></div>
          </div>
          {isPriceInvalid && (
            <div className="text-red-500 text-xs font-bold text-right mt-1 px-1">
              (يجب أن يكون سعر البيع أكبر من أو يساوي سعر الشراء)
            </div>
          )}
        </div>

        <div>
          <label className={labelStyles}>الباركود</label>
          <div className="relative">
            <input name="barcode" value={formData.barcode} onChange={handleChange} className={`${inputStyles} pl-12`} placeholder="scan..." />
            <button 
              type="button" 
              onClick={() => { setShowScanner(true); setPermissionDenied(false); }}
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

// Updated Scanner Component with Error Handling and Memoization Support
const ScannerComponent = ({ onScanSuccess, onPermissionError }) => {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    // Start scanning immediately
    html5QrCode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        onScanSuccess(decodedText);
        html5QrCode.stop().catch(err => console.error("Stop failed", err));
      },
      (errorMessage) => {
        // ignore frame errors
      }
    ).catch(err => {
      // Check for permission errors specifically
      const isPermissionError = err?.name === 'NotAllowedError' || err?.name === 'NotFoundError' || err?.toString().includes('Permission');
      if (isPermissionError) {
        onPermissionError();
      } else {
        console.error("Error starting scanner", err);
      }
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Cleanup stop failed", err));
      }
      html5QrCode.clear();
    };
  }, [onScanSuccess, onPermissionError]);

  return null;
};
