import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Liability, CreateLiabilityInput, UpdateLiabilityInput } from '../types';

export function useLiabilities() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.liabilities.list();
    setLiabilities(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (input: CreateLiabilityInput) => { await api.liabilities.create(input); await fetch(); };
  const update = async (id: string, input: UpdateLiabilityInput) => { await api.liabilities.update(id, input); await fetch(); };
  const remove = async (id: string) => { await api.liabilities.delete(id); await fetch(); };

  return { liabilities, loading, create, update, remove, refetch: fetch };
}
