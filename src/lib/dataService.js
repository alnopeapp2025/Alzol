import { supabase } from './supabaseClient';

// مفاتيح التخزين المحلي
const KEYS = {
  CATEGORIES: 'offline_categories',
  PRODUCTS: 'offline_products',
  SALES: 'offline_sales',
  EXPENSES: 'offline_expenses',
  QUEUE: 'offline_sync_queue'
};

// التحقق من حالة الاتصال
const isOnline = () => navigator.onLine;

// --- إدارة طابور المزامنة ---
const addToQueue = (action, table, payload) => {
  const queue = JSON.parse(localStorage.getItem(KEYS.QUEUE) || '[]');
  queue.push({ action, table, payload, timestamp: Date.now() });
  localStorage.setItem(KEYS.QUEUE, JSON.stringify(queue));
};

export const syncData = async () => {
  if (!isOnline()) return;

  const queue = JSON.parse(localStorage.getItem(KEYS.QUEUE) || '[]');
  if (queue.length === 0) return;

  console.log('Starting Sync...', queue.length, 'items');

  const newQueue = [];
  for (const item of queue) {
    try {
      const { action, table, payload } = item;
      
      if (action === 'INSERT') {
        const { error } = await supabase.from(table).insert([payload]);
        if (error) throw error;
      } else if (action === 'UPDATE') {
        const { id, ...updates } = payload;
        const { error } = await supabase.from(table).update(updates).eq('id', id);
        if (error) throw error;
      } else if (action === 'DELETE') {
        const { id } = payload;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Sync failed for item:', item, error);
      // إذا فشل العنصر، نعيده للطابور للمحاولة لاحقاً
      newQueue.push(item);
    }
  }

  localStorage.setItem(KEYS.QUEUE, JSON.stringify(newQueue));
  console.log('Sync Complete. Remaining:', newQueue.length);
};

// --- دوال البيانات (CRUD) ---

// 1. جلب البيانات (Fetch)
export const fetchData = async (table) => {
  const localKey = `offline_${table}`;
  
  if (isOnline()) {
    try {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      if (!error && data) {
        // تحديث النسخة المحلية
        localStorage.setItem(localKey, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Online fetch failed, falling back to offline data', e);
    }
  }
  
  // العودة للبيانات المحلية في حال الأوفلاين أو الخطأ
  return JSON.parse(localStorage.getItem(localKey) || '[]');
};

// 2. إضافة بيانات (Insert)
export const insertData = async (table, payload) => {
  const localKey = `offline_${table}`;
  
  // تحديث محلي فوري (Optimistic UI)
  const currentData = JSON.parse(localStorage.getItem(localKey) || '[]');
  // إنشاء ID مؤقت إذا لزم الأمر للعرض
  const newItem = { ...payload, id: Date.now(), created_at: new Date().toISOString() }; 
  const updatedData = [newItem, ...currentData];
  localStorage.setItem(localKey, JSON.stringify(updatedData));

  if (isOnline()) {
    try {
      const { data, error } = await supabase.from(table).insert([payload]).select();
      if (!error && data) {
        // تحديث العنصر المؤقت بالبيانات الحقيقية من السيرفر
        const realItem = data[0];
        const fixedData = updatedData.map(item => item.id === newItem.id ? realItem : item);
        localStorage.setItem(localKey, JSON.stringify(fixedData));
        return { data: realItem, error: null };
      }
    } catch (e) {
      console.warn('Online insert failed, adding to queue');
    }
  }

  // إذا كنا أوفلاين أو فشل الاتصال
  addToQueue('INSERT', table, payload);
  return { data: newItem, error: null, isOffline: true };
};

// 3. تحديث بيانات (Update)
export const updateData = async (table, id, updates) => {
  const localKey = `offline_${table}`;
  
  // تحديث محلي
  const currentData = JSON.parse(localStorage.getItem(localKey) || '[]');
  const updatedData = currentData.map(item => item.id === id ? { ...item, ...updates } : item);
  localStorage.setItem(localKey, JSON.stringify(updatedData));

  if (isOnline()) {
    try {
      const { error } = await supabase.from(table).update(updates).eq('id', id);
      if (!error) return { error: null };
    } catch (e) {
      console.warn('Online update failed, adding to queue');
    }
  }

  addToQueue('UPDATE', table, { id, ...updates });
  return { error: null, isOffline: true };
};

// 4. حذف بيانات (Delete)
export const deleteData = async (table, id) => {
  const localKey = `offline_${table}`;
  
  // تحديث محلي
  const currentData = JSON.parse(localStorage.getItem(localKey) || '[]');
  const updatedData = currentData.filter(item => item.id !== id);
  localStorage.setItem(localKey, JSON.stringify(updatedData));

  if (isOnline()) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) return { error: null };
    } catch (e) {
      console.warn('Online delete failed, adding to queue');
    }
  }

  addToQueue('DELETE', table, { id });
  return { error: null, isOffline: true };
};
