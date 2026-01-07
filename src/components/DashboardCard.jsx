import React from 'react';

export const DashboardCard = ({ title, value, icon: Icon, color, onClick, children }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full relative overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer min-h-[120px]"
    >
      {/* الشريط العلوي الملون */}
      <div 
        className="absolute top-0 left-0 w-full h-1" 
        style={{ backgroundColor: color || '#00695c' }}
      />
      
      {/* خلفية الأيقونة */}
      <div 
        className="p-3 rounded-full mb-3 transition-transform group-hover:scale-110 duration-300"
        style={{ 
          backgroundColor: color ? `${color}15` : '#e0f2f1', 
          color: color || '#00695c' 
        }}
      >
        {Icon && <Icon size={28} strokeWidth={2} />}
      </div>
      
      {/* العنوان */}
      <h3 className="text-gray-700 text-sm font-bold mb-1">{title}</h3>
      
      {/* القيمة الرقمية (إن وجدت) */}
      {value && (
        <p className="text-xl font-bold text-gray-800 font-mono mt-1 dir-ltr">
          {value}
        </p>
      )}
      
      {/* أزرار إضافية */}
      {children && (
        <div 
          className="mt-2 w-full flex justify-center" 
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
};
