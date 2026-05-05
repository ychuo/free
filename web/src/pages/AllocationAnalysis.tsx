import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import AllocationCompare from '../components/AllocationCompare';
import AllocationHistory from '../components/AllocationHistory';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import RebalanceList from '../components/RebalanceList';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAllocation } from '../hooks/useAllocation';
import { useNetWorth } from '../hooks/useNetWorth';
import type { Snapshot } from '../types';
import { AssetCategory } from '../types';

const ALL_CATEGORIES = [
  AssetCategory.CASH,
  AssetCategory.FIXED_INCOME,
  AssetCategory.EQUITY,
  AssetCategory.REAL_ESTATE,
  AssetCategory.CRYPTO,
  AssetCategory.PRECIOUS,
  AssetCategory.OTHER,
];
const LABELS: Record<string, string> = {
  cash: '现金',
  fixed_income: '固收',
  equity: '权益',
  real_estate: '不动产',
  crypto: '数字货币',
  precious: '贵金属',
  other: '其他',
};
export default function AllocationAnalysis() {
  const { targets, analysis, updateTargets } = useAllocation();
  const { snapshots, clearSnapshots, deleteSnapshot } = useNetWorth();
  const [editing, setEditing] = useState(false);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Snapshot | null>(null);

  const startEdit = () => {
    const r: Record<string, number> = {};
    for (const t of targets) r[t.category] = t.targetRatio;
    setRatios(r);
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = Object.values(ratios).reduce((s, v) => s + v, 0);
    if (total > 100.01) {
      alert('目标比例总和不能超过 100%');
      return;
    }
    await updateTargets(
      Object.entries(ratios).map(([category, targetRatio]) => ({
        category: category as AssetCategory,
        targetRatio,
      })),
    );
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">配置</h1>
          <p className="text-[12px] text-stone mt-0.5">资产配置分析与再平衡</p>
        </div>
        <Button variant="outline" size="sm" onClick={startEdit}>
          目标配置
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AllocationCompare analysis={analysis} />
        <RebalanceList analysis={analysis} />
      </div>

      <AllocationHistory snapshots={snapshots} />

      {snapshots.length > 0 && (
        <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-serif font-medium text-deep">快照记录</h3>
            <Button variant="outline" size="sm" onClick={() => setClearConfirmOpen(true)}>
              清除快照
            </Button>
          </div>
          <div className="space-y-1">
            {snapshots.map((s) => (
              <div
                key={s.id}
                className="group flex items-center justify-between px-3 py-2 rounded-md border border-sand/60 bg-parchment/50 hover:border-sand transition-colors"
              >
                <div>
                  <span className="text-[13px] text-deep">
                    {new Date(s.snapshotDate).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="ml-3 text-[12px] text-stone">
                    净资产 {(s.netWorth / 1e4).toFixed(2)} 万
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(s)}
                  className="p-0.5 rounded text-stone/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={clearConfirmOpen}
        title="清除全部快照"
        description="确定要删除所有历史快照记录吗？此操作不可撤销。"
        confirmLabel="清除"
        onConfirm={async () => {
          await clearSnapshots();
          setClearConfirmOpen(false);
        }}
        onCancel={() => setClearConfirmOpen(false)}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        title="删除快照"
        description={`确定要删除 ${deleteTarget ? new Date(deleteTarget.snapshotDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }) : ''} 的快照记录吗？此操作不可撤销。`}
        confirmLabel="删除"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteSnapshot(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <Modal open={editing} onClose={() => setEditing(false)}>
        <div className="w-full max-w-sm rounded-lg border border-sand bg-ivory p-5">
          <h3 className="text-sm font-serif font-medium text-deep mb-4">设定目标配置比例</h3>
          <form onSubmit={handleSubmit} className="space-y-2">
            {ALL_CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-2.5">
                <label className="text-[12px] font-medium w-18 text-stone">
                  {LABELS[cat] || cat}
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={ratios[cat] ?? 0}
                  onChange={(e) => setRatios({ ...ratios, [cat]: parseFloat(e.target.value) || 0 })}
                  className="flex-1"
                />
                <span className="text-[11px] text-stone w-6 text-right">%</span>
              </div>
            ))}
            {(() => {
              const total = Object.values(ratios).reduce((s, v) => s + v, 0);
              const remaining = 100 - total;
              const over = total > 100.01;
              return (
                <div
                  className={
                    over ? 'text-destructive' : remaining < 0.5 ? 'text-chart-1' : 'text-stone'
                  }
                >
                  <p className="text-[11px] pt-1 text-right">
                    {over
                      ? `超出 ${Math.abs(remaining).toFixed(1)}%`
                      : remaining > 0.01
                        ? `剩余 ${remaining.toFixed(1)}%`
                        : '已满'}
                  </p>
                </div>
              );
            })()}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)}>
                取消
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={Object.values(ratios).reduce((s, v) => s + v, 0) > 100.01}
              >
                保存
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
