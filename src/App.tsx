/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  RotateCcw,
  Wallet
} from 'lucide-react';
import { 
  Transaction, 
  Category, 
  PaymentMethod, 
  BudgetGoal, 
  RecurringItem, 
  AccountAsset, 
  ViewTab 
} from './types/ledger';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_PAYMENT_METHODS, 
  DEFAULT_ACCOUNTS, 
  DEFAULT_RECURRING 
} from './data/defaultData';
import { generateInitialTransactions } from './data/mockData';
import { Navbar } from './components/Navbar';
import { QuickSmsParserModal } from './components/QuickSmsParserModal';
import { TransactionModal } from './components/TransactionModal';
import { ExportModal } from './components/ExportModal';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { BudgetView } from './views/BudgetView';
import { AssetsView } from './views/AssetsView';

const STORAGE_KEYS = {
  TRANSACTIONS: 'smart_ledger_transactions_v1',
  BUDGET: 'smart_ledger_budget_v1',
  RECURRING: 'smart_ledger_recurring_v1',
  ACCOUNTS: 'smart_ledger_accounts_v1',
};

export default function App() {
  const now = new Date();
  const initialMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [currentMonth, setCurrentMonth] = useState<string>(initialMonth);
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load transactions:', e);
    }
    return generateInitialTransactions();
  });

  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [paymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);

  const [budgetGoal, setBudgetGoal] = useState<BudgetGoal>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load budget:', e);
    }
    return {
      month: initialMonth,
      totalBudget: 2200000,
      categoryBudgets: {
        'cat-food': 500000,
        'cat-cafe': 120000,
        'cat-mart': 300000,
        'cat-shopping': 250000,
        'cat-transport': 150000,
        'cat-housing': 260000,
        'cat-culture': 100000,
      }
    };
  });

  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load recurring:', e);
    }
    return DEFAULT_RECURRING;
  });

  const [accounts, setAccounts] = useState<AccountAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load accounts:', e);
    }
    return DEFAULT_ACCOUNTS;
  });

  // Modal Controls
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [txDefaultDate, setTxDefaultDate] = useState<string | undefined>(undefined);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // LocalStorage synchronizers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budgetGoal));
    } catch (e) {
      console.error(e);
    }
  }, [budgetGoal]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringItems));
    } catch (e) {
      console.error(e);
    }
  }, [recurringItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }, [accounts]);

  // Handlers
  const handleAddTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now()
    };
    setTransactions(prev => [newTx, ...prev]);

    // Also deduct or add to account if matching
    if (txData.paymentMethodId) {
      // Find account
      setAccounts(prevAccs =>
        prevAccs.map(acc => {
          if (
            (txData.paymentMethodId.includes('kakao-bank') && acc.id === 'acc-1') ||
            (txData.paymentMethodId.includes('toss') && acc.id === 'acc-2') ||
            (txData.paymentMethodId.includes('cash') && acc.id === 'acc-6')
          ) {
            const delta = txData.type === 'income' ? txData.amount : -txData.amount;
            return { ...acc, balance: acc.balance + delta };
          }
          return acc;
        })
      );
    }

    showToast(`'${txData.title}' 내역이 성공적으로 작성되었습니다!`);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions(prev =>
        prev.map(t => (t.id === existingId ? { ...t, ...txData } : t))
      );
      showToast(`'${txData.title}' 내역이 수정되었습니다.`);
    } else {
      handleAddTransaction(txData);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('가계부 내역이 삭제되었습니다.');
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      title: `${tx.title} (복사본)`,
      createdAt: Date.now()
    };
    setTransactions(prev => [duplicated, ...prev]);
    showToast(`'${tx.title}' 내역이 복제되었습니다.`);
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxDefaultDate(tx.date);
    setIsTxModalOpen(true);
  };

  const handleOpenNewTransactionForDate = (date: string) => {
    setEditingTransaction(null);
    setTxDefaultDate(date);
    setIsTxModalOpen(true);
  };

  const handleApplyRecurringItem = (item: RecurringItem) => {
    const date = `${currentMonth}-${String(item.dayOfMonth).padStart(2, '0')}`;
    handleAddTransaction({
      type: item.type,
      amount: item.amount,
      title: item.title,
      date,
      time: '09:00',
      categoryId: item.categoryId,
      paymentMethodId: item.paymentMethodId,
      memo: '정기 고정비 자동 등록',
      tags: ['고정지출', '구독'],
      isRecurring: true
    });
  };

  const handleResetToSample = () => {
    const fresh = generateInitialTransactions();
    setTransactions(fresh);
    setAccounts(DEFAULT_ACCOUNTS);
    setRecurringItems(DEFAULT_RECURRING);
    showToast('샘플 가계부 데이터가 다시 로드되었습니다.');
  };

  const handleClearAll = () => {
    setTransactions([]);
    showToast('모든 가계부 내역이 초기화되었습니다.');
  };

  const handleImportBackup = (data: {
    transactions: Transaction[];
    budgetGoal: BudgetGoal;
    recurringItems: RecurringItem[];
    accounts: AccountAsset[];
  }) => {
    setTransactions(data.transactions);
    setBudgetGoal(data.budgetGoal);
    setRecurringItems(data.recurringItems);
    setAccounts(data.accounts);
    showToast('백업 데이터를 불러왔습니다.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSmsParser={() => setIsSmsModalOpen(true)}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setTxDefaultDate(undefined);
          setIsTxModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentMonth={currentMonth}
            transactions={transactions}
            categories={categories}
            paymentMethods={paymentMethods}
            budgetGoal={budgetGoal}
            onOpenSmsParser={() => setIsSmsModalOpen(true)}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setTxDefaultDate(undefined);
              setIsTxModalOpen(true);
            }}
            onSelectTransaction={handleOpenEditTransaction}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            currentMonth={currentMonth}
            transactions={transactions}
            categories={categories}
            paymentMethods={paymentMethods}
            onOpenSmsParser={() => setIsSmsModalOpen(true)}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setTxDefaultDate(undefined);
              setIsTxModalOpen(true);
            }}
            onSelectTransaction={handleOpenEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onDuplicateTransaction={handleDuplicateTransaction}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            currentMonth={currentMonth}
            transactions={transactions}
            categories={categories}
            paymentMethods={paymentMethods}
            onOpenNewTransactionForDate={handleOpenNewTransactionForDate}
            onSelectTransaction={handleOpenEditTransaction}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            currentMonth={currentMonth}
            transactions={transactions}
            categories={categories}
            paymentMethods={paymentMethods}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            currentMonth={currentMonth}
            transactions={transactions}
            categories={categories}
            paymentMethods={paymentMethods}
            budgetGoal={budgetGoal}
            recurringItems={recurringItems}
            onUpdateBudgetGoal={setBudgetGoal}
            onUpdateRecurringItems={setRecurringItems}
            onApplyRecurringItem={handleApplyRecurringItem}
          />
        )}

        {activeTab === 'assets' && (
          <AssetsView
            accounts={accounts}
            onUpdateAccounts={setAccounts}
          />
        )}
      </main>

      {/* Floating Action Button (Mobile & Desktop Quick Entry) */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2.5">
        <button
          onClick={() => setIsSmsModalOpen(true)}
          className="group flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xl shadow-blue-500/30 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>문자 자동작성</span>
        </button>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setTxDefaultDate(undefined);
            setIsTxModalOpen(true);
          }}
          className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
          title="새 내역 직접 작성"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <QuickSmsParserModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        categories={categories}
        paymentMethods={paymentMethods}
        onAddTransaction={handleAddTransaction}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialTransaction={editingTransaction}
        defaultDate={txDefaultDate}
        categories={categories}
        paymentMethods={paymentMethods}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        categories={categories}
        paymentMethods={paymentMethods}
        budgetGoal={budgetGoal}
        recurringItems={recurringItems}
        accounts={accounts}
        onImportBackup={handleImportBackup}
        onResetToSample={handleResetToSample}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
