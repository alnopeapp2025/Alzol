import { 
  ShoppingBasket, 
  Package, 
  BarChart3, 
  ScrollText, 
  Wallet, 
  Vault, 
  Truck, 
  Users, 
  ClipboardList, 
  FileText, 
  Settings, 
  Calculator,
  Briefcase,
  CreditCard
} from 'lucide-react';

// Screen 1 Data
export const screen1Data = [
  { id: 1, title: 'المنتجات', icon: Package, color: '#d32f2f' }, // Red
  { id: 2, title: 'الأصناف', icon: ShoppingBasket, color: '#1976d2' }, // Blue
  { id: 3, title: 'المبيعات', icon: ScrollText, color: '#fbc02d' }, // Yellow/Gold
  { id: 4, title: 'المشتريات', icon: BarChart3, color: '#f57c00' }, // Orange
  { id: 5, title: 'الخزينة', icon: Vault, color: '#0288d1' }, // Light Blue
  { id: 6, title: 'المصروفات', icon: Wallet, color: '#5d4037' }, // Brown
];

// Screen 2 Data
export const screen2Data = [
  { id: 7, title: 'العملاء', icon: Users, color: '#c2185b' }, // Pink
  { id: 8, title: 'تجار الجملة', icon: Truck, color: '#0097a7' }, // Cyan
  { id: 9, title: 'التقارير النهائية', icon: FileText, color: '#616161' }, // Grey
  { id: 10, title: 'تقارير المخزن', icon: ClipboardList, color: '#7b1fa2' }, // Purple
  { id: 11, title: 'الآلة الحاسبة', icon: Calculator, color: '#0277bd' }, // Blue
  { id: 12, title: 'عمال ورواتب', icon: Briefcase, color: '#455a64' }, // Briefcase Icon
  { id: 13, title: 'الديون', icon: CreditCard, color: '#c62828' }, // Red for Debts
  { id: 14, title: 'الإعدادات', icon: Settings, color: '#607d8b' }, // Grey for Settings
];
