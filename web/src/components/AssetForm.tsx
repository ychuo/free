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

const inputClass = "w-full px-2.5 py-2 rounded-md border border-sand bg-ivory text-[13px] text-deep placeholder:text-stone focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand/30 transition-all";

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
    <div className="w-full max-w-sm rounded-lg border border-sand bg-ivory p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-serif font-medium text-deep">{asset ? '编辑资产' : '新增资产'}</h3>
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
          <label className="block text-[12px] font-medium mb-1 text-stone">类别</label>
          <select value={category} onChange={e => setCategory(e.target.value as AssetCategory)} className={inputClass}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">数量/份额</label>
            <input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">单价</label>
            <input type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">备注</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} />
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
