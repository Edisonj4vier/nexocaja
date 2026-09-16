import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    // If the backend wraps the response in our standard { success, data, message } format, extract it automatically
    if (response.data && response.data.success && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear session in store and storage so the app redirects to /login cleanly
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
