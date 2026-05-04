import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { NetWorthSummary, Snapshot } from '../types';

export function useNetWorth() {
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [summaryData, snapshotData] = await Promise.all([
      api.netWorth.get(), api.snapshots.list(),
    ]);
    setSummary(summaryData);
    setSnapshots(snapshotData);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createSnapshot = async () => { await api.snapshots.create(); await fetch(); };

  return { summary, snapshots, loading, createSnapshot, refetch: fetch };
}
