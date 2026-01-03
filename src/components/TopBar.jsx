import React, { useState } from 'react';
import { Menu, Share2 } from 'lucide-react';
import { SideMenu } from './SideMenu';
import { playSound } from '../utils/soundManager';

export const TopBar = ({ onOpenRegistration, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    playSound('click');
    setIsMenuOpen(true);
  };

  return (
    <>
      <div className="bg-[#00695c] text-white h-16 flex items-center justify-between px-4 shadow-lg sticky top-0 z-50 rounded-b-2xl">
        {/* Left Side - Menu (Visually Right in RTL) */}
        <button 
          onClick={handleMenuClick}
          className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
        >
          <Menu size={28} strokeWidth={2} />
        </button>

        {/* Center - Title */}
        <h1 className="text-xl font-bold flex-1 text-center mx-2 truncate drop-shadow-md">
          مخزنك
        </h1>

        {/* Right Side - Share (Visually Left in RTL) */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
            <Share2 size={24} strokeWidth={2} />
          </button>
        </div>
      </div>

      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenRegistration={onOpenRegistration}
        onNavigate={onNavigate}
      />
    </>
  );
};
