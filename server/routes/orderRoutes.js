const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');
const Product = require('../models/Product');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new order for user:', req.user._id);
    console.log('Order data:', req.body);

    const {
      items,
      shippingAddress,
      paymentMethod,
      shippingCost = 0,
    } = req.body;

    // Validate required fields
    if (!items || !items.length) {
      console.log('No items provided in order');
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress) {
      console.log('No shipping address provided');
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    if (!paymentMethod) {
      console.log('No payment method provided');
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Calculate total amount and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      console.log('Processing item:', item);
      const product = await Product.findById(item.productId);
      if (!product) {
        console.log('Product not found:', item.productId);
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || ''
      });
    }

    console.log('Creating order with items:', orderItems);
    console.log('Total amount:', totalAmount);

    // Create new order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      shippingCost,
      totalAmount: totalAmount + shippingCost,
      status: 'pending'
    });

    console.log('Saving order to database');
    // Save order to database
    await order.save();
    console.log('Order saved successfully:', order._id);

    // Clear the user's cart after successful order
    const user = await User.findById(req.user._id);
    if (user) {
      user.cart = [];
      await user.save();
      console.log('User cart cleared');
    } else {
      console.log('User not found:', req.user._id);
    }

    // Format response
    const formattedOrder = {
      _id: order._id,
      items: order.items,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    };

    console.log('Sending response with order:', formattedOrder);
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: formattedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// @route   GET /api/orders/me
// @desc    Get logged in user's orders
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user._id);
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');

    console.log('Found orders:', orders.length);

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      items: order.items.map(item => ({
        _id: item._id,
        productId: item.product._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    }));

    res.json({ 
      success: true,
      data: formattedOrders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.product'
    );

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Make sure user owns order or is admin
    if (
      order.user.toString() !== req.user._id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // Format order for frontend
    const formattedOrder = {
      _id: order._id,
      items: order.items.map(item => ({
        _id: item._id,
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        brand: item.product.brand,
        images: item.product.images || [],
        quantity: item.quantity
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    };

    res.json({ 
      success: true,
      data: formattedOrder 
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching order',
      error: error.message 
    });
  }
});

// Admin Routes

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/', auth, admin, async (req, res) => {
  try {
    console.log('Fetching all orders');
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product');

    console.log('Found orders:', orders.length);

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      user: {
        _id: order.user._id,
        name: order.user.name,
        email: order.user.email
      },
      items: order.items.map(item => ({
        _id: item._id,
        productId: item.product._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    }));

    res.json({ 
      success: true,
      data: formattedOrders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order status
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    order.status = status;
    await order.save();

    res.json({ 
      success: true,
      data: order 
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order',
      error: error.message 
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order (admin only)
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: 'Order removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/orders/stats/overview
// @desc    Get order statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', [auth, admin], async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get daily sales for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
      ordersByStatus,
      dailySales,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router; 