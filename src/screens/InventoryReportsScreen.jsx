import React, { useState, useEffect } from 'react';
import { ArrowRight, Package, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { fetchData } from '../lib/dataService'; // Use Data Service for Offline Support

export const InventoryReportsScreen = ({ onBack }) => {
  const [stats, setStats] = useState({
    totalProductsCount: 0,
    totalPurchaseValue: 0,
    totalSellingValue: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateInventoryStats();
  }, []);

  const calculateInventoryStats = async () => {
    try {
      // Use fetchData to support offline mode
      const products = await fetchData('products');

      let totalCount = 0;
      let totalPurchase = 0;
      let totalSelling = 0;
      let lowStock = 0;

      products.forEach(p => {
        const qty = Number(p.quantity) || 0;
        const purchasePrice = Number(p.purchase_price) || 0;
        const sellingPrice = Number(p.selling_price) || 0;
        const alertLimit = Number(p.low_stock_alert) || 0;

        totalCount += qty;
        totalPurchase += (qty * purchasePrice);
        totalSelling += (qty * sellingPrice);

        if (qty <= alertLimit) {
          lowStock += 1;
        }
      });

      setStats({
        totalProductsCount: totalCount,
        totalPurchaseValue: totalPurchase,
        totalSellingValue: totalSelling,
        lowStockCount: lowStock
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, isAlert }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="text-right">
          <h3 className="text-gray-500 text-xs font-bold mb-1">{title}</h3>
          <div className={`text-xl font-black ${isAlert ? 'text-red-600' : 'text-gray-800'}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
            {!isAlert && title.includes('مجموع') && <span className="text-[10px] text-gray-400 mr-1 font-medium">ج.س</span>}
          </div>
        </div>
      </div>
    </div>
  );

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
        <h1 className="text-xl font-bold flex-1 text-center ml-10">تقارير المخزن</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
        <div className="flex flex-col gap-4">
          
          {/* Total Products Count */}
          <StatCard 
            title="عدد المنتجات (القطع)" 
            value={stats.totalProductsCount} 
            icon={Package} 
            color="#1976d2" 
          />

          {/* Total Purchase Value - Updated Label */}
          <StatCard 
            title="مجموع تكلفة شراء المخزون" 
            value={stats.totalPurchaseValue} 
            icon={DollarSign} 
            color="#f57c00" 
          />

          {/* Total Selling Value - Updated Label */}
          <StatCard 
            title="مجموع بيع المخزون" 
            value={stats.totalSellingValue} 
            icon={TrendingUp} 
            color="#2e7d32" 
          />

          {/* Low Stock Alert */}
          <StatCard 
            title="منتجات قليلة (تنبيه)" 
            value={stats.lowStockCount} 
            icon={AlertTriangle} 
            color="#d32f2f"
            isAlert={true}
          />

        </div>
      </div>
    </div>
  );
};
