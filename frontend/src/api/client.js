// Centralized Axios client for deployment flexibility
import axios from 'axios';

// Use Vite env if provided, fallback to window origin (same-domain) else localhost (dev)
const base = import.meta?.env?.VITE_API_BASE || `${window.location.origin}/api` || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: base.replace(/\/$/, ''),
});

export const buildFileUrl = (path) => `${base.replace(/\/$/, '')}/${path.replace(/^\//,'')}`;

export default api;