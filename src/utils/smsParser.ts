import { Category, PaymentMethod, TransactionType } from '../types/ledger';

export interface ParsedTransactionResult {
  type: TransactionType;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  categoryId?: string;
  paymentMethodId?: string;
  memo?: string;
  rawText: string;
  confidence: number;
  matchedCategoryName?: string;
  matchedPaymentName?: string;
}

// Category keyword mappings
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'cat-cafe': [
    '스타벅스', '스벅', '투썸', '이디야', '메가커피', '빽다방', '컴포즈', '폴바셋', 
    '커피', '카페', '디저트', '베이커리', '빵집', '파리바게뜨', '뚜레쥬르', 
    '베이글', '도넛', '마카롱', '아이스크림', '배스킨라빈스', '공차', '설빙'
  ],
  'cat-food': [
    '식당', '순대국', '국밥', '찌개', '덮밥', '밥', '분식', '돈까스', '고기', 
    '삼겹살', '치킨', '피자', '햄버거', '맥도날드', '버거킹', '롯데리아', '맘스터치', 
    '배달의민족', '배민', '요기요', '쿠팡이츠', '식비', '점심', '저녁', '아침', '야식', 
    '회식', '맛집', '초밥', '스시', '중국집', '짜장', '짬뽕', '라면', '김밥', 
    '떡볶이', '우동', '마라탕', '쌀국수', '샤브', '뷔페', '구내식당', '식음료'
  ],
  'cat-transport': [
    '택시', '카카오T', '카카오택시', '티머니', '캐시비', '코레일', 'KTX', 'SRT', 
    '지하철', '버스', '주유', 'GS칼텍스', 'SK에너지', 'S-OIL', '현대오일뱅크', 
    '알뜰주유소', '세차', '톨게이트', '한국도로공사', '하이패스', '대리운전', 
    '주차', '주차장', '파킹', '쏘카', '그린카', '따릉이', '킥보드', '항공'
  ],
  'cat-mart': [
    'GS25', 'CU', '세븐일레븐', '이마트24', '미니스톱', '편의점', 
    '이마트', '홈플러스', '롯데마트', '트레이더스', '코스트코', '하나로마트', 
    '다이소', '슈퍼', '마트', '식자재', '마켓컬리', '오아시스마켓', '노브랜드'
  ],
  'cat-shopping': [
    '쿠팡', '무신사', '지그재그', '에이블리', '네이버쇼핑', '11번가', 'G마켓', 
    '옥션', '인터파크', '백화점', '신세계', '현대백화점', '롯데백화점', '아울렛', 
    '옷', '의류', '신발', '나이키', '아디다스', '자라', '유니클로', '스파오', 
    '에이비씨마트', '쇼핑'
  ],
  'cat-health': [
    '병원', '의원', '치과', '안과', '피부과', '정형외과', '이비인후과', '내과', 
    '외과', '한의원', '약국', '처방', '영양제', '비타민', '헬스', '피트니스', 
    '필라테스', '요가', 'PT', '검진', '의료'
  ],
  'cat-housing': [
    '월세', '관리비', '한국전력', '전기요금', '도시가스', '가스요금', '수도세', 
    'KT', 'SKT', 'LGU+', 'LG유플러스', '알뜰폰', '통신비', '인터넷', 'SK브로드밴드'
  ],
  'cat-culture': [
    '넷플릭스', '유튜브', '왓챠', '티빙', '웨이브', '디즈니', 'CGV', '롯데시네마', 
    '메가박스', '영화', '서점', '교보문고', '영풍문고', '예스24', '알라딘', 
    '공연', '뮤지컬', '전시회', '스팀', '넥슨', '게임', 'PC방', '노래방', '코인노래'
  ],
  'cat-beauty': [
    '올리브영', '롭스', '랄라블라', '미용실', '헤어', '네일', '바버샵', 
    '화장품', '에스테틱', '피부관리', '속눈썹'
  ],
  'cat-education': [
    '학원', '독서실', '스터디카페', '강의', '인강', '클래스101', '패스트캠퍼스', 
    '토익', '어학원', '시험', '도서', '교재', '수강료'
  ],
  'cat-event': [
    '축의금', '조의금', '부의금', '생일', '선물', '꽃집', '화환', '경조사'
  ],
  'cat-pet': [
    '동물병원', '펫', '반려동물', '고양이', '강아지', '사료', '애견'
  ],
  'cat-finance': [
    '보험', '대출', '이자', '적금', '펀드', '증권', '투자', '수수료', '카드대금'
  ],
  // Income keywords
  'cat-salary': [
    '급여', '월급', '임금', '봉급', '본봉', '상여', '보너스', '수당', '알바비', '주급'
  ],
  'cat-side': [
    '부수입', '원고료', '자문료', '외주', '프리랜서', '수익', '정산'
  ],
  'cat-allowance': [
    '용돈', '생활비입금', '지원금', '장학금'
  ],
  'cat-interest': [
    '이자', '배당금', '수익금', '캐시백', '포인트적립'
  ],
  'cat-used': [
    '당근', '당근마켓', '중고나라', '번개장터'
  ]
};

