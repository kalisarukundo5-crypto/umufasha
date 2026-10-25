import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  ArrowRightLeft,
  Target,
  Trash2,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF } from '../../utils/calculations';
import { SavingsTransferType, SavingsGoal } from '../../types/finance';
import { Modal } from '../Modal';

interface SavingsViewProps {
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
}) => {
  const {
    savingsGoals,
    savingsTransactions,
    overallSummary,
    addSavingsGoal,
    deleteSavingsGoal,
    addSavingsTransaction,
    deleteSavingsTransaction,
    t,
  } = useFinance();

  // Transaction Modal State
  const [transType, setTransType] = useState<SavingsTransferType>('business_to_savings');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [transError, setTransError] = useState('');

  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState<number | ''>('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalNotes, setGoalNotes] = useState('');
  const [goalError, setGoalError] = useState('');

  const handleTransSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransError('');

    const numAmount = typeof amount === 'number' ? amount : 0;
    if (numAmount <= 0) {
      setTransError('Amount must be greater than 0 RWF.');
      return;
    }

    if (transType === 'business_to_savings' && numAmount > overallSummary.closingCashBalance) {
      setTransError(
        `Cannot transfer ${formatRWF(numAmount)}. Current available business cash is only ${formatRWF(
          overallSummary.closingCashBalance
        )}.`
      );
      return;
    }

    if (
      (transType === 'savings_to_business' || transType === 'personal_withdrawal') &&
      numAmount > overallSummary.totalSavingsBalance
    ) {
      setTransError(
        `Cannot withdraw ${formatRWF(numAmount)}. Total savings balance is only ${formatRWF(
          overallSummary.totalSavingsBalance
        )}.`
      );
      return;
    }

    addSavingsTransaction({
      type: transType,
      goalId: selectedGoalId || undefined,
      amount: numAmount,
      date,
      notes: notes.trim() || undefined,
    });

    setAmount('');
    setNotes('');
    onCloseAddModal();
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalError('');

    const numTarget = typeof goalTargetAmount === 'number' ? goalTargetAmount : 0;
    if (!goalName.trim()) {
      setGoalError('Please enter a savings goal name.');
      return;
    }
    if (numTarget <= 0) {
      setGoalError('Target amount must be greater than 0 RWF.');
      return;
    }

    addSavingsGoal({
      name: goalName.trim(),
      targetAmount: numTarget,
      targetDate: goalTargetDate || undefined,
      notes: goalNotes.trim() || undefined,
    });

    setGoalName('');
    setGoalTargetAmount('');
    setGoalTargetDate('');
    setGoalNotes('');
    setIsGoalModalOpen(false);
  };

  // Calculate saved amount per goal
  const goalProgress = savingsGoals.map((goal) => {
    const goalTrans = savingsTransactions.filter((t) => t.goalId === goal.id);
    const deposits = goalTrans
      .filter((t) => t.type === 'business_to_savings' || t.type === 'personal_deposit')
      .reduce((acc, t) => acc + t.amount, 0);
    const withdrawals = goalTrans
      .filter((t) => t.type === 'savings_to_business' || t.type === 'personal_withdrawal')
      .reduce((acc, t) => acc + t.amount, 0);
    const currentAmount = Math.max(0, deposits - withdrawals);
    const percentage = Math.min(100, Math.round((currentAmount / goal.targetAmount) * 100));
    return { ...goal, currentAmount, percentage };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('savings')} &amp; Personal Finances
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build personal and business reserves. Savings transfers adjust cash on hand without reducing accounting profit.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
          >
            <Target className="w-4 h-4" />
            <span>New Savings Goal</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addSavings')}</span>
          </button>
        </div>
      </div>

      {/* Accounting Notice */}
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 text-purple-600 dark:text-purple-400" />
        <span>
          <strong>Accounting Principle:</strong> {t('savingsTransferNotice')} When you transfer 10,000 RWF into savings, business cash is reduced by 10,000 RWF, but net profit remains untouched because it is an equity asset transfer, not a consumed expense.
        </span>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Total Savings Balance
          </div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
            {formatRWF(overallSummary.totalSavingsBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Held across all reserve accounts</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Deposits
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRWF(overallSummary.totalSavingsDeposits)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Business cash &amp; personal deposits</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Total Withdrawals
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatRWF(overallSummary.totalSavingsWithdrawals)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Returned to business or personal use</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Savings Goals
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {savingsGoals.length} Goals
          </div>
          <div className="text-xs text-slate-400 mt-1">Targets for growth and safety</div>
        </div>
      </div>

      {/* Savings Goals Progress Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Target Savings Goals &amp; Progress
          </h2>
          <span className="text-xs text-slate-400">{savingsGoals.length} active goals</span>
        </div>

        {goalProgress.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No savings goals established yet. Click &quot;New Savings Goal&quot; to set an emergency fund or business expansion milestone.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalProgress.map((g) => (
              <div
                key={g.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{g.name}</h3>
                    {g.notes && <p className="text-xs text-slate-400 mt-0.5">{g.notes}</p>}
                  </div>
                  <button
                    onClick={() => deleteSavingsGoal(g.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-purple-700 dark:text-purple-300 font-mono font-bold">
                      {formatRWF(g.currentAmount)}
                    </span>
                    <span className="text-slate-400">Target: {formatRWF(g.targetAmount)}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${g.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <span>{g.percentage}% completed</span>
                  {g.targetDate && <span>Target Date: {g.targetDate}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Savings Transactions Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Savings Deposits &amp; Transfers History
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {savingsTransactions.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Transaction Type</th>
                <th className="px-4 py-3">Target Goal</th>
                <th className="px-4 py-3 text-right">Amount (RWF)</th>
                <th className="px-4 py-3">Accounting Note</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {savingsTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No savings transactions recorded yet.
                  </td>
                </tr>
              ) : (
                savingsTransactions.map((tx) => {
                  const goal = savingsGoals.find((g) => g.id === tx.goalId);
                  const isDeposit =
                    tx.type === 'business_to_savings' || tx.type === 'personal_deposit';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDeposit
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isDeposit ? (
                            <ArrowDownCircle className="w-3 h-3" />
                          ) : (
                            <ArrowUpCircle className="w-3 h-3" />
                          )}
                          {tx.type === 'business_to_savings'
                            ? 'Business Cash → Savings'
                            : tx.type === 'personal_deposit'
                            ? 'Personal Deposit → Savings'
                            : tx.type === 'savings_to_business'
                            ? 'Savings → Business Cash'
                            : 'Personal Withdrawal'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {goal?.name || 'General Reserve'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                        {isDeposit ? '+' : '-'} {formatRWF(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{tx.notes || '—'}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => deleteSavingsTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Savings Transaction Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        title={t('addSavings')}
        subtitle="Transfer money between business cash and personal savings reserves"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleTransSubmit} className="space-y-4">
          {transError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{transError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Transaction Flow Type *
            </label>
            <select
              value={transType}
              onChange={(e) => setTransType(e.target.value as SavingsTransferType)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            >
              <option value="business_to_savings">
                Business Cash → Savings (Leaves business drawer, preserves profit)
              </option>
              <option value="personal_deposit">
                Personal Deposit → Savings (Private personal contribution)
              </option>
              <option value="savings_to_business">
                Savings → Business Cash (Reinject savings into business operations)
              </option>
              <option value="personal_withdrawal">
                Personal Withdrawal from Savings (Withdrawn for personal expenses)
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Allocate to Goal (Optional)
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- General Unallocated --</option>
                {savingsGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (RWF) *
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 10000"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('date')}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('notes')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly emergency reserve set aside"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCloseAddModal}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
            >
              Record Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Savings Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Create Savings Milestone Goal"
        subtitle="Set a financial reserve target for business expansion or emergency"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleGoalSubmit} className="space-y-4">
          {goalError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {goalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Goal Name *
            </label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g. Emergency Cash Buffer or Second Store"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Amount (RWF) *
              </label>
              <input
                type="number"
                min="1000"
                value={goalTargetAmount}
                onChange={(e) =>
                  setGoalTargetAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                placeholder="e.g. 500000"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={goalTargetDate}
                onChange={(e) => setGoalTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={goalNotes}
              onChange={(e) => setGoalNotes(e.target.value)}
              placeholder="e.g. 6 months rent reserve"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
            >
              Save Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
