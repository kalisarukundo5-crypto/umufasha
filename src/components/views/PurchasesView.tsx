import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF, formatQuantity } from '../../utils/calculations';
import { Purchase, UnitOfMeasure } from '../../types/finance';
import { Modal } from '../Modal';

interface PurchasesViewProps {
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
}) => {
  const {
    purchases,
    products,
    addPurchase,
    updatePurchase,
    deletePurchase,
    t,
  } = useFinance();

  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  // Form Fields
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState<UnitOfMeasure>('kg');
  const [unitPurchasePrice, setUnitPurchasePrice] = useState<number | ''>('');
  const [transportCosts, setTransportCosts] = useState<number | ''>(0);
  const [formError, setFormError] = useState('');

  // Auto-calculated totals in real time
  const numQty = typeof quantity === 'number' ? quantity : 0;
  const numPrice = typeof unitPurchasePrice === 'number' ? unitPurchasePrice : 0;
  const numTransport = typeof transportCosts === 'number' ? transportCosts : 0;

  const totalProductCost = numQty * numPrice;
  const totalPurchaseCost = totalProductCost + numTransport;
  const unitAcquisitionCost = numQty > 0 ? totalPurchaseCost / numQty : 0;

  const openNewPurchase = () => {
    setEditingPurchase(null);
    setProductName('');
    setQuantity('');
    setUnit('kg');
    setUnitPurchasePrice('');
    setTransportCosts(0);
    setFormError('');
    onOpenAddModal();
  };

  const openEditPurchase = (p: Purchase) => {
    setEditingPurchase(p);
    setProductName(p.productName);
    setQuantity(p.quantity);
    setUnit(p.unit);
    setUnitPurchasePrice(p.unitPurchasePrice);
    setTransportCosts(p.transportCosts);
    setFormError('');
    onOpenAddModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!productName.trim()) {
      setFormError('Please enter a product name.');
      return;
    }
    if (numQty <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }
    if (numPrice <= 0) {
      setFormError('Purchase price per unit must be greater than 0.');
      return;
    }

    // Match or create product ID
    let resolvedProdId = editingPurchase?.productId || '';
    if (!resolvedProdId) {
      const existing = products.find(
        (p) => p.name.toLowerCase() === productName.trim().toLowerCase()
      );
      resolvedProdId = existing ? existing.id : `prod-${Date.now()}`;
    }

    if (editingPurchase) {
      updatePurchase({
        ...editingPurchase,
        productId: resolvedProdId,
        productName: productName.trim(),
        quantity: numQty,
        unit,
        unitPurchasePrice: numPrice,
        transportCosts: numTransport,
        otherCosts: 0,
        amountPaid: totalPurchaseCost,
      });
    } else {
      addPurchase({
        productId: resolvedProdId,
        productName: productName.trim(),
        category: 'General',
        supplierName: 'Direct Purchase',
        purchaseDate: new Date().toISOString().slice(0, 10),
        quantity: numQty,
        unit,
        unitPurchasePrice: numPrice,
        transportCosts: numTransport,
        otherCosts: 0,
        amountPaid: totalPurchaseCost,
        paymentMethod: 'cash',
      });
    }

    onCloseAddModal();
  };

  const totalSpentOnPurchases = purchases.reduce((acc, p) => acc + p.totalAcquisitionCost, 0);
  const totalTransportSpent = purchases.reduce((acc, p) => acc + p.transportCosts, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Purchases &amp; Inventory Restock
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Record items bought for resale. Total purchase costs are calculated automatically.
          </p>
        </div>

        <button
          onClick={openNewPurchase}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addPurchase')}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            Total Purchases Amount
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatRWF(totalSpentOnPurchases)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{purchases.length} total purchase entries</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Truck className="w-4 h-4" />
            Transportation &amp; Additional Costs
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatRWF(totalTransportSpent)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Included in unit acquisition cost (WAC)
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recorded Purchases
          </h2>
          <span className="text-xs text-slate-400 font-mono">{purchases.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Price per Unit</th>
                <th className="px-4 py-3 text-right">Transport / Extra</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3 text-right">Effective Unit Cost</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No purchases recorded yet. Click &quot;Add Purchase&quot; above to log your inventory purchases.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {p.purchaseDate}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {p.productName}
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {formatQuantity(p.quantity, p.unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatRWF(p.unitPurchasePrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {formatRWF(p.transportCosts)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatRWF(p.totalAcquisitionCost)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {formatRWF(p.unitAcquisitionCost)}/{p.unit}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditPurchase(p)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Edit purchase"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePurchase(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete purchase"
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

      {/* Simple Short Purchase Form Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        title={editingPurchase ? 'Edit Purchase Entry' : 'Add Purchase'}
        subtitle="Enter product and cost details. Total cost is calculated automatically."
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
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Rice 25kg, Cooking Oil, Cement"
              list="existing-products"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
            <datalist id="existing-products">
              {products.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Purchased *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 100"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Unit of Measure
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="pcs">pcs (Pieces)</option>
                <option value="liters">liters (Liters)</option>
                <option value="bags">bags (Bags)</option>
                <option value="boxes">boxes (Boxes)</option>
              </select>
            </div>
          </div>

          {/* Purchase Price per Unit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Purchase Price per Unit (RWF) *
            </label>
            <input
              type="number"
              min="1"
              value={unitPurchasePrice}
              onChange={(e) =>
                setUnitPurchasePrice(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="e.g. 2000"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              required
            />
          </div>

          {/* Additional / Transport Costs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Additional Costs / Transportation (RWF)
            </label>
            <input
              type="number"
              min="0"
              value={transportCosts}
              onChange={(e) =>
                setTransportCosts(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="e.g. 10000"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-slate-400">
              Transport is added to total cost and allocated to each unit
            </span>
          </div>

          {/* Automatic Calculation Box */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Product Cost:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatRWF(totalProductCost)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300">
              <span>Total Purchase Cost:</span>
              <span className="font-mono">{formatRWF(totalPurchaseCost)}</span>
            </div>
            {numQty > 0 && (
              <div className="text-[11px] text-slate-500 pt-0.5">
                Effective unit cost: <strong>{formatRWF(unitAcquisitionCost)}</strong> / {unit}
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
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
            >
              {editingPurchase ? 'Save Changes' : 'Save Purchase'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
