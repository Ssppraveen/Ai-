const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected for admin operations');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Create or update an admin user
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @param {string} name - Admin name
 * @returns {Promise<Object>} - Created or updated admin user
 */
const createOrUpdateAdmin = async (email, password, name) => {
  try {
    await connectDB();
    
    let admin = await Admin.findOne({ email });
    
    if (admin) {
      // Update existing admin
      admin.name = name;
      if (password) {
        admin.password = password;
      }
    } else {
      // Create new admin
      admin = new Admin({
        email,
        password,
        name,
        role: 'admin'
      });
    }
    
    await admin.save();
    console.log(`Admin ${email} ${admin ? 'updated' : 'created'} successfully`);
    return admin;
  } catch (error) {
    console.error('Error in createOrUpdateAdmin:', error);
    throw error;
  }
};

/**
 * Check if a user is an admin
 * @param {string} email - User email to check
 * @returns {Promise<boolean>} - Result of the check
 */
const checkAdminUser = async (email) => {
  try {
    await connectDB();
    const admin = await Admin.findOne({ email });
    return admin ? true : false;
  } catch (error) {
    console.error('Error in checkAdminUser:', error);
    return false;
  }
};

/**
 * Delete a regular admin user (non-superadmin)
 * @param {string} email - Email of the admin to delete
 * @returns {Promise<boolean>} - Result of the deletion
 */
const deleteAdminUser = async (email) => {
  try {
    await connectDB();
    const result = await Admin.deleteOne({ email });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error in deleteAdminUser:', error);
    return false;
  }
};

// Create default admin if this file is run directly
if (require.main === module) {
  createOrUpdateAdmin('admin@example.com', 'admin123', 'Admin')
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error creating default admin:', error);
      process.exit(1);
    });
}

module.exports = {
  createOrUpdateAdmin,
  checkAdminUser,
  deleteAdminUser
}; 