import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF, formatQuantity } from '../../utils/calculations';
import { Sale, UnitOfMeasure } from '../../types/finance';
import { Modal } from '../Modal';

interface SalesViewProps {
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
}) => {
  const {
    sales,
    products,
    inventoryStatus,
    addSale,
    updateSale,
    deleteSale,
    t,
    settings,
  } = useFinance();

  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  // Form Fields
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitSellingPrice, setUnitSellingPrice] = useState<number | ''>('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  // Inventory context
  const selectedProduct = products.find(
    (p) => p.id === selectedProductId || p.name.toLowerCase() === productName.toLowerCase()
  );
  const currentStock = selectedProduct ? inventoryStatus[selectedProduct.id]?.remainingStock ?? 0 : 0;
  const currentWAC = selectedProduct ? inventoryStatus[selectedProduct.id]?.weightedAverageCost ?? 0 : 0;

  // Real-time calculations
  const numQty = typeof quantity === 'number' ? quantity : 0;
  const numPrice = typeof unitSellingPrice === 'number' ? unitSellingPrice : 0;
  const totalSales = numQty * numPrice;
  const cogs = numQty * currentWAC;
  const profit = totalSales - cogs;

  const numPaid = typeof amountPaid === 'number' ? amountPaid : totalSales;
  const customerDebt = Math.max(0, totalSales - numPaid);

  const openNewSale = () => {
    setEditingSale(null);
    setSelectedProductId('');
    setProductName('');
    setQuantity('');
    setUnitSellingPrice('');
    setAmountPaid('');
    setFormError('');
    onOpenAddModal();
  };

  const openEditSale = (s: Sale) => {
    setEditingSale(s);
    setSelectedProductId(s.productId);
    setProductName(s.productName);
    setQuantity(s.quantity);
    setUnitSellingPrice(s.unitSellingPrice);
    setAmountPaid(s.amountReceived);
    setFormError('');
    onOpenAddModal();
  };

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setProductName(prod.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!productName.trim() && !selectedProductId) {
      setFormError('Please select or enter a product name.');
      return;
    }
    if (numQty <= 0) {
      setFormError('Quantity sold must be greater than 0.');
      return;
    }
    if (numPrice <= 0) {
      setFormError('Selling price must be greater than 0.');
      return;
    }

    const prod = selectedProduct || products.find((p) => p.id === selectedProductId);
    const resolvedProdId = prod ? prod.id : `prod-${Date.now()}`;
    const resolvedProdName = prod ? prod.name : productName.trim();
    const resolvedUnit: UnitOfMeasure = prod ? prod.unit : 'kg';

    if (!editingSale && !settings.allowNegativeStock && currentStock < numQty) {
      setFormError(
        `Insufficient inventory! Only ${currentStock} ${resolvedUnit} remaining in stock. Please restock first.`
      );
      return;
    }

    if (editingSale) {
      updateSale({
        ...editingSale,
        productId: resolvedProdId,
        productName: resolvedProdName,
        quantity: numQty,
        unit: resolvedUnit,
        unitSellingPrice: numPrice,
        discount: 0,
        amountReceived: numPaid,
        outstandingBalance: customerDebt,
      });
    } else {
      const result = addSale({
        productId: resolvedProdId,
        productName: resolvedProdName,
        saleDate: new Date().toISOString().slice(0, 16),
        quantity: numQty,
        unit: resolvedUnit,
        unitSellingPrice: numPrice,
        discount: 0,
        amountReceived: numPaid,
        paymentMethod: customerDebt > 0 ? 'credit' : 'cash',
      });

      if (result.error) {
        setFormError(result.error);
        return;
      }
    }

    onCloseAddModal();
  };

  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.netSales, 0);
  const totalCOGS = sales.reduce((acc, s) => acc + s.costOfGoodsSold, 0);
  const totalGrossProfit = sales.reduce((acc, s) => acc + s.grossProfit, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sales &amp; Customer Orders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Record items sold. Revenue, Cost of Goods Sold (COGS), and Gross Profit calculate automatically.
          </p>
        </div>

        <button
          onClick={openNewSale}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('recordSale')}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <ShoppingCart className="w-4 h-4" />
            Total Sales Revenue
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatRWF(totalSalesRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{sales.length} sales recorded</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Cost of Goods Sold (COGS)
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatRWF(totalCOGS)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Direct acquisition cost of sold units</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            Total Gross Profit
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRWF(totalGrossProfit)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Sales − Cost of Goods Sold</div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recorded Sales
          </h2>
          <span className="text-xs text-slate-400 font-mono">{sales.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Selling Price</th>
                <th className="px-4 py-3 text-right">Total Sales</th>
                <th className="px-4 py-3 text-right">COGS (Cost)</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3 text-center">Paid Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No sales recorded yet. Click &quot;Record Sale&quot; above to log your first customer sale.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {s.saleDate.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {s.productName}
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {formatQuantity(s.quantity, s.unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatRWF(s.unitSellingPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatRWF(s.netSales)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      {formatRWF(s.costOfGoodsSold)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      +{formatRWF(s.grossProfit)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {s.outstandingBalance <= 0 ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Paid Full
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Due: {formatRWF(s.outstandingBalance)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditSale(s)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Edit sale"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSale(s.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete sale"
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

      {/* Simple Short Sales Form Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        title={editingSale ? 'Edit Sale Entry' : 'Record Sale'}
        subtitle="Deducts stock automatically and computes COGS and profit"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Product Name *
            </label>
            {products.length > 0 ? (
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => {
                  const stock = inventoryStatus[p.id]?.remainingStock ?? 0;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} (In stock: {formatQuantity(stock, p.unit)})
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Rice 25kg"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            )}

            {selectedProduct && (
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Available stock:{' '}
                  <strong className={currentStock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {formatQuantity(currentStock, selectedProduct.unit)}
                  </strong>
                </span>
                <span>
                  WAC Unit Cost: <strong>{formatRWF(currentWAC)}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Quantity Sold & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Sold *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 30"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Selling Price per Unit (RWF) *
              </label>
              <input
                type="number"
                min="1"
                value={unitSellingPrice}
                onChange={(e) =>
                  setUnitSellingPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                placeholder="e.g. 3000"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
          </div>

          {/* Amount Paid by Customer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Amount Paid by Customer (RWF)
            </label>
            <input
              type="number"
              min="0"
              value={amountPaid}
              onChange={(e) =>
                setAmountPaid(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder={`Full payment: ${totalSales || 0}`}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-slate-400">
              Leave blank if paid in full ({formatRWF(totalSales)})
            </span>
          </div>

          {/* Automatic Calculation Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Total Sales Revenue:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatRWF(totalSales)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Cost of Goods Sold (COGS):</span>
              <span className="font-mono font-bold text-rose-600">
                - {formatRWF(cogs)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300">
              <span>Gross Profit on Sale:</span>
              <span className="font-mono">{formatRWF(profit)}</span>
            </div>
            {customerDebt > 0 && (
              <div className="flex justify-between text-amber-600 font-semibold pt-0.5">
                <span>Remaining Customer Debt:</span>
                <span className="font-mono">{formatRWF(customerDebt)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCloseAddModal}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
            >
              {editingSale ? 'Save Changes' : 'Confirm Sale'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
