import { useState } from 'react';
import { Pencil } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">FIRE 追踪</h1>
        <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-secondary text-sm">
          <Pencil className="h-4 w-4" /> 编辑目标
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FireGauge progress={progress} />
        <div className="space-y-6">
          <FireTimeline progress={progress} />
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-3">目标设定</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">年生活支出</dt><dd className="font-medium">{progress?.annualExpense.toLocaleString() || '-'} 元</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">安全提取率</dt><dd className="font-medium">{progress ? `${(progress.safeWithdrawalRate * 100).toFixed(0)}%` : '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">FIRE 达标金额</dt><dd className="font-medium text-primary">{(progress?.fireTarget || 0).toLocaleString()} 元</dd></div>
            </dl>
          </div>
        </div>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">编辑 FIRE 目标</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">年生活支出（元）</label>
                <input type="number" step="1" value={annualExpense} onChange={e => setAnnualExpense(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">安全提取率 (%)</label>
                <input type="number" step="0.1" value={safeWithdrawalRate} onChange={e => setSafeWithdrawalRate(e.target.value)} required className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-md border text-sm hover:bg-secondary">取消</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
