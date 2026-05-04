import { Sparkles } from 'lucide-react';
import type { FireProgress } from '../types';

export default function FireGauge({ progress }: { progress: FireProgress | null }) {
  if (!progress) return null;

  const rate = Math.min(progress.coverageRate, 100);
  const circumference = 2 * Math.PI * 72;
  const dash = (rate / 100) * circumference;

  const gradient = rate >= 100
    ? 'stroke-positive'
    : rate >= 50 ? 'stroke-warning' : 'stroke-negative';

  return (
    <div className="rounded-2xl bg-surface p-8 shadow-card flex flex-col items-center animate-fade-up">
      <h3 className="font-serif text-lg font-medium mb-2">FIRE 覆盖度</h3>
      <p className="text-xs text-fg-dim mb-6">被动收入覆盖年支出的比例</p>

      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill="none" className="stroke-line" strokeWidth="10" />
          <circle
            cx="80" cy="80" r="72" fill="none"
            className={`${gradient}`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {rate >= 100 ? (
            <Sparkles className="h-6 w-6 text-positive mb-1" />
          ) : null}
          <span className={`text-4xl font-bold num tracking-tight ${rate >= 100 ? 'text-positive' : rate >= 50 ? 'text-warning' : 'text-negative'}`}>
            {rate.toFixed(1)}
          </span>
          <span className="text-xs text-fg-dim">%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full mt-6 pt-6 border-t border-line">
        {[
          { label: '年被动收入', value: `${(progress.annualPassiveIncome / 1e4).toFixed(1)} 万`, color: 'text-positive' },
          { label: '年支出', value: `${(progress.annualExpense / 1e4).toFixed(1)} 万`, color: 'text-fg' },
          { label: progress.gap > 0 ? '差距' : '已超额', value: progress.gap > 0 ? `${(progress.gap / 1e4).toFixed(1)} 万` : 'FIRE!', color: progress.gap > 0 ? 'text-fg-dim' : 'text-accent' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className="text-xs text-fg-dim mb-1">{label}</p>
            <p className={`text-lg font-bold num tracking-tight ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
