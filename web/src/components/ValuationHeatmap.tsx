import { cn } from '../lib/utils';
import type { ValuationItem } from '../types';

interface Props {
  data: ValuationItem[];
  loading: boolean;
}

function getChangeClass(change: number): string {
  if (change > 2) return 'text-red-500 font-medium';
  if (change < -2) return 'text-emerald-600 font-medium';
  if (change > 0) return 'text-red-400';
  if (change < 0) return 'text-emerald-500';
  return 'text-stone';
}

function getFlowClass(flow: number): string {
  if (flow > 5) return 'bg-red-50 text-red-600';
  if (flow < -5) return 'bg-emerald-50 text-emerald-700';
  return 'bg-amber-50 text-amber-700';
}

export default function ValuationHeatmap({ data, loading }: Props) {
  return (
    <div className="rounded-lg border border-sand bg-ivory p-5">
      <h3 className="text-sm font-serif font-medium text-deep mb-3">行业板块</h3>
      {loading ? (
        <div className="h-64 animate-pulse bg-sand/20 rounded" />
      ) : data.length === 0 ? (
        <p className="text-center text-stone text-[12px] py-8">暂无数据，点击刷新获取最新估值</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-sand/60 text-left text-stone">
                <th className="py-2 pr-4 font-normal">行业</th>
                <th className="py-2 pr-4 font-normal text-right">涨跌幅</th>
                <th className="py-2 pr-4 font-normal text-right">净流入(亿)</th>
                <th className="py-2 pr-4 font-normal text-right">上涨</th>
                <th className="py-2 pr-4 font-normal text-right">下跌</th>
                <th className="py-2 pr-4 font-normal">领涨股</th>
              </tr>
            </thead>
            <tbody>
              {data
                .sort((a, b) => b.changePercent - a.changePercent)
                .map((item) => (
                  <tr
                    key={item.sector}
                    className="border-b border-sand/30 hover:bg-parchment/50 transition-colors"
                  >
                    <td className="py-2 pr-4 text-deep font-medium">{item.sector}</td>
                    <td
                      className={cn(
                        'py-2 pr-4 text-right tabular-nums',
                        getChangeClass(item.changePercent),
                      )}
                    >
                      {item.changePercent > 0 ? '+' : ''}
                      {item.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      <span
                        className={cn(
                          'inline-block px-1.5 py-0.5 rounded text-[10px] font-medium',
                          getFlowClass(item.netInflow),
                        )}
                      >
                        {item.netInflow > 0 ? '+' : ''}
                        {item.netInflow.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-red-500">
                      {item.upCount}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-emerald-600">
                      {item.downCount}
                    </td>
                    <td className="py-2 pr-4">
                      {item.leadingStock}
                      {item.leadingStockChange !== 0 && (
                        <span
                          className={cn(
                            'ml-1.5 text-[10px]',
                            item.leadingStockChange > 0 ? 'text-red-500' : 'text-emerald-600',
                          )}
                        >
                          {item.leadingStockChange > 0 ? '+' : ''}
                          {item.leadingStockChange.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
