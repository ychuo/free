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
      interestRate: parseFloat(interestRate) / 100, monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl border p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{liability ? '编辑负债' : '新增负债'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">名称</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">类型</label>
            <select value={type} onChange={e => setType(e.target.value as LiabilityType)} className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm">
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">总负债额</label>
              <input type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">剩余本金</label>
              <input type="number" step="0.01" value={remaining} onChange={e => setRemaining(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">年利率 (%)</label>
              <input type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">月供</label>
              <input type="number" step="0.01" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border text-sm hover:bg-secondary">取消</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}
