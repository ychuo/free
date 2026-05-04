import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Asset, CreateAssetInput } from '../types';
import AssetForm from './AssetForm';

const CATEGORY_LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产', crypto: '数字货币', precious: '贵金属', other: '其他',
};

interface Props {
  assets: Asset[];
  onCreate: (input: CreateAssetInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<CreateAssetInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AssetList({ assets, onCreate, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);

  const grouped: Record<string, Asset[]> = {};
  for (const a of assets) { (grouped[a.category] ||= []).push(a); }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">资产明细</h3>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm">
          <Plus className="h-3.5 w-3.5" /> 新增
        </button>
      </div>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">{CATEGORY_LABELS[cat] || cat}</h4>
          <div className="space-y-2">
            {items.map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.quantity} × {a.unitPrice.toLocaleString()} = {(a.totalValue / 1e4).toFixed(2)} 万</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold">{a.totalValue.toLocaleString()}</span>
                  <button onClick={() => { setEditing(a); setShowForm(true); }} className="p-1 hover:bg-secondary rounded"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { if (confirm('确定删除？')) onDelete(a.id); }} className="p-1 hover:bg-secondary rounded text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {showForm && (
        <AssetForm
          asset={editing || undefined}
          onSave={async (data) => {
            if (editing) await onUpdate(editing.id, data);
            else await onCreate(data);
            setShowForm(false); setEditing(null);
          }}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
