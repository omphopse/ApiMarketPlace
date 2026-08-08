import axios from 'axios';
import { toast } from 'react-toastify';
import { getStoredUser, clearStoredUser } from '../utils/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user?.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearStoredUser();
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error(error.response?.data?.message || 'Access denied.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
