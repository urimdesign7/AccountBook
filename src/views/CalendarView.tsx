import React, { useState } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { Transaction, Category, PaymentMethod } from '../types/ledger';
import { formatCurrency, formatKoreanDate } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

interface CalendarViewProps {
  currentMonth: string; // YYYY-MM
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onOpenNewTransactionForDate: (date: string) => void;
  onSelectTransaction: (t: Transaction) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  transactions,
  categories,
  paymentMethods,
  onOpenNewTransactionForDate,
  onSelectTransaction
}) => {
  const [year, month] = currentMonth.split('-').map(Number);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return today.startsWith(currentMonth) ? today : `${currentMonth}-01`;
  });

  const catMap = new Map(categories.map(c => [c.id, c]));
  const payMap = new Map(paymentMethods.map(p => [p.id, p]));

  // Number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  // Aggregate transactions by date
  const daySummary: Record<string, { income: number; expense: number; count: number }> = {};
  transactions
    .filter(t => t.date.startsWith(currentMonth))
    .forEach(t => {
      if (!daySummary[t.date]) {
        daySummary[t.date] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'income') {
        daySummary[t.date].income += t.amount;
      } else if (t.type === 'expense') {
        daySummary[t.date].expense += t.amount;
      }
      daySummary[t.date].count += 1;
    });

  const selectedDateTransactions = transactions
    .filter(t => t.date === selectedDate)
    .sort((a, b) => (b.time || '').localeCompare(a.time || ''));

  const selectedDateExpense = selectedDateTransactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const selectedDateIncome = selectedDateTransactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const dayOfWeekHeaders = [
    { label: '일', color: 'text-rose-500' },
    { label: '월', color: 'text-slate-700' },
    { label: '화', color: 'text-slate-700' },
    { label: '수', color: 'text-slate-700' },
    { label: '목', color: 'text-slate-700' },
    { label: '금', color: 'text-slate-700' },
    { label: '토', color: 'text-blue-500' },
  ];

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Grid Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-2.5">
          {dayOfWeekHeaders.map((d, idx) => (
            <div key={idx} className={`text-xs font-bold ${d.color}`}>
              {d.label}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 border-b border-slate-100">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="min-h-[75px] sm:min-h-[90px] bg-slate-50/30" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentMonth}-${String(dayNum).padStart(2, '0')}`;
            const summary = daySummary[dateStr];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayOfWeek = (firstDayOfWeek + idx) % 7;
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[75px] sm:min-h-[90px] p-1.5 sm:p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/60 ring-2 ring-inset ring-blue-500 z-10'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isToday
                        ? 'bg-blue-600 text-white'
                        : isSunday
                        ? 'text-rose-500'
                        : isSaturday
                        ? 'text-blue-500'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Add button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewTransactionForDate(dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-md text-slate-400 hover:text-blue-600 transition-all cursor-pointer"
                    title={`${dateStr} 내역 추가`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Day summary badges */}
                <div className="space-y-0.5 mt-1">
                  {summary && summary.income > 0 && (
                    <div className="text-[10px] sm:text-[11px] font-bold text-blue-600 truncate bg-blue-50/80 px-1 py-0.5 rounded">
                      +{summary.income.toLocaleString()}
                    </div>
                  )}
                  {summary && summary.expense > 0 && (
                    <div className="text-[10px] sm:text-[11px] font-bold text-rose-600 truncate bg-rose-50/80 px-1 py-0.5 rounded">
                      -{summary.expense.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Transaction Details Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {formatKoreanDate(selectedDate, true)}
              </h3>
              <p className="text-xs text-slate-400">
                이 날짜의 가계부 내역 ({selectedDateTransactions.length}건)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-right">
              {selectedDateIncome > 0 && (
                <span className="text-blue-600 mr-2">+{formatCurrency(selectedDateIncome)}</span>
              )}
              {selectedDateExpense > 0 && (
                <span className="text-rose-600">-{formatCurrency(selectedDateExpense)}</span>
              )}
            </div>
            <button
              onClick={() => onOpenNewTransactionForDate(selectedDate)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>이 날짜에 작성</span>
            </button>
          </div>
        </div>

        {selectedDateTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
            <p>선택한 날짜에 기록된 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {selectedDateTransactions.map(tx => {
              const cat = catMap.get(tx.categoryId);
              const pay = payMap.get(tx.paymentMethodId);

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="py-3 px-2 flex items-center justify-between rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat?.color || '#94a3b8' }}
                    >
                      <CategoryIcon name={cat?.icon || 'HelpCircle'} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {tx.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{tx.time || '12:00'}</span>
                        <span>•</span>
                        <span>{cat?.name}</span>
                        <span>•</span>
                        <span>{pay?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs sm:text-sm font-extrabold ${
                        tx.type === 'expense' ? 'text-rose-600' : 'text-blue-600'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </div>
                    {tx.memo && (
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {tx.memo}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
