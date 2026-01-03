import React, { useState } from 'react';
import { X, Crown, CheckCircle, Star, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export const ProModal = ({ isOpen, onClose, currentUser, onUpgradeSuccess }) => {
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(2); // Default to Yearly

  if (!isOpen) return null;

  const plans = [
    { id: 1, name: 'شهري', duration: 'شهر واحد', price: 'اشتراك أساسي', icon: Star },
    { id: 2, name: 'سنوي', duration: '12 شهر', price: 'الأكثر توفيراً', icon: Crown, featured: true },
    { id: 3, name: '6 شهور', duration: 'نصف سنوي', price: 'قيمة ممتازة', icon: ShieldCheck },
  ];

  const handleActivate = async () => {
    if (!activationCode) return;
    setLoading(true);

    // Simulation of code verification
    // In a real app, you would check this against a 'coupons' table
    // For this demo, we assume any code starting with 'PRO' is valid
    
    setTimeout(async () => {
      if (activationCode.toUpperCase().startsWith('PRO') || activationCode.length > 3) {
        
        // Update user to PRO
        if (currentUser) {
          const { error } = await supabase
            .from('app_users')
            .update({ 
              is_pro: true,
              subscription_plan: plans.find(p => p.id === selectedPlan)?.name,
              subscription_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            })
            .eq('id', currentUser.id);
            
          if (!error) {
            if (onUpgradeSuccess) onUpgradeSuccess();
            alert('تم تفعيل اشتراك Pro بنجاح! تم تفعيل المزامنة السحابية.');
            onClose();
          } else {
            alert('حدث خطأ أثناء التفعيل');
          }
        } else {
           alert('يرجى تسجيل الدخول أولاً لتفعيل الاشتراك');
        }
      } else {
        alert('كود التفعيل غير صحيح');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-yellow-500/30"
      >
        {/* Decorative Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-yellow-500/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>

          <div className="text-center mb-8 mt-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 shadow-lg mb-4 animate-pulse">
              <Crown size={32} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
              ترقية إلى Pro
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              احصل على مساحة غير محدودة ومزامنة سحابية
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-xl p-3 flex flex-col items-center gap-2 border transition-all duration-300 ${
                  selectedPlan === plan.id 
                    ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    موصى به
                  </div>
                )}
                <plan.icon size={20} className={selectedPlan === plan.id ? 'text-yellow-400' : 'text-gray-500'} />
                <div className="text-center">
                  <div className={`text-sm font-bold ${selectedPlan === plan.id ? 'text-white' : 'text-gray-300'}`}>
                    {plan.name}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">{plan.duration}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-8 bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <CheckCircle size={16} className="text-yellow-500" />
              <span>عدد منتجات وأصناف غير محدود</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <Zap size={16} className="text-yellow-500" />
              <span>مزامنة سحابية تلقائية (Auto-Sync)</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <ShieldCheck size={16} className="text-yellow-500" />
              <span>نسخ احتياطي واستعادة البيانات</span>
            </div>
          </div>

          {/* Activation Code Input */}
          <div className="space-y-3">
            <label className="block text-yellow-500 text-xs font-bold text-right px-1">
              كود التفعيل الخاص
            </label>
            <input
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="أدخل كود التفعيل هنا..."
              className="w-full h-12 px-4 rounded-xl bg-gray-800 border-2 border-gray-600 focus:border-yellow-500 focus:outline-none text-white text-right placeholder-gray-500 font-mono tracking-widest text-center uppercase"
            />
            <button
              onClick={handleActivate}
              disabled={loading || !activationCode}
              className="w-full h-14 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold text-lg rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'جاري التفعيل...' : 'تفعيل الاشتراك الآن'}
              {!loading && <Crown size={20} fill="currentColor" />}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
