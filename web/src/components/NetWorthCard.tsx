import { TrendingUp, TrendingDown, Wallet, Landmark, Scale } from 'lucide-react';
import type { NetWorthSummary } from '../types';

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`;
  return `${(n / 1e4).toFixed(2)} 万`;
}

export default function NetWorthCard({ summary }: { summary: NetWorthSummary | null }) {
  if (!summary) return null;

  const cards = [
    { label: '总资产', value: summary.totalAssets, icon: Wallet, color: 'text-positive' },
    { label: '总负债', value: summary.totalLiabilities, icon: Landmark, color: 'text-negative' },
    { label: '净资产', value: summary.netWorth, icon: Scale, color: 'text-accent' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl bg-surface p-5 shadow-card hover:shadow-hover transition-shadow duration-300 animate-fade-up"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-fg-dim">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className={`text-2xl font-bold num tracking-tight ${color}`}>
              {fmt(value)}
            </p>
          </div>
        ))}
      </div>
      {summary.previousNetWorth != null && summary.previousNetWorth > 0 && (
        <div className="flex items-center gap-2 text-sm animate-fade-up stagger-4">
          {summary.change != null && summary.change >= 0 ? (
            <TrendingUp className="h-4 w-4 text-positive" />
          ) : (
            <TrendingDown className="h-4 w-4 text-negative" />
          )}
          <span className="text-fg-dim">较上次快照</span>
          <span className={`font-semibold ${summary.change != null && summary.change >= 0 ? 'text-positive' : 'text-negative'}`}>
            {summary.changePercent != null ? `${summary.changePercent >= 0 ? '+' : ''}${summary.changePercent.toFixed(2)}%` : '—'}
          </span>
        </div>
      )}
    </div>
  );
}
