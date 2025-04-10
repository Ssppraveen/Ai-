const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Product = require('../models/Product');

// Helper function to get product information based on user query
async function getProductInfo(query) {
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).limit(3);

    if (products.length > 0) {
      return products.map(p => ({
        name: p.name,
        price: p.price,
        category: p.category,
        url: `/product/${p._id}`
      }));
    }
    return null;
  } catch (error) {
    console.error('Error fetching product info:', error);
    return null;
  }
}

// Process user message and generate AI response
async function processMessage(message, userId) {
  // Check for product-related queries
  const productKeywords = ['product', 'item', 'price', 'cost', 'available', 'buy', 'purchase'];
  const isProductQuery = productKeywords.some(keyword => message.toLowerCase().includes(keyword));

  if (isProductQuery) {
    const products = await getProductInfo(message);
    if (products) {
      return {
        text: `I found these products that might interest you:\n${products.map(p => 
          `- ${p.name} ($${p.price}) in ${p.category}. View it here: ${p.url}`
        ).join('\n')}`,
        isUser: false
      };
    }
  }

  // Default responses based on message content
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return {
      text: 'Hello! How can I assist you with your shopping today?',
      isUser: false
    };
  }

  if (message.toLowerCase().includes('help')) {
    return {
      text: 'I can help you with:\n- Finding products\n- Checking prices\n- Product recommendations\n- Order status\nWhat would you like to know?',
      isUser: false
    };
  }

  // Default response
  return {
    text: 'I understand you\'re looking for assistance. Could you please provide more details about what you\'re looking for?',
    isUser: false
  };
}

// User Routes

// Send a message
router.post('/message', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({ userId: req.user.id });
    if (!chat) {
      chat = new Chat({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({ text, isUser: true });

    // Generate and add AI response
    const aiResponse = await processMessage(text, req.user.id);
    chat.messages.push(aiResponse);

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ message: 'Error processing message' });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user.id });
    res.json(chat || { messages: [] });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// Admin Routes

// Get all chats with pagination and filtering
router.get('/admin/chats', [auth, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = status ? { status } : {};
    
    const [chats, total] = await Promise.all([
      Chat.find(query)
        .sort({ lastUpdated: -1 })
        .skip(skip)
        .limit(limit),
      Chat.countDocuments(query)
    ]);

    res.json({
      chats,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

// Get specific chat details
router.get('/admin/chats/:id', [auth, admin], async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Error fetching chat' });
  }
});

// Update chat status
router.patch('/admin/chats/:id', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ message: 'Error updating chat' });
  }
});

module.exports = router; 