import { useState } from 'react';
import { X } from 'lucide-react';
import { AssetCategory, type CreateAssetInput, type Asset } from '../types';

const CATEGORIES: { value: AssetCategory; label: string }[] = [
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl border p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{asset ? '编辑资产' : '新增资产'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">名称</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">类别</label>
            <select value={category} onChange={e => setCategory(e.target.value as AssetCategory)} className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">数量/份额</label>
              <input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">单价</label>
              <input type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">备注</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
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
