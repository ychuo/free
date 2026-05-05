import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { CreateLiabilityInput, Liability, UpdateLiabilityInput } from '../types';

export function useLiabilities() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.liabilities.list();
    setLiabilities(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (input: CreateLiabilityInput) => {
    try {
      await api.liabilities.create(input);
      toast.success('已添加负债');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '添加失败');
    }
  };
  const update = async (id: string, input: UpdateLiabilityInput) => {
    try {
      await api.liabilities.update(id, input);
      toast.success('已更新负债');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '更新失败');
    }
  };
  const remove = async (id: string) => {
    try {
      await api.liabilities.delete(id);
      toast.success('已删除负债');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  return { liabilities, loading, create, update, remove, refetch: fetch };
}
