import React, { useState } from 'react';
import {
  Users,
  Plus,
  DollarSign,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF } from '../../utils/calculations';
import { PaymentMethod } from '../../types/finance';
import { Modal } from '../Modal';

export const CustomersView: React.FC = () => {
  const {
    customers,
    sales,
    customerPayments,
    addCustomer,
    recordCustomerPayment,
    t,
  } = useFinance();

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Payment Recording Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('momo');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  // Compute debt balance for each customer
  const customerList = customers.map((c) => {
    const custSales = sales.filter((s) => s.customerId === c.id || s.customerName?.toLowerCase() === c.name.toLowerCase());
    const totalPurchased = custSales.reduce((acc, s) => acc + s.netSales, 0);
    const totalInvoicedDebt = custSales.reduce((acc, s) => acc + s.outstandingBalance, 0);
    const payments = customerPayments.filter((p) => p.customerId === c.id || p.customerName?.toLowerCase() === c.name.toLowerCase());
    const totalPaidSubsequent = payments.reduce((acc, p) => acc + p.amount, 0);
    const remainingDebt = Math.max(0, totalInvoicedDebt - totalPaidSubsequent);

    return {
      ...c,
      totalPurchased,
      remainingDebt,
      transactionsCount: custSales.length,
    };
  });

  const totalOutstandingReceivables = customerList.reduce((acc, c) => acc + c.remainingDebt, 0);

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim() || undefined,
      address: newCustAddress.trim() || undefined,
    });
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setIsAddCustomerModalOpen(false);
  };

  const openPayModal = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const target = customerList.find((c) => c.id === customerId);
    setPayAmount(target?.remainingDebt || '');
    setPayError('');
    setIsPayModalOpen(true);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayError('');

    const target = customerList.find((c) => c.id === selectedCustomerId);
    if (!target) return;

    const numAmount = typeof payAmount === 'number' ? payAmount : 0;
    if (numAmount <= 0) {
      setPayError('Payment amount must be greater than 0.');
      return;
    }

    recordCustomerPayment({
      customerId: target.id,
      customerName: target.name,
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
            {t('customers')} &amp; Credit Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track customer sales, credit balances, and collect debt payments into your business cash drawer.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addCustomer')}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Total Customer Debts (Receivables)
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatRWF(totalOutstandingReceivables)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {customerList.filter((c) => c.remainingDebt > 0).length} customers owe money
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Registered Customers
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {customers.length} Accounts
          </div>
          <div className="text-xs text-slate-400 mt-1">Active client database</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Subsequent Debt Collections
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRWF(customerPayments.reduce((acc, p) => acc + p.amount, 0))}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {customerPayments.length} debt payment receipts recorded
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Customer Directory &amp; Outstanding Balances
          </h2>
          <span className="text-xs text-slate-400 font-mono">{customerList.length} clients</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Lifetime Sales</th>
                <th className="px-4 py-3 text-right">Outstanding Debt</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No customers registered yet. Customers are automatically saved when you record sales.
                  </td>
                </tr>
              ) : (
                customerList.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {c.phone ? (
                        <span className="flex items-center gap-1 font-mono text-xs">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {c.phone}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {c.address ? (
                        <span className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.address}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatRWF(c.totalPurchased)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={c.remainingDebt > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}>
                        {formatRWF(c.remainingDebt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {c.remainingDebt > 0 ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Due
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {c.remainingDebt > 0 ? (
                        <button
                          onClick={() => openPayModal(c.id)}
                          className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                        >
                          Collect Payment
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No balance</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Customer Debt Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Collect Customer Debt Payment"
        subtitle="This reduces the customer debt balance and enters cash into your cash flow"
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
              placeholder="e.g. 38000"
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
                <option value="momo">{t('momo')}</option>
                <option value="cash">{t('cash')}</option>
                <option value="bank">{t('bank')}</option>
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
              Notes / Transaction ID
            </label>
            <input
              type="text"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="e.g. MoMo Ref #TX8829"
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
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
            >
              Confirm Collection
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        title={t('addCustomer')}
        subtitle="Save client profile and contact details"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('customerName')} *
            </label>
            <input
              type="text"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              placeholder="e.g. Aline Umutoni"
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
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              placeholder="e.g. +250 788 123 456"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Address / Shop Location
            </label>
            <input
              type="text"
              value={newCustAddress}
              onChange={(e) => setNewCustAddress(e.target.value)}
              placeholder="e.g. Kimironko, Kigali"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddCustomerModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 shadow-xs"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
