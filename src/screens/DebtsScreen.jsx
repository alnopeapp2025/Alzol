import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, CreditCard, Trash2, X, Save, Clock } from 'lucide-react';
import { fetchData, insertData, deleteData } from '../lib/dataService'; 
import { Toast } from '../components/Toast';
import { DashboardCard } from '../components/DashboardCard';

export const DebtsScreen = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Form
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
    // Update countdown every minute
    const interval = setInterval(() => {
      setDebts(prev => [...prev]); // Force re-render for countdowns
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchData('debts');
      setDebts(data || []);
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!clientName || !amount || !dueDate) {
      setToastMessage('يرجى إكمال جميع الحقول المطلوبة');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    try {
      const newDebt = {
        client_name: clientName,
        amount: parseFloat(amount),
        due_date: dueDate,
        created_at: new Date().toISOString()
      };

      const saved = await insertData('debts', newDebt);
      if (saved) {
        setDebts([saved, ...debts]);
        setShowModal(false);
        setClientName('');
        setAmount('');
        setDueDate(new Date().toISOString().split('T')[0]);
        
        setToastMessage('تم إضافة الدين بنجاح');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 800); // Faster success toast
      }
    } catch (error) {
      console.error('Error saving debt:', error);
      setToastMessage('حدث خطأ أثناء الحفظ');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من سداد/حذف هذا الدين؟')) {
      try {
        await deleteData('debts', id);
        setDebts(debts.filter(d => d.id !== id));
        setToastMessage('تم الحذف بنجاح');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 800);
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const getRemainingTime = (dateStr) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays &lt; 0) return 'متأخر';
    if (diffDays === 0) return 'اليوم';
    return `${diffDays} يوم`;
  };

  const totalDebts = debts.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-6 pb-20">
       <div className="grid grid-cols-1 gap-4">
        <DashboardCard 
          title="إجمالي الديون" 
          value={`${totalDebts.toLocaleString()} ر.س`} 
          icon={CreditCard}
          color="bg-orange-500"
        >
          {/* Moved Button Here */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg transition-all transform active:scale-95 flex items-center justify-center"
            title="إضافة دين جديد"
          >
            <Plus size={24} />
          </button>
        </DashboardCard>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800">سجل الديون</h3>
        </div>
        
        <div className="divide-y divide-gray-50">
          {debts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">لا توجد ديون مسجلة</div>
          ) : (
            debts.map((debt) => (
              <div key={debt.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <h4 className="font-bold text-gray-800">{debt.client_name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock size={12} />
                    <span>متبقي: {getRemainingTime(debt.due_date)}</span>
                    <span className="text-gray-300">|</span>
                    <span>استحقاق: {debt.due_date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-orange-600 font-mono">
                    {debt.amount.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleDelete(debt.id)}
                    className="text-gray-400 hover:text-green-500 p-1"
                    title="سداد"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal &amp;&amp; (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">إضافة دين جديد</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل / الجهة</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ السداد</label>
                <input
                  type="date"
                  value={dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg mt-2 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

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
