import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Fab,
  Collapse,
  CircularProgress,
  Badge,
  Button,
} from '@mui/material';
import { Send as SendIcon, Chat as ChatIcon, Close as CloseIcon, Support as SupportIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendMessage, fetchChatHistory, clearChat } from '../../store/slices/chatSlice';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const chatState = useSelector((state) => state.chat) || { messages: [], loading: false };
  const { messages, loading } = chatState;
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && user) {
      // Only fetch history for admin users
      if (user.role === 'admin') {
        dispatch(fetchChatHistory());
      }
    }
  }, [isOpen, dispatch, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message immediately to the UI
    const userMessage = {
      text: message,
      isUser: true
    };
    
    // Clear input field immediately
    setMessage('');
    
    // Update local state with user message
    dispatch({
      type: 'chat/sendMessage/pending'
    });
    
    try {
      await dispatch(sendMessage(userMessage.text)).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleLogin = () => {
    navigate('/login', { state: { from: location } });
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Clear chat messages when closing for regular users
    if (user && user.role !== 'admin') {
      dispatch(clearChat());
    }
  };

  // Hide chatbot in admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    }}>
      <Collapse in={isOpen} timeout="auto">
        <Paper
          elevation={6}
          sx={{
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            mb: 2,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupportIcon />
              <Typography variant="h6">AI Customer Assistant</Typography>
            </Box>
            <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {!user ? (
            // Login prompt
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Please Login to Chat
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You need to be logged in to use the chat assistant.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
              >
                Login Now
              </Button>
            </Box>
          ) : (
            <>
              {/* Chat Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  bgcolor: '#f8f9fa',
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) 100%)',
                }}
              >
                <List>
                  {messages?.map((msg, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        flexDirection: 'column',
                        alignItems: msg.isUser ? 'flex-end' : 'flex-start',
                        py: 0.5,
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: '80%',
                          bgcolor: msg.isUser ? 'primary.main' : 'white',
                          color: msg.isUser ? 'white' : 'text.primary',
                          borderRadius: msg.isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                        }}
                      >
                        <ListItemText 
                          primary={msg.text}
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontSize: '0.95rem',
                            }
                          }}
                        />
                      </Paper>
                    </ListItem>
                  ))}
                  {loading && (
                    <ListItem>
                      <CircularProgress size={20} />
                    </ListItem>
                  )}
                  <div ref={messagesEndRef} />
                </List>
              </Box>

              {/* Message Input */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />
                <IconButton 
                  type="submit" 
                  color="primary" 
                  disabled={!message.trim() || loading}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled',
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      </Collapse>

      {/* Chat Toggle Button */}
      <Badge
        color="error"
        variant="dot"
        invisible={isOpen || !user || messages.length === 0}
      >
        <Fab
          color="primary"
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            width: 60,
            height: 60,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease-in-out',
            },
          }}
        >
          <ChatIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Badge>
    </Box>
  );
};

export default ChatBot; 