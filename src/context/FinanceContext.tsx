import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
  ProductInventoryStatus,
  FinancialSummary,
  PaymentMethod,
} from '../types/finance';
import {
  STORAGE_KEYS,
  defaultSettings,
  getInitialEmptyData,
  clearOldMockStorage,
  loadStoredData,
  saveStoredData,
} from '../utils/storage';
import {
  calculateInventoryStatus,
  calculateFinancialSummary,
  getCurrentWeekRange,
  getCurrentMonthRange,
} from '../utils/calculations';
import { enTranslations, rwTranslations, TranslationKey } from '../utils/translations';
import { generateAcceptanceTestData } from '../utils/acceptanceTest';

export type ViewType =
  | 'dashboard'
  | 'purchases'
  | 'sales'
  | 'expenses_savings'
  | 'reports';

export type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface DateFilterState {
  type: DateFilterType;
  startDate?: string;
  endDate?: string;
}

interface FinanceContextType {
  // Navigation & View
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  // Filter state
  dateFilter: DateFilterState;
  setDateFilter: (filter: DateFilterState) => void;

  // Core Data
  products: Product[];
  purchases: Purchase[];
  sales: Sale[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  savingsTransactions: SavingsTransaction[];
  customers: Customer[];
  suppliers: Supplier[];
  customerPayments: CustomerPayment[];
  supplierPayments: SupplierPayment[];
  auditLogs: AuditLog[];
  settings: AppSettings;

  // Derived / Calculated
  inventoryStatus: Record<string, ProductInventoryStatus>;
  financialSummary: FinancialSummary;
  overallSummary: FinancialSummary; // Regardless of date filter
  t: (key: TranslationKey) => string;

  // Actions
  setLanguage: (lang: 'en' | 'rw') => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  addPurchase: (data: Omit<Purchase, 'id' | 'createdAt' | 'totalProductCost' | 'totalAcquisitionCost' | 'unitAcquisitionCost' | 'outstandingBalance'>) => Purchase;
  updatePurchase: (purchase: Purchase) => void;
  deletePurchase: (id: string) => void;

  addSale: (data: Omit<Sale, 'id' | 'createdAt' | 'grossSales' | 'netSales' | 'costOfGoodsSold' | 'grossProfit' | 'outstandingBalance'>) => { sale?: Sale; error?: string };
  updateSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => SavingsGoal;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;

  addSavingsTransaction: (trans: Omit<SavingsTransaction, 'id' | 'createdAt'>) => SavingsTransaction;
  updateSavingsTransaction: (trans: SavingsTransaction) => void;
  deleteSavingsTransaction: (id: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;

  recordCustomerPayment: (payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => CustomerPayment;
  recordSupplierPayment: (payment: Omit<SupplierPayment, 'id' | 'createdAt'>) => SupplierPayment;

  // Backups & Maintenance
  exportBackupJson: () => void;
  importBackupJson: (fileContent: string) => boolean;
  loadAcceptanceScenario: () => void;
  resetAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Purge any old v1 static mock data from previous sessions
  useEffect(() => {
    clearOldMockStorage();
  }, []);

  // Initialize state from localStorage with clean empty fallbacks
  const [products, setProducts] = useState<Product[]>(() =>
    loadStoredData(STORAGE_KEYS.PRODUCTS, [])
  );
  const [purchases, setPurchases] = useState<Purchase[]>(() =>
    loadStoredData(STORAGE_KEYS.PURCHASES, [])
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    loadStoredData(STORAGE_KEYS.SALES, [])
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadStoredData(STORAGE_KEYS.EXPENSES, [])
  );
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() =>
    loadStoredData(STORAGE_KEYS.SAVINGS_GOALS, [])
  );
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>(() =>
    loadStoredData(STORAGE_KEYS.SAVINGS_TRANSACTIONS, [])
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadStoredData(STORAGE_KEYS.CUSTOMERS, [])
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    loadStoredData(STORAGE_KEYS.SUPPLIERS, [])
  );
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(() =>
    loadStoredData(STORAGE_KEYS.CUSTOMER_PAYMENTS, [])
  );
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() =>
    loadStoredData(STORAGE_KEYS.SUPPLIER_PAYMENTS, [])
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadStoredData(STORAGE_KEYS.AUDIT_LOGS, [])
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadStoredData(STORAGE_KEYS.SETTINGS, defaultSettings)
  );

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [dateFilter, setDateFilter] = useState<DateFilterState>({ type: 'all' });

  // Persistence side-effects
  useEffect(() => saveStoredData(STORAGE_KEYS.PRODUCTS, products), [products]);
  useEffect(() => saveStoredData(STORAGE_KEYS.PURCHASES, purchases), [purchases]);
  useEffect(() => saveStoredData(STORAGE_KEYS.SALES, sales), [sales]);
  useEffect(() => saveStoredData(STORAGE_KEYS.EXPENSES, expenses), [expenses]);
  useEffect(() => saveStoredData(STORAGE_KEYS.SAVINGS_GOALS, savingsGoals), [savingsGoals]);
  useEffect(() => saveStoredData(STORAGE_KEYS.SAVINGS_TRANSACTIONS, savingsTransactions), [savingsTransactions]);
  useEffect(() => saveStoredData(STORAGE_KEYS.CUSTOMERS, customers), [customers]);
  useEffect(() => saveStoredData(STORAGE_KEYS.SUPPLIERS, suppliers), [suppliers]);
  useEffect(() => saveStoredData(STORAGE_KEYS.CUSTOMER_PAYMENTS, customerPayments), [customerPayments]);
  useEffect(() => saveStoredData(STORAGE_KEYS.SUPPLIER_PAYMENTS, supplierPayments), [supplierPayments]);
  useEffect(() => saveStoredData(STORAGE_KEYS.AUDIT_LOGS, auditLogs), [auditLogs]);
  useEffect(() => saveStoredData(STORAGE_KEYS.SETTINGS, settings), [settings]);

  // Inventory Status (WAC, Remaining Stock, Stock Value)
  const inventoryStatus = useMemo(
    () => calculateInventoryStatus(products, purchases, sales),
    [products, purchases, sales]
  );

  // Overall Financial Summary (Lifetime)
  const overallSummary = useMemo(
    () =>
      calculateFinancialSummary(
        products,
        purchases,
        sales,
        expenses,
        savingsTransactions,
        customerPayments,
        supplierPayments,
        settings.openingCashBalance
      ),
    [
      products,
      purchases,
      sales,
      expenses,
      savingsTransactions,
      customerPayments,
      supplierPayments,
      settings.openingCashBalance,
    ]
  );

  // Filtered Financial Summary according to dateFilter
  const resolvedDateRange = useMemo(() => {
    if (dateFilter.type === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      return { startDate: today, endDate: today };
    }
    if (dateFilter.type === 'week') {
      return getCurrentWeekRange();
    }
    if (dateFilter.type === 'month') {
      return getCurrentMonthRange();
    }
    if (dateFilter.type === 'custom') {
      return { startDate: dateFilter.startDate, endDate: dateFilter.endDate };
    }
    return undefined;
  }, [dateFilter]);

  const financialSummary = useMemo(
    () =>
      calculateFinancialSummary(
        products,
        purchases,
        sales,
        expenses,
        savingsTransactions,
        customerPayments,
        supplierPayments,
        settings.openingCashBalance,
        resolvedDateRange
      ),
    [
      products,
      purchases,
      sales,
      expenses,
      savingsTransactions,
      customerPayments,
      supplierPayments,
      settings.openingCashBalance,
      resolvedDateRange,
    ]
  );

  // Translation helper
  const t = (key: TranslationKey): string => {
    const dict = settings.language === 'rw' ? rwTranslations : enTranslations;
    return dict[key] || enTranslations[key] || key;
  };

  const logAudit = (
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    summary: string,
    previousData?: unknown,
    newData?: unknown
  ) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      entityType,
      entityId,
      summary,
      timestamp: new Date().toISOString(),
      previousData,
      newData,
    };
    setAuditLogs((prev) => [log, ...prev].slice(0, 200));
  };

  // Setting actions
  const setLanguage = (lang: 'en' | 'rw') => {
    setSettings((prev) => ({ ...prev, language: lang }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      logAudit('UPDATE', 'SETTINGS', 'settings', 'Updated application settings', prev, updated);
      return updated;
    });
  };

  // Product Actions
  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProd: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProd]);
    logAudit('CREATE', 'PURCHASE', newProd.id, `Created product: ${newProd.name}`);
    return newProd;
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    logAudit('UPDATE', 'PURCHASE', product.id, `Updated product: ${product.name}`);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAudit('DELETE', 'PURCHASE', id, `Deleted product: ${target?.name || id}`);
  };

  // Purchase Actions
  const addPurchase = (
    data: Omit<
      Purchase,
      'id' | 'createdAt' | 'totalProductCost' | 'totalAcquisitionCost' | 'unitAcquisitionCost' | 'outstandingBalance'
    >
  ): Purchase => {
    const totalProductCost = (data.quantity || 0) * (data.unitPurchasePrice || 0);
    const totalAcquisitionCost =
      totalProductCost + (data.transportCosts || 0) + (data.otherCosts || 0);
    const unitAcquisitionCost =
      data.quantity > 0 ? totalAcquisitionCost / data.quantity : 0;
    const outstandingBalance = Math.max(0, totalAcquisitionCost - (data.amountPaid || 0));

    const newPurchase: Purchase = {
      ...data,
      id: `purch-${Date.now()}`,
      totalProductCost,
      totalAcquisitionCost,
      unitAcquisitionCost,
      outstandingBalance,
      createdAt: new Date().toISOString(),
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Ensure supplier exists in list
    if (data.supplierName && !suppliers.some((s) => s.name.toLowerCase() === data.supplierName.toLowerCase())) {
      const newSupp: Supplier = {
        id: `supp-${Date.now()}`,
        name: data.supplierName,
        createdAt: new Date().toISOString(),
      };
      setSuppliers((prev) => [...prev, newSupp]);
    }

    logAudit(
      'CREATE',
      'PURCHASE',
      newPurchase.id,
      `Purchased ${newPurchase.quantity} ${newPurchase.unit} of ${newPurchase.productName} for ${newPurchase.totalAcquisitionCost} RWF from ${newPurchase.supplierName}`
    );

    return newPurchase;
  };

  const updatePurchase = (updated: Purchase) => {
    const totalProductCost = (updated.quantity || 0) * (updated.unitPurchasePrice || 0);
    const totalAcquisitionCost =
      totalProductCost + (updated.transportCosts || 0) + (updated.otherCosts || 0);
    const unitAcquisitionCost =
      updated.quantity > 0 ? totalAcquisitionCost / updated.quantity : 0;
    const outstandingBalance = Math.max(0, totalAcquisitionCost - (updated.amountPaid || 0));

    const finalPurchase: Purchase = {
      ...updated,
      totalProductCost,
      totalAcquisitionCost,
      unitAcquisitionCost,
      outstandingBalance,
    };

    setPurchases((prev) => prev.map((p) => (p.id === updated.id ? finalPurchase : p)));
    logAudit('UPDATE', 'PURCHASE', updated.id, `Updated purchase of ${updated.productName}`);
  };

  const deletePurchase = (id: string) => {
    const target = purchases.find((p) => p.id === id);
    setPurchases((prev) => prev.filter((p) => p.id !== id));
    logAudit('DELETE', 'PURCHASE', id, `Deleted purchase #${id} (${target?.productName})`);
  };

  // Sales Actions
  const addSale = (
    data: Omit<
      Sale,
      'id' | 'createdAt' | 'grossSales' | 'netSales' | 'costOfGoodsSold' | 'grossProfit' | 'outstandingBalance'
    >
  ): { sale?: Sale; error?: string } => {
    const currentStock = inventoryStatus[data.productId]?.remainingStock ?? 0;
    const wac = inventoryStatus[data.productId]?.weightedAverageCost ?? 0;

    if (!settings.allowNegativeStock && data.quantity > currentStock) {
      return {
        error: `Insufficient stock! Requested: ${data.quantity} ${data.unit}, Available: ${currentStock} ${data.unit}. Enable negative stock in Settings to bypass.`,
      };
    }

    const grossSales = (data.quantity || 0) * (data.unitSellingPrice || 0);
    const netSales = Math.max(0, grossSales - (data.discount || 0));
    const costOfGoodsSold = (data.quantity || 0) * wac;
    const grossProfit = netSales - costOfGoodsSold;
    const outstandingBalance = Math.max(0, netSales - (data.amountReceived || 0));

    const newSale: Sale = {
      ...data,
      id: `sale-${Date.now()}`,
      grossSales,
      netSales,
      costOfGoodsSold,
      grossProfit,
      outstandingBalance,
      createdAt: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);

    // Ensure customer exists in list
    if (data.customerName && !customers.some((c) => c.name.toLowerCase() === data.customerName!.toLowerCase())) {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: data.customerName,
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [...prev, newCust]);
    }

    logAudit(
      'CREATE',
      'SALE',
      newSale.id,
      `Sold ${newSale.quantity} ${newSale.unit} of ${newSale.productName} for ${newSale.netSales} RWF (Gross Profit: ${newSale.grossProfit} RWF)`
    );

    return { sale: newSale };
  };

  const updateSale = (updated: Sale) => {
    const wac = inventoryStatus[updated.productId]?.weightedAverageCost ?? 0;
    const grossSales = (updated.quantity || 0) * (updated.unitSellingPrice || 0);
    const netSales = Math.max(0, grossSales - (updated.discount || 0));
    const costOfGoodsSold = (updated.quantity || 0) * wac;
    const grossProfit = netSales - costOfGoodsSold;
    const outstandingBalance = Math.max(0, netSales - (updated.amountReceived || 0));

    const finalSale: Sale = {
      ...updated,
      grossSales,
      netSales,
      costOfGoodsSold,
      grossProfit,
      outstandingBalance,
    };

    setSales((prev) => prev.map((s) => (s.id === updated.id ? finalSale : s)));
    logAudit('UPDATE', 'SALE', updated.id, `Updated sale of ${updated.productName}`);
  };

  const deleteSale = (id: string) => {
    const target = sales.find((s) => s.id === id);
    setSales((prev) => prev.filter((s) => s.id !== id));
    logAudit('DELETE', 'SALE', id, `Deleted sale #${id} (${target?.productName})`);
  };

  // Expense Actions
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExp: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    logAudit(
      'CREATE',
      'EXPENSE',
      newExp.id,
      `Added ${newExp.isPersonal ? 'personal' : 'business'} expense: ${newExp.name} (${newExp.amount} RWF)`
    );
    return newExp;
  };

  const updateExpense = (updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    logAudit('UPDATE', 'EXPENSE', updated.id, `Updated expense: ${updated.name}`);
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    logAudit('DELETE', 'EXPENSE', id, `Deleted expense: ${target?.name}`);
  };

  // Savings Actions
  const addSavingsGoal = (data: Omit<SavingsGoal, 'id' | 'createdAt'>): SavingsGoal => {
    const newGoal: SavingsGoal = {
      ...data,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    logAudit('CREATE', 'SAVINGS', newGoal.id, `Created savings goal: ${newGoal.name}`);
    return newGoal;
  };

  const updateSavingsGoal = (goal: SavingsGoal) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
    logAudit('UPDATE', 'SAVINGS', goal.id, `Updated savings goal: ${goal.name}`);
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    logAudit('DELETE', 'SAVINGS', id, `Deleted savings goal #${id}`);
  };

  const addSavingsTransaction = (
    data: Omit<SavingsTransaction, 'id' | 'createdAt'>
  ): SavingsTransaction => {
    const newTrans: SavingsTransaction = {
      ...data,
      id: `sav-trans-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSavingsTransactions((prev) => [newTrans, ...prev]);
    logAudit(
      'CREATE',
      'SAVINGS',
      newTrans.id,
      `Recorded savings transaction: ${newTrans.type} of ${newTrans.amount} RWF`
    );
    return newTrans;
  };

  const updateSavingsTransaction = (updated: SavingsTransaction) => {
    setSavingsTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    logAudit('UPDATE', 'SAVINGS', updated.id, `Updated savings transaction #${updated.id}`);
  };

  const deleteSavingsTransaction = (id: string) => {
    setSavingsTransactions((prev) => prev.filter((t) => t.id !== id));
    logAudit('DELETE', 'SAVINGS', id, `Deleted savings transaction #${id}`);
  };

  // Debt Payments
  const recordCustomerPayment = (
    data: Omit<CustomerPayment, 'id' | 'createdAt'>
  ): CustomerPayment => {
    const payment: CustomerPayment = {
      ...data,
      id: `cp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomerPayments((prev) => [payment, ...prev]);
    logAudit(
      'PAYMENT',
      'PAYMENT',
      payment.id,
      `Collected ${payment.amount} RWF customer debt from ${payment.customerName}`
    );
    return payment;
  };

  const recordSupplierPayment = (
    data: Omit<SupplierPayment, 'id' | 'createdAt'>
  ): SupplierPayment => {
    const payment: SupplierPayment = {
      ...data,
      id: `sp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSupplierPayments((prev) => [payment, ...prev]);
    logAudit(
      'PAYMENT',
      'PAYMENT',
      payment.id,
      `Paid ${payment.amount} RWF supplier debt to ${payment.supplierName}`
    );
    return payment;
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCust]);
    return newCust;
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt'>): Supplier => {
    const newSupp: Supplier = {
      ...supplier,
      id: `supp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [...prev, newSupp]);
    return newSupp;
  };

  // Backup & Restore
  const exportBackupJson = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      purchases,
      sales,
      expenses,
      savingsGoals,
      savingsTransactions,
      customers,
      suppliers,
      customerPayments,
      supplierPayments,
      auditLogs,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `imari-finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    logAudit('BACKUP', 'SETTINGS', 'backup', 'Exported full JSON data backup');
  };

  const importBackupJson = (fileContent: string): boolean => {
    try {
      const data = JSON.parse(fileContent);
      if (!data.products || !data.purchases || !data.sales) {
        throw new Error('Invalid backup file format');
      }
      setProducts(data.products || []);
      setPurchases(data.purchases || []);
      setSales(data.sales || []);
      setExpenses(data.expenses || []);
      setSavingsGoals(data.savingsGoals || []);
      setSavingsTransactions(data.savingsTransactions || []);
      setCustomers(data.customers || []);
      setSuppliers(data.suppliers || []);
      setCustomerPayments(data.customerPayments || []);
      setSupplierPayments(data.supplierPayments || []);
      setAuditLogs(data.auditLogs || []);
      if (data.settings) setSettings(data.settings);
      logAudit('RESTORE', 'SETTINGS', 'restore', 'Restored financial data from JSON backup');
      return true;
    } catch (err) {
      console.error('Failed to parse backup JSON:', err);
      return false;
    }
  };

  const loadAcceptanceScenario = () => {
    const demo = generateAcceptanceTestData();
    setProducts(demo.products);
    setPurchases(demo.purchases);
    setSales(demo.sales);
    setExpenses(demo.expenses);
    setSavingsTransactions(demo.savingsTransactions);
    setCustomerPayments([]);
    setSupplierPayments([]);
    setSettings((prev) => ({
      ...prev,
      openingCashBalance: demo.openingCashBalance,
    }));
    logAudit(
      'RESTORE',
      'SETTINGS',
      'acceptance_demo',
      'Loaded Section 12 Acceptance Test Scenario (100kg Rice, 30kg Sale, 5k Exp, 10k Savings)'
    );
  };

  const resetAllData = () => {
    const empty = getInitialEmptyData();
    setProducts(empty.products);
    setPurchases(empty.purchases);
    setSales(empty.sales);
    setExpenses(empty.expenses);
    setSavingsGoals(empty.savingsGoals);
    setSavingsTransactions(empty.savingsTransactions);
    setCustomers(empty.customers);
    setSuppliers(empty.suppliers);
    setCustomerPayments([]);
    setSupplierPayments([]);
    setAuditLogs([]);
    setSettings(defaultSettings);
    logAudit('CREATE', 'SETTINGS', 'reset', 'Cleared all application data');
  };

  return (
    <FinanceContext.Provider
      value={{
        activeView,
        setActiveView,
        dateFilter,
        setDateFilter,
        products,
        purchases,
        sales,
        expenses,
        savingsGoals,
        savingsTransactions,
        customers,
        suppliers,
        customerPayments,
        supplierPayments,
        auditLogs,
        settings,
        inventoryStatus,
        financialSummary,
        overallSummary,
        t,
        setLanguage,
        updateSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addPurchase,
        updatePurchase,
        deletePurchase,
        addSale,
        updateSale,
        deleteSale,
        addExpense,
        updateExpense,
        deleteExpense,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addSavingsTransaction,
        updateSavingsTransaction,
        deleteSavingsTransaction,
        addCustomer,
        addSupplier,
        recordCustomerPayment,
        recordSupplierPayment,
        exportBackupJson,
        importBackupJson,
        loadAcceptanceScenario,
        resetAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
