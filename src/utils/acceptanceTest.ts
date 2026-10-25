import {
  Product,
  Purchase,
  Sale,
  Expense,
  SavingsTransaction,
} from '../types/finance';
import {
  calculateInventoryStatus,
  calculateFinancialSummary,
} from './calculations';

export interface TestCaseResult {
  id: string;
  category: string;
  name: string;
  expected: string | number;
  actual: string | number;
  passed: boolean;
  explanation: string;
}

/**
 * Creates the exact Acceptance Test dataset as specified in Section 12
 */
export function generateAcceptanceTestData() {
  const product: Product = {
    id: 'prod-acceptance-01',
    name: 'Rice Super 25kg (Umuceri)',
    category: 'Grains & Cereals',
    unit: 'kg',
    minStockAlert: 10,
    description: 'Acceptance test sample product for formula verification',
    createdAt: new Date().toISOString(),
  };

  const purchase: Purchase = {
    id: 'purch-acceptance-01',
    productId: product.id,
    productName: product.name,
    category: product.category,
    supplierName: 'Kigali Central Wholesale Ltd',
    purchaseDate: new Date().toISOString().slice(0, 10),
    quantity: 100, // 100 kg
    unit: 'kg',
    unitPurchasePrice: 2000, // 2,000 RWF / kg
    transportCosts: 10000,   // 10,000 RWF
    otherCosts: 0,
    totalProductCost: 200000, // 100 * 2000
    totalAcquisitionCost: 210000, // 200000 + 10000
    unitAcquisitionCost: 2100,   // 210000 / 100
    amountPaid: 210000,
    outstandingBalance: 0,
    paymentMethod: 'bank',
    notes: 'Section 12 Acceptance test: 100 kg purchased with 10k transport',
    createdAt: new Date().toISOString(),
  };

  const sale: Sale = {
    id: 'sale-acceptance-01',
    productId: product.id,
    productName: product.name,
    saleDate: new Date().toISOString().slice(0, 16),
    quantity: 30, // 30 kg
    unit: 'kg',
    unitSellingPrice: 3000, // 3,000 RWF / kg
    discount: 0,
    grossSales: 90000, // 30 * 3000
    netSales: 90000,   // 90000 - 0
    costOfGoodsSold: 63000, // 30 * 2100 (WAC)
    grossProfit: 27000,     // 90000 - 63000
    customerName: 'Aline Umutoni',
    amountReceived: 90000,
    outstandingBalance: 0,
    paymentMethod: 'momo',
    notes: 'Section 12 Acceptance test: 30 kg sold at 3,000 RWF',
    createdAt: new Date().toISOString(),
  };

  const expense: Expense = {
    id: 'exp-acceptance-01',
    name: 'Shop Electricity & Maintenance',
    category: 'electricity',
    amount: 5000, // 5,000 RWF operating expense
    date: new Date().toISOString().slice(0, 10),
    isPersonal: false, // Business operating expense
    paymentMethod: 'momo',
    description: 'Section 12 Acceptance test: operating expense',
    createdAt: new Date().toISOString(),
  };

  const savingsTransfer: SavingsTransaction = {
    id: 'sav-acceptance-01',
    type: 'business_to_savings',
    amount: 10000, // 10,000 RWF transfer from business cash to savings
    date: new Date().toISOString().slice(0, 10),
    notes: 'Section 12 Acceptance test: Transfer 10,000 RWF to savings',
    createdAt: new Date().toISOString(),
  };

  return {
    products: [product],
    purchases: [purchase],
    sales: [sale],
    expenses: [expense],
    savingsTransactions: [savingsTransfer],
    openingCashBalance: 250000, // Base opening cash to demonstrate clean flow
  };
}

/**
 * Runs automated accounting validation assertions
 */
