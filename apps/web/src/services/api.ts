import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add Authorization header from localStorage if cookie is not sent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tvg_token');
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
      // Clear token if expired
      localStorage.removeItem('tvg_token');
      localStorage.removeItem('tvg_user');
    }
    return Promise.reject(error.response?.data || error);
  }
);
