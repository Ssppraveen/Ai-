const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/products/'));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `product-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
});

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (brand) {
      query.brand = brand;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {};
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          sortOptions.price = 1;
          break;
        case 'price-desc':
          sortOptions.price = -1;
          break;
        case 'name-asc':
          sortOptions.name = 1;
          break;
        case 'name-desc':
          sortOptions.name = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', auth, admin, upload.single('images'), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      specifications,
    } = req.body;

    if (!name || !description || !price || !category || !brand || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number'
      });
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a valid positive number'
      });
    }

    if (!['mobile', 'tablet', 'accessory'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: mobile, tablet, accessory'
      });
    }

    let parsedSpecifications = {};
    try {
      parsedSpecifications = typeof specifications === 'string' 
        ? JSON.parse(specifications)
        : specifications || {};
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid specifications format'
      });
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.toLowerCase(),
      brand: brand.trim(),
      stock: parsedStock,
      specifications: parsedSpecifications,
      images: req.file ? [req.file.path] : ['uploads/products/default-product.png']
    };

    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', auth, admin, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      specifications,
    } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = {
      name,
      description,
      price,
      category,
      brand,
      stock,
      specifications: JSON.parse(specifications),
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.ratings.find(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: 'You have already reviewed this product' });
    }

    product.ratings.push({
      user: req.user.id,
      rating: Number(rating),
      review,
    });

    product.averageRating =
      product.ratings.reduce((acc, item) => item.rating + acc, 0) /
      product.ratings.length;

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/products/debug/category/:category
// @desc    Debug endpoint to check products by category
// @access  Public
router.get('/debug/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log('Debug - Searching for category:', category);
    
    const products = await Product.find({ category });
    console.log('Debug - Found products:', products.length);
    
    res.json({
      category,
      count: products.length,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        category: p.category,
        brand: p.brand
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Debug Error', error: error.message });
  }
});

module.exports = router; 