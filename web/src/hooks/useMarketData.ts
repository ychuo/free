import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { ConceptItem, FundFlowData, PortfolioAlert, ValuationItem } from '../types';

export function useMarketData() {
  const [valuation, setValuation] = useState<ValuationItem[]>([]);
  const [concepts, setConcepts] = useState<ConceptItem[]>([]);
  const [fundFlow, setFundFlow] = useState<FundFlowData | null>(null);
  const [alerts, setAlerts] = useState<PortfolioAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [v, c, f, a] = await Promise.all([
      api.marketData.valuation(),
      api.marketData.concepts(),
      api.marketData.fundFlow(),
      api.marketData.portfolioAlerts(),
    ]);
    setValuation(v);
    setConcepts(c);
    setFundFlow(f);
    setAlerts(a);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const result = await api.marketData.refresh();
      toast.success(`数据已刷新 (${result.valuation} 行业, ${result.concepts} 概念)`);
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '刷新失败');
    }
    setRefreshing(false);
  };

  return { valuation, concepts, fundFlow, alerts, loading, refreshing, refresh };
}
