import type { Asset } from '../types';

interface Props {
  assets: Asset[];
}

export default function TrackAllocationCard({ assets }: Props) {
  const totalValue = assets.reduce((sum, a) => sum + a.totalValue, 0);

  const valueAssets = assets.filter((a) => a.track === 'value');
  const momentumAssets = assets.filter((a) => a.track === 'momentum');
  const uncAssets = assets.filter((a) => a.track === 'unclassified' || !a.track);

  const valueRatio =
    totalValue > 0 ? (valueAssets.reduce((s, a) => s + a.totalValue, 0) / totalValue) * 100 : 0;
  const momentumRatio =
    totalValue > 0 ? (momentumAssets.reduce((s, a) => s + a.totalValue, 0) / totalValue) * 100 : 0;
  const uncRatio =
    totalValue > 0 ? (uncAssets.reduce((s, a) => s + a.totalValue, 0) / totalValue) * 100 : 0;

  const targetValueRatio = 75;
  const targetMomentumRatio = 25;

  return (
    <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-2">
      <h3 className="text-sm font-serif font-medium text-deep mb-3">仓位分配</h3>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-deep">价值仓</span>
            <span className="text-[12px] text-stone">
              {valueAssets.length} 项 · {valueRatio.toFixed(1)}%
              <span className="text-[10px] text-stone/60 ml-1">(目标 {targetValueRatio}%)</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-sand/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(valueRatio, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-deep">卫星仓</span>
            <span className="text-[12px] text-stone">
              {momentumAssets.length} 项 · {momentumRatio.toFixed(1)}%
              <span className="text-[10px] text-stone/60 ml-1">(目标 {targetMomentumRatio}%)</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-sand/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${Math.min(momentumRatio, 100)}%` }}
            />
          </div>
        </div>
        {uncRatio > 5 && (
          <p className="text-[11px] text-stone/60">
            还有 {uncAssets.length} 项未分类资产 ({uncRatio.toFixed(1)}%)，建议标注轨道以便追踪。
          </p>
        )}
      </div>
    </div>
  );
}
