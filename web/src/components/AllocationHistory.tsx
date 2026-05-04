import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Snapshot } from '../types';

const COLORS = ['#2563eb', '#1a9c7a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#78716c'];
const LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产',
  crypto: '数字货币', precious: '贵金属', other: '其他',
};

export default function AllocationHistory({ snapshots }: { snapshots: Snapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up stagger-2">
        <h3 className="font-serif text-lg font-medium mb-3">配置变化趋势</h3>
        <p className="text-center text-fg-dim text-sm py-10">生成快照后，历史趋势将在此展示</p>
      </div>
    );
  }

  const reversed = [...snapshots].reverse();
  const categories = Object.keys(reversed[0]?.breakdown || {});

  const data = reversed.map(s => {
    const total = s.totalAssets;
    const point: Record<string, unknown> = {
      date: new Date(s.snapshotDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    };
    for (const cat of categories) {
      const val = (s.breakdown as Record<string, number>)[cat] || 0;
      point[LABELS[cat] || cat] = total > 0 ? parseFloat(((val / total) * 100).toFixed(1)) : 0;
    }
    return point;
  });

  const keys = categories.map(cat => LABELS[cat] || cat);

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up stagger-2">
      <h3 className="font-serif text-lg font-medium mb-4">配置变化趋势</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--line))" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--fg-dim))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--fg-dim))' }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--line))',
              borderRadius: '12px',
              fontSize: '13px',
            }}
            formatter={(v: number) => [`${v.toFixed(1)}%`, '']}
          />
          <Legend
            formatter={(value: string) => <span style={{ fontSize: '13px', color: 'hsl(var(--fg-dim))' }}>{value}</span>}
          />
          {keys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
