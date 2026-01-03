import React from 'react';
import { ArrowRight, Shield, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPolicyScreen = ({ onBack }) => {
  const PolicySection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center gap-2 mb-2 text-[#00695c]">
        <Icon size={20} />
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed text-justify">
        {children}
      </p>
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
        <h1 className="text-xl font-bold flex-1 text-center ml-10">سياسة الخصوصية</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
        <PolicySection title="جمع البيانات" icon={FileText}>
          نقوم بجمع البيانات الأساسية اللازمة لتشغيل التطبيق، مثل رقم الهاتف ومعلومات المنتجات والمبيعات التي تقوم بإدخالها. هذه البيانات تخزن محلياً أو على خوادمنا السحابية لضمان استمرارية الخدمة.
        </PolicySection>

        <PolicySection title="استخدام البيانات" icon={Eye}>
          تستخدم البيانات حصرياً لغرض إدارة مخزنك وحساباتك. لا نقوم بمشاركة بياناتك التجارية أو الشخصية مع أي طرف ثالث لأغراض إعلانية أو تسويقية.
        </PolicySection>

        <PolicySection title="حماية البيانات" icon={Shield}>
          نتبع معايير أمان عالية لحماية بياناتك من الوصول غير المصرح به. كلمات المرور تخزن بشكل مشفر، ونستخدم اتصالات آمنة لنقل البيانات.
        </PolicySection>

        <PolicySection title="حقوق المستخدم" icon={Lock}>
          لك الحق الكامل في الوصول إلى بياناتك، تعديلها، أو طلب حذفها نهائياً من نظامنا في أي وقت من خلال إعدادات التطبيق.
        </PolicySection>
      </div>
    </div>
  );
};
