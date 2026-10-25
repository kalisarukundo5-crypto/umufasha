import {
  Product,
  Purchase,
  Sale,
  Expense,
  SavingsTransaction,
  CustomerPayment,
  SupplierPayment,
  ProductInventoryStatus,
  FinancialSummary,
} from '../types/finance';

/**
 * Format currency in Rwandan Francs (RWF)
 * e.g., 210,000 RWF
 */
export function formatRWF(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 RWF';
  }
  const rounded = Math.round(amount);
  return `${new Intl.NumberFormat('en-US').format(rounded)} RWF`;
}

/**
 * Format quantity with proper decimals (up to 2 decimals if not whole)
 */
export function formatQuantity(qty: number, unit?: string): string {
  if (qty === undefined || qty === null || isNaN(qty)) return '0';
  const formatted = Number.isInteger(qty) ? qty.toString() : qty.toFixed(2).replace(/\.?0+$/, '');
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Computes Weighted Average Cost (WAC) and inventory status for each product
 */
export function calculateInventoryStatus(
  products: Product[],
  purchases: Purchase[],
  sales: Sale[],
  targetProductId?: string
): Record<string, ProductInventoryStatus> {
  const result: Record<string, ProductInventoryStatus> = {};

  products.forEach((prod) => {
    if (targetProductId && prod.id !== targetProductId) return;

    const prodPurchases = purchases.filter((p) => p.productId === prod.id);
    const prodSales = sales.filter((s) => s.productId === prod.id);

    const totalQuantityPurchased = prodPurchases.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const totalAcquisitionCost = prodPurchases.reduce(
      (acc, p) => acc + (p.totalAcquisitionCost || 0),
      0
    );

    // Weighted-Average Cost = Total Acquisition Cost / Total Quantity Purchased
    const weightedAverageCost =
      totalQuantityPurchased > 0 ? totalAcquisitionCost / totalQuantityPurchased : 0;

    const totalQuantitySold = prodSales.reduce((acc, s) => acc + (s.quantity || 0), 0);
    const remainingStock = Math.max(0, totalQuantityPurchased - totalQuantitySold);
    const stockValue = remainingStock * weightedAverageCost;

    const totalSalesRevenue = prodSales.reduce((acc, s) => acc + (s.netSales || 0), 0);
    const totalCOGS = prodSales.reduce((acc, s) => acc + (s.costOfGoodsSold || 0), 0);
    const totalGrossProfit = totalSalesRevenue - totalCOGS;
    const profitMarginPercentage =
      totalSalesRevenue > 0 ? (totalGrossProfit / totalSalesRevenue) * 100 : 0;

    const minAlert = prod.minStockAlert ?? 5;
    const isLowStock = remainingStock <= minAlert;

    result[prod.id] = {
      product: prod,
      totalQuantityPurchased,
      totalAcquisitionCost,
      weightedAverageCost,
      totalQuantitySold,
      remainingStock,
      stockValue,
      totalSalesRevenue,
      totalCOGS,
      totalGrossProfit,
      profitMarginPercentage,
      isLowStock,
    };
  });

  return result;
}

/**
 * Filter items by date range (inclusive)
 */
export function filterByDateRange<T extends { date?: string; purchaseDate?: string; saleDate?: string; paymentDate?: string }>(
  items: T[],
  startDate?: string,
  endDate?: string
): T[] {
  if (!startDate && !endDate) return items;

  return items.filter((item) => {
    const rawDate = item.date || item.purchaseDate || item.saleDate || item.paymentDate;
    if (!rawDate) return true;
    const itemDate = rawDate.slice(0, 10); // Format YYYY-MM-DD
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  });
}

/**
 * Computes complete financial summary reconciling sales, COGS, expenses,
 * cash flow, customer/supplier balances, and savings.
 */
export function calculateFinancialSummary(
  products: Product[],
  purchases: Purchase[],
  sales: Sale[],
  expenses: Expense[],
  savingsTransactions: SavingsTransaction[],
  customerPayments: CustomerPayment[],
  supplierPayments: SupplierPayment[],
  openingCashBalance = 0,
  dateFilter?: { startDate?: string; endDate?: string }
): FinancialSummary {
  // If date filter is provided, filter transactions
  const filteredPurchases = dateFilter
    ? filterByDateRange(purchases, dateFilter.startDate, dateFilter.endDate)
    : purchases;
  const filteredSales = dateFilter
    ? filterByDateRange(sales, dateFilter.startDate, dateFilter.endDate)
    : sales;
  const filteredExpenses = dateFilter
    ? filterByDateRange(expenses, dateFilter.startDate, dateFilter.endDate)
    : expenses;
  const filteredSavings = dateFilter
    ? filterByDateRange(savingsTransactions, dateFilter.startDate, dateFilter.endDate)
    : savingsTransactions;
  const filteredCustomerPayments = dateFilter
    ? filterByDateRange(customerPayments, dateFilter.startDate, dateFilter.endDate)
    : customerPayments;
  const filteredSupplierPayments = dateFilter
    ? filterByDateRange(supplierPayments, dateFilter.startDate, dateFilter.endDate)
    : supplierPayments;

  // 1. Sales & Revenue
  const totalGrossSales = filteredSales.reduce((acc, s) => acc + (s.grossSales || 0), 0);
  const totalDiscounts = filteredSales.reduce((acc, s) => acc + (s.discount || 0), 0);
  const totalNetSales = filteredSales.reduce((acc, s) => acc + (s.netSales || 0), 0);
  const totalCOGS = filteredSales.reduce((acc, s) => acc + (s.costOfGoodsSold || 0), 0);
  const totalGrossProfit = totalNetSales - totalCOGS;

  // 2. Expenses - Segregated Business vs Personal
  const businessOperatingExpenses = filteredExpenses
    .filter((e) => !e.isPersonal)
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const personalExpenses = filteredExpenses
    .filter((e) => e.isPersonal)
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const totalExpenses = businessOperatingExpenses + personalExpenses;

  // 3. Profits
  // Operating Profit = Gross Profit - Business Operating Expenses
  // Personal expenses and savings transfers are NEVER deducted from business profit!
  const operatingProfit = totalGrossProfit - businessOperatingExpenses;
  const netProfit = operatingProfit; // Assuming standard operating setup

  // 4. Inventory Valuation (Always calculated over lifetime purchases & sales to date)
  const inventoryStatus = calculateInventoryStatus(products, purchases, sales);
  const totalStockValue = Object.values(inventoryStatus).reduce((acc, s) => acc + s.stockValue, 0);
  const totalStockUnits = Object.values(inventoryStatus).reduce((acc, s) => acc + s.remainingStock, 0);

  // 5. Debts & Balances
  // Customer receivables: unpaid sales balances minus any additional recorded customer repayments
  const customerDebtFromSales = sales.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);
  const customerRepayments = customerPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalCustomerDebt = Math.max(0, customerDebtFromSales - customerRepayments);

  // Supplier payables: unpaid purchase balances minus any additional recorded supplier repayments
  const supplierDebtFromPurchases = purchases.reduce((acc, p) => acc + (p.outstandingBalance || 0), 0);
  const supplierRepayments = supplierPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalSupplierDebt = Math.max(0, supplierDebtFromPurchases - supplierRepayments);

  // 6. Cash Flow Tracking
  // Inflows:
  // - Cash collected at the moment of sale (s.amountReceived for cash/momo/bank, excluding purely credit)
  const cashSalesReceived = filteredSales.reduce((acc, s) => {
    // If credit with 0 down payment, amountReceived is 0
    return acc + (s.amountReceived || 0);
  }, 0);

  // - Subsequent debt payments collected from customers
  const customerDebtCollected = filteredCustomerPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // - Savings transferred back into business cash
  const savingsToBusinessCash = filteredSavings
    .filter((t) => t.type === 'savings_to_business')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalCashInflows = cashSalesReceived + customerDebtCollected + savingsToBusinessCash;

  // Outflows:
  // - Immediate cash paid for purchases
  const supplierPurchasesPaid = filteredPurchases.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
  // - Subsequent debt payments paid to suppliers
  const supplierDebtPaid = filteredSupplierPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  // - Business operating expenses paid in cash/momo/bank
  const operatingExpensesCashPaid = businessOperatingExpenses;
  // - Personal withdrawals taken from cash
  const personalWithdrawalsCash = personalExpenses;
  // - Transfers from business cash to savings
  const transfersToSavingsFromCash = filteredSavings
    .filter((t) => t.type === 'business_to_savings')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalCashOutflows =
    supplierPurchasesPaid +
    supplierDebtPaid +
    operatingExpensesCashPaid +
    personalWithdrawalsCash +
    transfersToSavingsFromCash;

  const closingCashBalance = openingCashBalance + totalCashInflows - totalCashOutflows;

  // 7. Savings Totals
  const totalSavingsDeposits = savingsTransactions
    .filter((t) => t.type === 'business_to_savings' || t.type === 'personal_deposit')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalSavingsWithdrawals = savingsTransactions
    .filter((t) => t.type === 'savings_to_business' || t.type === 'personal_withdrawal')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalSavingsBalance = Math.max(0, totalSavingsDeposits - totalSavingsWithdrawals);

  return {
    totalGrossSales,
    totalDiscounts,
    totalNetSales,
    totalCOGS,
    totalGrossProfit,
    businessOperatingExpenses,
    personalExpenses,
    totalExpenses,
    operatingProfit,
    netProfit,
    totalStockValue,
    totalStockUnits,
    totalCustomerDebt,
    totalSupplierDebt,
    openingCashBalance,
    cashSalesReceived,
    customerDebtCollected,
    totalCashInflows,
    supplierPurchasesPaid,
    supplierDebtPaid,
    operatingExpensesCashPaid,
    personalWithdrawalsCash,
    transfersToSavingsFromCash,
    savingsToBusinessCash,
    totalCashOutflows,
    closingCashBalance,
    totalSavingsBalance,
    totalSavingsDeposits,
    totalSavingsWithdrawals,
  };
}

/**
 * Returns the current ISO week date range (Monday to Sunday)
 */
export function getCurrentWeekRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const day = now.getDay();
  // day: 0 is Sun, 1 is Mon...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);

  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const toYMD = (d: Date) => d.toISOString().slice(0, 10);
  return {
    startDate: toYMD(mon),
    endDate: toYMD(sun),
  };
}

/**
 * Returns date range for "This Month"
 */
export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toYMD = (d: Date) => d.toISOString().slice(0, 10);
  return {
    startDate: toYMD(start),
    endDate: toYMD(end),
  };
}
