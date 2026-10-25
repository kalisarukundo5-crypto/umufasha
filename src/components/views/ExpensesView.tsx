import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Tag,
  DollarSign,
  AlertCircle,
  Briefcase,
  User,
  Filter,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF } from '../../utils/calculations';
import { PaymentMethod, ExpenseCategoryType } from '../../types/finance';
import { Modal } from '../Modal';

interface ExpensesViewProps {
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
}) => {
  const { expenses, addExpense, deleteExpense, t, settings, updateSettings } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'business' | 'personal'>('all');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('rent');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isPersonal, setIsPersonal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [description, setDescription] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [formError, setFormError] = useState('');

  const standardCategories = [
    { id: 'rent', label: t('rent') },
    { id: 'salaries', label: t('salaries') },
    { id: 'electricity', label: t('electricity') },
    { id: 'transport', label: t('transport') },
    { id: 'food', label: t('food') },
    { id: 'communication', label: t('communication') },
    { id: 'packaging', label: t('packaging') },
    { id: 'taxes', label: t('taxes') },
    { id: 'maintenance', label: t('maintenance') },
    { id: 'other', label: t('other') },
  ];

  const allCategories = [
    ...standardCategories,
    ...settings.customCategories.map((c) => ({ id: c, label: c })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const numAmount = typeof amount === 'number' ? amount : 0;
    if (numAmount <= 0) {
      setFormError('Expense amount must be greater than 0 RWF.');
      return;
    }
    if (!name.trim()) {
      setFormError('Please enter an expense name.');
      return;
    }

    let finalCategory = category;
    if (category === 'CUSTOM') {
      if (!customCategoryInput.trim()) {
        setFormError('Please provide a name for the custom category.');
        return;
      }
      finalCategory = customCategoryInput.trim();
      // Add to custom categories if not already present
      if (!settings.customCategories.includes(finalCategory)) {
        updateSettings({
          customCategories: [...settings.customCategories, finalCategory],
        });
      }
    }

    addExpense({
      name: name.trim(),
      category: finalCategory,
      amount: numAmount,
      date,
      isPersonal,
      paymentMethod,
      description: description.trim() || undefined,
      receiptNote: receiptNote.trim() || undefined,
    });

    // Reset & close
    setName('');
    setAmount('');
    setDescription('');
    setReceiptNote('');
    setCustomCategoryInput('');
    setIsPersonal(false);
    onCloseAddModal();
  };

  const filteredExpenses = expenses.filter((e) => {
    if (activeTab === 'business') return !e.isPersonal;
    if (activeTab === 'personal') return e.isPersonal;
    return true;
  });

  const businessTotal = expenses
    .filter((e) => !e.isPersonal)
    .reduce((acc, e) => acc + e.amount, 0);

  const personalTotal = expenses
    .filter((e) => e.isPersonal)
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('expenses')} &amp; Cash Outflows
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track business operating expenses and personal withdrawals with strict accounting isolation.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addExpense')}</span>
        </button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Briefcase className="w-4 h-4" />
            Business Operating Expenses
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatRWF(businessTotal)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Deducted from Gross Profit to determine Net Profit
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <User className="w-4 h-4" />
            Personal Withdrawals
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {formatRWF(personalTotal)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Reduces cash on hand; NEVER reduces business accounting profit
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Receipt className="w-4 h-4" />
            Total Outflows Recorded
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRWF(businessTotal + personalTotal)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{expenses.length} transaction records</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          All Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'business'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Business Operating ({expenses.filter((e) => !e.isPersonal).length})
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'personal'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Personal Drawings ({expenses.filter((e) => e.isPersonal).length})
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recorded Expenses Ledger
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {filteredExpenses.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Expense Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Amount (RWF)</th>
                <th className="px-4 py-3">Notes/Receipt</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No expenses found in this view.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {exp.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.isPersonal
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {exp.isPersonal ? <User className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                        {exp.isPersonal ? 'Personal' : 'Business'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold whitespace-nowrap">
                      {exp.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      - {formatRWF(exp.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">
                      {exp.receiptNote ? (
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          Ref: {exp.receiptNote}{' '}
                        </span>
                      ) : null}
                      {exp.description}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        title={t('addExpense')}
        subtitle="Business expenses reduce operating profit; personal expenses are treated as drawings"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Business vs Personal Toggle */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Expense Classification *
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPersonal(false)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  !isPersonal
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Business Operating
              </button>
              <button
                type="button"
                onClick={() => setIsPersonal(true)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isPersonal
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <User className="w-4 h-4" />
                Personal Drawing
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              {isPersonal
                ? 'Personal drawing: Deducted from cash on hand, NOT deducted from business profit.'
                : 'Business expense: Deducted from gross profit to compute net operating profit.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expense Title / Purpose *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shop monthly rent or Staff electricity"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('category')} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {allCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
                <option value="CUSTOM">+ Create Custom Category</option>
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
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
          </div>

          {category === 'CUSTOM' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Custom Category Name *
              </label>
              <input
                type="text"
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                placeholder="e.g. Packaging Materials or City Permits"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {t('paymentMethod')}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="cash">{t('cash')}</option>
                <option value="momo">{t('momo')}</option>
                <option value="bank">{t('bank')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Receipt Attachment Ref
              </label>
              <input
                type="text"
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                placeholder="e.g. Invoice #REC-9821"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description / Memo
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
            >
              {t('save')} Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
