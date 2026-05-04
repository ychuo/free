import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { NetWorthSummary } from '../types';

const COLORS: Record<string, string> = {
  cash: '#10b981', fixed_income: '#6366f1', equity: '#3b82f6', real_estate: '#f59e0b',
  crypto: '#f97316', precious: '#eab308', other: '#6b7280',
};
const LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产',
  crypto: '数字货币', precious: '贵金属', other: '其他',
};

export default function AssetPieChart({ summary }: { summary: NetWorthSummary | null }) {
  if (!summary) return null;
  const data = Object.entries(summary.categoryBreakdown)
    .filter(([, v]) => v > 0)
    .map(([category, value]) => ({ name: LABELS[category] || category, value, color: COLORS[category] || '#6b7280' }));

  if (data.length === 0) return <p className="text-center text-muted-foreground py-8">暂无资产数据</p>;

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-lg font-semibold mb-3">资产分布</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
          </Pie>
          <Tooltip formatter={(value: number) => `${(value / 1e4).toFixed(2)} 万`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
