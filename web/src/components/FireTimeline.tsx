import type { FireProgress } from '../types';

export default function FireTimeline({ progress }: { progress: FireProgress | null }) {
  if (!progress) return null;

  const pct = progress.gap <= 0 ? 100 : Math.min(
    ((progress.fireTarget - progress.gap) / progress.fireTarget) * 100,
    99.5
  );

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up stagger-1">
      <h3 className="font-serif text-lg font-medium mb-5">净资产进度</h3>

      <div className="flex justify-between text-sm mb-3">
        <span className="text-fg-dim">当前 <span className="num font-semibold text-fg">{(progress.netWorth / 1e4).toFixed(1)} 万</span></span>
        <span className="text-fg-dim">目标 <span className="num font-semibold text-fg">{(progress.fireTarget / 1e4).toFixed(0)} 万</span></span>
      </div>

      <div className="relative h-2.5 bg-surface-alt rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-30"
          style={{
            width: `${pct}%`,
            background: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)',
          }}
        />
      </div>

      <p className="text-sm text-fg-dim mt-3">
        进度 <span className="num font-semibold text-accent">{pct.toFixed(1)}%</span>
        {progress.gap > 0 ? (
          <> · 还需 <span className="num">{(progress.gap / 1e4).toFixed(1)} 万</span></>
        ) : (
          <span className="text-positive font-medium"> · 已达成 FIRE</span>
        )}
      </p>
    </div>
  );
}
