// If NEXT_PUBLIC_API_BASE is not provided, default to the backend dev server
// Running frontend on localhost:3000 and backend on localhost:4000 is common.
const defaultDevBase = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 'http://localhost:4000' : '';
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || defaultDevBase || '';

async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let errMsg = text || res.statusText;
    try {
      const json = JSON.parse(text || '{}');
      errMsg = json.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const auth = {
  me: () => request('/api/auth/me'),
  login: (body: any) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  signup: (body: any) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  refresh: () => request('/api/auth/refresh', { method: 'POST' }),
  // best-effort password request (server may not implement)
  requestPassword: (body: any) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }).catch(() => null),
};

export const leads = {
  list: () => request('/api/leads'),
};
