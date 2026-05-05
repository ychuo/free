import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { CreateLiabilityInput, Liability } from '../types';
import ConfirmDialog from './ConfirmDialog';
import LiabilityForm from './LiabilityForm';
import Modal from './Modal';
import { Button } from './ui/button';

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
  const [deleting, setDeleting] = useState<Liability | null>(null);

  return (
    <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-serif font-medium text-deep">负债明细</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-3 w-3 mr-1" /> 新增
        </Button>
      </div>

      {liabilities.length === 0 ? (
        <p className="text-center text-stone text-[12px] py-8">暂无负债</p>
      ) : (
        <div className="space-y-1">
          {liabilities.map((l) => (
            <div
              key={l.id}
              className="group flex items-center justify-between px-3 py-2 rounded-md border border-sand/60 bg-parchment/50 hover:border-sand transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] text-deep truncate">{l.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sand text-olive font-medium">
                    {TYPE_LABELS[l.type] || l.type}
                  </span>
                </div>
                <p className="text-[11px] text-stone mt-0.5">
                  {l.interestRate != null ? `利率 ${(l.interestRate * 100).toFixed(2)}%` : ''}
                  {l.monthlyPayment != null ? ` · 月供 ${l.monthlyPayment.toLocaleString()}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <div className="text-right">
                  <span className="text-[13px] font-medium text-[#b91c1c]">
                    {l.remaining.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-stone">剩余 / {l.totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(l);
                      setShowForm(true);
                    }}
                    className="p-0.5 rounded text-stone/50 hover:text-stone transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(l)}
                    className="p-0.5 rounded text-stone/50 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
      >
        <LiabilityForm
          liability={editing || undefined}
          onSave={async (data) => {
            if (editing) await onUpdate(editing.id, data);
            else await onCreate(data);
            setShowForm(false);
            setEditing(null);
          }}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleting != null}
        title="确认删除"
        description={`确定要删除「${deleting?.name}」吗？此操作不可撤销。`}
        onConfirm={async () => {
          if (deleting) {
            await onDelete(deleting.id);
            setDeleting(null);
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
