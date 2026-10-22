import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Award,
  Wallet
} from 'lucide-react';
import { Transaction, Category, PaymentMethod } from '../types/ledger';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

interface AnalyticsViewProps {
  currentMonth: string;
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentMonth,
  transactions,
  categories,
  paymentMethods,
}) => {
  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');

  const catMap = new Map(categories.map(c => [c.id, c]));
  const payMap = new Map(paymentMethods.map(p => [p.id, p]));

  // Month transactions
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const filteredByType = monthTransactions.filter(t => t.type === activeType);
  const totalAmount = filteredByType.reduce((s, t) => s + t.amount, 0);

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  filteredByType.forEach(t => {
    categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
  });

  const categoryList = Object.entries(categoryTotals)
    .map(([catId, amount]) => {
      const cat = catMap.get(catId);
      return {
        id: catId,
        name: cat?.name || '기타',
        icon: cat?.icon || 'HelpCircle',
        color: cat?.color || '#94a3b8',
        amount,
        percent: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Payment method breakdown
  const paymentTotals: Record<string, number> = {};
  filteredByType.forEach(t => {
    paymentTotals[t.paymentMethodId] = (paymentTotals[t.paymentMethodId] || 0) + t.amount;
  });

  const paymentList = Object.entries(paymentTotals)
    .map(([pmId, amount]) => {
      const pm = payMap.get(pmId);
      return {
        id: pmId,
        name: pm?.name || '기타',
        icon: pm?.icon || 'CreditCard',
        color: pm?.color || '#3b82f6',
        amount,
        percent: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Top 5 Highest transactions
  const topTransactions = [...filteredByType]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Recent 6 Months Trend Data
  const [currentYear, curMonthNum] = currentMonth.split('-').map(Number);
  const recentMonths: { monthKey: string; label: string; income: number; expense: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    let y = currentYear;
    let m = curMonthNum - i;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    const key = `${y}-${String(m).padStart(2, '0')}`;
    const mTx = transactions.filter(t => t.date.startsWith(key));
    const inc = mTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = mTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    recentMonths.push({
      monthKey: key,
      label: `${m}월`,
      income: inc,
      expense: exp
    });
  }

  const maxMonthValue = Math.max(
    ...recentMonths.map(m => Math.max(m.income, m.expense)),
    1000000
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Switcher & Overview Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            {curMonthNum}월 수입·지출 심층 분석
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            가장 많은 돈이 나간 곳과 월별 지출 트렌드를 분석합니다.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveType('expense')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeType === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            지출 분석
          </button>
          <button
            onClick={() => setActiveType('income')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeType === 'income'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            수입 분석
          </button>
        </div>
      </div>

      {/* 6 Months Trend Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">최근 6개월 수입/지출 추이</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> 수입
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> 지출
            </span>
          </div>
        </div>

        {/* SVG/Bar Chart Container */}
        <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-6 pt-6 px-2">
          {recentMonths.map((m) => {
            const incHeight = (m.income / maxMonthValue) * 160;
            const expHeight = (m.expense / maxMonthValue) * 160;
            const isSelected = m.monthKey === currentMonth;

            return (
              <div key={m.monthKey} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex items-end justify-center gap-1.5 h-[160px]">
                  {/* Income bar */}
                  <div
                    style={{ height: `${Math.max(incHeight, 4)}px` }}
                    className="w-3.5 sm:w-5 bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all relative group/bar"
                  >
                    <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none shadow-md">
                      수입: {formatCompactCurrency(m.income)}
                    </div>
                  </div>

                  {/* Expense bar */}
                  <div
                    style={{ height: `${Math.max(expHeight, 4)}px` }}
                    className="w-3.5 sm:w-5 bg-rose-400 hover:bg-rose-500 rounded-t-md transition-all relative group/bar"
                  >
                    <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none shadow-md">
                      지출: {formatCompactCurrency(m.expense)}
                    </div>
                  </div>
                </div>

                <span className={`text-xs font-bold ${isSelected ? 'text-blue-600 underline underline-offset-4' : 'text-slate-500'}`}>
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Category Breakdown + Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                카테고리별 {activeType === 'expense' ? '지출' : '수입'} 비중
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-700">
              총 {formatCurrency(totalAmount)}
            </span>
          </div>

          {categoryList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3.5">
              {categoryList.map((cat, idx) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 text-center font-bold text-slate-400 text-[11px]">
                        {idx + 1}
                      </span>
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                      <span className="text-slate-400 min-w-[36px] text-right font-medium">
                        {cat.percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percent}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">결제 수단별 비중</h3>
            </div>
            <span className="text-xs text-slate-400">
              총 {paymentList.length}개 결제수단
            </span>
          </div>

          {paymentList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3.5">
              {paymentList.map((pm, idx) => (
                <div key={pm.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800">{pm.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(pm.amount)}</span>
                      <span className="text-slate-400 min-w-[36px] text-right font-medium">
                        {pm.percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${pm.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Highest Transactions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">
            이번 달 가장 큰 {activeType === 'expense' ? '지출' : '수입'} TOP 5
          </h3>
        </div>

        {topTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            내역이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topTransactions.map((tx, idx) => {
              const cat = catMap.get(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex flex-col justify-between space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {tx.date.slice(5)}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {tx.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {cat?.name}
                    </div>
                  </div>
                  <div className={`text-sm font-extrabold ${activeType === 'expense' ? 'text-rose-600' : 'text-blue-600'}`}>
                    {formatCurrency(tx.amount)}
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
