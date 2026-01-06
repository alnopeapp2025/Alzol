// إدارة إعدادات المدير والقيود الأمنية - نسخة آمنة (Crash-Proof)
const ADMIN_CONFIG_KEY = 'app_admin_config';
const ADMIN_SECURITY_KEY = 'app_admin_security';

const defaultSettings = {
  credentials: {
    username: 'admin',
    password: 'password123',
    securityQuestion: 'رمز النظام',
    securityAnswer: '2025'
  },
  plans: {
    free: { maxProducts: 10, maxInvoices: 5, label: 'الباقة المجانية' },
    basic: { maxProducts: 100, maxInvoices: 50, label: 'الباقة الأساسية' },
    pro: { maxProducts: 999999, maxInvoices: 999999, label: 'باقة المحترفين' }
  },
  restrictedFeatures: {
    'final-reports': true,
    'inventory-reports': true,
    'workers': false,
    'debts': false,
    'bank-transfer': true,
    'create-backup': true
  }
};

export const getAdminSettings = () => {
  try {
    const saved = localStorage.getItem(ADMIN_CONFIG_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    
    // دمج ذكي لضمان وجود كافة الحقول حتى لو كانت البيانات المحفوظة قديمة
    return {
      ...defaultSettings,
      ...parsed,
      credentials: { ...defaultSettings.credentials, ...(parsed.credentials || {}) },
      plans: { ...defaultSettings.plans, ...(parsed.plans || {}) },
      restrictedFeatures: { ...defaultSettings.restrictedFeatures, ...(parsed.restrictedFeatures || {}) }
    };
  } catch (e) {
    console.error("Settings Load Error - Resetting to defaults", e);
    return defaultSettings;
  }
};

export const saveAdminSettings = (settings) => {
  try {
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Settings Save Error", e);
  }
};

export const checkLockout = () => {
  try {
    const saved = localStorage.getItem(ADMIN_SECURITY_KEY);
    const security = saved ? JSON.parse(saved) : { attempts: 0, lockoutUntil: 0 };
    
    if (Date.now() < security.lockoutUntil) {
      const remaining = Math.ceil((security.lockoutUntil - Date.now()) / 1000);
      return { locked: true, remaining };
    }
    return { locked: false };
  } catch (e) {
    return { locked: false };
  }
};

export const registerFailedAttempt = () => {
  try {
    const saved = localStorage.getItem(ADMIN_SECURITY_KEY);
    const security = saved ? JSON.parse(saved) : { attempts: 0, lockoutUntil: 0 };
    
    security.attempts += 1;
    
    if (security.attempts >= 3) {
      security.lockoutUntil = Date.now() + (5 * 60 * 1000); // Lock for 5 minutes
      security.attempts = 0;
    }
    
    localStorage.setItem(ADMIN_SECURITY_KEY, JSON.stringify(security));
    return security.attempts;
  } catch (e) {
    return 1;
  }
};

export const resetAttempts = () => {
  localStorage.setItem(ADMIN_SECURITY_KEY, JSON.stringify({ attempts: 0, lockoutUntil: 0 }));
};
