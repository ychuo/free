import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Snapshot } from '../types';

const COLORS = ['#1B365D', '#2d6a4f', '#b08d4b', '#6b4c8a', '#b5454a', '#3d7a8a', '#78716c'];
const LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产',
  crypto: '数字货币', precious: '贵金属', other: '其他',
};

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
    <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-2">
      <h3 className="text-sm font-serif font-medium text-deep mb-3">配置变化趋势</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e6dc" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6a64' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b6a64' }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{
              background: '#faf9f5', border: '1px solid #e8e6dc', borderRadius: '8px',
              fontSize: '12px', fontFamily: 'var(--font-serif)',
            }}
            formatter={(v: number) => [`${v.toFixed(1)}%`, '']}
          />
          <Legend formatter={(value: string) => <span style={{ fontSize: '11px', color: '#6b6a64' }}>{value}</span>} />
          {keys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
