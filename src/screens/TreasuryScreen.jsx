import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const TreasuryScreen = ({ onBack }) => {
  const [totalTreasury, setTotalTreasury] = useState(0);
  
  // Initial Buttons (Excluding the new bank from buttons list as requested)
  const [treasuryData, setTreasuryData] = useState([
    { id: 'bok', name: 'رصيد بنكك', amount: 0, color: '#d32f2f', textColor: 'text-white' }, // Red
    { id: 'fib', name: 'رصيد بنك فيصل', amount: 0, color: '#fbc02d', textColor: 'text-gray-900' }, // Yellow
    { id: 'omd', name: 'بنك أم درمان', amount: 0, color: '#2e7d32', textColor: 'text-white' },
    { id: 'other', name: 'بنك آخر', amount: 0, color: '#7b1fa2', textColor: 'text-white' }
  ]);

  useEffect(() => {
    fetchData();
    
    const subscription = supabase
      .channel('treasury_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'treasury_balances' }, fetchData)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('treasury_balances').select('*');
    if (data && data.length > 0) {
      // 1. Update UI Buttons
      setTreasuryData(prevData => {
        return prevData.map(uiBank => {
          const dbBank = data.find(d => d.name === uiBank.name);
          return dbBank ? { ...uiBank, amount: dbBank.amount } : uiBank;
        });
      });

      // 2. Calculate Total Treasury (Sum of ALL bank balances from DB, including hidden ones)
      // Filter out 'كاش نقدا' if we only want banks, assuming 'كاش نقدا' is cash.
      // The prompt says "sum of bank balances only".
      const total = data
        .filter(d => d.name !== 'كاش نقدا') 
        .reduce((sum, item) => sum + Number(item.amount), 0);
      
      setTotalTreasury(total);
    }
  };

  const maxAmount = treasuryData.length > 0 ? Math.max(...treasuryData.map(b => b.amount), 1) : 1;

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans">
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
            إجمالي الخزينة (أرصدة البنوك)
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

        {/* Visual Data (Bar Chart) - Synced Colors */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[#00695c] font-bold mb-6 text-right border-r-4 border-[#00695c] pr-2">
            التحليل المالي
          </h3>
          
          <div className="flex items-end justify-around h-48 gap-2 px-2">
            {treasuryData.map((bank) => {
              const heightPercentage = (bank.amount / maxAmount) * 100;
              return (
                <div key={bank.id} className="flex flex-col items-center gap-2 w-full group">
                  <div className="relative w-full max-w-[40px] flex items-end h-full rounded-t-lg bg-gray-50 overflow-hidden">
                    <div 
                      className="w-full rounded-t-lg transition-all duration-1000 ease-out relative group-hover:opacity-90"
                      style={{ 
                        height: `${heightPercentage}%`, 
                        backgroundColor: bank.color // Synced: Bankak=Red, Faisal=Yellow
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {Number(bank.amount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 truncate w-full text-center">
                    {bank.name.split(' ')[1] || bank.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
