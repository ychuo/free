import { cn } from '../lib/utils';
import type { ValuationItem } from '../types';

interface Props {
  data: ValuationItem[];
  loading: boolean;
}

function getColorClass(percentile: number): string {
  if (percentile < 20) return 'bg-emerald-50 text-emerald-700';
  if (percentile > 80) return 'bg-red-50 text-red-600';
  return 'bg-amber-50 text-amber-700';
}

function getLabel(percentile: number): string {
  if (percentile < 20) return '低估';
  if (percentile > 80) return '高估';
  return '合理';
}

export default function ValuationHeatmap({ data, loading }: Props) {
  return (
    <div className="rounded-lg border border-sand bg-ivory p-5">
      <h3 className="text-sm font-serif font-medium text-deep mb-3">估值水位</h3>
      {loading ? (
        <div className="h-64 animate-pulse bg-sand/20 rounded" />
      ) : data.length === 0 ? (
        <p className="text-center text-stone text-[12px] py-8">
          暂无数据，点击刷新获取最新估值
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-sand/60 text-left text-stone">
                <th className="py-2 pr-4 font-normal">行业</th>
                <th className="py-2 pr-4 font-normal text-right">当前 PE</th>
                <th className="py-2 pr-4 font-normal text-right">PE 分位</th>
                <th className="py-2 pr-4 font-normal text-right">当前 PB</th>
                <th className="py-2 pr-4 font-normal text-right">PB 分位</th>
                <th className="py-2 font-normal text-right">判断</th>
              </tr>
            </thead>
            <tbody>
              {data
                .sort((a, b) => a.pePercentile - b.pePercentile)
                .map((item) => (
                  <tr
                    key={item.sector}
                    className="border-b border-sand/30 hover:bg-parchment/50 transition-colors"
                  >
                    <td className="py-2 pr-4 text-deep font-medium">{item.sector}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {item.currentPE > 0 ? item.currentPE.toFixed(1) : '-'}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      <span
                        className={cn(
                          'inline-block px-1.5 py-0.5 rounded text-[10px] font-medium',
                          getColorClass(item.pePercentile),
                        )}
                      >
                        {item.pePercentile.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {item.currentPB > 0 ? item.currentPB.toFixed(2) : '-'}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {item.pbPercentile.toFixed(0)}%
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={cn(
                          'inline-block px-1.5 py-0.5 rounded text-[10px] font-medium',
                          getColorClass(item.pePercentile),
                        )}
                      >
                        {getLabel(item.pePercentile)}
                      </span>
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
