import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { MarketPrice } from '../types';

export function usePrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.prices.list();
    setPrices(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      const result = await api.prices.refresh();
      toast.success(`价格已更新 (${result.updated} 项)`);
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '刷新失败');
    }
    setRefreshing(false);
  };

  const refreshAsset = async (assetId: string) => {
    try {
      await api.prices.refreshAsset(assetId);
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '刷新失败');
    }
  };

  return { prices, loading, refreshing, refreshAll, refreshAsset };
}
