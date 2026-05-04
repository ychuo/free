import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useAllocation } from '../hooks/useAllocation';
import { useNetWorth } from '../hooks/useNetWorth';
import AllocationCompare from '../components/AllocationCompare';
import RebalanceList from '../components/RebalanceList';
import AllocationHistory from '../components/AllocationHistory';
import { AssetCategory } from '../types';

const ALL_CATEGORIES = [AssetCategory.CASH, AssetCategory.FIXED_INCOME, AssetCategory.EQUITY, AssetCategory.REAL_ESTATE, AssetCategory.CRYPTO, AssetCategory.PRECIOUS, AssetCategory.OTHER];
const LABELS: Record<string, string> = { cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产', crypto: '数字货币', precious: '贵金属', other: '其他' };

export default function AllocationAnalysis() {
  const { targets, analysis, updateTargets } = useAllocation();
  const { snapshots } = useNetWorth();
  const [editing, setEditing] = useState(false);
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const startEdit = () => {
    const r: Record<string, number> = {};
    for (const t of targets) r[t.category] = t.targetRatio;
    setRatios(r); setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTargets(Object.entries(ratios).map(([category, targetRatio]) => ({ category: category as AssetCategory, targetRatio })));
    setEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-serif text-2xl font-medium italic">配置</h1>
          <p className="text-sm text-fg-dim mt-1">资产配置分析与再平衡</p>
        </div>
        <button
          onClick={startEdit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-line bg-surface hover:shadow-hover transition-all"
        >
          <Settings2 className="h-4 w-4" />
          目标配置
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationCompare analysis={analysis} />
        <RebalanceList analysis={analysis} />
      </div>

      <AllocationHistory snapshots={snapshots} />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditing(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
            <h3 className="font-serif text-lg font-medium mb-5">设定目标配置比例</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {ALL_CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center gap-3">
                  <label className="text-sm font-medium w-20 text-fg-dim">{LABELS[cat] || cat}</label>
                  <input type="number" min="0" max="100" step="0.5"
                    value={ratios[cat] ?? 0}
                    onChange={e => setRatios({ ...ratios, [cat]: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-3 py-2 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                  <span className="text-sm text-fg-dim w-8 text-right">%</span>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(false)}
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
        </div>
      )}
    </div>
  );
}
