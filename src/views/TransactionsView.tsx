import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Edit3, 
  Tag, 
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Transaction, Category, PaymentMethod, TransactionType } from '../types/ledger';
import { formatCurrency, formatKoreanDate } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

interface TransactionsViewProps {
  currentMonth: string;
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onOpenSmsParser: () => void;
  onOpenNewTransaction: () => void;
  onSelectTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDuplicateTransaction: (t: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  currentMonth,
  transactions,
  categories,
  paymentMethods,
  onOpenSmsParser,
  onOpenNewTransaction,
  onSelectTransaction,
  onDeleteTransaction,
  onDuplicateTransaction
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter current month transactions first
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  // Apply filters
  const filtered = useMemo(() => {
    return monthTransactions.filter(t => {
      // Type
      if (filterType !== 'all' && t.type !== filterType) return false;
      // Category
      if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false;
      // Payment Method
      if (filterPayment !== 'all' && t.paymentMethodId !== filterPayment) return false;
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchMemo = t.memo ? t.memo.toLowerCase().includes(query) : false;
        const matchTag = t.tags ? t.tags.some(tag => tag.toLowerCase().includes(query)) : false;
        if (!matchTitle && !matchMemo && !matchTag) return false;
      }
      return true;
    });
  }, [monthTransactions, filterType, filterCategory, filterPayment, searchQuery]);

  // Totals for filtered
  const filteredExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by Date descending
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const sorted = [...filtered].sort((a, b) => {
      const cmp = b.date.localeCompare(a.date);
      if (cmp !== 0) return cmp;
      return (b.time || '').localeCompare(a.time || '');
    });

    sorted.forEach(t => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });

    return groups;
  }, [filtered]);

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const payMap = useMemo(() => new Map(paymentMethods.map(p => [p.id, p])), [paymentMethods]);

  const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || filterPayment !== 'all' || searchQuery !== '';

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterPayment('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Search Input & Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="상호, 내역, 메모, #태그 검색..."
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSmsParser}
              className="px-3.5 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>문자 자동입력</span>
            </button>
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>직접 작성</span>
            </button>
          </div>
        </div>

        {/* Filter Chips & Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {/* Type Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'expense' ? 'bg-rose-500 text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              지출
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'income' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              수입
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="all">모든 카테고리</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="all">모든 결제수단</option>
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 ml-auto flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* Filtered Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3">
        <div className="text-xs text-slate-500">
          총 <b className="text-slate-900 font-bold">{filtered.length}건</b>의 내역
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-blue-600">
            수입: +{formatCurrency(filteredIncome)}
          </span>
          <span className="text-rose-600">
            지출: -{formatCurrency(filteredExpense)}
          </span>
          <span className="text-slate-800">
            합계: {filteredIncome - filteredExpense >= 0 ? '+' : ''}{formatCurrency(filteredIncome - filteredExpense)}
          </span>
        </div>
      </div>

      {/* Grouped Transaction List */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">해당 조건의 가계부 내역이 없습니다</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            문자를 붙여넣거나 새 내역을 직접 작성하여 가계부를 채워보세요.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={onOpenSmsParser}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              문자 자동작성
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                필터 해제
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([dateStr, items]) => {
            const dayExpense = items
              .filter(i => i.type === 'expense')
              .reduce((sum, i) => sum + i.amount, 0);
            const dayIncome = items
              .filter(i => i.type === 'income')
              .reduce((sum, i) => sum + i.amount, 0);

            return (
              <div
                key={dateStr}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Date header */}
                <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
                  <div className="font-extrabold text-slate-800">
                    {formatKoreanDate(dateStr, true)}
                  </div>
                  <div className="flex items-center gap-3 font-semibold text-[11px]">
                    {dayIncome > 0 && (
                      <span className="text-blue-600">+{formatCurrency(dayIncome)}</span>
                    )}
                    {dayExpense > 0 && (
                      <span className="text-rose-600">-{formatCurrency(dayExpense)}</span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-100">
                  {items.map((tx) => {
                    const cat = catMap.get(tx.categoryId);
                    const pay = payMap.get(tx.paymentMethodId);

                    return (
                      <div
                        key={tx.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
                      >
                        <div
                          onClick={() => onSelectTransaction(tx)}
                          className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                        >
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: cat?.color || '#94a3b8' }}
                          >
                            <CategoryIcon name={cat?.icon || 'HelpCircle'} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {tx.title}
                              </span>
                              {tx.isRecurring && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100">
                                  고정
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                              <span>{tx.time || '12:00'}</span>
                              <span>•</span>
                              <span className="text-slate-600 font-medium">{cat?.name}</span>
                              <span>•</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded-md text-slate-600 font-medium text-[10px]">
                                {pay?.name}
                              </span>
                              {tx.tags && tx.tags.map(tag => (
                                <span key={tag} className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md text-[10px]">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            {tx.memo && (
                              <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                                {tx.memo}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          <div
                            onClick={() => onSelectTransaction(tx)}
                            className="text-right cursor-pointer"
                          >
                            <div
                              className={`text-sm sm:text-base font-extrabold ${
                                tx.type === 'expense'
                                  ? 'text-rose-600'
                                  : tx.type === 'income'
                                  ? 'text-blue-600'
                                  : 'text-indigo-600'
                              }`}
                            >
                              {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onDuplicateTransaction(tx)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="복제하여 추가"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectTransaction(tx)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`'${tx.title}' 내역을 삭제하시겠습니까?`)) {
                                  onDeleteTransaction(tx.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
