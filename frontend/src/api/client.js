// Centralized Axios client for deployment flexibility
import axios from 'axios';

// Build a normalized base URL.
// If VITE_API_BASE is provided but missing trailing /api we append it.
// Guarantees we end up with exactly one /api segment (no double /api/api).
function normalizeBase(raw) {
  if (!raw) return `${window.location.origin}/api`;
  let url = raw.trim();
  // Remove trailing slash for consistency
  url = url.replace(/\/$/, '');
  const lower = url.toLowerCase();
  if (!lower.endsWith('/api')) {
    url += '/api';
  }
  // Avoid accidental double /api/api
  url = url.replace(/\/api\/api$/i, '/api');
  return url;
}

const base = normalizeBase(import.meta?.env?.VITE_API_BASE) || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: base.replace(/\/$/, ''),
});

// Attach a simple response interceptor for debugging 4xx/5xx issues in production
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response) {
      const { status, data } = error.response;
      // Log minimal diagnostic info (won't expose secrets)
  console.warn('[API ERROR]', status, error.config?.method?.toUpperCase(), error.config?.url, data?.message || data);
    } else {
  console.error('[API NETWORK ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

export const buildFileUrl = (path) => `${base.replace(/\/$/, '')}/${path.replace(/^\//,'')}`;
// Helpful for debugging which base the frontend actually compiled with.
console.log('[API BASE]', base);

export default api;