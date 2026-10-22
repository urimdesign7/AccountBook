import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Plus, 
  LayoutDashboard, 
  ReceiptText, 
  PieChart, 
  Target, 
  Wallet,
  Download,
  RotateCcw
} from 'lucide-react';
import { ViewTab } from '../types/ledger';

interface NavbarProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenSmsParser: () => void;
  onOpenNewTransaction: () => void;
  onOpenExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onMonthChange,
  activeTab,
  onTabChange,
  onOpenSmsParser,
  onOpenNewTransaction,
  onOpenExportModal,
}) => {
  const [year, month] = currentMonth.split('-').map(Number);

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onMonthChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  };

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: '내역 목록', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'calendar', label: '달력', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'analytics', label: '통계 분석', icon: <PieChart className="w-4 h-4" /> },
    { id: 'budget', label: '예산·고정비', icon: <Target className="w-4 h-4" /> },
    { id: 'assets', label: '자산 현황', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3.5 border-b border-slate-100">
          {/* Logo & Month Navigation */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight block">
                  스마트 가계부
                </span>
                <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block">
                  Smart Money Manager
                </span>
              </div>
            </div>

            {/* Month Picker */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-xs">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="이전 달"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap min-w-[100px] text-center">
                {year}년 {month}월
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="다음 달"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleCurrentMonth}
                className="ml-1 text-[11px] font-semibold px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl transition-colors border border-slate-200/50 cursor-pointer"
              >
                이번달
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick SMS Parse Button */}
            <button
              onClick={onOpenSmsParser}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>문자 자동작성</span>
            </button>

            {/* Manual New Entry Button */}
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>직접 작성</span>
            </button>

            {/* Export & Backup */}
            <button
              onClick={onOpenExportModal}
              className="p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="데이터 관리 및 엑셀 내보내기"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
