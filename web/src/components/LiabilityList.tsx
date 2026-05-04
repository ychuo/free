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
    <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up stagger-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-medium">负债明细</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-accent-dim text-accent hover:brightness-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> 新增
        </button>
      </div>

      {liabilities.length === 0 ? (
        <p className="text-center text-fg-dim text-sm py-8">暂无负债</p>
      ) : (
        <div className="space-y-1.5">
          {liabilities.map((l) => (
            <div
              key={l.id}
              className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-alt hover:shadow-hover transition-all duration-200"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{l.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-negative/10 text-negative font-medium">
                    {TYPE_LABELS[l.type] || l.type}
                  </span>
                </div>
                <p className="text-xs text-fg-dim mt-0.5">
                  {l.interestRate != null ? `利率 ${(l.interestRate * 100).toFixed(2)}%` : ''}
                  {l.monthlyPayment != null ? ` · 月供 ${l.monthlyPayment.toLocaleString()}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="text-right">
                  <span className="text-sm font-semibold num text-negative">{l.remaining.toLocaleString()}</span>
                  <p className="text-xs text-fg-dim">剩余 / {l.totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditing(l); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-surface text-fg-dim hover:text-fg transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`确定删除「${l.name}」？`)) onDelete(l.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-fg-dim hover:text-negative transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
