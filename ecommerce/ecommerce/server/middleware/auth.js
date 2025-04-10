const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided in request');
            return res.status(401).json({ 
                success: false, 
                message: 'No authentication token, access denied' 
            });
        }

        console.log('Token received:', token.substring(0, 10) + '...');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', { userId: decoded.userId, isAdmin: decoded.isAdmin });
        
        // Check if the token is for an admin
        if (decoded.isAdmin) {
            const admin = await Admin.findById(decoded.userId).select('-password');
            if (!admin) {
                console.log('Admin not found for ID:', decoded.userId);
                return res.status(401).json({ 
                    success: false, 
                    message: 'Admin not found' 
                });
            }
            req.user = admin;
            req.isAdmin = true;
        } else {
            // Regular user authentication
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                console.log('User not found for ID:', decoded.userId);
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }
            req.user = user;
            req.isAdmin = false;
        }

        console.log('User authenticated successfully:', { id: req.user.id, isAdmin: req.isAdmin });
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Token is not valid' 
        });
    }
};

const admin = async (req, res, next) => {
    try {
        if (!req.user || !req.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error in admin middleware' 
        });
    }
};

module.exports = { auth, admin }; 