import React from 'react';
import {
  TrendingUp,
  PlusCircle,
  ShoppingBag,
  Receipt,
  FileBarChart2,
  Menu,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatRWF } from '../utils/calculations';

interface HeaderProps {
  onOpenPurchaseModal: () => void;
  onOpenSaleModal: () => void;
  onOpenExpenseSavingsModal: () => void;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPurchaseModal,
  onOpenSaleModal,
  onOpenExpenseSavingsModal,
  onToggleMobileNav,
}) => {
  const { t, settings, setLanguage, overallSummary, setActiveView } = useFinance();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Brand + Mobile menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileNav}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveView('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    {t('appName')}
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    RWF
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Simple Business &amp; Finance Management
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Cash:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {formatRWF(overallSummary.closingCashBalance)}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Net Profit:</span>
              <span
                className={`font-bold font-mono ${
                  overallSummary.netProfit >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600'
                }`}
              >
                {formatRWF(overallSummary.netProfit)}
              </span>
            </div>
          </div>

          {/* Action buttons + Language Selector */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  settings.language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('rw')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  settings.language === 'rw'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Ikinyarwanda"
              >
                RW
              </button>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={onOpenPurchaseModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('addPurchase')}</span>
              </button>

              <button
                onClick={onOpenSaleModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('recordSale')}</span>
              </button>

              <button
                onClick={onOpenExpenseSavingsModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{t('addExpenseOrSavings')}</span>
              </button>
            </div>

            {/* Mobile quick action: Record Sale */}
            <button
              onClick={onOpenSaleModal}
              className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              title={t('recordSale')}
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
