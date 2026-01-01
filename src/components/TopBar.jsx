import React from 'react';
import { Menu, Share2, Plus } from 'lucide-react';

export const TopBar = () => {
  return (
    <div className="bg-[#00695c] text-white h-14 flex items-center justify-between px-4 shadow-md sticky top-0 z-50">
      {/* 
        Note: Although the app is RTL, the reference image shows the Menu icon on the LEFT 
        and the Plus icon on the RIGHT. We use flex-row-reverse to achieve this visual layout 
        while keeping the DOM order logical, or simply force LTR direction for the bar icons.
        
        Here we will manually place them to match the image exactly.
      */}
      
      {/* Left Side (Visually) - Menu */}
      <button className="p-1 hover:bg-[#005c4b] rounded-full transition-colors">
        <Menu size={28} strokeWidth={2} />
      </button>

      {/* Center - Title */}
      <h1 className="text-xl font-bold flex-1 text-center mx-2 truncate">
        مخزنك - إدارة المخزن
      </h1>

      {/* Right Side (Visually) - Share & Plus */}
      <div className="flex items-center gap-3">
        <button className="p-1 hover:bg-[#005c4b] rounded-full transition-colors">
          <Share2 size={24} strokeWidth={2} />
        </button>
        <button className="p-1 hover:bg-[#005c4b] rounded-full transition-colors">
          <Plus size={32} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
