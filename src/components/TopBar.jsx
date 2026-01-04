import React, { useState } from 'react';
import { Menu, Edit, LogOut, LogIn } from 'lucide-react';
import { SideMenu } from './SideMenu';
import { playSound } from '../utils/soundManager';
import { motion, AnimatePresence } from 'framer-motion';

export const TopBar = ({ onOpenRegistration, onNavigate, currentUser, onLogout, onOpenPro }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleMenuClick = () => {
    playSound('click');
    setIsMenuOpen(true);
  };

  const handleShareClick = () => {
    playSound('click');
    if (!currentUser) {
      onOpenRegistration();
    }
  };
  
  const handleUserIconClick = () => {
    playSound('click');
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    if (onLogout) onLogout();
  };

  const handleEditProfileClick = () => {
    setIsUserMenuOpen(false);
    onNavigate('edit-profile');
  };

  return (
    <>
      <div className="bg-[#00695c] text-white h-16 flex items-center justify-between px-4 shadow-lg sticky top-0 z-50 rounded-b-2xl">
        {/* Left Side (Visually Right in RTL) - Menu */}
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

        {/* Right Side (Visually Left in RTL) - Login/User */}
        <div className="flex items-center gap-2 relative">
          {currentUser ? (
            <div className="relative flex flex-col items-center justify-center">
              <button 
                onClick={handleUserIconClick}
                className="p-1 hover:bg-[#005c4b] rounded-full transition-colors active:scale-95 flex items-center justify-center relative z-10"
              >
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" 
                  alt="User" 
                  className="w-9 h-9 rounded-full border-2 border-white/50 shadow-sm bg-white"
                />
              </button>
              
              {/* Welcome Text - Thin Red - Positioned below icon */}
              <span className="absolute -bottom-5 w-max text-[10px] text-red-300 font-light tracking-wide bg-[#00695c]/80 px-1 rounded-md">
                مرحباً: {currentUser.username}
              </span>
              
              {/* User Dropdown */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setIsUserMenuOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 left-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
                    >
                      <button 
                        onClick={handleEditProfileClick}
                        className="w-full text-right px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
                      >
                        <Edit size={16} className="text-[#00695c]" />
                        تعديل حسابي
                      </button>
                      <button 
                        onClick={handleLogoutClick}
                        className="w-full text-right px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <LogOut size={16} />
                        تسجيل خروج
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={handleShareClick}
              className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95 flex items-center gap-1"
            >
              <LogIn size={24} strokeWidth={2} />
              <span className="text-xs font-bold hidden sm:inline">دخول</span>
            </button>
          )}
        </div>
      </div>

      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenRegistration={onOpenRegistration}
        onNavigate={onNavigate}
        onOpenPro={onOpenPro}
        currentUser={currentUser}
        onLogout={onLogout}
      />
    </>
  );
};
