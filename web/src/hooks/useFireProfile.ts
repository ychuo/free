import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import type { FireProfile, FireProgress, UpdateFireProfileInput } from '../types';

export function useFireProfile() {
  const [profile, setProfile] = useState<FireProfile | null>(null);
  const [progress, setProgress] = useState<FireProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [p, pg] = await Promise.all([api.fireProfile.get(), api.fireProfile.progress()]);
      setProfile(p);
      setProgress(pg);
    } catch {
      setProfile(null);
      setProgress(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const update = async (input: UpdateFireProfileInput) => {
    try {
      await api.fireProfile.update(input);
      toast.success('FIRE 目标已更新');
      await fetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '更新失败');
    }
  };

  return { profile, progress, loading, update, refetch: fetch };
}
