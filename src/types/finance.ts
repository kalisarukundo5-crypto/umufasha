export type UnitOfMeasure = 'kg' | 'pcs' | 'liters' | 'bags' | 'boxes';

export type PaymentMethod = 'cash' | 'momo' | 'bank' | 'credit';

export type ExpenseCategoryType = 
  | 'transport'
  | 'rent'
  | 'electricity'
  | 'salaries'
  | 'food'
  | 'communication'
  | 'packaging'
  | 'taxes'
  | 'maintenance'
  | 'other'
  | string;

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: UnitOfMeasure;
  minStockAlert?: number;
  description?: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  category: string;
  supplierId?: string;
  supplierName: string;
  purchaseDate: string; // YYYY-MM-DD
  quantity: number;
  unit: UnitOfMeasure;
  unitPurchasePrice: number; // RWF
  transportCosts: number;    // RWF
  otherCosts: number;        // RWF
  // Calculations:
  totalProductCost: number;   // quantity * unitPurchasePrice
  totalAcquisitionCost: number; // totalProductCost + transportCosts + otherCosts
  unitAcquisitionCost: number;  // totalAcquisitionCost / quantity
  amountPaid: number;
  outstandingBalance: number;  // totalAcquisitionCost - amountPaid
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  saleDate: string; // YYYY-MM-DDTHH:mm
  quantity: number;
  unit: UnitOfMeasure;
  unitSellingPrice: number; // RWF
  discount: number;         // RWF
  // Calculations:
  grossSales: number;       // quantity * unitSellingPrice
  netSales: number;         // grossSales - discount
  costOfGoodsSold: number;  // quantity * weightedAverageCostAtSale
  grossProfit: number;      // netSales - costOfGoodsSold
  customerId?: string;
  customerName?: string;
  amountReceived: number;
  outstandingBalance: number; // netSales - amountReceived
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  saleId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategoryType;
  amount: number;
  date: string;
  isPersonal: boolean; // Crucial distinction: business vs personal
  paymentMethod: PaymentMethod;
  description?: string;
  receiptNote?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate?: string;
  category?: string;
  notes?: string;
  createdAt: string;
}

export type SavingsTransferType = 
  | 'business_to_savings'  // Money leaves business cash into savings. Reduces cash, does NOT reduce accounting profit.
  | 'savings_to_business'  // Savings back into business cash
  | 'personal_deposit'     // Personal money added directly to savings
  | 'personal_withdrawal'; // Money withdrawn from savings for personal use

export interface SavingsTransaction {
  id: string;
  type: SavingsTransferType;
  goalId?: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYMENT' | 'BACKUP' | 'RESTORE';
  entityType: 'PURCHASE' | 'SALE' | 'EXPENSE' | 'SAVINGS' | 'PAYMENT' | 'SETTINGS';
  entityId: string;
  summary: string;
  timestamp: string;
  previousData?: unknown;
  newData?: unknown;
}

export interface AppSettings {
  currency: string;
  allowNegativeStock: boolean;
  language: 'en' | 'rw';
  openingCashBalance: number;
  businessName: string;
  ownerName: string;
  contactPhone: string;
  customCategories: string[];
}

export interface ProductInventoryStatus {
  product: Product;
  totalQuantityPurchased: number;
  totalAcquisitionCost: number;
  weightedAverageCost: number; // Total acquisition cost / Total quantity purchased
  totalQuantitySold: number;
  remainingStock: number;       // totalQuantityPurchased - totalQuantitySold
  stockValue: number;          // remainingStock * weightedAverageCost
  totalSalesRevenue: number;
  totalCOGS: number;
  totalGrossProfit: number;
  profitMarginPercentage: number;
  isLowStock: boolean;
}

export interface FinancialSummary {
  // Sales & Revenue
  totalGrossSales: number;
  totalDiscounts: number;
  totalNetSales: number;
  totalCOGS: number;
  totalGrossProfit: number;

  // Expenses
  businessOperatingExpenses: number;
  personalExpenses: number;
  totalExpenses: number;

  // Profits
  operatingProfit: number; // Gross Profit - Business Operating Expenses
  netProfit: number;       // Operating Profit - Other Business Expenses

  // Inventory
  totalStockValue: number;
  totalStockUnits: number;

  // Debts & Balances
  totalCustomerDebt: number; // Receivables (unpaid invoices)
  totalSupplierDebt: number; // Payables (unpaid purchases)

  // Cash Flow
  openingCashBalance: number;
  cashSalesReceived: number;
  customerDebtCollected: number;
  totalCashInflows: number;
  
  supplierPurchasesPaid: number;
  supplierDebtPaid: number;
  operatingExpensesCashPaid: number;
  personalWithdrawalsCash: number;
  transfersToSavingsFromCash: number;
  savingsToBusinessCash: number;
  totalCashOutflows: number;
  
  closingCashBalance: number;

  // Savings
  totalSavingsBalance: number;
  totalSavingsDeposits: number;
  totalSavingsWithdrawals: number;
}
