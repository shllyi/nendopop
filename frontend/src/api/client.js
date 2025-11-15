import axios from 'axios';

// Base URL from Vite env or fallback (do NOT include /api/v1 here)
const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000';

// Create a single shared axios instance (AJAX client)
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Authorization token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling (optional)
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Optionally handle 401/403 globally
    if (error?.response?.status === 401) {
      // You could auto-logout or redirect here if desired
      // localStorage.clear();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
