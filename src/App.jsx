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
import { ProModal } from './components/ProModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { playSound } from './utils/soundManager';
import { syncData } from './lib/dataService'; 
import { getAdminSettings } from './lib/adminSettings';
import { Briefcase, Lock } from 'lucide-react';

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTriggerMessage, setAuthTriggerMessage] = useState('');
  const [isProOpen, setIsProOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Admin Settings State
  const [adminSettings, setAdminSettings] = useState(getAdminSettings());

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (navigator.onLine) {
      syncData();
    }
    // Refresh settings on load
    setAdminSettings(getAdminSettings());
  }, [currentScreen]); // Refresh settings when navigating

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

  const handleAdminSuccess = () => {
    setIsAdminLoginOpen(false);
    setCurrentScreen('admin-dashboard');
  };

  // Filter items based on Admin Restrictions
  const allItems = [...screen1Data, ...screen2Data].map(item => {
    let finalItem = { ...item };
    
    // Check if feature is restricted by admin
    const featureKey = getFeatureKey(item.title);
    const isRestricted = adminSettings.restrictedFeatures[featureKey];
    const userIsPro = currentUser?.is_pro;

    if (isRestricted && !userIsPro) {
      finalItem.isLocked = true;
    }

    if (item.title === 'عمال ورواتب') {
      finalItem.icon = Briefcase;
    }
    return finalItem;
  });

  // Helper to map titles to keys
  function getFeatureKey(title) {
    const map = {
      'التقارير النهائية': 'final-reports',
      'تقارير المخزن': 'inventory-reports',
      'عمال ورواتب': 'workers',
      'الديون': 'debts',
      'تجار الجملة': 'wholesalers',
      'المبيعات': 'sales'
    };
    return map[title];
  }

  const handleCardClick = (title, isLocked) => {
    playSound('click');
    
    if (isLocked) {
      setIsProOpen(true); // Open Pro Modal if locked
      return;
    }

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
    } else if (title === 'المشتريات') {
      setCurrentScreen('purchases');
    } else if (title === 'تقارير المخزن') {
      setCurrentScreen('inventory-reports');
    } else if (title === 'التقارير النهائية') {
      setCurrentScreen('final-reports');
    } else if (title === 'الآلة الحاسبة') {
      setIsCalculatorOpen(true);
    } else if (title === 'عمال ورواتب') {
      setCurrentScreen('workers');
    } else if (title === 'تجار الجملة') {
      setCurrentScreen('wholesalers');
    } else if (title === 'العملاء') {
      setCurrentScreen('customers');
    } else if (title === 'الديون') {
      setCurrentScreen('debts');
    } else if (title === 'الإعدادات') {
      setCurrentScreen('settings');
    }
  };

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
  };

  // Screen Rendering Logic
  if (currentScreen === 'admin-dashboard') return <AdminDashboardScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'add-category') return <AddCategoryScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} onOpenRegistration={handleOpenRegistration} />;
  if (currentScreen === 'add-product') return <AddProductScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} onOpenRegistration={handleOpenRegistration} onOpenPro={() => setIsProOpen(true)} />;
  if (currentScreen === 'treasury') return <TreasuryScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'expenses') return <ExpensesScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'sales') return <SalesScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'purchases') return <PurchasesScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
  if (currentScreen === 'inventory-reports') return <InventoryReportsScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
  if (currentScreen === 'final-reports') return <FinalReportsScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
  if (currentScreen === 'privacy-policy') return <PrivacyPolicyScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'system-data') return <SystemDataScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'settings') return <SettingsScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'edit-profile') return <EditProfileScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
  if (currentScreen === 'workers') return <WorkersScreen onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'wholesalers') return <WholesalersScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
  if (currentScreen === 'customers') return <CustomersScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;
  if (currentScreen === 'debts') return <DebtsScreen onBack={() => setCurrentScreen('dashboard')} currentUser={currentUser} />;

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

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      <TopBar 
        onOpenRegistration={() => handleOpenRegistration()} 
        onNavigate={handleNavigation}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenPro={() => setIsProOpen(true)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
      />

      <main className="flex-1 w-full max-w-md mx-auto py-6 px-4 pb-20">
        <div className="grid grid-cols-2 gap-5 content-start">
          {allItems.map((item) => (
            <div key={item.id} className="relative">
              <DashboardCard 
                title={item.title}
                icon={item.icon}
                color={item.isLocked ? '#9e9e9e' : item.color} // Grey out if locked
                onClick={() => handleCardClick(item.title, item.isLocked)}
              />
              {item.isLocked && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow-md z-10 pointer-events-none">
                  <Lock size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <BottomBar />
    </div>
  );
}

export default App;
