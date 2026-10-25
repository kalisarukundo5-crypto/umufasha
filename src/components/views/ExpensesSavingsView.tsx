import React, { useState } from 'react';
import {
  Receipt,
  PiggyBank,
  Plus,
  Trash2,
  Edit2,
  Briefcase,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF } from '../../utils/calculations';
import { Expense, SavingsTransaction, SavingsTransferType } from '../../types/finance';
import { Modal } from '../Modal';

interface ExpensesSavingsViewProps {
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

export const ExpensesSavingsView: React.FC<ExpensesSavingsViewProps> = ({
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
}) => {
  const {
    expenses,
    savingsTransactions,
    overallSummary,
    addExpense,
    updateExpense,
    deleteExpense,
    addSavingsTransaction,
    updateSavingsTransaction,
    deleteSavingsTransaction,
    t,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'expenses' | 'savings'>('expenses');

  // Edit Expense State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  // Edit Savings State
  const [editingSavings, setEditingSavings] = useState<SavingsTransaction | null>(null);

  // Modal Form Mode (Expense or Savings)
  const [modalMode, setModalMode] = useState<'expense' | 'savings'>('expense');

  // Expense form fields
  const [expName, setExpName] = useState('');
  const [expCategory, setExpCategory] = useState('rent');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expDescription, setExpDescription] = useState('');
  const [expError, setExpError] = useState('');

  // Savings form fields
  const [savType, setSavType] = useState<SavingsTransferType>('business_to_savings');
  const [savAmount, setSavAmount] = useState<number | ''>('');
  const [savDate, setSavDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [savNotes, setSavNotes] = useState('');
  const [savError, setSavError] = useState('');

  // Open Add modal with specific mode
  const openModalFor = (mode: 'expense' | 'savings') => {
    setModalMode(mode);
    setEditingExpense(null);
    setEditingSavings(null);
    setExpName('');
    setExpAmount('');
    setExpDescription('');
    setExpError('');
    setSavAmount('');
    setSavNotes('');
    setSavError('');
    onOpenAddModal();
  };

  const openEditExpense = (item: Expense) => {
    setModalMode('expense');
    setEditingExpense(item);
    setExpName(item.name);
    setExpCategory(item.category);
    setExpAmount(item.amount);
    setExpDate(item.date);
    setExpDescription(item.description || '');
    setExpError('');
    onOpenAddModal();
  };

  const openEditSavings = (item: SavingsTransaction) => {
    setModalMode('savings');
    setEditingSavings(item);
    setSavType(item.type);
    setSavAmount(item.amount);
    setSavDate(item.date);
    setSavNotes(item.notes || '');
    setSavError('');
    onOpenAddModal();
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExpError('');
    const amt = typeof expAmount === 'number' ? expAmount : 0;
    if (amt <= 0) {
      setExpError('Amount must be greater than 0 RWF.');
      return;
    }
    if (!expName.trim()) {
      setExpError('Please enter an expense description.');
      return;
    }

    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        name: expName.trim(),
        category: expCategory,
        amount: amt,
        date: expDate,
        description: expDescription.trim() || undefined,
      });
    } else {
      addExpense({
        name: expName.trim(),
        category: expCategory,
        amount: amt,
        date: expDate,
        isPersonal: false,
        paymentMethod: 'cash',
        description: expDescription.trim() || undefined,
      });
    }