// Payment method mappings
const PAYMENT_KEYWORDS: Record<string, string[]> = {
  'pay-shinhan': ['신한', '신한카드', '신한체크', '신한신용', '신한은행'],
  'pay-kb': ['KB', '국민', 'KB국민', '국민카드', '국민체크', 'KB국민은행'],
  'pay-hyundai': ['현대', '현대카드', '현대M', '현대ZERO'],
  'pay-samsung': ['삼성', '삼성카드', '삼성체크'],
  'pay-kakao-bank': ['카카오뱅크', '카뱅', '카카오뱅크체크'],
  'pay-toss': ['토스', '토스뱅크', '토스페이'],
  'pay-kakaopay': ['카카오페이', '카페'],
  'pay-naverpay': ['네이버페이', '네페'],
  'pay-cash': ['현금', '현금영수증']
};

/**
 * Intelligent parser for SMS, Kakao messages, receipt text, and quick notes
 */
export function parseSmsOrText(
  text: string,
  categories: Category[],
  paymentMethods: PaymentMethod[]
): ParsedTransactionResult {
  const clean = text.trim();
  const now = new Date();
  const currentYear = now.getFullYear();
  let defaultDate = now.toISOString().slice(0, 10);
  let defaultTime = now.toTimeString().slice(0, 5);

  let type: TransactionType = 'expense';
  let amount = 0;
  let title = '';
  let paymentMethodId: string | undefined;
  let categoryId: string | undefined;
  let confidence = 0.5;

  // 1. Detect Income vs Expense
  const incomeKeywords = ['입금', '급여', '월급', '환급', '보너스', '상여', '캐시백', '수입', '이자입금'];
  const cancelKeywords = ['취소', '승인취소'];
  
  if (incomeKeywords.some(kw => clean.includes(kw))) {
    type = 'income';
  }

  // 2. Extract Amount
  // Matches "6,500원", "6500원", "6,500 원", "₩6,500", "금액 6,500", "45,000"
  // Look for amount followed by '원' first
  const wonMatch = clean.match(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,9})\s*원/i);
  if (wonMatch) {
    amount = parseInt(wonMatch[1].replace(/,/g, ''), 10);
    confidence += 0.2;
  } else {
    // Look for standalone numbers with comma: e.g. 24,000 or 15,000
    const commaNumMatch = clean.match(/(?:금액|승인|결제|입금|출금)?\s*([0-9]{1,3}(?:,[0-9]{3})+)/);
    if (commaNumMatch) {
      amount = parseInt(commaNumMatch[1].replace(/,/g, ''), 10);
      confidence += 0.15;
    } else {
      // Look for plain 4-8 digit numbers that could be amount
      const plainNumMatch = clean.match(/\b([1-9][0-9]{3,7})\b/);
      if (plainNumMatch) {
        amount = parseInt(plainNumMatch[1], 10);
      }
    }
  }

  // 3. Extract Date & Time
  // Format: "10/22 13:20" or "10-22 13:20" or "2026.10.22" or "10월 22일"
  const dateSlashMatch = clean.match(/(\d{1,2})[\/\.-](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  const dateFullMatch = clean.match(/(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/);
  const koreanDateMatch = clean.match(/(\d{1,2})월\s*(\d{1,2})일/);

  if (dateFullMatch) {
    const y = dateFullMatch[1];
    const m = dateFullMatch[2].padStart(2, '0');
    const d = dateFullMatch[3].padStart(2, '0');
    defaultDate = `${y}-${m}-${d}`;
  } else if (dateSlashMatch) {
    const m = dateSlashMatch[1].padStart(2, '0');
    const d = dateSlashMatch[2].padStart(2, '0');
    defaultDate = `${currentYear}-${m}-${d}`;
    if (dateSlashMatch[3] && dateSlashMatch[4]) {
      defaultTime = `${dateSlashMatch[3].padStart(2, '0')}:${dateSlashMatch[4]}`;
    }
  } else if (koreanDateMatch) {
    const m = koreanDateMatch[1].padStart(2, '0');
    const d = koreanDateMatch[2].padStart(2, '0');
    defaultDate = `${currentYear}-${m}-${d}`;
  }

  // Look for separate time: 14:30
  const timeMatch = clean.match(/\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b/);
  if (timeMatch) {
    defaultTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }

  // 4. Extract Payment Method
  for (const [pmId, kws] of Object.entries(PAYMENT_KEYWORDS)) {
    if (kws.some(kw => clean.includes(kw))) {
      paymentMethodId = pmId;
      confidence += 0.15;
      break;
    }
  }
  // Default to first card if expense and none detected
  if (!paymentMethodId) {
    paymentMethodId = paymentMethods[0]?.id || 'pay-shinhan';
  }

  // 5. Extract Title / Store Name
  // Heuristics for Korean SMS formats:
  // e.g. [신한체크승인] 10/22 13:20 스타벅스코리아 6,500원 잔액 1,240,000원
  // e.g. [KB국민카드] 승인 홍*동 10/22 19:15 배달의민족 24,000원 일시불
  // e.g. [현대카드] 김*수 45,000원(일시불) 파리바게뜨 10/21 08:30
  let candidateTitle = '';

  // Remove common SMS headers like [XX카드], [신한체크승인], etc.
  let workingText = clean
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/(?:일시불|\d+개월|승인취소|승인|체크카드|신용카드|잔액\s*[\d,]+원?|누적\s*[\d,]+원?)/g, ' ')
    .replace(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\s*원/g, ' ')
    .replace(/\d{1,2}[\/\.-]\d{1,2}(?:\s+\d{1,2}:\d{2})?/g, ' ')
    .replace(/\b\d{1,2}:\d{2}\b/g, ' ')
    .replace(/[\w*]+님/g, ' ')
    .replace(/[가-힣]\*[가-힣]/g, ' ') // masked names like 홍*동
    .replace(/\s+/g, ' ')
    .trim();

  // Try to find known store / category keyword in text
  for (const [, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of kws) {
      if (clean.includes(kw)) {
        // Find the full word containing or around this keyword
        const regex = new RegExp(`[가-힣a-zA-Z0-9_-]*${kw}[가-힣a-zA-Z0-9_-]*`);
        const m = clean.match(regex);
        if (m && m[0].length >= kw.length) {
          candidateTitle = m[0];
          break;
        }
      }
    }
    if (candidateTitle) break;
  }

  if (!candidateTitle && workingText.length > 0) {
    // Pick the most plausible phrase/words
    const words = workingText.split(' ').filter(w => w.length >= 2 && !/^\d+$/.test(w));
    if (words.length > 0) {
      candidateTitle = words.slice(0, 3).join(' ');
    }
  }

  if (!candidateTitle) {
    candidateTitle = type === 'income' ? '입금 수입' : '지출 내역';
  }
  title = candidateTitle;

  // 6. Match Category based on title and rawText
  for (const [catId, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(kw => clean.includes(kw) || title.includes(kw))) {
      categoryId = catId;
      confidence += 0.2;
      break;
    }
  }

  // If still not matched, check if income
  if (!categoryId) {
    if (type === 'income') {
      categoryId = 'cat-salary';
    } else {
      categoryId = 'cat-food'; // most common expense
    }
  }

  const matchedCat = categories.find(c => c.id === categoryId);
  const matchedPay = paymentMethods.find(p => p.id === paymentMethodId);

  return {
    type,
    title,
    amount: amount || 10000,
    date: defaultDate,
    time: defaultTime,
    categoryId,
    paymentMethodId,
    rawText: text,
    confidence: Math.min(Math.round(confidence * 100), 98),
    matchedCategoryName: matchedCat?.name,
    matchedPaymentName: matchedPay?.name
  };
}

export const SAMPLE_SMS_LIST = [
  {
    label: '신한카드 스타벅스',
    badge: '카페/간식',
    text: '[신한체크승인] 10/22 13:20 스타벅스코리아 6,500원 잔액 1,240,000원'
  },
  {
    label: '국민카드 배달의민족',
    badge: '식비',
    text: '[KB국민카드] 승인 홍*동 10/22 19:15 배달의민족 26,000원 일시불'
  },
  {
    label: '현대카드 파리바게뜨',
    badge: '카페/간식',
    text: '[현대카드] 김*수 14,500원(일시불) 파리바게뜨강남 10/22 08:30'
  },
  {
    label: '카카오뱅크 급여입금',
    badge: '급여',
    text: '[카카오뱅크] 10/22 10:00 홍*동님 3,500,000원 입금 (급여)'
  },
  {
    label: '택시비 카카오페이',
    badge: '교통',
    text: '카카오T 택시 14,800원 결제 완료 (카카오페이)'
  },
  {
    label: '이마트 장보기',
    badge: '마트/장보기',
    text: '[삼성카드] 10/22 16:40 이마트역삼점 58,400원 일시불 누적 840,000원'
  },
  {
    label: '올리브영 화장품',
    badge: '뷰티/미용',
    text: '[하나카드] 승인 28,500원 올리브영명동점 10/21 17:20'
  },
  {
    label: '자연스러운 한 줄 메모',
    badge: '식비',
    text: '점심 김치찌개 9,000원 현금 식사'
  }
];
