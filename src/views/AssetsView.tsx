import React, { useState } from 'react';
import { 
  Wallet, 
  Landmark, 
  CreditCard, 
  Banknote, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  TrendingUp
} from 'lucide-react';
import { AccountAsset } from '../types/ledger';
import { formatCurrency } from '../utils/formatters';

interface AssetsViewProps {
  accounts: AccountAsset[];
  onUpdateAccounts: (accounts: AccountAsset[]) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ accounts, onUpdateAccounts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<'bank' | 'card' | 'cash' | 'invest'>('bank');
  const [accountNumber, setAccountNumber] = useState('');

  const totalAssets = accounts.reduce((s, a) => s + a.balance, 0);

  const bankAssets = accounts.filter(a => a.type === 'bank').reduce((s, a) => s + a.balance, 0);
  const cashAssets = accounts.filter(a => a.type === 'cash').reduce((s, a) => s + a.balance, 0);
  const investAssets = accounts.filter(a => a.type === 'invest').reduce((s, a) => s + a.balance, 0);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setBalance('');
    setType('bank');
    setAccountNumber('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: AccountAsset) => {
    setEditingId(acc.id);
    setName(acc.name);
    setBalance(acc.balance.toString());
    setType(acc.type);
    setAccountNumber(acc.accountNumber || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const balNum = parseInt(balance.replace(/[^0-9-]/g, ''), 10) || 0;
    if (!name.trim()) return;

    if (editingId) {
      onUpdateAccounts(
        accounts.map(a => a.id === editingId ? { ...a, name, balance: balNum, type, accountNumber } : a)
      );
    } else {
      const colors = ['#3b82f6', '#facc15', '#10b981', '#ec4899', '#8b5cf6', '#64748b'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newAcc: AccountAsset = {
        id: `acc-${Date.now()}`,
        name: name.trim(),
        balance: balNum,
        type,
        color: randomColor,
        accountNumber: accountNumber.trim() || undefined
      };
      onUpdateAccounts([...accounts, newAcc]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('이 계좌/자산 항목을 삭제하시겠습니까?')) {
      onUpdateAccounts(accounts.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Total Asset Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Wallet className="w-4 h-4 text-blue-400" />
              <span>연동 자산 및 통장 총 잔액</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
              {formatCurrency(totalAssets)}
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>새 자산/계좌 추가</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 text-xs">은행 통장</span>
            <div className="text-base font-bold text-white mt-1">
              {formatCurrency(bankAssets)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 text-xs">현금 / 페이포인트</span>
            <div className="text-base font-bold text-white mt-1">
              {formatCurrency(cashAssets)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-slate-400 text-xs">투자 / 기타</span>
            <div className="text-base font-bold text-white mt-1">
              {formatCurrency(investAssets)}
            </div>
          </div>
        </div>
      </div>

      {/* Account Asset List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">등록된 계좌 및 자산 목록</h3>
          <span className="text-xs text-slate-400">총 {accounts.length}개</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-all bg-slate-50/40 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.type === 'bank' ? (
                      <Landmark className="w-5 h-5" />
                    ) : acc.type === 'card' ? (
                      <CreditCard className="w-5 h-5" />
                    ) : (
                      <Banknote className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {acc.name}
                    </h4>
                    {acc.accountNumber && (
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {acc.accountNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
                    title="수정"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">잔액</span>
                <div className="text-lg font-black text-slate-900">
                  {formatCurrency(acc.balance)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? '계좌 / 자산 수정' : '새 계좌 / 자산 등록'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">자산 / 계좌명</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 카카오뱅크 모임통장, 토스 비상금"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">자산 유형</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="bank">은행 통장</option>
                  <option value="cash">현금 / 페이 머니</option>
                  <option value="card">체크/신용카드 잔액</option>
                  <option value="invest">증권 / 투자</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">현재 잔액 (원)</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">계좌 번호 (선택)</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="3333-01-****"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {editingId ? '수정 저장' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
