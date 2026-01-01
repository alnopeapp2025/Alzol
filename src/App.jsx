import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { DashboardCard } from './components/DashboardCard';
import { screen1Data, screen2Data } from './data/menuItems';
import { AddCategoryScreen } from './screens/AddCategoryScreen';
import { AddProductScreen } from './screens/AddProductScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  // Combine all items into a single list
  const allItems = [...screen1Data, ...screen2Data];

  const handleCardClick = (title) => {
    if (title === 'الأصناف') {
      setCurrentScreen('add-category');
    } else if (title === 'المنتجات') {
      setCurrentScreen('add-product');
    } else {
      console.log(`Clicked ${title}`);
    }
  };

  if (currentScreen === 'add-category') {
    return <AddCategoryScreen onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'add-product') {
    return <AddProductScreen onBack={() => setCurrentScreen('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF9C4] flex flex-col font-sans">
      <TopBar />

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
