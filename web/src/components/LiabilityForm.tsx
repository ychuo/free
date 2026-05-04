import { useState } from 'react';
import { X } from 'lucide-react';
import { LiabilityType, type CreateLiabilityInput, type Liability } from '../types';

const TYPES = [
  { value: LiabilityType.MORTGAGE, label: '房贷' },
  { value: LiabilityType.CONSUMER, label: '消费贷' },
  { value: LiabilityType.OTHER, label: '其他' },
];

interface Props { liability?: Liability; onSave: (data: CreateLiabilityInput) => void; onClose: () => void; }

export default function LiabilityForm({ liability, onSave, onClose }: Props) {
  const [name, setName] = useState(liability?.name || '');
  const [type, setType] = useState<LiabilityType>(liability?.type || LiabilityType.MORTGAGE);
  const [totalAmount, setTotalAmount] = useState(String(liability?.totalAmount || ''));
  const [remaining, setRemaining] = useState(String(liability?.remaining || ''));
  const [interestRate, setInterestRate] = useState(String((liability?.interestRate || 0) * 100));
  const [monthlyPayment, setMonthlyPayment] = useState(String(liability?.monthlyPayment || ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name, type, totalAmount: parseFloat(totalAmount), remaining: parseFloat(remaining),
      interestRate: parseFloat(interestRate) / 100,
      monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : undefined,
    });
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg font-medium">{liability ? '编辑负债' : '新增负债'}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-alt text-fg-dim transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-fg-dim">名称</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-fg-dim">类型</label>
          <select value={type} onChange={e => setType(e.target.value as LiabilityType)}
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all">
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-fg-dim">总负债额</label>
            <input type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-fg-dim">剩余本金</label>
            <input type="number" step="0.01" value={remaining} onChange={e => setRemaining(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-fg-dim">年利率 (%)</label>
            <input type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-fg-dim">月供</label>
            <input type="number" step="0.01" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-line hover:bg-surface-alt transition-colors">
            取消
          </button>
          <button type="submit"
            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-accent text-white hover:brightness-110 transition-all">
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
