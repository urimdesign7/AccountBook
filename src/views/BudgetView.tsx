import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Target, 
  Plus, 
  Repeat, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { BudgetGoal, Category, PaymentMethod, RecurringItem, Transaction } from '../types/ledger';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

interface BudgetViewProps {
  currentMonth: string;
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  budgetGoal: BudgetGoal;
  recurringItems: RecurringItem[];
  onUpdateBudgetGoal: (budget: BudgetGoal) => void;
  onUpdateRecurringItems: (items: RecurringItem[]) => void;
  onApplyRecurringItem: (item: RecurringItem) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  currentMonth,
  transactions,
  categories,
  paymentMethods,
  budgetGoal,
  recurringItems,
  onUpdateBudgetGoal,
  onUpdateRecurringItems,
  onApplyRecurringItem
}) => {
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [newTotalBudget, setNewTotalBudget] = useState(budgetGoal.totalBudget.toString());
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);

  // New recurring state
  const [recTitle, setRecTitle] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recDay, setRecDay] = useState('1');
  const [recCategory, setRecCategory] = useState(categories[0]?.id || '');
  const [recPayment, setRecPayment] = useState(paymentMethods[0]?.id || '');

  const catMap = new Map(categories.map(c => [c.id, c]));
  const payMap = new Map(paymentMethods.map(p => [p.id, p]));

  // Month expense calculation
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const categoryExpenses: Record<string, number> = {};
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryExpenses[t.categoryId] = (categoryExpenses[t.categoryId] || 0) + t.amount;
    });

  const totalBudget = budgetGoal.totalBudget || 2000000;
  const remaining = totalBudget - totalExpense;
  const usagePercent = Math.min(Math.round((totalExpense / totalBudget) * 100), 100);

  const handleSaveTotalBudget = () => {
    const val = parseInt(newTotalBudget.replace(/[^0-9]/g, ''), 10) || 0;
    if (val > 0) {
      onUpdateBudgetGoal({
        ...budgetGoal,
        totalBudget: val
      });
      setIsEditingTotal(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleUpdateCategoryBudget = (catId: string, val: string) => {
    const amount = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    onUpdateBudgetGoal({
      ...budgetGoal,
      categoryBudgets: {
        ...(budgetGoal.categoryBudgets || {}),
        [catId]: amount
      }
    });
  };

  const handleAddRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(recAmount.replace(/[^0-9]/g, ''), 10) || 0;
    if (!recTitle.trim() || amt <= 0) return;

    const newItem: RecurringItem = {
      id: `rec-${Date.now()}`,
      title: recTitle.trim(),
      amount: amt,
      type: 'expense',
      categoryId: recCategory,
      paymentMethodId: recPayment,
      dayOfMonth: Math.min(31, Math.max(1, parseInt(recDay, 10) || 1)),
      active: true
    };

    onUpdateRecurringItems([...recurringItems, newItem]);
    setRecTitle('');
    setRecAmount('');
    setIsAddRecurringOpen(false);
  };

  const handleToggleRecurringActive = (id: string) => {
    onUpdateRecurringItems(
      recurringItems.map(item => item.id === id ? { ...item, active: !item.active } : item)
    );
  };

  const handleDeleteRecurring = (id: string) => {
    if (confirm('이 고정 지출 항목을 삭제하시겠습니까?')) {
      onUpdateRecurringItems(recurringItems.filter(item => item.id !== id));
    }
  };

  const todayDate = new Date().getDate();

  return (
    <div className="space-y-6 pb-12">
      {/* Total Monthly Budget Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {currentMonth.split('-')[1]}월 총 예산 관리
              </h2>
              <p className="text-xs text-slate-500">
                목표 예산을 세우고 과소비를 방지하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditingTotal ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newTotalBudget}
                  onChange={(e) => setNewTotalBudget(e.target.value)}
                  className="w-36 px-3 py-1.5 text-xs font-bold border border-blue-400 rounded-xl focus:outline-none"
                  placeholder="예: 2000000"
                />
                <button
                  onClick={handleSaveTotalBudget}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  저장
                </button>
                <button
                  onClick={() => setIsEditingTotal(false)}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNewTotalBudget(totalBudget.toString());
                  setIsEditingTotal(true);
                }}
                className="text-xs font-bold px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                예산 변경
              </button>
            )}
          </div>
        </div>

        {/* Big Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">목표 총 예산</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {formatCurrency(totalBudget)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">현재 총 지출</span>
            <div className="text-xl font-black text-rose-600 mt-1">
              {formatCurrency(totalExpense)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">남은 예산</span>
            <div className={`text-xl font-black mt-1 ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formatCurrency(remaining)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>예산 소진율</span>
            <span className={usagePercent >= 100 ? 'text-rose-600 font-bold' : ''}>
              {usagePercent}%
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 100
                  ? 'bg-rose-500'
                  : usagePercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Budget Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">카테고리별 예산 설정 및 소진율</h3>
          <span className="text-xs text-slate-400">금액을 입력하면 자동 저장됩니다</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.filter(c => c.type === 'expense').map(cat => {
            const catBudget = budgetGoal.categoryBudgets?.[cat.id] || 0;
            const spent = categoryExpenses[cat.id] || 0;
            const catPercent = catBudget > 0 ? Math.min(Math.round((spent / catBudget) * 100), 100) : 0;
            const isExceeded = catBudget > 0 && spent > catBudget;

            return (
              <div
                key={cat.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                  </div>

                  {/* Budget Input */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400">목표:</span>
                    <input
                      type="number"
                      defaultValue={catBudget || ''}
                      onBlur={(e) => handleUpdateCategoryBudget(cat.id, e.target.value)}
                      placeholder="예산 미설정"
                      className="w-24 px-2 py-1 text-right text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-500">원</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    지출: <b className={isExceeded ? 'text-rose-600' : 'text-slate-900'}>{formatCurrency(spent)}</b>
                  </span>
                  {catBudget > 0 && (
                    <span className={`font-bold ${isExceeded ? 'text-rose-600' : 'text-slate-500'}`}>
                      {catPercent}% {isExceeded ? '초과!' : ''}
                    </span>
                  )}
                </div>

                {catBudget > 0 && (
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isExceeded ? 'bg-rose-500' : 'bg-blue-600'}`}
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Items & Subscriptions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">정기 고정비 & 구독 서비스</h3>
              <p className="text-xs text-slate-400">매월 반복 결제되는 고정 지출을 관리하세요</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddRecurringOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>고정비 추가</span>
          </button>
        </div>

        {/* Modal for adding recurring */}
        {isAddRecurringOpen && (
          <form onSubmit={handleAddRecurring} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">새 정기 고정 지출 추가</span>
              <button
                type="button"
                onClick={() => setIsAddRecurringOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="text"
                value={recTitle}
                onChange={(e) => setRecTitle(e.target.value)}
                placeholder="항목명 (예: 넷플릭스)"
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="number"
                value={recAmount}
                onChange={(e) => setRecAmount(e.target.value)}
                placeholder="금액 (원)"
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                required
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 shrink-0">매월</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={recDay}
                  onChange={(e) => setRecDay(e.target.value)}
                  className="w-16 px-2 py-2 text-xs text-center bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500 shrink-0">일 결제</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  등록
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-100">
          {recurringItems.map((item) => {
            const cat = catMap.get(item.categoryId);
            const pay = payMap.get(item.paymentMethodId);
            const daysLeft = item.dayOfMonth - todayDate;
            const dDayLabel = daysLeft === 0 ? '오늘 결제' : daysLeft > 0 ? `D-${daysLeft}` : `다음달 ${item.dayOfMonth}일`;

            return (
              <div
                key={item.id}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat?.color || '#6366f1' }}
                  >
                    <CategoryIcon name={cat?.icon || 'Repeat'} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                        매월 {item.dayOfMonth}일 ({dDayLabel})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {cat?.name} • {pay?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                  <button
                    onClick={() => onApplyRecurringItem(item)}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    title="이번 달 가계부 내역에 바로 반영"
                  >
                    내역 반영
                  </button>
                  <button
                    onClick={() => handleDeleteRecurring(item.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
