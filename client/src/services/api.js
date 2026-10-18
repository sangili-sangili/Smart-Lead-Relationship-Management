import axios from 'axios';

/**
 * Determine the correct API base URL
 * - In local dev (npm run dev): uses '/api' via Vite proxy to localhost:5000
 * - In production: uses VITE_API_URL if configured, or defaults to the live Render backend
 */
const getBaseUrl = () => {
  // If running locally in development, use local Vite proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  // If an explicit full URL is provided in the build environment
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http')) {
    return import.meta.env.VITE_API_URL;
  }
  // Cloud deployment on Render: automatically target the live backend API
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://smart-lead-relationship-management.onrender.com/api';
  }
  return import.meta.env.VITE_API_URL || '/api';
};

/**
 * Centralized Axios instance configured for LeadFlow CRM API
 * Uses environment variables for baseURL and includes security interceptors
 */
const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 15000
});

// Request Interceptor: Attach JWT bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('leadflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle session expiration & security
api.interceptors.response.use(
  (response) => {
    // Return standard payload directly (e.g. { success, data, message, meta })
    return response.data;
  },
  (error) => {
    const status = error.response?.status || 500;
    const errorData = error.response?.data?.error || error.response?.data || {};

    const formattedError = {
      status,
      code: errorData.code || (status === 401 ? 'UNAUTHORIZED' : 'NETWORK_ERROR'),
      message:
        errorData.message ||
        error.message ||
        'A network or server error occurred. Please try again.',
      details: errorData.details || null,
      raw: error
    };

    // If 401 Unauthorized, notify application and clear expired session
    if (status === 401) {
      const isLoginPath = window.location.pathname === '/login';
      
      // Clear expired credentials
      localStorage.removeItem('leadflow_token');
      localStorage.removeItem('leadflow_user');

      // Dispatch event for reactive auth logout if not already on login page
      if (!isLoginPath && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('leadflow:auth:unauthorized', {
          detail: { message: formattedError.message }
        }));
      }
    }

    return Promise.reject(formattedError);
  }
);

export default api;
