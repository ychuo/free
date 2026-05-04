import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AllocationAnalysis } from '../types';

const LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产',
  crypto: '数字货币', precious: '贵金属', other: '其他',
};

const COLORS = {
  current: '#2563eb',
  target: '#cbd5e1',
  over: '#ef4444',
  under: '#1a9c7a',
};

export default function AllocationCompare({ analysis }: { analysis: AllocationAnalysis[] }) {
  const data = analysis.map(a => ({
    name: LABELS[a.category] || a.category,
    当前: a.currentRatio,
    目标: a.targetRatio,
    deviation: a.deviation,
  }));

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up">
      <h3 className="font-serif text-lg font-medium mb-4">当前 vs 目标</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--line))" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--fg-dim))' }} axisLine={false} tickLine={false} />
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
          <Bar dataKey="当前" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((entry, i) => (
              <rect
                key={i}
                fill={entry.deviation > 0 ? COLORS.over : Math.abs(entry.deviation) < 1 ? COLORS.current : COLORS.under}
              />
            ))}
          </Bar>
          <Bar dataKey="目标" fill={COLORS.target} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
