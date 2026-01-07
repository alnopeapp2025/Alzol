import React, { useState, useEffect } from 'react';
import { ArrowRight, Save, Shield, Activity, Lock, Unlock, Database } from 'lucide-react';
import { getAdminSettings, saveAdminSettings } from '../lib/adminSettings';
import { Toast } from '../components/Toast';

export const AdminDashboardScreen = ({ onBack }) => {
  const [settings, setSettings] = useState(getAdminSettings());
  const [showToast, setShowToast] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    saveAdminSettings(settings);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const ToggleItem = ({ label, checked, onChange, icon: Icon }) => (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-3 text-gray-200">
        <div className={`p-2 rounded-lg ${checked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <Icon size={20} />
        </div>
        <span className="font-bold">{label}</span>
      </div>
      <button 
        onClick={onChange}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-green-500' : 'bg-gray-600'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? '-translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden font-sans">
      <div className="bg-gray-800 h-16 flex items-center px-4 shadow-lg shrink-0 border-b border-gray-700">
        <button onClick={onBack} className="p-2 hover:bg-gray-700 rounded-xl transition-colors">
          <ArrowRight size={24} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10 flex items-center justify-center gap-2">
          <Shield size={20} className="text-red-500" />
          لوحة تحكم المدير
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        <div className="space-y-3">
          <h3 className="text-gray-400 text-sm font-bold px-1">التحكم بالصلاحيات والعناصر</h3>
          <ToggleItem 
            label="تفعيل قسم المبيعات" 
            checked={settings.enable_sales} 
            onChange={() => handleToggle('enable_sales')}
            icon={Activity}
          />
          <ToggleItem 
            label="تفعيل قسم المصروفات" 
            checked={settings.enable_expenses} 
            onChange={() => handleToggle('enable_expenses')}
            icon={Activity}
          />
          <ToggleItem 
            label="تفعيل قسم الخزينة" 
            checked={settings.enable_treasury} 
            onChange={() => handleToggle('enable_treasury')}
            icon={Activity}
          />
          <ToggleItem 
            label="تفعيل التقارير" 
            checked={settings.enable_reports} 
            onChange={() => handleToggle('enable_reports')}
            icon={Activity}
          />
        </div>

        <div className="space-y-3">
            <h3 className="text-gray-400 text-sm font-bold px-1">إعدادات متقدمة</h3>
            <ToggleItem 
                label="السماح بالتحويل البنكي" 
                checked={settings.allow_bank_transfer} 
                onChange={() => handleToggle('allow_bank_transfer')}
                icon={Database}
            />
            <ToggleItem 
                label="السماح بالنسخ الاحتياطي" 
                checked={settings.allow_backup} 
                onChange={() => handleToggle('allow_backup')}
                icon={Database}
            />
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-red-600 hover:bg-red-700 text-white h-14 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4 transition-all active:scale-95"
        >
          <Save size={24} />
          حفظ الإعدادات
        </button>

      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl font-bold animate-in slide-in-from-bottom">
          تم حفظ الإعدادات بنجاح
        </div>
      )}
    </div>
  );
};
