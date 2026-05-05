import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AssetCategory, Snapshot } from '../types';
import { CATEGORY_LABELS } from '../types';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--primary)',
  'var(--secondary-foreground)',
];

export default function AllocationHistory({ snapshots }: { snapshots: Snapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-2">
        <h3 className="text-sm font-serif font-medium text-deep mb-3">配置变化趋势</h3>
        <p className="text-center text-stone text-[12px] py-8">生成快照后，历史趋势将在此展示</p>
      </div>
    );
  }

  const reversed = [...snapshots].reverse();
  const categories = [...new Set(snapshots.flatMap((s) => Object.keys(s.breakdown || {})))];
  const data = reversed.map((s) => {
    const total = s.totalAssets;
    const point: Record<string, unknown> = {
      date: new Date(s.snapshotDate).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      }),
    };
    for (const cat of categories) {
      const val = (s.breakdown as Record<string, number>)[cat] || 0;
      point[CATEGORY_LABELS[cat as AssetCategory] || cat] =
        total > 0 ? parseFloat(((val / total) * 100).toFixed(1)) : 0;
    }
    return point;
  });

  const keys = categories.map((cat) => CATEGORY_LABELS[cat as AssetCategory] || cat);

  return (
    <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-2">
      <h3 className="text-sm font-serif font-medium text-deep mb-3">配置变化趋势</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'var(--font-serif)',
            }}
            formatter={(v) => [`${Number(v).toFixed(1)}%`, '']}
          />
          <Legend
            formatter={(value: string) => (
              <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{value}</span>
            )}
          />
          {keys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
