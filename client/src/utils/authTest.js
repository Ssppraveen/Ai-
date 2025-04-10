/**
 * Auth Test Utility
 * 
 * This utility helps test the token and session management for both user and admin logins.
 */

// Function to check current tokens in localStorage
export const checkTokens = () => {
  const userToken = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('adminToken');
  
  console.log('=== Token Status ===');
  console.log('User Token:', userToken ? 'Present' : 'Not Present');
  console.log('Admin Token:', adminToken ? 'Present' : 'Not Present');
  
  return { userToken, adminToken };
};

// Function to clear all tokens
export const clearAllTokens = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('adminToken');
  console.log('All tokens cleared');
};

// Function to simulate user login
export const simulateUserLogin = (token, userData) => {
  localStorage.setItem('userToken', token);
  console.log('User login simulated with token:', token);
  console.log('User data:', userData);
};

// Function to simulate admin login
export const simulateAdminLogin = (token, adminData) => {
  localStorage.setItem('adminToken', token);
  console.log('Admin login simulated with token:', token);
  console.log('Admin data:', adminData);
};

// Function to simulate user logout
export const simulateUserLogout = () => {
  localStorage.removeItem('userToken');
  console.log('User logout simulated');
};

// Function to simulate admin logout
export const simulateAdminLogout = () => {
  localStorage.removeItem('adminToken');
  console.log('Admin logout simulated');
};

// Function to test token priority in API requests
export const testTokenPriority = () => {
  console.log('=== Testing Token Priority ===');
  
  // Clear all tokens first
  clearAllTokens();
  
  // Add both tokens
  simulateUserLogin('user-token-123', { id: 1, name: 'Test User' });
  simulateAdminLogin('admin-token-456', { id: 2, name: 'Admin User', isAdmin: true });
  
  // Check which token would be used in API requests
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');
  const token = adminToken || userToken;
  
  console.log('Token that would be used in API requests:', token);
  console.log('Admin token takes priority:', token === adminToken);
  
  // Clear tokens
  clearAllTokens();
  console.log('=== Token Priority Test Completed ===');
}; 