import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { ReturnAnalysis } from '../types';

export function useReturns() {
  const [analysis, setAnalysis] = useState<ReturnAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    const data = await api.returns.analysis(from, to);
    setAnalysis(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { analysis, loading, refetch: fetch };
}
