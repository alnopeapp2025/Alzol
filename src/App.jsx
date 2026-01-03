import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { DashboardCard } from './components/DashboardCard';
import { screen1Data, screen2Data } from './data/menuItems';
import { AddCategoryScreen } from './screens/AddCategoryScreen';
import { AddProductScreen } from './screens/AddProductScreen';
import { TreasuryScreen } from './screens/TreasuryScreen';
import { ExpensesScreen } from './screens/ExpensesScreen';
import { SalesScreen } from './screens/SalesScreen';
import { InventoryReportsScreen } from './screens/InventoryReportsScreen';
import { CalculatorModal } from './components/CalculatorModal';
import { AuthModal } from './components/AuthModal';
import { PrivacyPolicyScreen } from './screens/PrivacyPolicyScreen';
import { SystemDataScreen } from './screens/SystemDataScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { WorkersScreen } from './screens/WorkersScreen'; // Import Workers Screen
import { ProModal } from './components/ProModal';
import { playSound } from './utils/soundManager';

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTriggerMessage, setAuthTriggerMessage] = useState('');
  const [isProOpen, setIsProOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('app_user', JSON.stringify(user));
    setIsAuthOpen(false);
    setAuthTriggerMessage('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('app_user');
    setCurrentScreen('dashboard');
  };

  const handleOpenRegistration = (message = '') => {
    setAuthTriggerMessage(message);
    setIsAuthOpen(true);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('app_user', JSON.stringify(updatedUser));
  };

  const allItems = [...screen1Data, ...screen2Data];

  const handleCardClick = (title) => {
    playSound('click');
    
    if (title === 'الأصناف') {
      setCurrentScreen('add-category');
    } else if (title === 'المنتجات') {
      setCurrentScreen('add-product');
    } else if (title === 'الخزينة') {
      setCurrentScreen('treasury');
    } else if (title === 'المصروفات') {
      setCurrentScreen('expenses');
    } else if (title === 'المبيعات') {
      setCurrentScreen('sales');
    } else if (title === 'تقارير المخزن') {
      setCurrentScreen('inventory-reports');
    } else if (title === 'الآلة الحاسبة') {
      setIsCalculatorOpen(true);
    } else if (title === 'الضبط') { // Restored Settings
      setCurrentScreen('settings');
    } else if (title === 'العمال والرواتب') { // New Workers Screen
      setCurrentScreen('workers');
    } else {
      console.log(`Clicked ${title}`);
    }
  };

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
  };

  if (currentScreen === 'add-category') return <AddCategoryScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} onOpenRegistration={handleOpenRegistration} />;
  if (currentScreen === 'add-product') return <AddProductScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} onOpenRegistration={handleOpenRegistration} onOpenPro={() => setIsProOpen(true)} />;
  if (currentScreen === 'treasury') return <TreasuryScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'expenses') return <ExpensesScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'sales') return <SalesScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'inventory-reports') return <InventoryReportsScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'privacy-policy') return <PrivacyPolicyScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'system-data') return <SystemDataScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'settings') return <SettingsScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'edit-profile') return <EditProfileScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
  if (currentScreen === 'workers') return <WorkersScreen onBack={() => setCurrentScreen('dashboard')} />;

  return (
    <div className="min-h-screen bg-[#FFF9C4] flex flex-col font-sans">
      <CalculatorModal 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        triggerMessage={authTriggerMessage}
      />

      <ProModal
        isOpen={isProOpen}
        onClose={() => setIsProOpen(false)}
        currentUser={currentUser}
        onUpgradeSuccess={() => {
          const updated = {...currentUser, is_pro: true};
          handleUpdateUser(updated);
        }}
      />

      <TopBar 
        onOpenRegistration={() => handleOpenRegistration()} 
        onNavigate={handleNavigation}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenPro={() => setIsProOpen(true)}
      />

      <main className="flex-1 w-full max-w-md mx-auto py-6 px-4 pb-20">
        <div className="grid grid-cols-2 gap-5 content-start">
          {allItems.map((item) => (
            <DashboardCard 
              key={item.id}
              title={item.title}
              icon={item.icon}
              color={item.color}
              onClick={() => handleCardClick(item.title)}
            />
          ))}
        </div>
      </main>

      <BottomBar />
    </div>
  );
}

export default App;
