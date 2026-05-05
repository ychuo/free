import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { NetWorthSummary, Snapshot } from '../types';

export function useNetWorth() {
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [summaryData, snapshotData] = await Promise.all([
      api.netWorth.get(),
      api.snapshots.list(),
    ]);
    setSummary(summaryData);
    setSnapshots(snapshotData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createSnapshot = async (snapshotDate?: string) => {
    try {
      await api.snapshots.create(
        snapshotDate ? { snapshotDate: new Date(snapshotDate).toISOString() } : undefined,
      );
      toast.success('快照已保存');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存快照失败');
    }
  };
  const deleteSnapshot = async (id: string) => {
    try {
      await api.snapshots.delete(id);
      toast.success('已删除快照');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };
  const clearSnapshots = async () => {
    try {
      const result = await api.snapshots.clearAll();
      toast.success(`已清除 ${result.deleted} 条快照`);
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '清除失败');
    }
  };

  return {
    summary,
    snapshots,
    loading,
    createSnapshot,
    deleteSnapshot,
    clearSnapshots,
    refetch: fetch,
  };
}
