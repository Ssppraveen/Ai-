import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000'
});

// Add request interceptor to add token
api.interceptors.request.use(
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

// Async thunks
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (text, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/chat/message', { text });
      
      if (!response.data || !response.data.messages) {
        throw new Error('Invalid response format');
      }

      // Return both user message and AI response
      return {
        userMessage: {
          text,
          isUser: true,
          timestamp: new Date().toISOString()
        },
        aiMessage: response.data.messages[response.data.messages.length - 1] || {
          text: 'Sorry, I could not process your request.',
          isUser: false,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const isAdmin = auth.user?.role === 'admin';
      
      // For regular users, we don't fetch history - just return empty array
      if (!isAdmin) {
        return { messages: [] };
      }
      
      // For admins, fetch the full history
      const response = await api.get('/api/chat/history');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat history');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearChat: (state) => {
      state.messages = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        // Add both user message and AI response
        state.messages.push(action.payload.userMessage);
        state.messages.push(action.payload.aiMessage);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages || [];
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearChat, clearError, addMessage } = chatSlice.actions;
export default chatSlice.reducer; 