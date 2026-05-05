import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { AllocationAnalysis, AllocationTarget, AssetCategory } from '../types';

export function useAllocation() {
  const [targets, setTargets] = useState<AllocationTarget[]>([]);
  const [analysis, setAnalysis] = useState<AllocationAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [t, a] = await Promise.all([api.allocation.targets(), api.allocation.analysis()]);
    setTargets(t);
    setAnalysis(a);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateTargets = async (newTargets: { category: AssetCategory; targetRatio: number }[]) => {
    await api.allocation.updateTargets({ targets: newTargets });
    await fetch();
  };

  return { targets, analysis, loading, updateTargets, refetch: fetch };
}
