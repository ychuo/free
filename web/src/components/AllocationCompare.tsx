import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AllocationAnalysis } from '../types';
import { CATEGORY_LABELS } from '../types';

export default function AllocationCompare({ analysis }: { analysis: AllocationAnalysis[] }) {
  const data = analysis.map((a) => ({
    name: CATEGORY_LABELS[a.category] || a.category,
    当前: a.currentRatio,
    目标: a.targetRatio,
  }));

  return (
    <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up">
      <h3 className="text-sm font-serif font-medium text-deep mb-3">当前 vs 目标</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
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
          <Bar dataKey="当前" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={24} />
          <Bar dataKey="目标" fill="var(--secondary)" radius={[3, 3, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
