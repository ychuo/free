import { useState } from 'react';
import { useAllocation } from '../hooks/useAllocation';
import { useNetWorth } from '../hooks/useNetWorth';
import AllocationCompare from '../components/AllocationCompare';
import RebalanceList from '../components/RebalanceList';
import AllocationHistory from '../components/AllocationHistory';
import Modal from '../components/Modal';
import { AssetCategory } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">配置</h1>
          <p className="text-[12px] text-stone mt-0.5">资产配置分析与再平衡</p>
        </div>
        <Button variant="outline" size="sm" onClick={startEdit}>目标配置</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AllocationCompare analysis={analysis} />
        <RebalanceList analysis={analysis} />
      </div>

      <AllocationHistory snapshots={snapshots} />

      <Modal open={editing} onClose={() => setEditing(false)}>
        <div className="w-full max-w-sm rounded-lg border border-sand bg-ivory p-5">
          <h3 className="text-sm font-serif font-medium text-deep mb-4">设定目标配置比例</h3>
          <form onSubmit={handleSubmit} className="space-y-2">
            {ALL_CATEGORIES.map(cat => (
              <div key={cat} className="flex items-center gap-2.5">
                <label className="text-[12px] font-medium w-18 text-stone">{LABELS[cat] || cat}</label>
                <Input type="number" min="0" max="100" step="0.5"
                  value={ratios[cat] ?? 0}
                  onChange={e => setRatios({ ...ratios, [cat]: parseFloat(e.target.value) || 0 })}
                  className="flex-1" />
                <span className="text-[11px] text-stone w-6 text-right">%</span>
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)}>取消</Button>
              <Button type="submit" size="sm">保存</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
