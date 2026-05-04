import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Liability, CreateLiabilityInput } from '../types';
import LiabilityForm from './LiabilityForm';

const TYPE_LABELS: Record<string, string> = { mortgage: '房贷', consumer: '消费贷', other: '其他' };

interface Props {
  liabilities: Liability[];
  onCreate: (input: CreateLiabilityInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<CreateLiabilityInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function LiabilityList({ liabilities, onCreate, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Liability | null>(null);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">负债明细</h3>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm">
          <Plus className="h-3.5 w-3.5" /> 新增
        </button>
      </div>
      {liabilities.length === 0 ? (
        <p className="text-center text-muted-foreground py-4 text-sm">暂无负债</p>
      ) : (
        <div className="space-y-2">
          {liabilities.map(l => (
            <div key={l.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{l.name}</p>
                <p className="text-xs text-muted-foreground">{TYPE_LABELS[l.type] || l.type} · 剩余 {l.remaining.toLocaleString()} / {l.totalAmount.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-red-500">{l.remaining.toLocaleString()}</span>
                <button onClick={() => { setEditing(l); setShowForm(true); }} className="p-1 hover:bg-secondary rounded"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (confirm('确定删除？')) onDelete(l.id); }} className="p-1 hover:bg-secondary rounded text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <LiabilityForm
          liability={editing || undefined}
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
