import { ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import type { AllocationAnalysis } from '../types';

const LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产',
  crypto: '数字货币', precious: '贵金属', other: '其他',
};

export default function RebalanceList({ analysis }: { analysis: AllocationAnalysis[] }) {
  const items = analysis
    .filter(a => Math.abs(a.deviation) > 1)
    .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up stagger-1">
        <h3 className="font-serif text-lg font-medium mb-3">再平衡建议</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-positive mb-3" />
          <p className="text-sm font-medium">配置合理</p>
          <p className="text-xs text-fg-dim mt-1">各资产偏离度均在 1% 以内</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up stagger-1">
      <h3 className="font-serif text-lg font-medium mb-4">再平衡建议</h3>
      <div className="space-y-2">
        {items.map((a) => {
          const severe = Math.abs(a.deviation) > 10;
          return (
            <div
              key={a.category}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                severe ? 'bg-negative/5 border border-negative/20' : 'bg-surface-alt'
              }`}
            >
              <div className="flex items-center gap-3">
                {a.deviation > 0 ? (
                  <ArrowUpRight className={`h-4 w-4 ${severe ? 'text-negative' : 'text-warning'}`} />
                ) : (
                  <ArrowDownRight className={`h-4 w-4 ${severe ? 'text-negative' : 'text-positive'}`} />
                )}
                <span className="text-sm font-medium">{LABELS[a.category] || a.category}</span>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold num ${a.deviation > 0 ? 'text-negative' : 'text-positive'}`}>
                  {a.deviation > 0 ? '超配' : '欠配'} {Math.abs(a.deviation).toFixed(1)}%
                </p>
                <p className="text-xs text-fg-dim mt-0.5">
                  建议{a.rebalanceAmount > 0 ? '增持' : '减持'} {Math.abs(a.rebalanceAmount).toLocaleString()} 元
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
