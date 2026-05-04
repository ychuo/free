import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { NetWorthSummary } from '../types';

const COLORS = ['#1a9c7a', '#d97706', '#2563eb', '#7c3aed', '#db2777', '#0891b2', '#78716c'];
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
      <div className="rounded-2xl bg-surface p-6 shadow-card flex items-center justify-center h-[340px]">
        <p className="text-fg-dim text-sm">录入资产后将在此显示分布</p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up">
      <h3 className="font-serif text-lg font-medium mb-4">资产分布</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={96}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} className="hover:opacity-80 transition-opacity" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--line))',
              borderRadius: '12px',
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            formatter={(value: number) => [
              <span key="v" className="num font-medium">{(value / 1e4).toFixed(1)} 万</span>,
              ''
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-sm">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
            <span className="text-fg-dim">{d.name}</span>
            <span className="num font-medium">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
