import type { FireProgress } from '../types';

export default function FireGauge({ progress }: { progress: FireProgress | null }) {
  if (!progress) return null;
  const coverageRate = Math.min(progress.coverageRate, 100);
  const color = coverageRate >= 100 ? 'text-green-600' : coverageRate >= 50 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      <h3 className="text-lg font-semibold mb-4">FIRE 覆盖度</h3>
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" className="text-secondary" strokeWidth="12" />
          <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" className={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(coverageRate / 100) * 440} 440`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{coverageRate.toFixed(1)}%</span>
          <span className="text-sm text-muted-foreground">覆盖度</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div><p className="text-xs text-muted-foreground">年被动收入</p><p className="text-lg font-semibold text-green-600">{(progress.annualPassiveIncome / 1e4).toFixed(1)} 万</p></div>
        <div><p className="text-xs text-muted-foreground">年支出</p><p className="text-lg font-semibold">{progress.annualExpense.toLocaleString()}</p></div>
        <div><p className="text-xs text-muted-foreground">差距</p><p className="text-lg font-semibold text-red-500">{progress.gap > 0 ? `${(progress.gap / 1e4).toFixed(1)} 万` : '已达标'}</p></div>
      </div>
    </div>
  );
}
