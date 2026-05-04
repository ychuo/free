import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useFireProfile } from '../hooks/useFireProfile';
import FireGauge from '../components/FireGauge';
import FireTimeline from '../components/FireTimeline';

export default function FireTracking() {
  const { progress, update } = useFireProfile();
  const [editing, setEditing] = useState(false);
  const [annualExpense, setAnnualExpense] = useState('');
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState('');

  const startEdit = () => {
    if (progress) {
      setAnnualExpense(String(progress.annualExpense));
      setSafeWithdrawalRate(String(progress.safeWithdrawalRate * 100));
    }
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await update({ annualExpense: parseFloat(annualExpense), safeWithdrawalRate: parseFloat(safeWithdrawalRate) / 100 });
    setEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-serif text-2xl font-medium italic">FIRE</h1>
          <p className="text-sm text-fg-dim mt-1">财务自由进度</p>
        </div>
        <button
          onClick={startEdit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-line bg-surface hover:shadow-hover transition-all"
        >
          <Settings2 className="h-4 w-4" />
          设定目标
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FireGauge progress={progress} />
        <div className="space-y-6">
          <FireTimeline progress={progress} />
          <div className="rounded-2xl bg-surface p-6 shadow-card animate-fade-up stagger-2">
            <h3 className="font-serif text-lg font-medium mb-4">当前目标</h3>
            <dl className="space-y-3">
              {[
                { label: '年生活支出', value: progress?.annualExpense.toLocaleString() || '—', suffix: '元/年' },
                { label: '安全提取率', value: progress ? `${(progress.safeWithdrawalRate * 100).toFixed(1)}` : '—', suffix: '%' },
                { label: 'FIRE 达标线', value: progress?.fireTarget.toLocaleString() || '—', suffix: '元', highlight: true },
              ].map(({ label, value, suffix, highlight }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                  <dt className="text-sm text-fg-dim">{label}</dt>
                  <dd className={`text-sm font-semibold num ${highlight ? 'text-accent text-base' : ''}`}>
                    {value} <span className="text-xs text-fg-dim font-normal">{suffix}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditing(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
            <h3 className="font-serif text-lg font-medium mb-5">设定 FIRE 目标</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-fg-dim">年生活支出（元）</label>
                <input type="number" step="1" value={annualExpense} onChange={e => setAnnualExpense(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-fg-dim">安全提取率 (%)</label>
                <input type="number" step="0.1" value={safeWithdrawalRate} onChange={e => setSafeWithdrawalRate(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl border border-line bg-surface-alt text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                <p className="text-xs text-fg-dim mt-1.5">经典 FIRE 理论建议 4%，越保守设置越低</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl border border-line hover:bg-surface-alt transition-colors">
                  取消
                </button>
                <button type="submit"
                  className="px-5 py-2.5 text-sm font-medium rounded-xl bg-accent text-white hover:brightness-110 transition-all">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
