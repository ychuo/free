import { ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import type { AllocationAnalysis } from '../types';
import { cn } from '../lib/utils';

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
      <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-1">
        <h3 className="text-sm font-serif font-medium text-deep mb-3">再平衡建议</h3>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-[#2d6a4f] mb-2" />
          <p className="text-[12px] font-medium text-deep">配置合理</p>
          <p className="text-[11px] text-stone mt-0.5">各资产偏离度均在 1% 以内</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-1">
      <h3 className="text-sm font-serif font-medium text-deep mb-3">再平衡建议</h3>
      <div className="space-y-1.5">
        {items.map((a) => {
          const severe = Math.abs(a.deviation) > 10;
          return (
            <div
              key={a.category}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-md border transition-colors',
                severe ? 'border-[#b91c1c]/20 bg-red-50/30' : 'border-sand/60 bg-parchment/50'
              )}
            >
              <div className="flex items-center gap-2">
                {a.deviation > 0 ? (
                  <ArrowUpRight className={cn('h-3.5 w-3.5', severe ? 'text-[#b91c1c]' : 'text-[#b08d4b]')} />
                ) : (
                  <ArrowDownRight className={cn('h-3.5 w-3.5', severe ? 'text-[#b91c1c]' : 'text-[#2d6a4f]')} />
                )}
                <span className="text-[12px] font-medium text-deep">{LABELS[a.category] || a.category}</span>
              </div>
              <div className="text-right">
                <p className={cn('text-[12px] font-medium', a.deviation > 0 ? 'text-[#b91c1c]' : 'text-[#2d6a4f]')}>
                  {a.deviation > 0 ? '超配' : '欠配'} {Math.abs(a.deviation).toFixed(1)}%
                </p>
                <p className="text-[10px] text-stone mt-0.5">
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
