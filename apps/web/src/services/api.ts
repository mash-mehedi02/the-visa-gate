import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication is cookie-only: the server sets an httpOnly session cookie on
// sign-in and the browser sends it with every request (withCredentials).
// No token is ever kept in localStorage, sessionStorage or page state, so a
// cross-site scripting flaw cannot steal a session token from storage.
api.interceptors.request.use((config) => {
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
    return Promise.reject(error.response?.data || error);
  }
);
