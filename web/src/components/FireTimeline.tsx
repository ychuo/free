import type { FireProgress } from '../types';

export default function FireTimeline({ progress }: { progress: FireProgress | null }) {
  if (!progress) return null;
  const pct = progress.gap <= 0 ? 100 : Math.min(((progress.fireTarget - progress.gap) / progress.fireTarget) * 100, 99);

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">FIRE 进度</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>目标：{(progress.fireTarget / 1e4).toFixed(0)} 万</span>
          <span>当前净资产：{(progress.netWorth / 1e4).toFixed(1)} 万</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">进度 {pct.toFixed(1)}% · 还差 {(progress.gap > 0 ? progress.gap : 0).toLocaleString()} 元</p>
      </div>
    </div>
  );
}
