import React, { useState } from 'react';
import { X, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CalculatorModal = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleClick = (value) => {
    setInput((prev) => prev + value);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    try {
      // Safe evaluation of the math expression
      // eslint-disable-next-line no-new-func
      const evalResult = Function('"use strict";return (' + input + ')')();
      setResult(evalResult.toString());
      setInput(evalResult.toString());
    } catch (error) {
      setResult('Error');
    }
  };

  if (!isOpen) return null;

  const buttons = [
    { label: 'C', action: handleClear, color: 'bg-red-100 text-red-600' },
    { label: '÷', value: '/', color: 'bg-gray-100 text-[#00695c]' },
    { label: '×', value: '*', color: 'bg-gray-100 text-[#00695c]' },
    { label: '⌫', action: handleBackspace, color: 'bg-orange-100 text-orange-600' },
    { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' },
    { label: '-', value: '-', color: 'bg-gray-100 text-[#00695c]' },
    { label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' },
    { label: '+', value: '+', color: 'bg-gray-100 text-[#00695c]' },
    { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' },
    { label: '=', action: handleCalculate, color: 'bg-[#00695c] text-white row-span-2 h-full' },
    { label: '0', value: '0', width: 'col-span-2' },
    { label: '.', value: '.' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 pb-6"
        >
          {/* Header */}
          <div className="bg-[#00695c] p-4 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold">الآلة الحاسبة</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Display */}
          <div className="bg-gray-50 p-6 text-right border-b-2 border-gray-100">
            <div className="text-gray-500 text-sm h-6 font-medium">{result !== '' && input !== result ? input : ''}</div>
            <div className="text-4xl font-bold text-gray-800 truncate h-12">{input || '0'}</div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-3 p-4 direction-ltr">
            {buttons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => btn.action ? btn.action() : handleClick(btn.value)}
                className={`
                  ${btn.width || ''} 
                  ${btn.color || 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:bg-gray-50'} 
                  rounded-2xl p-4 text-xl font-bold transition-all active:scale-95 flex items-center justify-center
                `}
              >
                {btn.label === '⌫' ? <Delete size={24} /> : btn.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
