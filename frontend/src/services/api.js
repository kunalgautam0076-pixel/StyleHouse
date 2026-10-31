import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : undefined);

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be set for production builds');
}

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stale auth state - redirect will be handled by components
      console.warn('Unauthorized request - session may have expired');
    }
    return Promise.reject(error);
  }
);

export default api;