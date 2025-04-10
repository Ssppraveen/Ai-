const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// Test route to check if cart routes are registered (no auth required)
router.get('/test-no-auth', (req, res) => {
  res.json({ success: true, message: 'Cart routes are working without auth' });
});

// Test route to check if cart routes are registered
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Cart routes are working' });
});

// @route   GET api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to view your cart'
      });
    }

    console.log('Fetching cart for user ID:', req.user.id);
    
    const user = await User.findById(req.user.id).populate('cart.product');
    
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(401).json({
        success: false,
        message: 'Please log in to view your cart'
      });
    }

    console.log('User found, cart items:', user.cart.length);
    
    // Format cart items for frontend
    const formattedCart = user.cart.map(item => ({
      _id: item._id,
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      brand: item.product.brand,
      images: item.product.images?.map(img => {
        // Extract just the filename from the path
        const filename = img.split('/').pop();
        return filename;
      }) || [],
      quantity: item.quantity
    }));

    console.log('Sending formatted cart with', formattedCart.length, 'items');
    
    res.json({ 
      success: true,
      data: formattedCart 
    });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching cart',
      error: err.message 
    });
  }
});

// @route   POST api/cart/:productId
// @desc    Add item to cart
// @access  Private
router.post('/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check if product already exists in cart
    const cartProductIndex = user.cart.findIndex(
      item => item.product.toString() === req.params.productId
    );

    if (cartProductIndex > -1) {
      // Product exists in cart, update quantity
      user.cart[cartProductIndex].quantity += req.body.quantity || 1;
    } else {
      // Product does not exist in cart, add new item
      user.cart.push({
        product: product._id,
        quantity: req.body.quantity || 1
      });
    }

    await user.save();
    
    // Populate product details before sending response
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    
    // Format cart items for frontend
    const formattedCart = updatedUser.cart.map(item => ({
      _id: item._id,
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      brand: item.product.brand,
      images: item.product.images?.map(img => {
        // Extract just the filename from the path
        const filename = img.split('/').pop();
        return filename;
      }) || [],
      quantity: item.quantity
    }));

    res.json({ 
      success: true,
      data: formattedCart 
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error adding to cart',
      error: err.message 
    });
  }
});

// @route   PUT api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/:itemId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const cartItem = user.cart.id(req.params.itemId);

    if (!cartItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart item not found' 
      });
    }

    cartItem.quantity = req.body.quantity;
    await user.save();

    // Populate product details before sending response
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    
    // Format cart items for frontend
    const formattedCart = updatedUser.cart.map(item => ({
      _id: item._id,
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      brand: item.product.brand,
      images: item.product.images?.map(img => {
        // Extract just the filename from the path
        const filename = img.split('/').pop();
        return filename;
      }) || [],
      quantity: item.quantity
    }));

    res.json({ 
      success: true,
      data: formattedCart 
    });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error updating cart',
      error: err.message 
    });
  }
});

// @route   DELETE api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.cart = user.cart.filter(item => item._id.toString() !== req.params.itemId);
    await user.save();

    // Populate product details before sending response
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    
    // Format cart items for frontend
    const formattedCart = updatedUser.cart.map(item => ({
      _id: item._id,
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      brand: item.product.brand,
      images: item.product.images?.map(img => {
        // Extract just the filename from the path
        const filename = img.split('/').pop();
        return filename;
      }) || [],
      quantity: item.quantity
    }));

    res.json({ 
      success: true,
      data: formattedCart 
    });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error removing from cart',
      error: err.message 
    });
  }
});

module.exports = router; 