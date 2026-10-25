import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Calendar,
  Printer,
  Download,
  TrendingUp,
  Boxes,
  Wallet,
  Receipt,
  PiggyBank,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatRWF,
  formatQuantity,
  calculateFinancialSummary,
  filterByDateRange,
  getCurrentWeekRange,
} from '../../utils/calculations';

export const ReportsView: React.FC = () => {
  const {
    products,
    purchases,
    sales,
    expenses,
    savingsTransactions,
    customerPayments,
    supplierPayments,
    settings,
    inventoryStatus,
    t,
  } = useFinance();

  // Period: 'daily' (Today), 'weekly' (This Week), 'all' (All Time)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'all'>('weekly');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentWeek = useMemo(() => getCurrentWeekRange(), []);

  const dateRange = useMemo(() => {
    if (period === 'daily') return { startDate: todayStr, endDate: todayStr };
    if (period === 'weekly') return currentWeek;
    return undefined; // All time
  }, [period, todayStr, currentWeek]);

  // Filtered transactions for the report period
  const filteredSales = useMemo(
    () => (dateRange ? filterByDateRange(sales, dateRange.startDate, dateRange.endDate) : sales),
    [sales, dateRange]
  );

  const filteredPurchases = useMemo(
    () => (dateRange ? filterByDateRange(purchases, dateRange.startDate, dateRange.endDate) : purchases),
    [purchases, dateRange]
  );

  const filteredExpenses = useMemo(
    () => (dateRange ? filterByDateRange(expenses, dateRange.startDate, dateRange.endDate) : expenses),
    [expenses, dateRange]
  );

  const summary = useMemo(
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
        dateRange
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
      dateRange,
    ]
  );

  // Total purchases amount for this period
  const totalPurchasesAmount = filteredPurchases.reduce((acc, p) => acc + p.totalAcquisitionCost, 0);

  // Products stock summary
  const stockItems = Object.values(inventoryStatus);

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Imari Finance - Business Performance Report'],
      ['Period', period === 'daily' ? `Today (${todayStr})` : period === 'weekly' ? `This Week (${currentWeek.startDate} to ${currentWeek.endDate})` : 'All Time'],
      ['Generated Date', new Date().toLocaleDateString('en-GB')],
      ['Currency', 'RWF'],
      [],
      ['Core Financial Totals', 'Amount (RWF)'],
      ['1. Total Purchases', totalPurchasesAmount],
      ['2. Total Sales', summary.totalNetSales],
      ['3. Cost of Goods Sold (COGS)', summary.totalCOGS],
      ['4. Total Business Expenses', summary.businessOperatingExpenses],
      ['5. Gross Profit (Sales - COGS)', summary.totalGrossProfit],
      ['6. Net Profit (Gross Profit - Expenses)', summary.netProfit],
      ['7. Total Savings Balance', summary.totalSavingsBalance],
      ['8. Available Cash Balance', summary.closingCashBalance],
      ['9. Remaining Stock Value (Asset)', summary.totalStockValue],
      [],
      ['Product Name', 'Purchased Qty', 'Sold Qty', 'Remaining Stock', 'Unit Cost (WAC)', 'Total Stock Value'],
      ...stockItems.map((item) => [
        item.product.name,
        item.totalQuantityPurchased,
        item.totalQuantitySold,
        item.remainingStock,
        item.weightedAverageCost,
        item.stockValue,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial-report-${period}-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxChartVal = Math.max(
    summary.totalNetSales,
    totalPurchasesAmount,
    summary.businessOperatingExpenses,
    Math.max(0, summary.netProfit),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automatic daily, weekly, and total business financial reports in Rwandan Francs (RWF).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Period Filter Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Report Period:</span>
        </div>

        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === 'daily'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Daily (Today)
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === 'weekly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Weekly (This Week)
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* The 8 Main Required Figures Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Purchases */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            1. Total Purchases
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
            {formatRWF(totalPurchasesAmount)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {filteredPurchases.length} restock batches
          </span>
        </div>

        {/* 2. Total Sales */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            2. Total Sales
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block font-mono">
            {formatRWF(summary.totalNetSales)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {filteredSales.length} sales completed
          </span>
        </div>

        {/* 3. Total Expenses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
            3. Total Expenses
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block font-mono">
            {formatRWF(summary.businessOperatingExpenses)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Operating overhead costs
          </span>
        </div>

        {/* 4. Gross Profit */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            4. Gross Profit
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
            {formatRWF(summary.totalGrossProfit)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Sales − Cost of Goods Sold
          </span>
        </div>

        {/* 5. Net Profit */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
            5. Net Profit
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block font-mono">
            {formatRWF(summary.netProfit)}
          </span>
          <span className="text-[10px] text-emerald-800/80 dark:text-emerald-400 mt-1 block">
            Gross Profit − Expenses
          </span>
        </div>

        {/* 6. Total Savings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
            6. Total Savings
          </span>
          <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block font-mono">
            {formatRWF(summary.totalSavingsBalance)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Isolated reserves (not expense)
          </span>
        </div>

        {/* 7. Available Cash Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            7. Available Cash
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
            {formatRWF(summary.closingCashBalance)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Money received − money paid
          </span>
        </div>

        {/* 8. Remaining Stock */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            8. Remaining Stock
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
            {formatRWF(summary.totalStockValue)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {formatQuantity(summary.totalStockUnits)} units in warehouse asset
          </span>
        </div>
      </div>

      {/* Simple Visual Comparison Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Visual Financial Comparison
        </h2>

        <div className="space-y-3 text-xs">
          {/* Sales Bar */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Total Sales</span>
              <span className="font-mono font-bold">{formatRWF(summary.totalNetSales)}</span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (summary.totalNetSales / maxChartVal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Purchases Bar */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-400 font-bold">Total Purchases</span>
              <span className="font-mono font-bold">{formatRWF(totalPurchasesAmount)}</span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalPurchasesAmount / maxChartVal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Operating Expenses Bar */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-rose-600 dark:text-rose-400 font-bold">Business Expenses</span>
              <span className="font-mono font-bold">{formatRWF(summary.businessOperatingExpenses)}</span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (summary.businessOperatingExpenses / maxChartVal) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Net Profit Bar */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Net Profit</span>
              <span className="font-mono font-bold text-emerald-600">
                {formatRWF(summary.netProfit)}
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (Math.max(0, summary.netProfit) / maxChartVal) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Stock Inventory Valuation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Remaining Stock Valuation Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Unsold stock is counted as a business asset, never as a sold expense.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{stockItems.length} products</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3 text-right">Qty Purchased</th>
                <th className="px-4 py-3 text-right">Qty Sold</th>
                <th className="px-4 py-3 text-right">Remaining Stock</th>
                <th className="px-4 py-3 text-right">Unit Cost (WAC)</th>
                <th className="px-4 py-3 text-right">Total Stock Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No products recorded yet. Record purchases to populate your inventory.
                  </td>
                </tr>
              ) : (
                stockItems.map((item) => (
                  <tr
                    key={item.product.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {item.product.name}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatQuantity(item.totalQuantityPurchased, item.product.unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatQuantity(item.totalQuantitySold, item.product.unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatQuantity(item.remainingStock, item.product.unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-300">
                      {formatRWF(item.weightedAverageCost)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatRWF(item.stockValue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
