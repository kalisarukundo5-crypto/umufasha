import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp,
  Tag,
  Scale,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRWF, formatQuantity } from '../../utils/calculations';
import { Product, UnitOfMeasure } from '../../types/finance';
import { Modal } from '../Modal';

interface InventoryViewProps {
  onOpenPurchaseModal: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenPurchaseModal }) => {
  const {
    products,
    inventoryStatus,
    overallSummary,
    addProduct,
    updateProduct,
    deleteProduct,
    t,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [unit, setUnit] = useState<UnitOfMeasure>('kg');
  const [minStockAlert, setMinStockAlert] = useState<number | ''>(5);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('General');
    setUnit('kg');
    setMinStockAlert(5);
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setUnit(p.unit);
    setMinStockAlert(p.minStockAlert ?? 5);
    setDescription(p.description ?? '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter a product name.');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: name.trim(),
        category: category.trim() || 'General',
        unit,
        minStockAlert: typeof minStockAlert === 'number' ? minStockAlert : 5,
        description: description.trim() || undefined,
      });
    } else {
      addProduct({
        name: name.trim(),
        category: category.trim() || 'General',
        unit,
        minStockAlert: typeof minStockAlert === 'number' ? minStockAlert : 5,
        description: description.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const productList = products.map((p) => {
    const status = inventoryStatus[p.id] || {
      product: p,
      totalQuantityPurchased: 0,
      totalAcquisitionCost: 0,
      weightedAverageCost: 0,
      totalQuantitySold: 0,
      remainingStock: 0,
      stockValue: 0,
      totalSalesRevenue: 0,
      totalCOGS: 0,
      totalGrossProfit: 0,
      profitMarginPercentage: 0,
      isLowStock: false,
    };
    return { ...p, status };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('inventory')} &amp; Valuation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Valued via Weighted-Average Cost (WAC). Unsold stock is recorded as an asset, not a sales expense.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProduct')}</span>
          </button>
          <button
            onClick={onOpenPurchaseModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all"
          >
            <Boxes className="w-4 h-4" />
            <span>{t('addPurchase')}</span>
          </button>
        </div>
      </div>

      {/* Top Inventory Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Warehouse Asset Value
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatRWF(overallSummary.totalStockValue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {formatQuantity(overallSummary.totalStockUnits)} total units in inventory
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Catalog Products Count
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {products.length} Products
          </div>
          <div className="text-xs text-slate-400 mt-1">Distinct items across all categories</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Stock Valuation Method
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            Weighted Average (WAC)
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Acquisition Cost ÷ Total Qty Purchased</div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Product Inventory &amp; Stock Value Ledger
          </h2>
          <span className="text-xs text-slate-400 font-mono">{products.length} products</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Purchased</th>
                <th className="px-4 py-3 text-right">Sold</th>
                <th className="px-4 py-3 text-right">Remaining Stock</th>
                <th className="px-4 py-3 text-right">Unit WAC Cost</th>
                <th className="px-4 py-3 text-right">Total Stock Value</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {productList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No products added yet. Click &quot;Add Product&quot; to begin.
                  </td>
                </tr>
              ) : (
                productList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {item.name}
                      {item.description && (
                        <div className="text-[10px] font-normal text-slate-400">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {formatQuantity(item.status.totalQuantityPurchased, item.unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {formatQuantity(item.status.totalQuantitySold, item.unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                      <span
                        className={
                          item.status.remainingStock <= 0
                            ? 'text-rose-600'
                            : item.status.isLowStock
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {formatQuantity(item.status.remainingStock, item.unit)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatRWF(item.status.weightedAverageCost)}/{item.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {formatRWF(item.status.stockValue)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {item.status.remainingStock <= 0 ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {t('outOfStock')}
                        </span>
                      ) : item.status.isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('inStock')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete product"
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : t('addProduct')}
        subtitle="Manage product specification, units of measure, and restock thresholds"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('productName')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rice Super 25kg (Umuceri)"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('category')}
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Grains"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('unit')} *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="kg">{t('kg')}</option>
                <option value="pcs">{t('pcs')}</option>
                <option value="liters">{t('liters')}</option>
                <option value="bags">{t('bags')}</option>
                <option value="boxes">{t('boxes')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              min="0"
              value={minStockAlert}
              onChange={(e) =>
                setMinStockAlert(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="5"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-slate-400">Trigger low-stock warning when quantity drops to this value</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('notes')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or supplier specs"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 shadow-xs"
            >
              {editingProduct ? 'Save Changes' : t('addProduct')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
