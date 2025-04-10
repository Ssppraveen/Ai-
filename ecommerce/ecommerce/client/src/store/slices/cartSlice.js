import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Check for admin token first, then user token
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    const token = adminToken || userToken;
    
    console.log('Request interceptor:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 10) + '...' : null
    });
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log('Response interceptor:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Base64 encoded placeholder image
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5OTkiLz48cGF0aCBkPSJNMTEwIDEwMEgxMDBWMTIwSDkwVjEwMEg4MFY5MEgxMjBWMTAwSDExMFYxMjBIMTAwVjEwMEg5MFYxMTBIODBWMTAwSDkwVjkwSDExMFYxMDBaIiBmaWxsPSIjNjY2Ii8+PC9zdmc+';

// Async thunks
export const fetchCartAsync = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('userToken');
      const token = adminToken || userToken;
      
      console.log('Tokens:', { adminToken: !!adminToken, userToken: !!userToken });
      
      if (!token) {
        return rejectWithValue('Please log in to view your cart');
      }

      console.log('Making request to /cart with token:', token.substring(0, 10) + '...');
      
      const response = await api.get('/cart');
      
      console.log('Response received:', response.data);
      
      if (!response.data.success) {
        console.error('Operation failed:', response.data);
        throw new Error(response.data.message || 'Failed to fetch cart');
      }

      console.log('Cart Data Received:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Cart Fetch Error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      if (error.response?.status === 401 || error.response?.status === 404) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userToken');
        return rejectWithValue('Please log in to view your cart');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch cart');
    }
  }
);

export const addItemAsync = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      console.log('Adding item to cart:', { productId, quantity });
      
      const response = await api.post(`/cart/${productId}`, { quantity });
      
      if (!response.data.success) {
        console.error('Operation failed:', response.data);
        throw new Error(response.data.message || 'Failed to add item to cart');
      }

      console.log('Successfully added item to cart:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error in addItemAsync:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userToken');
        return rejectWithValue('Session expired. Please log in again.');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add item to cart');
    }
  }
);

export const updateItemAsync = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      console.log('Updating cart item:', { itemId, quantity });
      
      const response = await api.put(`/cart/${itemId}`, { quantity });
      
      if (!response.data.success) {
        console.error('Operation failed:', response.data);
        throw new Error(response.data.message || 'Failed to update cart item');
      }

      console.log('Successfully updated cart item:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error in updateItemAsync:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userToken');
        return rejectWithValue('Session expired. Please log in again.');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update cart item');
    }
  }
);

export const removeItemAsync = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      console.log('Removing item from cart:', itemId);
      
      const response = await api.delete(`/cart/${itemId}`);
      
      if (!response.data.success) {
        console.error('Operation failed:', response.data);
        throw new Error(response.data.message || 'Failed to remove item from cart');
      }

      console.log('Successfully removed item from cart:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error in removeItemAsync:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userToken');
        return rejectWithValue('Session expired. Please log in again.');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to remove item from cart');
    }
  }
);

export const createOrderAsync = createAsyncThunk(
  'cart/createOrder',
  async (orderData, { rejectWithValue, getState }) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('userToken');
      const token = adminToken || userToken;
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const state = getState();
      const { items } = state.cart;
      
      if (!items || items.length === 0) {
        return rejectWithValue('Cart is empty');
      }

      const response = await api.post('/orders', {
        items: items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        shippingCost: orderData.shippingCost || 0
      });
      
      if (!response.data.success) {
        console.error('Operation failed:', response.data);
        throw new Error(response.data.message || 'Failed to create order');
      }

      console.log('Successfully created order:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userToken');
        return rejectWithValue('Session expired. Please log in again.');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create order');
    }
  }
);

// Helper function to calculate total
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    isOpen: false,
    loading: false,
    error: null,
    total: 0,
  },
  reducers: {
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.map(item => ({
          ...item,
          images: item.images?.length ? item.images.map(img => {
            // Construct the full path correctly
            return `http://localhost:5000/uploads/${img}`;
          }) : [PLACEHOLDER_IMAGE]
        }));
        state.total = calculateTotal(action.payload);
      })
      .addCase(fetchCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Item
      .addCase(addItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.map(item => ({
          ...item,
          images: item.images?.length ? item.images.map(img => {
            // If the image path is already a full URL, return it as is
            if (img.startsWith('http')) {
              return img;
            }
            // Construct the full path
            return `http://localhost:5000/uploads/products/${img}`;
          }) : [PLACEHOLDER_IMAGE]
        }));
        state.total = calculateTotal(action.payload);
      })
      .addCase(addItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Item
      .addCase(updateItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.map(item => ({
          ...item,
          images: item.images?.length ? item.images.map(img => {
            // If the image path is already a full URL, return it as is
            if (img.startsWith('http')) {
              return img;
            }
            // Construct the full path
            return `http://localhost:5000/uploads/products/${img}`;
          }) : [PLACEHOLDER_IMAGE]
        }));
        state.total = calculateTotal(action.payload);
      })
      .addCase(updateItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Item
      .addCase(removeItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.map(item => ({
          ...item,
          images: item.images?.length ? item.images.map(img => {
            // If the image path is already a full URL, return it as is
            if (img.startsWith('http')) {
              return img;
            }
            // Construct the full path
            return `http://localhost:5000/uploads/products/${img}`;
          }) : [PLACEHOLDER_IMAGE]
        }));
        state.total = calculateTotal(action.payload);
      })
      .addCase(removeItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Order
      .addCase(createOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.total = 0;
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartOpen = (state) => state.cart.isOpen;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartTotal = (state) => state.cart.total;

// Actions
export const { openCart, closeCart, clearError } = cartSlice.actions;

export default cartSlice.reducer; 