import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, HardHat, Calendar, Clock, DollarSign, Briefcase, X, Save, Trash2 } from 'lucide-react';
import { fetchData, insertData, deleteData } from '../lib/dataService'; // Use Data Service for Offline
import { Toast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const WorkersScreen = ({ onBack }) => {
  const [workers, setWorkers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [deleteDialog, setDeleteDialog] = useState({ show: false, id: null });
  
  // Date Limits
  const [dateLimits, setDateLimits] = useState({ min: '', max: '' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    salary: '',
    job_title: '',
    start_date: '' // datetime-local
  });

  useEffect(() => {
    loadWorkers();
    
    // Calculate Date Limits
    const now = new Date();
    const maxDate = now.toISOString().slice(0, 16); // Current datetime
    
    const past = new Date();
    past.setDate(past.getDate() - 7);
    const minDate = past.toISOString().slice(0, 16); // 7 days ago
    
    setDateLimits({ min: minDate, max: maxDate });

    // Refresh timer every second
    const timer = setInterval(() => {
      setWorkers(prev => [...prev]); // Force re-render for countdown
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadWorkers = async () => {
    const data = await fetchData('workers');
    if (data) setWorkers(data);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.salary || !formData.start_date) return;

    setLoading(true);
    const { error, isOffline } = await insertData('workers', {
      name: formData.name,
      salary: formData.salary,
      job_title: formData.job_title,
      start_date: new Date(formData.start_date).toISOString()
    });

    setLoading(false);
    if (!error) {
      setToast({ show: true, message: isOffline ? 'تم الحفظ (وضع عدم الاتصال)' : 'تم إضافة الموظف بنجاح' });
      setShowModal(false);
      setFormData({ name: '', salary: '', job_title: '', start_date: '' });
      loadWorkers();
    } else {
      alert('حدث خطأ أثناء الإضافة');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    const { error, isOffline } = await deleteData('workers', deleteDialog.id);
    if (!error) {
      setToast({ show: true, message: isOffline ? 'تم الحذف (وضع عدم الاتصال)' : 'تم حذف الموظف بنجاح' });
      setWorkers(workers.filter(w => w.id !== deleteDialog.id));
    }
    setDeleteDialog({ show: false, id: null });
  };

  // Countdown Logic
  const calculateTimeRemaining = (startDateStr) => {
    const start = new Date(startDateStr);
    const now = new Date();
    
    // Calculate next pay date (every 30 days from start)
    let nextPay = new Date(start);
    while (nextPay < now) {
      nextPay.setDate(nextPay.getDate() + 30);
    }

    const diff = nextPay - now;
    
    if (diff <= 0) return "00:00:00:00";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden font-sans relative">
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
      <ConfirmDialog 
        isOpen={deleteDialog.show}
        title="حذف الموظف"
        message="هل أنت متأكد من حذف هذا الموظف؟"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ show: false, id: null })}
      />

      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95">
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">العمال والرواتب</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
        {workers.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 font-medium flex flex-col items-center">
            <div className="w-20 h-20 bg-[#00695c]/10 rounded-full flex items-center justify-center mb-4 text-[#00695c]">
              <HardHat size={40} />
            </div>
            لا يوجد موظفين حالياً
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {workers.map((worker) => (
              <div key={worker.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative group">
                <button 
                  onClick={() => setDeleteDialog({ show: true, id: worker.id })}
                  className="absolute top-4 left-4 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>

                {/* Row 1: Name and Salary */}
                <div className="flex justify-between items-start mb-1 pl-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                      <HardHat size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{worker.name}</h3>
                      {/* Job Title (Fixed Position) */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-1">
                        <Briefcase size={12} /> {worker.job_title || 'غير محدد'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <span className="font-bold text-[#00695c] text-lg dir-ltr block">
                      {Number(worker.salary).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold block text-center -mt-1">ج.س</span>
                  </div>
                </div>

                {/* Row 2: Date and Time */}
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-3 mt-2 pr-14">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-orange-500" />
                    <span className="dir-ltr">{new Date(worker.start_date).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-orange-500" />
                    <span className="dir-ltr">
                      {new Date(worker.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="bg-[#00695c] rounded-xl p-2 text-white text-center shadow-inner mt-2">
                  <div className="flex items-center justify-center gap-2 mb-1 opacity-80 text-[10px] font-bold">
                    <Clock size={12} />
                    <span>تبقى على الراتب</span>
                  </div>
                  <div className="text-xl font-black tracking-widest font-mono dir-ltr">
                    {calculateTimeRemaining(worker.start_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setShowModal(true)}
        className="absolute bottom-6 left-6 w-14 h-14 bg-[#e65100] text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-[#ef6c00] active:scale-90 transition-all z-20"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* Add Modal - Positioned at Top */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in slide-in-from-top duration-300">
            <div className="bg-[#e65100] text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">إضافة موظف جديد</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[#e65100] text-xs font-bold mb-1 text-right px-1">اسم الموظف</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#e65100] focus:outline-none focus:ring-2 focus:ring-[#e65100]/50 text-right font-medium"
                />
              </div>

              <div>
                <label className="block text-[#e65100] text-xs font-bold mb-1 text-right px-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#e65100] focus:outline-none focus:ring-2 focus:ring-[#e65100]/50 text-right font-medium"
                />
              </div>

              <div>
                <label className="block text-[#e65100] text-xs font-bold mb-1 text-right px-1">الراتب الشهري</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#e65100] focus:outline-none focus:ring-2 focus:ring-[#e65100]/50 text-right font-bold text-lg"
                />
              </div>

              <div>
                <label className="block text-[#e65100] text-xs font-bold mb-1 text-right px-1">تاريخ بداية العمل</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  min={dateLimits.min}
                  max={dateLimits.max}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#e65100] focus:outline-none focus:ring-2 focus:ring-[#e65100]/50 text-right font-medium bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1 mr-1">
                  يمكنك اختيار تاريخ اليوم أو حتى 7 أيام سابقة فقط.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#e65100] text-white h-14 rounded-xl font-bold text-lg shadow-md hover:bg-[#ef6c00] flex items-center justify-center gap-2 mt-2"
              >
                <Save size={24} />
                <span>حفظ البيانات</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
