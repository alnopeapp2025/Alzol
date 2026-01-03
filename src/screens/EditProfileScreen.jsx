import React from 'react';
import { ArrowRight, User } from 'lucide-react';

export const EditProfileScreen = ({ onBack, currentUser }) => {
  // تم التراجع عن التعديلات المعقدة (كلمة المرور، إعدادات المتجر)
  // العودة للواجهة البسيطة لعرض بيانات المستخدم فقط

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
        <h1 className="text-xl font-bold flex-1 text-center ml-10">حسابي</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col items-center pt-10">
        <div className="w-24 h-24 bg-[#00695c]/10 rounded-full flex items-center justify-center mb-6 text-[#00695c]">
          <User size={48} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {currentUser ? currentUser.username : 'مستخدم'}
        </h2>
        
        <p className="text-gray-500 font-medium">
          {currentUser ? 'تم تسجيل الدخول' : 'زائر'}
        </p>

        <div className="mt-10 p-4 bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-sm text-center">
          <p className="text-gray-400 text-sm">
            يمكنك إدارة بياناتك الأساسية من هنا قريباً.
          </p>
        </div>
      </div>
    </div>
  );
};
