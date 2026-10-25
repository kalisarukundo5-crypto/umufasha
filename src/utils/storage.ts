import {
  Product,
  Purchase,
  Sale,
  Expense,
  SavingsGoal,
  SavingsTransaction,
  Customer,
  Supplier,
  CustomerPayment,
  SupplierPayment,
  AuditLog,
  AppSettings,
} from '../types/finance';

const STORAGE_KEYS = {
  PRODUCTS: 'imari_products_v2',
  PURCHASES: 'imari_purchases_v2',
  SALES: 'imari_sales_v2',
  EXPENSES: 'imari_expenses_v2',
  SAVINGS_GOALS: 'imari_savings_goals_v2',
  SAVINGS_TRANSACTIONS: 'imari_savings_trans_v2',
  CUSTOMERS: 'imari_customers_v2',
  SUPPLIERS: 'imari_suppliers_v2',
  CUSTOMER_PAYMENTS: 'imari_cust_payments_v2',
  SUPPLIER_PAYMENTS: 'imari_supp_payments_v2',
  AUDIT_LOGS: 'imari_audit_logs_v2',
  SETTINGS: 'imari_settings_v2',
};

// Purge any old v1 static mock demo data from user's browser
export function clearOldMockStorage() {
  if (typeof window === 'undefined') return;
  const oldKeys = [
    'imari_products_v1',
    'imari_purchases_v1',
    'imari_sales_v1',
    'imari_expenses_v1',
    'imari_savings_goals_v1',
    'imari_savings_trans_v1',
    'imari_customers_v1',
    'imari_suppliers_v1',
    'imari_cust_payments_v1',
    'imari_supp_payments_v1',
    'imari_audit_logs_v1',
    'imari_settings_v1',
  ];
  oldKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

export const defaultSettings: AppSettings = {
  currency: 'RWF',
  allowNegativeStock: false,
  language: 'en',
  openingCashBalance: 0,
  businessName: 'My Business',
  ownerName: '',
  contactPhone: '',
  customCategories: ['Packaging Materials', 'Store Security'],
};

// Clean empty initial state - ONLY user added data is stored
export function getInitialEmptyData() {
  return {
    products: [] as Product[],
    purchases: [] as Purchase[],
    sales: [] as Sale[],
    expenses: [] as Expense[],
    savingsGoals: [] as SavingsGoal[],
    savingsTransactions: [] as SavingsTransaction[],
    customers: [] as Customer[],
    suppliers: [] as Supplier[],
    customerPayments: [] as CustomerPayment[],
    supplierPayments: [] as SupplierPayment[],
    auditLogs: [] as AuditLog[],
    settings: defaultSettings,
  };
}

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed to parse localStorage key ${key}:`, err);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to localStorage key ${key}:`, err);
  }
}

export { STORAGE_KEYS };
