// Centralized Axios client for deployment flexibility
import axios from 'axios';

// Use Vite env if provided, fallback to window origin (same-domain) else localhost (dev)
const base = import.meta?.env?.VITE_API_BASE || `${window.location.origin}/api` || 'http://localhost:5000/api';

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