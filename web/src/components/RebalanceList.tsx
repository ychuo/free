import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { AllocationAnalysis } from '../types';

const LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产', crypto: '数字货币', precious: '贵金属', other: '其他',
};

export default function RebalanceList({ analysis }: { analysis: AllocationAnalysis[] }) {
  const items = analysis.filter(a => Math.abs(a.deviation) > 1).sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-lg font-semibold mb-3">再平衡建议</h3>
        <p className="text-sm text-muted-foreground text-center py-4">配置合理，暂无需调整</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-lg font-semibold mb-3">再平衡建议</h3>
      <div className="space-y-2">
        {items.map(a => (
          <div key={a.category} className={`flex items-center justify-between p-3 rounded-lg border ${Math.abs(a.deviation) > 10 ? 'border-red-300 bg-red-50 dark:bg-red-950' : ''}`}>
            <div className="flex items-center gap-2">
              {a.deviation > 0 ? <ArrowUpRight className="h-4 w-4 text-red-500" /> : <ArrowDownRight className="h-4 w-4 text-green-600" />}
              <span className="text-sm font-medium">{LABELS[a.category] || a.category}</span>
            </div>
            <div className="text-right">
              <p className="text-sm">{a.deviation > 0 ? <span className="text-red-500">超配 {a.deviation.toFixed(1)}%</span> : <span className="text-green-600">欠配 {Math.abs(a.deviation).toFixed(1)}%</span>}</p>
              <p className="text-xs text-muted-foreground">建议{a.rebalanceAmount > 0 ? '增持' : '减持'} {Math.abs(a.rebalanceAmount).toLocaleString()} 元</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
