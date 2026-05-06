import type { FundFlowData } from '../types';

function flowColor(v: number): string {
  if (v > 0) return 'text-red-500';
  if (v < 0) return 'text-emerald-600';
  return 'text-stone';
}

function flowSign(v: number): string {
  return v > 0 ? '+' : '';
}

interface Props {
  data: FundFlowData | null;
  loading: boolean;
}

export default function FundFlowOverview({ data, loading }: Props) {
  return (
    <div className="rounded-lg border border-sand bg-ivory p-5">
      <h3 className="text-sm font-serif font-medium text-deep mb-3">资金流向</h3>
      {loading ? (
        <div className="h-32 animate-pulse bg-sand/20 rounded" />
      ) : !data ? (
        <p className="text-center text-stone text-[12px] py-8">暂无数据</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border border-sand/60 bg-parchment p-3">
              <p className="text-[11px] text-stone mb-0.5">北向资金（日）</p>
              <p className={`text-sm font-medium tabular-nums ${flowColor(data.northBound.daily)}`}>
                {flowSign(data.northBound.daily)}
                {data.northBound.daily.toFixed(2)} 亿
              </p>
            </div>
            <div className="rounded border border-sand/60 bg-parchment p-3">
              <p className="text-[11px] text-stone mb-0.5">北向资金（周）</p>
              <p
                className={`text-sm font-medium tabular-nums ${flowColor(data.northBound.weekly)}`}
              >
                {flowSign(data.northBound.weekly)}
                {data.northBound.weekly.toFixed(2)} 亿
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] text-stone mb-2">主力资金（全市场）</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex justify-between text-[12px]">
                <span className="text-stone">主力净流入</span>
                <span
                  className={`tabular-nums font-medium ${flowColor(data.marketFlow.mainNetInflow)}`}
                >
                  {flowSign(data.marketFlow.mainNetInflow)}
                  {data.marketFlow.mainNetInflow.toFixed(2)} 亿
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-stone">净占比</span>
                <span className="tabular-nums">
                  {flowSign(data.marketFlow.mainNetPct)}
                  {data.marketFlow.mainNetPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-stone">超大单</span>
                <span className={`tabular-nums ${flowColor(data.marketFlow.superLarge)}`}>
                  {flowSign(data.marketFlow.superLarge)}
                  {data.marketFlow.superLarge.toFixed(2)} 亿
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-stone">大单</span>
                <span className={`tabular-nums ${flowColor(data.marketFlow.large)}`}>
                  {flowSign(data.marketFlow.large)}
                  {data.marketFlow.large.toFixed(2)} 亿
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-stone">中单</span>
                <span className="tabular-nums">
                  {flowSign(data.marketFlow.medium)}
                  {data.marketFlow.medium.toFixed(2)} 亿
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-stone">小单</span>
                <span className="tabular-nums">
                  {flowSign(data.marketFlow.small)}
                  {data.marketFlow.small.toFixed(2)} 亿
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border border-sand/60 bg-parchment p-3">
              <p className="text-[11px] text-stone mb-0.5">上证指数</p>
              <p className="text-sm font-medium tabular-nums">
                {data.marketFlow.shIndex.toFixed(2)}
              </p>
              <p className={`text-[11px] ${flowColor(data.marketFlow.shChange)}`}>
                {flowSign(data.marketFlow.shChange)}
                {data.marketFlow.shChange.toFixed(2)}%
              </p>
            </div>
            <div className="rounded border border-sand/60 bg-parchment p-3">
              <p className="text-[11px] text-stone mb-0.5">深证成指</p>
              <p className="text-sm font-medium tabular-nums">
                {data.marketFlow.szIndex.toFixed(2)}
              </p>
              <p className={`text-[11px] ${flowColor(data.marketFlow.szChange)}`}>
                {flowSign(data.marketFlow.szChange)}
                {data.marketFlow.szChange.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
