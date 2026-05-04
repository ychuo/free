import { TrendingUp, TrendingDown } from 'lucide-react';
import type { NetWorthSummary } from '../types';

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`;
  if (abs >= 1e4) return `${(n / 1e4).toFixed(2)} 万`;
  return n.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });
}

export default function NetWorthCard({ summary }: { summary: NetWorthSummary | null }) {
  if (!summary) return null;
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">总资产</p>
        <p className="text-2xl font-bold text-green-600">{fmt(summary.totalAssets)}</p>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">总负债</p>
        <p className="text-2xl font-bold text-red-500">{fmt(summary.totalLiabilities)}</p>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">净资产</p>
        <p className="text-2xl font-bold text-primary">{fmt(summary.netWorth)}</p>
        {summary.change != null && summary.previousNetWorth != null && summary.previousNetWorth > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {summary.change >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
            <span className={`text-sm ${summary.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {summary.changePercent?.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
