import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Trash2, 
  Plus, 
  Tag as TagIcon, 
  Calendar, 
  Clock, 
  CreditCard, 
  FileText,
  Sparkles,
  Repeat
} from 'lucide-react';
import { Category, PaymentMethod, Transaction, TransactionType } from '../types/ledger';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  defaultDate?: string;
}

const QUICK_AMOUNTS = [
  { label: '+1만', value: 10000 },
  { label: '+5만', value: 50000 },
  { label: '+10만', value: 100000 },
  { label: '+50만', value: 500000 },
  { label: '+100만', value: 1000000 },
];

const POPULAR_TAGS = ['점심', '저녁', '직장', '데이트', '주말', '생필품', '고정지출', '선물', '구독'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialTransaction,
  categories,
  paymentMethods,
  onSave,
  onDelete,
  defaultDate
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState<string>('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [memo, setMemo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount);
      setAmountInput(String(initialTransaction.amount));
      setTitle(initialTransaction.title);
      setDate(initialTransaction.date);
      setTime(initialTransaction.time || '12:00');
      setCategoryId(initialTransaction.categoryId);
      setPaymentMethodId(initialTransaction.paymentMethodId);
      setMemo(initialTransaction.memo || '');
      setTags(initialTransaction.tags || []);
      setIsRecurring(!!initialTransaction.isRecurring);
    } else {
      const now = new Date();
      setType('expense');
      setAmount(0);
      setAmountInput('');
      setTitle('');
      setDate(defaultDate || now.toISOString().slice(0, 10));
      setTime(now.toTimeString().slice(0, 5));
      const firstExpenseCat = categories.find(c => c.type === 'expense');
      setCategoryId(firstExpenseCat?.id || categories[0]?.id || '');
      setPaymentMethodId(paymentMethods[0]?.id || '');
      setMemo('');
      setTags([]);
      setIsRecurring(false);
    }
  }, [initialTransaction, isOpen, defaultDate, categories, paymentMethods]);

  if (!isOpen) return null;

  const handleAmountChange = (val: string) => {
    const numeric = val.replace(/[^0-9]/g, '');
    const numVal = numeric ? parseInt(numeric, 10) : 0;
    setAmount(numVal);
    setAmountInput(numeric ? numVal.toLocaleString('ko-KR') : '');
  };

  const handleAddQuickAmount = (delta: number) => {
    const newAmount = amount + delta;
    setAmount(newAmount);
    setAmountInput(newAmount.toLocaleString('ko-KR'));
  };

  const handleResetAmount = () => {
    setAmount(0);
    setAmountInput('');
  };

  const handleAddTag = (t: string) => {
    const cleanTag = t.trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    // Switch to first matching category
    const matchingCat = categories.find(c => c.type === newType);
    if (matchingCat) {
      setCategoryId(matchingCat.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !title.trim()) return;

    onSave(
      {
        type,
        amount,
        title: title.trim(),
        date: date || new Date().toISOString().slice(0, 10),
        time: time || '12:00',
        categoryId,
        paymentMethodId,
        memo: memo.trim(),
        tags,
        isRecurring
      },
      initialTransaction?.id
    );

    onClose();
  };

  const filteredCategories = categories.filter(c => {
    if (type === 'expense') return c.type === 'expense';
    if (type === 'income') return c.type === 'income';
    return c.type === 'transfer';
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800">
              {initialTransaction ? '가계부 내역 수정' : '새 가계부 내역 작성'}
            </h2>
            <div className="flex items-center gap-1.5">
              {initialTransaction && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('이 내역을 삭제하시겠습니까?')) {
                      onDelete(initialTransaction.id);
                      onClose();
                    }
                  }}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Type Selector (지출 / 수입 / 이체) */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                지출 (Expense)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  type === 'income'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                수입 (Income)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('transfer')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  type === 'transfer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                이체 (Transfer)
              </button>
            </div>

            {/* Amount Input with Large Display */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                금액 <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-2xl font-bold text-slate-400">₩</span>
                <input
                  type="text"
                  autoFocus={!initialTransaction}
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3.5 text-2xl font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 tracking-tight"
                />
              </div>

              {/* Quick Increment Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => handleAddQuickAmount(q.value)}
                    className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent rounded-xl font-medium text-slate-600 transition-all cursor-pointer"
                  >
                    {q.label}
                  </button>
                ))}
                {amount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAmount}
                    className="text-xs px-2.5 py-1.5 text-slate-400 hover:text-red-500 transition-colors ml-auto cursor-pointer"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>

            {/* Title / Store */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                내역명 / 상호 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 스타벅스 강남점, 이마트 장보기, 10월 급여"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            {/* Category Grid */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2">
                카테고리 선택
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white shadow-sm ring-2 ring-blue-500'
                          : 'hover:bg-white/80'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-1 shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className={`text-[11px] truncate w-full ${isSelected ? 'font-bold text-blue-600' : 'text-slate-600'}`}>
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                결제 수단
              </label>
              <div className="flex flex-wrap gap-1.5">
                {paymentMethods.map((pm) => {
                  const isSelected = paymentMethodId === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethodId(pm.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pm.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  날짜
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  시간
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Tags & Memo */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                태그 (선택)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="태그 입력 후 Enter 또는 클릭"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {POPULAR_TAGS.map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => handleAddTag(pt)}
                    className="text-[11px] text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded-md transition-colors"
                  >
                    #{pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                메모 (선택)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="간단한 메모를 남겨보세요"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
              />
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">매월 정기 고정 지출/수입</div>
                  <div className="text-[11px] text-slate-500">구독료, 관리비, 월급 등 매월 반복되는 내역</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <div className="text-xs text-slate-500">
              {amount > 0 ? (
                <span>총 <b className="text-slate-900 font-bold">{formatCurrency(amount)}</b></span>
              ) : (
                '금액을 입력하세요'
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                disabled={amount <= 0 || !title.trim()}
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {initialTransaction ? '수정 완료' : '가계부 저장'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
