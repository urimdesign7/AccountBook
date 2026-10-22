import { Category, PaymentMethod, AccountAsset, RecurringItem } from '../types/ledger';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses (지출)
  { id: 'cat-food', name: '식비', icon: 'UtensilsCrossed', color: '#f97316', type: 'expense' },
  { id: 'cat-cafe', name: '카페/간식', icon: 'Coffee', color: '#8b5cf6', type: 'expense' },
  { id: 'cat-transport', name: '교통/차량', icon: 'Car', color: '#0ea5e9', type: 'expense' },
  { id: 'cat-mart', name: '마트/편의점', icon: 'Store', color: '#10b981', type: 'expense' },
  { id: 'cat-shopping', name: '쇼핑/의류', icon: 'ShoppingBag', color: '#ec4899', type: 'expense' },
  { id: 'cat-housing', name: '주거/통신', icon: 'Home', color: '#6366f1', type: 'expense' },
  { id: 'cat-health', name: '의료/건강', icon: 'HeartPulse', color: '#ef4444', type: 'expense' },
  { id: 'cat-culture', name: '문화/여가', icon: 'Film', color: '#f59e0b', type: 'expense' },
  { id: 'cat-beauty', name: '뷰티/미용', icon: 'Sparkles', color: '#d946ef', type: 'expense' },
  { id: 'cat-education', name: '교육/학습', icon: 'GraduationCap', color: '#14b8a6', type: 'expense' },
  { id: 'cat-event', name: '경조사/선물', icon: 'Gift', color: '#f43f5e', type: 'expense' },
  { id: 'cat-finance', name: '금융/보험', icon: 'CreditCard', color: '#64748b', type: 'expense' },
  { id: 'cat-pet', name: '반려동물', icon: 'Dog', color: '#84cc16', type: 'expense' },
  { id: 'cat-other-exp', name: '기타지출', icon: 'MoreHorizontal', color: '#94a3b8', type: 'expense' },

  // Incomes (수입)
  { id: 'cat-salary', name: '급여/월급', icon: 'BadgeDollarSign', color: '#3b82f6', type: 'income' },
  { id: 'cat-bonus', name: '상여/보너스', icon: 'Coins', color: '#10b981', type: 'income' },
  { id: 'cat-side', name: '부수입', icon: 'TrendingUp', color: '#8b5cf6', type: 'income' },
  { id: 'cat-allowance', name: '용돈', icon: 'HandCoins', color: '#ec4899', type: 'income' },
  { id: 'cat-interest', name: '금융수익/이자', icon: 'PiggyBank', color: '#06b6d4', type: 'income' },
  { id: 'cat-used', name: '중고거래', icon: 'Repeat', color: '#f97316', type: 'income' },
  { id: 'cat-other-inc', name: '기타수입', icon: 'PlusCircle', color: '#64748b', type: 'income' },

  // Transfer (이체)
  { id: 'cat-transfer', name: '계좌이체', icon: 'ArrowLeftRight', color: '#6366f1', type: 'transfer' },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pay-shinhan', name: '신한카드', type: 'card', icon: 'CreditCard', color: '#0284c7' },
  { id: 'pay-kb', name: 'KB국민카드', type: 'card', icon: 'CreditCard', color: '#f59e0b' },
  { id: 'pay-hyundai', name: '현대카드', type: 'card', icon: 'CreditCard', color: '#1e293b' },
  { id: 'pay-samsung', name: '삼성카드', type: 'card', icon: 'CreditCard', color: '#2563eb' },
  { id: 'pay-kakao-bank', name: '카카오뱅크', type: 'bank', icon: 'Landmark', color: '#facc15' },
  { id: 'pay-toss', name: '토스뱅크', type: 'bank', icon: 'Landmark', color: '#3b82f6' },
  { id: 'pay-kakaopay', name: '카카오페이', type: 'pay', icon: 'Smartphone', color: '#eab308' },
  { id: 'pay-naverpay', name: '네이버페이', type: 'pay', icon: 'Smartphone', color: '#22c55e' },
  { id: 'pay-cash', name: '현금', type: 'cash', icon: 'Banknote', color: '#64748b' },
];

export const DEFAULT_ACCOUNTS: AccountAsset[] = [
  { id: 'acc-1', name: '카카오뱅크 생활비통장', type: 'bank', balance: 2450000, color: '#facc15', accountNumber: '3333-01-****' },
  { id: 'acc-2', name: '토스 비상금통장', type: 'bank', balance: 5000000, color: '#3b82f6', accountNumber: '1000-24-****' },
  { id: 'acc-3', name: '신한 주거래통장 (월급)', type: 'bank', balance: 1320000, color: '#0284c7', accountNumber: '110-384-****' },
  { id: 'acc-4', name: '카카오페이 머니', type: 'cash', balance: 185000, color: '#eab308' },
  { id: 'acc-5', name: '네이버페이 포인트', type: 'cash', balance: 42000, color: '#22c55e' },
  { id: 'acc-6', name: '지갑 속 현금', type: 'cash', balance: 65000, color: '#64748b' },
];

export const DEFAULT_RECURRING: RecurringItem[] = [
  { id: 'rec-1', title: '넷플릭스 프리미엄', amount: 17000, type: 'expense', categoryId: 'cat-culture', paymentMethodId: 'pay-shinhan', dayOfMonth: 5, active: true },
  { id: 'rec-2', title: '스마트폰 통신요금', amount: 65000, type: 'expense', categoryId: 'cat-housing', paymentMethodId: 'pay-shinhan', dayOfMonth: 15, active: true },
  { id: 'rec-3', title: '아파트 관리비', amount: 185000, type: 'expense', categoryId: 'cat-housing', paymentMethodId: 'pay-kakao-bank', dayOfMonth: 25, active: true },
  { id: 'rec-4', title: '유튜브 프리미엄', amount: 14900, type: 'expense', categoryId: 'cat-culture', paymentMethodId: 'pay-hyundai', dayOfMonth: 12, active: true },
  { id: 'rec-5', title: '헬스장 정기권', amount: 80000, type: 'expense', categoryId: 'cat-health', paymentMethodId: 'pay-kb', dayOfMonth: 1, active: true },
  { id: 'rec-6', title: '월급 입금', amount: 3500000, type: 'income', categoryId: 'cat-salary', paymentMethodId: 'pay-kakao-bank', dayOfMonth: 25, active: true },
];
