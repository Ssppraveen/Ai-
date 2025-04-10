import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Grid, 
  TextField,
  Divider,
  Alert
} from '@mui/material';
import { 
  login, 
  adminLogin, 
  logout, 
  selectIsAuthenticated, 
  selectIsAdmin, 
  selectUser 
} from '../store/slices/authSlice';
import { 
  checkTokens, 
  clearAllTokens, 
  simulateUserLogin, 
  simulateAdminLogin, 
  simulateUserLogout, 
  simulateAdminLogout,
  testTokenPriority
} from '../utils/authTest';
import { runAllTests } from '../utils/runAuthTests';

const AuthTest = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectUser);
  
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [tokenStatus, setTokenStatus] = useState({ userToken: null, adminToken: null });
  const [logs, setLogs] = useState([]);
  const [testResults, setTestResults] = useState(null);
  
  // Function to add log messages
  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // Check tokens on component mount
  useEffect(() => {
    const tokens = checkTokens();
    setTokenStatus(tokens);
    addLog('Initial token check completed');
  }, []);
  
  // Update token status when authentication state changes
  useEffect(() => {
    const tokens = checkTokens();
    setTokenStatus(tokens);
    addLog(`Auth state changed: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}, ${isAdmin ? 'Admin' : 'User'}`);
  }, [isAuthenticated, isAdmin]);
  
  // Handle user login
  const handleUserLogin = async (e) => {
    e.preventDefault();
    try {
      addLog(`Attempting user login with email: ${userEmail}`);
      await dispatch(login({ email: userEmail, password: userPassword })).unwrap();
      addLog('User login successful');
    } catch (error) {
      addLog(`User login failed: ${error}`);
    }
  };
  
  // Handle admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      addLog(`Attempting admin login with email: ${adminEmail}`);
      await dispatch(adminLogin({ email: adminEmail, password: adminPassword })).unwrap();
      addLog('Admin login successful');
    } catch (error) {
      addLog(`Admin login failed: ${error}`);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    addLog('Logout successful');
  };
  
  // Handle token priority test
  const handleTokenPriorityTest = () => {
    testTokenPriority();
    addLog('Token priority test completed');
  };
  
  // Handle clear tokens
  const handleClearTokens = () => {
    clearAllTokens();
    addLog('All tokens cleared');
  };
  
  // Handle run all tests
  const handleRunAllTests = () => {
    addLog('Running all authentication tests...');
    const results = runAllTests();
    setTestResults(results);
    addLog(`All tests ${results ? 'PASSED' : 'FAILED'}`);
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Authentication Test Page
      </Typography>
      
      <Grid container spacing={4}>
        {/* Token Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Token Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography>User Token: {tokenStatus.userToken ? 'Present' : 'Not Present'}</Typography>
              <Typography>Admin Token: {tokenStatus.adminToken ? 'Present' : 'Not Present'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Authentication Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</Typography>
              <Typography>User Type: {isAdmin ? 'Admin' : 'User'}</Typography>
              {user && (
                <Typography>User Data: {JSON.stringify(user)}</Typography>
              )}
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleLogout}
              disabled={!isAuthenticated}
              sx={{ mr: 1 }}
            >
              Logout
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleClearTokens}
              sx={{ mr: 1 }}
            >
              Clear Tokens
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleTokenPriorityTest}
              sx={{ mr: 1 }}
            >
              Test Token Priority
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleRunAllTests}
            >
              Run All Tests
            </Button>
          </Paper>
        </Grid>
        
        {/* Test Results */}
        {testResults !== null && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Test Results
              </Typography>
              <Alert severity={testResults ? 'success' : 'error'}>
                All tests {testResults ? 'PASSED' : 'FAILED'}
              </Alert>
            </Paper>
          </Grid>
        )}
        
        {/* User Login Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Login
            </Typography>
            <form onSubmit={handleUserLogin}>
              <TextField
                fullWidth
                label="Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                margin="normal"
                required
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth
                sx={{ mt: 2 }}
              >
                Login as User
              </Button>
            </form>
          </Paper>
        </Grid>
        
        {/* Admin Login Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Admin Login
            </Typography>
            <form onSubmit={handleAdminLogin}>
              <TextField
                fullWidth
                label="Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                margin="normal"
                required
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="secondary" 
                fullWidth
                sx={{ mt: 2 }}
              >
                Login as Admin
              </Button>
            </form>
          </Paper>
        </Grid>
        
        {/* Logs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Logs
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              {logs.map((log, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {log}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AuthTest; 