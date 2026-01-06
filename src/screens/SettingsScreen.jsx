import React, { useState, useEffect } from 'react';
import { Save, Database, Shield, Edit3 } from 'lucide-react';
import { fetchData, insertData } from '../lib/dataService';
import { Toast } from '../components/Toast';

export const SettingsScreen = () => {
  const [showBankModal, setShowBankModal] = useState(false);
  const [bank1Name, setBank1Name] = useState('البنك 1');
  const [bank2Name, setBank2Name] = useState('البنك 2');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await fetchData('system_settings');
    if (settings) {
      const b1 = settings.find(s => s.key === 'bank_name_1');
      const b2 = settings.find(s => s.key === 'bank_name_2');
      if (b1) setBank1Name(b1.value);
      if (b2) setBank2Name(b2.value);
    }
  };

  const saveBankNames = async () => {
    await insertData('system_settings', { key: 'bank_name_1', value: bank1Name });
    await insertData('system_settings', { key: 'bank_name_2', value: bank2Name });
    setShowBankModal(false);
    setToastMessage('تم تحديث أسماء البنوك');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Existing Settings Content... */}
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800">إعدادات النظام</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <button 
            onClick={() => setShowBankModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Edit3 size={20} />
              </div>
              <div className="text-right">
                <h4 className="font-bold text-gray-800">تعديل أسماء البنوك</h4>
                <p className="text-xs text-gray-500">تخصيص مسميات الحسابات البنكية</p>
              </div>
            </div>
            <div className="text-gray-400">←</div>
          </button>
        </div>
      </div>

      {/* Bank Edit Modal */}
      {showBankModal &amp;&amp; (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-800">تعديل أسماء البنوك</h3>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">الاسم الأول (البنك 1)</label>
              <input 
                type="text" 
                value={bank1Name}
                onChange={(e) => setBank1Name(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">الاسم الثاني (البنك 2)</label>
              <input 
                type="text" 
                value={bank2Name}
                onChange={(e) => setBank2Name(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={saveBankNames}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold"
              >
                حفظ
              </button>
              <button 
                onClick={() => setShowBankModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast &amp;&amp; (
        <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};
