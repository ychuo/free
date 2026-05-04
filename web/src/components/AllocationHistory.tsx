import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Snapshot } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#f97316', '#eab308', '#6b7280'];
const LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产', crypto: '数字货币', precious: '贵金属', other: '其他',
};

export default function AllocationHistory({ snapshots }: { snapshots: Snapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-lg font-semibold mb-3">配置变化趋势</h3>
        <p className="text-sm text-muted-foreground text-center py-4">暂无快照数据，请先在资产总览中生成快照</p>
      </div>
    );
  }

  const reversed = [...snapshots].reverse();
  const categories = Object.keys(reversed[0]?.breakdown || {});
  const data = reversed.map(s => {
    const total = s.totalAssets;
    const point: Record<string, unknown> = { date: new Date(s.snapshotDate).toLocaleDateString('zh-CN') };
    for (const cat of categories) {
      const val = (s.breakdown as Record<string, number>)[cat] || 0;
      point[LABELS[cat] || cat] = total > 0 ? (val / total) * 100 : 0;
    }
    return point;
  });

  const keys = categories.map(cat => LABELS[cat] || cat);

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-lg font-semibold mb-3">配置变化趋势</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit="%" />
          <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
          <Legend />
          {keys.map((key, i) => (<Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
