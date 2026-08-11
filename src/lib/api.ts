export async function apiRequest<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    ...init,
    headers: { ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...init.headers },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Request failed (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const adminRequest = <T = unknown>(path: string, init: RequestInit = {}) => apiRequest<T>(`/admin${path}`, init);
export const publicRequest = <T = unknown>(path: string, init: RequestInit = {}) => apiRequest<T>(`/public${path}`, init);
