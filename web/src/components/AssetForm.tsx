import { X } from 'lucide-react';
import { useState } from 'react';
import { type Asset, AssetCategory, type CreateAssetInput } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const CATEGORIES = [
  { value: AssetCategory.CASH, label: '现金' },
  { value: AssetCategory.FIXED_INCOME, label: '固收' },
  { value: AssetCategory.EQUITY, label: '权益' },
  { value: AssetCategory.REAL_ESTATE, label: '不动产' },
  { value: AssetCategory.CRYPTO, label: '数字货币' },
  { value: AssetCategory.PRECIOUS, label: '贵金属' },
  { value: AssetCategory.OTHER, label: '其他' },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

const SUB_TYPES: Record<AssetCategory, string[]> = {
  [AssetCategory.CASH]: ['活期存款', '定期存款', '货币基金'],
  [AssetCategory.FIXED_INCOME]: ['国债', '企业债', '债券基金', '银行理财'],
  [AssetCategory.EQUITY]: ['A股', '港股', '美股', '股票基金', '指数基金', '私募基金'],
  [AssetCategory.REAL_ESTATE]: ['住宅', '商铺', '写字楼', '车位'],
  [AssetCategory.CRYPTO]: ['BTC/ETH', '稳定币', '其他币种'],
  [AssetCategory.PRECIOUS]: ['黄金', '白银'],
  [AssetCategory.OTHER]: [],
};

interface Props {
  asset?: Asset;
  onSave: (data: CreateAssetInput) => void;
  onClose: () => void;
}

export default function AssetForm({ asset, onSave, onClose }: Props) {
  const [name, setName] = useState(asset?.name || '');
  const [category, setCategory] = useState<AssetCategory>(asset?.category || AssetCategory.CASH);
  const [subType, setSubType] = useState(asset?.subType || '');
  const [quantity, setQuantity] = useState(String(asset?.quantity || ''));
  const [unitPrice, setUnitPrice] = useState(String(asset?.unitPrice || ''));
  const [passiveIncome, setPassiveIncome] = useState(String(asset?.passiveIncome || ''));
  const [yieldRate, setYieldRate] = useState('');
  const [notes, setNotes] = useState(asset?.notes || '');

  const totalValue = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);

  const handleYieldRateChange = (rate: string) => {
    setYieldRate(rate);
    const r = parseFloat(rate);
    if (r >= 0 && r <= 100) {
      setPassiveIncome(((totalValue * r) / 100).toFixed(2));
    } else {
      setYieldRate('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      category,
      subType: subType || undefined,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      currency: 'CNY',
      passiveIncome: passiveIncome ? parseFloat(passiveIncome) : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-serif font-medium text-deep">
          {asset ? '编辑资产' : '新增资产'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-sand/60 text-stone transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">名称</label>
          <Input
            placeholder="例：沪深300ETF"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">类别</label>
          <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择类别">{CAT_MAP[category]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {SUB_TYPES[category].length > 0 && (
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">子类型</label>
            <Select value={subType} onValueChange={(v) => setSubType(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择子类型">{subType || '不限'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">不限</SelectItem>
                {SUB_TYPES[category].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">数量/份额</label>
            <Input
              type="number"
              placeholder="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1 text-stone">单价</label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">年被动收入</label>
          <Input
            type="number"
            placeholder="0.00"
            step="0.01"
            value={passiveIncome}
            onChange={(e) => {
              setPassiveIncome(e.target.value);
              setYieldRate('');
            }}
          />
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="number"
              placeholder="年化率"
              step="0.01"
              min="0"
              max="100"
              value={yieldRate}
              onChange={(e) => handleYieldRateChange(e.target.value)}
              className="w-16 h-6 rounded border border-sand/80 bg-white px-1.5 text-[11px] text-stone placeholder:text-stone/40 focus:outline-none focus:border-sepia/50"
            />
            <span className="text-[11px] text-stone/60">%</span>
            {yieldRate && totalValue > 0 && (
              <span className="text-[11px] text-stone/60">
                → ¥{((totalValue * parseFloat(yieldRate)) / 100 || 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1 text-stone">备注</label>
          <Input placeholder="可选备注" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-1.5">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" size="sm">
            保存
          </Button>
        </div>
      </form>
    </div>
  );
}
