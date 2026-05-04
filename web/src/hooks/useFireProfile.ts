import { useState, useEffect, useCallback } from 'react';
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
      setProfile(p); setProgress(pg);
    } catch { setProfile(null); setProgress(null); }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const update = async (input: UpdateFireProfileInput) => { await api.fireProfile.update(input); await fetch(); };

  return { profile, progress, loading, update, refetch: fetch };
}
