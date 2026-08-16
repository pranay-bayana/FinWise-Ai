import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors with token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error(`[API Interceptor] Error on ${originalRequest?.url}: status ${error?.response?.status}`);
    
    // If 401 error, token is invalid/expired
    if (error.response?.status === 401) {
      console.log(`[API Interceptor] 401 encountered on ${originalRequest?.url}. Token invalid. Let caller handle it.`);
      // We don't force a hard reload here; let AuthContext or callers handle the 401 gracefully
    }
    
    return Promise.reject(error);
  }
);

export default api;
