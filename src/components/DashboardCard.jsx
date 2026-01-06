import React from 'react';

export const DashboardCard = ({ title, value, icon: Icon, color, children }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={`absolute top-0 left-0 w-full h-1 ${color || 'bg-blue-500'}`} />
      
      <div className={`p-3 rounded-full mb-3 ${color ? color.replace('bg-', 'bg-opacity-10 text-') : 'bg-blue-50 text-blue-600'}`}>
        {Icon && <Icon size={24} />}
      </div>
      
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 font-mono">{value}</p>
      
      {/* Render children (like buttons) directly below the value */}
      {children && (
        <div className="mt-3 w-full flex justify-center">
          {children}
        </div>
      )}
    </div>
  );
};
