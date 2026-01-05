import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, RefreshCw, Trash2, ArrowLeftRight, X, AlertCircle } from 'lucide-react';
import { fetchData, updateData, insertData } from '../lib/dataService'; 
import { Toast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const TreasuryScreen = ({ onBack }) => {
  const [totalTreasury, setTotalTreasury] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Modals State
  const [showZeroConfirm, setShowZeroConfirm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Transfer Form State
  const [transferData, setTransferData] = useState({
    fromBank: 'بنكك - بنك الخرطوم',
    toBank: 'رصيد بنك فيصل',
    amount: ''
  });

  // Initial Buttons - Updated Names
  const [treasuryData, setTreasuryData] = useState([
    { id: 'bok', name: 'بنكك - بنك الخرطوم', amount: 0, color: '#d32f2f', textColor: 'text-white', dbId: null }, 
    { id: 'fib', name: 'رصيد بنك فيصل', amount: 0, color: '#fbc02d', textColor: 'text-gray-900', dbId: null }, 
    { id: 'omd', name: 'بنك أم درمان', amount: 0, color: '#2e7d32', textColor: 'text-white', dbId: null }, 
    { id: 'cash', name: 'نقداً كاش', amount: 0, color: '#7b1fa2', textColor: 'text-white', dbId: null }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      loadData(user.id);
    } else {
      loadData(null);
    }
  }, []);

  const loadData = async (userId) => {
    const data = await fetchData('treasury_balances');
    
    if (data && data.length > 0) {
      const userBalances = userId 
        ? data.filter(d => d.user_id == userId)
        : data.filter(d => !d.user_id);

      setTreasuryData(prevData => {
        return prevData.map(uiBank => {
          const dbBank = userBalances.find(d => d.name === uiBank.name);
          return dbBank 
            ? { ...uiBank, amount: dbBank.amount, dbId: dbBank.id } 
            : { ...uiBank, amount: 0, dbId: null };
        });
      });

      const total = userBalances
        .reduce((sum, item) => sum + Number(item.amount), 0);
      
      setTotalTreasury(total);
    }
  };

  const handleZeroTreasury = async () => {
    setLoading(true);
    let errorOccurred = false;
    let isOfflineOp = false;

    // Loop through all banks and set to 0
    for (const bank of treasuryData) {
      if (bank.dbId) {
        const { error, isOffline } = await updateData('treasury_balances', bank.dbId, { amount: 0 });
        if (error) errorOccurred = true;
        if (isOffline) isOfflineOp = true;
      }
    }

    setLoading(false);
    setShowZeroConfirm(false);

    if (!errorOccurred) {
      // تحديث الواجهة فوراً لتظهر الأصفار
      setTreasuryData(prev => prev.map(bank => ({ ...bank, amount: 0 })));
      setTotalTreasury(0);
      
      setToast({ show: true, message: isOfflineOp ? 'تم التصفير (وضع عدم الاتصال)' : 'تم تصفير الخزينة بنجاح' });
      loadData(currentUser?.id);
    } else {
      alert('حدث خطأ أثناء التصفير');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const amount = Number(transferData.amount);
    
    if (!amount || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }
    
    if (transferData.fromBank === transferData.toBank) {
      alert('لا يمكن التحويل لنفس البنك');
      return;
    }

    const sourceBank = treasuryData.find(b => b.name === transferData.fromBank);
    const destBank = treasuryData.find(b => b.name === transferData.toBank);

    if (!sourceBank || !sourceBank.dbId || Number(sourceBank.amount) < amount) {
      alert('الرصيد غير كافٍ أو الحساب غير موجود');
      return;
    }

    setLoading(true);

    // 1. Deduct from Source
    const { error: err1, isOffline: off1 } = await updateData('treasury_balances', sourceBank.dbId, {
      amount: Number(sourceBank.amount) - amount
    });

    if (!err1) {
        // 2. Add to Destination
        if (destBank.dbId) {
            await updateData('treasury_balances', destBank.dbId, {
                amount: Number(destBank.amount) + amount
            });
        } else {
            await insertData('treasury_balances', {
                name: destBank.name,
                amount: amount,
                user_id: currentUser ? currentUser.id : null
            });
        }
        
        setToast({ show: true, message: (off1) ? 'تم التحويل (وضع عدم الاتصال)' : 'تم التحويل بنجاح' });
        setShowTransferModal(false);
        setTransferData({ ...transferData, amount: '' });
        loadData(currentUser?.id);
    } else {
        alert('فشلت عملية التحويل');
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
      
      <ConfirmDialog 
        isOpen={showZeroConfirm}
        title="تصفير الخزينة"
        message="هل أنت متأكد من تصفير جميع أرصدة البنوك؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleZeroTreasury}
        onCancel={() => setShowZeroConfirm(false)}
      />

      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">الخزينة</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
        {/* Total Treasury Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#00695c]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <h2 className="text-gray-500 font-bold mb-2 flex items-center justify-center gap-2">
            <TrendingUp size={20} className="text-[#00695c]" />
            مجموع الأرصدة
          </h2>
          <div className="text-4xl font-black text-[#00695c] tracking-tight">
            {totalTreasury.toLocaleString()} <span className="text-lg text-gray-400 font-medium">ج.س</span>
          </div>
        </div>

        {/* Bank Buttons Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {treasuryData.map((bank) => (
            <button 
              key={bank.id}
              className="relative group h-24 rounded-2xl transition-all duration-150 active:scale-95 outline-none"
            >
              <div 
                className="absolute inset-0 rounded-2xl translate-y-1.5 opacity-40"
                style={{ backgroundColor: bank.color }} 
              ></div>
              <div 
                className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-2 border-2 transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-1 ${bank.textColor}`}
                style={{ 
                  backgroundColor: bank.color,
                  borderColor: 'rgba(255,255,255,0.2)'
                }}
              >
                <span className="font-bold text-sm opacity-90">{bank.name}</span>
                <span className="font-black text-lg dir-ltr">{Number(bank.amount).toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-4">
            <button 
                onClick={() => setShowTransferModal(true)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ArrowLeftRight size={24} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">تحويل بين البنوك</span>
                </div>
                <ArrowRight size={20} className="text-gray-300 rotate-180" />
            </button>

            <button 
                onClick={() => setShowZeroConfirm(true)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <Trash2 size={24} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">تصفير الخزينة</span>
                </div>
                <ArrowRight size={20} className="text-gray-300 rotate-180" />
            </button>
        </div>

      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTransferModal(false)} />
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-200">
            <div className="bg-[#00695c] text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ArrowLeftRight size={24} /> تحويل رصيد
              </h2>
              <button onClick={() => setShowTransferModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">من حساب (المصدر)</label>
                <div className="relative">
                    <select
                        value={transferData.fromBank}
                        onChange={(e) => setTransferData({ ...transferData, fromBank: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium bg-white appearance-none"
                    >
                        {treasuryData.map(b => <option key={b.id} value={b.name}>{b.name} ({Number(b.amount).toLocaleString()})</option>)}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <AlertCircle size={16} className="rotate-180" />
                    </div>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-gray-100 p-2 rounded-full border-2 border-white">
                      <ArrowLeftRight size={20} className="text-gray-400 rotate-90" />
                  </div>
              </div>

              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">إلى حساب (المستلم)</label>
                <div className="relative">
                    <select
                        value={transferData.toBank}
                        onChange={(e) => setTransferData({ ...transferData, toBank: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-medium bg-white appearance-none"
                    >
                        {treasuryData.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <AlertCircle size={16} className="rotate-180" />
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-[#00695c] text-xs font-bold mb-1 text-right px-1">المبلغ المراد تحويله</label>
                <input
                  type="number"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right font-bold text-lg placeholder-gray-400"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#00695c] text-white h-14 rounded-xl font-bold text-lg shadow-md hover:bg-[#005c4b] flex items-center justify-center gap-2 mt-2"
              >
                <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'جاري التحويل...' : 'تأكيد التحويل'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
