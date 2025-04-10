// React and Router imports
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { loadUser, loadAdmin } from './store/slices/authSlice';
import { Box, CircularProgress } from '@mui/material';

// Layout Components
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/admin/AdminLayout';
import CartDrawer from './components/cart/CartDrawer';
import ChatBot from './components/chat/ChatBot';

// Store Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Deals from './pages/Deals';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AuthTest from './pages/AuthTest';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import ChatList from './components/admin/ChatList';

// Redux Selectors
import { selectIsAuthenticated, selectIsAdmin, selectAuthLoading } from './store/slices/authSlice';

// Router configuration
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  if (!isAuthenticated) {
    return <Navigate to={requireAdmin ? '/admin/login' : '/login'} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

// Admin Route component that includes AdminLayout
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
};

// Layout component that conditionally renders Navbar and CartDrawer
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Navbar />}
      {children}
      {!isAdminPage && <CartDrawer />}
    </>
  );
};

// AppContent component that uses useLocation
const AppContent = () => {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const authLoading = useSelector(selectAuthLoading);
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we're on an admin page
        const isAdminPage = location.pathname.startsWith('/admin');
        
        if (isAdminPage) {
          // Try to load admin authentication
          await dispatch(loadAdmin()).unwrap();
        } else {
          // Try to load user authentication
          await dispatch(loadUser()).unwrap();
        }
      } catch (error) {
        console.log('Auth initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch, location.pathname]);

  // Show loading state while initializing auth
  if (isInitializing || authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Store Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-test" element={<AuthTest />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
        <Route 
          path="/admin/chats" 
          element={
            <AdminRoute>
              <ChatList />
            </AdminRoute>
          } 
        />
      </Routes>
      <ChatBot />
    </Layout>
  );
};

// Main App component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router {...router}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
