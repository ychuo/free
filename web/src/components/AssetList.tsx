import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Asset, CreateAssetInput } from '../types';
import AssetForm from './AssetForm';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { Button } from './ui/button';

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
  const [deleting, setDeleting] = useState<Asset | null>(null);

  const grouped: Record<string, Asset[]> = {};
  for (const a of assets) { (grouped[a.category] ||= []).push(a); }

  return (
    <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-serif font-medium text-deep">资产明细</h3>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-3 w-3 mr-1" /> 新增
        </Button>
      </div>

      {assets.length === 0 ? (
        <p className="text-center text-stone text-[12px] py-8">尚无资产，点击新增开始记录</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h4 className="text-[11px] font-medium text-stone mb-1.5 px-0.5">
                {CATEGORY_LABELS[cat] || cat}
                <span className="ml-1.5 text-stone/60">{items.length}</span>
              </h4>
              <div className="space-y-1">
                {items.map((a) => (
                  <div
                    key={a.id}
                    className="group flex items-center justify-between px-3 py-2 rounded-md border border-sand/60 bg-parchment/50 hover:border-sand transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-deep truncate">{a.name}</p>
                      <p className="text-[11px] text-stone mt-0.5">
                        {a.quantity} × {a.unitPrice.toLocaleString()} = {(a.totalValue / 1e4).toFixed(2)} 万
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <div className="text-right">
                        <span className="text-[13px] font-medium text-deep">{a.totalValue.toLocaleString()}</span>
                        {a.passiveIncome != null && a.passiveIncome > 0 && (
                          <p className="text-[10px] text-stone">被动收入 {(a.passiveIncome / 1e4).toFixed(2)} 万/年</p>
                        )}
                      </div>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                        <button onClick={() => { setEditing(a); setShowForm(true); }}
                          className="p-0.5 rounded text-stone/50 hover:text-stone transition-colors">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => setDeleting(a)}
                          className="p-0.5 rounded text-stone/50 hover:text-destructive transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }}>
        <AssetForm
          asset={editing || undefined}
          onSave={async (data) => {
            if (editing) await onUpdate(editing.id, data);
            else await onCreate(data);
            setShowForm(false); setEditing(null);
          }}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>

      <ConfirmDialog
        open={deleting != null}
        title="确认删除"
        description={`确定要删除「${deleting?.name}」吗？此操作不可撤销。`}
        onConfirm={async () => { if (deleting) { await onDelete(deleting.id); setDeleting(null); } }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
