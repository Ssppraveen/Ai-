import { 
  checkTokens, 
  clearAllTokens, 
  simulateUserLogin, 
  simulateAdminLogin, 
  simulateUserLogout, 
  simulateAdminLogout 
} from './authTest';

const logResult = (testName, passed) => {
  console.log(`%c${testName}: ${passed ? 'PASSED' : 'FAILED'}`, 
    `color: ${passed ? 'green' : 'red'}; font-weight: bold`);
};

const runTest = (testName, testFn) => {
  console.log(`\n=== Running Test: ${testName} ===`);
  const result = testFn();
  logResult(testName, result);
  return result;
};

// Test 1: User Login
const testUserLogin = () => {
  clearAllTokens();
  simulateUserLogin('user-token-123', { id: 1, name: 'Test User' });
  const tokens = checkTokens();
  const passed = tokens.userToken === 'user-token-123' && tokens.adminToken === null;
  clearAllTokens();
  return passed;
};

// Test 2: Admin Login
const testAdminLogin = () => {
  clearAllTokens();
  simulateAdminLogin('admin-token-456', { id: 2, name: 'Admin User', isAdmin: true });
  const tokens = checkTokens();
  const passed = tokens.adminToken === 'admin-token-456' && tokens.userToken === null;
  clearAllTokens();
  return passed;
};

// Test 3: User Login Then Admin Login
const testUserThenAdminLogin = () => {
  clearAllTokens();
  simulateUserLogin('user-token-123', { id: 1, name: 'Test User' });
  simulateAdminLogin('admin-token-456', { id: 2, name: 'Admin User', isAdmin: true });
  const tokens = checkTokens();
  const passed = tokens.userToken === 'user-token-123' && tokens.adminToken === 'admin-token-456';
  clearAllTokens();
  return passed;
};

// Test 4: User Logout
const testUserLogout = () => {
  clearAllTokens();
  simulateUserLogin('user-token-123', { id: 1, name: 'Test User' });
  simulateAdminLogin('admin-token-456', { id: 2, name: 'Admin User', isAdmin: true });
  simulateUserLogout();
  const tokens = checkTokens();
  const passed = tokens.userToken === null && tokens.adminToken === 'admin-token-456';
  clearAllTokens();
  return passed;
};

// Test 5: Admin Logout
const testAdminLogout = () => {
  clearAllTokens();
  simulateUserLogin('user-token-123', { id: 1, name: 'Test User' });
  simulateAdminLogin('admin-token-456', { id: 2, name: 'Admin User', isAdmin: true });
  simulateAdminLogout();
  const tokens = checkTokens();
  const passed = tokens.adminToken === null && tokens.userToken === 'user-token-123';
  clearAllTokens();
  return passed;
};

export const runAllTests = () => {
  console.log('Starting Authentication Tests...\n');
  
  const tests = [
    { name: 'User Login', fn: testUserLogin },
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'User Login Then Admin Login', fn: testUserThenAdminLogin },
    { name: 'User Logout', fn: testUserLogout },
    { name: 'Admin Logout', fn: testAdminLogout }
  ];
  
  const results = tests.map(test => runTest(test.name, test.fn));
  const allPassed = results.every(result => result);
  
  console.log('\n=== Final Results ===');
  console.log(`All tests ${allPassed ? 'PASSED' : 'FAILED'}`);
  
  return allPassed;
}; 