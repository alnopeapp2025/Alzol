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
  Calculator 
} from 'lucide-react';

// Screen 1 Data (Based on Image 2)
// Top Left: الأصناف (Items) - Basket
// Top Right: المنتجات (Products) - Boxes
// Middle Left: المشتريات (Purchases) - Chart
// Middle Right: المبيعات (Sales) - Receipt
// Bottom Left: المصروفات (Expenses) - Wallet
// Bottom Right: الصندوق (Fund) - Safe

export const screen1Data = [
  { id: 1, title: 'المنتجات', icon: Package, color: '#d32f2f' }, // Red/Orange
  { id: 2, title: 'الأصناف', icon: ShoppingBasket, color: '#1976d2' }, // Blue
  { id: 3, title: 'المبيعات', icon: ScrollText, color: '#fbc02d' }, // Yellow/Gold
  { id: 4, title: 'المشتريات', icon: BarChart3, color: '#f57c00' }, // Orange
  { id: 5, title: 'الصندوق', icon: Vault, color: '#0288d1' }, // Light Blue
  { id: 6, title: 'المصروفات', icon: Wallet, color: '#5d4037' }, // Brown
];

// Screen 2 Data (Based on Image 1)
// Top Left: الموردين (Suppliers) - Delivery
// Top Right: العملاء (Customers) - People
// Middle Left: تقارير المخزن (Store Reports) - Report Chart
// Middle Right: تقارير نهائية (Final Reports) - Paper
// Bottom Left: الإعدادات (Settings) - Gear
// Bottom Right: الالة الحاسبة (Calculator) - Calculator

export const screen2Data = [
  { id: 7, title: 'العملاء', icon: Users, color: '#c2185b' }, // Pink/Red
  { id: 8, title: 'الموردين', icon: Truck, color: '#0097a7' }, // Cyan
  { id: 9, title: 'تقارير نهائية', icon: FileText, color: '#616161' }, // Grey
  { id: 10, title: 'تقارير المخزن', icon: ClipboardList, color: '#7b1fa2' }, // Purple
  { id: 11, title: 'الالة الحاسبة', icon: Calculator, color: '#0277bd' }, // Blue
  { id: 12, title: 'الإعدادات', icon: Settings, color: '#1565c0' }, // Dark Blue
];
