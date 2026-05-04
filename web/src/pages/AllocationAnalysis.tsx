import { useState } from 'react';
import { Settings } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">配置分析</h1>
        <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-secondary text-sm">
          <Settings className="h-4 w-4" /> 设定目标配置
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationCompare analysis={analysis} />
        <RebalanceList analysis={analysis} />
      </div>
      <AllocationHistory snapshots={snapshots} />
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">设定目标配置比例</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {ALL_CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center gap-3">
                  <label className="text-sm w-20">{LABELS[cat] || cat}</label>
                  <input type="number" min="0" max="100" step="0.1" value={ratios[cat] ?? 0}
                    onChange={e => setRatios({ ...ratios, [cat]: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-3 py-2 rounded-md border bg-background text-sm" />
                  <span className="text-sm text-muted-foreground w-8">%</span>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-md border text-sm hover:bg-secondary">取消</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
