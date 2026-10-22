import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight,
  Clock,
  Calendar,
  CreditCard,
  Plus,
  Activity,
  Lightbulb,
  Flame
} from 'lucide-react';
import { Transaction, Category, PaymentMethod, BudgetGoal } from '../types/ledger';
import { formatCurrency, formatKoreanDate } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

interface DashboardViewProps {
  currentMonth: string;
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  budgetGoal: BudgetGoal;
  onOpenSmsParser: () => void;
  onOpenNewTransaction: () => void;
  onSelectTransaction: (t: Transaction) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentMonth,
  transactions,
  categories,
  paymentMethods,
  budgetGoal,
  onOpenSmsParser,
  onOpenNewTransaction,
  onSelectTransaction,
  onNavigateToTab
}) => {
  // Filter for current month
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  // Calculate previous month
  const [year, month] = currentMonth.split('-').map(Number);
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  const prevMonthTransactions = transactions.filter(t => t.date.startsWith(prevMonthStr));

  // Current month totals
  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Previous month expense comparison
  const prevTotalExpense = prevMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseDiff = totalExpense - prevTotalExpense;
  const expenseDiffPercent = prevTotalExpense > 0 
    ? Math.round((expenseDiff / prevTotalExpense) * 100) 
    : 0;

  // Budget calculations
  const totalBudget = budgetGoal.totalBudget || 2000000;
  const remainingBudget = totalBudget - totalExpense;
  const budgetUsagePercent = Math.min(Math.round((totalExpense / totalBudget) * 100), 100);

  // Daily budget remaining
  const now = new Date();
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentActiveMonth = currentMonth === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentDay = isCurrentActiveMonth ? now.getDate() : daysInMonth;
  const remainingDays = Math.max(1, daysInMonth - currentDay + 1);
  const dailyRecommendedBudget = Math.max(0, Math.round(remainingBudget / remainingDays));
  const dailyAvgExpense = Math.round(totalExpense / Math.max(1, currentDay));

  // Category breakdown for expenses
  const categoryExpenses: Record<string, number> = {};
  currentMonthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryExpenses[t.categoryId] = (categoryExpenses[t.categoryId] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryExpenses)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat?.name || '기타',
        icon: cat?.icon || 'HelpCircle',
        color: cat?.color || '#94a3b8',
        amount,
        percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Top category
  const topCategory = sortedCategories[0];
  const secondCategory = sortedCategories[1];

  // Daily expense pattern (Peak day)
  const dayTotals: Record<string, number> = {};
  currentMonthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      dayTotals[t.date] = (dayTotals[t.date] || 0) + t.amount;
    });

  let peakDayDate = '';
  let peakDayAmount = 0;
  for (const [d, amt] of Object.entries(dayTotals)) {
    if (amt > peakDayAmount) {
      peakDayAmount = amt;
      peakDayDate = d;
    }
  }

  // Previous month category expenses & comparison
  const prevCategoryExpenses: Record<string, number> = {};
  prevMonthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      prevCategoryExpenses[t.categoryId] = (prevCategoryExpenses[t.categoryId] || 0) + t.amount;
    });

  let maxIncreasedCat = '';
  let maxIncreaseVal = 0;
  let maxDecreasedCat = '';
  let maxDecreaseVal = 0;

  categories.filter(c => c.type === 'expense').forEach(c => {
    const cur = categoryExpenses[c.id] || 0;
    const prev = prevCategoryExpenses[c.id] || 0;
    const diff = cur - prev;
    if (diff > maxIncreaseVal) {
      maxIncreaseVal = diff;
      maxIncreasedCat = c.name;
    }
    if (diff < maxDecreaseVal) {
      maxDecreaseVal = diff;
      maxDecreasedCat = c.name;
    }
  });

  // Recent 5 transactions
  const recentTransactions = [...currentMonthTransactions]
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 5);

  const catMap = new Map(categories.map(c => [c.id, c]));
  const payMap = new Map(paymentMethods.map(p => [p.id, p]));

  return (
    <div className="space-y-6 pb-12">
      {/* Smart Quick Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white/95">
              <Sparkles className="w-3.5 h-3.5" />
              <span>스마트 문자 파싱 가계부</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              카드 결제 문자나 알림을 복사해 간편하게 작성하세요!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
              금액, 상호, 날짜, 결제카드, 카테고리를 알아서 쏙쏙 골라 가계부에 깔끔하게 기록해 드립니다.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenSmsParser}
              className="px-5 py-3 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 text-xs sm:text-sm font-extrabold shadow-lg shadow-black/10 flex items-center gap-2 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>문자 붙여넣기</span>
            </button>
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold backdrop-blur-md border border-white/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              직접 입력
            </button>
          </div>
        </div>
      </motion.div>

      {/* 이번 달 요약 카드 (This Month Spending Summary & Pattern Card) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {month}월 소비 요약 및 지출 패턴
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  총 {currentMonthTransactions.filter(t => t.type === 'expense').length}건 지출
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                현재 선택된 월의 지출 패턴과 전월 대비 소비 변화를 한눈에 요약합니다.
              </p>
            </div>
          </div>

          {/* MoM Badge */}
          {prevTotalExpense > 0 ? (
            <div className={`self-start sm:self-auto px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold ${
              expenseDiff > 0 
                ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
              {expenseDiff > 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-rose-500" />
                  <span>전월 대비 {Math.abs(expenseDiffPercent)}% 증가 (+{formatCurrency(expenseDiff)})</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  <span>전월 대비 {Math.abs(expenseDiffPercent)}% 절약 (-{formatCurrency(Math.abs(expenseDiff))})</span>
                </>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              전월 비교 데이터 없음
            </div>
          )}
        </div>

        {/* 4 Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. 전월 대비 증감 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">전월 대비 변화</span>
            <div className="flex items-center gap-1">
              <span className={`text-base font-black ${expenseDiff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {expenseDiff > 0 ? '+' : '-'}{formatCurrency(Math.abs(expenseDiff))}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block truncate">
              {prevTotalExpense > 0 ? `지난달 ${formatCurrency(prevTotalExpense)}` : '지난달 내역 없음'}
            </span>
          </div>

          {/* 2. 최다 지출 카테고리 (패턴) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">최다 지출 분야</span>
            <div className="flex items-center gap-1.5">
              {topCategory && (
                <div
                  className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[9px] shrink-0"
                  style={{ backgroundColor: topCategory.color }}
                >
                  <CategoryIcon name={topCategory.icon} className="w-2.5 h-2.5" />
                </div>
              )}
              <span className="text-base font-black text-slate-800 truncate">
                {topCategory ? topCategory.name : '없음'}
              </span>
              {topCategory && (
                <span className="text-xs font-bold text-slate-500">
                  {topCategory.percent}%
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 block truncate">
              {topCategory ? formatCurrency(topCategory.amount) : '지출 내역 없음'}
            </span>
          </div>

          {/* 3. 일평균 실제 지출 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">일평균 지출액</span>
            <div className="text-base font-black text-slate-800">
              {formatCurrency(dailyAvgExpense)}
            </div>
            <span className="text-[11px] text-slate-500 block truncate">
              권장 하루: {formatCurrency(dailyRecommendedBudget)}
            </span>
          </div>

          {/* 4. 최대 지출일 (피크) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">최대 지출일</span>
            <div className="text-base font-black text-slate-800 truncate">
              {peakDayDate ? formatKoreanDate(peakDayDate).split(' (')[0] : '-'}
            </div>
            <span className="text-[11px] text-slate-500 block truncate">
              {peakDayAmount > 0 ? `${formatCurrency(peakDayAmount)} 지출` : '-'}
            </span>
          </div>
        </div>

        {/* Insight / Pattern Diagnosis banner */}
        <div className="flex items-start sm:items-center gap-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100/80 text-xs text-slate-700">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-0.5">
            <span className="font-bold text-blue-900 block">소비 패턴 분석 브리핑</span>
            <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
              {totalExpense === 0 ? (
                '이번 달 등록된 지출 내역이 없습니다. 문자를 붙여넣거나 새 지출을 등록해보세요!'
              ) : (
                <>
                  이번 달은 <b>{topCategory?.name}</b>
                  {secondCategory ? <> 및 <b>{secondCategory.name}</b></> : ''} 지출이 전체의{' '}
                  <b className="text-blue-700">
                    {Math.round((((topCategory?.amount || 0) + (secondCategory?.amount || 0)) / Math.max(1, totalExpense)) * 100)}%
                  </b>
                  를 차지하고 있습니다.{' '}
                  {prevTotalExpense > 0 ? (
                    expenseDiff <= 0 ? (
                      `전월 대비 총 ${formatCurrency(Math.abs(expenseDiff))}을 절약하며 훌륭한 예산 통제력을 보여주고 계십니다! 🎉`
                    ) : (
                      `전월 대비 총 ${formatCurrency(expenseDiff)}이 증가하였으니, 남은 ${remainingDays}일 동안 하루 권장 예산(${formatCurrency(dailyRecommendedBudget)}) 내에서 관리해보세요.`
                    )
                  ) : (
                    `현재 페이스를 유지하며 남은 기간 예산을 건강하게 운용해보세요.`
                  )}
                  {maxDecreasedCat && maxDecreaseVal < 0 && (
                    <span className="ml-1 text-emerald-700 font-semibold">
                      (특히 {maxDecreasedCat}에서 {formatCurrency(Math.abs(maxDecreaseVal))} 절약 중 ✨)
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold text-slate-500">이번 달 총 지출</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(totalExpense)}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            {prevTotalExpense > 0 ? (
              <span className={`flex items-center font-bold ${expenseDiff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {expenseDiff > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                전월 대비 {Math.abs(expenseDiffPercent)}% {expenseDiff > 0 ? '증가' : '절약'}
              </span>
            ) : (
              <span className="text-slate-400">전월 데이터 없음</span>
            )}
          </div>
        </motion.div>

        {/* Total Income */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold text-slate-500">이번 달 총 수입</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(totalIncome)}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span>수입 건수 {currentMonthTransactions.filter(t => t.type === 'income').length}건</span>
          </div>
        </motion.div>

        {/* Remaining Budget & Daily Budget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold text-slate-500">남은 예산 (소진율 {budgetUsagePercent}%)</span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              remainingBudget < 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold tracking-tight ${remainingBudget < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {formatCurrency(remainingBudget)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>남은 {remainingDays}일간 하루 권장</span>
            <span className="font-bold text-blue-600">{formatCurrency(dailyRecommendedBudget)}</span>
          </div>
        </motion.div>

        {/* Net Savings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold text-slate-500">순수익 (수입 - 지출)</span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              netSavings >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold tracking-tight ${netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings)}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span>저축률: {totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0}%</span>
          </div>
        </motion.div>
      </div>

      {/* Budget Progress Bar Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              {month}월 총 예산 달성 현황
            </h3>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            총 예산 {formatCurrency(totalBudget)} 중 <b className="text-slate-900">{formatCurrency(totalExpense)}</b> 사용
          </div>
        </div>

        {/* Progress track */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all ${
              budgetUsagePercent > 100
                ? 'bg-rose-500'
                : budgetUsagePercent > 80
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span className={`font-semibold ${budgetUsagePercent >= 100 ? 'text-rose-600' : 'text-slate-600'}`}>
            {budgetUsagePercent}% 소진
          </span>
        </div>
      </div>

      {/* Middle Section: Top Categories + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">지출 카테고리 순위</h3>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
            >
              분석 보기 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              이번 달 지출 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCategories.slice(0, 5).map((cat, idx) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px]"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                      <span className="text-[11px] text-slate-400 min-w-[28px] text-right">{cat.percent}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
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

          {topCategory && (
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                이번 달은 <b className="text-slate-900">{topCategory.name}</b>({formatCurrency(topCategory.amount)}) 지출이 가장 많아요!
              </span>
            </div>
          )}
        </div>

        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">최근 작성된 내역</h3>
              <p className="text-xs text-slate-400 mt-0.5">가장 최근 입력된 거래 내역입니다.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewTransaction}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="추가하기"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToTab('transactions')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                전체보기 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <p>아직 등록된 가계부 내역이 없습니다.</p>
              <button
                onClick={onOpenSmsParser}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 cursor-pointer"
              >
                문자로 첫 내역 등록하기
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
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
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: cat?.color || '#94a3b8' }}
                      >
                        <CategoryIcon name={cat?.icon || 'HelpCircle'} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tx.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{formatKoreanDate(tx.date)}</span>
                          <span>•</span>
                          <span>{cat?.name || '기타'}</span>
                          <span>•</span>
                          <span>{pay?.name || '기타'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs sm:text-sm font-extrabold ${
                          tx.type === 'expense'
                            ? 'text-rose-600'
                            : tx.type === 'income'
                            ? 'text-blue-600'
                            : 'text-indigo-600'
                        }`}
                      >
                        {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </div>
                      {tx.memo && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
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
    </div>
  );
};
