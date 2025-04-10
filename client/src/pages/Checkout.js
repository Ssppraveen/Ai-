import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartTotal,
  selectCartLoading,
  selectCartError,
} from '../store/slices/cartSlice';

const steps = ['Shipping Address', 'Payment Details', 'Review Order'];

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  const handlePlaceOrder = async () => {
    try {
      // TODO: Implement order placement logic
    navigate('/order-confirmation');
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <form onSubmit={handleShippingSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      fullName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Address"
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="State"
                  value={shippingAddress.state}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      state: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ZIP Code"
                  value={shippingAddress.zipCode}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      zipCode: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Country"
                  value={shippingAddress.country}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      country: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      phone: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                  fullWidth
              >
                  Continue to Payment
              </Button>
              </Grid>
            </Grid>
          </form>
        );

      case 1:
        return (
          <form onSubmit={handlePaymentSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Card Number"
                  value={paymentDetails.cardNumber}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      cardNumber: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Name on Card"
                  value={paymentDetails.cardName}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      cardName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      expiryDate: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="CVV"
                  value={paymentDetails.cvv}
                  onChange={(e) =>
                    setPaymentDetails({ ...paymentDetails, cvv: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                  fullWidth
                >
                  Review Order
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleBack}
                >
                  Back to Shipping
              </Button>
              </Grid>
            </Grid>
          </form>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {items.map((item) => (
              <Box key={item._id} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <Typography>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                  </Grid>
                </Grid>
              </Box>
              ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Grid container>
                <Grid item xs={8}>
                  <Typography>Subtotal</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography>${total.toFixed(2)}</Typography>
                </Grid>
              </Grid>
              <Grid container>
                <Grid item xs={8}>
                  <Typography>Shipping</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography>Free</Typography>
                </Grid>
              </Grid>
              <Grid container sx={{ mt: 2 }}>
                <Grid item xs={8}>
                  <Typography variant="h6">Total</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6">${total.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Box>
              <Button
                variant="contained"
                color="primary"
              fullWidth
              onClick={handlePlaceOrder}
              sx={{ mb: 2 }}
              >
              Place Order
            </Button>
            <Button variant="outlined" fullWidth onClick={handleBack}>
              Back to Payment
              </Button>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>{getStepContent(activeStep)}</CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                {items.map((item) => (
                  <Box key={item._id} sx={{ mb: 1 }}>
                    <Grid container>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          {item.name} x {item.quantity}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="body2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Grid container>
                  <Grid item xs={8}>
                    <Typography>Subtotal</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography>${total.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={8}>
                    <Typography>Shipping</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography>Free</Typography>
                  </Grid>
                </Grid>
                <Grid container sx={{ mt: 2 }}>
                  <Grid item xs={8}>
                    <Typography variant="h6">Total</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6">${total.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout; 