import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, ShoppingCart, Save, X } from 'lucide-react';
import { fetchData, insertData, updateData } from '../lib/dataService'; 
import { Toast } from '../components/Toast';

export const PurchasesScreen = ({ onBack, currentUser }) => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    cost_price: '',
    payment_method: 'كاش نقدا'
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    const pData = await fetchData('products');
    if (pData) {
      const userProducts = currentUser 
        ? pData.filter(p => p.user_id == currentUser.id)
        : pData.filter(p => !p.user_id);
      setProducts(userProducts);
    }

    const purData = await fetchData('purchases');
    if (purData) {
      const userPurchases = currentUser 
        ? purData.filter(p => p.user_id == currentUser.id)
        : purData.filter(p => !p.user_id);
      setPurchases(userPurchases);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.quantity || !formData.cost_price) return;

    setLoading(true);
    const userId = currentUser ? currentUser.id : null;
    const product = products.find(p => p.id == formData.product_id);
    const totalCost = Number(formData.quantity) * Number(formData.cost_price);

    // 1. Insert Purchase Record
    const { isOffline } = await insertData('purchases', {
      product_name: product.name,
      quantity: formData.quantity,
      cost_price: formData.cost_price,
      total_cost: totalCost,
      payment_method: formData.payment_method,
      date: new Date().toLocaleDateString('en-GB'),
      user_id: userId
    });

    // 2. Update Product Quantity (Increase)
    await updateData('products', product.id, {
      quantity: Number(product.quantity) + Number(formData.quantity),
      purchase_price: formData.cost_price // Update cost price if changed
    });

    // 3. Deduct from Treasury
    const treasuryData = await fetchData('treasury_balances');
    const balanceItem = treasuryData.find(d => 
      d.name === formData.payment_method && (userId ? d.user_id == userId : !d.user_id)
    );

    if (balanceItem) {
      await updateData('treasury_balances', balanceItem.id, {
        amount: Number(balanceItem.amount) - totalCost
      });
    } else {
       // Create negative balance if not exists
       await insertData('treasury_balances', {
         name: formData.payment_method,
         amount: -totalCost,
         user_id: userId
       });
    }

    setLoading(false);
    setShowModal(false);
    setFormData({ product_id: '', quantity: '', cost_price: '', payment_method: 'كاش نقدا' });
    setToast({ show: true, message: isOffline ? 'تم الحفظ (وضع عدم الاتصال)' : 'تم تسجيل المشتريات بنجاح' });
    loadData();
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />

      <div className="bg-[#00695c] text-white h-16 flex items-center justify-between px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center mx-2">المشتريات</h1>
        <button onClick={() => setShowModal(true)} className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 pt-4 custom-scrollbar">
        {purchases.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 font-medium">لا توجد مشتريات مسجلة</div>
        ) : (
          <div className="flex flex-col gap-3">
            {purchases.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{item.product_name}</h3>
                  <div className="text-xs text-gray-500 flex gap-2 mt-1">
                    <span>الكمية: {item.quantity}</span>
                    <span>•</span>
                    <span>التكلفة: {item.cost_price}</span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="font-black text-orange-600 text-lg dir-ltr">
                    -{Number(item.total_cost).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-bold">ج.س</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-200">
            <div className="bg-[#00695c] text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">تسجيل مشتريات جديدة</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">المنتج</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none text-right bg-white"
                >
                  <option value="">اختر المنتج...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">الكمية</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] text-right" placeholder="0" />
                </div>
                <div className="flex-1">
                  <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">سعر الشراء (للقطعة)</label>
                  <input type="number" value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })} className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] text-right" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">طريقة الدفع (الخصم من)</label>
                <select value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] text-right bg-white">
                  <option value="كاش نقدا">كاش نقدا</option>
                  <option value="رصيد بنكك">رصيد بنكك</option>
                  <option value="رصيد بنك فيصل">رصيد بنك فيصل</option>
                  <option value="بنك أم درمان">بنك أم درمان</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#00695c] text-white h-14 rounded-xl font-bold text-lg shadow-md hover:bg-[#005c4b] flex items-center justify-center gap-2 mt-2">
                <Save size={24} /> <span>حفظ</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
