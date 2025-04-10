import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper function to get the appropriate token based on the route
const getTokenForRoute = () => {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) {
    return localStorage.getItem('adminToken');
  }
  return localStorage.getItem('userToken');
};

// Helper function to set the appropriate token
const setTokenForRoute = (token, isAdmin = false) => {
  if (isAdmin) {
    localStorage.setItem('adminToken', token);
  } else {
    localStorage.setItem('userToken', token);
  }
};

// Helper function to remove the appropriate token
const removeTokenForRoute = (isAdmin = false) => {
  if (isAdmin) {
    localStorage.removeItem('adminToken');
  } else {
    localStorage.removeItem('userToken');
  }
};

// Helper function to clear all tokens
const clearAllTokens = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('adminToken');
};

// User login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/users/login', credentials);
      const { token, user } = response.data;
      setTokenForRoute(token, false);
      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Admin login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/admin/login', credentials);
      const { token, user } = response.data;
      setTokenForRoute(token, true);
      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Admin login failed');
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const state = getState();
    const isAdmin = state.auth.isAdmin;
    removeTokenForRoute(isAdmin);
    return null;
  }
);

// Initialize auth state
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    const path = window.location.pathname;
    const isAdminRoute = path.startsWith('/admin');
    const token = isAdminRoute ? localStorage.getItem('adminToken') : localStorage.getItem('userToken');
    
    if (!token) {
      return null;
    }

    try {
      const endpoint = isAdminRoute ? '/api/admin/profile' : '/api/users/profile';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      clearAllTokens();
      return null;
    }
  }
);

// Load user from token
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      localStorage.removeItem('userToken');
      return rejectWithValue(error.response?.data?.message || 'Session expired');
    }
  }
);

// Load admin from token
export const loadAdmin = createAsyncThunk(
  'auth/loadAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await axios.get('/api/admin/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      localStorage.removeItem('adminToken');
      return rejectWithValue(error.response?.data?.message || 'Admin session expired');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.isAdmin = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.isAdmin = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      // Initialize
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isAdmin = window.location.pathname.startsWith('/admin');
          state.token = getTokenForRoute();
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isAdmin = false;
        }
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.isAdmin = false;
        state.user = action.payload;
        state.token = localStorage.getItem('userToken');
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.error = action.payload;
      })
      // Load Admin
      .addCase(loadAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.isAdmin = true;
        state.user = action.payload;
        state.token = localStorage.getItem('adminToken');
      })
      .addCase(loadAdmin.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUser = (state) => state.auth.user;
export const selectIsAdmin = (state) => state.auth.isAdmin;

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 