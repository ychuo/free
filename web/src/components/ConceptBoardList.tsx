import type { ConceptItem } from '../types';
import { useState } from 'react';

interface Props {
  data: ConceptItem[];
  loading: boolean;
}

export default function ConceptBoardList({ data, loading }: Props) {
  const [fundamentalOnly, setFundamentalOnly] = useState(false);
  const sorted = [...data].sort((a, b) => b.changePercent - a.changePercent);

  return (
    <div className="rounded-lg border border-sand bg-ivory p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-serif font-medium text-deep">概念板块</h3>
        <label className="flex items-center gap-1.5 text-[11px] text-stone cursor-pointer select-none">
          <input
            type="checkbox"
            checked={fundamentalOnly}
            onChange={(e) => setFundamentalOnly(e.target.checked)}
            className="w-3 h-3 rounded border-sand accent-brand"
          />
          只看基本面支撑
        </label>
      </div>
      {loading ? (
        <div className="h-64 animate-pulse bg-sand/20 rounded" />
      ) : sorted.length === 0 ? (
        <p className="text-center text-stone text-[12px] py-8">暂无数据</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-sand/60 text-left text-stone">
                <th className="py-2 pr-4 font-normal">概念</th>
                <th className="py-2 pr-4 font-normal text-right">涨跌幅</th>
                <th className="py-2 pr-4 font-normal">领涨股</th>
                <th className="py-2 font-normal text-right">换手率</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 20).map((item) => (
                <tr
                  key={item.name}
                  className="border-b border-sand/30 hover:bg-parchment/50 transition-colors"
                >
                  <td className="py-2 pr-4 text-deep font-medium">{item.name}</td>
                  <td
                    className={`py-2 pr-4 text-right tabular-nums ${
                      item.changePercent > 0 ? 'text-red-500' : item.changePercent < 0 ? 'text-emerald-600' : 'text-stone'
                    }`}
                  >
                    {item.changePercent > 0 ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </td>
                  <td className="py-2 pr-4">
                    {item.leadingStock}
                    <span className="ml-1 text-[10px] text-stone">
                      {item.leadingStockChange > 0 ? '+' : ''}
                      {item.leadingStockChange.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums text-stone">
                    {item.turnover.toFixed(2)}%
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
