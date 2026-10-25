import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  FileBarChart2,
  X,
} from 'lucide-react';
import { useFinance, ViewType } from '../context/FinanceContext';
import { TranslationKey } from '../utils/translations';

interface NavigationProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ViewType;
  labelKey: TranslationKey;
  icon: React.ElementType;
}

export const Navigation: React.FC<NavigationProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeView, setActiveView, t } = useFinance();

  const navItems: NavItem[] = [
    { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { id: 'purchases', labelKey: 'purchases', icon: ShoppingBag },
    { id: 'sales', labelKey: 'sales', icon: ShoppingCart },
    { id: 'expenses_savings', labelKey: 'expensesAndSavings', icon: Receipt },
    { id: 'reports', labelKey: 'reports', icon: FileBarChart2 },
  ];

  const handleSelect = (id: ViewType) => {
    setActiveView(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full py-4 px-3">
      <div className="mb-3 px-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main Sections
        </span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* RWF Guard Badge */}
      <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Rwandan Francs (RWF)
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Accurate calculations: Unsold stock is an asset, and savings do not reduce business profit.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-5rem)] sticky top-20 overflow-hidden">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-2xl z-10 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {t('appName')}
              </span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
