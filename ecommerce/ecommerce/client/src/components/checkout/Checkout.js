import { createOrderAsync } from '../../store/slices/cartSlice';

const handlePlaceOrder = async () => {
  try {
    const orderData = {
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country
      },
      paymentMethod: selectedPaymentMethod,
      shippingCost: shippingCost
    };

    const result = await dispatch(createOrderAsync(orderData)).unwrap();
    navigate(`/order-confirmation/${result._id}`);
  } catch (error) {
    console.error('Error creating order:', error);
    setError(error.message || 'Failed to create order');
  }
}; 