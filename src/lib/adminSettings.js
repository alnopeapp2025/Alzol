// إدارة إعدادات المدير والقيود الأمنية
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
    // العناصر التي تتطلب اشتراكاً (True = تتطلب اشتراك)
    'final-reports': true,
    'inventory-reports': true,
    'workers': false,
    'debts': false,
    'bank-transfer': true,  // New: التحويل بين البنوك
    'create-backup': true   // New: إنشاء نسخة احتياطية
  }
};

export const getAdminSettings = () => {
  const saved = localStorage.getItem(ADMIN_CONFIG_KEY);
  // Merge with defaults to ensure new keys exist if local storage has old data
  const parsed = saved ? JSON.parse(saved) : defaultSettings;
  return {
    ...parsed,
    restrictedFeatures: { ...defaultSettings.restrictedFeatures, ...parsed.restrictedFeatures }
  };
};

export const saveAdminSettings = (settings) => {
  localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(settings));
};

// --- Brute Force Protection ---
export const checkLockout = () => {
  const security = JSON.parse(localStorage.getItem(ADMIN_SECURITY_KEY) || '{"attempts": 0, "lockoutUntil": 0}');
  if (Date.now() < security.lockoutUntil) {
    const remaining = Math.ceil((security.lockoutUntil - Date.now()) / 1000);
    return { locked: true, remaining };
  }
  return { locked: false };
};

export const registerFailedAttempt = () => {
  const security = JSON.parse(localStorage.getItem(ADMIN_SECURITY_KEY) || '{"attempts": 0, "lockoutUntil": 0}');
  security.attempts += 1;
  
  if (security.attempts >= 3) {
    security.lockoutUntil = Date.now() + (5 * 60 * 1000); // Lock for 5 minutes
    security.attempts = 0;
  }
  
  localStorage.setItem(ADMIN_SECURITY_KEY, JSON.stringify(security));
  return security.attempts;
};

export const resetAttempts = () => {
  localStorage.setItem(ADMIN_SECURITY_KEY, JSON.stringify({ attempts: 0, lockoutUntil: 0 }));
};
