import { useState } from 'react';
import { X } from 'lucide-react';
import { LiabilityType, type CreateLiabilityInput, type Liability } from '../types';

const TYPES = [
  { value: LiabilityType.MORTGAGE, label: '房贷' },
  { value: LiabilityType.CONSUMER, label: '消费贷' },
  { value: LiabilityType.OTHER, label: '其他' },
];

interface Props { liability?: Liability; onSave: (data: CreateLiabilityInput) => void; onClose: () => void; }

const inputClass = "w-full px-2.5 py-2 rounded-md border border-sand bg-ivory text-[13px] text-deep placeholder:text-stone focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand/30 transition-all";

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
    <div className="w-full max-w-sm rounded-lg border border-sand bg-ivory p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-serif font-medium text-deep">{liability ? '编辑负债' : '新增负债'}</h3>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-sand/60 text-stone transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">名称</label>
          <input value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">类型</label>
          <select value={type} onChange={e => setType(e.target.value as LiabilityType)} className={inputClass}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">总负债额</label>
            <input type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">剩余本金</label>
            <input type="number" step="0.01" value={remaining} onChange={e => setRemaining(e.target.value)} required className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">年利率 (%)</label>
            <input type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">月供</label>
            <input type="number" step="0.01" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1.5">
          <button type="button" onClick={onClose}
            className="px-3 py-1.5 text-[12px] font-medium rounded-md border border-sand text-olive hover:bg-sand/50 transition-colors">
            取消
          </button>
          <button type="submit"
            className="px-4 py-1.5 text-[12px] font-medium rounded-md bg-brand text-ivory hover:bg-brand-light transition-colors">
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
