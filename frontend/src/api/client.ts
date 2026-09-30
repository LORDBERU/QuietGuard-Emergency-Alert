const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${BASE_URL}/api/auth/csrf-token`, { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken!;
}

export function clearCsrfToken() {
  csrfToken = null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const method = (options.method || 'GET').toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (isMutation) {
    const token = await getCsrfToken();
    headers['X-CSRF-Token'] = token;
  }
  
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    if (res.status === 401) {
        // clear session or dispatch event in a real app
    }
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  
  return res.json();
}