import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { fetchData } from '../lib/dataService'; 

export const FinalReportsScreen = ({ onBack, currentUser }) => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    totalPurchases: 0,
    netProfit: 0
  });

  useEffect(() => {
    calculateStats();
  }, [currentUser]);

  const calculateStats = async () => {
    const sales = await fetchData('sales');
    const expenses = await fetchData('expenses');
    const purchases = await fetchData('purchases');

    // PRIVACY FILTER
    const userSales = currentUser ? sales.filter(i => i.user_id == currentUser.id) : sales.filter(i => !i.user_id);
    const userExpenses = currentUser ? expenses.filter(i => i.user_id == currentUser.id) : expenses.filter(i => !i.user_id);
    const userPurchases = currentUser ? purchases.filter(i => i.user_id == currentUser.id) : purchases.filter(i => !i.user_id);

    const totalSales = userSales.reduce((sum, item) => sum + Number(item.total_price), 0);
    const totalExpenses = userExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalPurchases = userPurchases.reduce((sum, item) => sum + Number(item.total_cost), 0);
    
    setStats({
      totalSales,
      totalExpenses,
      totalPurchases,
      netProfit: totalSales - (totalExpenses + totalPurchases)
    });
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between mb-3">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="text-right">
          <h3 className="text-gray-500 text-xs font-bold mb-1">{title}</h3>
          <div className="text-xl font-black text-gray-800 dir-ltr">
            {value.toLocaleString()} <span className="text-[10px] text-gray-400 font-medium">ج.س</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans">
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">التقارير النهائية</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
        <StatCard title="إجمالي المبيعات" value={stats.totalSales} icon={TrendingUp} color="#2e7d32" />
        <StatCard title="إجمالي المشتريات" value={stats.totalPurchases} icon={DollarSign} color="#f57c00" />
        <StatCard title="إجمالي المصروفات" value={stats.totalExpenses} icon={TrendingDown} color="#d32f2f" />
        
        <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
            <h3 className="text-gray-500 font-bold mb-2">صافي الربح / الخسارة</h3>
            <div className={`text-3xl font-black dir-ltr ${stats.netProfit >= 0 ? 'text-[#00695c]' : 'text-red-600'}`}>
              {stats.netProfit.toLocaleString()} <span className="text-sm text-gray-400">ج.س</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
