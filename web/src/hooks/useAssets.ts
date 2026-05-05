import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
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

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (input: CreateAssetInput) => {
    try {
      await api.assets.create(input);
      toast.success('已添加资产');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '添加失败');
    }
  };
  const update = async (id: string, input: UpdateAssetInput) => {
    try {
      await api.assets.update(id, input);
      toast.success('已更新资产');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '更新失败');
    }
  };
  const remove = async (id: string) => {
    try {
      await api.assets.delete(id);
      toast.success('已删除资产');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  const removeMany = async (ids: string[]) => {
    try {
      const result = await api.assets.deleteMany(ids);
      toast.success(`已删除 ${result.deleted} 项资产`);
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '批量删除失败');
    }
  };

  return { assets, loading, create, update, remove, removeMany, refetch: fetch };
}
