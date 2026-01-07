// إدارة إعدادات المدير
export const getAdminSettings = () => {
  const defaultSettings = {
    enable_sales: true,
    enable_expenses: true,
    enable_treasury: true,
    enable_reports: true,
    max_products: 1000,
    subscription_plan: 'free', // free, basic, pro
    allow_bank_transfer: true,
    allow_backup: true
  };
  try {
    const stored = localStorage.getItem('admin_settings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
};

export const saveAdminSettings = (settings) => {
  localStorage.setItem('admin_settings', JSON.stringify(settings));
};
