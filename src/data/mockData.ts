import { Transaction } from '../types/ledger';

/**
 * Generate initial realistic sample transactions for the current month and previous month
 */
export function generateInitialTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const mStr = String(month).padStart(2, '0');
  const pmStr = String(prevMonth).padStart(2, '0');

  const items: Omit<Transaction, 'id' | 'createdAt'>[] = [
    // Current Month Income
    {
      type: 'income',
      amount: 3500000,
      date: `${year}-${mStr}-10`,
      time: '09:00',
      categoryId: 'cat-salary',
      paymentMethodId: 'pay-kakao-bank',
      title: '10월 정기 급여',
      memo: '기본급 및 식대 포함',
      tags: ['월급', '급여']
    },
    {
      type: 'income',
      amount: 300000,
      date: `${year}-${mStr}-15`,
      time: '18:30',
      categoryId: 'cat-side',
      paymentMethodId: 'pay-toss',
      title: '디자인 외주 부수입',
      memo: '로고 디자인 프로젝트 정산',
      tags: ['부수입', '외주']
    },
    {
      type: 'income',
      amount: 45000,
      date: `${year}-${mStr}-18`,
      time: '14:20',
      categoryId: 'cat-used',
      paymentMethodId: 'pay-cash',
      title: '당근마켓 키보드 판매',
      memo: '중고 기계식 키보드 직거래',
      tags: ['당근', '중고']
    },

    // Current Month Expenses
    {
      type: 'expense',
      amount: 185000,
      date: `${year}-${mStr}-05`,
      time: '10:00',
      categoryId: 'cat-housing',
      paymentMethodId: 'pay-kakao-bank',
      title: '아파트 관리비',
      memo: '9월분 전기/수도세 포함',
      tags: ['고정지출', '관리비']
    },
    {
      type: 'expense',
      amount: 17000,
      date: `${year}-${mStr}-05`,
      time: '11:15',
      categoryId: 'cat-culture',
      paymentMethodId: 'pay-shinhan',
      title: '넷플릭스 프리미엄',
      memo: '월간 자동결제',
      tags: ['구독', 'OTT']
    },
    {
      type: 'expense',
      amount: 14900,
      date: `${year}-${mStr}-12`,
      time: '04:00',
      categoryId: 'cat-culture',
      paymentMethodId: 'pay-hyundai',
      title: '유튜브 프리미엄',
      memo: '멤버십 결제',
      tags: ['구독']
    },
    {
      type: 'expense',
      amount: 65000,
      date: `${year}-${mStr}-15`,
      time: '09:30',
      categoryId: 'cat-housing',
      paymentMethodId: 'pay-shinhan',
      title: 'KT 이동통신 요금',
      memo: '5G 데이터 무제한',
      tags: ['고정지출', '통신비']
    },
    {
      type: 'expense',
      amount: 80000,
      date: `${year}-${mStr}-01`,
      time: '19:00',
      categoryId: 'cat-health',
      paymentMethodId: 'pay-kb',
      title: '동네 피트니스 헬스장',
      memo: '1개월 정기 회원권',
      tags: ['운동', '건강']
    },
    {
      type: 'expense',
      amount: 6500,
      date: `${year}-${mStr}-16`,
      time: '13:20',
      categoryId: 'cat-cafe',
      paymentMethodId: 'pay-shinhan',
      title: '스타벅스 역삼역점',
      memo: '아이스 바닐라라떼',
      tags: ['카페', '커피']
    },
    {
      type: 'expense',
      amount: 11000,
      date: `${year}-${mStr}-16`,
      time: '12:10',
      categoryId: 'cat-food',
      paymentMethodId: 'pay-kb',
      title: '담소소사골순대육개장',
      memo: '점심 식사',
      tags: ['점심', '직장']
    },
    {
      type: 'expense',
      amount: 27500,
      date: `${year}-${mStr}-17`,
      time: '20:15',
      categoryId: 'cat-food',
      paymentMethodId: 'pay-kakaopay',
      title: '배달의민족 (교촌치킨)',
      memo: '허니콤보 반반세트',
      tags: ['야식', '배달']
    },
    {
      type: 'expense',
      amount: 14800,
      date: `${year}-${mStr}-17`,
      time: '23:45',
      categoryId: 'cat-transport',
      paymentMethodId: 'pay-kakaopay',
      title: '카카오T 택시',
      memo: '야근 후 귀가',
      tags: ['교통', '택시']
    },
    {
      type: 'expense',
      amount: 4500,
      date: `${year}-${mStr}-18`,
      time: '08:45',
      categoryId: 'cat-cafe',
      paymentMethodId: 'pay-shinhan',
      title: '메가MGC커피',
      memo: '아이스 아메리카노 테이크아웃',
      tags: ['모닝커피']
    },
    {
      type: 'expense',
      amount: 68400,
      date: `${year}-${mStr}-19`,
      time: '16:30',
      categoryId: 'cat-mart',
      paymentMethodId: 'pay-samsung',
      title: '이마트 역삼점',
      memo: '주말 식료품 장보기 (계란, 우유, 고기, 과일)',
      tags: ['장보기', '식재료']
    },
    {
      type: 'expense',
      amount: 32000,
      date: `${year}-${mStr}-20`,
      time: '14:20',
      categoryId: 'cat-beauty',
      paymentMethodId: 'pay-naverpay',
      title: '올리브영 명동본점',
      memo: '선크림, 폼클렌징 구매',
      tags: ['뷰티', '생필품']
    },
    {
      type: 'expense',
      amount: 12500,
      date: `${year}-${mStr}-20`,
      time: '19:40',
      categoryId: 'cat-food',
      paymentMethodId: 'pay-kb',
      title: '홍콩반점0410',
      memo: '짜장면 + 탕수육 소',
      tags: ['저녁']
    },
    {
      type: 'expense',
      amount: 4800,
      date: `${year}-${mStr}-21`,
      time: '08:50',
      categoryId: 'cat-mart',
      paymentMethodId: 'pay-shinhan',
      title: 'GS25 편의점',
      memo: '삼각김밥 & 생수',
      tags: ['간식']
    },
    {
      type: 'expense',
      amount: 35000,
      date: `${year}-${mStr}-21`,
      time: '18:15',
      categoryId: 'cat-culture',
      paymentMethodId: 'pay-hyundai',
      title: 'CGV 강남 (아이맥스 영화)',
      memo: '주말 영화 예매 2인',
      tags: ['문화', '데이트']
    },
    {
      type: 'expense',
      amount: 55000,
      date: `${year}-${mStr}-22`,
      time: '09:40',
      categoryId: 'cat-transport',
      paymentMethodId: 'pay-shinhan',
      title: 'GS칼텍스 삼일주유소',
      memo: '휘발유 주유 32L',
      tags: ['주유', '차량']
    },
    {
      type: 'expense',
      amount: 9500,
      date: `${year}-${mStr}-22`,
      time: '12:30',
      categoryId: 'cat-food',
      paymentMethodId: 'pay-kb',
      title: '북촌손만두',
      memo: '만두칼국수',
      tags: ['점심']
    },

    // Previous Month Sample Highlights
    {
      type: 'income',
      amount: 3500000,
      date: `${prevYear}-${pmStr}-10`,
      time: '09:00',
      categoryId: 'cat-salary',
      paymentMethodId: 'pay-kakao-bank',
      title: '9월 정기 급여',
      memo: '정기 급여 입금',
      tags: ['월급']
    },
    {
      type: 'expense',
      amount: 620000,
      date: `${prevYear}-${pmStr}-15`,
      time: '14:00',
      categoryId: 'cat-shopping',
      paymentMethodId: 'pay-hyundai',
      title: '쿠팡 가전제품 (로봇청소기)',
      memo: '특가 할인 구매',
      tags: ['쇼핑', '가전']
    },
    {
      type: 'expense',
      amount: 250000,
      date: `${prevYear}-${pmStr}-20`,
      time: '18:00',
      categoryId: 'cat-food',
      paymentMethodId: 'pay-shinhan',
      title: '팀 회식 1차',
      memo: '법인 정산 예정',
      tags: ['회식']
    }
  ];

  return items.map((item, idx) => ({
    ...item,
    id: `tx-init-${idx + 1}`,
    createdAt: Date.now() - (items.length - idx) * 3600000
  }));
}
