import React from 'react';

export const DashboardCard = ({ title, icon: Icon, color, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="group relative w-full aspect-[4/3] rounded-2xl transition-all duration-150 outline-none select-none active:scale-[0.98]"
    >
      {/* 3D Depth Layer (The shadow/bottom part) */}
      <div 
        className="absolute inset-0 rounded-2xl translate-y-1.5"
        style={{ backgroundColor: color, opacity: 0.3 }}
      ></div>
      
      {/* Main Surface Layer */}
      <div 
        className="absolute inset-0 bg-white rounded-2xl border-2 flex flex-col items-center justify-center gap-3 p-3 transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-1"
        style={{ 
          borderColor: `${color}40`, // Light border matching the icon color
          boxShadow: `0 4px 12px ${color}15` // Subtle glow matching the icon color
        }}
      >
        {/* Icon Container */}
        <div 
          className="p-3 rounded-xl mb-1 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}10` }}
        >
          <Icon 
            size={36} 
            color={color} 
            strokeWidth={2} 
            className="drop-shadow-sm"
          />
        </div>

        <span className="text-gray-800 font-bold text-base md:text-lg text-center leading-tight">
          {title}
        </span>
      </div>
    </button>
  );
};
