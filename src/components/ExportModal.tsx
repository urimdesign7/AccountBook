import React, { useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle,
  Database,
  Check
} from 'lucide-react';
import { Transaction, Category, PaymentMethod, BudgetGoal, RecurringItem, AccountAsset } from '../types/ledger';
import { exportToCSV, downloadFile } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  budgetGoal: BudgetGoal;
  recurringItems: RecurringItem[];
  accounts: AccountAsset[];
  onImportBackup: (data: {
    transactions: Transaction[];
    budgetGoal: BudgetGoal;
    recurringItems: RecurringItem[];
    accounts: AccountAsset[];
  }) => void;
  onResetToSample: () => void;
  onClearAll: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  paymentMethods,
  budgetGoal,
  recurringItems,
  accounts,
  onImportBackup,
  onResetToSample,
  onClearAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const csvContent = exportToCSV(transactions, categories, paymentMethods);
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(csvContent, `가계부_내역_${today}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      budgetGoal,
      recurringItems,
      accounts
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(jsonStr, `가계부_백업_${today}.json`, 'application/json');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.transactions)) {
          onImportBackup({
            transactions: parsed.transactions,
            budgetGoal: parsed.budgetGoal || budgetGoal,
            recurringItems: parsed.recurringItems || recurringItems,
            accounts: parsed.accounts || accounts
          });
          alert('가계부 백업 데이터가 성공적으로 복원되었습니다.');
          onClose();
        } else {
          alert('유효하지 않은 가계부 백업 파일 형식입니다.');
        }
      } catch (err) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">데이터 관리 & 백업/내보내기</h3>
              <p className="text-xs text-slate-400">엑셀 다운로드 및 데이터 보관</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* CSV Download */}
          <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">엑셀 (CSV) 파일로 내보내기</h4>
                <p className="text-[11px] text-slate-400">모든 거래 내역을 엑셀 호환 CSV로 다운로드</p>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              다운로드
            </button>
          </div>

          {/* JSON Backup Download */}
          <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">전체 데이터 백업 (JSON)</h4>
                <p className="text-[11px] text-slate-400">내역, 예산, 고정비, 계좌 전체를 파일로 저장</p>
              </div>
            </div>
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              백업 파일
            </button>
          </div>

          {/* JSON Backup Restore */}
          <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">백업 파일 불러오기 (복원)</h4>
                <p className="text-[11px] text-slate-400">저장해 둔 JSON 백업 파일을 불러옵니다</p>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              파일 선택
            </button>
          </div>
        </div>

        {/* Reset / Clean Slate */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('샘플 데이터로 다시 채우시겠습니까? 현재 변경사항은 덮어쓰여집니다.')) {
                onResetToSample();
                onClose();
              }
            }}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            샘플 데이터 다시 로드
          </button>

          <button
            onClick={() => {
              if (confirm('정말로 모든 가계부 내역을 초기화(삭제)하시겠습니까?')) {
                onClearAll();
                onClose();
              }
            }}
            className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            전체 비우기
          </button>
        </div>
      </div>
    </div>
  );
};
