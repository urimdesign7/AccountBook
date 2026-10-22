import { Transaction, Category, PaymentMethod } from '../types/ledger';

/**
 * Format number into Korean currency with comma
 * e.g. 15000 -> "15,000원" or "₩15,000"
 */
export function formatCurrency(amount: number, prefix: boolean = false): string {
  const formatted = Math.abs(amount).toLocaleString('ko-KR');
  if (prefix) {
    return `${amount < 0 ? '-' : ''}₩${formatted}`;
  }
  return `${amount < 0 ? '-' : ''}${formatted}원`;
}

/**
 * Compact Korean unit: 1500000 -> "150만원", 12500 -> "1.3만원"
 */
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 100000000) {
    const eok = (abs / 100000000).toFixed(1);
    return `${sign}${eok.endsWith('.0') ? eok.slice(0, -2) : eok}억원`;
  }
  if (abs >= 10000) {
    const man = (abs / 10000).toFixed(abs >= 100000 ? 0 : 1);
    return `${sign}${man.endsWith('.0') ? man.slice(0, -2) : man}만원`;
  }
  return `${sign}${abs.toLocaleString('ko-KR')}원`;
}

/**
 * Korean Day of Week string
 */
export function getKoreanDayOfWeek(dateStr: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date(dateStr);
  return days[d.getDay()] || '';
}

/**
 * Format date string: "2026-10-22" -> "10월 22일 (수)"
 */
export function formatKoreanDate(dateStr: string, includeYear: boolean = false): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const dow = getKoreanDayOfWeek(dateStr);
    if (includeYear) {
      return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일 (${dow})`;
    }
    return `${parseInt(month, 10)}월 ${parseInt(day, 10)}일 (${dow})`;
  } catch {
    return dateStr;
  }
}

/**
 * Generate CSV file string from transactions
 */
export function exportToCSV(
  transactions: Transaction[],
  categories: Category[],
  paymentMethods: PaymentMethod[]
): string {
  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const payMap = new Map(paymentMethods.map(p => [p.id, p.name]));

  const headers = ['날짜', '시간', '구분', '카테고리', '내용', '금액', '결제수단', '메모', '태그'];
  const rows = transactions.map(t => {
    const typeLabel = t.type === 'income' ? '수입' : t.type === 'expense' ? '지출' : '이체';
    const catName = catMap.get(t.categoryId) || '기타';
    const payName = payMap.get(t.paymentMethodId) || '기타';
    const tags = (t.tags || []).join(';');
    const memo = (t.memo || '').replace(/"/g, '""');
    const title = t.title.replace(/"/g, '""');

    return [
      t.date,
      t.time || '',
      typeLabel,
      `"${catName}"`,
      `"${title}"`,
      t.amount,
      `"${payName}"`,
      `"${memo}"`,
      `"${tags}"`
    ].join(',');
  });

  // UTF-8 BOM for Excel Korean support
  return '\uFEFF' + [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
