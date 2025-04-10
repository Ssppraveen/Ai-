/**
 * Authentication Test Script
 * 
 * This script provides a series of tests to verify token and session management
 * for both user and admin logins.
 */

import { 
  checkTokens, 
  clearAllTokens, 
  simulateUserLogin, 
  simulateAdminLogin, 
  simulateUserLogout, 
  simulateAdminLogout
} from './authTest';

/**
 * Test Case 1: User Login
 * 
 * This test verifies that:
 * 1. User login stores the user token correctly
 * 2. Admin token is not affected
 */
export const testUserLogin = () => {
  console.log('=== Test Case 1: User Login ===');
  
  // Clear all tokens first
  clearAllTokens();
  
  // Simulate user login
  simulateUserLogin('user-token-123', { id: 1, name: 'Test User' });
  
  // Check tokens
  const tokens = checkTokens();
  
  // Verify results
  const userTokenPresent = tokens.userToken === 'user-token-123';
  const adminTokenAbsent = tokens.adminToken === null;
  
  console.log(`User token present: ${userTokenPresent}`);
  console.log(`Admin token absent: ${adminTokenAbsent}`);
  
  // Clean up
  clearAllTokens();
  
  return userTokenPresent && adminTokenAbsent;
};

/**
 * Test Case 2: Admin Login
 * 
 * This test verifies that:
 * 1. Admin login stores the admin token correctly
 * 2. User token is not affected
 */
export const testAdminLogin = () => {
  console.log('=== Test Case 2: Admin Login ===');
  
  // Clear all tokens first
  clearAllTokens();
  
  // Simulate admin login
  simulateAdminLogin('admin-token-456', { id: 2, name: 'Admin User', isAdmin: true });
  
  // Check tokens
  const tokens = checkTokens();
  
  // Verify results
  const adminTokenPresent = tokens.adminToken === 'admin-token-456';
  const userTokenAbsent = tokens.userToken === null;
  
  console.log(`Admin token present: ${adminTokenPresent}`);
  console.log(`User token absent: ${userTokenAbsent}`);
  
  // Clean up
  clearAllTokens();
  
  return adminTokenPresent && userTokenAbsent;
};

/**
 * Test Case 3: User Login Then Admin Login
 * 
 * This test verifies that:
 * 1. User login stores the user token correctly
 * 2. Admin login stores the admin token correctly
 * 3. Both tokens can coexist
 */
export const testUserThenAdminLogin = () => {
  console.log('=== Test Case 3: User Login Then Admin Login ===');
  
  // Clear all tokens first
  clearAllTokens();
  
  // Simulate user login
  simulateUserLogin('user-token-123', { id: 1, name: 'Test User' });
  
  // Simulate admin login
  simulateAdminLogin('admin-token-456', { id: 2, name: 'Admin User', isAdmin: true });
  
  // Check tokens
  const tokens = checkTokens();
  
  // Verify results
  const userTokenPresent = tokens.userToken === 'user-token-123';
  const adminTokenPresent = tokens.adminToken === 'admin-token-456';
  
  console.log(`User token present: ${userTokenPresent}`);
  console.log(`Admin token present: ${adminTokenPresent}`);
  
  // Clean up
  clearAllTokens();
  
  return userTokenPresent && adminTokenPresent;
};

/**
 * Test Case 4: User Logout
 * 
 * This test verifies that:
 * 1. User logout removes only the user token
 * 2. Admin token is not affected
 */
export const testUserLogout = () => {
  console.log('=== Test Case 4: User Logout ===');
  
  // Clear all tokens first
  clearAllTokens();
  
  // Simulate both logins
  simulateUserLogin('user-token-123', { id: 1, name: 'Test User' });
  simulateAdminLogin('admin-token-456', { id: 2, name: 'Admin User', isAdmin: true });
  
  // Simulate user logout
  simulateUserLogout();
  
  // Check tokens
  const tokens = checkTokens();
  
  // Verify results
  const userTokenAbsent = tokens.userToken === null;
  const adminTokenPresent = tokens.adminToken === 'admin-token-456';
  
  console.log(`User token absent: ${userTokenAbsent}`);
  console.log(`Admin token present: ${adminTokenPresent}`);
  
  // Clean up
  clearAllTokens();
  
  return userTokenAbsent && adminTokenPresent;
};

/**
 * Test Case 5: Admin Logout
 * 
 * This test verifies that:
 * 1. Admin logout removes only the admin token
 * 2. User token is not affected
 */
export const testAdminLogout = () => {
  console.log('=== Test Case 5: Admin Logout ===');
  
  // Clear all tokens first
  clearAllTokens();
  
  // Simulate both logins
  simulateUserLogin('user-token-123', { id: 1, name: 'Test User' });
  simulateAdminLogin('admin-token-456', { id: 2, name: 'Admin User', isAdmin: true });
  
  // Simulate admin logout
  simulateAdminLogout();
  
  // Check tokens
  const tokens = checkTokens();
  
  // Verify results
  const adminTokenAbsent = tokens.adminToken === null;
  const userTokenPresent = tokens.userToken === 'user-token-123';
  
  console.log(`Admin token absent: ${adminTokenAbsent}`);
  console.log(`User token present: ${userTokenPresent}`);
  
  // Clean up
  clearAllTokens();
  
  return adminTokenAbsent && userTokenPresent;
};

/**
 * Run all tests
 */
export const runAllAuthTests = () => {
  console.log('=== Starting Authentication Tests ===');
  
  const test1Result = testUserLogin();
  const test2Result = testAdminLogin();
  const test3Result = testUserThenAdminLogin();
  const test4Result = testUserLogout();
  const test5Result = testAdminLogout();
  
  console.log('=== Test Results ===');
  console.log(`Test 1 (User Login): ${test1Result ? 'PASSED' : 'FAILED'}`);
  console.log(`Test 2 (Admin Login): ${test2Result ? 'PASSED' : 'FAILED'}`);
  console.log(`Test 3 (User Then Admin Login): ${test3Result ? 'PASSED' : 'FAILED'}`);
  console.log(`Test 4 (User Logout): ${test4Result ? 'PASSED' : 'FAILED'}`);
  console.log(`Test 5 (Admin Logout): ${test5Result ? 'PASSED' : 'FAILED'}`);
  
  const allPassed = test1Result && test2Result && test3Result && test4Result && test5Result;
  console.log(`All tests ${allPassed ? 'PASSED' : 'FAILED'}`);
  
  return allPassed;
}; 