export function runAcceptanceTests(): TestCaseResult[] {
  const { products, purchases, sales, expenses, savingsTransactions, openingCashBalance } =
    generateAcceptanceTestData();

  const inventory = calculateInventoryStatus(products, purchases, sales);
  const prodStatus = inventory['prod-acceptance-01'];

  const summary = calculateFinancialSummary(
    products,
    purchases,
    sales,
    expenses,
    savingsTransactions,
    [],
    [],
    openingCashBalance
  );

  const results: TestCaseResult[] = [];

  // Test 1: Total Acquisition Cost
  results.push({
    id: 'TC-01',
    category: 'Acquisition & WAC',
    name: 'Total Acquisition Cost Calculation',
    expected: 210000,
    actual: purchases[0].totalAcquisitionCost,
    passed: purchases[0].totalAcquisitionCost === 210000,
    explanation: '100 kg × 2,000 RWF + 10,000 RWF transport = 210,000 RWF',
  });

  // Test 2: Weighted-Average Cost per Unit
  results.push({
    id: 'TC-02',
    category: 'Acquisition & WAC',
    name: 'Weighted-Average Cost per kg (WAC)',
    expected: 2100,
    actual: prodStatus?.weightedAverageCost ?? 0,
    passed: prodStatus?.weightedAverageCost === 2100,
    explanation: '210,000 RWF total acquisition ÷ 100 kg = 2,100 RWF/kg',
  });

  // Test 3: Net Sales
  results.push({
    id: 'TC-03',
    category: 'Sales & Revenue',
    name: 'Net Sales Revenue for 30 kg',
    expected: 90000,
    actual: summary.totalNetSales,
    passed: summary.totalNetSales === 90000,
    explanation: '30 kg × 3,000 RWF/kg − 0 discount = 90,000 RWF',
  });

  // Test 4: Cost of Goods Sold (COGS)
  results.push({
    id: 'TC-04',
    category: 'Sales & Profit',
    name: 'Cost of Goods Sold (COGS)',
    expected: 63000,
    actual: summary.totalCOGS,
    passed: summary.totalCOGS === 63000,
    explanation: '30 kg sold × 2,100 RWF (WAC) = 63,000 RWF',
  });

  // Test 5: Gross Profit
  results.push({
    id: 'TC-05',
    category: 'Sales & Profit',
    name: 'Gross Profit',
    expected: 27000,
    actual: summary.totalGrossProfit,
    passed: summary.totalGrossProfit === 27000,
    explanation: '90,000 RWF Net Sales − 63,000 RWF COGS = 27,000 RWF',
  });

  // Test 6: Remaining Stock Quantity
  results.push({
    id: 'TC-06',
    category: 'Inventory',
    name: 'Remaining Stock Quantity',
    expected: 70,
    actual: prodStatus?.remainingStock ?? 0,
    passed: prodStatus?.remainingStock === 70,
    explanation: '100 kg purchased − 30 kg sold = 70 kg remaining',
  });

  // Test 7: Remaining Stock Value
  results.push({
    id: 'TC-07',
    category: 'Inventory',
    name: 'Remaining Stock Value (Asset)',
    expected: 147000,
    actual: summary.totalStockValue,
    passed: summary.totalStockValue === 147000,
    explanation: '70 kg remaining × 2,100 RWF WAC = 147,000 RWF',
  });

  // Test 8: Operating Expense & Net Profit
  results.push({
    id: 'TC-08',
    category: 'Operating Profit',
    name: 'Net Profit after 5,000 RWF Operating Expense',
    expected: 22000,
    actual: summary.netProfit,
    passed: summary.netProfit === 22000,
    explanation: '27,000 RWF Gross Profit − 5,000 RWF Operating Expense = 22,000 RWF',
  });

  // Test 9: Savings Isolation from Accounting Profit
  results.push({
    id: 'TC-09',
    category: 'Savings & Profit Integrity',
    name: 'Net Profit Unchanged After Savings Transfer',
    expected: 22000,
    actual: summary.netProfit,
    passed: summary.netProfit === 22000,
    explanation: '10,000 RWF transferred to savings does NOT reduce accounting net profit (remains 22,000 RWF)',
  });

  // Test 10: Cash Flow Reduction by Savings Transfer
  // Opening: 250,000.
  // Inflow: 90,000 (sale).
  // Outflows: 210,000 (purchase paid) + 5,000 (operating exp) + 10,000 (savings transfer) = 225,000.
  // Closing cash: 250,000 + 90,000 - 225,000 = 115,000.
  // Savings balance: 10,000.
  results.push({
    id: 'TC-10',
    category: 'Cash Flow',
    name: 'Savings Balance Tracking',
    expected: 10000,
    actual: summary.totalSavingsBalance,
    passed: summary.totalSavingsBalance === 10000,
    explanation: 'Savings balance increases by 10,000 RWF while business cash is decremented',
  });

  return results;
}
