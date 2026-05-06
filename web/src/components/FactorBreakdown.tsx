import { cn } from '../lib/utils';
import type { FactorBreakdown as FactorBreakdownType } from '../types';

interface Props {
  factors: FactorBreakdownType[];
  totalScore: number;
}

export default function FactorBreakdown({ factors, totalScore }: Props) {
  const maxContrib = Math.max(...factors.map((f) => f.contribution), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-stone">
        <span>因子</span>
        <span>贡献度</span>
      </div>
      {factors.map((f) => (
        <div key={f.name} className="flex items-center gap-2">
          <span className="text-[12px] text-deep w-20 shrink-0">{f.label}</span>
          <div className="flex-1 h-2 rounded-full bg-sand/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand/60 transition-all"
              style={{ width: `${(f.contribution / maxContrib) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-stone w-10 text-right tabular-nums">
            {f.contribution.toFixed(1)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1 border-t border-sand/30">
        <span className="text-[12px] font-medium text-deep">总分</span>
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            totalScore > 70 ? 'text-emerald-600' : totalScore > 50 ? 'text-amber-600' : 'text-stone',
          )}
        >
          {totalScore}
        </span>
      </div>
    </div>
  );
}
