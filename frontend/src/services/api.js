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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('[OAuth] API 401 encountered:', {
        url: originalRequest?.url,
        status: error.response.status,
        hasAuthorizationHeader: Boolean(originalRequest?.headers?.Authorization),
        pathname: window.location.pathname,
      });
      
      try {
        // Try to verify token with backend
        const token = localStorage.getItem('token');
        if (token) {
          console.log('[OAuth] API interceptor verifying existing app token:', {
            hasStoredToken: true,
            verifyUrl: `${API_URL}/auth/verify`,
          });
          const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
      } catch (verifyError) {
        // Token is invalid, clear storage
        console.warn('[OAuth] API interceptor verify failed:', {
          status: verifyError?.response?.status || 'no-response',
          message: verifyError?.response?.data?.message || verifyError?.response?.data?.error || verifyError?.message || 'Unknown error',
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login')) {
          console.warn('[OAuth] API interceptor redirecting to login');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
