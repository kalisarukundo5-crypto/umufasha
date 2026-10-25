import React from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Scale,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Building2,
  Users,
  Boxes,
  Layers,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF } from '../../utils/calculations';
import { MetricCard } from '../MetricCard';

export const CashFlowView: React.FC = () => {
  const { overallSummary, financialSummary, t, settings } = useFinance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('cashFlow')} &amp; Reconciliation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Actual physical and digital cash movement in Rwandan Francs (RWF). Reconciles cash on hand with accounting profit.
        </p>
      </div>

      {/* Primary Cash Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Wallet className="w-4 h-4 text-blue-500" />
            {t('openingCash')}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRWF(overallSummary.openingCashBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Initial drawer balance baseline</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            Total Cash Inflows
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            + {formatRWF(overallSummary.totalCashInflows)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Cash sales + Debt repayments collected</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <ArrowDownRight className="w-4 h-4" />
            Total Cash Outflows
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            - {formatRWF(overallSummary.totalCashOutflows)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Purchases + Expenses + Savings transfers</div>
        </div>
      </div>

      {/* Main Closing Balance Spotlight */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Closing Cash Balance (Drawer &amp; Accounts)
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2 font-mono">
              {formatRWF(overallSummary.closingCashBalance)}
            </div>
            <p className="text-xs text-blue-200/80 mt-1.5 max-w-xl">
              Calculated exclusively from actual cash inflows and outflows, not from sales revenues or invoiced debts.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 text-xs space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Reconciliation Equation
            </div>
            <div className="font-mono text-slate-200">
              Opening Cash: <span className="font-bold">{formatRWF(overallSummary.openingCashBalance)}</span>
            </div>
            <div className="font-mono text-emerald-300">
              + Inflows: <span className="font-bold">{formatRWF(overallSummary.totalCashInflows)}</span>
            </div>
            <div className="font-mono text-rose-300">
              - Outflows: <span className="font-bold">{formatRWF(overallSummary.totalCashOutflows)}</span>
            </div>
            <div className="border-t border-white/20 pt-1.5 font-mono font-bold text-white text-sm">
              = Closing: {formatRWF(overallSummary.closingCashBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Statement vs Accounting Profit Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Inflows & Outflows Detail */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeftIcon className="w-5 h-5 text-blue-600" />
            Detailed Cash Flow Statement
          </h2>

          <div className="space-y-4 text-xs">
            {/* Inflows Section */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block uppercase tracking-wider text-[11px]">
                Cash Inflows (Sources of Cash)
              </span>
              <div className="flex justify-between py-1 border-b border-emerald-100/60 dark:border-emerald-900/30">
                <span className="text-slate-600 dark:text-slate-400">Cash Received from Sales:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatRWF(overallSummary.cashSalesReceived)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100/60 dark:border-emerald-900/30">
                <span className="text-slate-600 dark:text-slate-400">Customer Debts Collected:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatRWF(overallSummary.customerDebtCollected)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100/60 dark:border-emerald-900/30">
                <span className="text-slate-600 dark:text-slate-400">Savings Transferred to Business:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatRWF(overallSummary.savingsToBusinessCash)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1 text-emerald-700 dark:text-emerald-400 text-sm">
                <span>Total Cash Inflows:</span>
                <span className="font-mono">+ {formatRWF(overallSummary.totalCashInflows)}</span>
              </div>
            </div>

            {/* Outflows Section */}
            <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2">
              <span className="font-bold text-rose-900 dark:text-rose-300 block uppercase tracking-wider text-[11px]">
                Cash Outflows (Uses of Cash)
              </span>
              <div className="flex justify-between py-1 border-b border-rose-100/60 dark:border-rose-900/30">
                <span className="text-slate-600 dark:text-slate-400">Paid for Purchases / Stock:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatRWF(overallSummary.supplierPurchasesPaid)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-rose-100/60 dark:border-rose-900/30">
                <span className="text-slate-600 dark:text-slate-400">Supplier Debt Repayments:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatRWF(overallSummary.supplierDebtPaid)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-rose-100/60 dark:border-rose-900/30">
                <span className="text-slate-600 dark:text-slate-400">Operating Expenses Paid:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatRWF(overallSummary.operatingExpensesCashPaid)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-rose-100/60 dark:border-rose-900/30">
                <span className="text-slate-600 dark:text-slate-400">Personal Withdrawals from Drawer:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatRWF(overallSummary.personalWithdrawalsCash)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-rose-100/60 dark:border-rose-900/30">
                <span className="text-slate-600 dark:text-slate-400">Transferred into Savings:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatRWF(overallSummary.transfersToSavingsFromCash)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1 text-rose-700 dark:text-rose-400 text-sm">
                <span>Total Cash Outflows:</span>
                <span className="font-mono">- {formatRWF(overallSummary.totalCashOutflows)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cash vs Profit Audit Reconciliation Matrix */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              Cash Balance vs. Accounting Profit
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
              Audit Guard
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Many business owners mistake available cash for profit. This audit table explains why your cash on hand and accounting profit are different:
          </p>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                <tr>
                  <th className="px-3 py-2 text-left">Financial Factor</th>
                  <th className="px-3 py-2 text-center">Cash Impact</th>
                  <th className="px-3 py-2 text-center">Profit Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="px-3 py-2.5 font-medium">Unsold Goods in Stock ({formatRWF(overallSummary.totalStockValue)})</td>
                  <td className="px-3 py-2.5 text-center text-rose-600 font-bold">Reduces Cash (Paid)</td>
                  <td className="px-3 py-2.5 text-center text-emerald-600 font-bold">No Expense (Asset)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-medium">Customer Credit Pending ({formatRWF(overallSummary.totalCustomerDebt)})</td>
                  <td className="px-3 py-2.5 text-center text-slate-400">Not in drawer yet</td>
                  <td className="px-3 py-2.5 text-center text-emerald-600 font-bold">Counted in Net Sales</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-medium">Transfers to Savings ({formatRWF(overallSummary.totalSavingsBalance)})</td>
                  <td className="px-3 py-2.5 text-center text-rose-600 font-bold">Reduces Cash</td>
                  <td className="px-3 py-2.5 text-center text-slate-500">Zero impact on profit</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-medium">Personal Drawings ({formatRWF(overallSummary.personalExpenses)})</td>
                  <td className="px-3 py-2.5 text-center text-rose-600 font-bold">Reduces Cash</td>
                  <td className="px-3 py-2.5 text-center text-slate-500">Zero impact on business profit</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Accounting Net Profit:</span>
              <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {formatRWF(overallSummary.netProfit)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Closing Cash on Hand:</span>
              <span className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
                {formatRWF(overallSummary.closingCashBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Non-Cash Balance Sheet Elements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Stock Asset Value"
          value={formatRWF(overallSummary.totalStockValue)}
          subtext="Unsold products in inventory"
          icon={<Boxes className="w-5 h-5" />}
          variant="blue"
          tooltip="This capital is tied up in physical merchandise."
        />

        <MetricCard
          title="Customer Receivables"
          value={formatRWF(overallSummary.totalCustomerDebt)}
          subtext="Cash yet to be collected"
          icon={<Users className="w-5 h-5" />}
          variant={overallSummary.totalCustomerDebt > 0 ? 'amber' : 'slate'}
          tooltip="Cash that will enter your drawer once customers pay."
        />

        <MetricCard
          title="Supplier Payables"
          value={formatRWF(overallSummary.totalSupplierDebt)}
          subtext="Cash owed to wholesalers"
          icon={<Building2 className="w-5 h-5" />}
          variant={overallSummary.totalSupplierDebt > 0 ? 'rose' : 'slate'}
          tooltip="Cash that must leave your drawer to settle supplier debt."
        />
      </div>
    </div>
  );
};

function ArrowRightLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </svg>
  );
}
