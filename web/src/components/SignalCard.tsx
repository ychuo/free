import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { SignalItem } from '../types';
import FactorBreakdown from './FactorBreakdown';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { cn } from '../lib/utils';

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  early: { label: '早期', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  mid: { label: '中期', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  late: { label: '末期', color: 'bg-red-50 text-red-600 border-red-200' },
};

const TRACK_LABELS: Record<string, string> = {
  value: '价值发现',
  momentum: '热点信号',
};

interface Props {
  signal: SignalItem;
  journalNote: string;
  journalAction: string;
  onSaveJournal: (note: string, action: string) => Promise<void>;
}

export default function SignalCard({ signal, journalNote, journalAction, onSaveJournal }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(journalNote);
  const [action, setAction] = useState(journalAction);
  const [saving, setSaving] = useState(false);
  const stage = STAGE_LABELS[signal.stage];

  const handleSave = async () => {
    setSaving(true);
    await onSaveJournal(note, action);
    setSaving(false);
  };

  return (
    <Card
      className={cn('p-5 cursor-pointer transition-all', expanded && 'ring-1 ring-brand/20')}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-serif font-medium text-deep">{signal.targetName}</h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-brand/5 text-brand border-brand/20">
              {TRACK_LABELS[signal.track]}
            </Badge>
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', stage.color)}>
              {stage.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={cn(
              'text-2xl font-bold tabular-nums',
              signal.score > 70 ? 'text-emerald-600' : signal.score > 50 ? 'text-amber-600' : 'text-stone',
            )}>
              {signal.score}
            </span>
            <span className="text-[11px] text-stone">
              {signal.track === 'value' ? 'ValueScore' : 'HotScore'}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-stone" /> : <ChevronDown className="h-4 w-4 text-stone" />}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-sand/60 space-y-4 animate-fade-up" onClick={(e) => e.stopPropagation()}>
          <FactorBreakdown factors={signal.factors} totalScore={signal.score} />

          {signal.backtest && (
            <div className="rounded border border-sand/60 bg-parchment/50 p-3">
              <h4 className="text-[11px] font-medium text-deep mb-1">历史回测参考</h4>
              <p className="text-[12px] text-stone">
                类似信号出现后 3 个月：上涨概率 {signal.backtest.threeMonthProb}%，
                中位数回报 +{signal.backtest.threeMonthMedian}%
                <span className="text-[10px] text-stone/60 ml-1">
                  (样本 {signal.backtest.sampleSize})
                </span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-[11px] font-medium text-deep">你的判断</h4>
            <textarea
              className="w-full h-16 text-[12px] rounded-md border border-sand bg-ivory px-3 py-2 text-deep resize-none placeholder:text-stone/50"
              placeholder="记录你的判断：为什么跟/不跟这个信号？"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex items-center gap-2">
              {(['followed', 'ignored', 'watched'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={cn(
                    'px-2 py-0.5 text-[11px] rounded border transition-colors',
                    action === a
                      ? 'border-brand/40 bg-brand/5 text-brand'
                      : 'border-sand/60 text-stone hover:text-olive',
                  )}
                >
                  {a === 'followed' ? '跟进' : a === 'ignored' ? '忽略' : '观望'}
                </button>
              ))}
              <div className="flex-1" />
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '记录'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
