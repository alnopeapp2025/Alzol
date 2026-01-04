import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, Plus, Minus, ShoppingCart, X, Save, Printer, Share2, Trash2, ScanBarcode, Settings } from 'lucide-react';
import { fetchData, insertData, updateData } from '../lib/dataService'; 
import { Toast } from '../components/Toast';
import html2pdf from 'html2pdf.js'; 

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

  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('رصيد بنكك');
  const [selectedInvoice, setSelectedInvoice] = useState(null); 
  const [currentUser, setCurrentUser] = useState(null);
  
  // Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [currentUser]); // Reload when user changes

  const loadData = async () => {
    await fetchInvoices();
    await fetchProducts();
  };

  const fetchInvoices = async () => {
    const data = await fetchData('sales');
    if (data) {
      // PRIVACY FILTER: Only show sales for this user
      const userSales = currentUser 
        ? data.filter(s => s.user_id == currentUser.id)
        : data.filter(s => !s.user_id);

      const grouped = {};
      userSales.forEach(sale => {
        const invId = sale.invoice_id || `LEGACY-${sale.id}`;
        if (!grouped[invId]) {
          grouped[invId] = {
            id: invId,
            invoice_id: invId,
            total_amount: 0,
            date: new Date(sale.created_at).toLocaleDateString('en-GB'),
            created_at: sale.created_at,
            method: 'غير محدد',
            items: []
          };
        }
        grouped[invId].total_amount += Number(sale.total_price);
        grouped[invId].items.push({
          name: sale.product_name,
          quantity: sale.quantity,
          selling_price: sale.total_price / sale.quantity
        });
      });
      const invoiceList = Object.values(grouped).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setInvoices(invoiceList);
    }
  };

  const fetchProducts = async () => {
    const data = await fetchData('products');
    if (data) {
      // PRIVACY FILTER: Only show products for this user
      const userProducts = currentUser 
        ? data.filter(p => p.user_id == currentUser.id)
        : data.filter(p => !p.user_id);
      
      setProducts(userProducts.filter(p => p.quantity > 0));
    }
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
    let isOfflineTransaction = false;
    const userId = currentUser ? currentUser.id : null;

    // 1. Save Sales Records (Linked to User)
    for (const item of cart) {
      const { isOffline: saleOffline } = await insertData('sales', {
        product_name: item.name,
        quantity: item.quantity,
        total_price: item.selling_price * item.quantity,
        invoice_id: invoiceId,
        user_id: userId // Link to User
      });

      // 2. Update Product Quantity
      const productRef = products.find(p => p.id === item.id);
      const { isOffline: prodOffline } = await updateData('products', item.id, { 
        quantity: productRef.quantity - item.quantity 
      });
      
      if (saleOffline || prodOffline) isOfflineTransaction = true;
    }

    // 3. Update Treasury (PRIVATE & REAL-TIME)
    const treasuryData = await fetchData('treasury_balances');
    
    // Find bank by name AND user_id
    const balanceItem = treasuryData.find(d => 
      d.name === paymentMethod && (userId ? d.user_id == userId : !d.user_id)
    );

    if (balanceItem) {
      // Update existing bank balance
      const { isOffline: treasuryOffline } = await updateData('treasury_balances', balanceItem.id, { 
        amount: Number(balanceItem.amount) + totalAmount 
      });
      if (treasuryOffline) isOfflineTransaction = true;
    } else {
      // Create new private bank entry for this user
      console.warn("Bank not found for user, creating new entry:", paymentMethod);
      const { isOffline: createOffline } = await insertData('treasury_balances', {
        name: paymentMethod,
        amount: totalAmount,
        user_id: userId // Link to User
      });
      if (createOffline) isOfflineTransaction = true;
    }

    setLoading(false);
    
    const newInvoice = {
      id: invoiceId,
      date: new Date().toLocaleDateString('en-GB'),
      items: cart,
      total: totalAmount,
      method: paymentMethod
    };

    setSelectedInvoice(newInvoice);
    setShowModal(false);
    setShowInvoice(true);
    setCart([]);
    loadData(); // Refresh list
    
    if (isOfflineTransaction) {
      setToast({ show: true, message: 'تم حفظ العملية (وضع عدم الاتصال)' });
    }
  };

  // ... (Rest of the component: handleInvoiceClick, generatePDF, handlePrint, handleShare, Scanner Logic, Render) ...
  // Keeping the rest of the UI exactly as is, just ensuring the logic above is integrated.

  const handleInvoiceClick = (inv) => {
    const total = inv.total_amount || inv.items.reduce((s, i) => s + (i.selling_price * i.quantity), 0);
    setSelectedInvoice({
      ...inv,
      total: total,
      method: inv.method || 'غير محدد'
    });
    setShowInvoice(true);
  };

  const generatePDF = async () => {
    const element = document.getElementById('invoice-content');
    const opt = {
      margin: 0,
      filename: `invoice_${selectedInvoice.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' }
    };
    return html2pdf().set(opt).from(element);
  };

  const handlePrint = async () => {
    playBeep();
    window.print();
  };

  const handleShare = async () => {
    playBeep();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'فاتورة مبيعات',
          text: `فاتورة رقم #${selectedInvoice.id}\nالمبلغ: ${selectedInvoice.total.toLocaleString()}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح');
    }
  };

  const handleScanSuccess = useCallback((decodedText) => {
    playBeep();
    setShowScanner(false);
    setPermissionDenied(false);
    
    const product = products.find(p => p.barcode === decodedText);
    if (product) {
      if (showModal) {
         handleAddProductToCart(product.id);
         setToast({ show: true, message: `تم إضافة ${product.name}` });
      } else {
         setShowModal(true);
         setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i);
            return [...prev, {...product, quantity: 1}];
         });
         setToast({ show: true, message: `تم إضافة ${product.name}` });
      }
    } else {
      alert('المنتج غير موجود');
    }
  }, [products, showModal]);

  const handlePermissionError = useCallback(() => {
    setPermissionDenied(true);
  }, []);

  const handleCloseScanner = () => {
    setShowScanner(false);
    setPermissionDenied(false);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      <Toast 
        message={toast.message} 
        isVisible={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
      />

      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center justify-between px-4 shadow-lg shrink-0 rounded-b-2xl z-10 print:hidden">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        
        <h1 className="text-xl font-bold flex-1 text-center mx-2 pt-1">المبيعات</h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setShowScanner(true); setPermissionDenied(false); }}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:scale-95 transition-all"
          >
            <ScanBarcode size={24} strokeWidth={2} />
          </button>
          
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

      {/* Scanner Overlay */}
      {showScanner && (
        <div className="absolute inset-0 z-[70] bg-black flex flex-col items-center justify-center p-4 print:hidden">
           <div className="w-full max-w-sm relative h-full flex flex-col justify-center">
             <button 
               onClick={handleCloseScanner}
               className="absolute top-4 right-4 z-20 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"
             >
               <X size={24} />
             </button>
             
             <div className="bg-black rounded-3xl overflow-hidden relative w-full aspect-[3/4] border-4 border-[#00695c] shadow-2xl">
                {!permissionDenied ? (
                  <NativeBarcodeScanner 
                    onScan={handleScanSuccess} 
                    onError={handlePermissionError} 
                  />
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
                      onClick={() => window.location.reload()}
                      className="bg-white text-[#00695c] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors w-full shadow-md"
                    >
                      تحديث الصفحة
                    </button>
                  </div>
                )}
             </div>
           </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="px-4 py-3 flex items-center gap-2 text-[#00695c] font-bold text-xs border-b border-[#00695c]/10 shrink-0 bg-[#FFF9C4] print:hidden">
        <div className="w-8 text-center">ت</div>
        <div className="flex-1 text-center">رقم الفاتورة</div>
        <div className="w-24 text-center">المبلغ</div>
        <div className="w-20 text-center">التاريخ</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 pt-2 custom-scrollbar print:hidden">
        {invoices.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 font-medium">
            لا توجد مبيعات مسجلة
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {invoices.map((inv, index) => (
              <button 
                key={inv.id} 
                onClick={() => handleInvoiceClick(inv)}
                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-2 h-12 w-full active:bg-gray-50 transition-colors"
              >
                <div className="w-8 text-center font-bold text-gray-400 text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 text-center font-bold text-gray-800 text-sm truncate">
                  #{inv.invoice_id.replace('LEGACY-', '')}
                </div>
                <div className="w-24 text-center font-black text-[#00695c] text-sm dir-ltr">
                  {inv.total_amount.toLocaleString()}
                </div>
                <div className="w-20 text-center font-medium text-gray-500 text-xs dir-ltr">
                  {inv.date}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Sales Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 print:hidden">
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
                <div className="flex gap-2">
                   <select
                    value={selectedProductId}
                    onChange={(e) => handleAddProductToCart(e.target.value)}
                    className="flex-1 h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium bg-white appearance-none"
                  >
                    <option value="">اختر المنتج...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (متاح: {p.quantity} | {p.selling_price})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => { setShowScanner(true); setPermissionDenied(false); }}
                    className="w-12 h-12 bg-[#00695c] text-white rounded-xl flex items-center justify-center active:scale-95"
                  >
                    <ScanBarcode size={24} />
                  </button>
                </div>
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

      {/* Invoice Modal */}
      {showInvoice && selectedInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 print:p-0 print:static">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden" onClick={() => setShowInvoice(false)} />
          <div className="bg-white w-full max-w-sm rounded-none sm:rounded-lg shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-200 print:w-full print:h-full print:fixed print:inset-0 print:shadow-none print:rounded-none">
            <div id="invoice-content" className="p-8 text-center bg-white">
              <div className="w-16 h-16 bg-[#00695c] rounded-full flex items-center justify-center mx-auto mb-4 text-white print:text-[#00695c] print:border-2 print:border-[#00695c]"><ShoppingCart size={32} /></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">فاتورة مبيعات</h2>
              <p className="text-gray-500 text-sm mb-6">رقم الفاتورة: #{selectedInvoice.id}</p>
              <div className="border-t border-b border-gray-200 py-4 mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2"><span>التاريخ:</span><span>{selectedInvoice.date}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>طريقة الدفع:</span><span>{selectedInvoice.method}</span></div>
              </div>
              <div className="flex flex-col gap-2 mb-6">
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="text-right"><span className="font-bold text-gray-800 block">{item.name}</span><span className="text-gray-400 text-xs">x{item.quantity}</span></div>
                    <span className="font-bold text-gray-800">{(item.selling_price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-8">
                <div className="flex justify-between items-center"><span className="font-bold text-xl text-gray-800">المجموع الكلي</span><span className="font-black text-2xl text-[#00695c]">{selectedInvoice.total.toLocaleString()}</span></div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 print:hidden">
               <div className="flex gap-3">
                <button onClick={handlePrint} className="flex-1 bg-gray-800 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900"><Printer size={20} /> طباعة</button>
                <button onClick={handleShare} className="flex-1 bg-[#00695c] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#005c4b]"><Share2 size={20} /> إرسال</button>
              </div>
              <button onClick={() => setShowInvoice(false)} className="mt-4 w-full text-gray-400 hover:text-gray-600 text-sm font-medium">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// NativeBarcodeScanner Component (Reused)
const NativeBarcodeScanner = ({ onScan, onError }) => {
  const videoRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      console.warn("BarcodeDetector not supported.");
    }

    let stream = null;
    let barcodeDetector = null;

    if ('BarcodeDetector' in window) {
      // @ts-ignore
      barcodeDetector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']
      });
    }

    const detectLoop = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && barcodeDetector) {
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            if (code) {
              onScan(code);
              return; 
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }
      requestRef.current = requestAnimationFrame(detectLoop);
    };

    const startCamera = async () => {
      try {
        const constraints = {
          audio: false,
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [{ focusMode: 'continuous' }]
          }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          requestRef.current = requestAnimationFrame(detectLoop);
        }
      } catch (err) {
        console.error("Camera Error", err);
        if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
          onError();
        }
      }
    };

    startCamera();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, onError]);

  return (
    <div className="relative w-full h-full bg-black">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <div className="absolute inset-0 border-2 border-[#00695c]/50 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 border-2 border-red-500/50 rounded-lg pointer-events-none box-border shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500 -mt-1 -ml-1"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500 -mt-1 -mr-1"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500 -mb-1 -ml-1"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500 -mb-1 -mr-1"></div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 opacity-50"></div>
      </div>
    </div>
  );
};
