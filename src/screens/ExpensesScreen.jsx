import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Wallet, AlertCircle, Calendar, Save, X, Trash2, Edit } from 'lucide-react';
import { fetchData, insertData, updateData, deleteData } from '../lib/dataService'; // Use Data Service
import { Toast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ExpensesScreen = ({ onBack }) => {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Edit/Delete State
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    payment_method: 'رصيد بنكك' // Default
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchExpenses();
    await fetchBalances();
  };

  const fetchExpenses = async () => {
    const data = await fetchData('expenses');
    if (data) setExpenses(data);
  };

  const fetchBalances = async () => {
    const data = await fetchData('treasury_balances');
    if (data) {
      const balanceMap = {};
      data.forEach(item => {
        balanceMap[item.name] = item.amount;
      });
      setBalances(balanceMap);
    }
  };

  const getFormattedDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    const amount = parseFloat(formData.amount);
    
    if (!isEditing) {
      const balance = balances[formData.payment_method] || 0;
      if (amount > balance) {
        alert(`عفواً، الرصيد غير كافٍ في ${formData.payment_method}. الرصيد المتاح: ${balance.toLocaleString()}`);
        return;
      }
    }

    setLoading(true);
    let isOfflineOp = false;

    if (isEditing && selectedExpense) {
      const oldAmount = parseFloat(selectedExpense.amount);
      const diff = amount - oldAmount;

      const { error, isOffline } = await updateData('expenses', selectedExpense.id, {
        name: formData.name,
        amount: amount
      });

      if (!error) {
        if (isOffline) isOfflineOp = true;
        
        // Update Treasury
        const treasuryData = await fetchData('treasury_balances');
        const balanceItem = treasuryData.find(d => d.name === selectedExpense.payment_method);
        if (balanceItem) {
          await updateData('treasury_balances', balanceItem.id, {
            amount: Number(balanceItem.amount) - diff
          });
        }

        setToast({ show: true, message: isOffline ? 'تم التحديث (وضع عدم الاتصال)' : 'تم تحديث المصروف بنجاح' });
      } else {
        alert('حدث خطأ أثناء التحديث');
      }
    } else {
      const { error, isOffline } = await insertData('expenses', {
        name: formData.name,
        amount: amount,
        payment_method: formData.payment_method,
        expense_date: getFormattedDate()
      });

      if (!error) {
        if (isOffline) isOfflineOp = true;
        setToast({ show: true, message: isOffline ? 'تم الحفظ (وضع عدم الاتصال)' : 'تمت إضافة المصروف بنجاح' });
      } else {
        alert('حدث خطأ أثناء الحفظ');
      }
    }

    setLoading(false);
    setShowModal(false);
    setIsEditing(false);
    setSelectedExpense(null);
    setFormData({ name: '', amount: '', payment_method: 'رصيد بنكك' });
    
    // Refresh Data
    loadData();
  };

  const handleExpenseClick = (item) => {
    setSelectedExpense(item);
    setShowActionModal(true);
  };

  const handleEditClick = () => {
    if (!selectedExpense) return;
    setFormData({
      name: selectedExpense.name,
      amount: selectedExpense.amount,
      payment_method: selectedExpense.payment_method
    });
    setIsEditing(true);
    setShowModal(true);
    setShowActionModal(false);
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    const { error, isOffline } = await deleteData('expenses', selectedExpense.id);
    if (!error) {
      setToast({ show: true, message: isOffline ? 'تم الحذف (وضع عدم الاتصال)' : 'تم حذف المصروف بنجاح' });
      fetchExpenses();
    }
    setShowDeleteConfirm(false);
    setShowActionModal(false);
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      <Toast 
        message={toast.message} 
        isVisible={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
      />

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        title="حذف المصروف"
        message="هل أنت متأكد من حذف هذا المصروف؟"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">المصروفات</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
        {expenses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 mt-[-40px]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Wallet size={40} className="text-gray-300" />
            </div>
            <p className="font-bold text-lg text-center max-w-[200px]">
              لاتوجد مصروفات جديده اضغط + واضف مصروفاتك
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {expenses.map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleExpenseClick(item)}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                    <Wallet size={24} />
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {item.expense_date} • {item.payment_method}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="block font-black text-red-600 text-lg dir-ltr">
                    -{Number(item.amount).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">ج.س</span>
                </div>
              </button>
            ))}

            <div className="border-t border-dashed border-red-300 my-2 mx-2"></div>

            <div className="px-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-1 invisible"></div>
                 <div className="font-bold text-gray-800 text-lg">
                    مجموع المصروفات
                 </div>
              </div>
              <div className="text-left">
                <span className="block font-black text-red-600 text-xl dir-ltr">
                  -{totalExpenses.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">ج.س</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => {
          setIsEditing(false);
          setFormData({ name: '', amount: '', payment_method: 'رصيد بنكك' });
          setShowModal(true);
        }}
        className="absolute bottom-6 left-6 w-14 h-14 bg-[#00695c] text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-[#005c4b] active:scale-90 transition-all z-20"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowActionModal(false)} />
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 relative z-10 animate-in slide-in-from-top duration-200 shadow-xl">
            <h3 className="text-center font-bold text-gray-800 mb-4 text-lg">خيارات المصروف</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-red-50 text-red-600 h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100"
              >
                <Trash2 size={20} /> حذف
              </button>
              <button 
                onClick={handleEditClick}
                className="flex-1 bg-blue-50 text-blue-600 h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100"
              >
                <Edit size={20} /> تعديل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in slide-in-from-bottom duration-300">
            <div className="bg-[#00695c] text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">{isEditing ? 'تعديل المصروف' : 'إضافة مصروف جديد'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">اسم المصروف</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثلا كهرباء، فطور.. الخ"
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium placeholder-gray-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">المبلغ (جنية سوداني)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-bold text-lg placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">طريقة الدفع</label>
                <div className="relative">
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    disabled={isEditing}
                    className={`w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium appearance-none ${isEditing ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                  >
                    <option value="رصيد بنكك">رصيد بنكك</option>
                    <option value="رصيد بنك فيصل">رصيد بنك فيصل</option>
                    <option value="بنك أم درمان">بنك أم درمان</option>
                    <option value="بنك آخر">بنك آخر</option>
                  </select>
                  {!isEditing && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#00695c]">
                      <AlertCircle size={16} className="rotate-180" />
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#00695c] text-white h-14 rounded-xl font-bold text-lg shadow-md hover:bg-[#005c4b] flex items-center justify-center gap-2 mt-2"
              >
                <Save size={24} />
                <span>{isEditing ? 'تحديث المصروف' : 'حفظ المصروف'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
