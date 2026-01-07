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
import { WorkersScreen } from './screens/WorkersScreen';
import { WholesalersScreen } from './screens/WholesalersScreen';
import { CustomersScreen } from './screens/CustomersScreen';
import { PurchasesScreen } from './screens/PurchasesScreen';
import { FinalReportsScreen } from './screens/FinalReportsScreen';
import { DebtsScreen } from './screens/DebtsScreen';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { playSound } from './utils/soundManager';
import { syncData } from './lib/dataService'; 

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [authTriggerMessage, setAuthTriggerMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('app_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      if (navigator.onLine) {
        syncData();
      }
    } catch (e) {
      console.error("App Init Error", e);
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

  const handleCardClick = (title) => {
    playSound('click');
    
    const screenMap = {
      'الأصناف': 'add-category',
      'المنتجات': 'add-product',
      'الخزينة': 'treasury',
      'المصروفات': 'expenses',
      'المبيعات': 'sales',
      'المشتريات': 'purchases',
      'تقارير المخزن': 'inventory-reports',
      'التقارير النهائية': 'final-reports',
      'الآلة الحاسبة': 'calculator',
      'عمال ورواتب': 'workers',
      'تجار الجملة': 'wholesalers',
      'العملاء': 'customers',
      'الديون': 'debts',
      'الإعدادات': 'settings'
    };

    if (title === 'الآلة الحاسبة') {
      setIsCalculatorOpen(true);
    } else if (screenMap[title]) {
      setCurrentScreen(screenMap[title]);
    }
  };

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
  };

  // Screen Rendering Logic
  const renderScreen = () => {
    switch (currentScreen) {
      case 'add-category': return <AddCategoryScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} onOpenRegistration={handleOpenRegistration} />;
      case 'add-product': return <AddProductScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} onOpenRegistration={handleOpenRegistration} />;
      case 'treasury': return <TreasuryScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
      case 'expenses': return <ExpensesScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'sales': return <SalesScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'purchases': return <PurchasesScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
      case 'inventory-reports': return <InventoryReportsScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
      case 'final-reports': return <FinalReportsScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
      case 'privacy-policy': return <PrivacyPolicyScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'system-data': return <SystemDataScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'settings': return <SettingsScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'edit-profile': return <EditProfileScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'workers': return <WorkersScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'wholesalers': return <WholesalersScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
      case 'customers': return <CustomersScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
      case 'debts': return <DebtsScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
      case 'admin-dashboard': return <AdminDashboardScreen onBack={() => setCurrentScreen('dashboard')} />;
      default: return (
        <main className="flex-1 w-full max-w-md mx-auto py-6 px-4 pb-20">
          <div className="grid grid-cols-2 gap-5 content-start">
            {[...screen1Data, ...screen2Data].map((item) => (
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
      );
    }
  };

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

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={() => setCurrentScreen('admin-dashboard')}
      />

      <TopBar 
        onOpenRegistration={() => handleOpenRegistration()} 
        onNavigate={handleNavigation}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
      />

      {renderScreen()}

      <BottomBar />
    </div>
  );
}

export default App;
