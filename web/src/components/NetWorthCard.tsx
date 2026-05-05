import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import type { NetWorthSummary } from '../types';

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`;
  return `${(n / 1e4).toFixed(2)} 万`;
}

const cards = [
  { key: 'assets', label: '总资产', color: 'text-chart-1' },
  { key: 'liabilities', label: '总负债', color: 'text-destructive' },
  { key: 'netWorth', label: '净资产', color: 'text-brand' },
] as const;

export default function NetWorthCard({ summary }: { summary: NetWorthSummary | null }) {
  if (!summary) return null;

  const values = {
    assets: summary.totalAssets,
    liabilities: summary.totalLiabilities,
    netWorth: summary.netWorth,
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ key, label, color }, i) => (
          <div
            key={key}
            className={cn(
              'rounded-lg border border-sand bg-ivory px-4 py-3 animate-fade-up',
              `stagger-${i + 1}`,
            )}
          >
            <p className="text-xs text-stone mb-1">{label}</p>
            <p className={cn('text-xl font-serif font-medium tracking-tight', color)}>
              {fmt(values[key])}
            </p>
          </div>
        ))}
      </div>
      {summary.previousNetWorth != null && summary.previousNetWorth > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-stone animate-fade-up stagger-4">
          {summary.change != null && summary.change >= 0 ? (
            <TrendingUp className="h-3 w-3 text-chart-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span>较上次快照</span>
          <span
            className={cn(
              'font-medium',
              summary.change != null && summary.change >= 0 ? 'text-chart-1' : 'text-destructive',
            )}
          >
            {summary.changePercent != null
              ? `${summary.changePercent >= 0 ? '+' : ''}${summary.changePercent.toFixed(2)}%`
              : '—'}
          </span>
        </div>
      )}
    </div>
  );
}
