import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingBag,
  People,
  AttachMoney,
  Inventory,
  TrendingUp,
  LocalShipping,
  Category,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(error.response?.data?.message || 'Failed to load dashboard statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get('/api/orders?limit=5');
      setRecentOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch recent orders');
    }
  };

  // Format currency with fallback for undefined values
  const formatCurrency = (value) => {
    if (value === undefined || value === null) {
      return '$0.00';
    }
    return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { transform: 'scale(1.02)', transition: 'transform 0.2s' } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={<People sx={{ color: 'primary.main' }} />}
            color="primary"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders || 0}
            icon={<ShoppingBag sx={{ color: 'success.main' }} />}
            color="success"
            onClick={() => navigate('/admin/orders')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts || 0}
            icon={<Inventory sx={{ color: 'warning.main' }} />}
            color="warning"
            onClick={() => navigate('/admin/products')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<AttachMoney sx={{ color: 'error.main' }} />}
            color="error"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/products"
                  variant="outlined"
                  startIcon={<Inventory />}
                  fullWidth
                >
                  View Products
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/orders"
                  variant="outlined"
                  startIcon={<LocalShipping />}
                  fullWidth
                >
                  View Orders
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/products"
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  fullWidth
                >
                  Manage Products
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/categories"
                  variant="outlined"
                  startIcon={<Category />}
                  fullWidth
                >
                  Manage Categories
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Orders</Typography>
              <Button
                component={Link}
                to="/admin/orders"
                variant="outlined"
                startIcon={<ShoppingBag />}
              >
                View All Orders
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : recentOrders.length > 0 ? (
              <List>
                {recentOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <ShoppingBag />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Order #${order._id.slice(-6)}`}
                        secondary={`${formatDate(order.createdAt)} - ${formatCurrency(order.totalAmount)}`}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {order.status}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center" py={3}>
                No recent orders found
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 