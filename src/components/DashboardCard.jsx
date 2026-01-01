import React from 'react';

export const DashboardCard = ({ title, icon: Icon, color, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md border border-gray-200 aspect-[4/3] flex flex-col items-center justify-center gap-3 p-4 hover:shadow-lg hover:bg-gray-50 active:scale-95 transition-all duration-200 w-full"
    >
      <div className={`p-3 rounded-full bg-opacity-10`} style={{ backgroundColor: `${color}15` }}>
        {/* Render the icon with the specific color */}
        <Icon size={48} color={color} strokeWidth={1.5} absoluteStrokeWidth />
      </div>
      <span className="text-gray-900 font-bold text-lg text-center leading-tight">
        {title}
      </span>
    </button>
  );
};
