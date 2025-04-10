import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const OrderConfirmation = () => {
  // In a real application, you would get the order details from the route state or Redux
  const orderNumber = Math.floor(100000 + Math.random() * 900000);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Thank you for your order!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Order #{orderNumber}
        </Typography>
        <Typography variant="body1" paragraph>
          We have received your order and will begin processing it right away.
          You will receive an email confirmation shortly.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              What's Next?
            </Typography>
            <Typography variant="body1" paragraph>
              • You will receive an order confirmation email with details and a tracking number.
            </Typography>
            <Typography variant="body1" paragraph>
              • Our team will process your order within 24 hours.
            </Typography>
            <Typography variant="body1" paragraph>
              • Once shipped, you can track your order using the tracking number provided.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about your order, please contact our customer service team.
            </Typography>
            <Typography variant="body1" paragraph>
              Email: support@mobilestore.com
            </Typography>
            <Typography variant="body1" paragraph>
              Phone: 1-800-123-4567
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mr: 2 }}
          >
            Continue Shopping
          </Button>
          <Button
            component={Link}
            to="/orders"
            variant="outlined"
            color="primary"
            size="large"
          >
            View Orders
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation; 