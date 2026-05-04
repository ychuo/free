import { useState } from 'react';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import type { Asset, CreateAssetInput } from '../types';
import AssetForm from './AssetForm';

const CATEGORY_LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产',
  crypto: '数字货币', precious: '贵金属', other: '其他',
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
    <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up stagger-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-medium">资产明细</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-accent-dim text-accent hover:brightness-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> 新增
        </button>
      </div>

      {assets.length === 0 ? (
        <p className="text-center text-fg-dim text-sm py-8">尚无资产，点击新增开始记录</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, items]) => {
            const catTotal = items.reduce((s, a) => s + a.totalValue, 0);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-dim">{CATEGORY_LABELS[cat] || cat}</h4>
                  <span className="text-xs num text-fg-dim">{((catTotal / 1e4)).toFixed(1)} 万</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((a) => (
                    <div
                      key={a.id}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-alt hover:shadow-hover transition-all duration-200"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{a.name}</p>
                        <p className="text-xs text-fg-dim mt-0.5">
                          {a.quantity.toLocaleString()} × {a.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-sm font-semibold num">{a.totalValue.toLocaleString()}</span>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditing(a); setShowForm(true); }}
                            className="p-1.5 rounded-lg hover:bg-surface text-fg-dim hover:text-fg transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`确定删除「${a.name}」？`)) onDelete(a.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-fg-dim hover:text-negative transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
