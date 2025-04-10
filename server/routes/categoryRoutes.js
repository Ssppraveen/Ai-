const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'category-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private/Admin
router.post('/', auth, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const category = new Category({
      name,
      description,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', auth, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    
    if (req.file) {
      category.image = `/uploads/${req.file.filename}`;
    }

    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router; 