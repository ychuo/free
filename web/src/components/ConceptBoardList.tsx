import type { ConceptItem } from '../types';

interface Props {
  data: ConceptItem[];
  loading: boolean;
}

export default function ConceptBoardList({ data, loading }: Props) {
  return (
    <div className="rounded-lg border border-sand bg-ivory p-5">
      <h3 className="text-sm font-serif font-medium text-deep mb-3">市场热点</h3>
      {loading ? (
        <div className="h-64 animate-pulse bg-sand/20 rounded" />
      ) : data.length === 0 ? (
        <p className="text-center text-stone text-[12px] py-8">暂无数据</p>
      ) : (
        <div className="space-y-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="rounded border border-sand/60 bg-parchment/50 px-4 py-3 hover:border-sand transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium text-deep">{item.name}</span>
                {item.leadingStock && item.leadingStock !== '--' && (
                  <span className="text-[11px] text-stone">
                    龙头：<span className="text-deep">{item.leadingStock}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone/70 leading-relaxed line-clamp-2">
                {item.driverEvent}
              </p>
              {item.stockCount > 0 && (
                <p className="text-[10px] text-stone/50 mt-1">{item.stockCount} 只成分股</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
