import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import SignalCard from '../components/SignalCard';
import { Button } from '../components/ui/button';
import { useSignals } from '../hooks/useSignals';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export default function SignalDiscovery() {
  const [track, setTrack] = useState<'value' | 'momentum'>('value');
  const { signals, advice, loading, saveJournal, refetch } = useSignals(track);
  const [refreshing, setRefreshing] = useState(false);
  const [journalData, setJournalData] = useState<Record<string, { note: string; action: string }>>({});

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.signals.refresh();
      await refetch();
    } catch {
      // error handled by hook
    }
    setRefreshing(false);
  };

  const handleSaveJournal = async (signalId: string, note: string, action: string) => {
    await saveJournal(signalId, note, action);
    setJournalData((prev) => ({ ...prev, [signalId]: { note, action } }));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">信号发现</h1>
          <p className="text-[12px] text-stone mt-0.5">评分引擎帮你发现价值投资机会和热点交易信号</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={cn('h-3 w-3 mr-1', refreshing && 'animate-spin')} />
          {refreshing ? '计算中...' : '刷新信号'}
        </Button>
      </div>

      {advice && (
        <div className="rounded-lg border border-brand/20 bg-brand/5 p-4">
          <h3 className="text-sm font-serif font-medium text-deep mb-1">仓位建议</h3>
          <div className="flex items-center gap-6 text-[12px]">
            <span className="text-stone">
              当前：价值仓 {advice.currentValueRatio}% / 卫星仓 {advice.currentMomentumRatio}%
            </span>
            <span className="text-stone">
              建议：价值仓 {advice.suggestedValueRatio}% / 卫星仓 {advice.suggestedMomentumRatio}%
            </span>
          </div>
          <p className="text-[11px] text-stone/70 mt-1">{advice.note}</p>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {(['value', 'momentum'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTrack(t)}
            className={cn(
              'px-3 py-1 text-[12px] rounded-md transition-colors border',
              track === t
                ? 'border-brand/40 bg-brand/5 text-deep font-medium'
                : 'border-sand/60 text-stone hover:text-olive',
            )}
          >
            {t === 'value' ? '价值发现' : '热点信号'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg border border-sand bg-ivory animate-pulse" />
          ))}
        </div>
      ) : signals.length === 0 ? (
        <p className="text-center text-stone text-[12px] py-12">
          暂无信号，点击"刷新信号"开始计算
        </p>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => {
            const jd = journalData[signal.id] || { note: '', action: 'watched' };
            return (
              <SignalCard
                key={signal.id}
                signal={signal}
                journalNote={jd.note}
                journalAction={jd.action}
                onSaveJournal={(note, action) => handleSaveJournal(signal.id, note, action)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
