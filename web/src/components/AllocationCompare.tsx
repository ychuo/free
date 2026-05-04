import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { AllocationAnalysis } from '../types';

const LABELS: Record<string, string> = {
  cash: '现金', fixed_income: '固收', equity: '权益', real_estate: '不动产', crypto: '数字货币', precious: '贵金属', other: '其他',
};

export default function AllocationCompare({ analysis }: { analysis: AllocationAnalysis[] }) {
  const data = analysis.map(a => ({ name: LABELS[a.category] || a.category, 当前: a.currentRatio, 目标: a.targetRatio }));

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-lg font-semibold mb-3">配置对比</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit="%" />
          <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
          <Legend />
          <Bar dataKey="当前" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="目标" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
