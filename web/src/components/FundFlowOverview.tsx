import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { FundFlowData } from '../types';

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
              <p
                className={`text-sm font-medium tabular-nums ${data.northBound.daily > 0 ? 'text-red-500' : data.northBound.daily < 0 ? 'text-emerald-600' : 'text-stone'}`}
              >
                {data.northBound.daily > 0 ? '+' : ''}
                {data.northBound.daily.toFixed(2)} 亿
              </p>
            </div>
            <div className="rounded border border-sand/60 bg-parchment p-3">
              <p className="text-[11px] text-stone mb-0.5">北向资金（周）</p>
              <p
                className={`text-sm font-medium tabular-nums ${data.northBound.weekly > 0 ? 'text-red-500' : data.northBound.weekly < 0 ? 'text-emerald-600' : 'text-stone'}`}
              >
                {data.northBound.weekly > 0 ? '+' : ''}
                {data.northBound.weekly.toFixed(2)} 亿
              </p>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-stone mb-2">主力资金行业流向</p>
            <div className="space-y-1">
              {data.sectorFlow.map((item) => (
                <div key={item.sector} className="flex items-center justify-between text-[12px]">
                  <span className="text-deep">{item.sector}</span>
                  <span
                    className={`tabular-nums flex items-center gap-0.5 ${item.netInflow > 0 ? 'text-red-500' : item.netInflow < 0 ? 'text-emerald-600' : 'text-stone'}`}
                  >
                    {item.netInflow > 0 ? (
                      <ArrowUp className="h-2.5 w-2.5" />
                    ) : item.netInflow < 0 ? (
                      <ArrowDown className="h-2.5 w-2.5" />
                    ) : (
                      <Minus className="h-2.5 w-2.5" />
                    )}
                    {item.netInflow > 0 ? '+' : ''}
                    {item.netInflow.toFixed(2)} 亿
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
