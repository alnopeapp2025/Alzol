import React, { useState, useEffect } from 'react';
import { ArrowRight, Trash2, Edit, Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const AddCategoryScreen = ({ onBack }) => {
  const [categories, setCategories] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCategories(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);

    // Direct insertion without user_id as requested
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        name: inputValue
      }])
      .select();

    if (error) {
      console.error('Error adding category:', error);
      alert('حدث خطأ أثناء الإضافة');
    } else if (data) {
      // Success Feedback
      alert('تمت الإضافة بنجاح');
      // Update list immediately
      setCategories([data[0], ...categories]);
      setInputValue('');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleEdit = async (id, currentName) => {
    const newName = prompt('تعديل اسم الصنف:', currentName);
    if (newName && newName !== currentName) {
      const { error } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('id', id);

      if (!error) {
        setCategories(categories.map(c => c.id === id ? { ...c, name: newName } : c));
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#FFF9C4] overflow-hidden">
      {/* Header */}
      <div className="bg-[#00695c] text-white h-16 flex items-center px-4 shadow-lg shrink-0 rounded-b-2xl z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-[#005c4b] rounded-xl transition-colors active:scale-95"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center ml-10">إضافة صنف</h1>
      </div>

      {/* Content Container - No Window Scrolling */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        
        {/* Input Section */}
        <form onSubmit={handleAdd} className="mb-6 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب اسم الصنف هنا..."
              className="w-full h-14 pr-4 pl-14 rounded-xl border-2 border-[#00695c] focus:outline-none focus:ring-2 focus:ring-[#00695c]/50 text-right text-lg font-medium shadow-sm caret-[#00695c] placeholder-gray-400"
              autoFocus
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute left-2 top-2 bottom-2 bg-[#00695c] text-white px-4 rounded-lg hover:bg-[#005c4b] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
        </form>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
          <div className="flex flex-col gap-3 pb-20">
            {categories.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow"
              >
                {/* Right: Delete Button (Start in RTL) */}
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-90"
                  title="حذف"
                >
                  <Trash2 size={20} strokeWidth={2} />
                </button>

                {/* Center: Name */}
                <span className="flex-1 text-center font-bold text-gray-800 text-lg truncate px-2">
                  {item.name}
                </span>

                {/* Left: Edit Button (End in RTL) */}
                <button 
                  onClick={() => handleEdit(item.id, item.name)}
                  className="p-2 text-[#00695c] hover:bg-[#e0f2f1] rounded-lg transition-colors active:scale-90"
                  title="تعديل"
                >
                  <Edit size={20} strokeWidth={2} />
                </button>
              </div>
            ))}
            
            {categories.length === 0 && (
              <div className="text-center text-gray-400 mt-10 font-medium">
                لا توجد أصناف مضافة حالياً
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
