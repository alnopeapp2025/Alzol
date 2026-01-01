import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { DashboardCard } from './components/DashboardCard';
import { screen1Data, screen2Data } from './data/menuItems';

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const pages = [screen1Data, screen2Data];

  const paginate = (newDirection) => {
    const nextPage = currentPage + newDirection;
    if (nextPage >= 0 && nextPage < pages.length) {
      setDirection(newDirection);
      setCurrentPage(nextPage);
    }
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeConfidenceThreshold = 10000;
    const swipePower = Math.abs(offset.x) * velocity.x;

    // RTL Swipe Logic:
    // Dragging Right (Positive X) -> Go to Previous Page (Index - 1)
    // Dragging Left (Negative X) -> Go to Next Page (Index + 1)
    
    if (swipePower < -swipeConfidenceThreshold) {
      // Swiped Left -> Next
      if (currentPage < pages.length - 1) paginate(1);
    } else if (swipePower > swipeConfidenceThreshold) {
      // Swiped Right -> Prev
      if (currentPage > 0) paginate(-1);
    }
  };

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? -300 : 300, // Inverted for RTL: Next page enters from Left (-x)
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? -300 : 300, // Inverted for RTL
        opacity: 0
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <TopBar />

      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div className="flex-1 relative w-full max-w-md mx-auto py-6 px-4">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 px-4 py-6 w-full h-full"
            >
              <div className="grid grid-cols-2 gap-4 h-full content-start">
                {pages[currentPage].map((item) => (
                  <DashboardCard 
                    key={item.id}
                    title={item.title}
                    icon={item.icon}
                    color={item.color}
                    onClick={() => console.log(`Clicked ${item.title}`)}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page Indicators */}
        <div className="flex justify-center gap-2 pb-6 z-10">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const dir = index > currentPage ? 1 : -1;
                setDirection(dir);
                setCurrentPage(index);
              }}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentPage ? 'bg-[#00695c]' : 'bg-gray-300'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </main>

      <BottomBar />
    </div>
  );
}

export default App;
