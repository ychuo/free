import { useState } from 'react';
import { useFireProfile } from '../hooks/useFireProfile';
import FireGauge from '../components/FireGauge';
import FireTimeline from '../components/FireTimeline';
import Modal from '../components/Modal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">FIRE</h1>
          <p className="text-[12px] text-stone mt-0.5">财务自由进度追踪</p>
        </div>
        <Button variant="secondary" size="sm" onClick={startEdit}>设定目标</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FireGauge progress={progress} />
        <div className="space-y-5">
          <FireTimeline progress={progress} />
          <div className="rounded-lg border border-sand bg-ivory p-5 animate-fade-up stagger-2">
            <h3 className="text-sm font-serif font-medium text-deep mb-3">当前目标</h3>
            <dl className="space-y-2.5">
              {[
                { label: '年生活支出', value: progress?.annualExpense.toLocaleString() || '—', suffix: '元/年' },
                { label: '安全提取率', value: progress ? `${(progress.safeWithdrawalRate * 100).toFixed(1)}` : '—', suffix: '%' },
                { label: 'FIRE 达标线', value: progress?.fireTarget.toLocaleString() || '—', suffix: '元', accent: true },
              ].map(({ label, value, suffix, accent }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-sand/60 last:border-0">
                  <dt className="text-[12px] text-stone">{label}</dt>
                  <dd className={`text-[13px] font-medium ${accent ? 'text-brand' : 'text-deep'}`}>
                    {value} <span className="text-[11px] text-stone font-normal">{suffix}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)}>
        <div className="w-full max-w-sm">
          <h3 className="text-sm font-serif font-medium text-deep mb-4">设定 FIRE 目标</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium mb-1 text-stone">年生活支出（元）</label>
              <Input type="number" placeholder="例：300000" step="1" value={annualExpense} onChange={e => setAnnualExpense(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1 text-stone">安全提取率 (%)</label>
              <Input type="number" placeholder="4.0" step="0.1" value={safeWithdrawalRate} onChange={e => setSafeWithdrawalRate(e.target.value)} required />
              <p className="text-[10px] text-stone mt-1">经典 FIRE 为 4%，保守建议更低</p>
            </div>
            <div className="flex justify-end gap-2 pt-1.5">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)}>取消</Button>
              <Button type="submit" size="sm">保存</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
