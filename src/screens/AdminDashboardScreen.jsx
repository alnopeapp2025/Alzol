import React, { useState, useEffect } from 'react';
import { ArrowRight, Save, Shield, Database, Layout, Lock, Users, Activity } from 'lucide-react';
import { getAdminSettings, saveAdminSettings } from '../lib/adminSettings';
import { Toast } from '../components/Toast';

export const AdminDashboardScreen = ({ onBack }) => {
  const [settings, setSettings] = useState(getAdminSettings());
  const [activeTab, setActiveTab] = useState('plans'); // plans, features, security
  const [toast, setToast] = useState({ show: false, message: '' });

  const handleSave = () => {
    saveAdminSettings(settings);
    setToast({ show: true, message: 'تم حفظ إعدادات النظام بنجاح' });
  };

  const handlePlanChange = (plan, field, value) => {
    setSettings(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [plan]: {
          ...prev.plans[plan],
          [field]: Number(value)
        }
      }
    }));
  };

  const toggleFeature = (featureKey) => {
    setSettings(prev => ({
      ...prev,
      restrictedFeatures: {
        ...prev.restrictedFeatures,
        [featureKey]: !prev.restrictedFeatures[featureKey]
      }
    }));
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors border-b-4 ${
        activeTab === id 
          ? 'border-red-600 text-red-600 bg-red-50' 
          : 'border-transparent text-gray-500 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />

      {/* Header */}
      <div className="bg-gray-900 text-white h-16 flex items-center px-4 shadow-lg shrink-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-700 rounded-xl transition-colors">
          <ArrowRight size={24} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10 flex items-center justify-center gap-2">
          <Shield size={20} className="text-red-500" />
          لوحة تحكم المدير
        </h1>
        <button onClick={handleSave} className="p-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md active:scale-95">
          <Save size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white shadow-sm shrink-0">
        <TabButton id="plans" label="باقات الاشتراك" icon={Database} />
        <TabButton id="features" label="التحكم بالعناصر" icon={Layout} />
        <TabButton id="security" label="الأمان والدخول" icon={Lock} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        
        {/* PLANS TAB */}
        {activeTab === 'plans' && (
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Activity className="text-blue-600 shrink-0 mt-1" size={20} />
              <p className="text-blue-800 text-sm font-medium">
                هنا يمكنك تحديد الحدود القصوى لكل باقة يدوياً. سيتم تطبيق هذه القيود على المستخدمين بناءً على نوع اشتراكهم.
              </p>
            </div>

            {Object.entries(settings.plans).map(([key, plan]) => (
              <div key={key} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                  <h3 className="font-bold text-lg text-gray-800">{plan.label}</h3>
                  <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase">{key}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-xs font-bold mb-1">الحد الأقصى للمنتجات</label>
                    <input
                      type="number"
                      value={plan.maxProducts}
                      onChange={(e) => handlePlanChange(key, 'maxProducts', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none text-center font-bold dir-ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-bold mb-1">الحد الأقصى للفواتير</label>
                    <input
                      type="number"
                      value={plan.maxInvoices}
                      onChange={(e) => handlePlanChange(key, 'maxInvoices', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none text-center font-bold dir-ltr"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FEATURES TAB */}
        {activeTab === 'features' && (
          <div className="flex flex-col gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <Layout className="text-orange-600 shrink-0 mt-1" size={20} />
              <p className="text-orange-800 text-sm font-medium">
                حدد العناصر التي تتطلب اشتراكاً (Pro). عند تفعيل القفل، لن تظهر هذه العناصر للمستخدمين في الباقة المجانية.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {[
                { id: 'final-reports', label: 'التقارير النهائية' },
                { id: 'inventory-reports', label: 'تقارير المخزن' },
                { id: 'workers', label: 'العمال والرواتب' },
                { id: 'debts', label: 'دفتر الديون' },
                { id: 'wholesalers', label: 'تجار الجملة' },
                { id: 'sales', label: 'المبيعات (كاملة)' },
                { id: 'bank-transfer', label: 'تحويل بين البنوك' }, // New
                { id: 'create-backup', label: 'إنشاء نسخة احتياطية' } // New
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <span className="font-bold text-gray-700">{item.label}</span>
                  <button
                    onClick={() => toggleFeature(item.id)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${
                      settings.restrictedFeatures[item.id] ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                      settings.restrictedFeatures[item.id] ? '-translate-x-6' : 'translate-x-0'
                    }`}>
                      {settings.restrictedFeatures[item.id] && <Lock size={12} className="text-red-500" />}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">بيانات دخول المدير</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-500 text-xs font-bold mb-1">اسم المستخدم</label>
                  <input
                    type="text"
                    value={settings.credentials.username}
                    onChange={(e) => setSettings({...settings, credentials: {...settings.credentials, username: e.target.value}})}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none text-right font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-bold mb-1">كلمة المرور</label>
                  <input
                    type="text"
                    value={settings.credentials.password}
                    onChange={(e) => setSettings({...settings, credentials: {...settings.credentials, password: e.target.value}})}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none text-right font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">استعادة الحساب (سؤال الأمان)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-500 text-xs font-bold mb-1">سؤال الأمان</label>
                  <input
                    type="text"
                    value={settings.credentials.securityQuestion}
                    onChange={(e) => setSettings({...settings, credentials: {...settings.credentials, securityQuestion: e.target.value}})}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none text-right font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-bold mb-1">الإجابة الأمنية</label>
                  <input
                    type="text"
                    value={settings.credentials.securityAnswer}
                    onChange={(e) => setSettings({...settings, credentials: {...settings.credentials, securityAnswer: e.target.value}})}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none text-right font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
