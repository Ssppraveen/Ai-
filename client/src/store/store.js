import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import chatReducer from './slices/chatSlice';

// Configure axios defaults
axios.interceptors.request.use(
  (config) => {
    // Check for admin token first, then user token
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    const token = adminToken || userToken;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear both tokens on 401 responses
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userToken');
      delete axios.defaults.headers.common['Authorization'];
      // The store will be available here since this file exports it
      store.dispatch({ type: 'auth/logout' });
    }
    return Promise.reject(error);
  }
);

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 