import { useState } from 'react';
import { X } from 'lucide-react';
import { AssetCategory, type CreateAssetInput, type Asset } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';

const CATEGORIES = [
  { value: AssetCategory.CASH, label: '现金' }, { value: AssetCategory.FIXED_INCOME, label: '固收' },
  { value: AssetCategory.EQUITY, label: '权益' }, { value: AssetCategory.REAL_ESTATE, label: '不动产' },
  { value: AssetCategory.CRYPTO, label: '数字货币' }, { value: AssetCategory.PRECIOUS, label: '贵金属' },
  { value: AssetCategory.OTHER, label: '其他' },
];

interface Props { asset?: Asset; onSave: (data: CreateAssetInput) => void; onClose: () => void; }

export default function AssetForm({ asset, onSave, onClose }: Props) {
  const [name, setName] = useState(asset?.name || '');
  const [category, setCategory] = useState<AssetCategory>(asset?.category || AssetCategory.EQUITY);
  const [quantity, setQuantity] = useState(String(asset?.quantity || ''));
  const [unitPrice, setUnitPrice] = useState(String(asset?.unitPrice || ''));
  const [notes, setNotes] = useState(asset?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, category, quantity: parseFloat(quantity), unitPrice: parseFloat(unitPrice), currency: 'CNY', notes: notes || undefined });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-serif font-medium text-deep">{asset ? '编辑资产' : '新增资产'}</h3>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-sand/60 text-stone transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">名称</label>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">类别</label>
          <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">数量/份额</label>
            <Input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">单价</label>
            <Input type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">备注</label>
          <Input value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-1.5">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>取消</Button>
          <Button type="submit" size="sm">保存</Button>
        </div>
      </form>
    </div>
  );
}