    onCloseAddModal();
  };

  const handleSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavError('');
    const amt = typeof savAmount === 'number' ? savAmount : 0;
    if (amt <= 0) {
      setSavError('Amount must be greater than 0 RWF.');
      return;
    }

    if (editingSavings) {
      updateSavingsTransaction({
        ...editingSavings,
        type: savType,
        amount: amt,
        date: savDate,
        notes: savNotes.trim() || undefined,
      });
    } else {
      addSavingsTransaction({
        type: savType,
        amount: amt,
        date: savDate,
        notes: savNotes.trim() || undefined,
      });
    }

    onCloseAddModal();
  };

  const totalBusinessExpenses = expenses
    .filter((e) => !e.isPersonal)
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('expensesAndSavings')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track business operating costs and savings reserves. Savings adjust available cash, but never reduce profit.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => openModalFor('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
          <button
            onClick={() => openModalFor('savings')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
          >
            <PiggyBank className="w-4 h-4" />
            <span>+ Deposit / Withdraw Savings</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Receipt className="w-4 h-4" />
            Total Business Expenses
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatRWF(totalBusinessExpenses)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {expenses.length} recorded business expenses
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <PiggyBank className="w-4 h-4" />
            Total Savings Balance
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {formatRWF(overallSummary.totalSavingsBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Deposited: {formatRWF(overallSummary.totalSavingsDeposits)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-4 h-4" />
            Available Cash on Hand
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRWF(overallSummary.closingCashBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Physical &amp; mobile cash available to spend
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'expenses'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4 text-rose-500" />
          <span>Business Expenses ({expenses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('savings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'savings'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PiggyBank className="w-4 h-4 text-purple-500" />
          <span>Savings Transactions ({savingsTransactions.length})</span>
        </button>
      </div>

      {/* Tab 1: Expenses List */}
      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Business Operating Expenses
            </h2>
            <span className="text-xs text-slate-400 font-mono">{expenses.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Expense Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount (RWF)</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                      No expenses recorded yet. Click &quot;+ Add Expense&quot; above to log rent, electricity, or supplies.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {exp.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap capitalize text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        - {formatRWF(exp.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditExpense(exp)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Savings List */}
      {activeTab === 'savings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Savings Deposits &amp; Withdrawals
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {savingsTransactions.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Transfer Type</th>
                  <th className="px-4 py-3 text-right">Amount (RWF)</th>
                  <th className="px-4 py-3">Description / Note</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {savingsTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">
                      No savings recorded yet. Use &quot;+ Deposit / Withdraw Savings&quot; to transfer funds into your reserves.
                    </td>
                  </tr>
                ) : (
                  savingsTransactions.map((tx) => {
                    const isDeposit =
                      tx.type === 'business_to_savings' || tx.type === 'personal_deposit';
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="px-4 py-3 font-bold whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isDeposit
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {isDeposit ? (
                              <ArrowDownCircle className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpCircle className="w-3.5 h-3.5" />
                            )}
                            {tx.type === 'business_to_savings'
                              ? 'Deposit (Business Cash → Savings)'
                              : tx.type === 'savings_to_business'
                              ? 'Withdraw (Savings → Business Cash)'
                              : 'Personal Savings Transfer'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                          {isDeposit ? '+' : '-'} {formatRWF(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{tx.notes || '—'}</td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditSavings(tx)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              title="Edit entry"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteSavingsTransaction(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unified Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        title={
          modalMode === 'expense'
            ? editingExpense
              ? 'Edit Business Expense'
              : 'Add Business Expense'
            : editingSavings
            ? 'Edit Savings Transaction'
            : 'Record Savings Deposit / Withdrawal'
        }
        subtitle={
          modalMode === 'expense'
            ? 'Business expenses reduce your operating and net profit'
            : 'Savings transfers adjust cash on hand without reducing accounting profit'
        }
        maxWidth="max-w-md"
      >
        {/* Toggle Mode inside Modal if not editing */}
        {!editingExpense && !editingSavings && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setModalMode('expense')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                modalMode === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Business Expense
            </button>
            <button
              type="button"
              onClick={() => setModalMode('savings')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                modalMode === 'savings'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Savings Deposit / Withdrawal
            </button>
          </div>
        )}

        {modalMode === 'expense' ? (
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            {expError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{expError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expense Name / Item *
              </label>
              <input
                type="text"
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                placeholder="e.g. Shop monthly rent or electricity"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="rent">Rent</option>
                  <option value="transport">Transport</option>
                  <option value="electricity">Electricity / Water</option>
                  <option value="salaries">Salaries</option>
                  <option value="food">Food &amp; Meals</option>
                  <option value="packaging">Packaging</option>
                  <option value="taxes">Taxes</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (RWF) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={expAmount}
                  onChange={(e) =>
                    setExpAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description / Notes (Optional)
              </label>
              <input
                type="text"
                value={expDescription}
                onChange={(e) => setExpDescription(e.target.value)}
                placeholder="Optional memo or receipt details"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onCloseAddModal}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                {editingExpense ? 'Save Changes' : 'Save Expense'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSavingsSubmit} className="space-y-4">
            {savError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{savError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Type *
              </label>
              <select
                value={savType}
                onChange={(e) => setSavType(e.target.value as SavingsTransferType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="business_to_savings">
                  Deposit to Savings (Transfers from business cash)
                </option>
                <option value="savings_to_business">
                  Withdraw from Savings (Returns money to business cash)
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (RWF) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={savAmount}
                  onChange={(e) =>
                    setSavAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="e.g. 10000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={savDate}
                  onChange={(e) => setSavDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description / Purpose (Optional)
              </label>
              <input
                type="text"
                value={savNotes}
                onChange={(e) => setSavNotes(e.target.value)}
                placeholder="e.g. Monthly emergency reserve or expansion fund"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-xs">
              <span className="font-bold">Accounting Rule:</span> Transferring money to savings changes your available cash, but does <strong>not</strong> reduce your business profit!
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onCloseAddModal}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
              >
                {editingSavings ? 'Save Changes' : 'Confirm Transfer'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
