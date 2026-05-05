import type {
  AllocationAnalysis,
  AllocationTarget,
  Asset,
  CreateTransactionInput,
  ExchangeRate,
  FireProfile,
  FireProgress,
  Liability,
  MarketPrice,
  NetWorthSummary,
  RebalanceAlertStatus,
  ReturnAnalysis,
  Snapshot,
  Transaction,
  UpdateRebalanceAlertsInput,
  UpdateTransactionInput,
} from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body != null;
  const res = await fetch(`${BASE}${url}`, {
    ...(hasBody ? { headers: { 'Content-Type': 'application/json' } } : {}),
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  assets: {
    list: (category?: string) =>
      request<Asset[]>(`/assets${category ? `?category=${category}` : ''}`),
    create: (data: unknown) =>
      request<Asset>('/assets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request<Asset>(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/assets/${id}`, { method: 'DELETE' }),
  },
  liabilities: {
    list: () => request<Liability[]>('/liabilities'),
    create: (data: unknown) =>
      request<Liability>('/liabilities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request<Liability>(`/liabilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/liabilities/${id}`, { method: 'DELETE' }),
  },
  netWorth: {
    get: () => request<NetWorthSummary>('/net-worth'),
    history: () => request<Snapshot[]>('/net-worth/history'),
  },
  fireProfile: {
    get: () => request<FireProfile>('/fire-profile'),
    update: (data: unknown) =>
      request<FireProfile>('/fire-profile', { method: 'PUT', body: JSON.stringify(data) }),
    progress: () => request<FireProgress>('/fire-progress'),
  },
  allocation: {
    targets: () => request<AllocationTarget[]>('/allocation-targets'),
    updateTargets: (data: unknown) =>
      request<AllocationTarget[]>('/allocation-targets', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    analysis: () => request<AllocationAnalysis[]>('/allocation-analysis'),
  },
  snapshots: {
    create: (data?: { snapshotDate: string }) =>
      request<Snapshot>(
        '/snapshots',
        data ? { method: 'POST', body: JSON.stringify(data) } : { method: 'POST' },
      ),
    list: () => request<Snapshot[]>('/snapshots'),
    delete: (id: string) => request<void>(`/snapshots/${id}`, { method: 'DELETE' }),
    clearAll: () => request<{ deleted: number }>('/snapshots', { method: 'DELETE' }),
  },
  prices: {
    list: () => request<MarketPrice[]>('/prices'),
    refresh: () =>
      request<{ updated: number; failed: number; errors: string[] }>('/prices/refresh', {
        method: 'POST',
      }),
    refreshAsset: (assetId: string) =>
      request<{ success: boolean }>(`/prices/refresh/${assetId}`, { method: 'POST' }),
  },
  exchangeRates: {
    list: () => request<ExchangeRate[]>('/exchange-rates'),
    refresh: () =>
      request<{ updated: number; errors: string[] }>('/exchange-rates/refresh', {
        method: 'POST',
      }),
  },
  transactions: {
    list: (assetId?: string) =>
      request<Transaction[]>(`/transactions${assetId ? `?assetId=${assetId}` : ''}`),
    create: (data: CreateTransactionInput) =>
      request<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateTransactionInput) =>
      request<Transaction>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/transactions/${id}`, { method: 'DELETE' }),
  },
  returns: {
    analysis: (from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return request<ReturnAnalysis>(`/returns${qs ? `?${qs}` : ''}`);
    },
    assetReturn: (assetId: string) =>
      request<{
        costBasis: number;
        currentValue: number;
        totalReturn: number;
        totalReturnPercent: number;
      }>(`/returns/${assetId}`),
  },
  rebalanceAlerts: {
    status: () => request<RebalanceAlertStatus[]>('/rebalance-alerts'),
    update: (data: UpdateRebalanceAlertsInput) =>
      request<RebalanceAlertStatus[]>('/rebalance-alerts', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};
