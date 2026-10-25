import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF } from '../../utils/calculations';
import { PaymentMethod } from '../../types/finance';
import { Modal } from '../Modal';

export const SuppliersView: React.FC = () => {
  const {
    suppliers,
    purchases,
    supplierPayments,
    addSupplier,
    recordSupplierPayment,
    t,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppPhone, setNewSuppPhone] = useState('');
  const [newSuppAddress, setNewSuppAddress] = useState('');

  // Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('bank');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  // Compute supplier balances
  const supplierList = suppliers.map((s) => {
    const suppPurchases = purchases.filter(
      (p) => p.supplierId === s.id || p.supplierName?.toLowerCase() === s.name.toLowerCase()
    );
    const totalPurchased = suppPurchases.reduce((acc, p) => acc + p.totalAcquisitionCost, 0);
    const totalInvoicedDebt = suppPurchases.reduce((acc, p) => acc + p.outstandingBalance, 0);
    const payments = supplierPayments.filter(
      (p) => p.supplierId === s.id || p.supplierName?.toLowerCase() === s.name.toLowerCase()
    );
    const totalPaidSubsequent = payments.reduce((acc, p) => acc + p.amount, 0);
    const remainingDebt = Math.max(0, totalInvoicedDebt - totalPaidSubsequent);

    return {
      ...s,
      totalPurchased,
      remainingDebt,
      purchasesCount: suppPurchases.length,
    };
  });

  const totalOutstandingPayables = supplierList.reduce((acc, s) => acc + s.remainingDebt, 0);

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppName.trim()) return;
    addSupplier({
      name: newSuppName.trim(),
      phone: newSuppPhone.trim() || undefined,
      address: newSuppAddress.trim() || undefined,
    });
    setNewSuppName('');
    setNewSuppPhone('');
    setNewSuppAddress('');
    setIsAddModalOpen(false);
  };

  const openPayModal = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    const target = supplierList.find((s) => s.id === supplierId);
    setPayAmount(target?.remainingDebt || '');
    setPayError('');
    setIsPayModalOpen(true);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayError('');

    const target = supplierList.find((s) => s.id === selectedSupplierId);
    if (!target) return;

    const numAmount = typeof payAmount === 'number' ? payAmount : 0;
    if (numAmount <= 0) {
      setPayError('Payment amount must be greater than 0.');
      return;
    }

    recordSupplierPayment({
      supplierId: target.id,
      supplierName: target.name,
      amount: numAmount,
      paymentDate: payDate,
      paymentMethod: payMethod,
      notes: payNotes.trim() || undefined,
    });

    setIsPayModalOpen(false);
    setPayNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('suppliers')} &amp; Accounts Payable
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage wholesale supplier vendors, credit terms, and supplier debt settlements.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addSupplier')}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Total Supplier Debts (Payables)
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatRWF(totalOutstandingPayables)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Outstanding balances owed to wholesalers
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Registered Suppliers
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {suppliers.length} Vendors
          </div>
          <div className="text-xs text-slate-400 mt-1">Wholesalers and distributors</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Supplier Debt Settlements
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatRWF(supplierPayments.reduce((acc, p) => acc + p.amount, 0))}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {supplierPayments.length} debt payment vouchers disbursed
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Supplier Accounts &amp; Payables Ledger
          </h2>
          <span className="text-xs text-slate-400 font-mono">{supplierList.length} vendors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Lifetime Purchases</th>
                <th className="px-4 py-3 text-right">Outstanding Due</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {supplierList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No suppliers recorded yet.
                  </td>
                </tr>
              ) : (
                supplierList.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono text-xs">
                      {s.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {s.address || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatRWF(s.totalPurchased)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={s.remainingDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                        {formatRWF(s.remainingDebt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {s.remainingDebt > 0 ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Due
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {s.remainingDebt > 0 ? (
                        <button
                          onClick={() => openPayModal(s.id)}
                          className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
                        >
                          Pay Supplier
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">All paid</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Supplier Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Disburse Supplier Debt Payment"
        subtitle="Deducts money from business cash and clears outstanding accounts payable"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePaySubmit} className="space-y-4">
          {payError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {payError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Amount (RWF) *
            </label>
            <input
              type="number"
              min="1"
              value={payAmount}
              onChange={(e) =>
                setPayAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="e.g. 96000"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('paymentMethod')}
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="bank">{t('bank')}</option>
                <option value="momo">{t('momo')}</option>
                <option value="cash">{t('cash')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Transfer Reference / Check #
            </label>
            <input
              type="text"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="e.g. Bank slip #9821"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
            >
              Confirm Disbursement
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('addSupplier')}
        subtitle="Register vendor profile and contacts"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSupplierSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('supplierName')} *
            </label>
            <input
              type="text"
              value={newSuppName}
              onChange={(e) => setNewSuppName(e.target.value)}
              placeholder="e.g. Kigali Wholesale Depot"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={newSuppPhone}
              onChange={(e) => setNewSuppPhone(e.target.value)}
              placeholder="e.g. +250 788 334 455"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Address / Warehouse Location
            </label>
            <input
              type="text"
              value={newSuppAddress}
              onChange={(e) => setNewSuppAddress(e.target.value)}
              placeholder="e.g. Matheus Commercial Center, Kigali"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 shadow-xs"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
