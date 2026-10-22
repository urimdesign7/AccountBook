import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  CreditCard, 
  Calendar, 
  Clock, 
  Tag, 
  FileText,
  HelpCircle,
  Zap
} from 'lucide-react';
import { Category, PaymentMethod, Transaction, TransactionType } from '../types/ledger';
import { parseSmsOrText, SAMPLE_SMS_LIST, ParsedTransactionResult } from '../utils/smsParser';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface QuickSmsParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const QuickSmsParserModal: React.FC<QuickSmsParserModalProps> = ({
  isOpen,
  onClose,
  categories,
  paymentMethods,
  onAddTransaction
}) => {
  const [inputText, setInputText] = useState('');
  const [parsed, setParsed] = useState<ParsedTransactionResult | null>(null);
  const [editableType, setEditableType] = useState<TransactionType>('expense');
  const [editableTitle, setEditableTitle] = useState('');
  const [editableAmount, setEditableAmount] = useState<number>(0);
  const [editableDate, setEditableDate] = useState('');
  const [editableTime, setEditableTime] = useState('');
  const [editableCategoryId, setEditableCategoryId] = useState('');
  const [editablePaymentMethodId, setEditablePaymentMethodId] = useState('');
  const [editableMemo, setEditableMemo] = useState('');

  // Reparse whenever inputText changes
  useEffect(() => {
    if (!inputText.trim()) {
      setParsed(null);
      return;
    }

    const result = parseSmsOrText(inputText, categories, paymentMethods);
    setParsed(result);
    setEditableType(result.type);
    setEditableTitle(result.title);
    setEditableAmount(result.amount);
    setEditableDate(result.date);
    setEditableTime(result.time);
    setEditableCategoryId(result.categoryId || categories[0]?.id || '');
    setEditablePaymentMethodId(result.paymentMethodId || paymentMethods[0]?.id || '');
    setEditableMemo(result.memo || '');
  }, [inputText, categories, paymentMethods]);

  if (!isOpen) return null;

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
  };

  const handleSave = () => {
    if (!editableTitle.trim() || editableAmount <= 0) return;

    onAddTransaction({
      type: editableType,
      title: editableTitle.trim(),
      amount: editableAmount,
      date: editableDate || new Date().toISOString().slice(0, 10),
      time: editableTime || '12:00',
      categoryId: editableCategoryId,
      paymentMethodId: editablePaymentMethodId,
      memo: editableMemo ? `${editableMemo} (문자 자동입력)` : '문자/알림 자동 분석',
      tags: ['스마트입력']
    });

    setInputText('');
    setParsed(null);
    onClose();
  };

  const currentCategory = categories.find(c => c.id === editableCategoryId);

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
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">문자·알림 자동 작성</h2>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 스마트 파서
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  카드 승인 문자, 카톡 결제 알림, 계좌 입출금 내역을 그대로 붙여넣으세요!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Quick Sample Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  원클릭 샘플 테스트
                </label>
                <span className="text-[11px] text-slate-400">클릭하면 즉시 입력 & 분석</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_SMS_LIST.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample.text)}
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 transition-all text-left flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{sample.label}</span>
                    <span className="text-[10px] text-slate-400">({sample.badge})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  문자 / 알림 내용 붙여넣기
                </label>
                {inputText && (
                  <button
                    onClick={() => setInputText('')}
                    className="text-[11px] text-slate-400 hover:text-red-500"
                  >
                    지우기
                  </button>
                )}
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="예: [신한체크승인] 10/22 13:20 스타벅스코리아 6,500원 잔액 1,240,000원&#10;또는 '점심 순대국 9000원 국민카드'"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-800 placeholder:text-slate-400 transition-all resize-none font-sans"
              />
            </div>

            {/* Live Parsing Result Preview */}
            {parsed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-4 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-blue-100/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">분석 결과 미리보기</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      정확도 {parsed.confidence}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-500">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    내용을 직접 수정할 수도 있어요
                  </div>
                </div>

                {/* Form fields for review & adjustment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Type Toggle */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">구분</label>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setEditableType('expense')}
                        className={`text-xs py-1.5 rounded-lg font-medium transition-all ${
                          editableType === 'expense'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        지출
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditableType('income')}
                        className={`text-xs py-1.5 rounded-lg font-medium transition-all ${
                          editableType === 'income'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        수입
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">금액 (원)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editableAmount || ''}
                        onChange={(e) => setEditableAmount(Number(e.target.value))}
                        className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        {formatCurrency(editableAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Title / Store */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">상호 / 내역명</label>
                    <input
                      type="text"
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      placeholder="상호명을 입력하세요"
                    />
                  </div>

                  {/* Category Picker */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">카테고리</label>
                    <select
                      value={editableCategoryId}
                      onChange={(e) => setEditableCategoryId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {categories
                        .filter(c => editableType === 'expense' ? c.type === 'expense' : c.type === 'income')
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">결제 수단</label>
                    <select
                      value={editablePaymentMethodId}
                      onChange={(e) => setEditablePaymentMethodId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {paymentMethods.map(pm => (
                        <option key={pm.id} value={pm.id}>
                          {pm.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">날짜</label>
                      <input
                        type="date"
                        value={editableDate}
                        onChange={(e) => setEditableDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">시간</label>
                      <input
                        type="time"
                        value={editableTime}
                        onChange={(e) => setEditableTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Final summary banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-200/60">
                  <div className="flex items-center gap-2.5">
                    {currentCategory && (
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-sm"
                        style={{ backgroundColor: currentCategory.color }}
                      >
                        <CategoryIcon name={currentCategory.icon} className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {editableTitle || '미지정'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {currentCategory?.name} • {editableDate} {editableTime}
                      </div>
                    </div>
                  </div>
                  <div className={`text-base font-bold ${editableType === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                    {editableType === 'expense' ? '-' : '+'}{formatCurrency(editableAmount)}
                  </div>
                </div>
              </motion.div>
            )}

            {!parsed && !inputText && (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">문자를 복사해서 붙여넣어 보세요</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  신한, 국민, 현대, 삼성, 카카오뱅크, 토스 등 모든 은행 및 카드사의 결제 알림을 즉시 가계부 데이터로 변환합니다.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              disabled={!parsed || editableAmount <= 0 || !editableTitle.trim()}
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              가계부에 즉시 등록하기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
