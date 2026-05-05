import type { FireProgress } from '../types';

export default function FireGauge({ progress }: { progress: FireProgress | null }) {
  if (!progress) return null;

  const rate = Math.min(progress.coverageRate, 100);
  const circumference = 2 * Math.PI * 68;
  const dash = (rate / 100) * circumference;
  const color =
    rate >= 100 ? 'var(--chart-1)' : rate >= 50 ? 'var(--chart-2)' : 'var(--destructive)';

  return (
    <div className="rounded-lg border border-sand bg-ivory p-6 flex flex-col items-center animate-fade-up">
      <h3 className="text-sm font-serif font-medium text-deep mb-0.5">FIRE 覆盖度</h3>
      <p className="text-[11px] text-stone mb-5">被动收入 ÷ 年支出</p>

      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <title>FIRE 覆盖度仪表盘</title>
          <circle cx="80" cy="80" r="68" fill="none" className="stroke-sand" strokeWidth="8" />
          <circle
            cx="80"
            cy="80"
            r="68"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-serif font-medium tracking-tight" style={{ color }}>
            {rate.toFixed(1)}
          </span>
          <span className="text-[11px] text-stone">%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full mt-5 pt-4 border-t border-sand">
        {[
          {
            label: '年被动收入',
            value: `${(progress.annualPassiveIncome / 1e4).toFixed(1)} 万`,
            color: 'text-chart-1',
          },
          {
            label: '年支出',
            value: `${(progress.annualExpense / 1e4).toFixed(1)} 万`,
            color: 'text-deep',
          },
          {
            label: progress.gap > 0 ? '差距' : '已超额',
            value: progress.gap > 0 ? `${(progress.gap / 1e4).toFixed(1)} 万` : 'FIRE!',
            color: progress.gap > 0 ? 'text-stone' : 'text-brand',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className="text-[10px] text-stone mb-0.5">{label}</p>
            <p className={`text-sm font-serif font-medium tracking-tight ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
