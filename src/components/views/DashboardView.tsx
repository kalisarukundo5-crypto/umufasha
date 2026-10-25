import React from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Receipt,
  FileBarChart2,
  TrendingUp,
  Wallet,
  Boxes,
  PiggyBank,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF, formatQuantity } from '../../utils/calculations';

interface DashboardViewProps {
  onOpenPurchaseModal: () => void;
  onOpenSaleModal: () => void;
  onOpenExpenseSavingsModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPurchaseModal,
  onOpenSaleModal,
  onOpenExpenseSavingsModal,
}) => {
  const {
    financialSummary,
    overallSummary,
    purchases,
    sales,
    expenses,
    savingsTransactions,
    setActiveView,
    deletePurchase,
    deleteSale,
    deleteExpense,
    deleteSavingsTransaction,
    t,
  } = useFinance();

  // Combine recent transactions from purchases, sales, expenses, and savings
  const recentPurchases = purchases.slice(0, 3).map((p) => ({
    id: p.id,
    type: 'purchase' as const,
    title: `Purchase: ${p.productName}`,
    subtitle: `${formatQuantity(p.quantity, p.unit)} purchased`,
    amount: p.totalAcquisitionCost,
    date: p.purchaseDate,
    onDelete: () => deletePurchase(p.id),
  }));

  const recentSales = sales.slice(0, 3).map((s) => ({
    id: s.id,
    type: 'sale' as const,
    title: `Sale: ${s.productName}`,
    subtitle: `${formatQuantity(s.quantity, s.unit)} sold • Profit: ${formatRWF(s.grossProfit)}`,
    amount: s.netSales,
    date: s.saleDate.slice(0, 10),
    onDelete: () => deleteSale(s.id),
  }));

  const recentExpenses = expenses.slice(0, 3).map((e) => ({
    id: e.id,
    type: 'expense' as const,
    title: `Expense: ${e.name}`,
    subtitle: `${e.category} operating cost`,
    amount: e.amount,
    date: e.date,
    onDelete: () => deleteExpense(e.id),
  }));

  const recentSavings = savingsTransactions.slice(0, 3).map((s) => ({
    id: s.id,
    type: 'savings' as const,
    title: `Savings: ${s.type === 'business_to_savings' ? 'Deposit' : 'Withdrawal'}`,
    subtitle: s.notes || 'Reserve fund adjustment',
    amount: s.amount,
    date: s.date,
    onDelete: () => deleteSavingsTransaction(s.id),
  }));

  const allRecent = [...recentPurchases, ...recentSales, ...recentExpenses, ...recentSavings]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Business Financial Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Simple, automated Rwandan Francs (RWF) financial tracking for your business.
        </p>
      </div>

      {/* The 4 Main Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Button 1: Add Purchase */}
        <button
          onClick={onOpenPurchaseModal}
          className="flex flex-col items-center justify-center p-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] group"
        >
          <div className="p-3 rounded-xl bg-white/20 text-white mb-2 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-white">Add Purchase</span>
          <span className="text-[11px] text-blue-100">Restock stock &amp; costs</span>
        </button>

        {/* Button 2: Record Sale */}
        <button
          onClick={onOpenSaleModal}
          className="flex flex-col items-center justify-center p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] group"
        >
          <div className="p-3 rounded-xl bg-white/20 text-white mb-2 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-white">Record Sale</span>
          <span className="text-[11px] text-emerald-100">Deduct stock &amp; earn</span>
        </button>

        {/* Button 3: Add Expense / Savings */}
        <button
          onClick={onOpenExpenseSavingsModal}
          className="flex flex-col items-center justify-center p-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] group"
        >
          <div className="p-3 rounded-xl bg-white/20 text-white mb-2 group-hover:scale-110 transition-transform">
            <Receipt className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-white">Add Expense / Savings</span>
          <span className="text-[11px] text-purple-100">Overhead &amp; reserves</span>
        </button>

        {/* Button 4: View Reports */}
        <button
          onClick={() => setActiveView('reports')}
          className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md transition-all hover:scale-[1.02] group"
        >
          <div className="p-3 rounded-xl bg-white/20 text-white mb-2 group-hover:scale-110 transition-transform">
            <FileBarChart2 className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-white">View Reports</span>
          <span className="text-[11px] text-slate-300">Daily &amp; weekly charts</span>
        </button>
      </div>

      {/* Main Financial Totals Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Available Cash */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>Available Cash</span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatRWF(overallSummary.closingCashBalance)}
          </div>
          <span className="text-[10px] text-slate-400">Cash in drawer</span>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Net Profit</span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-1">
            {formatRWF(overallSummary.netProfit)}
          </div>
          <span className="text-[10px] text-emerald-800/80 dark:text-emerald-400">
            Gross profit − expenses
          </span>
        </div>

        {/* Total Sales */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <ShoppingCart className="w-4 h-4 text-blue-500" />
            <span>Total Sales</span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
            {formatRWF(overallSummary.totalNetSales)}
          </div>
          <span className="text-[10px] text-slate-400">Revenue received</span>
        </div>

        {/* Stock Value */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Boxes className="w-4 h-4 text-emerald-500" />
            <span>Stock Value</span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatRWF(overallSummary.totalStockValue)}
          </div>
          <span className="text-[10px] text-slate-400">Unsold inventory asset</span>
        </div>

        {/* Operating Expenses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Total Expenses</span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
            {formatRWF(overallSummary.businessOperatingExpenses)}
          </div>
          <span className="text-[10px] text-slate-400">Overhead paid</span>
        </div>

        {/* Total Savings */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            <PiggyBank className="w-4 h-4" />
            <span>Total Savings</span>
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
            {formatRWF(overallSummary.totalSavingsBalance)}
          </div>
          <span className="text-[10px] text-slate-400">Saved reserves</span>
        </div>
      </div>

      {/* Recent Transactions List with Delete / Action */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {allRecent.length} latest entries
          </span>
        </div>

        {allRecent.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No entries recorded yet. Use the 4 buttons above to add your first purchase, sale, or expense.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {allRecent.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'sale'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.type === 'purchase'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : item.type === 'expense'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    }`}
                  >
                    {item.type === 'sale' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : item.type === 'purchase' ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : item.type === 'expense' ? (
                      <Receipt className="w-4 h-4" />
                    ) : (
                      <PiggyBank className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.subtitle} • <span className="font-mono">{item.date}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs sm:text-sm font-mono font-bold ${
                      item.type === 'sale'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {item.type === 'sale' ? '+' : '-'} {formatRWF(item.amount)}
                  </span>
                  <button
                    onClick={item.onDelete}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
