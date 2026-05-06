import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { PortfolioAdvice, SignalItem } from '../types';

export function useSignals(track?: string) {
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [advice, setAdvice] = useState<PortfolioAdvice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [s, a] = await Promise.all([api.signals.list(track), api.signals.portfolioAdvice()]);
    setSignals(s);
    setAdvice(a);
    setLoading(false);
  }, [track]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const saveJournal = async (signalId: string, note: string, action: string) => {
    try {
      await api.signals.updateJournal(signalId, { note, action });
      toast.success('判断已记录');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存失败');
    }
  };

  return { signals, advice, loading, saveJournal, refetch: fetch };
}
