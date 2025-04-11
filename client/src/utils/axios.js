import axios from 'axios';

const api = axios.create({
  baseURL: https://ecommerce-backend-ah99.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const path = window.location.pathname;
    const isAdminRoute = path.startsWith('/admin');
    const token = isAdminRoute ? localStorage.getItem('adminToken') : localStorage.getItem('userToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const isAdminRoute = path.startsWith('/admin');
      
      // Only clear the token for the current route type
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
      } else {
        localStorage.removeItem('userToken');
      }
      
      // Redirect to appropriate login page
      window.location.href = isAdminRoute ? '/admin/login' : '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 
