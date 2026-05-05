import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
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
    try {
      await api.allocation.updateTargets({ targets: newTargets });
      toast.success('目标配置已更新');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '更新失败');
    }
  };

  return { targets, analysis, loading, updateTargets, refetch: fetch };
}
