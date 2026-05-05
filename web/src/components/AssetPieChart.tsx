import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { NetWorthSummary } from '../types';

const COLORS = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)',
  'var(--chart-4)', 'var(--chart-5)', 'var(--chart-1)', 'var(--chart-2)',
];
const LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产',
  crypto: '数字货币', precious: '贵金属', other: '其他',
};

export default function AssetPieChart({ summary }: { summary: NetWorthSummary | null }) {
  if (!summary) return null;

  const data = Object.entries(summary.categoryBreakdown)
    .filter(([, v]) => v > 0)
    .map(([category, value], i) => ({
      name: LABELS[category] || category,
      value,
      color: COLORS[i % COLORS.length],
    }));

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-sand bg-ivory p-6 flex items-center justify-center h-[320px]">
        <p className="text-xs text-stone">录入资产后将在此显示分布</p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up">
      <h3 className="text-sm font-serif font-medium mb-3 text-deep">资产分布</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={88} dataKey="value" stroke="none">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--color-ivory)',
              border: '1px solid var(--color-sand)',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'var(--font-serif)',
            }}
            formatter={(value: number) => [`${(value / 1e4).toFixed(1)} 万`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[12px]">
            <span className="w-2 h-2 rounded-[2px] flex-shrink-0" style={{ background: d.color }} />
            <span className="text-stone">{d.name}</span>
            <span className="text-deep font-medium">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
