import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { StrategyTemplate } from '../types';

export function useStrategies(type?: string) {
  const [templates, setTemplates] = useState<StrategyTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.strategies.list(type);
    setTemplates(data);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { templates, loading, refetch: fetch };
}
