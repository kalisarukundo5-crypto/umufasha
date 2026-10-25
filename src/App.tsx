import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/views/DashboardView';
import { PurchasesView } from './components/views/PurchasesView';
import { SalesView } from './components/views/SalesView';
import { ExpensesSavingsView } from './components/views/ExpensesSavingsView';
import { ReportsView } from './components/views/ReportsView';

function AppContent() {
  const { activeView } = useFinance();

  // Modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isExpenseSavingsModalOpen, setIsExpenseSavingsModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)}
        onOpenSaleModal={() => setIsSaleModalOpen(true)}
        onOpenExpenseSavingsModal={() => setIsExpenseSavingsModalOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Navigation
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)}
              onOpenSaleModal={() => setIsSaleModalOpen(true)}
              onOpenExpenseSavingsModal={() => setIsExpenseSavingsModalOpen(true)}
            />
          )}

          {activeView === 'purchases' && (
            <PurchasesView
              isAddModalOpen={isPurchaseModalOpen}
              onCloseAddModal={() => setIsPurchaseModalOpen(false)}
              onOpenAddModal={() => setIsPurchaseModalOpen(true)}
            />
          )}

          {activeView === 'sales' && (
            <SalesView
              isAddModalOpen={isSaleModalOpen}
              onCloseAddModal={() => setIsSaleModalOpen(false)}
              onOpenAddModal={() => setIsSaleModalOpen(true)}
            />
          )}

          {activeView === 'expenses_savings' && (
            <ExpensesSavingsView
              isAddModalOpen={isExpenseSavingsModalOpen}
              onCloseAddModal={() => setIsExpenseSavingsModalOpen(false)}
              onOpenAddModal={() => setIsExpenseSavingsModalOpen(true)}
            />
          )}

          {activeView === 'reports' && <ReportsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
