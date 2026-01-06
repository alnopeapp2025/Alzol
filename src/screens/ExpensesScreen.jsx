import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, Trash2, Search, Filter } from 'lucide-react';
import { fetchData, insertData, deleteData } from '../lib/dataService';
import { DashboardCard } from '../components/DashboardCard';
import { Toast } from '../components/Toast';

export const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [treasuryBalance, setTreasuryBalance] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesData, treasuryData] = await Promise.all([
        fetchData('expenses'),
        fetchData('treasury_log')
      ]);
      
      setExpenses(expensesData || []);
      
      // Calculate current treasury balance
      const balance = (treasuryData || []).reduce((acc, curr) => {
        return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
      }, 0);
      setTreasuryBalance(balance);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !amount) {
      setToastMessage('يرجى إكمال جميع الحقول المطلوبة');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    const expenseAmount = parseFloat(amount);
    
    // Check balance
    if (expenseAmount > treasuryBalance) {
      setToastMessage('عفواً الرصيد غير كافي');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    // Check duplicate
    const isDuplicate = expenses.some(
      ex => ex.title.toLowerCase() === title.trim().toLowerCase() && 
            ex.amount === expenseAmount && 
            ex.date === date
    );

    if (isDuplicate) {
      setToastMessage('عفواً هذا السجل موجود مسبقاً');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    try {
      const newExpense = {
        title,
        amount: expenseAmount,
        date,
      };

      const saved = await insertData('expenses', newExpense);
      if (saved) {
        // Add to treasury log as expense
        await insertData('treasury_log', {
          type: 'expense',
          amount: expenseAmount,
          description: `مصروف: ${title}`,
          date: new Date().toISOString()
        });

        setExpenses([saved, ...expenses]);
        setTreasuryBalance(prev => prev - expenseAmount);
        setShowModal(false);
        setTitle('');
        setAmount('');
        
        setToastMessage('تم إضافة المصروف بنجاح');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 800); // Faster success toast
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setToastMessage('حدث خطأ أثناء الحفظ');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleDelete = async (id, amount) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      try {
        const success = await deleteData('expenses', id);
        if (success) {
          setExpenses(expenses.filter(e => e.id !== id));
          // Refund to treasury (optional logic, usually deleting expense assumes refund or correction)
          setTreasuryBalance(prev => prev + amount);
          
          setToastMessage('تم الحذف بنجاح');
          setToastType('success');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 800);
        }
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 gap-4">
        <DashboardCard 
          title="مجموع المصروفات" 
          value={`${totalExpenses.toLocaleString()} ر.س`} 
          icon={DollarSign}
          color="bg-red-500"
        >
          {/* Moved Button Here */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all transform active:scale-95 flex items-center justify-center"
            title="إضافة مصروف جديد"
          >
            <Plus size={24} />
          </button>
        </DashboardCard>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Filter size={18} />
            سجل المصروفات
          </h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg border">
            {expenses.length} مصروف
          </span>
        </div>
        
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
              <Search size={32} className="opacity-20" />
              <p>لا توجد مصروفات مسجلة</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{expense.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Calendar size={12} />
                      <span>{expense.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-600 font-mono">
                    -{expense.amount.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleDelete(expense.id, expense.amount)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal &amp;&amp; (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">إضافة مصروف جديد</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المصروف</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="مثال: فاتورة كهرباء"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-mono text-left"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95 mt-2"
              >
                حفظ المصروف
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
