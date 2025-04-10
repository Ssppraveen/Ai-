import React, { useEffect } from 'react';
import { IconButton, Badge } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { openCart, fetchCartAsync, selectCartItems } from '../../store/slices/cartSlice';

const CartIcon = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);

  useEffect(() => {
    dispatch(fetchCartAsync());
  }, [dispatch]);

  const handleClick = () => {
    dispatch(openCart());
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <IconButton color="inherit" onClick={handleClick}>
      <Badge badgeContent={itemCount} color="error">
        <ShoppingCart />
      </Badge>
    </IconButton>
  );
};

export default CartIcon; 