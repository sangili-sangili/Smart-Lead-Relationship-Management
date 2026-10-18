import axios from 'axios';

/**
 * Centralized Axios instance configured for LeadFlow CRM API
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
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

// Response Interceptor: Format errors and handle session expiration
api.interceptors.response.use(
  (response) => {
    // Return standard payload directly
    return response.data;
  },
  (error) => {
    const formattedError = {
      status: error.response?.status || 500,
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      message:
        error.response?.data?.error?.message ||
        error.message ||
        'A network or server error occurred. Please try again.',
      details: error.response?.data?.error?.details || null
    };

    // If 401 Unauthorized, notify application or clear token if appropriate
    if (error.response?.status === 401) {
      // Clear expired credentials
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('leadflow_token');
        localStorage.removeItem('leadflow_user');
      }
    }

    return Promise.reject(formattedError);
  }
);

export default api;
