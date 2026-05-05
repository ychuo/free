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
    list: (category?: string) => request(`/assets${category ? `?category=${category}` : ''}`),
    create: (data: unknown) => request('/assets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) => request(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/assets/${id}`, { method: 'DELETE' }),
  },
  liabilities: {
    list: () => request('/liabilities'),
    create: (data: unknown) => request('/liabilities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) => request(`/liabilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/liabilities/${id}`, { method: 'DELETE' }),
  },
  netWorth: {
    get: () => request('/net-worth'),
    history: () => request('/net-worth/history'),
  },
  fireProfile: {
    get: () => request('/fire-profile'),
    update: (data: unknown) => request('/fire-profile', { method: 'PUT', body: JSON.stringify(data) }),
    progress: () => request('/fire-progress'),
  },
  allocation: {
    targets: () => request('/allocation-targets'),
    updateTargets: (data: unknown) => request('/allocation-targets', { method: 'PUT', body: JSON.stringify(data) }),
    analysis: () => request('/allocation-analysis'),
  },
  snapshots: {
    create: () => request('/snapshots', { method: 'POST' }),
    list: () => request('/snapshots'),
    delete: (id: string) => request(`/snapshots/${id}`, { method: 'DELETE' }),
    clearAll: () => request('/snapshots', { method: 'DELETE' }),
  },
};
