import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../types';

export function useTransactions(assetId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await api.transactions.list(assetId);
    setTransactions(data);
    setLoading(false);
  }, [assetId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (input: CreateTransactionInput) => {
    try {
      await api.transactions.create(input);
      toast.success('已添加交易');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '添加失败');
    }
  };

  const update = async (id: string, input: UpdateTransactionInput) => {
    try {
      await api.transactions.update(id, input);
      toast.success('已更新交易');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '更新失败');
    }
  };

  const remove = async (id: string) => {
    try {
      await api.transactions.delete(id);
      toast.success('已删除交易');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  };

  return { transactions, loading, create, update, remove, refetch: fetch };
}
