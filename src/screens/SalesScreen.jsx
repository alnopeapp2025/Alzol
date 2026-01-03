import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Minus, ShoppingCart, X, Save, Printer, Share2, Trash2, ScanBarcode } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Toast } from '../components/Toast';

// Sound Utility
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "square";
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    oscillator.start();
    setTimeout(() => oscillator.stop(), 100);
  } catch (e) {
    console.error("Audio Context not supported", e);
  }
};

export const SalesScreen = ({ onBack }) => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Cart State
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('رصيد بنكك');
  const [lastInvoice, setLastInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    // Fetch raw sales data
    const { data } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // Group by invoice_id locally
      const grouped = {};
      data.forEach(sale => {
        // If legacy data has no invoice_id, group by ID or skip
        const invId = sale.invoice_id || `LEGACY-${sale.id}`;
        
        if (!grouped[invId]) {
          grouped[invId] = {
            invoice_id: invId,
            total_amount: 0,
            date: new Date(sale.created_at).toLocaleDateString('en-GB'), // DD/MM/YYYY
            created_at: sale.created_at
          };
        }
        grouped[invId].total_amount += Number(sale.total_price);
      });

      // Convert to array and sort
      const invoiceList = Object.values(grouped).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setInvoices(invoiceList);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').gt('quantity', 0);
    if (data) setProducts(data);
  };

  const handleAddProductToCart = (productId) => {
    if (!productId) return;
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        playBeep();
        setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        alert('الكمية المطلوبة غير متوفرة في المخزن');
      }
    } else {
      playBeep();
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setSelectedProductId('');
  };

  const updateQuantity = (id, delta) => {
    playBeep();
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        const productRef = products.find(p => p.id === id);
        if (newQty > productRef.quantity) return item;
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    playBeep();
    setLoading(true);

    const totalAmount = calculateTotal();
    const invoiceId = Math.floor(Math.random() * 1000000).toString();
    const saleDate = new Date().toLocaleString('ar-EG');

    // 1. Process each item
    for (const item of cart) {
      await supabase.from('sales').insert([{
        product_name: item.name,
        quantity: item.quantity,
        total_price: item.selling_price * item.quantity,
        invoice_id: invoiceId
      }]);

      const productRef = products.find(p => p.id === item.id);
      await supabase.from('products')
        .update({ quantity: productRef.quantity - item.quantity })
        .eq('id', item.id);
    }

    // 2. Update Treasury
    const { data: balanceData } = await supabase
      .from('treasury_balances')
      .select('amount')
      .eq('name', paymentMethod)
      .single();

    if (balanceData) {
      await supabase
        .from('treasury_balances')
        .update({ amount: balanceData.amount + totalAmount })
        .eq('name', paymentMethod);
    }

    setLoading(false);
    
    setLastInvoice({
      id: invoiceId,
      date: saleDate,
      items: cart,
      total: totalAmount,
      method: paymentMethod
    });

    setShowModal(false);
    setShowInvoice(true);
    setCart([]);
    fetchInvoices();
    fetchProducts();
  };

  const handlePrint = () => {
    playBeep();
    window.print();
  };

  const handleShare = () => {
    playBeep();
    if (navigator.share) {
      navigator.share({
        title: 'فاتورة مبيعات',
        text: `فاتورة رقم ${lastInvoice.id} - المبلغ: ${lastInvoice.total}`,
      }).catch(console.error);
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      <Toast 
        message={toast.message} 
        isVisible={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
      />

      {/* Header - Aligned Parallel */}
      <div className="bg-[#00695c] text-white h-16 flex items-center justify-between px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        
        {/* Title */}
        <h1 className="text-xl font-bold flex-1 text-center mx-2 pt-1">المبيعات</h1>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <ScanBarcode size={24} strokeWidth={2} />
          </div>
          
          {/* 3D Plus Button - Aligned with Title */}
          <button 
            onClick={() => setShowModal(true)}
            className="relative group w-10 h-10"
          >
            <div className="absolute inset-0 bg-[#004d40] rounded-xl translate-y-1"></div>
            <div className="absolute inset-0 bg-[#26a69a] rounded-xl flex items-center justify-center transition-transform active:translate-y-1 hover:-translate-y-0.5 border border-white/20">
              <Plus size={24} strokeWidth={3} />
            </div>
          </button>
        </div>
      </div>

      {/* Sales List Headers */}
      <div className="px-4 py-3 flex items-center gap-2 text-[#00695c] font-bold text-xs border-b border-[#00695c]/10 shrink-0 bg-[#FFF9C4]">
        <div className="w-8 text-center">ت</div>
        <div className="flex-1 text-center">رقم الفاتورة</div>
        <div className="w-24 text-center">المبلغ</div>
        <div className="w-20 text-center">التاريخ</div>
      </div>

      {/* Sales History List (Rows) */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 pt-2 custom-scrollbar">
        {invoices.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 font-medium">
            لا توجد مبيعات مسجلة
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {invoices.map((inv, index) => (
              <div key={inv.invoice_id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-2 h-12">
                {/* Sequence */}
                <div className="w-8 text-center font-bold text-gray-400 text-sm">
                  {index + 1}
                </div>
                
                {/* Invoice ID */}
                <div className="flex-1 text-center font-bold text-gray-800 text-sm truncate">
                  #{inv.invoice_id.replace('LEGACY-', '')}
                </div>

                {/* Amount */}
                <div className="w-24 text-center font-black text-[#00695c] text-sm dir-ltr">
                  {inv.total_amount.toLocaleString()}
                </div>

                {/* Date */}
                <div className="w-20 text-center font-medium text-gray-500 text-xs dir-ltr">
                  {inv.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sales Cart Modal (Unchanged Logic, just ensuring presence) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in slide-in-from-top duration-300 flex flex-col max-h-[85vh]">
            <div className="bg-[#00695c] text-white p-4 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold">إضافة مبيعات جديدة</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="block text-[#00695c] text-xs font-bold mb-2 text-right">بيع منتج جديد</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleAddProductToCart(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium bg-white appearance-none"
                >
                  <option value="">اختر المنتج لإضافته للسلة...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (متاح: {p.quantity} | سعر: {p.selling_price})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                      <div className="text-xs text-gray-500 flex gap-2 mt-1">
                        <span>سعر: {item.selling_price}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-white rounded shadow text-[#00695c] flex items-center justify-center active:scale-90"><Plus size={16} strokeWidth={3} /></button>
                      <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-white rounded shadow text-red-500 flex items-center justify-center active:scale-90"><Minus size={16} strokeWidth={3} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="mr-3 text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 border-t border-gray-200 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-600">المبلغ المطلوب:</span>
                <span className="font-black text-2xl text-[#00695c]">{calculateTotal().toLocaleString()} <span className="text-sm">ج.س</span></span>
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 text-xs font-bold mb-1 text-right">طريقة الدفع (البنك)</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-right bg-white">
                  <option value="رصيد بنكك">رصيد بنكك</option>
                  <option value="رصيد بنك فيصل">رصيد بنك فيصل</option>
                  <option value="بنك أم درمان">بنك أم درمان</option>
                  <option value="بنك آخر">بنك آخر</option>
                  <option value="كاش نقدا">كاش نقدا</option>
                </select>
              </div>
              <button onClick={handleCheckout} disabled={loading || cart.length === 0} className="w-full bg-[#00695c] text-white h-12 rounded-xl font-bold text-lg shadow-md hover:bg-[#005c4b] flex items-center justify-center gap-2 disabled:opacity-50"><Save size={20} /><span>{loading ? 'جاري المعالجة...' : 'إتمام البيع'}</span></button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal (Unchanged) */}
      {showInvoice && lastInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvoice(false)} />
          <div className="bg-white w-full max-w-sm rounded-none sm:rounded-lg shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-200 print:w-full print:h-full print:fixed print:inset-0">
            <div className="p-8 text-center bg-white">
              <div className="w-16 h-16 bg-[#00695c] rounded-full flex items-center justify-center mx-auto mb-4 text-white"><ShoppingCart size={32} /></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">فاتورة مبيعات</h2>
              <p className="text-gray-500 text-sm mb-6">رقم الفاتورة: #{lastInvoice.id}</p>
              <div className="border-t border-b border-gray-200 py-4 mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2"><span>التاريخ:</span><span>{lastInvoice.date}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>طريقة الدفع:</span><span>{lastInvoice.method}</span></div>
              </div>
              <div className="flex flex-col gap-2 mb-6">
                {lastInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="text-right"><span className="font-bold text-gray-800 block">{item.name}</span><span className="text-gray-400 text-xs">x{item.quantity}</span></div>
                    <span className="font-bold text-gray-800">{(item.selling_price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-8">
                <div className="flex justify-between items-center"><span className="font-bold text-xl text-gray-800">المجموع الكلي</span><span className="font-black text-2xl text-[#00695c]">{lastInvoice.total.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-3 print:hidden">
                <button onClick={handlePrint} className="flex-1 bg-gray-800 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900"><Printer size={20} /> طباعة</button>
                <button onClick={handleShare} className="flex-1 bg-[#00695c] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#005c4b]"><Share2 size={20} /> إرسال</button>
              </div>
              <button onClick={() => setShowInvoice(false)} className="mt-4 text-gray-400 hover:text-gray-600 text-sm font-medium print:hidden">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
