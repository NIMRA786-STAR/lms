import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.warn('⚠️ VITE_API_URL is not set. API calls will fail in production.');
}

axios.defaults.baseURL = baseURL || 'http://localhost:5000';

// Attach token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;