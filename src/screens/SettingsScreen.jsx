import React, { useState, useEffect } from 'react';
import { ArrowRight, Volume2, VolumeX, Globe, Check } from 'lucide-react';
import { playSound } from '../utils/soundManager';

export const SettingsScreen = ({ onBack }) => {
  const [settings, setSettings] = useState({
    barcodeSound: true,
    clickSound: true,
    currency: 'SDG'
  });

  useEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    if (newSettings.clickSound) playSound('click');
  };

  const toggleSetting = (key) => {
    saveSettings({ ...settings, [key]: !settings[key] });
  };

  const handleCurrencyChange = (e) => {
    saveSettings({ ...settings, currency: e.target.value });
  };

  const ToggleItem = ({ label, value, onChange }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${value ? 'bg-[#00695c]/10 text-[#00695c]' : 'bg-gray-100 text-gray-400'}`}>
          {value ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </div>
        <span className="font-bold text-gray-800">{label}</span>
      </div>
      <button 
        onClick={onChange}
        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${value ? 'bg-[#00695c]' : 'bg-gray-300'}`}
      >
        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${value ? '-translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">الضبط</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
        
        <h3 className="text-[#00695c] font-bold text-sm mb-3 px-2 border-r-4 border-[#00695c]">الأصوات</h3>
        <ToggleItem 
          label="صوت الباركود" 
          value={settings.barcodeSound} 
          onChange={() => toggleSetting('barcodeSound')} 
        />
        <ToggleItem 
          label="صوت نقر القائمة" 
          value={settings.clickSound} 
          onChange={() => toggleSetting('clickSound')} 
        />

        <h3 className="text-[#00695c] font-bold text-sm mb-3 mt-6 px-2 border-r-4 border-[#00695c]">العملة</h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <span className="font-bold text-gray-800">عملة التطبيق</span>
          </div>
          <select 
            value={settings.currency}
            onChange={handleCurrencyChange}
            className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-[#00695c] focus:border-[#00695c] block p-2.5 font-bold outline-none"
          >
            <option value="SDG">جنية سوداني</option>
            <option value="EGP">جنية مصري</option>
            <option value="SAR">ريال سعودي</option>
            <option value="AED">درهم إماراتي</option>
          </select>
        </div>

      </div>
    </div>
  );
};
