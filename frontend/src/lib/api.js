/**
 * Tiny client for the Note2Quiz backend (see /backend/README.md).
 * Dev: Vite proxies /api to http://localhost:5000. Production: set VITE_API_URL (e.g. https://api.example.com).
 *
 *   import { api } from '../lib/api';
 *   const { token, user } = await api.post('/auth/login', { email, password });
 *   api.setToken(token);
 */
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';
const KEY = 'n2q-token';

let token = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();

export class ApiError extends Error {
  constructor(status, code, message, fields) { super(message); this.status = status; this.code = code; this.fields = fields || {}; }
}

async function request(method, path, body) {
  const isForm = body instanceof FormData;
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) { api.setToken(null); window.dispatchEvent(new Event('n2q-logout')); }
    const e = data.error || {};
    throw new ApiError(res.status, e.code || 'error', e.message || 'Something went wrong.', e.fields);
  }
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b ?? {}),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
  upload: (files, folder) => { const f = new FormData(); [...files].forEach((x) => f.append('files', x)); if (folder) f.append('folder', folder); return request('POST', '/notes', f); },
  setToken(t) { token = t; try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch {} },
  get loggedIn() { return !!token; },
};
