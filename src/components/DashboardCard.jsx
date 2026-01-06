import React from 'react';

export const DashboardCard = ({ title, value, icon: Icon, color, onClick, children }) => {
  // التحقق مما إذا كان اللون بنظام Hex (يبدأ بـ #) لمعالجته بشكل صحيح
  const isHex = color?.startsWith('#');
  
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full relative overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer min-h-[130px]"
    >
      {/* الخط العلوي الملون */}
      <div 
        className={`absolute top-0 left-0 w-full h-1 ${!isHex ? (color || 'bg-blue-500') : ''}`} 
        style={isHex ? { backgroundColor: color } : {}}
      />
      
      {/* حاوية الأيقونة مع خلفية شفافة بنفس لون القسم */}
      <div 
        className={`p-3 rounded-full mb-3 ${!isHex ? (color ? color.replace('bg-', 'bg-opacity-10 text-') : 'bg-blue-50 text-blue-600') : ''}`}
        style={isHex ? { backgroundColor: `${color}15`, color: color } : {}}
      >
        {Icon && <Icon size={28} strokeWidth={2} />}
      </div>
      
      {/* العنوان */}
      <h3 className="text-gray-600 text-sm font-bold mb-1">{title}</h3>
      
      {/* القيمة (إن وجدت) */}
      {value && <p className="text-2xl font-bold text-gray-800 font-mono mt-1">{value}</p>}
      
      {/* محتوى إضافي (مثل الأزرار الصغيرة) */}
      {children && (
        <div className="mt-3 w-full flex justify-center">
          {children}
        </div>
      )}
    </div>
  );
};
