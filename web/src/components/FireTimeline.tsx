import type { FireProgress } from '../types';

export default function FireTimeline({ progress }: { progress: FireProgress | null }) {
  if (!progress) return null;

  const pct = progress.gap <= 0 ? 100 : Math.min(
    ((progress.fireTarget - progress.gap) / progress.fireTarget) * 100,
    99.5
  );

  return (
    <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-1">
      <h3 className="text-sm font-serif font-medium text-deep mb-4">净资产进度</h3>
      <div className="flex justify-between text-[12px] mb-2.5">
        <span className="text-stone">当前 <span className="text-deep font-medium">{(progress.netWorth / 1e4).toFixed(1)} 万</span></span>
        <span className="text-stone">目标 <span className="text-deep font-medium">{(progress.fireTarget / 1e4).toFixed(0)} 万</span></span>
      </div>
      <div className="relative h-2 bg-sand rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[12px] text-stone mt-2.5">
        进度 <span className="text-brand font-medium">{pct.toFixed(1)}%</span>
        {progress.gap > 0 ? (
          <> · 还需 <span className="text-deep">{(progress.gap / 1e4).toFixed(1)} 万</span></>
        ) : (
          <span className="text-chart-1 font-medium"> · 已达成 FIRE</span>
        )}
      </p>
    </div>
  );
}
