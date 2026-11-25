import axios from 'axios';

const envApiUrl = (import.meta as any).env?.VITE_API_URL;
const apiBase = envApiUrl
  ? `${String(envApiUrl).replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getPortalStorageKeys() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (path.startsWith('/admin')) {
    return { tokenKey: 'tvg_admin_token', userKey: 'tvg_admin_user' };
  }
  if (path.startsWith('/client')) {
    return { tokenKey: 'tvg_client_token', userKey: 'tvg_client_user' };
  }
  return { tokenKey: 'tvg_token', userKey: 'tvg_user' };
}

// Intercept requests to add Authorization header from portal-scoped localStorage
// IMPORTANT: Only use the portal-scoped token — no fallback to tvg_token to avoid
// CLIENT tokens leaking into ADMIN requests and causing 403 Access Denied errors.
api.interceptors.request.use((config) => {
  const { tokenKey } = getPortalStorageKeys();
  const token = localStorage.getItem(tokenKey);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // When sending FormData, let the browser calculate and set the exact multipart boundary
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  return config;
});

// Intercept responses to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const { tokenKey, userKey } = getPortalStorageKeys();
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    }
    return Promise.reject(error.response?.data || error);
  }
);
