import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { SignalHistoryItem } from '../types';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const ACTION_LABELS: Record<string, string> = {
  followed: '跟进',
  ignored: '忽略',
  watched: '观望',
};

export default function SignalHistory() {
  const [items, setItems] = useState<SignalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.signals.history().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-lg font-serif font-medium tracking-wide text-deep">信号复盘</h1>
        <p className="text-[12px] text-stone mt-0.5">回顾历史信号与你的判断，建立模式识别能力</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg border border-sand bg-ivory animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-stone text-[12px] py-12">暂无历史信号</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-sand/60 text-left text-stone">
                <th className="py-2 pr-4 font-normal">日期</th>
                <th className="py-2 pr-4 font-normal">标的</th>
                <th className="py-2 pr-4 font-normal text-right">得分</th>
                <th className="py-2 pr-4 font-normal text-right">触发时</th>
                <th className="py-2 pr-4 font-normal text-right">当前</th>
                <th className="py-2 pr-4 font-normal">你的判断</th>
                <th className="py-2 font-normal">笔记</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.signal.id}
                  className="border-b border-sand/30 hover:bg-parchment/50 transition-colors"
                >
                  <td className="py-2 pr-4 text-stone">
                    {new Date(item.signal.triggeredAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="py-2 pr-4 text-deep font-medium">
                    {item.signal.targetName}
                    <Badge
                      variant="outline"
                      className={cn(
                        'ml-1.5 text-[10px] px-1 py-0',
                        item.signal.track === 'value'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700',
                      )}
                    >
                      {item.signal.track === 'value' ? '价值' : '动量'}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 text-right font-medium tabular-nums">
                    {item.signal.score}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums text-stone">
                    {item.outcome ? `${item.outcome.changePercent > 0 ? '+' : ''}...` : '-'}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {item.outcome ? (
                      <span
                        className={item.outcome.changePercent > 0 ? 'text-red-500' : 'text-emerald-600'}
                      >
                        {item.outcome.changePercent > 0 ? '+' : ''}
                        {item.outcome.changePercent.toFixed(2)}%
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {item.journal ? (
                      <span className="text-[11px]">{ACTION_LABELS[item.journal.action]}</span>
                    ) : (
                      <span className="text-[11px] text-stone/50">未记录</span>
                    )}
                  </td>
                  <td className="py-2 text-[11px] text-stone/70 max-w-[200px] truncate">
                    {item.journal?.note || '-'}
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
