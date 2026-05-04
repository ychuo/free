import { useState } from 'react';
import { X } from 'lucide-react';
import { LiabilityType, type CreateLiabilityInput, type Liability } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';

const TYPES = [
  { value: LiabilityType.MORTGAGE, label: '房贷' },
  { value: LiabilityType.CONSUMER, label: '消费贷' },
  { value: LiabilityType.OTHER, label: '其他' },
];
const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.value, t.label]));

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
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-serif font-medium text-deep">{liability ? '编辑负债' : '新增负债'}</h3>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-sand/60 text-stone transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">名称</label>
          <Input placeholder="例：房贷" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">类别</label>
          <Select value={type} onValueChange={(v) => setType(v as LiabilityType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择类型">{TYPE_MAP[type]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">总负债额</label>
            <Input type="number" placeholder="0" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">剩余本金</label>
            <Input type="number" placeholder="0" step="0.01" value={remaining} onChange={e => setRemaining(e.target.value)} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">年利率 (%)</label>
            <Input type="number" placeholder="4.00" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">月供</label>
            <Input type="number" placeholder="0" step="0.01" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1.5">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>取消</Button>
          <Button type="submit" size="sm">保存</Button>
        </div>
      </form>
    </div>
  );
}
