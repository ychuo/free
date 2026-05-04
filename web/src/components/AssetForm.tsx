import { useState } from 'react';
import { X } from 'lucide-react';
import { AssetCategory, type CreateAssetInput, type Asset } from '../types';

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
    <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg font-medium">{asset ? '编辑资产' : '新增资产'}</h3>
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
          <label className="block text-sm font-medium mb-1.5 text-fg-dim">类别</label>
          <select value={category} onChange={e => setCategory(e.target.value as AssetCategory)}
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-fg-dim">数量/份额</label>
            <input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-fg-dim">单价</label>
            <input type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-fg-dim">备注</label>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
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
