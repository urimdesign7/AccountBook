export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'cash' | 'pay' | 'other';
  icon: string;
  color?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  categoryId: string;
  paymentMethodId: string;
  title: string;
  memo?: string;
  tags?: string[];
  isRecurring?: boolean;
  createdAt: number;
}

export interface BudgetGoal {
  month: string; // YYYY-MM
  totalBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  paymentMethodId: string;
  dayOfMonth: number;
  active: boolean;
  memo?: string;
}

export interface AccountAsset {
  id: string;
  name: string;
  type: 'bank' | 'card' | 'cash' | 'invest';
  balance: number;
  color: string;
  accountNumber?: string;
}

export type ViewTab = 'dashboard' | 'transactions' | 'calendar' | 'analytics' | 'budget' | 'assets';
