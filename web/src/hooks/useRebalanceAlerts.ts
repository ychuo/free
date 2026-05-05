import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { RebalanceAlertStatus, UpdateRebalanceAlertsInput } from '../types';

export function useRebalanceAlerts() {
  const [statuses, setStatuses] = useState<RebalanceAlertStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.rebalanceAlerts.status();
    setStatuses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateAlerts = async (input: UpdateRebalanceAlertsInput) => {
    try {
      const data = await api.rebalanceAlerts.update(input);
      setStatuses(data);
      toast.success('阈值已更新');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '更新失败');
    }
  };

  return { statuses, loading, updateAlerts, refetch: fetch };
}
