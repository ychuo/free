import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Asset, CreateAssetInput, UpdateAssetInput } from '../types';

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.assets.list();
    setAssets(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (input: CreateAssetInput) => { await api.assets.create(input); await fetch(); };
  const update = async (id: string, input: UpdateAssetInput) => { await api.assets.update(id, input); await fetch(); };
  const remove = async (id: string) => { await api.assets.delete(id); await fetch(); };

  return { assets, loading, create, update, remove, refetch: fetch };
}
